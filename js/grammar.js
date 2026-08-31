// ── GRAMMAR POINT PRACTICE MODE ────────────────────────────────────
let wordSelectedCats = new Set();
let wordOrder = [];
let wordCur = 0;
let wordResults = {}; // idx -> 'good' | 'bad'
let wordAnswered = false;

function buildWordDots() {
  els.wordProgressDots.innerHTML = "";
  wordOrder.forEach((idx, i) => {
    const d = document.createElement("div");
    d.className =
      "dot" +
      (wordResults[idx] === "good"
        ? " done"
        : wordResults[idx] === "bad"
          ? " miss"
          : "") +
      (i === wordCur ? " cur" : "");
    els.wordProgressDots.appendChild(d);
  });
}

function renderWordCard() {
  stopTTS();
  if (wordCur >= wordOrder.length) {
    els.wordCard.style.display = "none";
    els.wordDoneScreen.classList.add("show");
    const good = wordOrder.filter((idx) => wordResults[idx] === "good").length;
    const wrongIndices = wordOrder.filter((idx) => wordResults[idx] === "bad");
    els.wordDoneSummary.textContent =
      `총 ${wordOrder.length}문제 중 ${good}문제를 맞혔어요.` +
      (wrongIndices.length
        ? ` 틀린 문제 ${wrongIndices.length}개는 아래에서 다시 연습해보세요.`
        : "");
    if (wrongIndices.length) {
      els.wordRetryWrongBtn.style.display = "block";
      els.wordRetryWrongBtn.textContent = `틀린 문제만 다시 풀기 (${wrongIndices.length}개)`;
      els.wordRetryWrongBtn.onclick = () => {
        wordOrder = shuffle(wrongIndices);
        wordCur = 0;
        els.wordDoneScreen.classList.remove("show");
        els.wordCard.style.display = "block";
        saveWordProgress();
        renderWordCard();
      };
    } else {
      els.wordRetryWrongBtn.style.display = "none";
    }
    return;
  }

  els.wordCard.style.display = "block";
  els.wordDoneScreen.classList.remove("show");
  const item = WORD_ITEMS[wordOrder[wordCur]];
  els.wordCatLabel.textContent = item.cat;
  els.wordIdxLabel.textContent = `${String(wordCur + 1).padStart(2, "0")} / ${String(wordOrder.length).padStart(2, "0")}`;
  els.wordSentence.textContent = item.prompt;
  els.wordExplain.classList.remove("show");
  els.wordExplain.textContent = "";
  els.wordGoogleAskRow.style.display = "none";
  els.wordNextRow.style.display = "none";
  wordAnswered = false;

  els.wordOptions.innerHTML = "";
  item.options.forEach((opt, optIdx) => {
    const btn = document.createElement("button");
    btn.className = "word-opt";
    btn.dataset.option = opt;
    btn.innerHTML = `<span class="opt-num-badge">${optIdx + 1}</span> <span>${escapeHtml(opt)}</span>`;
    btn.onclick = () => selectWordOption(opt, btn, item);
    els.wordOptions.appendChild(btn);
  });

  buildWordDots();
}

function selectWordOption(opt, btn, item) {
  if (wordAnswered) return;
  wordAnswered = true;
  const isCorrect = opt === item.answer;
  wordResults[wordOrder[wordCur]] = isCorrect ? "good" : "bad";
  saveWordProgress();
  logPracticeEvent();

  Array.from(els.wordOptions.children).forEach((b) => {
    b.classList.add("disabled");
    if (b.dataset.option === item.answer) b.classList.add("correct");
    else if (b === btn) b.classList.add("wrong");
  });

  els.wordExplain.textContent = item.tip;
  els.wordExplain.classList.add("show");
  els.wordGoogleAskRow.style.display = "flex";
  els.wordNextRow.style.display = "flex";
  buildWordDots();

  if (autoPlayTtsEnabled) {
    const match = item.tip && item.tip.match(/예\)\s*([^.]+)/);
    const speechText = match ? match[1].trim() : item.answer;
    speakText(speechText, "en-US", els.ttsWordBtn);
  }
}

function startWordPractice() {
  if (wordSelectedCats.size === 0) return;
  wordOrder = shuffle(
    WORD_ITEMS.map((_, i) => i).filter((i) => wordSelectedCats.has(WORD_ITEMS[i].cat)),
  );
  wordCur = 0;
  wordResults = {};
  hideAllScreens();
  els.wordCard.style.display = "block";
  saveWordProgress();
  renderWordCard();
}

async function saveWordProgress() {
  try {
    const data = {
      wordOrder,
      wordCur,
      wordResults,
      cats: Array.from(wordSelectedCats),
    };
    await storage.set(WORD_STORAGE_KEY, JSON.stringify(data), false);
  } catch (e) {
    /* best effort */
  }
}

async function loadWordProgress() {
  try {
    const res = await storage.get(WORD_STORAGE_KEY, false);
    if (res && res.value) {
      const data = JSON.parse(res.value);
      wordResults = data.wordResults || {};
      if (Array.isArray(data.cats) && data.cats.length) {
        wordSelectedCats = new Set(
          data.cats.filter((c) => WORD_CATEGORIES.includes(c)),
        );
      }
      if (
        Array.isArray(data.wordOrder) &&
        data.wordOrder.length &&
        data.wordOrder.every((i) => i >= 0 && i < WORD_ITEMS.length)
      ) {
        wordOrder = data.wordOrder;
        wordCur = data.wordCur || 0;
      }
    }
  } catch (e) {
    /* no saved progress */
  }
}
