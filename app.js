// ── MAIN APP INITIALIZATION & EVENT LISTENERS ──────────────────────

// Copy button event listeners
els.copyKo.addEventListener("click", () => {
  copyText(els.koText.textContent.trim(), els.copyKo);
});
els.copyEn.addEventListener("click", () => {
  copyText(els.enText.textContent.trim(), els.copyEn);
});
els.copyInput.addEventListener("click", () => {
  copyText(els.userInput.value.trim(), els.copyInput);
});

// User input text listeners
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

// Google AI side popup handlers
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

// TTS audio playback listeners
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

// Sentence Practice Buttons
els.revealRow.querySelector("#revealBtn").addEventListener("click", reveal);
els.revealRow.querySelector("#skipBtn").addEventListener("click", skip);
els.rateRow.querySelector("#goodBtn").addEventListener("click", () => rate("good"));
els.rateRow.querySelector("#badBtn").addEventListener("click", () => rate("bad"));
els.retrySameLink.addEventListener("click", retrySameQuestion);
els.startBtn.addEventListener("click", startPractice);
els.restartBtn.addEventListener("click", startPractice);
els.changeTopicBtn.addEventListener("click", showTopicScreen);
els.changeTopicBtn2.addEventListener("click", showTopicScreen);

// Word Practice Buttons
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

// Mode Switching & Home Navigation
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

// App Bootstrap
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
