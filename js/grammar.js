/**
 * [grammar.js] 문법 포인트 퀴즈 모드 컨트롤러
 * - 객관식 퀴즈 문항 셔플 및 진행 상태(wordCur, wordResults) 관리
 * - 퀴즈 카드 및 프로그레스 닷(Dot) 렌더링
 * - 보기 선택(selectWordOption) 시 정답/오답 즉시 피드백 및 상세 해설 제공
 * - 로컬 스토리지를 통한 진행 상태 저장/복원
 */

let wordSelectedCats = new Set(); // 선택된 문법 유형 세트
let wordOrder = []; // 출제 인덱스 순서 배열
let wordCur = 0; // 현재 문제 인덱스
let wordResults = {}; // 채점 결과 { itemIndex: 'good' | 'bad' }
let wordAnswered = false; // 답변 완료 여부 플래그

// 문법 퀴즈 진행 상태 인디케이터 점(Dot) 목록 생성
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

// 현재 순서의 문법 퀴즈 카드 렌더링 (세트 종료 시 완료 화면 표시)
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
  if (els.btnPrevWord) {
    els.btnPrevWord.disabled = wordCur === 0;
  }
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

// 퀴즈 보기 선택 시 채점, 해설 노출 및 자동 발음 실행
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

// 이전 문제로 되돌아가기
function prevWordQuestion() {
  if (wordCur > 0) {
    wordCur--;
    saveWordProgress();
    renderWordCard();
  }
}

// 선택된 유형의 문법 문항들로 새 연습 세트 시작
function startWordPractice() {
  if (wordSelectedCats.size === 0) return;
  wordOrder = shuffle(
    WORD_ITEMS.map((_, i) => i).filter((i) =>
      wordSelectedCats.has(WORD_ITEMS[i].cat),
    ),
  );
  wordCur = 0;
  wordResults = {};
  hideAllScreens();
  els.wordCard.style.display = "block";
  saveWordProgress();
  renderWordCard();
}

// 문법 퀴즈 진행 상태를 로컬 스토리지에 저장
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

// 로컬 스토리지에서 문법 퀴즈 진행 상태를 복원
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
