/**
 * [storage.js] 로컬 스토리지 관리 및 데이터 로더
 * - 브라우저 localStorage 래퍼 객체
 * - OPIc 문장 및 문법 JSON 데이터 비동기 로딩
 * - 일별 학습 기록(Daily Log) 및 연속 학습(Streak) 계산
 */

// 브라우저 localStorage를 다루는 비동기 스토리지 래퍼
const storage = {
  async get(key, shared) {
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error("key not found: " + key);
    return { key, value: raw, shared: !!shared };
  },
  async set(key, value, shared) {
    localStorage.setItem(key, value);
    return { key, value, shared: !!shared };
  },
  async delete(key, shared) {
    const existed = localStorage.getItem(key) !== null;
    localStorage.removeItem(key);
    return { key, deleted: existed, shared: !!shared };
  },
  async list(prefix, shared) {
    const keys = Object.keys(localStorage).filter(
      (k) => !prefix || k.startsWith(prefix),
    );
    return { keys, prefix, shared: !!shared };
  },
};

// 동적으로 로드되는 전역 데이터 배열
let SENTENCES = []; // OPIc 문장 번역 목록
let CATEGORIES = []; // 문장 카테고리 목록
let WORD_ITEMS = []; // 문법 퀴즈 목록
let WORD_CATEGORIES = []; // 문법 카테고리 목록
let OPIC_QUESTIONS = []; // OPIc 실전 질문 목록
let OPIC_CATEGORIES = []; // OPIc 실전 카테고리 목록
let PATTERN_ITEMS = []; // 만능 패턴 목록

// 문장 번역 주제 대분류 그룹 정의
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

// 배열 무작위 셔플 함수 (Fisher-Yates 알고리즘)
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 스토리지 키 상수
const STORAGE_KEY = "ko-en-opic-progress";
const WORD_STORAGE_KEY = "ko-en-opic-word-progress";
const OPIC_STORAGE_KEY = "ko-en-opic-qa-progress";
const PATTERN_STORAGE_KEY = "ko-en-opic-pattern-progress";
const DAILY_LOG_KEY = "ko-en-opic-daily-log";

// 요일 라벨 및 일별 학습 기록 객체 { "YYYY-MM-DD": 풀이문제수 }
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
let dailyLog = {};

// 오늘 날짜를 "YYYY-MM-DD" 포맷 문자열로 반환
function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 로컬 스토리지에서 일별 학습 기록 로드
async function loadDailyLog() {
  try {
    const res = await storage.get(DAILY_LOG_KEY, false);
    if (res && res.value) dailyLog = JSON.parse(res.value) || {};
  } catch (e) {
    dailyLog = {};
  }
}

// 일별 학습 기록을 로컬 스토리지에 저장
async function saveDailyLog() {
  try {
    await storage.set(DAILY_LOG_KEY, JSON.stringify(dailyLog), false);
  } catch (e) {
    /* best effort */
  }
}

// 문제 풀이 시 오늘 날짜의 학습 횟수를 1 증가
function logPracticeEvent() {
  const key = todayKey();
  dailyLog[key] = (dailyLog[key] || 0) + 1;
  saveDailyLog();
}

// 오늘 기준 연속 학습 일수(Streak) 계산
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

// 대시보드 차트용 최근 7일 날짜 목록 반환
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

// 외부 JSON 데이터 파일 비동기 로딩 (문장, 문법 퀴즈, OPIc 실전 질문, 만능 패턴)
async function loadData() {
  try {
    const [sentencesRes, grammarRes, opicRes, patternRes] = await Promise.all([
      fetch("data/sentences_im1.json"),
      fetch("data/grammar_im1.json"),
      fetch("data/questions_im1.json"),
      fetch("data/patterns_im1.json"),
    ]);
    SENTENCES = await sentencesRes.json();
    CATEGORIES = [...new Set(SENTENCES.map((s) => s.cat))];
    WORD_ITEMS = await grammarRes.json();
    WORD_CATEGORIES = [...new Set(WORD_ITEMS.map((w) => w.cat))];
    OPIC_QUESTIONS = await opicRes.json();
    OPIC_CATEGORIES = [...new Set(OPIC_QUESTIONS.map((q) => q.cat))];
    PATTERN_ITEMS = await patternRes.json();
  } catch (e) {
    console.error("데이터 로드 실패:", e);
  }
}
