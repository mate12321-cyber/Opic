/**
 * [pattern.js] 만능 패턴 집중 훈련 (Master Patterns) 모드 컨트롤러
 * - 6대 만능 템플릿 뼈대 및 실시간 주제 스위처(Slot Switcher) 인터랙션
 * - 단계별 문장 발음 듣기 & 마이크 STT 발음 평가
 * - 패턴별 학습 진도 저장
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
  const parsed = parseInt(vIdx, 10);
  if (!isNaN(parsed)) {
    patternVarCur = parsed;
    renderPatternVariation();
  }
}
window.selectPatternVariation = selectPatternVariation;

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
          <div class="pattern-select-name">
            <span>${idx + 1}. ${safeEscapeHtml(pat.name)}</span>
            ${isDone ? '<span class="pattern-select-badge">완료 ✓</span>' : ""}
          </div>
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
  if (switcherChips && pat.variations) {
    switcherChips.innerHTML = pat.variations
      .map((v, vIdx) => {
        const activeClass = vIdx === patternVarCur ? "active" : "";
        return `
        <button type="button" class="switcher-chip ${activeClass}" data-vidx="${vIdx}" onclick="selectPatternVariation(${vIdx})">
          <span>${safeEscapeHtml(v.topic)}</span>
        </button>
      `;
      })
      .join("");

    switcherChips.querySelectorAll(".switcher-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const vIdx = parseInt(chip.dataset.vidx, 10);
        if (!isNaN(vIdx)) {
          selectPatternVariation(vIdx);
        }
      });
    });
  }

  renderPatternVariation();
}

// 현재 선택된 주제 변형(슬롯) 렌더링
function renderPatternVariation() {
  const pat = PATTERN_ITEMS[patternCur];
  if (!pat || !pat.variations || !pat.variations[patternVarCur]) return;

  const curVar = pat.variations[patternVarCur];
  const slotKey = `${patternCur}_${patternVarCur}`;

  // 칩 활성화 상태 업데이트
  document.querySelectorAll(".switcher-chip").forEach((chip) => {
    if (parseInt(chip.dataset.vidx, 10) === patternVarCur) {
      chip.classList.add("active");
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
      "마이크(🎤)를 누르고 패턴을 말씀하시거나 직접 입력한 후 채점하기를 눌러주세요.",
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
  }
}
window.prevPattern = prevPattern;
