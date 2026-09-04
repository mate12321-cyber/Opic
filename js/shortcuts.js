/**
 * [shortcuts.js] 맥북 / PC 데스크톱 키보드 단축키 핸들러
 * - 한/영 입력 상태 모두 지원 (e.code 및 한글 자모/영문 동시 매핑)
 * - 전역: Esc (음성 재생/인식 중단)
 * - 문장 연습: Enter (정답 확인), P / ㅔ (이전 문제), K / ㅏ (건너뛰기), 1/2 또는 G/B (채점), Space (발음 듣기), R / ㄱ (재도전)
 * - 문법 퀴즈: 1~4 (보기 선택), P / ㅔ (이전 문제), Enter (다음 문제), Space (발음 듣기)
 * - 실전 질문: Enter (모범답안 확인), P / ㅔ (이전 질문), K / ㅏ (건너뛰기), 1/2 또는 G/B (채점), Space (발음 듣기), R / ㄱ (재도전)
 * - 완료 화면: Enter (같은 주제 다시 시작)
 */

document.addEventListener("keydown", (e) => {
  const isInputFocused = document.activeElement === els.userInput;

  // 1. 전역 Esc: 음성 재생 및 마이크 인식 즉시 중단
  if (e.key === "Escape" || e.code === "Escape") {
    stopTTS();
    if (listening && recognition) {
      recognition.stop();
      stopListeningUI();
    }
    return;
  }

  // 키 식별자 헬퍼 (한/영 전환 상태 모두 대응)
  const isEnter =
    e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter";
  const isSpace = e.code === "Space" || e.key === " ";
  const isKeyP =
    e.code === "KeyP" || e.key === "p" || e.key === "P" || e.key === "ㅔ";
  const isKeyK =
    e.code === "KeyK" || e.key === "k" || e.key === "K" || e.key === "ㅏ";
  const isKeyR =
    e.code === "KeyR" ||
    e.key === "r" ||
    e.key === "R" ||
    e.key === "ㄱ" ||
    e.key === "ㄲ";
  const isGoodKey =
    e.code === "Digit1" ||
    e.code === "Numpad1" ||
    e.key === "1" ||
    e.code === "KeyG" ||
    e.key === "g" ||
    e.key === "G" ||
    e.key === "ㅎ";
  const isBadKey =
    e.code === "Digit2" ||
    e.code === "Numpad2" ||
    e.key === "2" ||
    e.code === "KeyB" ||
    e.key === "b" ||
    e.key === "B" ||
    e.key === "ㅠ";

  // 2. 문장 번역 연습 모드 단축키
  if (
    els.practiceCard &&
    els.practiceCard.style.display !== "none" &&
    !els.doneScreen.classList.contains("show")
  ) {
    const item = SENTENCES[order[cur]];
    if (!isInputFocused && isKeyP && cur > 0) {
      e.preventDefault();
      prevQuestion();
      return;
    }

    if (!revealed) {
      // 정답 확인 전: Enter(정답 공개), K / ㅏ(건너뛰기)
      if (isEnter && (!isInputFocused || !e.shiftKey)) {
        e.preventDefault();
        reveal();
      } else if (isKeyK && !isInputFocused) {
        e.preventDefault();
        skip();
      }
    } else {
      // 정답 확인 후: 1/G/ㅎ(잘함), 2/B/ㅠ(다시), R/ㄱ(재도전), K/ㅏ(건너뛰기), Space(발음 듣기)
      if (isGoodKey) {
        e.preventDefault();
        rate("good");
      } else if (isBadKey) {
        e.preventDefault();
        rate("bad");
      } else if (isKeyR) {
        e.preventDefault();
        retrySameQuestion();
      } else if (isKeyK) {
        e.preventDefault();
        skip();
      } else if (isSpace && !isInputFocused) {
        e.preventDefault();
        if (item) speakText(item.en, "en-US", els.ttsEnBtn);
      } else if (isEnter && !isInputFocused) {
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
    if (isKeyP && wordCur > 0) {
      e.preventDefault();
      prevWordQuestion();
      return;
    }

    if (!wordAnswered) {
      // 문제 풀이 중: 숫자 키 1~4로 보기 선택 (한/영 및 넘패드 지원)
      let numIdx = -1;
      if (e.key === "1" || e.code === "Digit1" || e.code === "Numpad1")
        numIdx = 0;
      else if (e.key === "2" || e.code === "Digit2" || e.code === "Numpad2")
        numIdx = 1;
      else if (e.key === "3" || e.code === "Digit3" || e.code === "Numpad3")
        numIdx = 2;
      else if (e.key === "4" || e.code === "Digit4" || e.code === "Numpad4")
        numIdx = 3;

      if (numIdx !== -1) {
        const optBtns = els.wordOptions.querySelectorAll(".word-opt");
        if (optBtns[numIdx] && item && item.options[numIdx]) {
          e.preventDefault();
          selectWordOption(item.options[numIdx], optBtns[numIdx], item);
        }
      }
    } else {
      // 해설 노출 후: Enter(다음 문제), Space(발음 듣기)
      if (isEnter) {
        e.preventDefault();
        wordCur++;
        saveWordProgress();
        renderWordCard();
      } else if (isSpace) {
        e.preventDefault();
        if (item) {
          const match = item.tip && item.tip.match(/예\)\s*([^.]+)/);
          const speechText = match ? match[1].trim() : item.answer;
          speakText(speechText, "en-US", els.ttsWordBtn);
        }
      }
    }
  }

  // 4. OPIc 실전 질문 & 답변 모드 단축키
  const isOpicInputFocused = document.activeElement === els.opicUserInput;
  if (
    els.opicCard &&
    els.opicCard.style.display !== "none" &&
    !els.opicDoneScreen.classList.contains("show")
  ) {
    const item = OPIC_QUESTIONS[opicOrder[opicCur]];
    if (!isOpicInputFocused && isKeyP && opicCur > 0) {
      e.preventDefault();
      prevOpicQuestion();
      return;
    }

    if (!opicRevealed) {
      // 모범 답안 확인 전: Enter(모범답안 공개), K / ㅏ(건너뛰기), Space(에바 질문 다시 듣기)
      if (isEnter && (!isOpicInputFocused || !e.shiftKey)) {
        e.preventDefault();
        revealOpic();
      } else if (isKeyK && !isOpicInputFocused) {
        e.preventDefault();
        skipOpic();
      } else if (isSpace && !isOpicInputFocused) {
        e.preventDefault();
        playEvaQuestion(false);
      }
    } else {
      // 모범 답안 확인 후: 1/G/ㅎ(잘함), 2/B/ㅠ(다시), R/ㄱ(재도전), K/ㅏ(건너뛰기), Space(모범답안 듣기)
      if (isGoodKey) {
        e.preventDefault();
        rateOpic("good");
      } else if (isBadKey) {
        e.preventDefault();
        rateOpic("bad");
      } else if (isKeyR) {
        e.preventDefault();
        retrySameOpicQuestion();
      } else if (isKeyK) {
        e.preventDefault();
        skipOpic();
      } else if (isSpace && !isOpicInputFocused) {
        e.preventDefault();
        if (item) speakText(item.answer_en, "en-US", els.ttsOpicAllBtn);
      } else if (isEnter && !isOpicInputFocused) {
        e.preventDefault();
        rateOpic("good");
      }
    }
  }

  // 5. 완료 화면 단축키
  if (els.doneScreen && els.doneScreen.classList.contains("show")) {
    if (isEnter) {
      e.preventDefault();
      startPractice();
    }
  }
  if (els.wordDoneScreen && els.wordDoneScreen.classList.contains("show")) {
    if (isEnter) {
      e.preventDefault();
      startWordPractice();
    }
  }
  if (els.opicDoneScreen && els.opicDoneScreen.classList.contains("show")) {
    if (isEnter) {
      e.preventDefault();
      startOpicPractice(false);
    }
  }
});
