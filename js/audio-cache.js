/**
 * @file audio-cache.js
 * @description IndexedDB 기반 TTS(Text-to-Speech) 오디오 Blob 영구 캐시 매니저
 * - 브라우저 종료 및 강력 새로고침(Ctrl+Shift+R) 후에도 오디오 데이터를 브라우저에 영구 보존
 * - 동일한 단어/문장/스크립트 발화 재요청 시 외부 API(Azure Neural, Google) 호출 0회 및 0ms 즉각 재생 달성
 * - 최대 캐시 개수(500개) 및 용량(30MB) 초과 시 생성일시 인덱스 기반 LRU(오래된 순) 자동 정리
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 */

const AudioCache = (() => {
  /** @const {string} IndexedDB 데이터베이스 이름 */
  const DB_NAME = "OPIc_Audio_DB";

  /** @const {number} IndexedDB 스키마 버전 */
  const DB_VERSION = 2;

  /** @const {string} 오디오 캐시 오브젝트 스토어 이름 */
  const STORE_NAME = "audio_cache";

  /** @type {Promise<IDBDatabase|null>|null} DB 오픈 프로미스 싱글톤 캐시 */
  let dbPromise = null;

  /**
   * IndexedDB 데이터베이스를 비동기 연결 및 초기화합니다.
   * 필요시 최신 스키마(createdAt 인덱스 포함)로 업그레이드합니다.
   *
   * @returns {Promise<IDBDatabase|null>} IDBDatabase 인스턴스 또는 미지원 시 null 반환
   */
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      if (!("indexedDB" in window)) {
        console.warn(
          "[AudioCache] IndexedDB not supported in this environment.",
        );
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          // [스키마 마이그레이션 정책] 구버전 스토어(createdAt 인덱스 부재 등)가 존재하면 삭제 후 최신 스키마로 재생성
          if (db.objectStoreNames.contains(STORE_NAME)) {
            db.deleteObjectStore(STORE_NAME);
          }
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          // [LRU 정렬 인덱스] 생성 일시(createdAt)를 기준으로 오름차순 커서를 열어 오래된 항목부터 우선 삭제 가능하도록 색인 구성
          store.createIndex("createdAt", "createdAt", { unique: false });
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => {
          console.error("[AudioCache] Failed to open IndexedDB:", e);
          resolve(null);
        };
      } catch (err) {
        console.error("[AudioCache] openDB exception:", err);
        resolve(null);
      }
    });
    return dbPromise;
  }

  /**
   * 오디오 캐시 조회를 위한 고유 해시 키를 생성합니다.
   *
   * [정규화 정책]:
   * - 텍스트 양 끝 공백 제거(trim), 소문자 변환(toLowerCase), 다중 공백을 단일 공백으로 치환합니다.
   * - 사용자가 "I like coffee."와 "i like  coffee. "를 발화했을 때 동일한 캐시 키로 수렴시켜
   *   외부 TTS API의 불필요한 중복 호출을 차단하고 쿼터(Azure 무료 한도)를 극대화하여 절약합니다.
   *
   * @param {string} engine - TTS 엔진 식별자 (예: 'azure', 'google', 'native')
   * @param {string} voice - 음성 성우 식별자 (예: 'en-US-JennyNeural')
   * @param {string} text - 발화 원문 텍스트
   * @param {number} [rate=1.0] - 재생 속도 배율
   * @returns {string} 정규화된 캐시 키 문자열
   */
  function makeKey(engine, voice, text, rate = 1.0) {
    const clean = String(text || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    return `${engine}:${voice}:${rate}:${clean}`;
  }

  /**
   * 캐시 키에 해당하는 저장된 오디오 Blob을 조회합니다.
   *
   * @async
   * @param {string} key - 조회할 캐시 키
   * @returns {Promise<Blob|null>} 캐시된 오디오 Blob 또는 미존재 시 null 반환
   */
  async function getAudio(key) {
    try {
      const db = await openDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            resolve(req.result.blob);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch (err) {
      console.warn("[AudioCache] getAudio error:", err);
      return null;
    }
  }

  /** @const {number} 최대 캐시 보관 항목 수 (LRU 임계치) */
  const MAX_CACHE_ITEMS = 500;

  /** @const {number} 최대 허용 디스크 캐시 용량 (30MB - 브라우저 저장소 Quota 방어) */
  const MAX_CACHE_BYTES = 30 * 1024 * 1024;

  /**
   * 캐시 총 용량 또는 항목 개수 초과 시, 가장 오래된 캐시 데이터를 일괄 삭제(LRU Eviction)합니다.
   *
   * [배치 삭제(Batch Eviction) 정책]:
   * - 용량 초과 시 매번 1개씩 지우면 새 오디오를 추가할 때마다 쓰기 트랜잭션이 연달아 발생하여 성능이 저하됩니다.
   * - 따라서 한 번 임계치(30MB 또는 500개)에 도달하면 전체의 약 15%(최소 20개)를 한 번에 일괄 제거하여
   *   다음 수십 번의 오디오 캐싱 동안 트랜잭션 오버헤드 없이 안정적으로 저장할 수 있는 '워터마크 버퍼'를 확보합니다.
   *
   * @async
   * @returns {Promise<void>}
   */
  async function evictIfNeeded() {
    try {
      const stats = await getStats();
      if (
        stats.count <= MAX_CACHE_ITEMS &&
        stats.sizeBytes <= MAX_CACHE_BYTES
      ) {
        return;
      }
      const db = await openDB();
      if (!db) return;

      // 15% 또는 최소 20개 일괄 삭제 목표 수량 계산
      const deleteCount = Math.max(20, Math.floor(stats.count * 0.15));
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("createdAt");
      const req = index.openCursor(); // 오래된 순(오름차순)

      let deleted = 0;
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor && deleted < deleteCount) {
          cursor.delete();
          deleted++;
          cursor.continue();
        }
      };
    } catch (err) {
      console.warn("[AudioCache] Eviction error:", err);
    }
  }

  /**
   * 생성된 오디오 Blob을 IndexedDB에 영구 저장합니다.
   * 저장이 완료되면 비동기로 용량 초과 검사(evictIfNeeded)를 실행합니다.
   *
   * @async
   * @param {string} key - 캐시 키
   * @param {Blob} blob - 저장할 오디오 데이터 Blob
   * @param {string} [text=""] - 디버깅 및 가독성을 위한 원문 텍스트 프리뷰
   * @returns {Promise<boolean>} 저장 성공 여부
   */
  async function saveAudio(key, blob, text = "") {
    try {
      const db = await openDB();
      if (!db || !blob) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const data = {
          id: key,
          blob: blob,
          text: text.slice(0, 100),
          size: blob.size,
          createdAt: Date.now(),
        };
        store.put(data);
        tx.oncomplete = () => {
          evictIfNeeded();
          resolve(true);
        };
        tx.onerror = () => resolve(false);
      });
    } catch (err) {
      console.warn("[AudioCache] saveAudio error:", err);
      return false;
    }
  }

  /**
   * @typedef {Object} CacheStats
   * @property {number} count - 캐시된 총 항목 개수
   * @property {number} sizeBytes - 총 사용 용량 (바이트 단위)
   * @property {string} sizeFormatted - 사람이 읽기 쉬운 용량 문자열 (예: "12.4 MB")
   */

  /**
   * 현재 캐시의 항목 수와 총 디스크 점유 용량을 계산하여 반환합니다.
   *
   * @async
   * @returns {Promise<CacheStats>} 캐시 통계 객체
   */
  async function getStats() {
    try {
      const db = await openDB();
      if (!db) return { count: 0, sizeBytes: 0, sizeFormatted: "0 KB" };
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.openCursor();
        let count = 0;
        let totalSize = 0;
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            count++;
            if (cursor.value && cursor.value.size) {
              totalSize += cursor.value.size;
            } else if (cursor.value && cursor.value.blob) {
              totalSize += cursor.value.blob.size || 0;
            }
            cursor.continue();
          } else {
            let formatted = "0 KB";
            if (totalSize > 1024 * 1024) {
              formatted = (totalSize / (1024 * 1024)).toFixed(2) + " MB";
            } else {
              formatted = (totalSize / 1024).toFixed(1) + " KB";
            }
            resolve({ count, sizeBytes: totalSize, sizeFormatted: formatted });
          }
        };
        req.onerror = () =>
          resolve({ count: 0, sizeBytes: 0, sizeFormatted: "0 KB" });
      });
    } catch (err) {
      return { count: 0, sizeBytes: 0, sizeFormatted: "0 KB" };
    }
  }

  /**
   * 저장된 모든 오디오 캐시 레코드를 일괄 초기화(삭제)합니다.
   *
   * @async
   * @returns {Promise<boolean>} 초기화 성공 여부
   */
  async function clearAll() {
    try {
      const db = await openDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (err) {
      console.warn("[AudioCache] clearAll error:", err);
      return false;
    }
  }

  return {
    makeKey,
    getAudio,
    saveAudio,
    getStats,
    clearAll,
  };
})();

// 전역 스코프 등록
window.AudioCache = AudioCache;
