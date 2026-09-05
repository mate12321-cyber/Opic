/**
 * [speech.js] 음성 기능(TTS / STT) 및 발음 평가, AI 팝업 시스템
 * - Web Speech API TTS (음성 재생, 속도 조절, 자동 재생)
 * - Web Speech API STT (실시간 음성 인식, 마이크 에러 감시)
 * - 발음/문장 일치도(Diff & Score) 평가 알고리즘
 * - 실시간 번역 및 Google AI 보조 팝업 창 연동
 */

// HTML 특수문자 이스케이프 유틸
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 클립보드 텍스트 복사 및 버튼 피드백 토글
function copyText(text, btn) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (btn) {
          const original = btn.innerHTML;
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>복사됨 ✓</span>`;
          btn.classList.add("copied");
          setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove("copied");
          }, 1500);
        }
      })
      .catch(() => fallbackCopy(text, btn));
  } else {
    fallbackCopy(text, btn);
  }
}

// 클립보드 API 미지원 환경용 대체 복사 함수
function fallbackCopy(text, btn) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.top = "0";
  ta.style.left = "0";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>복사됨 ✓</span>`;
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove("copied");
      }, 1500);
    }
  } catch (err) {
    alert("복사하지 못했어요: " + text);
  }
  document.body.removeChild(ta);
}

// PC/맥북 화면 우측에 고정 너비로 Google AI 사이드 팝업창 띄우기
function openSidePopup(url, title = "GoogleAI_Popup") {
  const width = 640;
  const height = 750;
  const screenWidth = window.screen.availWidth || window.innerWidth;
  const screenHeight = window.screen.availHeight || window.innerHeight;
  const left = Math.max(0, screenWidth - width - 30);
  const top = Math.max(0, Math.floor((screenHeight - height) / 2));
  const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no`;
  const popup = window.open(url, title, features);
  if (popup && popup.focus) {
    popup.focus();
  }
  return popup;
}

// 문장 번역용 Google AI 검색 프롬프트 쿼리 생성
function buildGoogleQuery() {
  const answer = els.userInput.value.trim();
  const ko = els.koText.textContent.trim();
  return `"${ko}"를 영어로 "${answer}"라고 썼는데 이 영어 문장 문법 분석해줘`;
}

// 문법 포인트용 Google AI 검색 프롬프트 쿼리 생성
function buildWordGoogleQuery(item) {
  return `'${item.answer}' 표현은 언제 사용해?`;
}

// ── TTS (음성 합성) 시스템 ──────────────────────────────────────────
let ttsRate = 1.0; // 기본 발음 재생 속도
let autoPlayTtsEnabled = false; // 정답 확인 시 자동 재생 여부
let currentSpeakingBtn = null; // 현재 재생 중인 버튼 엘리먼트
const TTS_SETTINGS_KEY = "ko-en-opic-tts-settings";

// 로컬 스토리지에서 TTS 설정값 로드
function loadTtsSettings() {
  try {
    const raw = localStorage.getItem(TTS_SETTINGS_KEY);
    if (raw) {
      const settings = JSON.parse(raw);
      if (settings.rate) ttsRate = parseFloat(settings.rate);
      if (typeof settings.autoPlay === "boolean")
        autoPlayTtsEnabled = settings.autoPlay;
    }
  } catch (e) {}
  updateTtsSettingsUI();
}

// TTS 설정값을 로컬 스토리지에 저장
function saveTtsSettings() {
  try {
    localStorage.setItem(
      TTS_SETTINGS_KEY,
      JSON.stringify({ rate: ttsRate, autoPlay: autoPlayTtsEnabled }),
    );
  } catch (e) {}
}

// UI 칩 및 체크박스 상태를 현재 TTS 설정값에 맞게 동기화
function updateTtsSettingsUI() {
  document.querySelectorAll(".speed-chip").forEach((chip) => {
    if (parseFloat(chip.dataset.speed) === ttsRate) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });
  if (els.autoPlayTts) {
    els.autoPlayTts.checked = autoPlayTtsEnabled;
  }
}

// TTS 음성 엔진 초기화 및 속도/자동재생 이벤트 바인딩
function initTTS() {
  if (!("speechSynthesis" in window)) {
    if (els.audioControls) els.audioControls.style.display = "none";
    document
      .querySelectorAll(".tts-btn")
      .forEach((b) => (b.style.display = "none"));
    return;
  }
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
  }
  document.querySelectorAll(".speed-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      ttsRate = parseFloat(chip.dataset.speed) || 1.0;
      saveTtsSettings();
      updateTtsSettingsUI();
    });
  });
  if (els.autoPlayTts) {
    els.autoPlayTts.addEventListener("change", (e) => {
      autoPlayTtsEnabled = e.target.checked;
      saveTtsSettings();
    });
  }
}

// 언어별 가장 자연스러운 여성 고품질 시스템 보이스 탐색 (삼성 브라우저/갤럭시/안드로이드/iOS/PC 완벽 대응)
function getBestVoice(lang = "en-US") {
  if (!("speechSynthesis" in window)) return null;
  const voices = speechSynthesis.getVoices();
  const langPrefix = lang.split("-")[0].toLowerCase();
  const langVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(langPrefix),
  );
  if (!langVoices.length) return null;

  // 1. 여성 전용 프리미엄 보이스 키워드 (삼성 브라우저/삼성 TTS, 구글 TTS, iOS/macOS, Windows)
  const femaleKeywords = [
    "female",
    "여성",
    "smtf",
    "f00",
    "voice 1",
    "voice_1",
    "voice1",
    "samantha",
    "karen",
    "ava",
    "victoria",
    "zoe",
    "allison",
    "susan",
    "zira",
    "yuna",
    "en-us-x-sfg#female",
    "en-us-x-tpf-local",
    "natural",
    "google us english",
  ];

  // 남성 전용 키워드 (제외 대상)
  const maleKeywords = [
    "male",
    "남성",
    "smtm",
    "m00",
    "daniel",
    "david",
    "george",
    "guy",
    "alex",
    "fred",
    "en-us-x-sfg#male",
  ];

  // 1단계: 여성 키워드가 명시적으로 포함된 보이스 탐색
  for (const kw of femaleKeywords) {
    const found = langVoices.find((v) => {
      const name = (v.name + " " + (v.voiceURI || "")).toLowerCase();
      const isMale = maleKeywords.some((m) => name.includes(m));
      return !isMale && name.includes(kw);
    });
    if (found) return found;
  }

  // 2단계: 남성 키워드가 없는 영어 보이스 중 첫 번째 보이스 선택
  const nonMale = langVoices.find((v) => {
    const name = (v.name + " " + (v.voiceURI || "")).toLowerCase();
    return !maleKeywords.some((m) => name.includes(m));
  });
  if (nonMale) return nonMale;

  // 3단계: 기본 fallback
  const exact = langVoices.find(
    (v) => v.lang.toLowerCase() === lang.toLowerCase(),
  );
  return exact || langVoices[0];
}

// 진행 중인 모든 TTS 음성 재생 중단
function stopTTS() {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
  if (currentSpeakingBtn) {
    currentSpeakingBtn.classList.remove("playing");
    const label = currentSpeakingBtn.dataset.originalLabel;
    if (label) currentSpeakingBtn.innerHTML = label;
    currentSpeakingBtn = null;
  }
}

// 텍스트를 음성으로 재생하고 버튼 상태 애니메이션 토글
function speakText(text, lang = "en-US", btn = null) {
  if (!("speechSynthesis" in window) || !text) return;
  if (currentSpeakingBtn === btn && speechSynthesis.speaking) {
    stopTTS();
    return;
  }
  stopTTS();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = ttsRate;
  utterance.pitch = 1.22; // ⚡ 여성 아나운서 톤으로 피치(음높이)를 상향하여 남성 보이스 환경에서도 여성 톤 출력 보장
  const voice = getBestVoice(lang);
  if (voice) utterance.voice = voice;

  if (btn) {
    currentSpeakingBtn = btn;
    btn.dataset.originalLabel = btn.innerHTML;
    btn.classList.add("playing");
    btn.innerHTML = "⏹ 정지";
    utterance.onend = () => {
      btn.classList.remove("playing");
      if (btn.dataset.originalLabel) btn.innerHTML = btn.dataset.originalLabel;
      if (currentSpeakingBtn === btn) currentSpeakingBtn = null;
    };
    utterance.onerror = () => {
      btn.classList.remove("playing");
      if (btn.dataset.originalLabel) btn.innerHTML = btn.dataset.originalLabel;
      if (currentSpeakingBtn === btn) currentSpeakingBtn = null;
    };
  }
  speechSynthesis.speak(utterance);
}

// ── 발음 및 문장 일치도 평가 시스템 ──────────────────────────────────
// 평가 비교를 위한 텍스트 정규화 (소문자화 및 특수문자 제거)
function normalizeForEval(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 유저 입력값과 모범 답안 토큰을 비교하여 일치도 점수(0~100%) 및 Diff HTML 산출
function evaluateSpeech(userInput, modelAnswer) {
  const normUser = normalizeForEval(userInput);
  const normModel = normalizeForEval(modelAnswer);
  if (!normModel)
    return { score: 0, diffHtml: "", feedback: "모범 답안이 없습니다." };
  if (!normUser) {
    return {
      score: 0,
      diffHtml: "<span class='eval-word miss'>입력된 음성이 없습니다.</span>",
      feedback: "마이크를 누르고 영어로 말해보세요.",
    };
  }

  const userTokens = normUser.split(" ").filter(Boolean);
  const modelTokens = normModel.split(" ").filter(Boolean);

  let matchCount = 0;
  const matchedUserIndices = new Set();
  const diffParts = [];

  modelTokens.forEach((targetWord) => {
    let foundIdx = -1;
    for (let j = 0; j < userTokens.length; j++) {
      if (!matchedUserIndices.has(j) && userTokens[j] === targetWord) {
        foundIdx = j;
        break;
      }
    }
    if (foundIdx !== -1) {
      matchedUserIndices.add(foundIdx);
      matchCount++;
      diffParts.push(
        `<span class="eval-word match">${escapeHtml(targetWord)}</span>`,
      );
    } else {
      diffParts.push(
        `<span class="eval-word miss">${escapeHtml(targetWord)}</span>`,
      );
    }
  });

  const extraWords = userTokens
    .filter((_, idx) => !matchedUserIndices.has(idx))
    .slice(0, 3);
  if (extraWords.length > 0) {
    diffParts.push(
      `<span class="eval-word actual">(추가 인식: ${extraWords.map(escapeHtml).join(", ")})</span>`,
    );
  }

  const score = Math.min(
    100,
    Math.round((matchCount / modelTokens.length) * 100),
  );
  let feedback = "";
  if (score >= 90)
    feedback = "🌟 훌륭합니다! 원어민 모범 답안과 거의 완벽하게 일치해요.";
  else if (score >= 70)
    feedback = "👍 잘하셨어요! 놓친 단어들을 확인하고 한 번 더 말해보세요.";
  else if (score >= 40)
    feedback =
      "💪 좋아요! 빨간색으로 표시된 단어에 유의해서 다시 연습해 보세요.";
  else feedback = "🌱 천천히 또박또박 모범 답안 발음을 듣고 따라 해보세요.";

  return { score, diffHtml: diffParts.join(" "), feedback };
}

// 발음 평가 점수 뱃지 및 차이점 피드백 UI 렌더링
function renderSpeechEvaluation(evalData) {
  if (
    !els.speechEvalBox ||
    !els.evalScoreBadge ||
    !els.evalDiff ||
    !els.evalFeedback
  )
    return;
  const { score, diffHtml, feedback } = evalData;
  els.evalScoreBadge.textContent = `${score}% 일치`;
  els.evalScoreBadge.className =
    "eval-score-badge " + (score >= 80 ? "high" : score >= 50 ? "mid" : "low");
  els.evalDiff.innerHTML = diffHtml;
  els.evalFeedback.textContent = feedback;
  els.speechEvalBox.classList.add("show");
}

// ── 문법 검사 및 실시간 번역 ──────────────────────────────────────────
// LanguageTool API를 활용한 영어 문법 검사
async function checkGrammar(text) {
  if (!text || text.length < 3) return [];
  const params = new URLSearchParams({ text, language: "en-US" });
  try {
    const res = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      body: params,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.matches || [];
  } catch (e) {
    return [];
  }
}

// 영문 텍스트를 한국어로 번역 (Google Translate API)
async function translateToKorean(text) {
  if (!text || !text.trim()) return "";
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=" +
      encodeURIComponent(text.trim());
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    return (data[0] || []).map((chunk) => chunk[0]).join("");
  } catch (e) {
    return "";
  }
}

// 문법 검사 결과 및 교정 제안 UI 렌더링
async function renderGrammarResults(matches, text) {
  els.grammarBox.classList.add("show");
  if (!matches || matches.length === 0) {
    els.grammarContent.innerHTML = `<div class="g-good">✓ 문법 오류가 발견되지 않았어요. 자연스러운 문장이에요!</div>`;
    return;
  }
  const translated = await translateToKorean(text);
  let html = translated
    ? `<div class="g-note" style="margin-bottom:8px">내 답 해석: "${escapeHtml(translated)}"</div>`
    : "";
  matches.slice(0, 3).forEach((m) => {
    const offset = m.offset;
    const len = m.length;
    const excerpt =
      escapeHtml(text.slice(0, offset)) +
      `<u>${escapeHtml(text.slice(offset, offset + len))}</u>` +
      escapeHtml(text.slice(offset + len, offset + len + 30));
    const repls = (m.replacements || [])
      .slice(0, 3)
      .map((r) => r.value)
      .join(", ");
    html += `<div class="g-item"><div class="g-excerpt">...${excerpt}...</div><div class="g-msg">${escapeHtml(m.message)}</div>${repls ? `<div class="g-fix">추천 수정: ${escapeHtml(repls)}</div>` : ""}</div>`;
  });
  els.grammarContent.innerHTML = html;
}

let translateTimer = null;
// 음성 인식 / 입력 중 실시간 한국어 번역 프리뷰 실행
async function runLiveTranslate(text) {
  if (!text.trim()) {
    els.liveTranslate.classList.remove("show");
    els.liveTranslateText.textContent = "";
    return;
  }
  els.liveTranslate.classList.add("show");
  els.liveTranslateText.textContent = "번역 중...";
  els.liveTranslateText.classList.add("loading");
  const translated = await translateToKorean(text);
  els.liveTranslateText.classList.remove("loading");
  if (translated) {
    els.liveTranslateText.textContent = translated;
  } else {
    els.liveTranslate.classList.remove("show");
  }
}

// ── STT (음성 인식) 시스템 ──────────────────────────────────────────
let recognition = null;
let listening = false;
let micStartTimer = null;
let micStarted = false;
let activeTarget = null;
let baseTranscript = "";
let finalTranscript = "";

const MIC_ERROR_MESSAGES = {
  "not-allowed":
    "마이크 권한이 필요해요. 브라우저 주소창의 🔒 아이콘 → 마이크 → 허용으로 설정해주세요.",
  "permission-denied":
    "마이크 권한이 필요해요. 브라우저 주소창의 🔒 아이콘 → 마이크 → 허용으로 설정해주세요.",
  "service-not-allowed":
    "이 브라우저는 음성 인식 서비스를 지원하지 않아요. Chrome 브라우저에서 시도해보세요.",
  "no-speech":
    "음성이 감지되지 않았어요. 마이크를 가까이 대고 다시 말씀해주세요.",
  network:
    "네트워크 오류로 음성을 인식하지 못했어요. 인터넷 연결을 확인해주세요.",
};

// 마이크 오류 메시지 출력
function showMicError(msg, errorEl) {
  const targetEl =
    errorEl || (activeTarget && activeTarget.error) || els.micError;
  if (!targetEl) return;
  targetEl.textContent = msg;
  targetEl.classList.add("show");
}

// 마이크 오류 메시지 초기화
function clearMicError(errorEl) {
  const targetEl =
    errorEl || (activeTarget && activeTarget.error) || els.micError;
  if (!targetEl) return;
  targetEl.textContent = "";
  targetEl.classList.remove("show");
}

// 마이크 수신 상태 UI 비활성화
function stopListeningUI() {
  listening = false;
  micStarted = false;
  if (micStartTimer) {
    clearTimeout(micStartTimer);
    micStartTimer = null;
  }
  if (activeTarget && activeTarget.btn) {
    activeTarget.btn.classList.remove("listening");
  }
  if (els.micBtn) els.micBtn.classList.remove("listening");
  if (els.opicMicBtn) els.opicMicBtn.classList.remove("listening");
}

// 음성 인식 중단
function stopSpeechRecognition() {
  stopListeningUI();
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {}
  }
  activeTarget = null;
}

// 마이크 응답 없음 감시 타이머 (Watchdog)
function armStartupWatchdog() {
  if (micStartTimer) clearTimeout(micStartTimer);
  micStartTimer = setTimeout(() => {
    if (listening && !micStarted) {
      showMicError(
        "마이크가 시작되지 않았어요. 브라우저 설정에서 마이크 권한을 확인해주세요.",
      );
      stopSpeechRecognition();
    }
  }, 3500);
}

// 음성 인식 토글 함수 (문장 연습 및 OPIc 실전 모드 공용)
function toggleSpeechRecognition(
  targetInput,
  targetBtn,
  targetError,
  isOpic = false,
) {
  if (!recognition) {
    initSpeechRecognition();
    if (!recognition) {
      showMicError(
        "이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.",
        targetError,
      );
      return;
    }
  }

  // 이미 듣고 있는 상태에서 같은 버튼을 눌렀을 때 -> 정지
  if (listening && activeTarget && activeTarget.btn === targetBtn) {
    stopSpeechRecognition();
    return;
  }

  // 다른 버튼이 눌렸다면 이전 인식 중단
  if (listening) {
    stopSpeechRecognition();
  }

  clearMicError(targetError);
  activeTarget = {
    input: targetInput,
    btn: targetBtn,
    error: targetError,
    isOpic,
  };

  baseTranscript = targetInput ? targetInput.value.trim() : "";
  finalTranscript = "";
  listening = true;
  micStarted = false;

  armStartupWatchdog();
  if (targetBtn) targetBtn.classList.add("listening");

  if (isOpic && typeof startSpeakingTimer === "function") {
    startSpeakingTimer();
  }

  try {
    recognition.start();
  } catch (e) {
    showMicError("마이크를 시작하지 못했어요. 다시 시도해주세요.", targetError);
    stopSpeechRecognition();
  }
}

// Web Speech API 음성 인식기 초기화
function initSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    micStarted = true;
    if (micStartTimer) {
      clearTimeout(micStartTimer);
      micStartTimer = null;
    }
    clearMicError();
    if (activeTarget && activeTarget.btn) {
      activeTarget.btn.classList.add("listening");
    }
  };

  recognition.onresult = (e) => {
    let accumulatedFinal = "";
    let interim = "";
    for (let i = 0; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        accumulatedFinal += (accumulatedFinal ? " " : "") + transcript.trim();
      } else {
        interim += transcript;
      }
    }

    // 마이크 시작 전 기존 텍스트 + 확정된 음성 텍스트 + 현재 발화 중인 임시 텍스트 결합
    let currentText = baseTranscript;
    if (accumulatedFinal) {
      currentText += (currentText ? " " : "") + accumulatedFinal;
    }
    if (interim) {
      currentText += (currentText ? " " : "") + interim;
    }

    if (activeTarget && activeTarget.input) {
      activeTarget.input.value = currentText;
      activeTarget.input.dispatchEvent(new Event("input"));
    }
  };

  recognition.onerror = (e) => {
    if (e.error === "aborted") return;
    const msg =
      MIC_ERROR_MESSAGES[e.error] ||
      `마이크 오류가 발생했어요 (${e.error}). 다시 시도해주세요.`;
    showMicError(msg);
    stopSpeechRecognition();
  };

  recognition.onend = () => {
    stopListeningUI();
  };
}
