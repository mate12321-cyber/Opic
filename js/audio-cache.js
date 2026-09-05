/**
 * [audio-cache.js] IndexedDB 기반 TTS 오디오 영구 캐시 매니저
 * - 브라우저 종료 및 강력 새로고침(Ctrl+Shift+R) 후에도 영구 보존
 * - 동일한 단어/문장/스크립트 요청 시 Azure/Google API 호출 0회 및 로딩 시간 0ms 달성
 */

const AudioCache = (() => {
  const DB_NAME = "OPIc_Audio_DB";
  const DB_VERSION = 1;
  const STORE_NAME = "audio_cache";
  let dbPromise = null;

  // IndexedDB 초기화 및 열기
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      if (!("indexedDB" in window)) {
        console.warn("[AudioCache] IndexedDB not supported in this environment.");
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
            store.createIndex("createdAt", "createdAt", { unique: false });
          }
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

  // 캐시 키 생성 (엔진, 보이스, 텍스트, 속도 조합)
  function makeKey(engine, voice, text, rate = 1.0) {
    const clean = String(text || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    return `${engine}:${voice}:${rate}:${clean}`;
  }

  // 캐시된 오디오 Blob 가져오기
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

  // 오디오 Blob 영구 저장
  async function saveAudio(key, blob, text = "") {
    try {
      const db = await openDB();
      if (!db || !blob) return;
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
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (err) {
      console.warn("[AudioCache] saveAudio error:", err);
    }
  }

  // 캐시 통계 (항목 개수, 총 용량 MB)
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
        req.onerror = () => resolve({ count: 0, sizeBytes: 0, sizeFormatted: "0 KB" });
      });
    } catch (err) {
      return { count: 0, sizeBytes: 0, sizeFormatted: "0 KB" };
    }
  }

  // 모든 오디오 캐시 비우기
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
