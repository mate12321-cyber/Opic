/**
 * @file shortcuts.js
 * @description 데스크톱/랩톱 학습자를 위한 물리 키보드 단축키 매핑 핸들러
 *
 * =============================================================================
 * [단축키 설계 원칙 및 한/영 IME 완벽 대응]
 * =============================================================================
 * 1. 한/영 키 상태 무관: `e.code` 물리 키코드와 `e.key` 영문/한글 자모(P/ㅔ, K/ㅏ, R/ㄱ 등)를 동시 검사하여
 *    한글 입력 상태에서도 단축키가 100% 정상 작동하도록 설계
 * 2. 텍스트 입력창(textarea) 포커스 분기:
 *    - 작성 중 Enter: 줄바꿈 허용 (단, Ctrl+Enter / Cmd+Enter 또는 Shift 없는 Enter 시 채점 실행)
 *    - 입력창 비포커스 시: Space(발음 듣기), 1/G(잘함), 2/B(다시) 즉각 반응
 * 3. 6대 학습 모드별 단축키 지원:
 *    - [전역]: Esc (음성 재생/인식 즉시 중단)
 *    - [문장 연습]: Enter (정답 확인/채점), P/ㅔ (이전 문제), K/ㅏ (건너뛰기), R/ㄱ (재도전), Space (발음 듣기)
 *    - [문법 퀴즈]: 1~4 (보기 선택), Enter (다음 문제), Space (팁 발음)
 *    - [실전 OPIc]: Space (에바 질문 듣기), Enter (내 답변 채점), M/ㅡ (모범답안 토글)
 *    - [만능 패턴]: Enter (답변 채점), Space (원어민 전체 발음 듣기), R/ㄱ (재도전)
 *    - [필러 훈련]: Enter (다음 필러), Space (필러 발음 듣기)
 *    - [발화 연습]: Ctrl/Cmd+Enter (발화 채점)
 *
 * @author Kim Hyo-sang
 * @version 2.2.0
 */

// =============================================================================
// 1. 전역 keydown 이벤트 리스너 등록
// =============================================================================
document.addEventListener("keydown", (e) => {
  const isInputFocused = document.activeElement === els.userInput;

  // 1-1. 전역 Esc: 진행 중인 모든 음성 재생 및 마이크 인식 즉시 강제 중단
  if (e.key === "Escape" || e.code === "Escape") {
    stopTTS();
    if (typeof stopFillerMic === "function") stopFillerMic();
    if (listening && recognition) {
      recognition.stop();
      stopListeningUI();
    }
    return;
  }

  // 1-2. 키 식별자 정규화 헬퍼 (한/영 전환 및 넘패드 상태 동시 대응)
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

  // =============================================================================
  // 2. 문장 번역 연습 모드 단축키
  // =============================================================================
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

  // =============================================================================
  // 3. 문법 포인트 퀴즈 모드 단축키
  // =============================================================================
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

  // =============================================================================
  // 4. OPIc 실전 질문 & 답변 모드 단축키
  // =============================================================================
  const isOpicInputFocused = document.activeElement === els.opicUserInput;
  const isKeyM =
    e.code === "KeyM" || e.key === "m" || e.key === "M" || e.key === "ㅡ";
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

    if (isKeyM && !isOpicInputFocused) {
      e.preventDefault();
      toggleOpicModelAnswer();
      return;
    }

    if (!opicEvaluated) {
      // 채점 전 (모범답안을 봤거나 안 봤거나 모두 해당): Enter (내 답변 채점하기), K / ㅏ (건너뛰기), Space (에바 질문 듣기)
      if (isEnter && (!isOpicInputFocused || !e.shiftKey)) {
        e.preventDefault();
        evaluateOpicAnswer();
      } else if (isKeyK && !isOpicInputFocused) {
        e.preventDefault();
        skipOpic();
      } else if (isSpace && !isOpicInputFocused) {
        e.preventDefault();
        playEvaQuestion(false);
      }
    } else {
      // 이미 채점한 후:
      // - 입력창에서 Enter 입력 시: 수정된 답변으로 [다시 채점하기]
      // - 비포커스 상태 Enter: 1(잘했어요)과 동일하게 다음 문제로 이동
      if (isEnter && isOpicInputFocused && !e.shiftKey) {
        e.preventDefault();
        evaluateOpicAnswer();
      } else if (isGoodKey) {
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

  // =============================================================================
  // 5. 만능 패턴 훈련 모드 단축키
  // =============================================================================
  const patternCard = document.getElementById("patternCard");
  const isPatternInputFocused = document.activeElement === els.patternUserInput;
  if (patternCard && patternCard.style.display !== "none") {
    if (isEnter && (!isPatternInputFocused || !e.shiftKey)) {
      e.preventDefault();
      if (typeof evaluatePatternAnswer === "function") evaluatePatternAnswer();
      return;
    } else if (isKeyP && !isPatternInputFocused) {
      e.preventDefault();
      if (typeof prevPattern === "function") prevPattern();
      return;
    } else if (isKeyR && !isPatternInputFocused) {
      e.preventDefault();
      if (typeof retryPatternQuestion === "function") retryPatternQuestion();
      return;
    } else if (isSpace && !isPatternInputFocused) {
      e.preventDefault();
      if (els.patternTtsAllBtn) els.patternTtsAllBtn.click();
      return;
    }
  }

  // =============================================================================
  // 6. 필러 집중 훈련 모드 단축키
  // =============================================================================
  const fillerCard = document.getElementById("fillerCard");
  if (fillerCard && fillerCard.style.display !== "none") {
    if (isEnter) {
      e.preventDefault();
      if (typeof nextFiller === "function") nextFiller();
      return;
    } else if (isKeyP) {
      e.preventDefault();
      if (typeof prevFiller === "function") prevFiller();
      return;
    } else if (isSpace) {
      e.preventDefault();
      if (typeof playCurrentFillerTTS === "function") playCurrentFillerTTS();
      return;
    }
  }

  // =============================================================================
  // 7. 발화 연습 모드 단축키
  // =============================================================================
  const spCard = document.getElementById("speechPracticeCard");
  const spInput = document.getElementById("speechPracticeInput");
  if (spCard && spCard.style.display !== "none") {
    const isSpInputFocused = document.activeElement === spInput;
    if (
      (isEnter && !isSpInputFocused) ||
      ((e.ctrlKey || e.metaKey) && isEnter)
    ) {
      e.preventDefault();
      if (typeof evaluateSpeechPracticeAnswer === "function") {
        evaluateSpeechPracticeAnswer();
      }
      return;
    }
  }

  // =============================================================================
  // 8. 학습 완료 화면 단축키
  // =============================================================================
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
