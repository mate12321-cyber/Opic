/**
 * [storage.js] 로컬 스토리지 관리 및 데이터 로더
 * - 브라우저 localStorage 래퍼 객체
 * - OPIc 문장 및 문법 JSON 데이터 비동기 로딩
 * - 일별 학습 기록(Daily Log) 및 연속 학습(Streak) 계산
 *
 * --------------------------------------------------------------------------------
 * 💡 [확장성 및 유지보수 가이드 (Scalability & Customization Guide)]
 * 1. 목표 등급 확장 (IM1 -> IM2 / IM3 / IH / AL):
 *    - 현재 데이터셋은 `window.*_DATA` 전역 객체에 단일 레벨(IM1)로 결합되어 있습니다.
 *    - 향후 등급 확장 시:
 *      a) 데이터 파일 분리: `sentences_ih.js`, `questions_al.js` 등으로 다중화하거나,
 *         각 문항 객체 내에 `targetGrade: ["IM1", "IM2", "IH"]` 필드를 부여하여 필터링하는 방식 권장.
 *      b) 스토리지 키 네임스페이스 분리: `ko-en-opic-${currentGrade}-progress` 형태로
 *         목표 등급별 진행도와 오답 노트를 독립적으로 영속화할 수 있도록 설계해야 합니다.
 *
 * 2. 사용자화(Customization) 확장:
 *    - 사용자 본인의 프로필(이름, 직업, 거주지 등)을 치환할 수 있는 템플릿 변수 시스템
 *      (예: `{{USER_NAME}}`, `{{USER_JOB}}`, `{{FAVORITE_PLACE}}`) 구축 필요.
 *    - 사용자가 직접 문장/질문/만능패턴을 추가/편집할 수 있는 User-Defined Dataset을
 *      localStorage에 저장하고, 시스템 기본 데이터(`window.*_DATA`)와 병합(Merge)하는
 *      데이터 파이프라인 확장이 권장됩니다.
 * --------------------------------------------------------------------------------
 */

// =============================================================================
// 1. 비동기 로컬 스토리지 래퍼 (Async LocalStorage Wrapper)
// =============================================================================

/**
 * 브라우저 localStorage를 Promise 기반 비동기 인터페이스로 래핑한 객체입니다.
 * 추후 IndexedDB나 원격 서버 API 스토리지로 교체할 때도 동일한 인터페이스를 유지할 수 있습니다.
 */
const storage = {
  /**
   * 지정된 키의 저장된 값을 조회합니다.
   * @param {string} key - 스토리지 키
   * @param {boolean} [shared=false] - 공유 플래그 (확장용)
   * @returns {Promise<{key: string, value: string, shared: boolean}>}
   * @throws {Error} 키가 존재하지 않을 때 예외 발생
   */
  async get(key, shared) {
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error("key not found: " + key);
    return { key, value: raw, shared: !!shared };
  },

  /**
   * 지정된 키에 값을 저장합니다.
   * @param {string} key - 스토리지 키
   * @param {string} value - 저장할 문자열 값
   * @param {boolean} [shared=false] - 공유 플래그
   * @returns {Promise<{key: string, value: string, shared: boolean}>}
   */
  async set(key, value, shared) {
    localStorage.setItem(key, value);
    return { key, value, shared: !!shared };
  },

  /**
   * 지정된 키의 데이터를 삭제합니다.
   * @param {string} key - 스토리지 키
   * @param {boolean} [shared=false] - 공유 플래그
   * @returns {Promise<{key: string, deleted: boolean, shared: boolean}>}
   */
  async delete(key, shared) {
    const existed = localStorage.getItem(key) !== null;
    localStorage.removeItem(key);
    return { key, deleted: existed, shared: !!shared };
  },

  /**
   * 특정 접두사(prefix)로 시작하는 모든 키 목록을 반환합니다.
   * @param {string} [prefix] - 검색할 키 접두사
   * @param {boolean} [shared=false] - 공유 플래그
   * @returns {Promise<{keys: string[], prefix: string, shared: boolean}>}
   */
  async list(prefix, shared) {
    const keys = Object.keys(localStorage).filter(
      (k) => !prefix || k.startsWith(prefix),
    );
    return { keys, prefix, shared: !!shared };
  },
};

// =============================================================================
// 2. 런타임 인메모리 데이터 저장소 (In-Memory Datasets)
// =============================================================================

let SENTENCES = []; // OPIc 문장 번역 목록 (sentences_im1.js)
let CATEGORIES = []; // 문장 카테고리 목록
let WORD_ITEMS = []; // 문법 퀴즈 목록 (grammar_im1.js)
let WORD_CATEGORIES = []; // 문법 카테고리 목록
let OPIC_QUESTIONS = []; // OPIc 실전 질문 목록 (questions_im1.js)
let OPIC_CATEGORIES = []; // OPIc 실전 카테고리 목록
let PATTERN_ITEMS = []; // 만능 패턴 목록 (patterns_im1.js)
let FILLER_ITEMS = []; // OPIc 핵심 필러 목록 (fillers_im1.js)

/** 문장 번역 주제 대분류 그룹 매핑 */
const GROUPS = {
  일상: ["자기소개", "집/주거", "직장/업무", "일상", "날씨/계절"],
  "취미 & 여가": [
    "취미",
    "여가/주말",
    "카페가기",
    "영화보기",
    "음악감상",
    "공연보기",
    "콘서트 보기",
  ],
  "운동 & 야외활동": [
    "운동하기",
    "조깅하기",
    "걷기",
    "공원가기",
    "캠핑하기",
    "해변가기",
  ],
  생활: ["음식", "요리하기", "쇼핑", "반려동물"],
  여행: ["여행", "국내여행"],
};

/**
 * 배열을 무작위로 섞는 Fisher-Yates 셔플 알고리즘 함수입니다.
 * 원본 배열을 변경하지 않고 새로운 셔플 배열을 반환합니다.
 *
 * @template T
 * @param {T[]} arr - 셔플할 원본 배열
 * @returns {T[]} 무작위로 섞인 새 배열
 */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =============================================================================
// 3. 로컬 스토리지 키 상수 (LocalStorage Keys)
// =============================================================================
const STORAGE_KEY = "ko-en-opic-progress";
const WORD_STORAGE_KEY = "ko-en-opic-word-progress";
const OPIC_STORAGE_KEY = "ko-en-opic-qa-progress";
const PATTERN_STORAGE_KEY = "ko-en-opic-pattern-progress";
const FILLER_STORAGE_KEY = "ko-en-opic-filler-progress";
const DAILY_LOG_KEY = "ko-en-opic-daily-log";

// =============================================================================
// 4. 일별 학습 기록 및 연속 학습(Streak) 계산 (Daily Log & Streak)
// =============================================================================

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
let dailyLog = {}; // { "YYYY-MM-DD": 학습풀이수 }

/**
 * 날짜 객체를 "YYYY-MM-DD" 포맷 문자열로 변환합니다.
 * @param {Date} [d=new Date()] - 기준 날짜
 * @returns {string} "YYYY-MM-DD" 형태의 날짜 키
 */
function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 로컬 스토리지에서 일별 학습 기록 객체를 비동기 로드합니다.
 * @returns {Promise<void>}
 */
async function loadDailyLog() {
  try {
    const res = await storage.get(DAILY_LOG_KEY, false);
    if (res && res.value) dailyLog = JSON.parse(res.value) || {};
  } catch (e) {
    dailyLog = {};
  }
}

/**
 * 일별 학습 기록 객체를 로컬 스토리지에 비동기 저장합니다.
 * @returns {Promise<void>}
 */
async function saveDailyLog() {
  try {
    await storage.set(DAILY_LOG_KEY, JSON.stringify(dailyLog), false);
  } catch (e) {
    /* best effort */
  }
}

/**
 * 문제 풀이 또는 답변 평가 완료 시 오늘 날짜의 학습 횟수를 1 증가시킵니다.
 * @returns {void}
 */
function logPracticeEvent() {
  const key = todayKey();
  dailyLog[key] = (dailyLog[key] || 0) + 1;
  saveDailyLog();
}

/**
 * 오늘 날짜 기준 연속 학습 일수(Streak)를 계산합니다.
 * 오늘 아직 학습하지 않았더라도 어제 학습 기록이 있다면 연속 일수를 유지합니다.
 *
 * @returns {number} 연속 학습 일수 (일 단위)
 */
function computeStreak() {
  let streak = 0;
  const d = new Date();
  if (!dailyLog[todayKey(d)]) d.setDate(d.getDate() - 1);
  while (dailyLog[todayKey(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/**
 * 대시보드 7일 막대 차트 렌더링용 최근 7일 날짜 배열을 반환합니다.
 * @returns {Array<{key: string, label: string, isToday: boolean}>} 최근 7일 메타데이터 배열
 */
function last7Days() {
  const days = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    days.push({
      key: todayKey(dd),
      label: DAY_LABELS[dd.getDay()],
      isToday: i === 0,
    });
  }
  return days;
}

/**
 * 정적 데이터 모듈 즉시 동기 로딩 (문장, 문법 퀴즈, OPIc 실전 질문, 만능 패턴, 필러)
 *
 * 💡 [유지보수 및 확장 포인트]:
 * - 현재는 HTML에서 불러온 window.*_DATA (IM1 기본셋)만 참조합니다.
 * - [추후 등급 확장 시]:
 *   사용자가 선택한 targetLevel("IM1" | "IM2" | "IH" | "AL")에 따라
 *   동적 import() 또는 window[`SENTENCES_${targetLevel}`] 형태의 동적 데이터셋 할당 지원 가능.
 * - [사용자화 확장 시]:
 *   localStorage에 저장된 사용자 정의 커스텀 질문/문장(User Custom Items)을
 *   기본 배열 끝에 concat 또는 병합하여 나만의 모의고사 환경 구성 가능.
 */
async function loadData() {
  try {
    if (window.SENTENCES_DATA && Array.isArray(window.SENTENCES_DATA)) {
      SENTENCES = window.SENTENCES_DATA;
      CATEGORIES = [...new Set(SENTENCES.map((s) => s.cat))];
    }
    if (window.GRAMMAR_DATA && Array.isArray(window.GRAMMAR_DATA)) {
      WORD_ITEMS = window.GRAMMAR_DATA;
      WORD_CATEGORIES = [...new Set(WORD_ITEMS.map((w) => w.cat))];
    }
    if (window.QUESTIONS_DATA && Array.isArray(window.QUESTIONS_DATA)) {
      OPIC_QUESTIONS = window.QUESTIONS_DATA;
      OPIC_CATEGORIES = [...new Set(OPIC_QUESTIONS.map((q) => q.cat))];
    }
    if (window.PATTERNS_DATA && Array.isArray(window.PATTERNS_DATA)) {
      PATTERN_ITEMS = window.PATTERNS_DATA;
    }
    if (window.FILLERS_DATA && Array.isArray(window.FILLERS_DATA)) {
      FILLER_ITEMS = window.FILLERS_DATA;
    }
  } catch (e) {
    console.error("데이터 초기화 중 오류:", e);
  }
}

// =============================================================================
// 5. 학습 데이터 전체 백업 및 복원 (Data Backup & Restore)
// =============================================================================

/**
 * 브라우저 로컬 스토리지에 저장된 모든 OPIc 학습 데이터를 단일 JSON 파일로 추출하여 다운로드합니다.
 *
 * [백업 포함 항목]:
 * - 일별 학습 기록 (dailyLog)
 * - 각 모드별 학습 진행 상황 (sentence, word, opic, pattern, filler)
 * - 📚 내 단어장에 저장된 어휘 목록
 * - TTS 음성 엔진 및 재생 속도 설정
 * - 다크 / 라이트 테마 설정
 *
 * @returns {Promise<boolean>} 백업 파일 생성 및 다운로드 성공 여부
 */
async function exportAllDataJson() {
  try {
    const backupData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      dailyLog: dailyLog,
      progress: {
        sentence: localStorage.getItem(STORAGE_KEY),
        word: localStorage.getItem(WORD_STORAGE_KEY),
        opic: localStorage.getItem(OPIC_STORAGE_KEY),
        pattern: localStorage.getItem(PATTERN_STORAGE_KEY),
        filler: localStorage.getItem(FILLER_STORAGE_KEY),
      },
      savedWords: localStorage.getItem("ko-en-opic-saved-words"),
      ttsSettings: localStorage.getItem("ko-en-opic-tts-settings"),
      theme: localStorage.getItem("ko-en-opic-theme"),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OPIc_Study_Backup_${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("데이터 백업 실패:", err);
    alert("데이터 백업 중 오류가 발생했습니다: " + err.message);
    return false;
  }
}

/**
 * 사용자가 업로드한 JSON 백업 파일을 검증하고 로컬 스토리지에 덮어써 복원합니다.
 * 복원 완료 시 변경된 데이터를 즉시 반영하기 위해 페이지를 새로고침(reload)합니다.
 *
 * @param {File} file - 사용자가 파일 선택창에서 선택한 백업 JSON 파일
 * @returns {Promise<boolean>} 복원 성공 여부
 */
async function importDataJson(file) {
  if (!file) return false;
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || !data.version) {
      throw new Error("올바른 OPIc 백업 파일 형식이 아닙니다.");
    }

    if (data.dailyLog) {
      await storage.set(DAILY_LOG_KEY, JSON.stringify(data.dailyLog), false);
    }
    if (data.progress) {
      if (data.progress.sentence) {
        await storage.set(STORAGE_KEY, data.progress.sentence, false);
      }
      if (data.progress.word) {
        await storage.set(WORD_STORAGE_KEY, data.progress.word, false);
      }
      if (data.progress.opic) {
        await storage.set(OPIC_STORAGE_KEY, data.progress.opic, false);
      }
      if (data.progress.pattern) {
        await storage.set(PATTERN_STORAGE_KEY, data.progress.pattern, false);
      }
      if (data.progress.filler) {
        await storage.set(FILLER_STORAGE_KEY, data.progress.filler, false);
      }
    }
    if (data.savedWords) {
      localStorage.setItem("ko-en-opic-saved-words", data.savedWords);
    }
    if (data.ttsSettings) {
      localStorage.setItem("ko-en-opic-tts-settings", data.ttsSettings);
    }
    if (data.theme) {
      localStorage.setItem("ko-en-opic-theme", data.theme);
    }

    alert("🎉 학습 데이터가 성공적으로 복원되었습니다! 앱을 새로고침합니다.");
    window.location.reload();
    return true;
  } catch (err) {
    console.error("데이터 복원 실패:", err);
    alert("데이터 복원 실패: " + err.message);
    return false;
  }
}

window.exportAllDataJson = exportAllDataJson;
window.importDataJson = importDataJson;
