/**
 * [practice.js] 문장 번역 연습 모드 컨트롤러
 * - 문제 순서 셔플 및 진행 상태(cur, results, revealed) 관리
 * - 문장 카드 및 프로그레스 닷(Dot) 렌더링
 * - 정답 확인(reveal), 채점(rate), 건너뛰기(skip), 재도전(retrySameQuestion)
 * - 로컬 스토리지를 통한 진행 상태 저장/복원
 */

let selectedCats = new Set(); // 선택된 카테고리 세트
let order = [];               // 출제 인덱스 순서 배열
let cur = 0;                  // 현재 문제 인덱스
let results = {};             // 채점 결과 { sentenceIndex: 'good' | 'bad' }
let revealed = false;         // 정답 확인 여부 플래그

// 상단 진행 상태 인디케이터 점(Dot) 목록 생성
function buildDots() {
  els.progressDots.innerHTML = "";
  order.forEach((idx, i) => {
    const d = document.createElement("div");
    d.className =
      "dot" +
      (results[idx] === "good"
        ? " done"
        : results[idx] === "bad"
          ? " miss"
          : "") +
      (i === cur ? " cur" : "");
    els.progressDots.appendChild(d);
  });
}

// 현재 순서의 문장 카드를 렌더링 (세트 종료 시 완료 화면 표시)
function renderCard() {
  stopTTS();
  clearMicError();
  if (cur >= order.length) {
    els.practiceCard.style.display = "none";
    els.doneScreen.classList.add("show");
    const good = order.filter((idx) => results[idx] === "good").length;
    const wrongIndices = order.filter((idx) => results[idx] === "bad");
    els.doneSummary.textContent =
      `총 ${order.length}문제 중 ${good}문제를 맞혔어요.` +
      (wrongIndices.length
        ? ` 틀린 문장 ${wrongIndices.length}개는 아래에서 다시 연습해보세요.`
        : "");
    if (wrongIndices.length) {
      els.retryWrongBtn.style.display = "block";
      els.retryWrongBtn.textContent = `틀린 문제만 다시 풀기 (${wrongIndices.length}개)`;
      els.retryWrongBtn.onclick = () => {
        order = shuffle(wrongIndices);
        cur = 0;
        els.doneScreen.classList.remove("show");
        els.practiceCard.style.display = "block";
        saveProgress();
        renderCard();
      };
    } else {
      els.retryWrongBtn.style.display = "none";
    }
    return;
  }

  els.practiceCard.style.display = "block";
  els.doneScreen.classList.remove("show");
  const item = SENTENCES[order[cur]];
  els.catLabel.textContent = item.cat;
  els.idxLabel.textContent = `${String(cur + 1).padStart(2, "0")} / ${String(order.length).padStart(2, "0")}`;
  els.koText.textContent = item.ko;
  els.enText.textContent = item.en;
  els.tipText.textContent = item.tip ? `💡 ${item.tip}` : "";
  els.tipText.style.display = item.tip ? "block" : "none";
  els.userInput.value = "";
  els.answerBox.classList.remove("show");
  els.grammarBox.classList.remove("show");
  els.grammarContent.innerHTML = "";
  els.liveTranslate.classList.remove("show");
  els.liveTranslateText.textContent = "";
  if (els.speechEvalBox) els.speechEvalBox.classList.remove("show");
  els.revealRow.style.display = "flex";
  els.rateRow.style.display = "none";
  els.retrySameLink.style.display = "none";
  revealed = false;
  buildDots();
}

// 모범 답안 공개, 자동 발음 재생, 일치도 채점 및 문법 검사 트리거
function reveal() {
  if (revealed) return;
  revealed = true;
  els.answerBox.classList.add("show");
  els.revealRow.style.display = "none";
  els.rateRow.style.display = "flex";
  els.retrySameLink.style.display = "block";

  const userText = els.userInput.value.trim();
  const currentSentence = SENTENCES[order[cur]];

  if (autoPlayTtsEnabled && currentSentence) {
    speakText(currentSentence.en, "en-US", els.ttsEnBtn);
  }

  if (userText && currentSentence) {
    const evalData = evaluateSpeech(userText, currentSentence.en);
    renderSpeechEvaluation(evalData);
  }

  if (userText) {
    checkGrammar(userText).then((matches) => {
      renderGrammarResults(matches, userText);
    });
  }
}

// 현재 문제를 채점 전 상태로 리셋하고 다시 풀기
function retrySameQuestion() {
  stopTTS();
  delete results[order[cur]];
  revealed = false;
  els.answerBox.classList.remove("show");
  els.grammarBox.classList.remove("show");
  els.grammarContent.innerHTML = "";
  els.liveTranslate.classList.remove("show");
  els.liveTranslateText.textContent = "";
  if (els.speechEvalBox) els.speechEvalBox.classList.remove("show");
  els.revealRow.style.display = "flex";
  els.rateRow.style.display = "none";
  els.retrySameLink.style.display = "none";
  els.userInput.value = "";
  buildDots();
  els.userInput.focus();
}

// 문제 채점 ('good' | 'bad') 후 다음 문제로 진행
function rate(val) {
  results[order[cur]] = val;
  cur++;
  saveProgress();
  logPracticeEvent();
  renderCard();
}

// 채점 없이 다음 문제로 건너뛰기
function skip() {
  cur++;
  saveProgress();
  renderCard();
}

// 선택된 주제의 문장들로 새 연습 세트 시작
function startPractice() {
  if (selectedCats.size === 0) return;
  order = shuffle(
    SENTENCES.map((_, i) => i).filter((i) => selectedCats.has(SENTENCES[i].cat)),
  );
  cur = 0;
  results = {};
  hideAllScreens();
  els.practiceCard.style.display = "block";
  saveProgress();
  renderCard();
}

// 문장 번역 연습 진행 상태를 로컬 스토리지에 저장
async function saveProgress() {
  try {
    const data = {
      order,
      cur,
      results,
      cats: Array.from(selectedCats),
    };
    await storage.set(STORAGE_KEY, JSON.stringify(data), false);
  } catch (e) {
    /* best effort */
  }
}

// 로컬 스토리지에서 문장 번역 연습 진행 상태를 복원
async function loadProgress() {
  try {
    const res = await storage.get(STORAGE_KEY, false);
    if (res && res.value) {
      const data = JSON.parse(res.value);
      results = data.results || {};
      if (Array.isArray(data.cats) && data.cats.length) {
        selectedCats = new Set(
          data.cats.filter((c) => CATEGORIES.includes(c)),
        );
      }
      if (
        Array.isArray(data.order) &&
        data.order.length &&
        data.order.every((i) => i >= 0 && i < SENTENCES.length)
      ) {
        order = data.order;
        cur = data.cur || 0;
      }
    }
  } catch (e) {
    /* no saved progress */
  }
}
