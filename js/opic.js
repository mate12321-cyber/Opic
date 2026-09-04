/**
 * [opic.js] OPIc 실전 질문 & 5~7문장 답변 연습 모드 컨트롤러
 * - 에바(Eva)의 질문 청취 (TTS / 2회 청취 기능)
 * - 답변 녹음 타이머 및 실시간 STT / 번역 연동
 * - IM1 수준 5~7문장 모범 답변 분할 뷰 및 문장별 TTS 재생
 * - 발음 / 문장 일치도 평가 및 Google AI 질문 연동
 */

// 실전 질문 답변 모드 상태 변수
let opicOrder = [];
let opicCur = 0;
let opicSelectedCats = new Set();
let opicRevealed = false;
let opicWrongList = [];
let opicGoodCount = 0;
let opicBadCount = 0;
let opicReplayCount = 0;
let opicSpeakingTimer = null;
let opicSpeakingSeconds = 0;
let opicViewMode = "breakdown"; // "breakdown" (문장별) | "full" (전체 문단)

// 로컬 스토리지에서 진행 상태 로드
async function loadOpicProgress() {
  try {
    const res = await storage.get(OPIC_STORAGE_KEY, false);
    if (res && res.value) {
      const data = JSON.parse(res.value);
      if (data.order && data.order.length > 0) {
        opicOrder = data.order;
        opicCur = data.cur || 0;
        opicSelectedCats = new Set(data.selectedCats || []);
        opicWrongList = data.wrongList || [];
        opicGoodCount = data.goodCount || 0;
        opicBadCount = data.badCount || 0;
      }
    }
  } catch (e) {
    /* 초기 상태 유지 */
  }
  if (opicSelectedCats.size === 0 && OPIC_CATEGORIES.length > 0) {
    opicSelectedCats = new Set(OPIC_CATEGORIES);
  }
}

// 로컬 스토리지에 진행 상태 저장
async function saveOpicProgress() {
  try {
    const data = {
      order: opicOrder,
      cur: opicCur,
      selectedCats: [...opicSelectedCats],
      wrongList: opicWrongList,
      goodCount: opicGoodCount,
      badCount: opicBadCount,
    };
    await storage.set(OPIC_STORAGE_KEY, JSON.stringify(data), false);
  } catch (e) {
    /* best effort */
  }
}

// 말하기 타이머 시작
function startSpeakingTimer() {
  stopSpeakingTimer();
  opicSpeakingSeconds = 0;
  updateSpeakingTimerDisplay();
  opicSpeakingTimer = setInterval(() => {
    opicSpeakingSeconds++;
    updateSpeakingTimerDisplay();
  }, 1000);
}

// 말하기 타이머 정지
function stopSpeakingTimer() {
  if (opicSpeakingTimer) {
    clearInterval(opicSpeakingTimer);
    opicSpeakingTimer = null;
  }
}

// 말하기 타이머 화면 업데이트
function updateSpeakingTimerDisplay() {
  if (!els.opicTimerDigits) return;
  const mins = String(Math.floor(opicSpeakingSeconds / 60)).padStart(2, "0");
  const secs = String(opicSpeakingSeconds % 60).padStart(2, "0");
  els.opicTimerDigits.textContent = `${mins}:${secs}`;

  if (opicSpeakingSeconds >= 40 && opicSpeakingSeconds <= 60) {
    els.opicTimerDigits.style.color = "#10b981"; // 권장 시간대 (녹색)
  } else if (opicSpeakingSeconds > 60) {
    els.opicTimerDigits.style.color = "#f59e0b"; // 1분 초과 (주황색)
  } else {
    els.opicTimerDigits.style.color = "var(--primary)";
  }
}

// 주제/카테고리 칩 렌더링
function renderOpicChips() {
  if (!els.opicTopicChips) return;
  els.opicTopicChips.innerHTML = "";

  const isAllSelected =
    opicSelectedCats.size === OPIC_CATEGORIES.length &&
    OPIC_CATEGORIES.length > 0;

  if (els.allOpicTopicToggleBtn) {
    els.allOpicTopicToggleBtn.textContent = isAllSelected
      ? "전체 해제"
      : "전체 선택";
    els.allOpicTopicToggleBtn.onclick = () => {
      opicSelectedCats = isAllSelected ? new Set() : new Set(OPIC_CATEGORIES);
      renderOpicChips();
    };
  }

  OPIC_CATEGORIES.forEach((cat) => {
    const count = OPIC_QUESTIONS.filter((q) => q.cat === cat).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (opicSelectedCats.has(cat) ? " active" : "");
    btn.innerHTML = `<span>${cat}</span><span class="chip-count">${count}</span>`;
    btn.addEventListener("click", () => {
      if (opicSelectedCats.has(cat)) {
        opicSelectedCats.delete(cat);
      } else {
        opicSelectedCats.add(cat);
      }
      renderOpicChips();
    });
    els.opicTopicChips.appendChild(btn);
  });

  const selectedCount = OPIC_QUESTIONS.filter((q) =>
    opicSelectedCats.has(q.cat),
  ).length;

  if (els.opicTopicCount) {
    els.opicTopicCount.textContent = opicSelectedCats.size
      ? `(${selectedCount}질문 · ${opicSelectedCats.size}개 주제)`
      : "(주제를 선택하세요)";
  }

  if (els.opicStartBtn) {
    els.opicStartBtn.disabled = opicSelectedCats.size === 0;
    els.opicStartBtn.style.opacity = opicSelectedCats.size === 0 ? ".45" : "1";
    els.opicStartBtn.style.cursor =
      opicSelectedCats.size === 0 ? "not-allowed" : "pointer";
  }
}


// 연습 세트 시작
function startOpicPractice(wrongOnly = false) {
  stopTTS();
  stopSpeakingTimer();

  if (wrongOnly && opicWrongList.length > 0) {
    opicOrder = shuffle([...opicWrongList]);
  } else {
    const filteredIndices = OPIC_QUESTIONS.map((q, idx) => ({ q, idx }))
      .filter(({ q }) => opicSelectedCats.has(q.cat))
      .map(({ idx }) => idx);

    if (filteredIndices.length === 0) {
      alert("최소 하나 이상의 주제를 선택해 주세요.");
      return;
    }
    opicOrder = shuffle(filteredIndices);
  }

  opicCur = 0;
  opicWrongList = [];
  opicGoodCount = 0;
  opicBadCount = 0;
  saveOpicProgress();

  hideAllScreens();
  els.opicCard.style.display = "block";
  renderOpicCard();
}

// 실전 질문 카드 렌더링
function renderOpicCard() {
  stopTTS();
  stopSpeakingTimer();
  opicSpeakingSeconds = 0;
  updateSpeakingTimerDisplay();

  if (opicCur >= opicOrder.length) {
    showOpicDoneScreen();
    return;
  }

  const item = OPIC_QUESTIONS[opicOrder[opicCur]];
  if (!item) return;

  opicRevealed = false;
  opicReplayCount = 0;

  // 상단 라벨
  els.opicCatLabel.textContent = item.cat;
  els.opicIdxLabel.textContent = `${String(opicCur + 1).padStart(2, "0")} / ${String(opicOrder.length).padStart(2, "0")}`;
  if (els.evaTypeBadge) els.evaTypeBadge.textContent = item.type || "실전 질문";

  // 에바 질문 텍스트 및 해석
  els.evaQEn.textContent = item.q_en;
  els.evaQKo.textContent = item.q_ko;
  els.evaQKo.classList.remove("show");
  if (els.btnToggleEvaKo) els.btnToggleEvaKo.textContent = "해석 보기 ▾";

  // 한국어 답변 가이드 리셋 & 렌더링
  if (els.opicKoHintBox) els.opicKoHintBox.style.display = "none";
  if (els.btnToggleOpicKoHint)
    els.btnToggleOpicKoHint.classList.remove("active");
  renderOpicKoHintList(item.sentences);

  // 청취 횟수 리셋
  updateEvaReplayBadge();

  // 입력창 및 실시간 번역 리셋
  els.opicUserInput.value = "";
  els.opicLiveTranslate.classList.remove("show");
  els.opicLiveTranslateText.textContent = "";
  if (els.opicMicError) els.opicMicError.textContent = "";

  // 모범 답안 박스 및 평가 박스 숨김
  els.opicAnswerBox.style.display = "none";
  if (els.opicSpeechEvalBox) els.opicSpeechEvalBox.style.display = "none";

  // 버튼 상태 리셋
  els.opicRevealRow.style.display = "flex";
  els.opicRateRow.style.display = "none";
  els.opicRetrySameLink.style.display = "none";

  // 진행 점(Dots) 렌더링
  renderOpicProgressDots();

  // 질문 음성 자동 재생 (첫 진입 시)
  playEvaQuestion(true);
}

// 한국어 답변 가이드 목록 렌더링
function renderOpicKoHintList(sentences) {
  if (!els.opicKoHintList) return;
  els.opicKoHintList.innerHTML = "";

  sentences.forEach((s, idx) => {
    const item = document.createElement("div");
    item.className = "ko-hint-item";

    const num = document.createElement("div");
    num.className = "ko-hint-num";
    num.textContent = idx + 1;

    const text = document.createElement("div");
    text.className = "ko-hint-text";
    text.textContent = s.ko;

    item.appendChild(num);
    item.appendChild(text);
    els.opicKoHintList.appendChild(item);
  });
}

// 한국어 답변 가이드 토글
function toggleOpicKoHint() {
  if (!els.opicKoHintBox) return;
  const isHidden = els.opicKoHintBox.style.display === "none";
  els.opicKoHintBox.style.display = isHidden ? "block" : "none";
  if (els.btnToggleOpicKoHint) {
    els.btnToggleOpicKoHint.classList.toggle("active", isHidden);
  }
}

// 에바 질문 청취 횟수 배지
function updateEvaReplayBadge() {
  if (!els.evaReplayCount) return;
  els.evaReplayCount.textContent = `청취 ${opicReplayCount}/2회`;
}

// 에바 질문 음성 재생
function playEvaQuestion(isAuto = false) {
  const item = OPIC_QUESTIONS[opicOrder[opicCur]];
  if (!item) return;

  opicReplayCount++;
  updateEvaReplayBadge();
  speakText(item.q_en, "en-US", els.ttsEvaBtn);
}

// 질문 한국어 해석 토글
function toggleEvaKo() {
  const isShown = els.evaQKo.classList.toggle("show");
  if (els.btnToggleEvaKo) {
    els.btnToggleEvaKo.textContent = isShown ? "해석 닫기 ▴" : "해석 보기 ▾";
  }
}

// 답변 분할 뷰 vs 전체 문단 뷰 전환
function switchOpicAnswerView(mode) {
  opicViewMode = mode;
  if (els.tabBreakdownBtn)
    els.tabBreakdownBtn.classList.toggle("active", mode === "breakdown");
  if (els.tabFullBtn)
    els.tabFullBtn.classList.toggle("active", mode === "full");

  if (els.sentenceBreakdownList) {
    els.sentenceBreakdownList.style.display =
      mode === "breakdown" ? "flex" : "none";
  }
  if (els.fullParagraphView) {
    els.fullParagraphView.classList.toggle("show", mode === "full");
  }
}

// 5~7문장 분할 카드 렌더링
function renderSentenceBreakdownList(sentences) {
  if (!els.sentenceBreakdownList) return;
  els.sentenceBreakdownList.innerHTML = "";

  sentences.forEach((s, idx) => {
    const card = document.createElement("div");
    card.className = "sentence-card";

    const badge = document.createElement("div");
    badge.className = "sentence-index-badge";
    badge.textContent = idx + 1;

    const texts = document.createElement("div");
    texts.className = "sentence-texts";

    const enP = document.createElement("div");
    enP.className = "sentence-en-text";
    enP.textContent = s.en;

    const koP = document.createElement("div");
    koP.className = "sentence-ko-text";
    koP.textContent = s.ko;

    texts.appendChild(enP);
    texts.appendChild(koP);

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "sentence-play-btn";
    playBtn.title = "이 문장 발음 듣기";
    playBtn.innerHTML = "🔊";
    playBtn.addEventListener("click", () => {
      speakText(s.en, "en-US", playBtn);
    });

    card.appendChild(badge);
    card.appendChild(texts);
    card.appendChild(playBtn);
    els.sentenceBreakdownList.appendChild(card);
  });
}

// 핵심 키워드 칩 렌더링
function renderKeywordChips(keywords) {
  if (!els.opicKeywordChipsWrap) return;
  els.opicKeywordChipsWrap.innerHTML = "";

  if (!keywords || keywords.length === 0) {
    if (els.opicKeywordsBox) els.opicKeywordsBox.style.display = "none";
    return;
  }

  if (els.opicKeywordsBox) els.opicKeywordsBox.style.display = "block";
  keywords.forEach((kw) => {
    const chip = document.createElement("span");
    chip.className = "keyword-chip";
    chip.textContent = kw;
    els.opicKeywordChipsWrap.appendChild(chip);
  });
}

// 정답 확인 (모범 답변 공개)
function revealOpic() {
  if (opicRevealed) return;
  opicRevealed = true;
  stopSpeakingTimer();

  const item = OPIC_QUESTIONS[opicOrder[opicCur]];
  if (!item) return;

  // 모범 답안 렌더링
  renderSentenceBreakdownList(item.sentences);
  if (els.opicFullEn) els.opicFullEn.textContent = item.answer_en;
  if (els.opicFullKo) els.opicFullKo.textContent = item.answer_ko;
  if (els.opicTipText) els.opicTipText.textContent = item.tip;
  renderKeywordChips(item.keywords);

  // 기본 뷰 모드 설정 (문장별 분할 뷰)
  switchOpicAnswerView("breakdown");

  els.opicAnswerBox.style.display = "block";
  els.opicRevealRow.style.display = "none";
  els.opicRateRow.style.display = "flex";
  els.opicRetrySameLink.style.display = "inline-flex";

  // 발음 및 일치도 평가
  const userText = els.opicUserInput.value.trim();
  if (userText && els.opicSpeechEvalBox) {
    evaluateOpicSpeech(userText, item.answer_en);
  }

  // 자동 재생 설정 시 전체 모범답안 TTS 재생
  if (els.autoPlayTts && els.autoPlayTts.checked) {
    speakText(item.answer_en, "en-US", els.ttsOpicAllBtn);
  }
}

// 발음 일치도 평가
function evaluateOpicSpeech(userText, targetText) {
  const result = evaluatePronunciation(userText, targetText);
  els.opicSpeechEvalBox.style.display = "block";

  if (els.opicEvalScoreBadge) {
    els.opicEvalScoreBadge.textContent = `${result.accuracy}% 일치`;
    if (result.accuracy >= 75) {
      els.opicEvalScoreBadge.className = "eval-score-badge eval-score-high";
    } else if (result.accuracy >= 45) {
      els.opicEvalScoreBadge.className = "eval-score-badge eval-score-mid";
    } else {
      els.opicEvalScoreBadge.className = "eval-score-badge eval-score-low";
    }
  }

  if (els.opicEvalDiff) els.opicEvalDiff.innerHTML = result.diffHtml;
  if (els.opicEvalFeedback) els.opicEvalFeedback.textContent = result.feedback;
}

// 문제 평가 (잘했어요 / 다시 연습)
function rateOpic(rating) {
  stopTTS();
  const currentQuestionIdx = opicOrder[opicCur];

  if (rating === "good") {
    opicGoodCount++;
  } else {
    opicBadCount++;
    if (!opicWrongList.includes(currentQuestionIdx)) {
      opicWrongList.push(currentQuestionIdx);
    }
  }

  logPracticeEvent();
  opicCur++;
  saveOpicProgress();
  renderOpicCard();
}

// 현재 문제 재도전
function retrySameOpicQuestion() {
  stopTTS();
  renderOpicCard();
}

// 건너뛰기
function skipOpic() {
  stopTTS();
  opicCur++;
  saveOpicProgress();
  renderOpicCard();
}

// 진행 점(Dots) 렌더링
function renderOpicProgressDots() {
  if (!els.opicProgressDots) return;
  els.opicProgressDots.innerHTML = "";
  const total = opicOrder.length;
  const maxDots = 20;

  if (total <= maxDots) {
    for (let i = 0; i < total; i++) {
      const d = document.createElement("div");
      d.className =
        "dot" + (i < opicCur ? " done" : i === opicCur ? " cur" : "");
      els.opicProgressDots.appendChild(d);
    }
  } else {
    const text = document.createElement("span");
    text.className = "progress-text";
    text.textContent = `진행: ${opicCur + 1} / ${total}`;
    els.opicProgressDots.appendChild(text);
  }
}

// 완료 화면 표시
function showOpicDoneScreen() {
  hideAllScreens();
  els.opicDoneScreen.style.display = "block";
  els.opicDoneScreen.classList.add("show");

  const total = opicOrder.length;
  const accuracy = total > 0 ? Math.round((opicGoodCount / total) * 100) : 0;
  els.opicDoneSummary.textContent = `총 ${total}개 실전 질문 중 ${opicGoodCount}개 완벽 연습 (${accuracy}%)`;

  if (els.opicRetryWrongBtn) {
    els.opicRetryWrongBtn.style.display =
      opicWrongList.length > 0 ? "block" : "none";
    els.opicRetryWrongBtn.textContent = `틀린 질문(${opicWrongList.length}개)만 다시 연습`;
  }
}

// Google AI 질문 검색 쿼리 빌더
function buildOpicGoogleQuery() {
  const item = OPIC_QUESTIONS[opicOrder[opicCur]];
  const text = els.opicUserInput.value.trim();
  if (!item) return text;
  return `OPIc 영어 시험 답변 피드백: 질문은 "${item.q_en}"이고, 내 답변은 "${text}"입니다. IM1 수준으로 문법 오류와 더 자연스러운 5~7문장 표현을 알려주세요.`;
}
