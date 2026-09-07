/**
 * [dashboard.js] DOM 엘리먼트 캐시 및 화면 라우팅, 대시보드 렌더러
 * - 주요 DOM 엘리먼트 참조 객체 (els)
 * - 화면 전환 및 초기화 (hideAllScreens, showHomeScreen, showTopicScreen)
 * - 홈 화면 통계 & 주간 학습 차트 렌더링
 * - 문장 번역 및 문법 퀴즈 주제 선택 화면 렌더링
 */

// 주요 DOM 엘리먼트 캐시 객체
const els = {
  koText: document.getElementById("koText"),
  enText: document.getElementById("enText"),
  tipText: document.getElementById("tipText"),
  catLabel: document.getElementById("catLabel"),
  idxLabel: document.getElementById("idxLabel"),
  btnPrevSentence: document.getElementById("btnPrevSentence"),
  answerBox: document.getElementById("answerBox"),
  revealRow: document.getElementById("revealRow"),
  rateRow: document.getElementById("rateRow"),
  retrySameLink: document.getElementById("retrySameLink"),
  userInput: document.getElementById("userInput"),
  progressDots: document.getElementById("progressDots"),
  practiceCard: document.getElementById("practiceCard"),
  doneScreen: document.getElementById("doneScreen"),
  doneSummary: document.getElementById("doneSummary"),
  retryWrongBtn: document.getElementById("retryWrongBtn"),
  restartBtn: document.getElementById("restartBtn"),
  topicScreen: document.getElementById("topicScreen"),
  topicChips: document.getElementById("topicChips"),
  topicCount: document.getElementById("topicCount"),
  allTopicToggleBtn: document.getElementById("allTopicToggleBtn"),
  changeTopicBtn: document.getElementById("changeTopicBtn"),
  changeTopicBtn2: document.getElementById("changeTopicBtn2"),
  startBtn: document.getElementById("startBtn"),
  copyKo: document.getElementById("copyKo"),
  copyEn: document.getElementById("copyEn"),
  copyInput: document.getElementById("copyInput"),
  ttsKoBtn: document.getElementById("ttsKoBtn"),
  ttsEnBtn: document.getElementById("ttsEnBtn"),
  speechEvalBox: document.getElementById("speechEvalBox"),
  evalScoreBadge: document.getElementById("evalScoreBadge"),
  evalDiff: document.getElementById("evalDiff"),
  evalFeedback: document.getElementById("evalFeedback"),
  ttsUserInputBtn: document.getElementById("ttsUserInputBtn"),
  autoPlayTts: document.getElementById("autoPlayTts"),
  audioControls: document.getElementById("audioControls"),
  liveTranslate: document.getElementById("liveTranslate"),
  liveTranslateText: document.getElementById("liveTranslateText"),
  grammarBox: document.getElementById("grammarBox"),
  grammarContent: document.getElementById("grammarContent"),
  googleAskLink: document.getElementById("googleAskLink"),
  googleAskCopy: document.getElementById("googleAskCopy"),
  micBtn: document.getElementById("micBtn"),
  micError: document.getElementById("micError"),
  toWordModeLink: document.getElementById("toWordModeLink"),
  toSentenceModeLink: document.getElementById("toSentenceModeLink"),
  wordTopicScreen: document.getElementById("wordTopicScreen"),
  wordTopicChips: document.getElementById("wordTopicChips"),
  wordTopicCount: document.getElementById("wordTopicCount"),
  allWordTopicToggleBtn: document.getElementById("allWordTopicToggleBtn"),
  wordStartBtn: document.getElementById("wordStartBtn"),
  wordCard: document.getElementById("wordCard"),
  wordCatLabel: document.getElementById("wordCatLabel"),
  wordIdxLabel: document.getElementById("wordIdxLabel"),
  btnPrevWord: document.getElementById("btnPrevWord"),
  wordSentence: document.getElementById("wordSentence"),
  ttsWordBtn: document.getElementById("ttsWordBtn"),
  wordOptions: document.getElementById("wordOptions"),
  wordExplain: document.getElementById("wordExplain"),
  wordGoogleAskRow: document.getElementById("wordGoogleAskRow"),
  wordGoogleAskLink: document.getElementById("wordGoogleAskLink"),
  wordGoogleAskCopy: document.getElementById("wordGoogleAskCopy"),
  wordNextRow: document.getElementById("wordNextRow"),
  wordNextBtn: document.getElementById("wordNextBtn"),
  wordProgressDots: document.getElementById("wordProgressDots"),
  wordChangeTopicBtn: document.getElementById("wordChangeTopicBtn"),
  wordChangeTopicBtn2: document.getElementById("wordChangeTopicBtn2"),
  wordDoneScreen: document.getElementById("wordDoneScreen"),
  wordDoneSummary: document.getElementById("wordDoneSummary"),
  wordRetryWrongBtn: document.getElementById("wordRetryWrongBtn"),
  wordRestartBtn: document.getElementById("wordRestartBtn"),
  homeScreen: document.getElementById("homeScreen"),
  homeDate: document.getElementById("homeDate"),
  statToday: document.getElementById("statToday"),
  statWeek: document.getElementById("statWeek"),
  statStreak: document.getElementById("statStreak"),
  homeChart: document.getElementById("homeChart"),
  navSentence: document.getElementById("navSentence"),
  navSentenceSub: document.getElementById("navSentenceSub"),
  navWord: document.getElementById("navWord"),
  navWordSub: document.getElementById("navWordSub"),
  navOpic: document.getElementById("navOpic"),
  navOpicSub: document.getElementById("navOpicSub"),
  homeFromTopic: document.getElementById("homeFromTopic"),
  homeFromWordTopic: document.getElementById("homeFromWordTopic"),
  homeFromPractice: document.getElementById("homeFromPractice"),
  homeFromDone: document.getElementById("homeFromDone"),
  homeFromWordCard: document.getElementById("homeFromWordCard"),
  homeFromWordDone: document.getElementById("homeFromWordDone"),
  homeFromOpicTopic: document.getElementById("homeFromOpicTopic"),
  toSentenceFromOpic: document.getElementById("toSentenceFromOpic"),
  homeFromOpicCard: document.getElementById("homeFromOpicCard"),
  homeFromOpicDone: document.getElementById("homeFromOpicDone"),
  opicTopicScreen: document.getElementById("opicTopicScreen"),
  opicTopicChips: document.getElementById("opicTopicChips"),
  opicTopicCount: document.getElementById("opicTopicCount"),
  allOpicTopicToggleBtn: document.getElementById("allOpicTopicToggleBtn"),
  opicStartBtn: document.getElementById("opicStartBtn"),
  opicCard: document.getElementById("opicCard"),
  opicCatLabel: document.getElementById("opicCatLabel"),
  opicIdxLabel: document.getElementById("opicIdxLabel"),
  btnPrevOpic: document.getElementById("btnPrevOpic"),
  evaTypeBadge: document.getElementById("evaTypeBadge"),
  evaBlindBox: document.getElementById("evaBlindBox"),
  btnRevealBlind: document.getElementById("btnRevealBlind"),
  btnToggleEvaEn: document.getElementById("btnToggleEvaEn"),
  evaQEn: document.getElementById("evaQEn"),
  evaQKo: document.getElementById("evaQKo"),
  btnToggleEvaKo: document.getElementById("btnToggleEvaKo"),
  ttsEvaBtn: document.getElementById("ttsEvaBtn"),
  evaReplayCount: document.getElementById("evaReplayCount"),
  btnModeRandom: document.getElementById("btnModeRandom"),
  btnModeCombo: document.getElementById("btnModeCombo"),
  opicComboStepBadge: document.getElementById("opicComboStepBadge"),
  opicTimerDigits: document.getElementById("opicTimerDigits"),
  opicTimerLevelTip: document.getElementById("opicTimerLevelTip"),
  opicTimerGaugeBar: document.getElementById("opicTimerGaugeBar"),
  btnToggleOpicKoHint: document.getElementById("btnToggleOpicKoHint"),
  opicKoHintBox: document.getElementById("opicKoHintBox"),
  opicKoHintList: document.getElementById("opicKoHintList"),
  opicUserInput: document.getElementById("opicUserInput"),
  opicMicBtn: document.getElementById("opicMicBtn"),

  opicMicError: document.getElementById("opicMicError"),
  opicLiveTranslate: document.getElementById("opicLiveTranslate"),
  opicLiveTranslateText: document.getElementById("opicLiveTranslateText"),
  copyOpicInput: document.getElementById("copyOpicInput"),
  opicAnswerBox: document.getElementById("opicAnswerBox"),
  ttsOpicAllBtn: document.getElementById("ttsOpicAllBtn"),
  copyOpicAll: document.getElementById("copyOpicAll"),
  tabBreakdownBtn: document.getElementById("tabBreakdownBtn"),
  tabFullBtn: document.getElementById("tabFullBtn"),
  sentenceBreakdownList: document.getElementById("sentenceBreakdownList"),
  fullParagraphView: document.getElementById("fullParagraphView"),
  opicFullEn: document.getElementById("opicFullEn"),
  opicFullKo: document.getElementById("opicFullKo"),
  opicKeywordsBox: document.getElementById("opicKeywordsBox"),
  opicKeywordChipsWrap: document.getElementById("opicKeywordChipsWrap"),
  opicTipText: document.getElementById("opicTipText"),
  opicSpeechEvalBox: document.getElementById("opicSpeechEvalBox"),
  opicEvalScoreBadge: document.getElementById("opicEvalScoreBadge"),
  opicEvalDiff: document.getElementById("opicEvalDiff"),
  opicEvalFeedback: document.getElementById("opicEvalFeedback"),
  opicGrammarBox: document.getElementById("opicGrammarBox"),
  opicGrammarContent: document.getElementById("opicGrammarContent"),
  ttsOpicUserInputBtn: document.getElementById("ttsOpicUserInputBtn"),
  opicGoogleAskRow: document.getElementById("opicGoogleAskRow"),
  opicGoogleAskLink: document.getElementById("opicGoogleAskLink"),
  opicGoogleAskCopy: document.getElementById("opicGoogleAskCopy"),
  opicRevealRow: document.getElementById("opicRevealRow"),
  opicEvalBtn: document.getElementById("opicEvalBtn"),
  opicRevealBtn: document.getElementById("opicRevealBtn"),
  opicReEvalBtn: document.getElementById("opicReEvalBtn"),
  opicRevealAfterEvalBtn: document.getElementById("opicRevealAfterEvalBtn"),
  opicSkipBtn: document.getElementById("opicSkipBtn"),
  opicRateRow: document.getElementById("opicRateRow"),
  opicGoodBtn: document.getElementById("opicGoodBtn"),
  opicBadBtn: document.getElementById("opicBadBtn"),
  opicRetrySameLink: document.getElementById("opicRetrySameLink"),
  opicProgressDots: document.getElementById("opicProgressDots"),
  opicChangeTopicBtn: document.getElementById("opicChangeTopicBtn"),
  opicChangeTopicBtn2: document.getElementById("opicChangeTopicBtn2"),
  opicDoneScreen: document.getElementById("opicDoneScreen"),
  opicDoneSummary: document.getElementById("opicDoneSummary"),
  opicRetryWrongBtn: document.getElementById("opicRetryWrongBtn"),
  opicRestartBtn: document.getElementById("opicRestartBtn"),
  navPattern: document.getElementById("navPattern"),
  navPatternSub: document.getElementById("navPatternSub"),
  patternTopicScreen: document.getElementById("patternTopicScreen"),
  patternCard: document.getElementById("patternCard"),
  patternUserInput: document.getElementById("patternUserInput"),
  patternMicBtn: document.getElementById("patternMicBtn"),
  patternMicError: document.getElementById("patternMicError"),
  patternLiveTranslate: document.getElementById("patternLiveTranslate"),
  patternLiveTranslateText: document.getElementById("patternLiveTranslateText"),
  copyPatternInput: document.getElementById("copyPatternInput"),
  patternSpeechEvalBox: document.getElementById("patternSpeechEvalBox"),
  patternEvalScoreBadge: document.getElementById("patternEvalScoreBadge"),
  patternEvalDiff: document.getElementById("patternEvalDiff"),
  patternEvalFeedback: document.getElementById("patternEvalFeedback"),
  ttsPatternUserInputBtn: document.getElementById("ttsPatternUserInputBtn"),
  patternGrammarBox: document.getElementById("patternGrammarBox"),
  patternGrammarContent: document.getElementById("patternGrammarContent"),
  patternGoogleAskRow: document.getElementById("patternGoogleAskRow"),
  patternGoogleAskLink: document.getElementById("patternGoogleAskLink"),
  patternGoogleAskCopy: document.getElementById("patternGoogleAskCopy"),
  patternEvalBtn: document.getElementById("patternEvalBtn"),
  patternNextBtn: document.getElementById("patternNextBtn"),
  patternRetrySameLink: document.getElementById("patternRetrySameLink"),
  patternTtsAllBtn: document.getElementById("patternTtsAllBtn"),
  patternCopyAllBtn: document.getElementById("patternCopyAllBtn"),
  btnPrevPattern: document.getElementById("btnPrevPattern"),
  homeFromPatternTopic: document.getElementById("homeFromPatternTopic"),
  homeFromPatternCard: document.getElementById("homeFromPatternCard"),
  patternChangeListBtn: document.getElementById("patternChangeListBtn"),
  toOpicFromPattern: document.getElementById("toOpicFromPattern"),
  navFiller: document.getElementById("navFiller"),
  navFillerSub: document.getElementById("navFillerSub"),
  fillerCard: document.getElementById("fillerCard"),
  fillerScreen: document.getElementById("fillerScreen"),
  homeFromFiller: document.getElementById("homeFromFiller"),
  toPatternFromFiller: document.getElementById("toPatternFromFiller"),
};

// 모든 서브 화면을 숨기고 실행 중인 음성/마이크를 초기화
function hideAllScreens() {
  stopTTS();
  if (typeof stopSpeakingTimer === "function") {
    stopSpeakingTimer();
  }
  if (typeof stopFillerMic === "function") {
    stopFillerMic();
  }
  if (listening && recognition) {
    recognition.onend = null;
    recognition.stop();
    initSpeechRecognition();
    stopListeningUI();
  }
  els.homeScreen.style.display = "none";
  els.topicScreen.style.display = "none";
  els.practiceCard.style.display = "none";
  els.doneScreen.classList.remove("show");
  els.wordTopicScreen.style.display = "none";
  els.wordCard.style.display = "none";
  els.wordDoneScreen.classList.remove("show");
  if (els.opicTopicScreen) els.opicTopicScreen.style.display = "none";
  if (els.opicCard) els.opicCard.style.display = "none";
  if (els.opicDoneScreen) {
    els.opicDoneScreen.style.display = "none";
    els.opicDoneScreen.classList.remove("show");
  }
  if (els.patternTopicScreen) els.patternTopicScreen.style.display = "none";
  if (els.patternCard) els.patternCard.style.display = "none";
  if (els.fillerCard) els.fillerCard.style.display = "none";
  if (els.fillerScreen) els.fillerScreen.style.display = "none";
}

// 문장 번역 연습 주제 선택 카드 렌더링
function renderChips() {
  els.topicChips.innerHTML = "";

  const isAllSelected =
    selectedCats.size === CATEGORIES.length && CATEGORIES.length > 0;
  if (els.allTopicToggleBtn) {
    els.allTopicToggleBtn.textContent = isAllSelected
      ? "전체 해제"
      : "전체 선택";
    els.allTopicToggleBtn.onclick = () => {
      selectedCats = isAllSelected ? new Set() : new Set(CATEGORIES);
      renderChips();
    };
  }

  Object.entries(GROUPS).forEach(([groupName, cats]) => {
    const groupCard = document.createElement("div");
    groupCard.className = "topic-group-card";

    const groupHead = document.createElement("div");
    groupHead.className = "topic-group-head";

    const allInGroup = cats.every((c) => selectedCats.has(c));

    const titleSpan = document.createElement("span");
    titleSpan.className = "topic-group-title";
    titleSpan.textContent = groupName;

    const groupToggle = document.createElement("button");
    groupToggle.type = "button";
    groupToggle.className = "topic-group-toggle";
    groupToggle.textContent = allInGroup ? "그룹 해제" : "그룹 선택";
    groupToggle.onclick = () => {
      if (allInGroup) {
        cats.forEach((c) => selectedCats.delete(c));
      } else {
        cats.forEach((c) => selectedCats.add(c));
      }
      renderChips();
    };

    groupHead.appendChild(titleSpan);
    groupHead.appendChild(groupToggle);
    groupCard.appendChild(groupHead);

    const chipGrid = document.createElement("div");
    chipGrid.className = "topic-group-chips";
    cats.forEach((cat) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (selectedCats.has(cat) ? " active" : "");
      chip.textContent = cat;
      chip.onclick = () => {
        if (selectedCats.has(cat)) selectedCats.delete(cat);
        else selectedCats.add(cat);
        renderChips();
      };
      chipGrid.appendChild(chip);
    });

    groupCard.appendChild(chipGrid);
    els.topicChips.appendChild(groupCard);
  });

  const count = SENTENCES.filter((s) => selectedCats.has(s.cat)).length;
  els.topicCount.textContent = selectedCats.size
    ? `(${count}문장 · ${selectedCats.size}개 주제)`
    : "(주제를 선택하세요)";
  els.startBtn.disabled = selectedCats.size === 0;
  els.startBtn.style.opacity = selectedCats.size === 0 ? ".45" : "1";
  els.startBtn.style.cursor =
    selectedCats.size === 0 ? "not-allowed" : "pointer";
}

// ── SPA 브라우저 히스토리 (뒤로가기 / 앞으로가기) 라우팅 시스템 ────────────
let isNavigatingHistory = false;

function navigateTo(screen, params = {}, pushHistory = true) {
  if (pushHistory && !isNavigatingHistory) {
    const currentState = window.history.state;
    const isSame =
      currentState &&
      currentState.screen === screen &&
      JSON.stringify(currentState.params || {}) ===
        JSON.stringify(params || {});
    if (!isSame) {
      window.history.pushState({ screen, params }, "", "");
    }
  }

  hideAllScreens();

  switch (screen) {
    case "home":
      els.homeScreen.style.display = "flex";
      renderHomeDashboard();
      break;

    case "topic":
      els.topicScreen.style.display = "block";
      renderChips();
      break;

    case "practice":
      els.practiceCard.style.display = "block";
      if (typeof renderCard === "function") renderCard();
      break;

    case "done":
      els.doneScreen.classList.add("show");
      break;

    case "wordTopic":
      els.wordTopicScreen.style.display = "block";
      renderWordChips();
      break;

    case "wordCard":
      els.wordCard.style.display = "block";
      if (typeof renderWordCard === "function") renderWordCard();
      break;

    case "wordDone":
      els.wordDoneScreen.classList.add("show");
      break;

    case "opicTopic":
      if (els.opicTopicScreen) {
        els.opicTopicScreen.style.display = "block";
        if (typeof renderOpicChips === "function") renderOpicChips();
      }
      break;

    case "opicCard":
      if (els.opicCard) {
        els.opicCard.style.display = "block";
        if (typeof renderOpicCard === "function") renderOpicCard();
      }
      break;

    case "opicDone":
      if (els.opicDoneScreen) {
        els.opicDoneScreen.style.display = "block";
        els.opicDoneScreen.classList.add("show");
      }
      break;

    case "patternTopic":
      if (els.patternTopicScreen) {
        els.patternTopicScreen.style.display = "block";
        if (typeof renderPatternTopics === "function") renderPatternTopics();
      }
      break;

    case "patternCard":
      if (els.patternCard) {
        els.patternCard.style.display = "block";
        if (
          params &&
          typeof params.idx === "number" &&
          typeof patternCur !== "undefined"
        ) {
          patternCur = params.idx;
          if (typeof patternVarCur !== "undefined") patternVarCur = 0;
        }
        if (typeof renderPatternCard === "function") renderPatternCard();
      }
      break;

    case "filler":
      const fCard = document.getElementById("fillerCard");
      if (fCard) {
        fCard.style.display = "block";
        if (
          params &&
          typeof params.targetIdx === "number" &&
          typeof fillerCur !== "undefined"
        ) {
          fillerCur = params.targetIdx;
        }
        if (typeof renderFillerCard === "function") renderFillerCard();
      }
      break;

    default:
      els.homeScreen.style.display = "flex";
      renderHomeDashboard();
      break;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 브라우저 뒤로가기 / 앞으로가기 popstate 이벤트 리스너
window.addEventListener("popstate", (event) => {
  isNavigatingHistory = true;
  try {
    if (event.state && event.state.screen) {
      navigateTo(event.state.screen, event.state.params || {}, false);
    } else {
      navigateTo("home", {}, false);
    }
  } finally {
    isNavigatingHistory = false;
  }
});

// 문장 번역 주제 선택 화면 열기
function showTopicScreen(pushHistory = true) {
  navigateTo("topic", {}, pushHistory);
}

// 문법 포인트 주제 선택 화면 열기
function showWordTopicScreen(pushHistory = true) {
  navigateTo("wordTopic", {}, pushHistory);
}

// OPIc 실전 주제 선택 화면 열기
function showOpicTopicScreen(pushHistory = true) {
  navigateTo("opicTopic", {}, pushHistory);
}

// 만능 패턴 목록 화면 열기
function showPatternTopics(pushHistory = true) {
  navigateTo("patternTopic", {}, pushHistory);
}

// 홈 대시보드 화면 열기
function showHomeScreen(pushHistory = true) {
  navigateTo("home", {}, pushHistory);
}

window.navigateTo = navigateTo;
window.showHomeScreen = showHomeScreen;
window.showTopicScreen = showTopicScreen;
window.showWordTopicScreen = showWordTopicScreen;
window.showOpicTopicScreen = showOpicTopicScreen;
window.showPatternTopics = showPatternTopics;
