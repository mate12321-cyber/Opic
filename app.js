/**
 * [app.js] 메인 애플리케이션 진입점 및 이벤트 리스너 바인딩
 * - 복사, 번역, AI 팝업, 음성 재생 버튼 이벤트 등록
 * - 문장 번역 및 문법 퀴즈 화면 조작 버튼 이벤트 등록
 * - 모드 전환 및 홈 화면 내비게이션 연결
 * - 앱 기동 시 데이터 로딩 및 초기화 (initDashboard)
 *
 * --------------------------------------------------------------------------------
 * 💡 [확장성 및 유지보수 가이드 (Scalability & Customization Guide)]
 * 1. 이벤트 리스너 중앙 관리:
 *    - 현재 각 모드별 버튼 이벤트가 전역 DOM 엘리먼트(`els.*`)에 직접 바인딩되어 있습니다.
 *    - 신규 등급(IM2, IH 등)이나 신규 기능(모의고사 모드, 나만의 답변 생성기 등) 추가 시
 *      이벤트 위임(Event Delegation) 패턴이나 모듈별 initEventListener() 호출 방식으로 분리하면
 *      DOM 의존성을 낮추고 유지보수성을 극대화할 수 있습니다.
 *
 * 2. 사용자화(Customization) 설정 연동 포인트:
 *    - 사용자가 목표 등급(IM1 / IM2 / IH / AL), 목표 발화 시간(45초 / 60초 / 90초),
 *      선호 음성 엔진(Azure / Web Speech), 나만의 키워드를 설정하는 '환경설정(Settings) 모달'을
 *      도입할 경우, 본 파일의 initDashboard() 시점에 사용자 설정을 먼저 로드하여 각 모듈에 전파합니다.
 * --------------------------------------------------------------------------------
 */

// =============================================================================
// 1. 클립보드 복사 이벤트 바인딩 (Clipboard Handlers)
// =============================================================================
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
if (els.copyPatternInput) {
  els.copyPatternInput.addEventListener("click", () => {
    copyText(els.patternUserInput.value.trim(), els.copyPatternInput);
  });
}
if (els.copyOpicAll) {
  els.copyOpicAll.addEventListener("click", () => {
    const item = OPIC_QUESTIONS[opicOrder[opicCur]];
    if (item) copyText(item.answer_en, els.copyOpicAll);
  });
}

// =============================================================================
// 2. 실시간 자동 높이 조절 & 디바운스 번역 (Auto Resize & Live Translate)
// =============================================================================
// [UX 정책]: 700ms 디바운스를 적용하여 사용자의 타이핑 중 잦은 번역 API 호출을 방지합니다.

els.userInput.addEventListener("input", () => {
  autoResizeTextarea(els.userInput);
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
    autoResizeTextarea(els.opicUserInput);
    const text = els.opicUserInput.value.trim();
    clearTimeout(translateTimer);
    if (!text) {
      els.opicLiveTranslate.classList.remove("show");
      els.opicLiveTranslateText.textContent = "";
      return;
    }
    translateTimer = setTimeout(async () => {
      try {
        const translated = await translateToKorean(text);
        if (translated) {
          els.opicLiveTranslateText.textContent = translated;
          els.opicLiveTranslate.classList.add("show");
        }
      } catch (e) {
        /* best effort */
      }
    }, 700);
  });
}

if (els.patternUserInput) {
  els.patternUserInput.addEventListener("input", () => {
    autoResizeTextarea(els.patternUserInput);
    const text = els.patternUserInput.value.trim();
    clearTimeout(translateTimer);
    if (!text) {
      els.patternLiveTranslate.classList.remove("show");
      els.patternLiveTranslateText.textContent = "";
      return;
    }
    translateTimer = setTimeout(async () => {
      try {
        const translated = await translateToKorean(text);
        if (translated) {
          els.patternLiveTranslateText.textContent = translated;
          els.patternLiveTranslate.classList.add("show");
        }
      } catch (e) {
        /* best effort */
      }
    }, 700);
  });
}

// =============================================================================
// 3. Google AI 검색 사이드 팝업 연동 (Google AI Search Queries)
// =============================================================================
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

if (els.patternGoogleAskLink) {
  els.patternGoogleAskLink.addEventListener("click", (e) => {
    e.preventDefault();
    const url =
      "https://www.google.com/search?udm=50&q=" +
      encodeURIComponent(buildPatternGoogleQuery());
    openSidePopup(url, "GoogleAI_Pattern");
  });
}
if (els.patternGoogleAskCopy) {
  els.patternGoogleAskCopy.addEventListener("click", () => {
    copyText(buildPatternGoogleQuery(), els.patternGoogleAskCopy);
  });
}

// =============================================================================
// 4. TTS (음성 합성) 발음 듣기 이벤트 (TTS Audio Playback)
// =============================================================================
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
    playRecordedVoice("practice", els.ttsUserInputBtn, text);
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
if (els.btnToggleEvaEn) {
  els.btnToggleEvaEn.addEventListener("click", () => toggleEvaEn());
}
if (els.btnRevealBlind) {
  els.btnRevealBlind.addEventListener("click", () => toggleEvaEn(true));
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
    playRecordedVoice("opic", els.ttsOpicUserInputBtn, text);
  });
}
if (els.ttsPatternUserInputBtn) {
  els.ttsPatternUserInputBtn.addEventListener("click", () => {
    const text = els.patternUserInput.value.trim();
    playRecordedVoice("pattern", els.ttsPatternUserInputBtn, text);
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

// =============================================================================
// 5. 문장 번역 연습 모드 이벤트 (Sentence Practice Mode Events)
// =============================================================================
if (els.btnPrevSentence) {
  els.btnPrevSentence.addEventListener("click", prevQuestion);
}
els.revealRow?.querySelector("#revealBtn")?.addEventListener("click", reveal);
els.revealRow?.querySelector("#skipBtn")?.addEventListener("click", skip);
els.rateRow
  ?.querySelector("#goodBtn")
  ?.addEventListener("click", () => rate("good"));
els.rateRow
  ?.querySelector("#badBtn")
  ?.addEventListener("click", () => rate("bad"));
if (els.retrySameLink)
  els.retrySameLink.addEventListener("click", retrySameQuestion);
if (els.startBtn) els.startBtn.addEventListener("click", startPractice);
if (els.restartBtn) els.restartBtn.addEventListener("click", startPractice);
if (els.changeTopicBtn)
  els.changeTopicBtn.addEventListener("click", showTopicScreen);
if (els.changeTopicBtn2)
  els.changeTopicBtn2.addEventListener("click", showTopicScreen);

// =============================================================================
// 6. 문법 포인트 퀴즈 모드 이벤트 (Grammar Quiz Mode Events)
// =============================================================================
if (els.btnPrevWord) {
  els.btnPrevWord.addEventListener("click", prevWordQuestion);
}
if (els.wordNextBtn) {
  els.wordNextBtn.addEventListener("click", () => {
    wordCur++;
    saveWordProgress();
    renderWordCard();
  });
}
if (els.wordStartBtn)
  els.wordStartBtn.addEventListener("click", startWordPractice);
if (els.wordRestartBtn)
  els.wordRestartBtn.addEventListener("click", startWordPractice);
if (els.wordChangeTopicBtn) {
  els.wordChangeTopicBtn.addEventListener("click", () => {
    showWordTopicScreen();
  });
}
if (els.wordChangeTopicBtn2) {
  els.wordChangeTopicBtn2.addEventListener("click", () => {
    showWordTopicScreen();
  });
}

// =============================================================================
// 7. OPIc 실전 질문 & 답변 모드 이벤트 (OPIc Q&A Mode Events)
// =============================================================================
if (els.btnModeRandom) {
  els.btnModeRandom.addEventListener("click", () => {
    opicPlayMode = "random";
    updatePlayModeTabsUI();
    saveOpicProgress();
  });
}
if (els.btnModeCombo) {
  els.btnModeCombo.addEventListener("click", () => {
    opicPlayMode = "combo";
    updatePlayModeTabsUI();
    saveOpicProgress();
  });
}
if (els.btnPrevOpic) {
  els.btnPrevOpic.addEventListener("click", prevOpicQuestion);
}
if (els.opicEvalBtn) {
  els.opicEvalBtn.addEventListener("click", evaluateOpicAnswer);
}
if (els.opicReEvalBtn) {
  els.opicReEvalBtn.addEventListener("click", evaluateOpicAnswer);
}
if (els.opicRevealBtn) {
  els.opicRevealBtn.addEventListener("click", () => toggleOpicModelAnswer());
}
if (els.opicRevealAfterEvalBtn) {
  els.opicRevealAfterEvalBtn.addEventListener("click", () =>
    toggleOpicModelAnswer(),
  );
}
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
    showOpicTopicScreen();
  });
}
if (els.opicChangeTopicBtn2) {
  els.opicChangeTopicBtn2.addEventListener("click", () => {
    showOpicTopicScreen();
  });
}

// =============================================================================
// 8. 학습 모드 전환 및 홈 화면 내비게이션 (Navigation & Routing Events)
// =============================================================================
els.toWordModeLink.addEventListener("click", () => {
  showWordTopicScreen();
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
  if (order.length > 0 && cur < order.length) {
    navigateTo("practice");
  } else {
    showTopicScreen();
  }
});

els.navWord.addEventListener("click", () => {
  if (wordOrder.length > 0 && wordCur < wordOrder.length) {
    navigateTo("wordCard");
  } else {
    showWordTopicScreen();
  }
});

if (els.navOpic) {
  els.navOpic.addEventListener("click", () => {
    if (opicOrder.length > 0 && opicCur < opicOrder.length) {
      navigateTo("opicCard");
    } else {
      showOpicTopicScreen();
    }
  });
}

if (els.navPattern) {
  els.navPattern.addEventListener("click", () => {
    showPatternTopics();
  });
}

const homeFromPatternTopic = document.getElementById("homeFromPatternTopic");
const homeFromPatternCard = document.getElementById("homeFromPatternCard");
const patternChangeListBtn = document.getElementById("patternChangeListBtn");
const toOpicFromPattern = document.getElementById("toOpicFromPattern");
const patternNextBtn = document.getElementById("patternNextBtn");
const btnPrevPattern = document.getElementById("btnPrevPattern");

if (toOpicFromPattern) {
  toOpicFromPattern.addEventListener("click", () => {
    showOpicTopicScreen();
  });
}

if (patternNextBtn) patternNextBtn.addEventListener("click", nextPattern);
if (btnPrevPattern) btnPrevPattern.addEventListener("click", prevPattern);
if (patternChangeListBtn) {
  patternChangeListBtn.addEventListener("click", () => {
    showPatternTopics();
  });
}

if (els.navSpeechPractice) {
  els.navSpeechPractice.addEventListener("click", () => {
    navigateTo("speechPractice");
  });
}

if (els.navFiller) {
  els.navFiller.addEventListener("click", () => {
    showFillerScreen(0);
  });
}

const toPatternFromFiller = document.getElementById("toPatternFromFiller");
if (toPatternFromFiller) {
  toPatternFromFiller.addEventListener("click", () => {
    showPatternTopics();
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
  homeFromPatternTopic,
  homeFromPatternCard,
  document.getElementById("homeFromFiller"),
  els.homeFromSpeechPractice,
].forEach((el) => el && el.addEventListener("click", () => showHomeScreen()));

// =============================================================================
// 9. 마이크 음성 입력(STT) 토글 연동 (Speech-to-Text Mic Toggles)
// =============================================================================
if (els.micBtn) {
  els.micBtn.addEventListener("click", () =>
    toggleSpeechRecognition(els.userInput, els.micBtn, els.micError, false),
  );
}
if (els.opicMicBtn) {
  els.opicMicBtn.addEventListener("click", () =>
    toggleSpeechRecognition(
      els.opicUserInput,
      els.opicMicBtn,
      els.opicMicError,
      true,
    ),
  );
}
if (els.patternMicBtn) {
  els.patternMicBtn.addEventListener("click", () =>
    toggleSpeechRecognition(
      els.patternUserInput,
      els.patternMicBtn,
      els.patternMicError,
      "pattern",
    ),
  );
}

// =============================================================================
// 10. 만능 패턴 채점 & 재도전 이벤트 (Pattern Evaluation Events)
// =============================================================================
if (els.patternEvalBtn) {
  els.patternEvalBtn.addEventListener("click", () => {
    if (typeof evaluatePatternAnswer === "function") evaluatePatternAnswer();
  });
}
if (els.patternRetrySameLink) {
  els.patternRetrySameLink.addEventListener("click", () => {
    if (typeof retryPatternQuestion === "function") retryPatternQuestion();
  });
}

// =============================================================================
// 11. 🌙 다크 테마 / 라이트 테마 토글 (Theme Switcher)
// =============================================================================
const themeToggleBtn = document.getElementById("themeToggleBtn");
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    if (typeof toggleTheme === "function") toggleTheme();
  });
}

// =============================================================================
// 12. 📚 내 단어장 모달 이벤트 (Vocabulary Book Modal)
// =============================================================================
const openVocabModalBtn = document.getElementById("openVocabModalBtn");
const closeVocabModalBtn = document.getElementById("closeVocabModalBtn");
const closeVocabModalBtn2 = document.getElementById("closeVocabModalBtn2");
const clearAllVocabBtn = document.getElementById("clearAllVocabBtn");
const vocabModal = document.getElementById("vocabModal");

if (openVocabModalBtn) {
  openVocabModalBtn.addEventListener("click", () => {
    if (typeof openVocabModal === "function") openVocabModal();
  });
}
if (closeVocabModalBtn) {
  closeVocabModalBtn.addEventListener("click", () => {
    if (typeof closeVocabModal === "function") closeVocabModal();
  });
}
if (closeVocabModalBtn2) {
  closeVocabModalBtn2.addEventListener("click", () => {
    if (typeof closeVocabModal === "function") closeVocabModal();
  });
}
if (clearAllVocabBtn) {
  clearAllVocabBtn.addEventListener("click", () => {
    if (typeof clearAllSavedWords === "function") clearAllSavedWords();
  });
}
if (vocabModal) {
  vocabModal.addEventListener("click", (e) => {
    if (e.target === vocabModal) {
      if (typeof closeVocabModal === "function") closeVocabModal();
    }
  });
}

// =============================================================================
// 13. 💾 학습 데이터 백업 & 복원 이벤트 (Backup & Restore Handlers)
// =============================================================================
const exportBackupBtn = document.getElementById("exportBackupBtn");
const importBackupBtn = document.getElementById("importBackupBtn");
const importBackupInput = document.getElementById("importBackupInput");

if (exportBackupBtn) {
  exportBackupBtn.addEventListener("click", async () => {
    if (typeof exportAllDataJson === "function") {
      await exportAllDataJson();
    }
  });
}
if (importBackupBtn && importBackupInput) {
  importBackupBtn.addEventListener("click", () => {
    importBackupInput.click();
  });
  importBackupInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && typeof importDataJson === "function") {
      await importDataJson(file);
    }
    importBackupInput.value = "";
  });
}

// =============================================================================
// 14. 앱 부트스트랩 및 초기 데이터 로딩 시퀀스 (Application Bootstrap)
// =============================================================================

/**
 * 애플리케이션 초기 구동 시퀀스를 순차 실행합니다.
 *
 * [초기화 흐름]:
 * 1. SPA 히스토리 기본 상태 초기화 (replaceState)
 * 2. OS 및 저장된 테마(Dark/Light) 적용
 * 3. 5대 정적 데이터셋 메모리 로딩 (loadData)
 * 4. 음성 엔진(TTS) 및 사용자 커스텀 설정 로드
 * 5. 일별 학습 기록 및 5대 학습 모드별 진행 상태 복원
 * 6. 홈 대시보드 통계/차트 렌더링 (renderHomeDashboard) 및 단어장 뱃지 동기화
 * 7. URL 쿼리 파라미터(?screen=...) 또는 해시 기반 딥링크 화면 이동
 *
 * @returns {Promise<void>}
 */
async function initDashboard() {
  if (!window.history.state) {
    window.history.replaceState({ screen: "home", params: {} }, "", "");
  }
  if (typeof initTheme === "function") initTheme();
  await loadData();
  initTTS();
  loadTtsSettings();
  await loadDailyLog();
  await loadWordProgress();
  await loadOpicProgress();
  await loadPatternProgress();
  if (typeof loadFillerProgress === "function") {
    await loadFillerProgress();
  }
  await loadProgress();
  if (typeof renderHomeDashboard === "function") {
    renderHomeDashboard();
  }
  if (typeof renderPatternTopics === "function") {
    renderPatternTopics();
  }
  if (typeof updateSavedWordsBadge === "function") {
    updateSavedWordsBadge();
  }
  const urlParams = new URLSearchParams(window.location.search);
  const targetScreen =
    urlParams.get("screen") || window.location.hash.replace("#", "");
  if (targetScreen && typeof navigateTo === "function") {
    navigateTo(targetScreen, {}, false);
  } else if (typeof navigateTo === "function") {
    navigateTo("home", {}, false);
  }
}

// =============================================================================
// 15. DOM 로드 완료 이벤트 리스너 (DOM Ready Entrypoint)
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initTheme === "function") initTheme();
  initSpeechRecognition();
  if (typeof initVocabTooltip === "function") initVocabTooltip();
  if (typeof initSpeechPractice === "function") initSpeechPractice();
  initDashboard();
});
