/**
 * @file practice.js
 * @description [모드 1] 한→영 문장 변환 연습 모드 컨트롤러
 * - 주제별 문항 무작위 셔플 및 진행 상태(cur, results, revealed) 관리
 * - 문장 카드, 상단 프로그레스 닷(Dot), 사용자 작성 답변 캐시 복원
 * - 정답 확인(reveal), 만족/미흡 채점(rate), 건너뛰기(skip), 재도전(retrySameQuestion)
 * - 로컬 스토리지를 통한 진행 상태 자동 저장 및 복원
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 *
 * --------------------------------------------------------------------------------
 * 💡 [확장성 및 유지보수 가이드 (Scalability & Customization Guide)]
 * 1. 목표 등급별 문장 세트 분기:
 *    - 현재 `SENTENCES` 배열(IM1 전용)을 직접 순회하도록 결합되어 있습니다.
 *    - IH/AL 문장(더 긴 복문, 관계대명사/분사구문, 고급 접속사) 확장 시:
 *      각 문장에 `level: "IM1" | "IM2" | "IH" | "AL"` 속성을 추가하여 주제 선택 화면에서
 *      난이도별 필터링이 가능하도록 구성하거나, `targetLevel` 상태에 따라 데이터 소스를 전환합니다.
 *
 * 2. 나만의 커스텀 문장장 (User Custom Sentences):
 *    - 사용자가 직접 자신이 자주 쓰는 문장(예: 내 실제 업무, 내 실제 전공 등)을 등록하면
 *      localStorage의 `ko-en-opic-custom-sentences`에 저장하고, `SENTENCES` 배열에
 *      `cat: "나만의 문장"` 카테고리로 동적 추가되도록 확장할 수 있습니다.
 * --------------------------------------------------------------------------------
 */

// =============================================================================
// 1. 상태 변수 및 사용자 입력 캐시 (State Management)
// =============================================================================

let selectedCats = new Set(); // 선택된 카테고리 세트
let order = []; // 현재 연습 세트의 무작위 출제 인덱스 순서 배열
let cur = 0; // 현재 진행 중인 문제 인덱스
let results = {}; // 채점 결과 매핑 { [sentenceIdx]: 'good' | 'bad' }
let revealed = false; // 현재 문제의 모범답안 공개 여부 플래그
let savedUserInputs = {}; // 문제별 사용자가 작성한 영문 텍스트 캐시 { [sentenceIdx]: string }

// =============================================================================
// 2. 진행 상태 인디케이터 Dot 렌더러 (Progress Dots)
// =============================================================================

/**
 * 상단 프로그레스 닷(Dot) 목록을 렌더링합니다.
 *
 * [UX 반응형 정책]:
 * - 전체 문제 수가 20개 이하인 경우: 개별 Dot 원형 아이콘을 순서대로 표시 (완료: 녹색, 틀림: 빨강, 현재: 테두리 강조)
 * - 전체 문제 수가 20개를 초과할 경우: 화면 넘침 방지를 위해 "진행: 15 / 45 (완료 12개)" 형태의 간결한 텍스트로 축약
 *
 * @returns {void}
 */
function buildDots() {
  els.progressDots.innerHTML = "";
  const total = order.length;
  const maxDots = 20;

  if (total <= maxDots) {
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
  } else {
    const text = document.createElement("span");
    text.className = "progress-text";
    const doneCount = Object.keys(results).length;
    text.textContent = `진행: ${cur + 1} / ${total} (완료 ${doneCount}개)`;
    els.progressDots.appendChild(text);
  }
}

// =============================================================================
// 3. 문장 연습 카드 렌더러 (Sentence Card Renderer)
// =============================================================================

/**
 * 현재 순서의 문장 카드를 화면에 표시합니다.
 *
 * [주요 처리 로직]:
 * 1. 실행 중인 TTS 음성 및 마이크 에러 메시지 초기화
 * 2. 모든 문항 완주 시: 완료 화면(doneScreen)으로 전환하고 맞힌 개수 / 오답 재도전 버튼 표시
 * 3. 현재 문항 데이터(카테고리, 한국어 제시문, 모범 영작, 문법 팁) UI 바인딩
 * 4. 사용자가 이전에 작성한 답변이 있다면 복원하고 높이 자동 조절
 * 5. 이미 풀었던 문제로 되돌아왔을 경우 이전 채점 결과 및 모범답안 상태 복원
 *
 * @returns {void}
 */
function renderCard() {
  // [정리] 이전 문항에서 실행 중이던 TTS 음성 정지 및 마이크 에러 UI 초기화
  stopTTS();
  clearMicError();

  // [상태 분기] 현재 세트의 모든 문항을 완주한 경우 (cur >= order.length)
  if (cur >= order.length) {
    els.practiceCard.style.display = "none";
    els.doneScreen.classList.add("show");

    // [통계 집계] 'good'(만족) 및 'bad'(미흡/오답) 문항 인덱스 추출
    const good = order.filter((idx) => results[idx] === "good").length;
    const wrongIndices = order.filter((idx) => results[idx] === "bad");

    els.doneSummary.textContent =
      `총 ${order.length}문제 중 ${good}문제를 맞혔어요.` +
      (wrongIndices.length
        ? ` 틀린 문장 ${wrongIndices.length}개는 아래에서 다시 연습해보세요.`
        : "");

    // [UX 정책] 틀린 문항이 1개 이상 존재할 때만 '틀린 문제만 다시 풀기' 버튼 활성화
    if (wrongIndices.length) {
      els.retryWrongBtn.style.display = "block";
      els.retryWrongBtn.textContent = `틀린 문제만 다시 풀기 (${wrongIndices.length}개)`;
      els.retryWrongBtn.onclick = () => {
        // [재도전 정책] 틀린 문항들만 추출하여 다시 무작위 셔플 후 인덱스를 0으로 초기화
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

  // [UX 제어] 첫 번째 문제에서도 '이전' 클릭 시 주제 선택 화면으로 이동 가능하도록 항상 활성화
  if (els.btnPrevSentence) {
    els.btnPrevSentence.disabled = false;
    els.btnPrevSentence.title =
      cur === 0 ? "주제 선택 목록으로 돌아가기 (P)" : "이전 문제 (P)";
  }

  // [데이터 바인딩] 현재 출제 순서(order[cur])에 해당하는 문장 데이터 매핑
  const item = SENTENCES[order[cur]];
  els.catLabel.textContent = item.cat;
  els.idxLabel.textContent = `${String(cur + 1).padStart(2, "0")} / ${String(order.length).padStart(2, "0")}`;
  els.koText.textContent = item.ko;
  els.enText.textContent = item.en;
  els.tipText.textContent = item.tip ? `💡 ${item.tip}` : "";
  els.tipText.style.display = item.tip ? "block" : "none";

  // [입력값 복원] 사용자가 이전에 타이핑했거나 음성 입력한 내용이 있으면 복원 및 높이 동기화
  const previousInput = savedUserInputs[order[cur]] || "";
  els.userInput.value = previousInput;
  if (typeof autoResizeTextarea === "function") {
    // [동적 UI] 복원된 텍스트 길이에 맞춰 텍스트에어리어 높이 즉시 재계산 (스크롤바 깜빡임 방지)
    autoResizeTextarea(els.userInput);
  }

  // [화면 상태 초기화] 이전 문제의 정답창, 문법 피드백, 발음 평가 UI 닫기
  els.answerBox.classList.remove("show");
  els.grammarBox.classList.remove("show");
  els.grammarContent.innerHTML = "";
  els.liveTranslate.classList.remove("show");
  els.liveTranslateText.textContent = "";
  if (els.speechEvalBox) els.speechEvalBox.classList.remove("show");

  // [상태 복원 정책] 이미 풀었던 문제로 되돌아왔을 경우:
  // 정답 확인 버튼 대신 채점 버튼(good/bad)과 다시 풀기 링크를 즉시 노출
  if (results[order[cur]]) {
    revealed = true;
    els.answerBox.classList.add("show");
    els.revealRow.style.display = "none";
    els.rateRow.style.display = "flex";
    els.retrySameLink.style.display = "block";
  } else {
    // 아직 풀지 않은 신규 문항인 경우 정답 확인 버튼 노출
    revealed = false;
    els.revealRow.style.display = "flex";
    els.rateRow.style.display = "none";
    els.retrySameLink.style.display = "none";
  }
  buildDots();
}

// =============================================================================
// 4. 정답 확인 및 채점/피드백 액션 (Practice Actions & Assessment)
// =============================================================================

/**
 * 모범 답안을 공개하고, 자동 TTS 재생, 발음 일치도 채점 및 문법 검사를 비동기 트리거합니다.
 * @returns {void}
 */
function reveal() {
  if (revealed) return;
  revealed = true;
  els.answerBox.classList.add("show");
  els.revealRow.style.display = "none";
  els.rateRow.style.display = "flex";
  els.retrySameLink.style.display = "block";

  const userText = els.userInput.value.trim();
  const currentSentence = SENTENCES[order[cur]];

  // [피드백 정책 1: 원어민 발음 자동 청취]
  // 사용자가 설정에서 자동 재생을 켜둔 경우, 정답 확인과 동시에 모범 문장 TTS를 재생하여 청각적 피드백 제공
  if (autoPlayTtsEnabled && currentSentence) {
    speakText(currentSentence.en, "en-US", els.ttsEnBtn);
  }

  // [피드백 정책 2: 발음 및 문장 일치도 채점]
  // 사용자가 직접 입력한 답변과 모범 답변 사이의 단어 레벨 Diff, Levenshtein 유사도 및 점수를 산출하여 시각화
  if (currentSentence) {
    renderPronunciationAssessment({
      boxEl: els.speechEvalBox,
      badgeEl: els.evalScoreBadge,
      diffEl: els.evalDiff,
      feedbackEl: els.evalFeedback,
      mode: "practice",
      referenceText: currentSentence.en,
      userText: userText,
      voiceBtn: els.ttsUserInputBtn,
    });
  }

  // [피드백 정책 3: 영문법 오류 자동 검출 (LanguageTool 연동)]
  // 사용자가 작성한 문장이 존재할 때만 외부 API를 비동기 호출하여 스펠링/시제/전치사 오류를 검출
  if (userText) {
    checkGrammar(userText).then((matches) => {
      renderGrammarResults(matches, userText);
    });
  }
}

/**
 * 현재 문제를 채점 전 초기 상태로 되돌리고 재입력할 수 있도록 리셋합니다.
 * @returns {void}
 */
function retrySameQuestion() {
  stopTTS();
  clearRecordedVoice("practice");
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

/**
 * 문제에 대해 'good'(정답/만족) 또는 'bad'(오답/미흡)을 기록하고 다음 문항으로 진행합니다.
 * @param {'good' | 'bad'} val - 채점 등급
 * @returns {void}
 */
function rate(val) {
  clearRecordedVoice("practice");
  savedUserInputs[order[cur]] = els.userInput.value.trim();
  results[order[cur]] = val;
  cur++;
  saveProgress();
  logPracticeEvent();
  renderCard();
}

/**
 * 채점 없이 현재 문항을 넘어가고 다음 문제로 이동합니다.
 * @returns {void}
 */
function skip() {
  savedUserInputs[order[cur]] = els.userInput.value.trim();
  cur++;
  saveProgress();
  renderCard();
}

/**
 * 이전 번호의 문항으로 되돌아갑니다.
 * @returns {void}
 */
function prevQuestion() {
  if (cur > 0) {
    savedUserInputs[order[cur]] = els.userInput.value.trim();
    cur--;
    saveProgress();
    renderCard();
  } else {
    // [UX 최적화] 첫 번째 문제에서 '이전'을 누르면 주제 선택 화면으로 복귀
    showTopicScreen();
  }
}

// =============================================================================
// 5. 세트 시작 및 상태 영속화 (Set Initialization & Storage)
// =============================================================================

/**
 * 선택된 카테고리의 문항들을 무작위 셔플하여 새로운 연습 세트를 시작합니다.
 * @returns {void}
 */
function startPractice() {
  if (selectedCats.size === 0) return;

  // [출제 순서 생성 정책]
  // 1. 전체 문장 배열에서 사용자가 선택한 카테고리(selectedCats)에 속한 문장의 원본 인덱스만 필터링
  // 2. 편향 없는 균등한 무작위 출제를 위해 Fisher-Yates 알고리즘으로 셔플된 새 배열을 order로 할당
  order = shuffle(
    SENTENCES.map((_, i) => i).filter((i) =>
      selectedCats.has(SENTENCES[i].cat),
    ),
  );
  cur = 0;
  results = {};
  savedUserInputs = {};
  saveProgress();
  if (typeof navigateTo === "function") {
    navigateTo("practice", {}, true);
    return;
  }
  hideAllScreens();
  els.practiceCard.style.display = "block";
  renderCard();
}

/**
 * 문장 번역 연습의 현재 진행 상황을 로컬 스토리지에 저장합니다.
 * @returns {Promise<void>}
 */
async function saveProgress() {
  try {
    const data = {
      order,
      cur,
      results,
      savedUserInputs,
      cats: Array.from(selectedCats),
    };
    await storage.set(STORAGE_KEY, JSON.stringify(data), false);
  } catch (e) {
    /* best effort */
  }
}

/**
 * 로컬 스토리지에 저장된 문장 번역 연습 진행 상태를 복원합니다.
 * 유효한 데이터가 있을 경우 인덱스 유효성 검사 후 인메모리 상태에 적용합니다.
 * @returns {Promise<void>}
 */
async function loadProgress() {
  try {
    const res = await storage.get(STORAGE_KEY, false);
    if (res && res.value) {
      const data = JSON.parse(res.value);
      results = data.results || {};
      savedUserInputs = data.savedUserInputs || {};
      if (Array.isArray(data.cats) && data.cats.length) {
        selectedCats = new Set(data.cats.filter((c) => CATEGORIES.includes(c)));
      }

      // [데이터 정합성 및 안전성 검증 정책]
      // 앱 업데이트나 데이터셋 변경으로 SENTENCES 배열 길이가 달라진 경우,
      // 저장된 인덱스가 현재 데이터 범위를 벗어나(Out-of-Bounds) 런타임 오류가 발생하는 것을 방지
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
