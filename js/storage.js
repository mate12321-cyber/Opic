// ── STORAGE & STATE MANAGEMENT ─────────────────────────────────────
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

// Data sets loaded dynamically from JSON
let SENTENCES = [];
let CATEGORIES = [];
let WORD_ITEMS = [];
let WORD_CATEGORIES = [];

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

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Storage Keys
const STORAGE_KEY = "ko-en-opic-progress";
const WORD_STORAGE_KEY = "ko-en-opic-word-progress";
const DAILY_LOG_KEY = "ko-en-opic-daily-log";

// Daily streak and practice log
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
let dailyLog = {};

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function loadDailyLog() {
  try {
    const res = await storage.get(DAILY_LOG_KEY, false);
    if (res && res.value) dailyLog = JSON.parse(res.value) || {};
  } catch (e) {
    dailyLog = {};
  }
}

async function saveDailyLog() {
  try {
    await storage.set(DAILY_LOG_KEY, JSON.stringify(dailyLog), false);
  } catch (e) {
    /* best effort */
  }
}

function logPracticeEvent() {
  const key = todayKey();
  dailyLog[key] = (dailyLog[key] || 0) + 1;
  saveDailyLog();
}

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

async function loadData() {
  try {
    const [sentencesRes, grammarRes] = await Promise.all([
      fetch("data/sentences_im1.json"),
      fetch("data/grammar_im1.json"),
    ]);
    SENTENCES = await sentencesRes.json();
    CATEGORIES = [...new Set(SENTENCES.map((s) => s.cat))];
    WORD_ITEMS = await grammarRes.json();
    WORD_CATEGORIES = [...new Set(WORD_ITEMS.map((w) => w.cat))];
  } catch (e) {
    console.error("데이터 로드 실패:", e);
  }
}
