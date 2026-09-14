/**
 * @file pattern.js
 * @description [모드 4] 만능 패턴 집중 훈련 (Master Patterns) 모드 컨트롤러
 * - 6대 만능 템플릿 뼈대 및 실시간 주제 스위처(Slot Switcher) 인터랙션
 * - 단계별 문장 발음 듣기 & 마이크 STT 발음 평가
 * - 6문장 연속 완주 타이머 및 패턴별 마스터 학습 진도 영속화
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 *
 * --------------------------------------------------------------------------------
 * 💡 [확장성 및 유지보수 가이드 (Scalability & Customization Guide)]
 * 1. 패턴 템플릿 스키마 확장 (Skeleton & Variations):
 *    - 본 모듈은 `skeleton` (공통 뼈대 6문장)과 `variations` (주제별 치환 슬롯 문장)의
 *      완전 대칭 구조로 설계되어 있습니다.
 *    - 상위 등급(IH/AL)용 고급 패턴(예: 복합 시제 비교, 예상치 못한 돌발 상황 위기관리 등)
 *      추가 시 `PATTERNS_DATA`에 동일한 스키마로 새 패턴(`pat_07`, `pat_08` 등)을
 *      등록하기만 하면 UI와 렌더러가 자동으로 탭 및 슬롯을 생성합니다.
 *
 * 2. 사용자 커스텀 슬롯(Custom Topic Slot) 지원:
 *    - 사용자가 자신만의 토픽(예: "내 최애 빵집", "단골 캠핑장" 등)을 추가할 수 있도록
 *      변형 슬롯(`variations`) 배열에 사용자 입력 객체를 push할 수 있는 '슬롯 추가 UI' 확장이 용이합니다.
 * --------------------------------------------------------------------------------
 */

// =============================================================================
// 1. 만능 패턴 전역 상태 변수 (State Management)
// =============================================================================

let patternCur = 0; // 현재 선택된 만능 패턴 인덱스 (0 ~ 5)
let patternVarCur = 0; // 현재 선택된 주제 변형(슬롯) 인덱스
let patternOrder = [0, 1, 2, 3, 4, 5];
let patternProgress = {}; // 패턴 마스터 완료 여부 맵 { [patternId]: boolean }
let savedPatternUserInputs = {}; // 패턴/변형별 사용자 직접 입력 답변 캐시

// =============================================================================
// 2. 만능 패턴 6문장 완주 타이머 (Speaking Timer)
// =============================================================================

let patternSpeakingTimer = null;
let patternSpeakingSeconds = 0;

/**
 * 만능 패턴 6문장 연속 말하기 훈련 타이머를 시작합니다.
 * @returns {void}
 */
function startPatternSpeakingTimer() {
  stopPatternSpeakingTimer();
  patternSpeakingSeconds = 0;
  updatePatternSpeakingTimerDisplay();
  patternSpeakingTimer = setInterval(() => {
    patternSpeakingSeconds++;
    updatePatternSpeakingTimerDisplay();
  }, 1000);
}

/**
 * 만능 패턴 말하기 타이머를 정지합니다.
 * @returns {void}
 */
function stopPatternSpeakingTimer() {
  if (patternSpeakingTimer) {
    clearInterval(patternSpeakingTimer);
    patternSpeakingTimer = null;
  }
}

/**
 * 만능 패턴 말하기 타이머를 0초로 초기화합니다.
 * @returns {void}
 */
function resetPatternSpeakingTimer() {
  stopPatternSpeakingTimer();
  patternSpeakingSeconds = 0;
  updatePatternSpeakingTimerDisplay();
}

/**
 * 말하기 타이머 시각(MM:SS), 실시간 진행 게이지 바(60초 기준) 및 권장 발화 속도 팁을 업데이트합니다.
 *
 * [완주 시간 기준 피드백 정책]:
 * - 20초 미만: 6문장 완주 진행 중
 * - 20~35초: 기본 완주 달성 (IM)
 * - 35~50초: 이상적인 권장 템포 및 발음 (IH)
 * - 50초 이상: 풍부하고 여유로운 원어민식 발화 (AL)
 *
 * @returns {void}
 */
function updatePatternSpeakingTimerDisplay() {
  const digitsEl = document.getElementById("patternTimerDigits");
  if (!digitsEl) return;
  const mins = String(Math.floor(patternSpeakingSeconds / 60)).padStart(2, "0");
  const secs = String(patternSpeakingSeconds % 60).padStart(2, "0");
  digitsEl.textContent = `${mins}:${secs}`;

  // 실시간 게이지 바 너비 계산 (최대 60초 기준)
  const gaugeBarEl = document.getElementById("patternTimerGaugeBar");
  if (gaugeBarEl) {
    const pct = Math.min(100, (patternSpeakingSeconds / 60) * 100);
    gaugeBarEl.style.width = `${pct}%`;
  }

  // 실시간 목표 팁 업데이트
  const tipEl = document.getElementById("patternTimerLevelTip");
  if (tipEl) {
    tipEl.className = "timer-target-tip";
    if (patternSpeakingSeconds >= 50) {
      tipEl.textContent = "🏆 여유롭고 풍부한 발화 (50초+)";
      tipEl.classList.add("tip-al");
      digitsEl.style.color = "#d97706";
    } else if (patternSpeakingSeconds >= 35) {
      tipEl.textContent = "🥇 이상적인 권장 템포 (35~50초)";
      tipEl.classList.add("tip-ih");
      digitsEl.style.color = "#4f46e5";
    } else if (patternSpeakingSeconds >= 20) {
      tipEl.textContent = "🥉 기본 완주 달성 (20~35초)";
      tipEl.classList.add("tip-im");
      digitsEl.style.color = "#10b981";
    } else {
      tipEl.textContent = "🌱 6문장 완주 진행 중 (~20초)";
      digitsEl.style.color = "var(--primary)";
    }
  }
}
window.startPatternSpeakingTimer = startPatternSpeakingTimer;
window.stopPatternSpeakingTimer = stopPatternSpeakingTimer;
window.resetPatternSpeakingTimer = resetPatternSpeakingTimer;

// =============================================================================
// 3. 패턴 진행 상황 영속화 (Storage Management)
// =============================================================================

/**
 * 로컬 스토리지에서 패턴 학습 완료 현황을 비동기 로드합니다.
 * @returns {Promise<void>}
 */
async function loadPatternProgress() {
  try {
    const res = await storage.get(PATTERN_STORAGE_KEY, false);
    if (res && res.value) patternProgress = JSON.parse(res.value) || {};
  } catch (e) {
    patternProgress = {};
  }
}

/**
 * 패턴 학습 완료 현황을 로컬 스토리지에 저장합니다.
 * @returns {Promise<void>}
 */
async function savePatternProgress() {
  try {
    await storage.set(
      PATTERN_STORAGE_KEY,
      JSON.stringify(patternProgress),
      false,
    );
  } catch (e) {
    /* best effort */
  }
}

// =============================================================================
// 4. 슬롯 하이라이트 및 선택 헬퍼 (Slot Highlighting & Selection)
// =============================================================================

/**
 * 만능 패턴 문장 내의 대괄호 [슬롯] 키워드를 시각적 강조 태그로 감싸 변환합니다.
 * @param {string} str - 원본 문장 (예: "Whenever I think of [주제], [장소] is...")
 * @returns {string} 하이라이트 span 태그가 포함된 HTML 문자열
 */
function formatSlotText(str) {
  if (!str) return "";
  const escaped = escapeHtml(str);
  return escaped.replace(
    /\[([^\]]+)\]/g,
    '<span class="pattern-slot-tag">[$1]</span>',
  );
}

// 특정 패턴 직접 선택 및 진입
function selectPattern(idx) {
  const parsed = parseInt(idx, 10);
  if (!isNaN(parsed) && parsed >= 0 && parsed < PATTERN_ITEMS.length) {
    patternCur = parsed;
  }
  patternVarCur = 0;
  showPatternCard(patternCur);
}
window.selectPattern = selectPattern;

// 특정 주제 변형(슬롯) 선택
function selectPatternVariation(vIdx) {
  stopTTS();
  const pat = PATTERN_ITEMS[patternCur];
  if (!pat || !pat.variations || !pat.variations.length) return;

  const parsed = parseInt(vIdx, 10);
  if (!isNaN(parsed) && parsed >= 0 && parsed < pat.variations.length) {
    patternVarCur = parsed;
    renderPatternVariation();
  }
}
window.selectPatternVariation = selectPatternVariation;

// 이전 주제 변형으로 갈아끼우기
function prevPatternVariation() {
  const pat = PATTERN_ITEMS[patternCur];
  if (!pat || !pat.variations || !pat.variations.length) return;
  const newIdx =
    (patternVarCur - 1 + pat.variations.length) % pat.variations.length;
  selectPatternVariation(newIdx);
}
window.prevPatternVariation = prevPatternVariation;

// 다음 주제 변형으로 갈아끼우기
function nextPatternVariation() {
  const pat = PATTERN_ITEMS[patternCur];
  if (!pat || !pat.variations || !pat.variations.length) return;
  const newIdx = (patternVarCur + 1) % pat.variations.length;
  selectPatternVariation(newIdx);
}
window.nextPatternVariation = nextPatternVariation;

// 무작위 주제로 갈아끼우기 (랜덤 훈련)
function randomPatternVariation() {
  const pat = PATTERN_ITEMS[patternCur];
  if (!pat || !pat.variations || pat.variations.length <= 1) return;
  let newIdx = patternVarCur;
  let attempts = 0;
  while (newIdx === patternVarCur && attempts < 10) {
    newIdx = Math.floor(Math.random() * pat.variations.length);
    attempts++;
  }
  selectPatternVariation(newIdx);
}
window.randomPatternVariation = randomPatternVariation;

// =============================================================================
// 5. 만능 패턴 목록 및 카드 렌더러 (Pattern Grid & Card Renderers)
// =============================================================================

/**
 * 만능 패턴 6대 공식 선택 목록 화면(Topic Grid)을 렌더링합니다.
 * - 각 패턴별 아이콘, 이름, 설명, 적용 가능한 서베이 주제 태그 및 마스터 완료 뱃지 표시
 * @returns {void}
 */
function renderPatternTopics() {
  const container = document.getElementById("patternTopicGrid");
  if (!container) return;

  if (!PATTERN_ITEMS || !PATTERN_ITEMS.length) {
    if (
      window.PATTERNS_DATA &&
      Array.isArray(window.PATTERNS_DATA) &&
      window.PATTERNS_DATA.length
    ) {
      PATTERN_ITEMS = window.PATTERNS_DATA;
    } else {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 16px; color: var(--danger-text); font-size: 14px;">
          ❌ 만능 패턴 데이터를 불러오지 못했습니다. 새로고침을 시도해 보세요.
        </div>
      `;
      return;
    }
  }

  container.innerHTML = PATTERN_ITEMS.map((pat, idx) => {
    const isDone = patternProgress && patternProgress[pat.id];
    const whenToUseText = pat.whenToUse || "";
    const signals = Array.isArray(pat.questionSignals)
      ? pat.questionSignals
          .slice(0, 2)
          .map((s) => `<span class="signal-tag">${safeEscapeHtml(s)}</span>`)
          .join(" ")
      : "";
    const comboBadge = pat.comboRole
      ? `<span class="pattern-combo-badge">${safeEscapeHtml(pat.comboRole)}</span>`
      : "";

    const catBadges = (pat.category || "")
      .split(",")
      .map((c) => c.trim().replace(/\s*등$/, ""))
      .filter((c) => c)
      .map((c) => `<span class="pattern-cat-badge">${safeEscapeHtml(c)}</span>`)
      .join("");

    return `
      <button type="button" class="pattern-select-card" data-idx="${idx}" onclick="selectPattern(${idx})">
        <div class="pattern-select-icon">${pat.icon || "🧩"}</div>
        <div class="pattern-select-body">
          <div class="pattern-select-name-row">
            <span class="pattern-select-name-text">${idx + 1}. ${safeEscapeHtml(pat.name)}</span>
            <div class="pattern-badge-group">
              ${comboBadge}
              ${isDone ? '<span class="pattern-select-badge">완료 ✓</span>' : ""}
            </div>
          </div>
          ${
            whenToUseText
              ? `
            <div class="pattern-match-summary">
              <span class="pms-icon">🎯</span>
              <span class="pms-text">${safeEscapeHtml(whenToUseText)}</span>
            </div>
          `
              : ""
          }
          ${
            signals
              ? `
            <div class="pattern-signal-summary">
              <span class="pss-icon">👂</span>
              <span class="pss-label">청취 시그널:</span>
              <span class="pss-signals">${signals}</span>
            </div>
          `
              : ""
          }
          <div class="pattern-cats-badges">
            ${catBadges}
          </div>
        </div>
      </button>
    `;
  }).join("");

  // 이벤트 리스너 바인딩
  container.querySelectorAll(".pattern-select-card").forEach((card) => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.idx, 10);
      if (!isNaN(idx)) {
        selectPattern(idx);
      }
    });
  });
}

/**
 * 특정 패턴 인덱스의 학습 카드 화면으로 전환합니다.
 * @param {number} idx - 패턴 인덱스 (0 ~ 5)
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 기록 여부
 * @returns {void}
 */
function showPatternCard(idx, pushHistory = true) {
  if (
    typeof idx === "number" &&
    !isNaN(idx) &&
    idx >= 0 &&
    idx < PATTERN_ITEMS.length
  ) {
    patternCur = idx;
    patternVarCur = 0;
  }
  if (typeof navigateTo === "function") {
    navigateTo("patternCard", { idx: patternCur }, pushHistory);
    return;
  }
  hideAllScreens();
  const card = document.getElementById("patternCard");
  if (card) {
    card.style.display = "block";
    renderPatternCard();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
window.showPatternCard = showPatternCard;

/**
 * 만능 패턴 주제별 실전 에바 질문 매핑 데이터베이스
 * - 6대 만능 패턴과 각 variation 주제에 완벽히 매칭되는 질문(q_id 또는 맞춤 q_en/q_ko)
 */
const PATTERN_TOPIC_QUESTION_MAP = {
  pat_01: {
    "내 방": { qId: "q_home_05" },
    "카페": { qId: "q_cafe_01" },
    "공원": { qId: "q_park_01" },
    "영화관": { qId: "q_movie_05" },
    "헬스장": { qId: "q_exercise_02" },
    "대형마트": {
      q_en: "You indicated in the survey that you go grocery shopping. Please describe your favorite grocery store or supermarket you often visit.",
      q_ko: "설문에서 장보기를 한다고 하셨습니다. 자주 가시는 대형마트나 슈퍼마켓에 대해 자세히 설명해 주세요.",
    },
    "드라이브": { qId: "q_trip_02" },
    "캠핑장": { qId: "q_camp_02" },
    "해변": {
      q_en: "You indicated in the survey that you enjoy traveling. Please describe your favorite beach or coastal destination you like to visit.",
      q_ko: "설문에서 국내 여행을 좋아한다고 하셨습니다. 가장 좋아하시는 해변이나 바닷가 여행지에 대해 설명해 주세요.",
    },
    "단골 식당": { qId: "q_cook_04" },
    "호텔": { qId: "q_trip_04" },
    "도서관": {
      q_en: "Please describe the library or study cafe you often visit. Where is it located and what does it look like?",
      q_ko: "자주 가시는 도서관이나 스터디 카페에 대해 설명해 주세요. 어디에 있고 어떻게 생겼나요?",
    },
    "제주도": {
      q_en: "You indicated in the survey that you enjoy traveling. Please describe your favorite travel destination, such as Jeju Island. What does it look like?",
      q_ko: "설문에서 여행을 좋아한다고 하셨습니다. 제주도 등 가장 좋아하시는 국내 여행지에 대해 설명해 주세요. 어떤 모습인가요?",
    },
  },
  pat_02: {
    "카페": { qId: "q_cafe_02" },
    "공원 산책": { qId: "q_park_02" },
    "헬스장 운동": { qId: "q_exercise_01" },
    "요리": { qId: "q_cook_01" },
    "취미 코딩": { qId: "q_intro_02" },
    "영화 관람": { qId: "q_movie_06" },
    "마트 장보기": { qId: "q_cook_06" },
    "드라이브": { qId: "q_trip_05" },
    "주말 캠핑": { qId: "q_camp_01" },
    "독서·도서관": {
      q_en: "What do you usually do when you visit the library or read books on weekends? Tell me about your typical routine.",
      q_ko: "주말에 도서관에 가거나 책을 읽을 때 보통 무엇을 하시나요? 전형적인 일과 루틴을 말씀해 주세요.",
    },
    "음악 감상": { qId: "q_music_02" },
    "집안 청소": { qId: "q_home_06" },
    "해변 산책": {
      q_en: "What is your typical daily schedule during a trip to the beach? Describe your relaxing routine from morning to evening.",
      q_ko: "해변으로 여행을 가면 보통 하루를 어떻게 보내시나요? 아침부터 저녁까지의 여유로운 루틴을 말씀해 주세요.",
    },
  },
  pat_03: {
    "영화": { qId: "q_movie_02" },
    "축제": { qId: "q_music_03" },
    "새집 이사": {
      q_en: "Tell me about your experience moving into your current home. How did you prepare, and what happened on moving day?",
      q_ko: "현재 살고 있는 집으로 이사했던 경험에 대해 말씀해 주세요. 어떻게 준비했고 이삿날 무슨 일이 있었나요?",
    },
    "캠핑": { qId: "q_camp_06" },
    "카페": { qId: "q_cafe_03" },
    "해변": { qId: "q_trip_03" },
    "공원": { qId: "q_park_03" },
    "헬스장": { qId: "q_exercise_06" },
    "단골 식당": { qId: "q_cook_02" },
    "호텔": { qId: "q_trip_04" },
    "대형마트": {
      q_en: "Tell me about a memorable or unexpected experience you had while grocery shopping at a supermarket. What happened?",
      q_ko: "대형마트에서 장을 보다가 겪었던 기억에 남거나 뜻밖의 경험에 대해 말씀해 주세요. 무슨 일이었나요?",
    },
    "드라이브": {
      q_en: "Tell me about a memorable road trip or scenic drive you took recently. Where did you go, and why was it so memorable?",
      q_ko: "최근에 다녀온 기억에 남는 드라이브나 로드 트립에 대해 말씀해 주세요. 어디로 가셨고 왜 그렇게 기억에 남았나요?",
    },
    "도서관": {
      q_en: "Tell me about a memorable experience you had while studying or reading at the library. What happened?",
      q_ko: "도서관에서 공부하거나 책을 읽다가 겪었던 기억에 남는 경험에 대해 말씀해 주세요.",
    },
    "제주도": { qId: "q_trip_03" },
  },
  pat_04: {
    "에어컨 고장": { qId: "q_home_03" },
    "스마트폰 방전": { qId: "q_trip_06" },
    "요리 연기": { qId: "q_cook_03" },
    "갑작스런 비": { qId: "q_camp_03" },
    "친구 약속 지연": { qId: "q_rp_02" },
  },
  pat_05: {
    "카페 변화": { qId: "q_cafe_04" },
    "영화 변화": { qId: "q_movie_04" },
    "주거 변화": { qId: "q_home_04" },
    "음악 변화": { qId: "q_music_06" },
    "쇼핑 변화": {
      q_en: "How has grocery shopping changed compared to the past? Compare traditional offline markets with modern online delivery apps.",
      q_ko: "과거와 비교하여 장보기 방식이 어떻게 변화했나요? 과거의 전통 시장/마트와 오늘날의 온라인 새벽배송 앱을 비교해 주세요.",
    },
  },
  pat_06: {
    "티켓 문의": { qId: "q_rp_01" },
    "헬스장 문의": {
      q_en: "You want to sign up for a local gym. Call the fitness center and ask three or four questions about membership and facilities.",
      q_ko: "동네 헬스장에 등록하려고 합니다. 피트니스 센터에 전화해 회원권과 시설에 대해 질문 3~4가지를 해보세요.",
    },
    "약속 지연": { qId: "q_rp_02" },
    "교환/환불": {
      q_en: "You purchased an item at a store, but you found a defect when you got home. Call the store, explain the problem, and ask for an exchange or a refund.",
      q_ko: "가게에서 물건을 샀는데 집에 와보니 하자를 발견했습니다. 매장에 전화해 문제를 설명하고 교환이나 환불을 요청해 보세요.",
    },
    "예약 변경": { qId: "q_rp_04" },
    "티켓 돌발": { qId: "q_rp_03" },
  },
};

/**
 * 현재 선택된 패턴 및 주제 변형(curVar)에 해당하는 최적의 실전 에바 질문을 조회합니다.
 *
 * @param {PatternTemplate} pat - 현재 패턴 객체
 * @param {PatternVariation} curVar - 현재 주제 변형 객체
 * @returns {{ q_en: string, q_ko: string, id: string, cat: string }}
 */
function getMatchingQuestionForVariation(pat, curVar) {
  if (!pat || !curVar) return null;

  const patternId = pat.id;
  const rawTopic = curVar.topic || "";
  const cleanTopic = rawTopic
    .replace(/^[^\w가-힣]+/, "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim();

  // 1. 직접 매핑 딕셔너리 확인
  const mapForPat = PATTERN_TOPIC_QUESTION_MAP[patternId];
  if (mapForPat) {
    let matchedEntry = mapForPat[cleanTopic];
    if (!matchedEntry) {
      const foundKey = Object.keys(mapForPat).find(
        (k) => cleanTopic.includes(k) || k.includes(cleanTopic),
      );
      if (foundKey) matchedEntry = mapForPat[foundKey];
    }

    if (matchedEntry) {
      if (matchedEntry.qId && window.QUESTIONS_DATA) {
        const foundQ = window.QUESTIONS_DATA.find(
          (q) => q.id === matchedEntry.qId,
        );
        if (foundQ) {
          return {
            q_en: foundQ.q_en,
            q_ko: foundQ.q_ko,
            id: foundQ.id,
            cat: foundQ.cat,
          };
        }
      }
      if (matchedEntry.q_en) {
        return {
          q_en: matchedEntry.q_en,
          q_ko: matchedEntry.q_ko || "",
          id: matchedEntry.qId || "custom",
          cat: cleanTopic,
        };
      }
    }
  }

  // 2. window.QUESTIONS_DATA에서 실시간 탐색 (fallback)
  if (window.QUESTIONS_DATA && Array.isArray(window.QUESTIONS_DATA)) {
    const candidates = window.QUESTIONS_DATA.filter(
      (q) => q.pattern_id === patternId,
    );
    if (candidates.length > 0) {
      const matched = candidates.find(
        (q) =>
          (q.cat && q.cat.includes(cleanTopic)) ||
          (q.q_ko && q.q_ko.includes(cleanTopic)) ||
          (curVar.keyword &&
            q.q_en
              .toLowerCase()
              .includes(curVar.keyword.toLowerCase().split(" ")[0])),
      );
      if (matched) {
        return {
          q_en: matched.q_en,
          q_ko: matched.q_ko,
          id: matched.id,
          cat: matched.cat,
        };
      }
      return {
        q_en: candidates[0].q_en,
        q_ko: candidates[0].q_ko,
        id: candidates[0].id,
        cat: candidates[0].cat,
      };
    }
  }

  // 3. 최후 fallback: 패턴 기본 질문
  return {
    q_en: pat.exampleQuestion || "Please describe this topic in detail.",
    q_ko: pat.desc || "",
    id: "default",
    cat: cleanTopic,
  };
}

/**
 * 에바 질문 매칭 가이드 박스의 질문 예시 및 질문 청취 버튼을 동적으로 갱신합니다.
 *
 * @param {PatternTemplate} pat - 현재 패턴 객체
 * @param {PatternVariation} curVar - 현재 주제 변형 객체
 */
function updatePatternMatchGuideQuestion(pat, curVar) {
  if (!pat || !curVar) return;

  const matchedQ = getMatchingQuestionForVariation(pat, curVar);
  if (!matchedQ) return;

  // 1. 현재 주제 뱃지 업데이트
  const topicBadge = document.getElementById("pmgTopicBadge");
  if (topicBadge) {
    const cleanTopic = (curVar.topic || "").replace(/\s*\([^)]*\)/g, "").trim();
    topicBadge.textContent = cleanTopic || "주제 예시";
  }

  // 2. 영문 및 한글 질문 업데이트
  const qEnEl = document.getElementById("pmgExampleQEn");
  const qKoEl = document.getElementById("pmgExampleQKo");

  if (qEnEl) {
    qEnEl.textContent = `“${matchedQ.q_en}”`;
  }
  if (qKoEl) {
    qKoEl.textContent = matchedQ.q_ko ? `(${matchedQ.q_ko})` : "";
  }

  // 3. 질문 청취 시그널 칩 업데이트 (주제별 핵심 단어가 있으면 함께 반영)
  const signalsEl = document.getElementById("pmgSignals");
  if (signalsEl && Array.isArray(pat.questionSignals)) {
    const topicKeywordSignal = curVar.keyword
      ? `🎯 ${curVar.keyword}`
      : null;
    const combinedSignals = topicKeywordSignal
      ? [topicKeywordSignal, ...pat.questionSignals]
      : pat.questionSignals;

    signalsEl.innerHTML = combinedSignals
      .map(
        (sig) =>
          `<span class="pmg-signal-chip">🎧 ${safeEscapeHtml(sig)}</span>`,
      )
      .join("");
  }

  // 4. TTS 질문 듣기 버튼 연동
  const listenBtn = document.getElementById("pmgListenBtn");
  if (listenBtn) {
    listenBtn.onclick = (e) => {
      e.stopPropagation();
      if (typeof speakText === "function") {
        speakText(matchedQ.q_en, "en-US", listenBtn);
      }
    };
  }
}

/**
 * 만능 패턴 훈련 카드의 메인 콘텐츠를 렌더링합니다.
 * - 패턴 기본 정보 및 6문장 뼈대(Skeleton) 하이라이트
 * - 인터랙티브 주제 스위처(Slot Switcher) 칩 목록 생성
 * - 현재 선택된 슬롯 변형(Variation) 문장 동기화
 *
 * @returns {void}
 */
function renderPatternCard() {
  const pat = PATTERN_ITEMS[patternCur];
  if (!pat) return;

  // 1. 인덱스 및 타이틀
  const idxLabel = document.getElementById("patternIdxLabel");
  if (idxLabel) {
    idxLabel.textContent = `PATTERN ${String(patternCur + 1).padStart(2, "0")} / ${String(PATTERN_ITEMS.length).padStart(2, "0")}`;
  }

  const titleEl = document.getElementById("patternMainTitle");
  if (titleEl) {
    titleEl.innerHTML = `${pat.icon || "🧩"} ${safeEscapeHtml(pat.name)}`;
  }

  const descEl = document.getElementById("patternDescP");
  if (descEl) {
    descEl.textContent = pat.desc;
  }

  // 1-2. 질문 매칭 가이드 박스 렌더링 (어떤 문제일 때 답변할까?)
  const matchBox = document.getElementById("patternMatchGuideBox");
  if (matchBox) {
    const comboEl = document.getElementById("pmgComboRole");
    if (comboEl) comboEl.textContent = pat.comboRole || "만능 공식";

    const whenEl = document.getElementById("pmgWhenToUse");
    if (whenEl) whenEl.textContent = pat.whenToUse || pat.desc || "";
  }

  // 2. 템플릿 뼈대 (Skeleton) 렌더링
  const skeletonWrap = document.getElementById("patternSkeletonList");
  if (skeletonWrap && pat.skeleton) {
    skeletonWrap.innerHTML = pat.skeleton
      .map((item) => {
        if (typeof item === "object" && item && item.en) {
          return `
            <div class="skeleton-item">
              <div class="skeleton-en">${formatSlotText(item.en)}</div>
              ${item.ko ? `<div class="skeleton-ko">${formatSlotText(item.ko)}</div>` : ""}
            </div>
          `;
        }
        return `<div class="skeleton-item"><div class="skeleton-en">${formatSlotText(item)}</div></div>`;
      })
      .join("");
  }

  // 3. 인터랙티브 주제 스위처 칩 렌더링
  const switcherChips = document.getElementById("patternSwitcherChips");
  const varCounter = document.getElementById("patternVarCounter");
  if (varCounter && pat.variations) {
    varCounter.textContent = `${patternVarCur + 1} / ${pat.variations.length}`;
  }

  if (switcherChips && pat.variations) {
    switcherChips.innerHTML = pat.variations
      .map((v, vIdx) => {
        const activeClass = vIdx === patternVarCur ? "active" : "";
        const cleanTopic = (v.topic || "").replace(/\s*\([^)]*\)/g, "").trim();
        return `
          <button type="button" class="switcher-chip ${activeClass}" data-vidx="${vIdx}" onclick="selectPatternVariation(${vIdx})" title="${safeEscapeHtml(v.topic)}: ${safeEscapeHtml(v.keyword || "")}">
            ${safeEscapeHtml(cleanTopic)}
          </button>
        `;
      })
      .join("");
  }

  renderPatternVariation();
}

// 현재 선택된 주제 변형(슬롯) 렌더링
function renderPatternVariation() {
  const pat = PATTERN_ITEMS[patternCur];
  if (!pat || !pat.variations || !pat.variations[patternVarCur]) return;

  const curVar = pat.variations[patternVarCur];
  const slotKey = `${patternCur}_${patternVarCur}`;

  // 카운터 및 칩 활성화 상태 업데이트
  const varCounter = document.getElementById("patternVarCounter");
  if (varCounter && pat.variations) {
    varCounter.textContent = `${patternVarCur + 1} / ${pat.variations.length}`;
  }

  document.querySelectorAll(".switcher-chip").forEach((chip) => {
    if (parseInt(chip.dataset.vidx, 10) === patternVarCur) {
      chip.classList.add("active");
      try {
        chip.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      } catch (e) {}
    } else {
      chip.classList.remove("active");
    }
  });

  // 동적 뼈대(Skeleton) 업데이트: 주제별 맞춤 뼈대(curVar.skeleton)가 있으면 우선 적용
  const skeletonWrap = document.getElementById("patternSkeletonList");
  const activeSkeleton = curVar.skeleton || pat.skeleton;
  if (skeletonWrap && activeSkeleton) {
    skeletonWrap.innerHTML = activeSkeleton
      .map((item) => {
        if (typeof item === "object" && item && item.en) {
          return `
            <div class="skeleton-item">
              <div class="skeleton-en">${formatSlotText(item.en)}</div>
              ${item.ko ? `<div class="skeleton-ko">${formatSlotText(item.ko)}</div>` : ""}
            </div>
          `;
        }
        return `<div class="skeleton-item"><div class="skeleton-en">${formatSlotText(item)}</div></div>`;
      })
      .join("");
  }

  // 문장 목록 렌더링
  const sentenceList = document.getElementById("patternSentenceList");
  if (sentenceList && curVar.sentences) {
    sentenceList.innerHTML = curVar.sentences
      .map((s, sIdx) => {
        return `
        <div class="pattern-sentence-item">
          <div class="ps-header">
            <span class="ps-num">문장 ${sIdx + 1}</span>
            <div class="ps-actions">
              <button type="button" class="tts-btn tts-btn-sm" data-sen-idx="${sIdx}" title="이 문장 발음 듣기">
                🔊 발음
              </button>
              <button type="button" class="tts-btn tts-btn-sm ps-mic-btn" data-sen-idx="${sIdx}" title="이 문장 직접 소리 내어 말해보기">
                🎤 말하기
              </button>
            </div>
          </div>
          <div class="ps-en">${safeEscapeHtml(s.en)}</div>
          <div class="ps-ko">${safeEscapeHtml(s.ko)}</div>
          <div class="single-sen-eval-box ps-eval-box" id="psEvalBox_${sIdx}" style="display:none;"></div>
        </div>
      `;
      })
      .join("");

    // 개별 문장 TTS 바인딩
    sentenceList
      .querySelectorAll(".tts-btn:not(.ps-mic-btn)")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const sIdx = parseInt(btn.dataset.senIdx, 10);
          const sentence = curVar.sentences[sIdx];
          if (sentence && sentence.en) {
            speakText(sentence.en, "en-US", btn);
          }
        });
      });

    // 개별 문장 마이크(말하기) 바인딩
    sentenceList.querySelectorAll(".ps-mic-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sIdx = parseInt(btn.dataset.senIdx, 10);
        const sentence = curVar.sentences[sIdx];
        const evalBox = document.getElementById(`psEvalBox_${sIdx}`);
        if (
          sentence &&
          sentence.en &&
          typeof practiceSingleSentenceSpeech === "function"
        ) {
          practiceSingleSentenceSpeech(sentence.en, btn, evalBox);
        }
      });
    });
  }

  const fullEnSpeech = curVar.sentences.map((s) => s.en).join(" ");
  const copyFormatted = curVar.sentences
    .map((s, i) => `${i + 1}. ${s.en}\n   (${s.ko})`)
    .join("\n\n");

  // 전체 연결 듣기 버튼 (단계별 문장 훈련 헤더에 위치)
  const allTtsBtn = document.getElementById("patternTtsAllBtn");
  if (allTtsBtn) {
    allTtsBtn.onclick = () => speakText(fullEnSpeech, "en-US", allTtsBtn);
  }

  // 전체 복사 버튼 (단계별 문장 훈련 헤더에 위치)
  const copyBtn = document.getElementById("patternCopyAllBtn");
  if (copyBtn) {
    copyBtn.onclick = () => copyText(copyFormatted, copyBtn);
  }

  // 입력창 및 평가 박스 초기화 / 복원
  const userInput = document.getElementById("patternUserInput");
  if (userInput) {
    userInput.value = savedPatternUserInputs[slotKey] || "";
    if (typeof autoResizeTextarea === "function") {
      autoResizeTextarea(userInput);
    }
  }

  const evalBox = document.getElementById("patternSpeechEvalBox");
  if (evalBox) evalBox.style.display = "none";

  const grammarBox = document.getElementById("patternGrammarBox");
  if (grammarBox) grammarBox.style.display = "none";

  const googleAskRow = document.getElementById("patternGoogleAskRow");
  if (googleAskRow) googleAskRow.style.display = "none";

  const retryLink = document.getElementById("patternRetrySameLink");
  if (retryLink) retryLink.style.display = "none";

  const liveTranslate = document.getElementById("patternLiveTranslate");
  if (liveTranslate) liveTranslate.classList.remove("show");

  clearRecordedVoice("pattern");
  clearMicError(document.getElementById("patternMicError"));
  resetPatternSpeakingTimer();

  // 4. 에바 질문 매칭 가이드 박스의 질문 예시를 현재 주제에 맞게 실시간 갱신
  updatePatternMatchGuideQuestion(pat, curVar);

  // 치환된 슬롯 단어 반짝임 시각 피드백 (Pulse animation)
  setTimeout(() => {
    const slotTags = document.querySelectorAll(
      "#patternSkeletonList .pattern-slot-tag",
    );
    slotTags.forEach((el) => {
      el.classList.remove("slot-flash");
      void el.offsetWidth;
      el.classList.add("slot-flash");
    });
  }, 30);
}

// =============================================================================
// 6. 만능 패턴 채점 및 피드백 액션 (Pattern Assessment & Feedback)
// =============================================================================

/**
 * 사용자가 연습한 만능 패턴 답변을 채점하고 발음 일치도 및 문법 오류 피드백을 표시합니다.
 * @returns {void}
 */
async function evaluatePatternAnswer() {
  stopTTS();
  if (listening) {
    stopSpeechRecognition();
  }
  stopPatternSpeakingTimer();

  const pat = PATTERN_ITEMS[patternCur];
  if (!pat || !pat.variations || !pat.variations[patternVarCur]) return;

  const curVar = pat.variations[patternVarCur];
  const slotKey = `${patternCur}_${patternVarCur}`;
  const userInputEl = document.getElementById("patternUserInput");
  const userText = userInputEl ? userInputEl.value.trim() : "";

  if (!userText) {
    alert(
      "마이크(🎤)를 누르고 패턴을 말씀하시거나 직접 입력한 후 채점 버튼을 눌러주세요.",
    );
    if (userInputEl) userInputEl.focus();
    return;
  }

  savedPatternUserInputs[slotKey] = userText;
  const fullEnSpeech = curVar.sentences.map((s) => s.en).join(" ");

  const evalBox = document.getElementById("patternSpeechEvalBox");
  const badgeEl = document.getElementById("patternEvalScoreBadge");
  const diffEl = document.getElementById("patternEvalDiff");
  const feedbackEl = document.getElementById("patternEvalFeedback");
  const voiceBtn = document.getElementById("ttsPatternUserInputBtn");

  // 발음 및 일치도 평가 실행
  if (typeof renderPronunciationAssessment === "function") {
    renderPronunciationAssessment({
      boxEl: evalBox,
      badgeEl: badgeEl,
      diffEl: diffEl,
      feedbackEl: feedbackEl,
      mode: "pattern",
      referenceText: fullEnSpeech,
      userText: userText,
      voiceBtn: voiceBtn,
    });
  }

  // 문법 검사 실행
  const grammarBox = document.getElementById("patternGrammarBox");
  const grammarContent = document.getElementById("patternGrammarContent");
  if (
    typeof checkGrammar === "function" &&
    typeof renderGrammarResults === "function"
  ) {
    checkGrammar(userText).then((matches) => {
      renderGrammarResults(matches, userText, grammarBox, grammarContent);
    });
  }

  // Google AI 피드백 버튼 표시
  const googleAskRow = document.getElementById("patternGoogleAskRow");
  if (googleAskRow) googleAskRow.style.display = "flex";

  const retryLink = document.getElementById("patternRetrySameLink");
  if (retryLink) retryLink.style.display = "inline-flex";

  // 학습 이벤트 기록
  if (typeof logPracticeEvent === "function") {
    logPracticeEvent();
  }
}
window.evaluatePatternAnswer = evaluatePatternAnswer;

/**
 * 현재 패턴 입력을 초기화하고 타이머를 리셋하여 재도전 상태로 만듭니다.
 * @returns {void}
 */
function retryPatternQuestion() {
  stopTTS();
  clearRecordedVoice("pattern");
  const slotKey = `${patternCur}_${patternVarCur}`;
  delete savedPatternUserInputs[slotKey];

  const userInput = document.getElementById("patternUserInput");
  if (userInput) {
    userInput.value = "";
    if (typeof autoResizeTextarea === "function") {
      autoResizeTextarea(userInput);
    }
    userInput.focus();
  }

  const evalBox = document.getElementById("patternSpeechEvalBox");
  if (evalBox) evalBox.style.display = "none";

  const grammarBox = document.getElementById("patternGrammarBox");
  if (grammarBox) grammarBox.style.display = "none";

  const googleAskRow = document.getElementById("patternGoogleAskRow");
  if (googleAskRow) googleAskRow.style.display = "none";

  const retryLink = document.getElementById("patternRetrySameLink");
  if (retryLink) retryLink.style.display = "none";

  const liveTranslate = document.getElementById("patternLiveTranslate");
  if (liveTranslate) liveTranslate.classList.remove("show");

  clearMicError(document.getElementById("patternMicError"));
  resetPatternSpeakingTimer();
}
window.retryPatternQuestion = retryPatternQuestion;

/**
 * 만능 패턴용 Google AI 질의 프롬프트를 생성합니다.
 * @returns {string} 인코딩 전 검색 쿼리 문자열
 */
function buildPatternGoogleQuery() {
  const pat = PATTERN_ITEMS[patternCur];
  const userInput = document.getElementById("patternUserInput");
  const text = userInput ? userInput.value.trim() : "";
  const patName = pat ? pat.name : "만능 패턴";
  return `"${patName}" 만능 템플릿을 적용해서 영어로 "${text}"라고 말했는데, 이 영어 답변의 문법과 OPIc AL/IH 관점의 자연스러움을 피드백해줘`;
}
window.buildPatternGoogleQuery = buildPatternGoogleQuery;

// =============================================================================
// 7. 패턴 순서 탐색 및 완료 처리 (Pattern Navigation & Completion)
// =============================================================================

/**
 * 현재 패턴을 마스터 완료 처리하고 다음 패턴으로 이동합니다.
 * @returns {void}
 */
function nextPattern() {
  stopTTS();
  const pat = PATTERN_ITEMS[patternCur];
  if (pat) {
    patternProgress[pat.id] = true;
    savePatternProgress();
    if (typeof logPracticeEvent === "function") logPracticeEvent();
  }

  if (patternCur < PATTERN_ITEMS.length - 1) {
    patternCur++;
    patternVarCur = 0;
    renderPatternCard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // 모든 패턴 완료
    alert("🎉 축하합니다! 6대 만능 패턴 학습을 모두 완료하셨습니다!");
    showHomeScreen();
  }
}
window.nextPattern = nextPattern;

/**
 * 이전 번호의 패턴으로 이동합니다.
 * @returns {void}
 */
function prevPattern() {
  stopTTS();
  if (patternCur > 0) {
    patternCur--;
    patternVarCur = 0;
    renderPatternCard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // [UX 최적화] 첫 번째 패턴에서 '이전'을 누르면 6대 패턴 목록 화면으로 복귀
    showPatternTopics();
  }
}
window.prevPattern = prevPattern;

// =============================================================================
// 8. 시험장 직전 만능 뼈대 치트시트 모달 & PDF/HTML 다운로드
// =============================================================================

/**
 * 치트시트 최신 날짜 표기를 갱신합니다.
 */
function updateCheatSheetDate() {
  const dateEl = document.getElementById("csPrintDate");
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(now.getDate()).padStart(2, "0")}`;
  }
}

/**
 * 시험장 직전 3분 만능 뼈대 치트시트 모달을 엽니다.
 */
function openCheatSheetModal() {
  const modal = document.getElementById("cheatSheetModal");
  if (!modal) return;

  updateCheatSheetDate();
  modal.style.display = "flex";
  // base.css의 .modal-backdrop.show (opacity: 1, pointer-events: auto) 적용
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}
window.openCheatSheetModal = openCheatSheetModal;

/**
 * 치트시트 모달을 닫습니다.
 */
function closeCheatSheetModal() {
  const modal = document.getElementById("cheatSheetModal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.style.display = "none";
  document.body.style.overflow = "";
}
window.closeCheatSheetModal = closeCheatSheetModal;

/**
 * PDF 라이브러리 동적 비동기 로더 (html2canvas & jsPDF)
 * - 로컬 lib/ 번들 우선 로드, 실패 시 공인 CDN으로 자동 폴백
 */
function loadPdfScriptAsync(src, fallbackUrl) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => {
      if (fallbackUrl) {
        const fb = document.createElement("script");
        fb.src = fallbackUrl;
        fb.onload = () => resolve();
        fb.onerror = (e) =>
          reject(new Error(`Failed to load ${src} and ${fallbackUrl}`));
        document.head.appendChild(fb);
      } else {
        reject(new Error(`Failed to load ${src}`));
      }
    };
    document.head.appendChild(s);
  });
}

/**
 * html2canvas 및 jsPDF 라이브러리가 브라우저 메모리에 로드되어 있는지 확인하고
 * 필요 시 1회만 백그라운드에서 동적 로드합니다.
 */
async function ensurePdfLibraries() {
  if (typeof window.html2canvas !== "function") {
    await loadPdfScriptAsync(
      "lib/html2canvas.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    );
  }
  if (!window.jspdf || !window.jspdf.jsPDF) {
    await loadPdfScriptAsync(
      "lib/jspdf.umd.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    );
  }
}

/**
 * 맥북 무프린터 환경 및 일반 PC 사용자를 위한 3페이지 원클릭 직접 PDF 다운로드
 * - 브라우저 시스템 인쇄 창(window.print)을 일절 띄우지 않고 맥북 다운로드 폴더에 파일 직접 저장
 * - Page 1, Page 2, Page 3을 각각 독립적인 A4 규격(794px x 1122px)으로 개별 캡처하여
 *   텍스트/카드 중간 절단 현상이 원천적으로 0% 발생하도록 보장 (No-Slice Architecture)
 */
async function downloadDirectPdfA4() {
  const btnTop = document.getElementById("btnDownloadCheatSheetPdfDirect");
  const btnBottom = document.getElementById("btnDownloadCheatSheetPdfBottom");
  const origTextTop = btnTop ? btnTop.innerHTML : "";
  const origTextBottom = btnBottom ? btnBottom.innerHTML : "";

  function setBtnStatus(text) {
    if (btnTop) {
      btnTop.innerHTML = text;
      btnTop.disabled = true;
    }
    if (btnBottom) {
      btnBottom.innerHTML = text;
      btnBottom.disabled = true;
    }
  }

  function resetBtns() {
    if (btnTop) {
      btnTop.innerHTML = origTextTop;
      btnTop.disabled = false;
    }
    if (btnBottom) {
      btnBottom.innerHTML = origTextBottom;
      btnBottom.disabled = false;
    }
  }

  try {
    updateCheatSheetDate();
    setBtnStatus("⏳ PDF 준비 중...");
    await ensurePdfLibraries();

    const jsPdfClass =
      window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : window.jsPDF;

    if (!jsPdfClass || typeof window.html2canvas !== "function") {
      throw new Error("PDF 라이브러리를 초기화할 수 없습니다.");
    }

    setBtnStatus("⏳ 페이지 정렬 중...");

    // 임시 렌더링 스테이지 생성 (화면 최상단에 안정적인 A4 비율로 렌더링)
    const stage = document.createElement("div");
    stage.id = "pdfDirectStage";
    stage.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 794px;
      z-index: 100000;
      background: #ffffff;
      opacity: 0.99;
      pointer-events: none;
      box-shadow: 0 0 30px rgba(0,0,0,0.3);
    `;

    // 날짜 문자열
    const now = new Date();
    const printDateStr = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(now.getDate()).padStart(2, "0")}`;
    const fileDateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    // 원본 섹션 및 카드 참조
    const printArea = document.getElementById("cheatSheetPrintArea");
    if (!printArea) throw new Error("치트시트 본문을 찾을 수 없습니다.");

    const header = printArea.querySelector(".print-doc-header").cloneNode(true);
    header.style.display = "block";
    header.style.textAlign = "center";
    header.style.marginBottom = "10px";

    const sections = printArea.querySelectorAll(".cs-section");
    const sec1 = sections[0].cloneNode(true); // 마인드셋
    const sec2 = sections[1]; // 6대 패턴
    const patternCards = sec2.querySelectorAll(".cs-pattern-card");
    const sec3 = sections[2].cloneNode(true); // 키워드 테이블
    const sec4 = sections[3].cloneNode(true); // 10대 필러

    // ==========================================
    // Page 1: 헤더 + 주의사항 + 패턴 1 + 패턴 2
    // ==========================================
    const page1 = document.createElement("div");
    page1.className = "pdf-a4-page page-1";
    page1.innerHTML = `
      <div class="pdf-page-main">
        ${header.outerHTML}
        ${sec1.outerHTML}
        <div class="cs-section" style="margin-bottom: 0;">
          <div class="cs-section-title" style="margin-bottom: 8px;">🧩 6대 만능 패턴</div>
          <div class="cs-pattern-list" style="gap: 10px;">
            ${patternCards[0].outerHTML}
            ${patternCards[1].outerHTML}
          </div>
        </div>
      </div>
      <div class="pdf-page-footer">
        <span>OPIc Master Training System · Target: IM1</span>
        <span>Page 1 of 3</span>
      </div>
    `;

    // ==========================================
    // Page 2: 패턴 3 + 패턴 4 + 패턴 5 + 패턴 6
    // ==========================================
    const page2 = document.createElement("div");
    page2.className = "pdf-a4-page page-2";
    page2.innerHTML = `
      <div class="pdf-page-main" style="gap: 8px;">
        <div class="pdf-page-header-mini">
          <span class="mini-title">🧩 6대 만능 패턴 (이어서)</span>
          <span class="mini-page">Page 2 / 3</span>
        </div>
        <div class="cs-pattern-list" style="gap: 8px;">
          ${patternCards[2].outerHTML}
          ${patternCards[3].outerHTML}
          ${patternCards[4].outerHTML}
          ${patternCards[5].outerHTML}
        </div>
      </div>
      <div class="pdf-page-footer">
        <span>OPIc Master Training System · Target: IM1</span>
        <span>Page 2 of 3</span>
      </div>
    `;

    // ==========================================
    // Page 3: 키워드 표 + 10대 필러 + 푸터
    // ==========================================
    const page3 = document.createElement("div");
    page3.className = "pdf-a4-page page-3";
    page3.innerHTML = `
      <div class="pdf-page-main" style="gap: 12px;">
        <div class="pdf-page-header-mini">
          <span class="mini-title">🎯 주제별 핵심 단어 & 10대 필러</span>
          <span class="mini-page">Page 3 / 3</span>
        </div>
        ${sec3.outerHTML}
        ${sec4.outerHTML}
      </div>
      <div class="pdf-page-footer">
        <span>OPIc Master Training System · Target: IM1</span>
        <span>Printed on ${printDateStr} · Page 3 of 3</span>
      </div>
    `;

    // DOM에 스테이지 추가
    stage.appendChild(page1);
    document.body.appendChild(stage);

    // 캔버스 캡처 옵션
    const canvasOptions = {
      scale: 2, // 2배 고해상도 (레티나 디스플레이 및 인쇄 시 선명도 보장)
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 794,
      height: 1122,
      windowWidth: 1024,
    };

    const doc = new jsPdfClass({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // 1페이지 캡처
    setBtnStatus("⏳ 1/3 페이지 생성...");
    const canvas1 = await window.html2canvas(page1, canvasOptions);
    const imgData1 = canvas1.toDataURL("image/jpeg", 0.95);
    doc.addImage(imgData1, "JPEG", 0, 0, 210, 297, undefined, "FAST");

    // 2페이지 교체 및 캡처
    setBtnStatus("⏳ 2/3 페이지 생성...");
    stage.innerHTML = "";
    stage.appendChild(page2);
    const canvas2 = await window.html2canvas(page2, canvasOptions);
    const imgData2 = canvas2.toDataURL("image/jpeg", 0.95);
    doc.addPage();
    doc.addImage(imgData2, "JPEG", 0, 0, 210, 297, undefined, "FAST");

    // 3페이지 교체 및 캡처
    setBtnStatus("⏳ 3/3 페이지 결합...");
    stage.innerHTML = "";
    stage.appendChild(page3);
    const canvas3 = await window.html2canvas(page3, canvasOptions);
    const imgData3 = canvas3.toDataURL("image/jpeg", 0.95);
    doc.addPage();
    doc.addImage(imgData3, "JPEG", 0, 0, 210, 297, undefined, "FAST");

    // 스테이지 DOM 제거
    if (stage.parentNode) {
      stage.parentNode.removeChild(stage);
    }

    // 파일 다운로드 트리거
    setBtnStatus("💾 저장 완료!");
    const filename = `OPIc_IM1_핵심요약_치트시트_${fileDateStr}.pdf`;
    doc.save(filename);

    setTimeout(() => {
      resetBtns();
    }, 1800);
  } catch (err) {
    console.error("Direct PDF Export Error:", err);
    alert(
      "PDF 저장 중 오류가 발생했습니다. 브라우저 [🖨️ 인쇄] 또는 [💾 HTML 저장]을 이용해 주세요.\n\n오류 내용: " +
        err.message,
    );
    const stage = document.getElementById("pdfDirectStage");
    if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
    resetBtns();
  }
}
window.downloadDirectPdfA4 = downloadDirectPdfA4;
window.downloadCheatSheetPDF = downloadDirectPdfA4; // 기본 PDF 다운로드 액션을 직접 다운로드로 연결

/**
 * 만능 뼈대 치트시트를 브라우저 인쇄 엔진으로 호출하여 종이로 출력하거나 시스템 인쇄를 진행합니다.
 */
function printCheatSheet() {
  updateCheatSheetDate();
  const modal = document.getElementById("cheatSheetModal");
  if (modal && !modal.classList.contains("show")) {
    openCheatSheetModal();
  }

  // 브라우저 렌더링 파이프라인 동기화 후 시스템 인쇄 창 호출
  setTimeout(() => {
    window.print();
  }, 150);
}
window.printCheatSheet = printCheatSheet;
window.exportCheatSheetPDF = downloadDirectPdfA4; // 하위 호환성 유지

/**
 * 언제 어디서든(비행기 모드/오프라인) 스마트폰과 PC에서 즉시 열어볼 수 있는
 * 단독 실행형 HTML 치트시트 문서를 즉시 다운로드합니다.
 */
function downloadCheatSheetHTML() {
  updateCheatSheetDate();
  const printArea = document.getElementById("cheatSheetPrintArea");
  if (!printArea) return;

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const standaloneHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OPIc IM1 만능 뼈대 치트시트</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", Pretendard, "Malgun Gothic", sans-serif;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      padding: 20px 16px;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px 28px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .top-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    .print-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
    }
    .print-btn:hover { background: #4338ca; }
    .print-doc-header { display: block !important; text-align: center; margin-bottom: 24px; }
    .print-doc-title { font-size: 24px; font-weight: 800; color: #0f172a; }
    .print-doc-sub { font-size: 13px; color: #64748b; margin-top: 6px; }
    .cs-section { margin-bottom: 28px; }
    .cs-section-title { font-size: 16px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #4f46e5; padding-bottom: 6px; margin-bottom: 14px; }
    .cs-rules-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .cs-rule-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; gap: 10px; }
    .cs-rule-num { width: 24px; height: 24px; border-radius: 50%; background: #dc2626; color: white; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; }
    .cs-rule-body strong { font-size: 13px; display: block; margin-bottom: 4px; color: #0f172a; }
    .cs-rule-body p { font-size: 12px; color: #475569; line-height: 1.45; }
    .cs-pattern-list { display: flex; flex-direction: column; gap: 14px; }
    .cs-pattern-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; }
    .cs-pattern-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .cs-pattern-badge { background: #334155; color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-family: monospace; }
    .cs-pattern-name { font-size: 14px; font-weight: 700; color: #0f172a; }
    .cs-pattern-core { font-size: 12px; color: #4338ca; background: #eef2ff; padding: 3px 8px; border-radius: 4px; font-weight: 600; margin-left: auto; }
    .cs-pattern-flow { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .cs-flow-tag { background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 11px; padding: 2px 7px; border-radius: 4px; color: #334155; }
    .cs-pattern-lines { background: #fafafa; border-radius: 6px; padding: 10px 14px; border-left: 3px solid #4f46e5; display: flex; flex-direction: column; gap: 6px; }
    .cs-line { font-size: 13px; color: #1e293b; line-height: 1.45; }
    .cs-line u { color: #000000; font-weight: 800; text-decoration: underline; }
    .cs-rp-split { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cs-rp-col { background: #fafafa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .cs-rp-col-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
    .cs-keyword-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px; }
    .cs-keyword-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cs-keyword-table th { background: #f1f5f9; padding: 8px 10px; font-weight: 700; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .cs-keyword-table td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .cs-keyword-table tr:last-child td { border-bottom: none; }
    .cs-fillers-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .cs-filler-pill { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; font-size: 12px; display: flex; justify-content: space-between; align-items: center; }
    .cs-filler-pill span { font-weight: 700; color: #0f172a; }
    .cs-filler-pill small { color: #64748b; font-size: 11px; }
    .print-doc-footer { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 24px; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; padding: 0; max-width: 100%; }
      .top-toolbar { display: none; }
      .cs-pattern-card, .cs-rule-card, .cs-keyword-table tr { page-break-inside: avoid; break-inside: avoid; }
    }
    @media (max-width: 640px) {
      .cs-rules-grid, .cs-rp-split, .cs-fillers-grid { grid-template-columns: 1fr; }
      .container { padding: 16px 12px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-toolbar">
      <span style="font-size:13px; font-weight:700; color:#4f46e5;">📱 OPIc 오프라인 휴대용 치트시트</span>
      <button class="print-btn" onclick="window.print()">🖨️ PDF 인쇄 / 저장</button>
    </div>
    ${printArea.innerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([standaloneHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `OPIc_IM1_만능뼈대_치트시트_${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
window.downloadCheatSheetHTML = downloadCheatSheetHTML;
