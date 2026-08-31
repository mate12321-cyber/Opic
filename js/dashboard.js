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
  homeFromTopic: document.getElementById("homeFromTopic"),
  homeFromWordTopic: document.getElementById("homeFromWordTopic"),
  homeFromPractice: document.getElementById("homeFromPractice"),
  homeFromDone: document.getElementById("homeFromDone"),
  homeFromWordCard: document.getElementById("homeFromWordCard"),
  homeFromWordDone: document.getElementById("homeFromWordDone"),
};

// 모든 서브 화면을 숨기고 실행 중인 음성/마이크를 초기화
function hideAllScreens() {
  stopTTS();
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
}

// 문장 번역 연습 주제 선택 카드 렌더링
function renderChips() {
  els.topicChips.innerHTML = "";

  const isAllSelected = selectedCats.size === CATEGORIES.length && CATEGORIES.length > 0;
  if (els.allTopicToggleBtn) {
    els.allTopicToggleBtn.textContent = isAllSelected ? "전체 해제" : "전체 선택";
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
  els.startBtn.style.cursor = selectedCats.size === 0 ? "not-allowed" : "pointer";
}

// 문장 번역 주제 선택 화면 열기
function showTopicScreen() {
  hideAllScreens();
  els.topicScreen.style.display = "block";
  renderChips();
}

// 문법 포인트 퀴즈 유형 선택 카드 렌더링
function renderWordChips() {
  els.wordTopicChips.innerHTML = "";

  const isAllSelected = wordSelectedCats.size === WORD_CATEGORIES.length && WORD_CATEGORIES.length > 0;
  if (els.allWordTopicToggleBtn) {
    els.allWordTopicToggleBtn.textContent = isAllSelected ? "전체 해제" : "전체 선택";
    els.allWordTopicToggleBtn.onclick = () => {
      wordSelectedCats = isAllSelected ? new Set() : new Set(WORD_CATEGORIES);
      renderWordChips();
    };
  }

  WORD_CATEGORIES.forEach((cat) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (wordSelectedCats.has(cat) ? " active" : "");
    chip.textContent = cat;
    chip.onclick = () => {
      if (wordSelectedCats.has(cat)) wordSelectedCats.delete(cat);
      else wordSelectedCats.add(cat);
      renderWordChips();
    };
    els.wordTopicChips.appendChild(chip);
  });

  const count = WORD_ITEMS.filter((w) => wordSelectedCats.has(w.cat)).length;
  els.wordTopicCount.textContent = wordSelectedCats.size
    ? `(${count}문제 · ${wordSelectedCats.size}개 유형)`
    : "(유형을 선택하세요)";
  els.wordStartBtn.disabled = wordSelectedCats.size === 0;
  els.wordStartBtn.style.opacity = wordSelectedCats.size === 0 ? ".45" : "1";
  els.wordStartBtn.style.cursor = wordSelectedCats.size === 0 ? "not-allowed" : "pointer";
}

// 홈 대시보드 통계 숫자 및 7일간의 학습 막대 차트 렌더링
function renderHomeDashboard() {
  const days = last7Days();
  const today = dailyLog[days[days.length - 1].key] || 0;
  const week = days.reduce((sum, d) => sum + (dailyLog[d.key] || 0), 0);

  els.homeDate.textContent = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  els.statToday.textContent = today;
  els.statWeek.textContent = week;
  els.statStreak.textContent = computeStreak();

  const max = Math.max(1, ...days.map((d) => dailyLog[d.key] || 0));
  els.homeChart.innerHTML = days
    .map((d) => {
      const count = dailyLog[d.key] || 0;
      const h = Math.max(3, Math.round((count / max) * 44));
      return `<div class="bar-col">
      <div class="bar${d.isToday ? " today" : ""}" style="height:${h}px"></div>
      <div class="bar-label">${d.label}</div>
    </div>`;
    })
    .join("");

  const sentenceResumable = order.length > 0 && cur < order.length;
  els.navSentenceSub.textContent = sentenceResumable
    ? `이어하기 · ${cur}/${order.length}문제 진행 중`
    : `${SENTENCES.length}문장 · ${CATEGORIES.length}개 주제`;

  const wordResumable = wordOrder.length > 0 && wordCur < wordOrder.length;
  els.navWordSub.textContent = wordResumable
    ? `이어하기 · ${wordCur}/${wordOrder.length}문제 진행 중`
    : `${WORD_ITEMS.length}문제 · ${WORD_CATEGORIES.length}개 유형`;
}

// 홈 대시보드 화면 열기
function showHomeScreen() {
  hideAllScreens();
  els.homeScreen.style.display = "flex";
  renderHomeDashboard();
}
