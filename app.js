/**
 * [app.js] 메인 애플리케이션 진입점 및 이벤트 리스너 바인딩
 * - 복사, 번역, AI 팝업, 음성 재생 버튼 이벤트 등록
 * - 문장 번역 및 문법 퀴즈 화면 조작 버튼 이벤트 등록
 * - 모드 전환 및 홈 화면 내비게이션 연결
 * - 앱 기동 시 데이터 로딩 및 초기화 (initDashboard)
 */

// ── 클립보드 복사 이벤트 ──────────────────────────────────────────
els.copyKo.addEventListener("click", () => {
  copyText(els.koText.textContent.trim(), els.copyKo);
});
els.copyEn.addEventListener("click", () => {
  copyText(els.enText.textContent.trim(), els.copyEn);
});
els.copyInput.addEventListener("click", () => {
  copyText(els.userInput.value.trim(), els.copyInput);
});

// ── 유저 직접 입력 시 실시간 번역 디바운스 트리거 ──────────────────
els.userInput.addEventListener("input", () => {
  const text = els.userInput.value.trim();
  clearTimeout(translateTimer);
  if (!text) {
    els.liveTranslate.classList.remove("show");
    els.liveTranslateText.textContent = "";
    return;
  }
  translateTimer = setTimeout(() => runLiveTranslate(text), 700);
});

// ── Google AI 사이드 팝업창 연동 이벤트 ─────────────────────────────
els.googleAskLink.addEventListener("click", (e) => {
  e.preventDefault();
  const text = els.userInput.value.trim();
  if (!text) return;
  const url =
    "https://www.google.com/search?udm=50&q=" +
    encodeURIComponent(buildGoogleQuery());
  openSidePopup(url, "GoogleAI_Sentence");
});

els.googleAskCopy.addEventListener("click", () => {
  copyText(buildGoogleQuery(), els.googleAskCopy);
});

els.wordGoogleAskLink.addEventListener("click", (e) => {
  e.preventDefault();
  const item = WORD_ITEMS[wordOrder[wordCur]];
  if (!item) return;
  const url =
    "https://www.google.com/search?udm=50&q=" +
    encodeURIComponent(buildWordGoogleQuery(item));
  openSidePopup(url, "GoogleAI_Word");
});

els.wordGoogleAskCopy.addEventListener("click", () => {
  const item = WORD_ITEMS[wordOrder[wordCur]];
  if (!item) return;
  copyText(buildWordGoogleQuery(item), els.wordGoogleAskCopy);
});

// ── TTS 발음 재생 이벤트 ──────────────────────────────────────────
els.ttsKoBtn.addEventListener("click", () => {
  const text = els.koText.textContent.trim();
  if (text) speakText(text, "ko-KR", els.ttsKoBtn);
});

els.ttsEnBtn.addEventListener("click", () => {
  const text = els.enText.textContent.trim();
  if (text) speakText(text, "en-US", els.ttsEnBtn);
});

if (els.ttsUserInputBtn) {
  els.ttsUserInputBtn.addEventListener("click", () => {
    const text = els.userInput.value.trim();
    if (text) speakText(text, "en-US", els.ttsUserInputBtn);
  });
}

if (els.ttsWordBtn) {
  els.ttsWordBtn.addEventListener("click", () => {
    const item = WORD_ITEMS[wordOrder[wordCur]];
    if (!item) return;
    if (wordAnswered) {
      const match = item.tip && item.tip.match(/예\)\s*([^.]+)/);
      const speechText = match ? match[1].trim() : item.answer;
      speakText(speechText, "en-US", els.ttsWordBtn);
    } else {
      const isKo = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(item.prompt);
      speakText(item.prompt, isKo ? "ko-KR" : "en-US", els.ttsWordBtn);
    }
  });
}

// ── 문장 번역 연습 모드 버튼 이벤트 ────────────────────────────────
els.revealRow.querySelector("#revealBtn").addEventListener("click", reveal);
els.revealRow.querySelector("#skipBtn").addEventListener("click", skip);
els.rateRow.querySelector("#goodBtn").addEventListener("click", () => rate("good"));
els.rateRow.querySelector("#badBtn").addEventListener("click", () => rate("bad"));
els.retrySameLink.addEventListener("click", retrySameQuestion);
els.startBtn.addEventListener("click", startPractice);
els.restartBtn.addEventListener("click", startPractice);
els.changeTopicBtn.addEventListener("click", showTopicScreen);
els.changeTopicBtn2.addEventListener("click", showTopicScreen);

// ── 문법 포인트 퀴즈 모드 버튼 이벤트 ──────────────────────────────
els.wordNextBtn.addEventListener("click", () => {
  wordCur++;
  saveWordProgress();
  renderWordCard();
});
els.wordStartBtn.addEventListener("click", startWordPractice);
els.wordRestartBtn.addEventListener("click", startWordPractice);
els.wordChangeTopicBtn.addEventListener("click", () => {
  hideAllScreens();
  els.wordTopicScreen.style.display = "block";
  renderWordChips();
});
els.wordChangeTopicBtn2.addEventListener("click", () => {
  hideAllScreens();
  els.wordTopicScreen.style.display = "block";
  renderWordChips();
});

// ── 학습 모드 전환 및 홈 화면 내비게이션 연결 ──────────────────────
els.toWordModeLink.addEventListener("click", () => {
  hideAllScreens();
  els.wordTopicScreen.style.display = "block";
  renderWordChips();
});

els.toSentenceModeLink.addEventListener("click", () => {
  showTopicScreen();
});

els.navSentence.addEventListener("click", () => {
  hideAllScreens();
  if (order.length > 0 && cur < order.length) {
    els.practiceCard.style.display = "block";
    renderCard();
  } else {
    els.topicScreen.style.display = "block";
    renderChips();
  }
});

els.navWord.addEventListener("click", () => {
  hideAllScreens();
  if (wordOrder.length > 0 && wordCur < wordOrder.length) {
    els.wordCard.style.display = "block";
    renderWordCard();
  } else {
    els.wordTopicScreen.style.display = "block";
    renderWordChips();
  }
});

[
  els.homeFromTopic,
  els.homeFromWordTopic,
  els.homeFromPractice,
  els.homeFromDone,
  els.homeFromWordCard,
  els.homeFromWordDone,
].forEach((el) => el && el.addEventListener("click", showHomeScreen));

// ── 앱 부트스트랩 및 초기 데이터 로딩 ──────────────────────────────
async function initDashboard() {
  await loadData();
  initTTS();
  loadTtsSettings();
  await loadDailyLog();
  await loadWordProgress();
  await loadProgress();
  renderHomeDashboard();
}

document.addEventListener("DOMContentLoaded", () => {
  initSpeechRecognition();
  initDashboard();
});
