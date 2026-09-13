/**
 * [opic.js] OPIc 실전 질문 & 5~7문장 답변 연습 모드 컨트롤러
 * - 에바(Eva)의 질문 청취 (TTS / 2회 청취 기능)
 * - 답변 녹음 타이머 및 실시간 STT / 번역 연동
 * - IM1 수준 5~7문장 모범 답변 분할 뷰 및 문장별 TTS 재생
 * - 발음 / 문장 일치도 평가 및 Google AI 질문 연동
 *
 * --------------------------------------------------------------------------------
 * 💡 [확장성 및 유지보수 가이드 (Scalability & Customization Guide)]
 * 1. 목표 등급별 모범 답변 모델 (Multi-Level Answer Models):
 *    - 현재 데이터셋은 IM1 맞춤 5~7단문 중심(`sentences` 5~7개)으로 구성되어 있습니다.
 *    - 추후 IH (10~13문장, 문단 전개) 및 AL (14문장 이상, 복잡한 에피소드) 모범 답변을 지원하려면:
 *      a) `QUESTIONS_DATA` 각 항목에 `answers_by_grade: { IM1: [...], IH: [...], AL: [...] }`를 두고,
 *      b) 사용자의 현재 목표 등급에 맞춰 `renderOpicCard()`에서 해당 등급의 문장 배열을 동적 바인딩합니다.
 *
 * 2. 나만의 답변 커스텀 (My Script Customization):
 *    - 사용자가 제공된 표준 모범답안 대신 본인만의 답변 스크립트를 직접 입력/저장하여
 *      '내 답변 외우기 & 발음 테스트'를 할 수 있도록, `savedOpicInputs` 외에
 *      `customUserScripts[questionId]`를 영속화하여 모범답안 탭에 '나만의 답변 탭'을 추가할 수 있습니다.
 * --------------------------------------------------------------------------------
 */

// =============================================================================
// 1. OPIc 실전 모드 전역 상태 변수 (State Management)
// =============================================================================

let opicOrder = []; // 현재 출제 세트의 질문 인덱스 배열
let opicCur = 0; // 현재 진행 중인 질문 인덱스
let opicSelectedCats = new Set(); // 선택된 질문 토픽 세트
let opicRevealed = false; // 모범 답변 공개 여부 플래그
let opicWrongList = []; // 오답/재검토 대상 질문 인덱스 목록
let opicGoodCount = 0; // 만족('good') 횟수
let opicBadCount = 0; // 미흡('bad') 횟수
let opicReplayCount = 0; // 에바 질문 청취 횟수 (실전 규칙: 최대 2회)
let opicSpeakingTimer = null; // 답변 녹음 타이머 setInterval ID
let opicSpeakingSeconds = 0; // 답변 소요 시간 (초)
let opicViewMode = "breakdown"; // 답변 보기 모드: "breakdown" (문장별) | "full" (전체 문단)
let opicEnRevealed = false; // 에바 영어 질문 블라인드 해제 여부 (실전 리스닝 훈련용)
let opicPlayMode = "random"; // 출제 모드: "random" (무작위) | "combo" (실전 3단 콤보 11-12-13번)
let savedOpicInputs = {}; // 질문별 사용자 작성 답변 캐시 { [questionIdx]: string }

// =============================================================================
// 2. 진행 상태 영속화 및 모드 UI 동기화 (Storage & Mode Tabs)
// =============================================================================

/**
 * 로컬 스토리지에서 OPIc 실전 질문 진행 상황을 비동기 로드합니다.
 * @returns {Promise<void>}
 */
async function loadOpicProgress() {
  try {
    const res = await storage.get(OPIC_STORAGE_KEY, false);
    if (res && res.value) {
      const data = JSON.parse(res.value);
      if (data.order && data.order.length > 0) {
        opicOrder = data.order;
        opicCur = data.cur || 0;
        opicSelectedCats = new Set(data.selectedCats || []);
        opicWrongList = data.wrongList || [];
        opicGoodCount = data.goodCount || 0;
        opicBadCount = data.badCount || 0;
        savedOpicInputs = data.savedOpicInputs || {};
        if (data.playMode) opicPlayMode = data.playMode;
      }
    }
  } catch (e) {
    /* 초기 상태 유지 */
  }
  if (opicSelectedCats.size === 0 && OPIC_CATEGORIES.length > 0) {
    opicSelectedCats = new Set(OPIC_CATEGORIES);
  }
  updatePlayModeTabsUI();
}

/**
 * OPIc 실전 질문 진행 상황(순서, 현재인덱스, 오답목록, 채점집계)을 로컬 스토리지에 저장합니다.
 * @returns {Promise<void>}
 */
async function saveOpicProgress() {
  try {
    const data = {
      order: opicOrder,
      cur: opicCur,
      selectedCats: [...opicSelectedCats],
      wrongList: opicWrongList,
      goodCount: opicGoodCount,
      badCount: opicBadCount,
      savedOpicInputs: savedOpicInputs,
      playMode: opicPlayMode,
    };
    await storage.set(OPIC_STORAGE_KEY, JSON.stringify(data), false);
  } catch (e) {
    /* best effort */
  }
}

/**
 * 일반 무작위 모드 vs 실전 3단 콤보 모드 탭 버튼의 활성화(.active) UI를 동기화합니다.
 * @returns {void}
 */
function updatePlayModeTabsUI() {
  if (els.btnModeRandom) {
    els.btnModeRandom.classList.toggle("active", opicPlayMode === "random");
  }
  if (els.btnModeCombo) {
    els.btnModeCombo.classList.toggle("active", opicPlayMode === "combo");
  }
}

// =============================================================================
// 3. 답변 시간 타이머 및 실시간 게이지 바 (Speaking Timer & Level Tips)
// =============================================================================

/**
 * 답변 발화 소요 시간 타이머를 시작합니다.
 * @returns {void}
 */
function startSpeakingTimer() {
  stopSpeakingTimer();
  opicSpeakingSeconds = 0;
  updateSpeakingTimerDisplay();
  opicSpeakingTimer = setInterval(() => {
    opicSpeakingSeconds++;
    updateSpeakingTimerDisplay();
  }, 1000);
}

/**
 * 실행 중인 답변 타이머를 일시 정지합니다.
 * @returns {void}
 */
function stopSpeakingTimer() {
  if (opicSpeakingTimer) {
    clearInterval(opicSpeakingTimer);
    opicSpeakingTimer = null;
  }
}

/**
 * 답변 타이머 시각(MM:SS), 실시간 목표 게이지 바 및 등급 권장 안내 팁을 업데이트합니다.
 *
 * [OPIc 시험 기준 발화 시간 정책]:
 * - 45초 이상: IM (Intermediate Mid) 안정권
 * - 75초 이상: IH (Intermediate High) 문단 전개 구간
 * - 95초 이상: AL (Advanced Low) 완벽한 복수 문단 구간
 *
 * @returns {void}
 */
function updateSpeakingTimerDisplay() {
  if (!els.opicTimerDigits) return;
  const mins = String(Math.floor(opicSpeakingSeconds / 60)).padStart(2, "0");
  const secs = String(opicSpeakingSeconds % 60).padStart(2, "0");
  els.opicTimerDigits.textContent = `${mins}:${secs}`;

  // 실시간 게이지 바 너비 계산 (최대 120초 기준)
  if (els.opicTimerGaugeBar) {
    const pct = Math.min(100, (opicSpeakingSeconds / 120) * 100);
    els.opicTimerGaugeBar.style.width = `${pct}%`;
  }

  // 실시간 목표 레벨 안내 팁 업데이트
  if (els.opicTimerLevelTip) {
    els.opicTimerLevelTip.className = "timer-target-tip";
    if (opicSpeakingSeconds >= 95) {
      els.opicTimerLevelTip.textContent =
        "🏆 AL 권장 구간 달성 (95초+) 완벽한 문단!";
      els.opicTimerLevelTip.classList.add("tip-al");
      els.opicTimerDigits.style.color = "#d97706";
    } else if (opicSpeakingSeconds >= 75) {
      els.opicTimerLevelTip.textContent = "🥇 IH 권장 구간 달성 (75초+)";
      els.opicTimerLevelTip.classList.add("tip-ih");
      els.opicTimerDigits.style.color = "#4f46e5";
    } else if (opicSpeakingSeconds >= 45) {
      els.opicTimerLevelTip.textContent = "🥉 IM 권장 구간 달성 (45초+)";
      els.opicTimerLevelTip.classList.add("tip-im");
      els.opicTimerDigits.style.color = "#10b981";
    } else {
      els.opicTimerLevelTip.textContent = "🌱 답변 진행 중 (~30초)";
      els.opicTimerDigits.style.color = "var(--primary)";
    }
  }
}

// 주제/카테고리 칩 렌더링
function renderOpicChips() {
  if (!els.opicTopicChips) return;
  els.opicTopicChips.innerHTML = "";

  const isAllSelected =
    opicSelectedCats.size === OPIC_CATEGORIES.length &&
    OPIC_CATEGORIES.length > 0;

  if (els.allOpicTopicToggleBtn) {
    els.allOpicTopicToggleBtn.textContent = isAllSelected
      ? "전체 해제"
      : "전체 선택";
    els.allOpicTopicToggleBtn.onclick = () => {
      opicSelectedCats = isAllSelected ? new Set() : new Set(OPIC_CATEGORIES);
      renderOpicChips();
    };
  }

  OPIC_CATEGORIES.forEach((cat) => {
    const count = OPIC_QUESTIONS.filter((q) => q.cat === cat).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (opicSelectedCats.has(cat) ? " active" : "");
    btn.innerHTML = `<span>${cat}</span><span class="chip-count">${count}</span>`;
    btn.addEventListener("click", () => {
      if (opicSelectedCats.has(cat)) {
        opicSelectedCats.delete(cat);
      } else {
        opicSelectedCats.add(cat);
      }
      renderOpicChips();
    });
    els.opicTopicChips.appendChild(btn);
  });

  const selectedCount = OPIC_QUESTIONS.filter((q) =>
    opicSelectedCats.has(q.cat),
  ).length;

  if (els.opicTopicCount) {
    els.opicTopicCount.textContent = opicSelectedCats.size
      ? `(${selectedCount}질문 · ${opicSelectedCats.size}개 주제)`
      : "(주제를 선택하세요)";
  }

  if (els.opicStartBtn) {
    els.opicStartBtn.disabled = opicSelectedCats.size === 0;
    els.opicStartBtn.style.opacity = opicSelectedCats.size === 0 ? ".45" : "1";
    els.opicStartBtn.style.cursor =
      opicSelectedCats.size === 0 ? "not-allowed" : "pointer";
  }
}

// =============================================================================
// 4. 연습 세트 구성 및 질문 카드 렌더러 (Set Builder & Card Renderer)
// =============================================================================

/**
 * OPIc 실전 연습 세트를 시작합니다.
 *
 * [출제 모드 분기]:
 * 1. 오답 재도전 모드 (wrongOnly=true): 오답 목록(opicWrongList)에서 셔플
 * 2. 실전 3단 콤보 모드 (opicPlayMode='combo'):
 *    - 선택된 주제별로 '1단계 묘사 -> 2단계 루틴 -> 3단계 과거경험' 순서대로 정렬하여 실제 OPIc 시험과 동일한 3연속 세트 구성
 * 3. 일반 무작위 모드 (opicPlayMode='random'):
 *    - 선택된 카테고리의 모든 문제를 무작위 셔플
 *
 * @param {boolean} [wrongOnly=false] - 이전 세트의 틀린 문제만 다시 풀지 여부
 * @returns {void}
 */
function startOpicPractice(wrongOnly = false) {
  stopTTS();
  stopSpeakingTimer();

  if (wrongOnly && opicWrongList.length > 0) {
    opicOrder = shuffle([...opicWrongList]);
  } else if (opicPlayMode === "combo") {
    // 🎯 실전 3단 콤보 모드: 선택된 카테고리별로 3문항씩 묶어 순차 세트 구성
    const comboIndices = [];
    const cats = [...opicSelectedCats];

    // 카테고리 순서를 섞음
    const shuffledCats = shuffle(cats);
    for (const cat of shuffledCats) {
      const catQuestions = OPIC_QUESTIONS.map((q, idx) => ({ q, idx })).filter(
        ({ q }) => q.cat === cat,
      );

      if (catQuestions.length > 0) {
        // 실제 OPIc 콤보 단계(1단계 묘사 ➔ 2단계 루틴 ➔ 3단계 과거경험) 순서 정렬
        const sorted = catQuestions.sort(
          (a, b) => (a.q.combo_step || 1) - (b.q.combo_step || 1),
        );
        sorted.slice(0, 3).forEach(({ idx }) => comboIndices.push(idx));
      }
    }

    if (comboIndices.length === 0) {
      alert("최소 하나 이상의 주제를 선택해 주세요.");
      return;
    }
    opicOrder = comboIndices;
  } else {
    // 🎲 일반 무작위 모드
    const filteredIndices = OPIC_QUESTIONS.map((q, idx) => ({ q, idx }))
      .filter(({ q }) => opicSelectedCats.has(q.cat))
      .map(({ idx }) => idx);

    if (filteredIndices.length === 0) {
      alert("최소 하나 이상의 주제를 선택해 주세요.");
      return;
    }
    opicOrder = shuffle(filteredIndices);
  }

  opicCur = 0;
  opicWrongList = [];
  opicGoodCount = 0;
  opicBadCount = 0;
  saveOpicProgress();

  if (typeof navigateTo === "function") {
    navigateTo("opicCard", {}, true);
    return;
  }

  hideAllScreens();
  els.opicCard.style.display = "block";
  renderOpicCard();
}

/**
 * 현재 순서의 OPIc 실전 질문 카드를 렌더링합니다.
 *
 * [주요 처리 로직]:
 * 1. 실행 중인 타이머/오디오 정지 및 녹음 상태 초기화
 * 2. 모든 질문 완주 시: 세트 결과 화면(showOpicDoneScreen) 호출
 * 3. 질문 카테고리, 콤보 단계(1/2/3단계), 유형 라벨 바인딩
 * 4. 에바 질문 텍스트 및 기본 블라인드(리스닝 청취 유도) 상태 설정
 * 5. 한국어 답변 가이드, 분할 문장 뷰, 전체 문단 뷰 동적 생성
 * 6. 사용자 이전 입력 답변 복원 및 에바 질문 자동 재생 준비
 *
 * @returns {void}
 */
function renderOpicCard() {
  stopTTS();
  stopSpeakingTimer();
  clearRecordedVoice("opic");
  opicSpeakingSeconds = 0;
  updateSpeakingTimerDisplay();

  if (opicCur >= opicOrder.length) {
    showOpicDoneScreen();
    return;
  }

  const item = OPIC_QUESTIONS[opicOrder[opicCur]];
  if (!item) return;

  opicRevealed = false;
  opicEvaluated = false;
  opicModelRevealed = false;
  opicReplayCount = 0;

  // 상단 라벨 및 3단 콤보 배지 처리
  els.opicCatLabel.textContent = item.cat;
  els.opicIdxLabel.textContent = `${String(opicCur + 1).padStart(2, "0")} / ${String(opicOrder.length).padStart(2, "0")}`;
  if (els.btnPrevOpic) {
    els.btnPrevOpic.disabled = opicCur === 0;
  }
  if (els.evaTypeBadge) els.evaTypeBadge.textContent = item.type || "실전 질문";

  // 3단 콤보 배지 표시
  if (els.opicComboStepBadge) {
    if (opicPlayMode === "combo") {
      const stepText = item.combo_role || `콤보 ${item.combo_step || 1}단계`;
      els.opicComboStepBadge.textContent = `🎯 ${stepText}`;
      els.opicComboStepBadge.style.display = "inline-flex";
    } else {
      els.opicComboStepBadge.style.display = "none";
    }
  }

  // 에바 질문 텍스트 및 해석
  els.evaQEn.textContent = item.q_en;
  els.evaQKo.textContent = item.q_ko;
  els.evaQKo.classList.remove("show");
  if (els.btnToggleEvaKo) els.btnToggleEvaKo.textContent = "해석 보기 ▾";

  // 영어 질문 기본 블라인드 상태 설정
  toggleEvaEn(false);

  // 한국어 답변 가이드 리셋 & 렌더링
  if (els.opicKoHintBox) els.opicKoHintBox.style.display = "none";
  if (els.btnToggleOpicKoHint)
    els.btnToggleOpicKoHint.classList.remove("active");
  renderOpicKoHintList(item.sentences);

  // 청취 횟수 리셋
  updateEvaReplayBadge();

  // 입력창 및 실시간 번역 복원
  const previousInput = savedOpicInputs[opicOrder[opicCur]] || "";
  els.opicUserInput.value = previousInput;
  if (typeof autoResizeTextarea === "function") {
    autoResizeTextarea(els.opicUserInput);
  }
  els.opicLiveTranslate.classList.remove("show");
  els.opicLiveTranslateText.textContent = "";
  if (els.opicMicError) els.opicMicError.textContent = "";

  // 모범 답안 박스 및 평가 박스 숨김
  els.opicAnswerBox.style.display = "none";
  if (els.opicSpeechEvalBox) els.opicSpeechEvalBox.style.display = "none";
  if (els.opicGrammarBox) {
    els.opicGrammarBox.classList.remove("show");
    els.opicGrammarBox.style.display = "none";
  }
  if (els.opicGrammarContent) els.opicGrammarContent.innerHTML = "";
  if (els.opicGoogleAskRow) els.opicGoogleAskRow.style.display = "none";

  // 버튼 상태 리셋
  els.opicRevealRow.style.display = "grid";
  els.opicRateRow.style.display = "none";
  els.opicRetrySameLink.style.display = "none";
  updateOpicButtonsState();

  // 진행 점(Dots) 렌더링
  renderOpicProgressDots();

  // 질문 음성 자동 재생 (첫 진입 시)
  playEvaQuestion(true);
}

// 영어 질문 블라인드 상태 토글
function toggleEvaEn(forceShow = null) {
  if (forceShow !== null) {
    opicEnRevealed = forceShow;
  } else {
    opicEnRevealed = !opicEnRevealed;
  }

  if (els.evaQEn) {
    els.evaQEn.style.display = opicEnRevealed ? "block" : "none";
  }
  if (els.evaBlindBox) {
    els.evaBlindBox.style.display = opicEnRevealed ? "none" : "flex";
  }
  if (els.btnToggleEvaEn) {
    els.btnToggleEvaEn.textContent = opicEnRevealed
      ? "영어 질문 숨기기 ▴"
      : "영어 질문 보기 ▾";
  }
}

// 한국어 답변 가이드 목록 렌더링
function renderOpicKoHintList(sentences) {
  if (!els.opicKoHintList) return;
  els.opicKoHintList.innerHTML = "";

  sentences.forEach((s, idx) => {
    const item = document.createElement("div");
    item.className = "ko-hint-item";

    const num = document.createElement("div");
    num.className = "ko-hint-num";
    num.textContent = idx + 1;

    const text = document.createElement("div");
    text.className = "ko-hint-text";
    text.textContent = s.ko;

    item.appendChild(num);
    item.appendChild(text);
    els.opicKoHintList.appendChild(item);
  });
}

// 한국어 답변 가이드 토글
function toggleOpicKoHint() {
  if (!els.opicKoHintBox) return;
  const isHidden = els.opicKoHintBox.style.display === "none";
  els.opicKoHintBox.style.display = isHidden ? "block" : "none";
  if (els.btnToggleOpicKoHint) {
    els.btnToggleOpicKoHint.classList.toggle("active", isHidden);
  }
}

// 에바 질문 청취 횟수 배지
function updateEvaReplayBadge() {
  if (!els.evaReplayCount) return;
  if (opicReplayCount >= 2) {
    els.evaReplayCount.textContent = `청취 2/2회 (완료)`;
  } else {
    els.evaReplayCount.textContent = `청취 ${opicReplayCount}/2회`;
  }
}

// 에바 질문 음성 재생
function playEvaQuestion(isAuto = false) {
  const item = OPIC_QUESTIONS[opicOrder[opicCur]];
  if (!item) return;

  // 재생 중인 상태에서 클릭한 경우 (정지 버튼 동작) -> 재생만 중단하고 청취 횟수는 증가시키지 않음
  const isPlayingEva =
    (currentSpeakingBtn === els.ttsEvaBtn ||
      (els.ttsEvaBtn && els.ttsEvaBtn.classList.contains("playing"))) &&
    "speechSynthesis" in window &&
    speechSynthesis.speaking;

  if (isPlayingEva) {
    stopTTS();
    return;
  }

  // 수동 재생 시도 시 2회 초과 청취 방지 (OPIc 실전 규정)
  if (!isAuto && opicReplayCount >= 2) {
    alert("에바의 질문은 최대 2회까지만 청취 가능합니다 (OPIc 실전 규정).");
    return;
  }

  opicReplayCount++;
  updateEvaReplayBadge();
  speakText(item.q_en, "en-US", els.ttsEvaBtn);
}

// 질문 한국어 해석 토글
function toggleEvaKo() {
  const isShown = els.evaQKo.classList.toggle("show");
  if (els.btnToggleEvaKo) {
    els.btnToggleEvaKo.textContent = isShown ? "해석 닫기 ▴" : "해석 보기 ▾";
  }
}

// 답변 분할 뷰 vs 전체 문단 뷰 전환
function switchOpicAnswerView(mode) {
  opicViewMode = mode;
  if (els.tabBreakdownBtn)
    els.tabBreakdownBtn.classList.toggle("active", mode === "breakdown");
  if (els.tabFullBtn)
    els.tabFullBtn.classList.toggle("active", mode === "full");

  if (els.sentenceBreakdownList) {
    els.sentenceBreakdownList.style.display =
      mode === "breakdown" ? "flex" : "none";
  }
  if (els.fullParagraphView) {
    els.fullParagraphView.classList.toggle("show", mode === "full");
  }
}

// 5~7문장 분할 카드 렌더링
function renderSentenceBreakdownList(sentences) {
  if (!els.sentenceBreakdownList) return;
  els.sentenceBreakdownList.innerHTML = "";

  sentences.forEach((s, idx) => {
    const card = document.createElement("div");
    card.className = "sentence-card";

    const badge = document.createElement("div");
    badge.className = "sentence-index-badge";
    badge.textContent = idx + 1;

    const mainCol = document.createElement("div");
    mainCol.style.cssText =
      "flex: 1; display: flex; flex-direction: column; gap: 4px;";

    const texts = document.createElement("div");
    texts.className = "sentence-texts";

    const enP = document.createElement("div");
    enP.className = "sentence-en-text";
    enP.textContent = s.en;

    const koP = document.createElement("div");
    koP.className = "sentence-ko-text";
    koP.textContent = s.ko;

    texts.appendChild(enP);
    texts.appendChild(koP);
    mainCol.appendChild(texts);

    const evalBox = document.createElement("div");
    evalBox.className = "single-sen-eval-box";
    evalBox.style.display = "none";
    mainCol.appendChild(evalBox);

    const actionsWrap = document.createElement("div");
    actionsWrap.className = "sentence-actions-wrap";

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "sentence-play-btn";
    playBtn.title = "이 문장 발음 듣기";
    playBtn.innerHTML = "🔊";
    playBtn.addEventListener("click", () => {
      speakText(s.en, "en-US", playBtn);
    });

    const micBtn = document.createElement("button");
    micBtn.type = "button";
    micBtn.className = "sentence-mic-btn";
    micBtn.title = "이 문장 직접 소리 내어 말해보기";
    micBtn.innerHTML = "🎤";
    micBtn.addEventListener("click", () => {
      if (typeof practiceSingleSentenceSpeech === "function") {
        practiceSingleSentenceSpeech(s.en, micBtn, evalBox);
      }
    });

    actionsWrap.appendChild(playBtn);
    actionsWrap.appendChild(micBtn);

    card.appendChild(badge);
    card.appendChild(mainCol);
    card.appendChild(actionsWrap);
    els.sentenceBreakdownList.appendChild(card);
  });
}

// 핵심 키워드 칩 렌더링
function renderKeywordChips(keywords) {
  if (!els.opicKeywordChipsWrap) return;
  els.opicKeywordChipsWrap.innerHTML = "";

  if (!keywords || keywords.length === 0) {
    if (els.opicKeywordsBox) els.opicKeywordsBox.style.display = "none";
    return;
  }

  if (els.opicKeywordsBox) els.opicKeywordsBox.style.display = "block";
  keywords.forEach((kw) => {
    const chip = document.createElement("span");
    chip.className = "keyword-chip";
    chip.textContent = kw;
    els.opicKeywordChipsWrap.appendChild(chip);
  });
}

// 버튼 상태 및 토글 텍스트 동기화
function updateOpicButtonsState() {
  const isModelVisible =
    els.opicAnswerBox && els.opicAnswerBox.style.display === "block";

  const modelBtnHtml = isModelVisible
    ? '<span>답안 닫기</span><kbd class="shortcut-key">M</kbd>'
    : '<span>모범 답안</span><kbd class="shortcut-key">M</kbd>';

  if (els.opicRevealBtn) {
    els.opicRevealBtn.innerHTML = modelBtnHtml;
  }
  if (els.opicRevealAfterEvalBtn) {
    els.opicRevealAfterEvalBtn.innerHTML = modelBtnHtml;
  }

  if (els.opicReEvalBtn) {
    const reEvalText = opicEvaluated ? "재채점" : "채점";
    els.opicReEvalBtn.innerHTML = `<span>${reEvalText}</span><kbd class="shortcut-key">↵</kbd>`;
  }
}

// =============================================================================
// 5. 답변 채점 및 모범답안 인터랙션 (Evaluation & Answer Actions)
// =============================================================================

/**
 * 사용자가 입력(음성/텍스트)한 답변에 대해 OPIc 종합 다면 평가를 실행합니다.
 *
 * [평가 다이어그램 및 파이프라인]:
 * 1. 발화 시간 타이머 자동 정지
 * 2. 발음/유창성/운율 (Azure Neural 평가 또는 Web Speech 시뮬레이션)
 * 3. 발화량(단어 수/문장 수) 하드캡 적용 및 예상 OPIc 등급(IL~AL) 산출
 * 4. 에바 질문의 주제 어휘 키워드 일치율 기반 Topic Relevance 분석
 * 5. LanguageTool 연동 영문법 교정 제안 비동기 렌더링
 * 6. UI 상태를 2x2 채점 결과 행(재채점, 모범답안, 잘했어요, 다시연습)으로 전환
 *
 * @returns {void}
 */
function evaluateOpicAnswer() {
  opicEvaluated = true;
  stopSpeakingTimer();

  const item = OPIC_QUESTIONS[opicOrder[opicCur]];
  if (!item) return;

  const userText = (els.opicUserInput ? els.opicUserInput.value : "").trim();

  // 1. 발음, 유창성, 운율, 발화량 및 주제 적합도 정밀 진단
  if (els.opicSpeechEvalBox) {
    renderPronunciationAssessment({
      boxEl: els.opicSpeechEvalBox,
      badgeEl: els.opicEvalScoreBadge,
      diffEl: els.opicEvalDiff,
      feedbackEl: els.opicEvalFeedback,
      mode: "opic",
      referenceText: userText, // 평가 기준을 모범 답안이 아닌 '내 실제 답변'으로 설정
      userText: userText,
      voiceBtn: els.ttsOpicUserInputBtn,
      questionItem: item, // 질문 메타데이터(질문영문, 카테고리, 키워드) 전달하여 주제 적합도 분석
    });
  }

  // 2. 내 답변 실시간 문법 검사 & 원어민식 교정 제안
  if (userText && els.opicGrammarBox && els.opicGrammarContent) {
    checkGrammar(userText).then((matches) => {
      renderGrammarResults(
        matches,
        userText,
        els.opicGrammarBox,
        els.opicGrammarContent,
      );
    });
  }

  // 버튼 상태 전환: [채점] 행 숨김 -> [모범답안 확인/재채점 버튼 포함 2x2 평가 행] 표시
  if (els.opicGoogleAskRow) els.opicGoogleAskRow.style.display = "flex";
  if (els.opicRevealRow) els.opicRevealRow.style.display = "none";
  if (els.opicRateRow) els.opicRateRow.style.display = "grid";
  if (els.opicRetrySameLink)
    els.opicRetrySameLink.style.display = "inline-flex";

  updateOpicButtonsState();
}

/**
 * 모범 답변 영역(문장별 분할 카드, 전체 문단 뷰, 팁, 키워드)의 노출 상태를 토글합니다.
 * @param {boolean|null} [forceShow=null] - 강제 표시 여부 (null이면 토글)
 * @returns {void}
 */
function toggleOpicModelAnswer(forceShow = null) {
  const item = OPIC_QUESTIONS[opicOrder[opicCur]];
  if (!item) return;

  const isCurrentlyOpen =
    els.opicAnswerBox && els.opicAnswerBox.style.display === "block";
  const shouldOpen = forceShow !== null ? forceShow : !isCurrentlyOpen;

  if (shouldOpen) {
    opicModelRevealed = true;
    stopSpeakingTimer();

    // 모범 답안 렌더링
    renderSentenceBreakdownList(item.sentences);
    if (els.opicFullEn) els.opicFullEn.textContent = item.answer_en;
    if (els.opicFullKo) els.opicFullKo.textContent = item.answer_ko;
    if (els.opicTipText) els.opicTipText.textContent = item.tip;
    renderKeywordChips(item.keywords);

    // 정답 확인 시 영어 질문 텍스트 블라인드 자동 해제
    toggleEvaEn(true);

    // 기본 뷰 모드 설정 (문장별 분할 뷰)
    switchOpicAnswerView("breakdown");

    if (els.opicAnswerBox) els.opicAnswerBox.style.display = "block";

    // 자동 재생 설정 시 전체 모범답안 TTS 재생
    if (els.autoPlayTts && els.autoPlayTts.checked) {
      speakText(item.answer_en, "en-US", els.ttsOpicAllBtn);
    }
  } else {
    if (els.opicAnswerBox) els.opicAnswerBox.style.display = "none";
  }

  // 모범 답안을 본 상태에서도 버튼 행은 opicRateRow로 전환하여 [채점] 버튼이 상시 노출되도록 함
  if (els.opicRevealRow) els.opicRevealRow.style.display = "none";
  if (els.opicRateRow) els.opicRateRow.style.display = "grid";
  if (els.opicRetrySameLink)
    els.opicRetrySameLink.style.display = "inline-flex";

  updateOpicButtonsState();
}

function revealOpicModelAnswer() {
  toggleOpicModelAnswer(true);
}

// 하위 호환용 래퍼
function revealOpic() {
  revealOpicModelAnswer();
}

/**
 * 현재 질문에 대한 답변 완성도를 'good'(만족) 또는 'bad'(미흡/재연습)으로 평가하고 다음 질문으로 진행합니다.
 * @param {'good' | 'bad'} rating - 사용자 자체 만족도 평가
 * @returns {void}
 */
function rateOpic(rating) {
  stopTTS();
  clearRecordedVoice("opic");
  const currentQuestionIdx = opicOrder[opicCur];
  if (els.opicUserInput) {
    savedOpicInputs[currentQuestionIdx] = els.opicUserInput.value.trim();
  }

  if (rating === "good") {
    opicGoodCount++;
  } else {
    opicBadCount++;
    if (!opicWrongList.includes(currentQuestionIdx)) {
      opicWrongList.push(currentQuestionIdx);
    }
  }

  logPracticeEvent();
  opicCur++;
  saveOpicProgress();
  renderOpicCard();
}

/**
 * 현재 질문을 다시 처음부터 재도전합니다 (녹음/타이머 리셋).
 * @returns {void}
 */
function retrySameOpicQuestion() {
  stopTTS();
  renderOpicCard();
}

/**
 * 답변 입력 없이 다음 질문으로 건너뜁니다.
 * @returns {void}
 */
function skipOpic() {
  stopTTS();
  const currentQuestionIdx = opicOrder[opicCur];
  if (els.opicUserInput) {
    savedOpicInputs[currentQuestionIdx] = els.opicUserInput.value.trim();
  }
  opicCur++;
  saveOpicProgress();
  renderOpicCard();
}

// 이전 질문으로 되돌아가기
function prevOpicQuestion() {
  if (opicCur > 0) {
    stopTTS();
    const currentQuestionIdx = opicOrder[opicCur];
    if (els.opicUserInput) {
      savedOpicInputs[currentQuestionIdx] = els.opicUserInput.value.trim();
    }
    opicCur--;
    saveOpicProgress();
    renderOpicCard();
  }
}

// 진행 점(Dots) 렌더링
function renderOpicProgressDots() {
  if (!els.opicProgressDots) return;
  els.opicProgressDots.innerHTML = "";
  const total = opicOrder.length;
  const maxDots = 20;

  if (total <= maxDots) {
    for (let i = 0; i < total; i++) {
      const d = document.createElement("div");
      d.className =
        "dot" + (i < opicCur ? " done" : i === opicCur ? " cur" : "");
      els.opicProgressDots.appendChild(d);
    }
  } else {
    const text = document.createElement("span");
    text.className = "progress-text";
    text.textContent = `진행: ${opicCur + 1} / ${total}`;
    els.opicProgressDots.appendChild(text);
  }
}

// 완료 화면 표시
function showOpicDoneScreen() {
  hideAllScreens();
  els.opicDoneScreen.style.display = "block";
  els.opicDoneScreen.classList.add("show");

  const total = opicOrder.length;
  const accuracy = total > 0 ? Math.round((opicGoodCount / total) * 100) : 0;
  els.opicDoneSummary.textContent = `총 ${total}개 실전 질문 중 ${opicGoodCount}개 완벽 연습 (${accuracy}%)`;

  if (els.opicRetryWrongBtn) {
    els.opicRetryWrongBtn.style.display =
      opicWrongList.length > 0 ? "block" : "none";
    els.opicRetryWrongBtn.textContent = `틀린 질문(${opicWrongList.length}개)만 다시 연습`;
  }
}

// Google AI 질문 검색 쿼리 빌더
function buildOpicGoogleQuery() {
  const item = OPIC_QUESTIONS[opicOrder[opicCur]];
  const text = els.opicUserInput.value.trim();
  if (!item) return text;
  return `OPIc 영어 시험 답변 피드백: 질문은 "${item.q_en}"이고, 내 답변은 "${text}"입니다. IM1 수준으로 문법 오류와 더 자연스러운 5~7문장 표현을 알려주세요.`;
}
