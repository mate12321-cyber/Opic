/**
 * [shortcuts.js] 맥북 / PC 데스크톱 키보드 단축키 핸들러
 * - 전역: Esc (음성 재생/인식 중단)
 * - 문장 연습: Enter (정답 확인), 1/2 (채점), Space (발음 듣기), R (재도전)
 * - 문법 퀴즈: 1~4 (보기 선택), Enter (다음 문제), Space (발음 듣기)
 * - 완료 화면: Enter (같은 주제 다시 시작)
 */

document.addEventListener("keydown", (e) => {
  const isInputFocused = document.activeElement === els.userInput;

  // 1. 전역 Esc: 음성 재생 및 마이크 인식 즉시 중단
  if (e.key === "Escape") {
    stopTTS();
    if (listening && recognition) {
      recognition.stop();
      stopListeningUI();
    }
    return;
  }

  // 2. 문장 번역 연습 모드 단축키
  if (
    els.practiceCard &&
    els.practiceCard.style.display !== "none" &&
    !els.doneScreen.classList.contains("show")
  ) {
    const item = SENTENCES[order[cur]];
    if (!revealed) {
      // 정답 확인 전: Enter 키로 정답 공개
      if (e.key === "Enter" && (!isInputFocused || !e.shiftKey)) {
        e.preventDefault();
        reveal();
      }
    } else {
      // 정답 확인 후: 1(잘함), 2(다시), R(재도전), Space(발음 듣기)
      if (
        e.key === "1" ||
        e.key === "g" ||
        e.key === "G" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        rate("good");
      } else if (
        e.key === "2" ||
        e.key === "b" ||
        e.key === "B" ||
        e.key === "ArrowLeft"
      ) {
        e.preventDefault();
        rate("bad");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        retrySameQuestion();
      } else if (e.code === "Space" && !isInputFocused) {
        e.preventDefault();
        if (item) speakText(item.en, "en-US", els.ttsEnBtn);
      } else if (e.key === "Enter" && !isInputFocused) {
        e.preventDefault();
        rate("good");
      }
    }
  }

  // 3. 문법 포인트 퀴즈 모드 단축키
  if (
    els.wordCard &&
    els.wordCard.style.display !== "none" &&
    !els.wordDoneScreen.classList.contains("show")
  ) {
    const item = WORD_ITEMS[wordOrder[wordCur]];
    if (!wordAnswered) {
      // 문제 풀이 중: 숫자 키 1~4로 보기 선택
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const optBtns = els.wordOptions.querySelectorAll(".word-opt");
        if (optBtns[idx] && item && item.options[idx]) {
          e.preventDefault();
          selectWordOption(item.options[idx], optBtns[idx], item);
        }
      }
    } else {
      // 해설 노출 후: Enter(다음 문제), Space(발음 듣기)
      if (e.key === "Enter") {
        e.preventDefault();
        wordCur++;
        saveWordProgress();
        renderWordCard();
      } else if (e.code === "Space") {
        e.preventDefault();
        if (item) {
          const match = item.tip && item.tip.match(/예\)\s*([^.]+)/);
          const speechText = match ? match[1].trim() : item.answer;
          speakText(speechText, "en-US", els.ttsWordBtn);
        }
      }
    }
  }

  // 4. 완료 화면 단축키
  if (els.doneScreen && els.doneScreen.classList.contains("show")) {
    if (e.key === "Enter") {
      e.preventDefault();
      startPractice();
    }
  }
  if (els.wordDoneScreen && els.wordDoneScreen.classList.contains("show")) {
    if (e.key === "Enter") {
      e.preventDefault();
      startWordPractice();
    }
  }
});
