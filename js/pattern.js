/**
 * [pattern.js] 만능 패턴 집중 훈련 (Master Patterns) 모드 컨트롤러
 * - 6대 만능 템플릿 뼈대 및 실시간 주제 스위처(Slot Switcher) 인터랙션
 * - 단계별 문장 발음 듣기 & 마이크 STT 발음 평가
 * - 패턴별 학습 진도 저장
 */

// 패턴 모드 전역 상태
let patternCur = 0; // 현재 선택된 패턴 인덱스
let patternVarCur = 0; // 현재 선택된 주제 변형(슬롯) 인덱스
let patternOrder = [0, 1, 2, 3, 4, 5];
let patternProgress = {};
let savedPatternUserInputs = {}; // 패턴/변형별 입력 답변 캐시

// 패턴 진도 로컬스토리지 로드
async function loadPatternProgress() {
  try {
    const res = await storage.get(PATTERN_STORAGE_KEY, false);
    if (res && res.value) patternProgress = JSON.parse(res.value) || {};
  } catch (e) {
    patternProgress = {};
  }
}

// 패턴 진도 로컬스토리지 저장
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

// 안전한 HTML 이스케이프 헬퍼
function safeEscapeHtml(str) {
  if (typeof escapeHtml === "function") return escapeHtml(str);
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 특정 패턴 직접 선택 및 진입
function selectPattern(idx) {
  const parsed = parseInt(idx, 10);
  if (!isNaN(parsed) && parsed >= 0 && parsed < PATTERN_ITEMS.length) {
    patternCur = parsed;
  }
  patternVarCur = 0;
  showPatternCard();
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

// 6대 패턴 목록 화면 렌더링
async function renderPatternTopics() {
  const container = document.getElementById("patternTopicGrid");
  if (!container) return;

  if (!PATTERN_ITEMS || !PATTERN_ITEMS.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 16px; color: var(--text-muted); font-size: 14px;">
        ⏳ 만능 패턴 데이터를 불러오는 중입니다...
      </div>
    `;
    try {
      const res = await fetch("data/patterns_im1.json");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          PATTERN_ITEMS = data;
        }
      }
    } catch (e) {
      console.error("패턴 데이터 직접 로드 실패:", e);
    }

    if (!PATTERN_ITEMS || !PATTERN_ITEMS.length) {
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
    return `
      <button type="button" class="pattern-select-card" data-idx="${idx}" onclick="selectPattern(${idx})">
        <div class="pattern-select-icon">${pat.icon || "🧩"}</div>
        <div class="pattern-select-body">
          <div class="pattern-select-name">
            <span>${idx + 1}. ${safeEscapeHtml(pat.name)}</span>
            ${isDone ? '<span class="pattern-select-badge">완료 ✓</span>' : ""}
          </div>
          <div class="pattern-select-desc">${safeEscapeHtml(pat.desc)}</div>
          <div class="pattern-select-cats">📌 적용 주제: ${safeEscapeHtml(pat.category)}</div>
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

// 패턴 학습 화면으로 전환
function showPatternCard(idx) {
  if (
    typeof idx === "number" &&
    !isNaN(idx) &&
    idx >= 0 &&
    idx < PATTERN_ITEMS.length
  ) {
    patternCur = idx;
    patternVarCur = 0;
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

// 패턴 카드 상세 렌더링
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
      .map((line) => {
        return `<div class="skeleton-item">${safeEscapeHtml(line)}</div>`;
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

  // 문장 목록 렌더링
  const sentenceList = document.getElementById("patternSentenceList");
  if (sentenceList && curVar.sentences) {
    sentenceList.innerHTML = curVar.sentences
      .map((s, sIdx) => {
        return `
        <div class="pattern-sentence-item">
          <div class="ps-header">
            <span class="ps-num">문장 ${sIdx + 1}</span>
            <button type="button" class="tts-btn tts-btn-sm" data-sen-idx="${sIdx}" title="이 문장 발음 듣기">
              🔊 발음
            </button>
          </div>
          <div class="ps-en">${safeEscapeHtml(s.en)}</div>
          <div class="ps-ko">${safeEscapeHtml(s.ko)}</div>
        </div>
      `;
      })
      .join("");

    // 개별 문장 TTS 바인딩
    sentenceList.querySelectorAll(".tts-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sIdx = parseInt(btn.dataset.senIdx, 10);
        const sentence = curVar.sentences[sIdx];
        if (sentence && sentence.en) {
          speakText(sentence.en, "en-US", btn);
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
}

// ── 만능 패턴 답변 채점 및 정밀 진단 ─────────────────────────────────
async function evaluatePatternAnswer() {
  stopTTS();
  if (listening) {
    stopSpeechRecognition();
  }

  const pat = PATTERN_ITEMS[patternCur];
  if (!pat || !pat.variations || !pat.variations[patternVarCur]) return;

  const curVar = pat.variations[patternVarCur];
  const slotKey = `${patternCur}_${patternVarCur}`;
  const userInputEl = document.getElementById("patternUserInput");
  const userText = userInputEl ? userInputEl.value.trim() : "";

  if (!userText) {
    alert("마이크(🎤)를 누르고 패턴을 말씀하시거나 직접 입력한 후 채점하기를 눌러주세요.");
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
  if (typeof checkGrammar === "function" && typeof renderGrammarResults === "function") {
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

// 패턴 재도전 / 다시 풀기
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
}
window.retryPatternQuestion = retryPatternQuestion;

// 패턴 모드용 Google AI 쿼리 생성
function buildPatternGoogleQuery() {
  const pat = PATTERN_ITEMS[patternCur];
  const userInput = document.getElementById("patternUserInput");
  const text = userInput ? userInput.value.trim() : "";
  const patName = pat ? pat.name : "만능 패턴";
  return `"${patName}" 만능 템플릿을 적용해서 영어로 "${text}"라고 말했는데, 이 영어 답변의 문법과 OPIc AL/IH 관점의 자연스러움을 피드백해줘`;
}
window.buildPatternGoogleQuery = buildPatternGoogleQuery;

// 다음 패턴으로 이동
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

// 이전 패턴으로 이동
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

