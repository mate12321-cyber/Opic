/**
 * @file filler.js
 * @description OPIc 핵심 필러(Filler Words) 16선 1개씩 집중 훈련 컨트롤러
 * - 16개 핵심 필러 카드 렌더링 (단어, 발음 기호, 한국어 뜻, 타이밍 가이드, 꿀팁)
 * - 상단 바로가기 칩을 통한 빠른 필러 전환
 * - 원어민 발음(TTS) 청취 및 마이크(STT) 따라 말하기 실전 테스트
 * - 마스터 완료 상태 로컬 스토리지 저장 및 대시보드 진행도 연동
 */

// =============================================================================
// 1. 필러 모드 전역 상태 및 유틸리티 (State Management & Helpers)
// =============================================================================

let fillerCur = 0; // 현재 학습 중인 필러 인덱스 (0 ~ 15)
let fillerProgress = {}; // 필러 마스터 완료 상태 맵 { [fillerId]: boolean }

/**
 * 문자열의 HTML 특수문자를 안전하게 이스케이프합니다.
 * @param {string} str - 원본 문자열
 * @returns {string} 이스케이프된 문자열
 */
function escapeFillerHtml(str) {
  return escapeHtml(str);
}

function safeEscapeForJs(str) {
  if (!str) return "";
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// =============================================================================
// 2. 필러 진행 상황 영속화 (Storage Management)
// =============================================================================

/**
 * 로컬 스토리지에서 필러 마스터 완료 상태 객체를 비동기 로드합니다.
 * @returns {Promise<void>}
 */
async function loadFillerProgress() {
  try {
    const res = await storage.get(FILLER_STORAGE_KEY, false);
    if (res && res.value) {
      fillerProgress = JSON.parse(res.value) || {};
    }
  } catch (e) {
    fillerProgress = {};
  }
}

/**
 * 필러 마스터 완료 상태 객체를 로컬 스토리지에 저장하고 홈 대시보드 통계를 동기화합니다.
 * @returns {Promise<void>}
 */
async function saveFillerProgress() {
  try {
    await storage.set(
      FILLER_STORAGE_KEY,
      JSON.stringify(fillerProgress),
      false,
    );
    if (typeof renderHomeDashboard === "function") {
      renderHomeDashboard();
    }
  } catch (e) {
    console.error("필러 진행 상황 저장 실패:", e);
  }
}

// =============================================================================
// 3. 필러 카드 화면 렌더러 (Filler Card Renderer)
// =============================================================================

/**
 * 특정 인덱스의 필러 훈련 카드 화면을 표시합니다.
 * @param {number} [targetIdx=0] - 표시할 필러 인덱스 (0 ~ 15)
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 스택 추가 여부
 * @returns {void}
 */
function showFillerScreen(targetIdx = 0, pushHistory = true) {
  if (
    typeof targetIdx === "number" &&
    targetIdx >= 0 &&
    targetIdx < (FILLER_ITEMS.length || 16)
  ) {
    fillerCur = targetIdx;
  }
  if (typeof navigateTo === "function") {
    navigateTo("filler", { targetIdx: fillerCur }, pushHistory);
    return;
  }
  hideAllScreens();
  const card = document.getElementById("fillerCard");
  if (card) {
    card.style.display = "block";
    renderFillerCard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * 현재 순서의 1개 필러 카드를 상세 렌더링합니다.
 * - 카테고리 배지, 현재 순번(1/16), 상단 칩 내비게이터
 * - 영문 필러 표현, 한글 발음 억양 가이드, 의미
 * - 실전 타이밍 가이드, OPIc 고득점 꿀팁
 * - 실전 예문 목록 및 개별 TTS 재생 버튼
 *
 * @returns {void}
 */
function renderFillerCard() {
  if (!FILLER_ITEMS || FILLER_ITEMS.length === 0) {
    const box = document.getElementById("fillerHeroMeaning");
    if (box) box.textContent = "필러 데이터를 불러오는 중입니다...";
    return;
  }

  // 인덱스 범위 안전 보정
  if (fillerCur < 0) fillerCur = 0;
  if (fillerCur >= FILLER_ITEMS.length) fillerCur = FILLER_ITEMS.length - 1;

  const f = FILLER_ITEMS[fillerCur];
  if (!f) return;

  const isMastered = !!fillerProgress[f.id];
  const total = FILLER_ITEMS.length;

  // 1. 상단 메타 라벨
  const catLabel = document.getElementById("fillerCatLabel");
  const idxLabel = document.getElementById("fillerIdxLabel");
  if (catLabel)
    catLabel.textContent = `${f.categoryIcon || "💬"} ${f.categoryName || "필러 훈련"}`;
  if (idxLabel)
    idxLabel.textContent = `${String(fillerCur + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  // 2. 상단 빠른 이동 칩 바 렌더링
  const chipsContainer = document.getElementById("fillerSwitcherChips");
  if (chipsContainer) {
    chipsContainer.innerHTML = FILLER_ITEMS.map((item, idx) => {
      const isActive = idx === fillerCur;
      const isDone = !!fillerProgress[item.id];
      const shortPhrase = item.phrase
        .split("/")[0]
        .replace(/[\.\.\.]/g, "")
        .trim();
      return `
        <button
          type="button"
          class="filler-chip ${isActive ? "active" : ""} ${isDone ? "mastered" : ""}"
          data-fidx="${idx}"
          onclick="selectFiller(${idx})"
          title="${escapeFillerHtml(item.phrase)} (${escapeFillerHtml(item.meaning)})"
        >
          <span>${idx + 1}. ${escapeFillerHtml(shortPhrase)}</span>
          ${isDone ? '<span class="filler-chip-check">✓</span>' : ""}
        </button>
      `;
    }).join("");

    // 활성 칩으로 자동 스크롤
    setTimeout(() => {
      const activeChip = chipsContainer.querySelector(".filler-chip.active");
      if (activeChip) {
        activeChip.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, 50);
  }

  // 3. 메인 히어로 박스 (핵심 표현, 발음, 의미)
  const phraseEl = document.getElementById("fillerHeroPhrase");
  const pronounceEl = document.getElementById("fillerHeroPronounce");
  const meaningEl = document.getElementById("fillerHeroMeaning");
  const masterBtn = document.getElementById("fillerMasterMainBtn");
  const ttsBtn = document.getElementById("fillerTtsMainBtn");

  if (phraseEl)
    phraseEl.innerHTML = `<span>${f.categoryIcon || "💬"} ${escapeFillerHtml(f.phrase)}</span>`;
  if (pronounceEl) pronounceEl.textContent = f.pronunciation || "";
  if (meaningEl) meaningEl.textContent = f.meaning || "";

  if (masterBtn) {
    masterBtn.className = `btn-filler-master-large ${isMastered ? "active" : ""}`;
    masterBtn.innerHTML = isMastered ? "✓ 숙달 완료" : "+ 마스터";
    masterBtn.onclick = () => toggleCurrentFillerMaster();
  }

  if (ttsBtn) {
    const cleanPhrase = f.phrase.replace(/[\.\.\.\/]/g, "").trim();
    ttsBtn.onclick = () => playFillerTTS(cleanPhrase, ttsBtn);
  }

  // 4. 💡 사용 시점 & 타이밍 가이드
  const timingBody = document.getElementById("fillerTimingBody");
  if (timingBody) {
    timingBody.textContent =
      f.timingGuide || "자연스러운 호흡과 생각 시간을 벌 때 사용합니다.";
  }

  // 5. 🍯 꿀팁 박스
  const tipSection = document.getElementById("fillerTipSection");
  const tipBody = document.getElementById("fillerTipBody");
  if (tipSection && tipBody) {
    if (f.tip) {
      tipSection.style.display = "flex";
      tipBody.innerHTML = `<strong>Tip:</strong> ${escapeFillerHtml(f.tip)}`;
    } else {
      tipSection.style.display = "none";
    }
  }

  // 6. 🗣️ 실전 OPIc 활용 예문
  const examplesList = document.getElementById("fillerExamplesList");
  if (examplesList && f.examples) {
    examplesList.innerHTML = f.examples
      .map((ex) => {
        const highlightedEn = highlightFillerWords(ex.en, f.phrase);
        return `
        <div class="filler-ex-card">
          ${ex.context ? `<span class="filler-ex-tag">📌 ${escapeFillerHtml(ex.context)}</span>` : ""}
          <div class="filler-ex-en-row">
            <div class="filler-ex-en">${highlightedEn}</div>
            <button
              type="button"
              class="btn-ex-tts"
              onclick="playFillerTTS('${safeEscapeForJs(ex.en)}', this)"
              title="문장 원어민 음성 듣기"
            >
              🔊 듣기
            </button>
          </div>
          <div class="filler-ex-ko">${escapeFillerHtml(ex.ko)}</div>
        </div>
      `;
      })
      .join("");
  }

  // 7. 🎤 따라 말하기 STT 영역 초기화
  stopFillerMic();
  const sttBox = document.getElementById("fillerSttBox");
  const sttEvalMsg = document.getElementById("fillerSttEvalMsg");
  const micBtn = document.getElementById("fillerMicBtnMain");

  if (sttBox) {
    sttBox.innerHTML = `<span style="color: var(--text-muted); font-size: 13px;">마이크를 누르고 "${escapeFillerHtml(f.phrase)}" 또는 위 예문을 말해보세요.</span>`;
  }
  if (sttEvalMsg) {
    sttEvalMsg.style.display = "none";
    sttEvalMsg.className = "filler-stt-eval-msg";
  }
  if (micBtn) {
    micBtn.classList.remove("listening");
    micBtn.innerHTML = `🎤 마이크 켜기`;
    micBtn.onclick = () => toggleFillerMic(f.id, f.phrase);
  }

  // 8. 이전 / 다음 버튼 상태
  const prevBtnTop = document.getElementById("btnPrevFillerTop");
  const prevBtnBottom = document.getElementById("btnPrevFillerBottom");
  const nextBtnBottom = document.getElementById("btnNextFillerBottom");

  const isFirst = fillerCur === 0;
  const isLast = fillerCur === total - 1;

  if (prevBtnTop) {
    prevBtnTop.disabled = isFirst;
    prevBtnTop.style.opacity = isFirst ? "0.4" : "1";
    prevBtnTop.onclick = prevFiller;
  }
  if (prevBtnBottom) {
    prevBtnBottom.disabled = isFirst;
    prevBtnBottom.onclick = prevFiller;
  }
  if (nextBtnBottom) {
    nextBtnBottom.innerHTML = isLast
      ? `<span>처음부터 다시 복습 ↺</span><kbd class="shortcut-key">↵</kbd>`
      : `<span>다음 필러 →</span><kbd class="shortcut-key">↵</kbd>`;
    nextBtnBottom.onclick = nextFiller;
  }
}

// 다음 필러로 이동
function nextFiller() {
  if (!FILLER_ITEMS || FILLER_ITEMS.length === 0) return;
  if (fillerCur < FILLER_ITEMS.length - 1) {
    fillerCur++;
  } else {
    fillerCur = 0; // 끝에 도달하면 처음으로 순환
  }
  renderFillerCard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 이전 필러로 이동
function prevFiller() {
  if (!FILLER_ITEMS || FILLER_ITEMS.length === 0) return;
  if (fillerCur > 0) {
    fillerCur--;
    renderFillerCard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// 특정 인덱스 필러 선택
function selectFiller(idx) {
  if (
    typeof idx === "number" &&
    idx >= 0 &&
    idx < (FILLER_ITEMS.length || 16)
  ) {
    fillerCur = idx;
    renderFillerCard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// 현재 필러 마스터 토글
async function toggleCurrentFillerMaster() {
  if (!FILLER_ITEMS || !FILLER_ITEMS[fillerCur]) return;
  const curId = FILLER_ITEMS[fillerCur].id;
  if (fillerProgress[curId]) {
    delete fillerProgress[curId];
  } else {
    fillerProgress[curId] = true;
  }
  await saveFillerProgress();
  renderFillerCard();
}

// 필러 문구 하이라이트 함수
function highlightFillerWords(text, phrase) {
  if (!text) return "";
  let cleanText = escapeFillerHtml(text);

  const phrases = phrase
    .split("/")
    .map((p) => p.replace(/[\.\.\.]/g, "").trim())
    .filter(Boolean);

  phrases.forEach((p) => {
    const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = new RegExp(`(${escaped})`, "gi");
    cleanText = cleanText.replace(reg, "<mark>$1</mark>");
  });

  return cleanText;
}

// =============================================================================
// 4. 필러 TTS 발음 재생 (Filler Audio Playback)
// =============================================================================

/**
 * 필러 문구 또는 예문을 영어(en-US) 음성으로 재생합니다.
 * @param {string} text - 재생할 영문 텍스트
 * @param {HTMLElement|null} [btn=null] - 재생 상태를 표시할 버튼 요소
 * @returns {void}
 */
function playFillerTTS(text, btn = null) {
  if (!text) return;
  if (typeof speakText === "function") {
    speakText(text, "en-US", btn);
  }
}

/**
 * 현재 보고 있는 필러 카드의 대표 표현 발음을 즉시 재생합니다 (단축키 Space 지원).
 * @returns {void}
 */
function playCurrentFillerTTS() {
  if (!FILLER_ITEMS || !FILLER_ITEMS[fillerCur]) return;
  const cleanPhrase = FILLER_ITEMS[fillerCur].phrase
    .replace(/[\.\.\.\/]/g, "")
    .trim();
  const ttsBtn = document.getElementById("fillerTtsMainBtn");
  playFillerTTS(cleanPhrase, ttsBtn);
}

// =============================================================================
// 5. 마이크 STT (따라 말하기 실전 테스트) (Speech Recognition & Matching)
// =============================================================================

let fillerRecognition = null;
let fillerIsListening = false;

/**
 * 필러 따라 말하기 마이크 음성 인식을 토글합니다.
 * @param {string} fillerId - 현재 필러 고유 ID
 * @param {string} targetPhrase - 목표 필러 표현 문자열
 * @returns {void}
 */
function toggleFillerMic(fillerId, targetPhrase) {
  const micBtn = document.getElementById("fillerMicBtnMain");
  const sttBox = document.getElementById("fillerSttBox");
  const feedbackEl = document.getElementById("fillerSttEvalMsg");

  if (fillerIsListening) {
    stopFillerMic();
    return;
  }

  // ⚡ 마이크 시작 시 재생 중인 TTS 정지
  if (typeof stopTTS === "function") stopTTS();

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (sttBox) {
      sttBox.innerHTML = `<span style="color: var(--danger); font-size: 13px;">❌ 브라우저가 음성 인식을 지원하지 않습니다. (Chrome 추천)</span>`;
    }
    return;
  }

  try {
    fillerRecognition = new SpeechRecognition();
    fillerRecognition.lang = "en-US";
    fillerRecognition.continuous = false;
    fillerRecognition.interimResults = true;
    fillerRecognition.maxAlternatives = 1;

    fillerIsListening = true;
    let evaluated = false;
    let lastSpokenText = "";

    if (micBtn) {
      micBtn.classList.add("listening");
      micBtn.innerHTML = `🔴 듣는 중... (말씀하세요)`;
    }
    if (sttBox) {
      sttBox.innerHTML = `<span style="color: #059669; font-weight: 600;">듣고 있습니다... 소리 내어 말해보세요!</span>`;
    }
    if (feedbackEl) {
      feedbackEl.style.display = "none";
      feedbackEl.className = "filler-stt-eval-msg";
    }

    fillerRecognition.onresult = (event) => {
      let transcript = "";
      let isFinal = false;
      for (let i = 0; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }

      lastSpokenText = transcript;
      if (sttBox) {
        sttBox.innerHTML = `🗣️ <strong style="color: var(--text-main); font-size: 14px;">"${escapeFillerHtml(transcript)}"</strong>`;
      }

      if (isFinal && !evaluated) {
        evaluated = true;
        evaluateFillerSpeech(transcript, targetPhrase, feedbackEl, fillerId);
      }
    };

    fillerRecognition.onerror = (event) => {
      console.warn("필러 STT 상태:", event.error);
      if (event.error === "no-speech") {
        if (sttBox) {
          sttBox.innerHTML = `<span style="color: var(--text-muted); font-size: 13px;">목소리가 감지되지 않았어요. 마이크를 켜고 다시 말씀해보세요.</span>`;
        }
      } else if (event.error !== "aborted") {
        if (sttBox) {
          sttBox.innerHTML = `<span style="color: var(--danger); font-size: 13px;">음성 인식 오류 (${event.error}) - 마이크 권한을 확인해주세요.</span>`;
        }
      }
      stopFillerMic();
    };

    fillerRecognition.onend = () => {
      if (!evaluated && lastSpokenText.trim()) {
        evaluated = true;
        evaluateFillerSpeech(
          lastSpokenText,
          targetPhrase,
          feedbackEl,
          fillerId,
        );
      }
      stopFillerMic();
    };

    fillerRecognition.start();
  } catch (err) {
    console.error("필러 마이크 시작 실패:", err);
    stopFillerMic();
  }
}

function stopFillerMic() {
  if (fillerRecognition) {
    try {
      fillerRecognition.stop();
    } catch (e) {}
    fillerRecognition = null;
  }
  fillerIsListening = false;
  const micBtn = document.getElementById("fillerMicBtnMain");
  if (micBtn) {
    micBtn.classList.remove("listening");
    micBtn.innerHTML = `🎤 마이크 켜기`;
  }
}

/**
 * 사용자가 발화한 음성 인식 텍스트(STT)가 목표 필러 표현을 포함하는지 일치도를 평가합니다.
 * 일치할 경우 축하 피드백 표시 및 자동으로 마스터 완료 상태로 등록합니다.
 *
 * @param {string} spokenText - 인식된 사용자 음성 텍스트
 * @param {string} targetPhrase - 목표 필러 표현 문자열
 * @param {HTMLElement} feedbackEl - 피드백 메시지를 표시할 컨테이너
 * @param {string} fillerId - 필러 고유 ID
 * @returns {void}
 */
function evaluateFillerSpeech(spokenText, targetPhrase, feedbackEl, fillerId) {
  if (!feedbackEl || !spokenText) return;

  const spokenLower = spokenText.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const targetKeywords = targetPhrase
    .toLowerCase()
    .split("/")
    .map((k) => k.replace(/[^a-z0-9 ]/g, "").trim())
    .filter(Boolean);

  const isMatched = targetKeywords.some((keyword) => {
    const words = keyword.split(" ").filter(Boolean);
    return words.every((w) => spokenLower.includes(w));
  });

  if (isMatched) {
    feedbackEl.innerHTML = `🎉 완벽해요! 필러 표현("${escapeFillerHtml(targetPhrase)}")이 정확하게 인식되었습니다. (숙달 완료 ✓)`;
    feedbackEl.className = "filler-stt-eval-msg pass";
    feedbackEl.style.display = "block";

    // 자동으로 마스터 완료 처리
    if (!fillerProgress[fillerId]) {
      fillerProgress[fillerId] = true;
      saveFillerProgress();
      const masterBtn = document.getElementById("fillerMasterMainBtn");
      if (masterBtn) {
        masterBtn.className = "btn-filler-master-large active";
        masterBtn.innerHTML = "✓ 숙달 완료";
      }
      // 상단 칩 갱신
      const chipsContainer = document.getElementById("fillerSwitcherChips");
      if (chipsContainer) {
        const currentChip = chipsContainer.querySelector(
          `[data-fidx="${fillerCur}"]`,
        );
        if (currentChip && !currentChip.querySelector(".filler-chip-check")) {
          const checkSpan = document.createElement("span");
          checkSpan.className = "filler-chip-check";
          checkSpan.textContent = "✓";
          currentChip.appendChild(checkSpan);
          currentChip.classList.add("mastered");
        }
      }
    }
  } else {
    feedbackEl.innerHTML = `💡 필러 표현("${escapeFillerHtml(targetPhrase)}")을 포함하여 조금 더 또렷하게 발음해보세요!`;
    feedbackEl.className = "filler-stt-eval-msg miss";
    feedbackEl.style.display = "block";
  }
}
