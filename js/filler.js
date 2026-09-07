/**
 * [filler.js] OPIc 핵심 필러(Filler Words) 집중 훈련 모듈
 * - 사용하기 쉬운 16대 필러 및 시점별(타이밍) 가이드
 * - 카테고리별 탭 필터링 & 마스터(완료) 체크
 * - 원어민 TTS 음성 재생 & 마이크 STT 따라 말하기 인터랙션
 */

// 필러 데이터 및 상태 관리
let FILLER_ITEMS = [];
let fillerCurrentTab = "all";
let fillerProgress = {}; // { fil_01: true, ... }
const FILLER_STORAGE_KEY = "ko-en-opic-filler-progress";

// 필러 진행 상황 로드
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

// 필러 진행 상황 저장
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

// 필러 마스터(완료) 상태 토글
async function toggleFillerMaster(id) {
  if (fillerProgress[id]) {
    delete fillerProgress[id];
  } else {
    fillerProgress[id] = true;
  }
  await saveFillerProgress();
  renderFillerList();
  updateFillerTabsCount();
}

// 카테고리 탭 변경
function selectFillerTab(tabKey) {
  fillerCurrentTab = tabKey;
  
  document.querySelectorAll(".filler-tab-btn").forEach((btn) => {
    if (btn.dataset.tab === tabKey) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderFillerList();
}

// 카테고리별 탭 카운트 업데이트
function updateFillerTabsCount() {
  const counts = {
    all: FILLER_ITEMS.length,
    start: FILLER_ITEMS.filter((f) => f.category === "start").length,
    bridge: FILLER_ITEMS.filter((f) => f.category === "bridge").length,
    emotion: FILLER_ITEMS.filter((f) => f.category === "emotion").length,
    finish: FILLER_ITEMS.filter((f) => f.category === "finish").length,
  };

  const masteredCount = Object.keys(fillerProgress).length;

  document.querySelectorAll(".filler-tab-btn").forEach((btn) => {
    const tab = btn.dataset.tab;
    const badge = btn.querySelector(".filler-tab-badge");
    if (badge && counts[tab] !== undefined) {
      badge.textContent = counts[tab];
    }
  });

  const countBadge = document.getElementById("fillerMasteredCountBadge");
  if (countBadge) {
    countBadge.textContent = `${masteredCount} / ${FILLER_ITEMS.length}개 숙달 완료 ✓`;
  }
}

// 필러 리스트 렌더링
function renderFillerList() {
  const container = document.getElementById("fillerListContainer");
  if (!container) return;

  if (!FILLER_ITEMS || FILLER_ITEMS.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 32px 16px; color: var(--text-sub); font-size: 14px;">
        ⏳ 필러 데이터를 불러오는 중입니다...
      </div>
    `;
    return;
  }

  const filtered =
    fillerCurrentTab === "all"
      ? FILLER_ITEMS
      : FILLER_ITEMS.filter((f) => f.category === fillerCurrentTab);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 32px 16px; color: var(--text-sub); font-size: 14px;">
        해당 카테고리의 필러가 없습니다.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((f, idx) => {
      const isMastered = !!fillerProgress[f.id];
      const escapedPhrase = safeEscapeHtml(f.phrase);
      const cleanPhraseForTts = f.phrase.replace(/[\.\.\.\/]/g, "").trim();

      return `
      <div class="filler-card ${isMastered ? "mastered" : ""}" id="card_${f.id}">
        <div class="filler-card-top">
          <div class="filler-phrase-wrap">
            <div class="filler-phrase">
              <span>${f.categoryIcon || "💬"} ${escapedPhrase}</span>
              <span class="filler-pronounce">${safeEscapeHtml(f.pronunciation || "")}</span>
            </div>
            <div class="filler-meaning">${safeEscapeHtml(f.meaning)}</div>
          </div>
          <div class="filler-card-actions">
            <button
              type="button"
              class="btn-filler-tts"
              onclick="playFillerTTS('${safeEscapeForJs(cleanPhraseForTts)}')"
              title="원어민 발음 듣기"
            >
              🔊 발음
            </button>
            <button
              type="button"
              class="btn-filler-master ${isMastered ? "active" : ""}"
              onclick="toggleFillerMaster('${f.id}')"
              title="마스터 완료 여부 토글"
            >
              ${isMastered ? "✓ 숙달됨" : "+ 마스터"}
            </button>
          </div>
        </div>

        <!-- 💡 사용 시점 & 타이밍 가이드 -->
        <div class="filler-timing-box">
          <div class="filler-timing-label">
            <span>💡 사용 시점 & 타이밍 가이드</span>
          </div>
          <div class="filler-timing-content">${safeEscapeHtml(f.timingGuide)}</div>
        </div>

        <!-- 꿀팁 박스 -->
        ${
          f.tip
            ? `
          <div class="filler-tip-box">
            <span>🍯</span>
            <div><strong>Tip:</strong> ${safeEscapeHtml(f.tip)}</div>
          </div>
        `
            : ""
        }

        <!-- 실전 OPIc 예문 -->
        <div class="filler-examples-wrap">
          <div class="filler-examples-title">
            <span>🗣️ 실전 OPIc 활용 예문</span>
          </div>
          ${(f.examples || [])
            .map((ex) => {
              // 필러 단어 하이라이트 처리
              const highlightedEn = highlightFillerWords(ex.en, f.phrase);
              return `
              <div class="filler-example-item">
                ${ex.context ? `<span class="filler-example-context">📌 ${safeEscapeHtml(ex.context)}</span>` : ""}
                <div class="filler-example-en">
                  <div>${highlightedEn}</div>
                  <button
                    type="button"
                    class="btn-example-tts"
                    onclick="playFillerTTS('${safeEscapeForJs(ex.en)}')"
                    title="전체 문장 원어민 음성 듣기"
                  >
                    🔊
                  </button>
                </div>
                <div class="filler-example-ko">${safeEscapeHtml(ex.ko)}</div>
              </div>
            `;
            })
            .join("")}
        </div>

        <!-- 따라 말하기 (STT Practice) -->
        <div class="filler-practice-box">
          <div class="filler-practice-header">
            <span class="filler-practice-label">🎤 따라 말하기 연습</span>
            <button
              type="button"
              class="filler-mic-btn"
              id="micBtn_${f.id}"
              onclick="toggleFillerMic('${f.id}', '${safeEscapeForJs(f.phrase)}')"
              title="마이크로 발음해보기"
            >
              🎤 마이크 켜기
            </button>
          </div>
          <div class="filler-stt-result" id="sttResult_${f.id}">
            <span style="color: var(--text-sub); font-size: 12px;">마이크를 누르고 이 필러나 예문을 말해보세요.</span>
          </div>
          <div class="filler-stt-feedback" id="sttFeedback_${f.id}"></div>
        </div>
      </div>
    `;
    })
    .join("");
}

// 필러 문구 하이라이트 헬퍼 함수
function highlightFillerWords(text, phrase) {
  if (!text) return "";
  let cleanText = safeEscapeHtml(text);
  
  // phrase에서 핵심 키워드들 추출 (예: "Let me see... / Let's see..." -> ["Let me see", "Let's see"])
  const phrases = phrase
    .split("/")
    .map((p) => p.replace(/[\.\.\.]/g, "").trim())
    .filter(Boolean);

  phrases.forEach((p) => {
    // 대소문자 무시하고 매칭
    const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = new RegExp(`(${escaped})`, "gi");
    cleanText = cleanText.replace(reg, "<mark>$1</mark>");
  });

  return cleanText;
}

// JS 문자열용 escape 헬퍼
function safeEscapeForJs(str) {
  if (!str) return "";
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// 필러 전용 TTS 재생 함수
function playFillerTTS(text) {
  if (!text) return;
  stopTTS();
  const speed =
    typeof currentTtsSpeed !== "undefined" ? currentTtsSpeed : 1.0;
  speakEn(text, speed);
}

// ── 필러 전용 STT (Speech to Text) 마이크 인터랙션 ──
let fillerActiveMicId = null;
let fillerRecognition = null;

function toggleFillerMic(fillerId, targetPhrase) {
  const btn = document.getElementById(`micBtn_${fillerId}`);
  const resultEl = document.getElementById(`sttResult_${fillerId}`);
  const feedbackEl = document.getElementById(`sttFeedback_${fillerId}`);

  // 이미 켜져있는 마이크가 있다면 중단
  if (fillerActiveMicId && fillerActiveMicId === fillerId) {
    stopFillerMic();
    return;
  }

  // 이전 마이크 끄기
  if (fillerActiveMicId) {
    stopFillerMic();
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (resultEl) {
      resultEl.innerHTML = `<span style="color: var(--danger-text); font-size: 12px;">❌ 이 브라우저는 음성 인식을 지원하지 않습니다. (Chrome 추천)</span>`;
    }
    return;
  }

  try {
    fillerRecognition = new SpeechRecognition();
    fillerRecognition.lang = "en-US";
    fillerRecognition.continuous = false;
    fillerRecognition.interimResults = true;

    fillerActiveMicId = fillerId;
    if (btn) {
      btn.classList.add("listening");
      btn.innerHTML = `🔴 듣는 중...`;
    }
    if (resultEl) {
      resultEl.innerHTML = `<span style="color: #16a34a; font-size: 12px;">말씀하세요... (음성을 듣고 있습니다)</span>`;
    }
    if (feedbackEl) {
      feedbackEl.style.display = "none";
      feedbackEl.className = "filler-stt-feedback";
    }

    fillerRecognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }

      if (resultEl) {
        resultEl.textContent = `🗣️ "${transcript}"`;
      }

      // 최종 인식 시 검증
      if (event.results[0].isFinal) {
        evaluateFillerSpeech(transcript, targetPhrase, feedbackEl, fillerId);
      }
    };

    fillerRecognition.onerror = (event) => {
      console.warn("필러 STT 오류:", event.error);
      if (resultEl) {
        resultEl.innerHTML = `<span style="color: var(--danger-text); font-size: 12px;">음성 인식 오류 (${event.error})</span>`;
      }
      stopFillerMic();
    };

    fillerRecognition.onend = () => {
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
  if (fillerActiveMicId) {
    const btn = document.getElementById(`micBtn_${fillerActiveMicId}`);
    if (btn) {
      btn.classList.remove("listening");
      btn.innerHTML = `🎤 마이크 켜기`;
    }
    fillerActiveMicId = null;
  }
}

function evaluateFillerSpeech(spokenText, targetPhrase, feedbackEl, fillerId) {
  if (!feedbackEl || !spokenText) return;

  const spokenLower = spokenText.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const targetKeywords = targetPhrase
    .toLowerCase()
    .split("/")
    .map((k) => k.replace(/[^a-z0-9 ]/g, "").trim())
    .filter(Boolean);

  const isMatched = targetKeywords.some((keyword) => {
    // 키워드의 핵심 단어들이 포함되어 있는지 검사
    const words = keyword.split(" ").filter(Boolean);
    return words.every((w) => spokenLower.includes(w));
  });

  if (isMatched) {
    feedbackEl.innerHTML = `🎉 멋져요! 필러 표현이 자연스럽게 인식되었습니다.`;
    feedbackEl.className = "filler-stt-feedback pass";
    feedbackEl.style.display = "block";

    // 자동으로 마스터 상태로 승급
    if (!fillerProgress[fillerId]) {
      fillerProgress[fillerId] = true;
      saveFillerProgress();
      const card = document.getElementById(`card_${fillerId}`);
      if (card) card.classList.add("mastered");
      const masterBtn = card ? card.querySelector(".btn-filler-master") : null;
      if (masterBtn) {
        masterBtn.classList.add("active");
        masterBtn.textContent = "✓ 숙달됨";
      }
      updateFillerTabsCount();
    }
  } else {
    feedbackEl.innerHTML = `💡 필러 표현("${targetPhrase}")을 포함하여 조금 더 또렷하게 발음해보세요!`;
    feedbackEl.className = "filler-stt-feedback miss";
    feedbackEl.style.display = "block";
  }
}

// 필러 화면 열기
function showFillerScreen() {
  hideAllScreens();
  const screen = document.getElementById("fillerScreen");
  if (screen) {
    screen.style.display = "block";
    renderFillerList();
    updateFillerTabsCount();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
