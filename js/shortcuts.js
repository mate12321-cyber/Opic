// ── KEYBOARD SHORTCUTS CONTROLLER ─────────────────────────────────
document.addEventListener("keydown", (e) => {
  const isInputFocused = document.activeElement === els.userInput;

  // Global Esc to stop audio / recognition
  if (e.key === "Escape") {
    stopTTS();
    if (listening && recognition) {
      recognition.stop();
      stopListeningUI();
    }
    return;
  }

  // 1. Sentence Practice Card
  if (
    els.practiceCard &&
    els.practiceCard.style.display !== "none" &&
    !els.doneScreen.classList.contains("show")
  ) {
    const item = SENTENCES[order[cur]];
    if (!revealed) {
      if (e.key === "Enter" && (!isInputFocused || !e.shiftKey)) {
        e.preventDefault();
        reveal();
      }
    } else {
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

  // 2. Grammar / Word Practice Card
  if (
    els.wordCard &&
    els.wordCard.style.display !== "none" &&
    !els.wordDoneScreen.classList.contains("show")
  ) {
    const item = WORD_ITEMS[wordOrder[wordCur]];
    if (!wordAnswered) {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const optBtns = els.wordOptions.querySelectorAll(".word-opt");
        if (optBtns[idx] && item && item.options[idx]) {
          e.preventDefault();
          selectWordOption(item.options[idx], optBtns[idx], item);
        }
      }
    } else {
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

  // 3. Done Screens
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
