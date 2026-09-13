/**
 * @file grammar.js
 * @description OPIc 대비 문법 포인트 객관식 퀴즈 모드 컨트롤러
 * - 핵심 빈출 영문법(전치사, 시제, 조동사, 수일치 등) 퀴즈 렌더링
 * - 보기 선택 시 정답/오답 즉시 시각 피드백 및 상세 문법 해설 제공
 * - 예문 자동 TTS 발음 재생 및 Google AI 문법 질문 연동
 * - 로컬 스토리지를 통한 풀이 진도 및 오답 노트 영속화
 */

// =============================================================================
// 1. 문법 퀴즈 상태 변수 (State Management)
// =============================================================================

let wordSelectedCats = new Set(); // 선택된 문법 유형 세트 (예: "전치사", "시제" 등)
let wordOrder = []; // 현재 세트의 무작위 출제 인덱스 순서 배열
let wordCur = 0; // 현재 진행 중인 퀴즈 문항 인덱스
let wordResults = {}; // 채점 결과 매핑 { [itemIdx]: 'good' | 'bad' }
let wordAnswered = false; // 현재 문제의 보기 선택 완료 여부 플래그

// =============================================================================
// 2. 진행 상태 인디케이터 Dot 렌더러 (Progress Indicator)
// =============================================================================

/**
 * 상단 프로그레스 닷(Dot) 목록을 렌더링합니다.
 *
 * [UX 반응형 정책]:
 * - 전체 문항 수가 20개 이하일 경우: 각 문제별 Dot 아이콘을 표시하여 진행 상황 시각화
 * - 전체 문항 수가 20개를 초과할 경우: 화면 넘침 방지를 위해 "진행: 5 / 30 (완료 4개)" 형태의 텍스트로 축약
 *
 * @returns {void}
 */
function buildWordDots() {
  els.wordProgressDots.innerHTML = "";
  const total = wordOrder.length;
  const maxDots = 20;

  if (total <= maxDots) {
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
  } else {
    const text = document.createElement("span");
    text.className = "progress-text";
    const doneCount = Object.keys(wordResults).length;
    text.textContent = `진행: ${wordCur + 1} / ${total} (완료 ${doneCount}개)`;
    els.wordProgressDots.appendChild(text);
  }
}

// =============================================================================
// 3. 문법 퀴즈 카드 렌더러 (Quiz Card Renderer)
// =============================================================================

/**
 * 현재 순서의 문법 객관식 퀴즈 카드를 화면에 표시합니다.
 *
 * [주요 처리 로직]:
 * 1. 실행 중인 오디오 정지
 * 2. 모든 문항 완주 시: 퀴즈 완료 화면(wordDoneScreen) 표시 및 틀린 문제만 다시 풀기 버튼 바인딩
 * 3. 문제 유형 라벨, 진행 번호, 문제 질문(prompt) 텍스트 바인딩
 * 4. 객관식 보기 버튼 목록 동적 생성 및 클릭 이벤트 바인딩
 * 5. 상단 프로그레스 닷 동기화
 *
 * @returns {void}
 */
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

// =============================================================================
// 4. 보기 선택 및 채점 피드백 (Option Selection & Feedback)
// =============================================================================

/**
 * 사용자가 객관식 보기를 클릭했을 때 정답 여부를 판정하고 상세 피드백을 노출합니다.
 *
 * [피드백 액션]:
 * 1. 정답이면 해당 버튼에 .correct, 오답이면 .wrong 클래스 부여 및 모든 보기 비활성화
 * 2. 상세 문법 설명 및 예문 팁(tipText) 노출
 * 3. 자동 TTS 옵션이 켜져 있을 경우 대표 예문 음성 자동 재생
 * 4. Google AI에 추가 질문할 수 있는 링크 버튼 표시
 * 5. 일별 학습 기록(dailyLog)에 1회 카운트 반영
 *
 * @param {string} opt - 사용자가 선택한 보기 문자열
 * @param {HTMLButtonElement} btn - 클릭된 보기 버튼 엘리먼트
 * @param {Object} item - 현재 문법 문항 데이터 객체
 * @returns {void}
 */
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

/**
 * 이전 번호의 문법 퀴즈 문항으로 되돌아갑니다.
 * @returns {void}
 */
function prevWordQuestion() {
  if (wordCur > 0) {
    wordCur--;
    saveWordProgress();
    renderWordCard();
  }
}

// =============================================================================
// 5. 세트 시작 및 상태 영속화 (Set Initialization & Storage)
// =============================================================================

/**
 * 선택된 문법 유형 문항들을 무작위 셔플하여 새로운 퀴즈 세트를 시작합니다.
 * @returns {void}
 */
function startWordPractice() {
  if (wordSelectedCats.size === 0) return;
  wordOrder = shuffle(
    WORD_ITEMS.map((_, i) => i).filter((i) =>
      wordSelectedCats.has(WORD_ITEMS[i].cat),
    ),
  );
  wordCur = 0;
  wordResults = {};
  saveWordProgress();
  if (typeof navigateTo === "function") {
    navigateTo("wordCard", {}, true);
    return;
  }
  hideAllScreens();
  els.wordCard.style.display = "block";
  renderWordCard();
}

/**
 * 문법 퀴즈 진행 상태(순서, 현재인덱스, 채점결과, 선택유형)를 로컬 스토리지에 저장합니다.
 * @returns {Promise<void>}
 */
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

/**
 * 로컬 스토리지에서 문법 퀴즈 진행 상태를 복원합니다.
 * @returns {Promise<void>}
 */
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
