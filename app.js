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

if (els.copyOpicInput) {
  els.copyOpicInput.addEventListener("click", () => {
    copyText(els.opicUserInput.value.trim(), els.copyOpicInput);
  });
}
if (els.copyOpicAll) {
  els.copyOpicAll.addEventListener("click", () => {
    const item = OPIC_QUESTIONS[opicOrder[opicCur]];
    if (item) copyText(item.answer_en, els.copyOpicAll);
  });
}

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

if (els.opicUserInput) {
  els.opicUserInput.addEventListener("input", () => {
    const text = els.opicUserInput.value.trim();
    clearTimeout(translateTimer);
    if (!text) {
      els.opicLiveTranslate.classList.remove("show");
      els.opicLiveTranslateText.textContent = "";
      return;
    }
    translateTimer = setTimeout(async () => {
      const isEn = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(text);
      const pair = isEn ? "en|ko" : "ko|en";
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${pair}`,
        );
        const data = await res.json();
        if (data.responseData?.translatedText) {
          els.opicLiveTranslateText.textContent =
            data.responseData.translatedText;
          els.opicLiveTranslate.classList.add("show");
        }
      } catch (e) {
        /* best effort */
      }
    }, 700);
  });
}

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

if (els.opicGoogleAskLink) {
  els.opicGoogleAskLink.addEventListener("click", (e) => {
    e.preventDefault();
    const url =
      "https://www.google.com/search?udm=50&q=" +
      encodeURIComponent(buildOpicGoogleQuery());
    openSidePopup(url, "GoogleAI_Opic");
  });
}
if (els.opicGoogleAskCopy) {
  els.opicGoogleAskCopy.addEventListener("click", () => {
    copyText(buildOpicGoogleQuery(), els.opicGoogleAskCopy);
  });
}

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

// OPIc 에바 질문 및 전체 모범답안 발음 듣기
if (els.ttsEvaBtn) {
  els.ttsEvaBtn.addEventListener("click", () => playEvaQuestion(false));
}
if (els.btnToggleEvaKo) {
  els.btnToggleEvaKo.addEventListener("click", toggleEvaKo);
}
if (els.btnToggleOpicKoHint) {
  els.btnToggleOpicKoHint.addEventListener("click", toggleOpicKoHint);
}
if (els.ttsOpicAllBtn) {
  els.ttsOpicAllBtn.addEventListener("click", () => {
    const item = OPIC_QUESTIONS[opicOrder[opicCur]];
    if (item) speakText(item.answer_en, "en-US", els.ttsOpicAllBtn);
  });
}
if (els.ttsOpicUserInputBtn) {
  els.ttsOpicUserInputBtn.addEventListener("click", () => {
    const text = els.opicUserInput.value.trim();
    if (text) speakText(text, "en-US", els.ttsOpicUserInputBtn);
  });
}

// 뷰 전환 탭
if (els.tabBreakdownBtn) {
  els.tabBreakdownBtn.addEventListener("click", () =>
    switchOpicAnswerView("breakdown"),
  );
}
if (els.tabFullBtn) {
  els.tabFullBtn.addEventListener("click", () => switchOpicAnswerView("full"));
}

// ── 문장 번역 연습 모드 버튼 이벤트 ────────────────────────────────
els.revealRow.querySelector("#revealBtn").addEventListener("click", reveal);
els.revealRow.querySelector("#skipBtn").addEventListener("click", skip);
els.rateRow
  .querySelector("#goodBtn")
  .addEventListener("click", () => rate("good"));
els.rateRow
  .querySelector("#badBtn")
  .addEventListener("click", () => rate("bad"));
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

// ── OPIc 실전 질문 & 답변 모드 버튼 이벤트 ─────────────────────────
if (els.opicRevealBtn) els.opicRevealBtn.addEventListener("click", revealOpic);
if (els.opicSkipBtn) els.opicSkipBtn.addEventListener("click", skipOpic);
if (els.opicGoodBtn)
  els.opicGoodBtn.addEventListener("click", () => rateOpic("good"));
if (els.opicBadBtn)
  els.opicBadBtn.addEventListener("click", () => rateOpic("bad"));
if (els.opicRetrySameLink)
  els.opicRetrySameLink.addEventListener("click", retrySameOpicQuestion);
if (els.opicStartBtn)
  els.opicStartBtn.addEventListener("click", () => startOpicPractice(false));
if (els.opicRestartBtn)
  els.opicRestartBtn.addEventListener("click", () => startOpicPractice(false));
if (els.opicRetryWrongBtn)
  els.opicRetryWrongBtn.addEventListener("click", () =>
    startOpicPractice(true),
  );
if (els.opicChangeTopicBtn) {

  els.opicChangeTopicBtn.addEventListener("click", () => {
    hideAllScreens();
    els.opicTopicScreen.style.display = "block";
    renderOpicChips();
  });
}
if (els.opicChangeTopicBtn2) {
  els.opicChangeTopicBtn2.addEventListener("click", () => {
    hideAllScreens();
    els.opicTopicScreen.style.display = "block";
    renderOpicChips();
  });
}

// ── 학습 모드 전환 및 홈 화면 내비게이션 연결 ──────────────────────
els.toWordModeLink.addEventListener("click", () => {
  hideAllScreens();
  els.wordTopicScreen.style.display = "block";
  renderWordChips();
});

els.toSentenceModeLink.addEventListener("click", () => {
  showTopicScreen();
});

if (els.toSentenceFromOpic) {
  els.toSentenceFromOpic.addEventListener("click", () => {
    showTopicScreen();
  });
}

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

if (els.navOpic) {
  els.navOpic.addEventListener("click", () => {
    hideAllScreens();
    if (opicOrder.length > 0 && opicCur < opicOrder.length) {
      els.opicCard.style.display = "block";
      renderOpicCard();
    } else {
      els.opicTopicScreen.style.display = "block";
      renderOpicChips();
    }
  });
}

[
  els.homeFromTopic,
  els.homeFromWordTopic,
  els.homeFromPractice,
  els.homeFromDone,
  els.homeFromWordCard,
  els.homeFromWordDone,
  els.homeFromOpicTopic,
  els.homeFromOpicCard,
  els.homeFromOpicDone,
].forEach((el) => el && el.addEventListener("click", showHomeScreen));

// ── 마이크 음성 입력(STT) 토글 연동 ────────────────────────────────
function toggleMic(targetInput, targetMicBtn, targetErrorBox) {
  if (!recognition) {
    targetErrorBox.textContent =
      "현재 브라우저에서 음성 인식을 지원하지 않습니다. Chrome/Safari를 이용해 주세요.";
    return;
  }
  if (listening) {
    recognition.stop();
    stopListeningUI();
    return;
  }

  try {
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        targetInput.value =
          (targetInput.value ? targetInput.value + " " : "") + finalTranscript;
        targetInput.dispatchEvent(new Event("input"));
      }
    };
    recognition.onerror = (e) => {
      targetErrorBox.textContent =
        "음성 인식 오류: " + (e.error || "다시 시도해 주세요.");
      stopListeningUI();
    };
    recognition.onend = () => {
      stopListeningUI();
    };

    recognition.start();
    listening = true;
    targetMicBtn.classList.add("listening");
    targetErrorBox.textContent = "";
    if (
      typeof startSpeakingTimer === "function" &&
      targetInput === els.opicUserInput
    ) {
      startSpeakingTimer();
    }
  } catch (err) {
    targetErrorBox.textContent = "마이크를 시작할 수 없습니다.";
    stopListeningUI();
  }
}

function stopListeningUI() {
  listening = false;
  if (els.micBtn) els.micBtn.classList.remove("listening");
  if (els.opicMicBtn) els.opicMicBtn.classList.remove("listening");
}

if (els.micBtn) {
  els.micBtn.addEventListener("click", () =>
    toggleMic(els.userInput, els.micBtn, els.micError),
  );
}
if (els.opicMicBtn) {
  els.opicMicBtn.addEventListener("click", () =>
    toggleMic(els.opicUserInput, els.opicMicBtn, els.opicMicError),
  );
}

// ── 앱 부트스트랩 및 초기 데이터 로딩 ──────────────────────────────
async function initDashboard() {
  await loadData();
  initTTS();
  loadTtsSettings();
  await loadDailyLog();
  await loadWordProgress();
  await loadOpicProgress();
  await loadProgress();
  renderHomeDashboard();
}

document.addEventListener("DOMContentLoaded", () => {
  initSpeechRecognition();
  initDashboard();
});
