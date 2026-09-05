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

// ── TTS (음성 합성) 하이브리드 시스템 ──────────────────────────────
let ttsRate = 1.0; // 기본 발음 재생 속도
let autoPlayTtsEnabled = false; // 정답 확인 시 자동 재생 여부
let ttsEngine = "azure"; // "azure" | "google" | "native"
let azureApiKey = ""; // Azure Speech API Key
let azureRegion = "eastus"; // Azure Speech Region
let azureVoice = "en-US-JennyNeural"; // "en-US-JennyNeural" | "en-US-AriaNeural" | "en-US-GuyNeural"
let currentSpeakingBtn = null; // 현재 재생 중인 버튼 엘리먼트
let activeAudio = null; // 현재 재생 중인 Audio 인스턴스
const TTS_SETTINGS_KEY = "ko-en-opic-tts-settings";

// XML 이스케이프 유틸
function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 로컬 스토리지에서 TTS 설정값 로드
function loadTtsSettings() {
  try {
    const raw = localStorage.getItem(TTS_SETTINGS_KEY);
    if (raw) {
      const settings = JSON.parse(raw);
      if (settings.rate) ttsRate = parseFloat(settings.rate);
      if (typeof settings.autoPlay === "boolean")
        autoPlayTtsEnabled = settings.autoPlay;
      if (settings.engine) ttsEngine = settings.engine;
      if (settings.azureApiKey !== undefined) azureApiKey = settings.azureApiKey;
      if (settings.azureRegion) azureRegion = settings.azureRegion;
      if (settings.azureVoice) azureVoice = settings.azureVoice;
    }
  } catch (e) {}
  updateTtsSettingsUI();
}

// TTS 설정값을 로컬 스토리지에 저장
function saveTtsSettings() {
  try {
    localStorage.setItem(
      TTS_SETTINGS_KEY,
      JSON.stringify({
        rate: ttsRate,
        autoPlay: autoPlayTtsEnabled,
        engine: ttsEngine,
        azureApiKey: azureApiKey,
        azureRegion: azureRegion,
        azureVoice: azureVoice,
      }),
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

// TTS 모달 UI 이벤트 바인딩 및 캐시 통계 갱신
function initTtsSettingsModal() {
  const modal = document.getElementById("ttsSettingsModal");
  if (!modal) return;

  const openBtns = [
    document.getElementById("openTtsSettingsBtn"),
    document.getElementById("openTtsSettingsBtnCard"),
  ].filter(Boolean);

  const closeBtn = document.getElementById("closeTtsModalBtn");
  const saveBtn = document.getElementById("saveTtsModalBtn");
  const engineSelect = document.getElementById("ttsEngineSelect");
  const azureKeyInput = document.getElementById("azureApiKeyInput");
  const azureRegionInput = document.getElementById("azureRegionInput");
  const azureVoiceSelect = document.getElementById("azureVoiceSelect");
  const azureSection = document.getElementById("azureSettingsSection");
  const cacheBadge = document.getElementById("cacheStatsBadge");
  const clearCacheBtn = document.getElementById("clearCacheBtn");
  const azureTestBtn = document.getElementById("azureTestBtn");

  // 캐시 통계 업데이트
  async function refreshCacheStats() {
    if (!cacheBadge || !window.AudioCache) return;
    try {
      const stats = await window.AudioCache.getStats();
      cacheBadge.textContent = `${stats.count}개 보관 중 (${stats.sizeFormatted})`;
    } catch (e) {
      cacheBadge.textContent = "0개 (0 KB)";
    }
  }

  // 모달 열기
  function openModal() {
    if (engineSelect) engineSelect.value = ttsEngine;
    if (azureKeyInput) azureKeyInput.value = azureApiKey || "";
    if (azureRegionInput) azureRegionInput.value = azureRegion || "eastus";
    if (azureVoiceSelect) azureVoiceSelect.value = azureVoice || "en-US-JennyNeural";

    if (azureSection) {
      azureSection.style.display = ttsEngine === "azure" ? "flex" : "none";
    }

    refreshCacheStats();
    modal.classList.add("show");
  }

  // 모달 닫기
  function closeModal() {
    modal.classList.remove("show");
  }

  openBtns.forEach((btn) => btn.addEventListener("click", openModal));
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  if (engineSelect && azureSection) {
    engineSelect.addEventListener("change", (e) => {
      azureSection.style.display = e.target.value === "azure" ? "flex" : "none";
    });
  }

  // 저장 버튼
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (engineSelect) ttsEngine = engineSelect.value;
      if (azureKeyInput) azureApiKey = azureKeyInput.value.trim();
      if (azureRegionInput) azureRegion = azureRegionInput.value.trim() || "eastus";
      if (azureVoiceSelect) azureVoice = azureVoiceSelect.value;

      saveTtsSettings();
      saveBtn.textContent = "저장 완료 ✓";
      setTimeout(() => {
        saveBtn.textContent = "저장 및 적용";
        closeModal();
      }, 500);
    });
  }

  // Azure 테스트 버튼
  if (azureTestBtn) {
    azureTestBtn.addEventListener("click", async () => {
      const originalText = azureTestBtn.innerHTML;
      azureTestBtn.innerHTML = "⏳ 테스트 음성 생성 중...";
      azureTestBtn.disabled = true;

      const tempKey = azureKeyInput ? azureKeyInput.value.trim() : azureApiKey;
      const tempRegion = azureRegionInput ? azureRegionInput.value.trim() : azureRegion;
      const tempVoice = azureVoiceSelect ? azureVoiceSelect.value : azureVoice;

      if (!tempKey) {
        alert("Azure API Key를 입력해주세요. (없을 시 Google 번역기 무료 음성을 선택할 수 있습니다)");
        azureTestBtn.innerHTML = originalText;
        azureTestBtn.disabled = false;
        return;
      }

      try {
        const ratePercent = Math.round((ttsRate - 1.0) * 100);
        const rateStr = (ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`);
        const endpoint = `https://${tempRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
        const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
          `<voice name='${tempVoice}'>` +
          `<prosody rate='${rateStr}'>Hello! I am your AI native English speaking tutor.</prosody>` +
          `</voice></speak>`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": tempKey,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
            "User-Agent": "OPIc-Trainer-App",
          },
          body: ssml,
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          throw new Error(`Azure 응답 에러 (${res.status}): ${errBody || "키 또는 지역명을 확인하세요."}`);
        }

        const blob = await res.blob();
        azureTestBtn.innerHTML = "🔊 재생 중...";
        await playAudioBlob(blob, null);
        azureTestBtn.innerHTML = "✅ 연결 및 재생 성공!";
        setTimeout(() => {
          azureTestBtn.innerHTML = originalText;
          azureTestBtn.disabled = false;
        }, 1500);
      } catch (err) {
        alert("Azure TTS 연결 실패:\n" + err.message);
        azureTestBtn.innerHTML = originalText;
        azureTestBtn.disabled = false;
      }
    });
  }

  // 캐시 비우기 버튼
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener("click", async () => {
      if (confirm("저장된 모든 오디오 캐시를 비우시겠습니까?")) {
        if (window.AudioCache) {
          await window.AudioCache.clearAll();
          refreshCacheStats();
          alert("오디오 캐시가 모두 비워졌습니다.");
        }
      }
    });
  }
}

// TTS 음성 엔진 초기화 및 속도/자동재생 이벤트 바인딩
function initTTS() {
  loadTtsSettings();
  initTtsSettingsModal();

  if (speechSynthesis && speechSynthesis.onvoiceschanged !== undefined) {
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

  // 1. 여성 전용 프리미엄 보이스 키워드
  const femaleKeywords = [
    "여성",
    "smtf",
    "f00",
    "ava",
    "victoria",
    "zoe",
    "allison",
    "susan",
    "zira",
    "yuna",
    "en-us-x-sfg#female",
    "en-us-x-tpf-local",
  ];

  // 남성 전용 키워드 (제외 대상)
  const maleKeywords = [
    "male",
    "남성",
    "smtm",
    "m00",
    "george",
    "guy",
    "alex",
    "fred",
    "en-us-x-sfg#male",
  ];

  for (const kw of femaleKeywords) {
    const found = langVoices.find((v) => {
      const name = (v.name + " " + (v.voiceURI || "")).toLowerCase();
      const isMale = maleKeywords.some((m) => name.includes(m));
      return !isMale && name.includes(kw);
    });
    if (found) return found;
  }

  const nonMale = langVoices.find((v) => {
    const name = (v.name + " " + (v.voiceURI || "")).toLowerCase();
    return !maleKeywords.some((m) => name.includes(m));
  });
  if (nonMale) return nonMale;

  const exact = langVoices.find(
    (v) => v.lang.toLowerCase() === lang.toLowerCase(),
  );
  return exact || langVoices[0];
}

// 진행 중인 모든 TTS 음성 재생 중단
function stopTTS() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = "";
    } catch (e) {}
    activeAudio = null;
  }
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

// 버튼 상태를 '재생 중'으로 시작
function setButtonPlaying(btn) {
  if (!btn) return;
  currentSpeakingBtn = btn;
  if (!btn.dataset.originalLabel) {
    btn.dataset.originalLabel = btn.innerHTML;
  }
  btn.classList.add("playing");
  btn.innerHTML = "⏹ 정지";
}

// 버튼 상태를 원래대로 복원
function resetCurrentButton() {
  if (currentSpeakingBtn) {
    currentSpeakingBtn.classList.remove("playing");
    if (currentSpeakingBtn.dataset.originalLabel) {
      currentSpeakingBtn.innerHTML = currentSpeakingBtn.dataset.originalLabel;
    }
    currentSpeakingBtn = null;
  }
}

// Azure Speech REST API 호출 (Blob 반환)
async function fetchAzureTtsAudio(text, voice = "en-US-JennyNeural", rate = 1.0) {
  if (!azureApiKey || !azureApiKey.trim()) {
    throw new Error("Azure API Key가 설정되지 않았습니다.");
  }
  const endpoint = `https://${azureRegion.trim()}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ratePercent = Math.round((rate - 1.0) * 100);
  const rateStr = (ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`);
  
  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
    `<voice name='${voice}'>` +
    `<prosody rate='${rateStr}'>${escapeXml(text)}</prosody>` +
    `</voice></speak>`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": azureApiKey.trim(),
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "OPIc-Trainer-App",
    },
    body: ssml,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Azure TTS Error (${res.status}): ${errText}`);
  }

  return await res.blob();
}

// Google Translate TTS 호출 (Blob 반환)
async function fetchGoogleTtsAudio(text, lang = "en-US") {
  const cleanLang = lang.startsWith("ko") ? "ko" : "en";
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${cleanLang}&client=tw-ob&q=${encodeURIComponent(text.slice(0, 200))}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google TTS Error (${res.status})`);
  }
  return await res.blob();
}

// Audio Blob을 HTMLAudioElement로 재생
function playAudioBlob(blob, btn) {
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      activeAudio = audio;
      setButtonPlaying(btn);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        activeAudio = null;
        resetCurrentButton();
        resolve();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        activeAudio = null;
        resetCurrentButton();
        reject(e);
      };
      audio.play().catch((err) => {
        URL.revokeObjectURL(audioUrl);
        activeAudio = null;
        resetCurrentButton();
        reject(err);
      });
    } catch (err) {
      resetCurrentButton();
      reject(err);
    }
  });
}

// Web Speech API (브라우저 기본 TTS) 폴백 재생
function playNativeTTS(text, lang = "en-US", btn = null) {
  if (!("speechSynthesis" in window) || !text) {
    resetCurrentButton();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = ttsRate;
  if (!lang.startsWith("ko")) {
    utterance.pitch = 1.22; // 여성 아나운서 톤
  }
  const voice = getBestVoice(lang);
  if (voice) utterance.voice = voice;

  setButtonPlaying(btn);

  utterance.onend = () => resetCurrentButton();
  utterance.onerror = () => resetCurrentButton();

  speechSynthesis.speak(utterance);
}

// 텍스트를 음성으로 재생하는 메인 하이브리드 함수
async function speakText(text, lang = "en-US", btn = null) {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  // 재생 중인 버튼을 다시 누르면 즉시 정지
  if (currentSpeakingBtn === btn && (activeAudio || (window.speechSynthesis && speechSynthesis.speaking))) {
    stopTTS();
    return;
  }
  stopTTS();

  const isKorean = lang.startsWith("ko");
  const effectiveEngine = isKorean ? "google" : ttsEngine;
  const voiceName = isKorean ? "ko-KR" : (azureVoice || "en-US-JennyNeural");

  // 1단계: IndexedDB 캐시 확인 (오디오 영구 보존 & 0자 소모)
  const cacheKey = window.AudioCache
    ? window.AudioCache.makeKey(effectiveEngine, voiceName, cleanText, ttsRate)
    : null;

  if (cacheKey && window.AudioCache) {
    try {
      const cachedBlob = await window.AudioCache.getAudio(cacheKey);
      if (cachedBlob) {
        await playAudioBlob(cachedBlob, btn);
        return;
      }
    } catch (e) {
      console.warn("[TTS] Cache lookup failed:", e);
    }
  }

  // 2단계: Azure Neural TTS 시도 (영어이고 Azure 설정 유효 시)
  if (!isKorean && effectiveEngine === "azure" && azureApiKey && azureApiKey.trim()) {
    try {
      const blob = await fetchAzureTtsAudio(cleanText, voiceName, ttsRate);
      if (window.AudioCache && cacheKey) {
        window.AudioCache.saveAudio(cacheKey, blob, cleanText);
      }
      await playAudioBlob(blob, btn);
      return;
    } catch (err) {
      console.warn("[TTS] Azure Neural TTS failed, trying fallback:", err.message);
    }
  }

  // 3단계: Google TTS 시도 (짧은 단어 및 200자 이하 문장)
  if (cleanText.length <= 200) {
    try {
      const blob = await fetchGoogleTtsAudio(cleanText, lang);
      if (window.AudioCache && cacheKey) {
        window.AudioCache.saveAudio(cacheKey, blob, cleanText);
      }
      await playAudioBlob(blob, btn);
      return;
    } catch (err) {
      console.warn("[TTS] Google TTS failed, falling back to Web Speech API:", err.message);
    }
  }

  // 4단계: 브라우저 기본 Web Speech API 최종 폴백
  playNativeTTS(cleanText, lang, btn);
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
