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
      if (settings.azureApiKey !== undefined)
        azureApiKey = settings.azureApiKey;
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

// ── Azure Speech F0 무료 한도(5시간 / 50만자) 실시간 사용량 추적기 ──────
const AZURE_USAGE_STORAGE_KEY = "ko-en-opic-azure-f0-usage";
const AZURE_F0_AUDIO_LIMIT_SEC = 5 * 3600; // 5시간 = 18,000초 = 300분
const AZURE_F0_TTS_CHAR_LIMIT = 500000; // 500,000자

function getCurrentYearMonth() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getCurrentYearMonthLabel() {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function getAzureMonthlyUsage() {
  const currentMonth = getCurrentYearMonth();
  let data = {
    month: currentMonth,
    audioSeconds: 0,
    ttsChars: 0,
    requestCount: 0,
  };

  try {
    const raw = localStorage.getItem(AZURE_USAGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.month === currentMonth) {
        data = {
          month: currentMonth,
          audioSeconds: Number(parsed.audioSeconds) || 0,
          ttsChars: Number(parsed.ttsChars) || 0,
          requestCount: Number(parsed.requestCount) || 0,
        };
      } else {
        // 새 달이 되면 자동 0으로 리셋 후 새 월 저장
        saveAzureMonthlyUsage(data);
      }
    }
  } catch (e) {}

  const audioSec = Math.round(data.audioSeconds);
  const audioMin = Math.floor(audioSec / 60);
  const audioRemSec = audioSec % 60;
  const audioRemainingSec = Math.max(0, AZURE_F0_AUDIO_LIMIT_SEC - audioSec);
  const audioRemHours = Math.floor(audioRemainingSec / 3600);
  const audioRemMins = Math.floor((audioRemainingSec % 3600) / 60);

  const audioPercent = Math.min(
    100,
    (audioSec / AZURE_F0_AUDIO_LIMIT_SEC) * 100,
  );
  const ttsPercent = Math.min(
    100,
    (data.ttsChars / AZURE_F0_TTS_CHAR_LIMIT) * 100,
  );
  const ttsRemainingChars = Math.max(
    0,
    AZURE_F0_TTS_CHAR_LIMIT - data.ttsChars,
  );

  return {
    month: data.month,
    monthLabel: getCurrentYearMonthLabel(),
    audioSeconds: audioSec,
    audioFormatted: `${audioMin}분 ${audioRemSec}초`,
    audioPercent: audioPercent.toFixed(1),
    audioRemainingFormatted: `${audioRemHours}시간 ${String(audioRemMins).padStart(2, "0")}분`,
    ttsChars: data.ttsChars,
    ttsPercent: ttsPercent.toFixed(1),
    ttsRemainingFormatted: `${ttsRemainingChars.toLocaleString()}자`,
    requestCount: data.requestCount,
  };
}

function saveAzureMonthlyUsage(data) {
  try {
    localStorage.setItem(AZURE_USAGE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function addAzureAudioUsage(seconds) {
  const currentMonth = getCurrentYearMonth();
  let data = {
    month: currentMonth,
    audioSeconds: 0,
    ttsChars: 0,
    requestCount: 0,
  };
  try {
    const raw = localStorage.getItem(AZURE_USAGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.month === currentMonth) data = parsed;
    }
  } catch (e) {}

  data.audioSeconds = (Number(data.audioSeconds) || 0) + seconds;
  data.requestCount = (Number(data.requestCount) || 0) + 1;
  saveAzureMonthlyUsage(data);
  updateAzureUsageUI();
}

function addAzureTtsUsage(chars) {
  const currentMonth = getCurrentYearMonth();
  let data = {
    month: currentMonth,
    audioSeconds: 0,
    ttsChars: 0,
    requestCount: 0,
  };
  try {
    const raw = localStorage.getItem(AZURE_USAGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.month === currentMonth) data = parsed;
    }
  } catch (e) {}

  data.ttsChars = (Number(data.ttsChars) || 0) + chars;
  saveAzureMonthlyUsage(data);
  updateAzureUsageUI();
}

function resetAzureMonthlyUsage() {
  const currentMonth = getCurrentYearMonth();
  const data = {
    month: currentMonth,
    audioSeconds: 0,
    ttsChars: 0,
    requestCount: 0,
  };
  saveAzureMonthlyUsage(data);
  updateAzureUsageUI();
}

function updateAzureUsageUI() {
  const usage = getAzureMonthlyUsage();

  const monthBadge = document.getElementById("azureUsageMonthBadge");
  const audioText = document.getElementById("azureAudioUsageText");
  const audioBar = document.getElementById("azureAudioUsageBar");
  const audioRemaining = document.getElementById("azureAudioRemainingText");

  const ttsText = document.getElementById("azureTtsUsageText");
  const ttsBar = document.getElementById("azureTtsUsageBar");
  const ttsRemaining = document.getElementById("azureTtsRemainingText");

  if (monthBadge) monthBadge.textContent = usage.monthLabel;
  if (audioText) {
    audioText.textContent = `${usage.audioFormatted} / 300분 (${usage.audioPercent}%)`;
  }
  if (audioBar) {
    audioBar.style.width = `${usage.audioPercent}%`;
    const pct = parseFloat(usage.audioPercent);
    audioBar.className =
      "metric-bar-fill " + (pct >= 90 ? "low" : pct >= 70 ? "mid" : "high");
  }
  if (audioRemaining) {
    audioRemaining.textContent = `남은 시간: ${usage.audioRemainingFormatted}`;
  }

  if (ttsText) {
    ttsText.textContent = `${usage.ttsChars.toLocaleString()}자 / 500,000자 (${usage.ttsPercent}%)`;
  }
  if (ttsBar) {
    ttsBar.style.width = `${usage.ttsPercent}%`;
    const pct = parseFloat(usage.ttsPercent);
    ttsBar.className =
      "metric-bar-fill " + (pct >= 90 ? "low" : pct >= 70 ? "mid" : "high");
  }
  if (ttsRemaining) {
    ttsRemaining.textContent = `남은 글자: ${usage.ttsRemainingFormatted}`;
  }
}

// TTS 모달 UI 이벤트 바인딩 및 캐시/사용량 통계 갱신
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
  const resetUsageBtn = document.getElementById("resetAzureUsageBtn");
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
    if (azureVoiceSelect)
      azureVoiceSelect.value = azureVoice || "en-US-JennyNeural";

    if (azureSection) {
      azureSection.style.display = ttsEngine === "azure" ? "flex" : "none";
    }

    refreshCacheStats();
    updateAzureUsageUI();
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  // 모달 닫기
  function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = "";
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

  // 사용량 초기화 버튼
  if (resetUsageBtn) {
    resetUsageBtn.addEventListener("click", () => {
      if (
        confirm(
          "이번 달의 Azure Speech 누적 사용량(시간 및 글자 수) 기록을 0으로 초기화하시겠습니까?",
        )
      ) {
        resetAzureMonthlyUsage();
      }
    });
  }

  // 저장 버튼
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (engineSelect) ttsEngine = engineSelect.value;
      if (azureKeyInput) azureApiKey = azureKeyInput.value.trim();
      if (azureRegionInput)
        azureRegion = azureRegionInput.value.trim() || "eastus";
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
      const tempRegion = azureRegionInput
        ? azureRegionInput.value.trim()
        : azureRegion;
      const tempVoice = azureVoiceSelect ? azureVoiceSelect.value : azureVoice;

      if (!tempKey) {
        alert(
          "Azure API Key를 입력해주세요. (없을 시 Google 번역기 무료 음성을 선택할 수 있습니다)",
        );
        azureTestBtn.innerHTML = originalText;
        azureTestBtn.disabled = false;
        return;
      }

      try {
        const ratePercent = Math.round((ttsRate - 1.0) * 100);
        const rateStr =
          ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
        const endpoint = `https://${tempRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
        const testLang = tempVoice.split("-").slice(0, 2).join("-") || "en-US";
        const ssml =
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${testLang}'>` +
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
          throw new Error(
            `Azure 응답 에러 (${res.status}): ${errBody || "키 또는 지역명을 확인하세요."}`,
          );
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

// 전역 TTS 세션 및 오디오 상태 관리
let currentTtsRequestId = 0; // 비동기 네트워크 지연 중복 재생 방지용 고유 요청 ID

// 진행 중인 모든 TTS 음성 재생 중단 (오디오 엘리먼트 + Web Speech API + 대기 중인 모든 비동기 요청 취소)
function stopTTS() {
  currentTtsRequestId++; // ⚡ 진행 중이던 모든 비동기 캐시/네트워크 요청 즉시 무효화

  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.onended = null;
      activeAudio.onerror = null;
      activeAudio.src = "";
    } catch (e) {}
    activeAudio = null;
  }
  if ("speechSynthesis" in window) {
    try {
      speechSynthesis.cancel();
    } catch (e) {}
  }
  resetCurrentButton();
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
async function fetchAzureTtsAudio(
  text,
  voice = "en-US-JennyNeural",
  rate = 1.0,
) {
  if (!azureApiKey || !azureApiKey.trim()) {
    throw new Error("Azure API Key가 설정되지 않았습니다.");
  }
  const endpoint = `https://${azureRegion.trim()}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ratePercent = Math.round((rate - 1.0) * 100);
  const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

  const voiceLang = voice.split("-").slice(0, 2).join("-") || "en-US";
  const ssml =
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${voiceLang}'>` +
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

  // 이번 달 Azure Neural TTS 글자 수 사용량 누적
  addAzureTtsUsage(text.length);

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

// Audio Blob을 HTMLAudioElement로 재생 (중복 재생 원천 차단)
function playAudioBlob(blob, btn, requestId) {
  return new Promise((resolve, reject) => {
    // ⚡ 대기 중에 다른 TTS가 요청되었다면 즉시 파기
    if (requestId !== undefined && requestId !== currentTtsRequestId) {
      resolve();
      return;
    }

    try {
      // 기존 재생 중인 오디오 확실히 정리
      if (activeAudio) {
        try {
          activeAudio.pause();
          activeAudio.currentTime = 0;
          activeAudio.onended = null;
          activeAudio.onerror = null;
          activeAudio.src = "";
        } catch (e) {}
        activeAudio = null;
      }
      if ("speechSynthesis" in window) {
        try {
          speechSynthesis.cancel();
        } catch (e) {}
      }

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      activeAudio = audio;
      setButtonPlaying(btn);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (activeAudio === audio) {
          activeAudio = null;
          resetCurrentButton();
        }
        resolve();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        if (activeAudio === audio) {
          activeAudio = null;
          resetCurrentButton();
        }
        reject(e);
      };
      audio.play().catch((err) => {
        URL.revokeObjectURL(audioUrl);
        if (activeAudio === audio) {
          activeAudio = null;
          resetCurrentButton();
        }
        reject(err);
      });
    } catch (err) {
      resetCurrentButton();
      reject(err);
    }
  });
}

// Web Speech API (브라우저 기본 TTS) 폴백 재생 (중복 재생 원천 차단)
function playNativeTTS(text, lang = "en-US", btn = null, requestId) {
  // ⚡ 대기 중에 다른 TTS가 요청되었다면 즉시 파기
  if (requestId !== undefined && requestId !== currentTtsRequestId) {
    return;
  }

  if (!("speechSynthesis" in window) || !text) {
    resetCurrentButton();
    return;
  }

  try {
    speechSynthesis.cancel();
  } catch (e) {}

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = ttsRate;
  if (!lang.startsWith("ko")) {
    utterance.pitch = 1.22; // 여성 아나운서 톤
  }
  const voice = getBestVoice(lang);
  if (voice) utterance.voice = voice;

  setButtonPlaying(btn);

  utterance.onend = () => {
    if (requestId === undefined || requestId === currentTtsRequestId) {
      resetCurrentButton();
    }
  };
  utterance.onerror = () => {
    if (requestId === undefined || requestId === currentTtsRequestId) {
      resetCurrentButton();
    }
  };

  speechSynthesis.speak(utterance);
}

// 텍스트를 음성으로 재생하는 메인 하이브리드 함수 (모든 중복/동시 재생 100% 방지)
async function speakText(text, lang = "en-US", btn = null) {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  // 재생 중인 버튼을 다시 누르면 즉시 정지 (토글)
  if (
    currentSpeakingBtn === btn &&
    (activeAudio || (window.speechSynthesis && speechSynthesis.speaking))
  ) {
    stopTTS();
    return;
  }

  // ⚡ 새로운 발음 재생 시작 전, 기존 오디오/TTS 중지 및 새 요청 세션 ID 발급
  stopTTS();
  const thisRequestId = currentTtsRequestId;

  const isKorean = lang.startsWith("ko");
  const effectiveEngine = isKorean ? "google" : ttsEngine;
  const voiceName = isKorean ? "ko-KR" : azureVoice || "en-US-JennyNeural";

  // 1단계: IndexedDB 캐시 확인 (오디오 영구 보존 & 0자 소모)
  const cacheKey = window.AudioCache
    ? window.AudioCache.makeKey(effectiveEngine, voiceName, cleanText, ttsRate)
    : null;

  if (cacheKey && window.AudioCache) {
    try {
      const cachedBlob = await window.AudioCache.getAudio(cacheKey);
      if (thisRequestId !== currentTtsRequestId) return; // ⚡ 비동기 대기 중 다른 요청 발생 시 취소

      if (cachedBlob) {
        await playAudioBlob(cachedBlob, btn, thisRequestId);
        return;
      }
    } catch (e) {
      console.warn("[TTS] Cache lookup failed:", e);
    }
  }

  if (thisRequestId !== currentTtsRequestId) return;

  // 2단계: Azure Neural TTS 시도 (영어이고 Azure 설정 유효 시)
  if (
    !isKorean &&
    effectiveEngine === "azure" &&
    azureApiKey &&
    azureApiKey.trim()
  ) {
    try {
      const blob = await fetchAzureTtsAudio(cleanText, voiceName, ttsRate);
      if (thisRequestId !== currentTtsRequestId) return; // ⚡ 비동기 대기 중 다른 요청 발생 시 취소

      if (window.AudioCache && cacheKey) {
        window.AudioCache.saveAudio(cacheKey, blob, cleanText);
      }
      await playAudioBlob(blob, btn, thisRequestId);
      return;
    } catch (err) {
      console.warn(
        "[TTS] Azure Neural TTS failed, trying fallback:",
        err.message,
      );
    }
  }

  if (thisRequestId !== currentTtsRequestId) return;

  // 3단계: Google TTS 시도 (짧은 단어 및 200자 이하 문장)
  if (cleanText.length <= 200) {
    try {
      const blob = await fetchGoogleTtsAudio(cleanText, lang);
      if (thisRequestId !== currentTtsRequestId) return; // ⚡ 비동기 대기 중 다른 요청 발생 시 취소

      if (window.AudioCache && cacheKey) {
        window.AudioCache.saveAudio(cacheKey, blob, cleanText);
      }
      await playAudioBlob(blob, btn, thisRequestId);
      return;
    } catch (err) {
      console.warn(
        "[TTS] Google TTS failed, falling back to Web Speech API:",
        err.message,
      );
    }
  }

  if (thisRequestId !== currentTtsRequestId) return;

  // 4단계: 브라우저 기본 Web Speech API 최종 폴백
  playNativeTTS(cleanText, lang, btn, thisRequestId);
}

// ── 발음 및 Azure AI 정밀 평가 시스템 ──────────────────────────────────
let lastRecordedBlobs = { practice: null, opic: null, pattern: null };
let lastRecordedWavs = { practice: null, opic: null, pattern: null };
let currentMediaRecorder = null;
let currentMediaStream = null;
let recordedAudioChunks = [];
let currentRecordingMode = "practice"; // "practice" | "opic" | "pattern"

// 녹음된 오디오 Blob 조회
function getRecordedVoiceBlob(mode = "practice") {
  return lastRecordedBlobs[mode] || null;
}

// 녹음된 오디오 Blob 저장
function setRecordedVoiceBlob(mode, blob) {
  lastRecordedBlobs[mode] = blob;
}

// 녹음된 WAV 버퍼 저장
function setRecordedWavBuffer(mode, buffer) {
  lastRecordedWavs[mode] = buffer;
}

// 녹음 상태 초기화
function clearRecordedVoice(mode = "practice") {
  lastRecordedBlobs[mode] = null;
  lastRecordedWavs[mode] = null;
}

// 사용자의 실제 녹음 목소리 재생 (녹음본 없으면 TTS 폴백)
async function playRecordedVoice(
  mode = "practice",
  btn = null,
  fallbackText = "",
) {
  const blob = getRecordedVoiceBlob(mode);
  if (blob) {
    if (currentSpeakingBtn === btn && activeAudio) {
      stopTTS();
      return;
    }
    stopTTS();
    const reqId = currentTtsRequestId;
    try {
      await playAudioBlob(blob, btn, reqId);
    } catch (e) {
      console.warn(
        "[Voice] Real audio playback failed, falling back to TTS:",
        e,
      );
      if (fallbackText) speakText(fallbackText, "en-US", btn);
    }
  } else if (fallbackText) {
    speakText(fallbackText, "en-US", btn);
  }
}

// 브라우저 오디오 Blob을 Azure 호환 16kHz 16-bit Mono WAV Buffer로 변환
async function blobTo16kHzWav(blob) {
  if (!blob) return null;
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return null;
    const audioCtx = new AudioCtxClass();
    let audioBuffer = null;
    try {
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (decodeErr) {
      console.warn("[Audio] decodeAudioData failed:", decodeErr);
      return null;
    } finally {
      try {
        await audioCtx.close();
      } catch (e) {}
    }

    if (!audioBuffer) return null;

    const targetSampleRate = 16000;
    const duration = audioBuffer.duration;
    const length = Math.ceil(duration * targetSampleRate);
    if (length <= 0) return null;

    const offlineCtx = new OfflineAudioContext(1, length, targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    const rendered = await offlineCtx.startRendering();

    const pcmData = rendered.getChannelData(0);
    const wavBuffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(wavBuffer);

    function writeString(v, offset, str) {
      for (let i = 0; i < str.length; i++) {
        v.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + pcmData.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, pcmData.length * 2, true);

    let offset = 44;
    for (let i = 0; i < pcmData.length; i++) {
      const s = Math.max(-1, Math.min(1, pcmData[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    return wavBuffer;
  } catch (err) {
    console.warn("[Audio] WAV conversion error:", err);
    return null;
  }
}

// 프랑스어/스페인어 차용어 악센트(é, è, ê, á, ñ 등)를 표준 영어 ASCII 알파벳으로 변환
function sanitizeEnglishText(text) {
  if (!text) return "";
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // 결합 악센트 기호 제거
    .replace(/[éèêë]/gi, "e")
    .replace(/[áàâäãå]/gi, "a")
    .replace(/[íìîï]/gi, "i")
    .replace(/[óòôöõ]/gi, "o")
    .replace(/[úùûü]/gi, "u")
    .replace(/[ñ]/gi, "n")
    .replace(/[ç]/gi, "c")
    .replace(/\s+/g, " ")
    .trim();
}

// UTF-8 안전 Base64 인코더 (Azure HTTP Header 전달 시 깨짐 방지)
function utf8ToBase64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );
}

// Azure AI Speech Pronunciation Assessment REST API 호출
async function assessPronunciationWithAzure(wavBuffer, referenceText) {
  if (!azureApiKey || !azureApiKey.trim()) {
    throw new Error("Azure API Key가 설정되지 않았습니다.");
  }
  if (!wavBuffer || wavBuffer.byteLength < 100) {
    throw new Error("평가할 오디오 데이터가 부족합니다.");
  }

  // 악센트 문자(café, cafés 등)를 표준 영어 ASCII 단어로 정규화
  const cleanRef = sanitizeEnglishText(referenceText.trim());
  const region = (azureRegion || "eastus").trim();
  const endpoint = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;

  const pronConfig = {
    ReferenceText: cleanRef,
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    Dimension: "Comprehensive",
    EnableProsodyAssessment: "True",
  };
  const pronHeader = utf8ToBase64(JSON.stringify(pronConfig));

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": azureApiKey.trim(),
      "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
      Accept: "application/json",
      "Pronunciation-Assessment": pronHeader,
      "User-Agent": "OPIc-Trainer-PronAssessment",
    },
    body: wavBuffer,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Azure 발음 평가 오류 (${res.status}): ${errText}`);
  }

  // 이번 달 Azure 발음 평가 처리 오디오 길이(초) 사용량 누적 (16kHz 16bit Mono = 32,000 bytes/sec)
  const audioSec = Math.max(0.5, (wavBuffer.byteLength - 44) / 32000);
  addAzureAudioUsage(audioSec);

  const data = await res.json();
  if (data.RecognitionStatus !== "Success" || !data.NBest || !data.NBest[0]) {
    throw new Error(`음성 인식 실패 (${data.RecognitionStatus || "No match"})`);
  }

  const nbest = data.NBest[0];
  const pronScore = Math.round(nbest.PronScore || 0);
  const accuracyScore = Math.round(nbest.AccuracyScore || 0);
  const fluencyScore = Math.round(nbest.FluencyScore || 0);
  const prosodyScore = Math.round(nbest.ProsodyScore || 0);
  const completenessScore = Math.round(nbest.CompletenessScore || 0);

  // OPIc 예상 등급 산출
  let opicGrade = {
    grade: "NH",
    label: "🌱 Novice High",
    gradeClass: "grade-il",
  };
  if (pronScore >= 90) {
    opicGrade = {
      grade: "AL",
      label: "🏆 AL (Advanced Low)",
      gradeClass: "grade-al",
    };
  } else if (pronScore >= 80) {
    opicGrade = {
      grade: "IH",
      label: "🥇 IH (Intermediate High)",
      gradeClass: "grade-ih",
    };
  } else if (pronScore >= 70) {
    opicGrade = {
      grade: "IM3",
      label: "🥈 IM3 (Intermediate Mid 3)",
      gradeClass: "grade-im",
    };
  } else if (pronScore >= 60) {
    opicGrade = {
      grade: "IM2",
      label: "🥈 IM2 (Intermediate Mid 2)",
      gradeClass: "grade-im",
    };
  } else if (pronScore >= 50) {
    opicGrade = {
      grade: "IM1",
      label: "🥈 IM1 (Intermediate Mid 1)",
      gradeClass: "grade-im",
    };
  } else if (pronScore >= 40) {
    opicGrade = {
      grade: "IL",
      label: "🥉 IL (Intermediate Low)",
      gradeClass: "grade-il",
    };
  }

  const words = (nbest.Words || []).map((w) => ({
    word: w.Word,
    accuracyScore: Math.round(w.AccuracyScore || 0),
    errorType: w.ErrorType || "None",
    phonemes: (w.Phonemes || []).map((p) => ({
      phoneme: p.Phoneme,
      accuracyScore: Math.round(p.AccuracyScore || 0),
    })),
  }));

  let feedback = "";
  if (pronScore >= 85) {
    feedback =
      "🌟 원어민 수준의 자연스러운 억양과 발음입니다! OPIc 시험에서 최상위 등급(IH~AL)을 기대할 수 있어요.";
  } else if (pronScore >= 70) {
    feedback =
      "👍 명확하고 훌륭한 발음이에요! 주황색/빨간색 단어의 음소와 억양을 조금만 더 보완해보세요.";
  } else if (pronScore >= 50) {
    feedback =
      "💪 기본 전달력이 좋아요! 단어 끝 소리와 모음 장단음에 주의해서 한 번 더 말해보세요.";
  } else {
    feedback = "🌱 천천히 또박또박 모범 답안 발음을 먼저 듣고 따라 말해보세요.";
  }

  return {
    isAzure: true,
    pronScore,
    accuracyScore,
    fluencyScore,
    prosodyScore,
    completenessScore,
    opicGrade,
    words,
    feedback,
    recognizedText: nbest.Display || "",
  };
}

// 평가 비교를 위한 텍스트 정규화
function normalizeForEval(text) {
  return sanitizeEnglishText(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 로컬 텍스트 일치도 폴백 평가 (문장 변환 모드 전용)
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

  return { isAzure: false, score, diffHtml: diffParts.join(" "), feedback };
}

// ── OPIc 다면 평가 및 주제 적합성 사전 & 엔진 ────────────────────────
// (어휘 사전 데이터는 js/eval-dict.js 모듈에서 로드됩니다)
const TOPIC_VOCABULARY_MAP = window.EvalDict
  ? window.EvalDict.TOPIC_VOCABULARY_MAP
  : {};
const EVAL_STOP_WORDS = window.EvalDict
  ? window.EvalDict.STOP_WORDS
  : new Set();
const OPIC_CONNECTORS = window.EvalDict ? window.EvalDict.CONNECTORS : [];
const OPIC_FILLERS = window.EvalDict ? window.EvalDict.FILLERS : [];
const OPIC_PAST_VERBS = window.EvalDict ? window.EvalDict.PAST_VERBS : [];

// 단어 경계 기반 고정밀 매칭 유틸
function matchWordList(text, list) {
  const matches = [];
  const lower = (text || "").toLowerCase();
  for (const item of list) {
    const escaped = item.replace(/['’]/g, "['’]?").replace(/\s+/g, "\\s+");
    const regex = new RegExp(
      "(?:^|\\s|[,.!?])" + escaped + "(?:$|\\s|[,.!?])",
      "i",
    );
    if (regex.test(lower)) {
      matches.push(item);
    }
  }
  return matches;
}

// 질문과 사용자 답변의 주제 적합성(Topic Relevance) 진단 알고리즘
function evaluateTopicRelevance(userInput, questionItem) {
  if (!userInput || !userInput.trim()) {
    return {
      relevanceScore: 0,
      status: "empty",
      statusLabel: "답변 없음",
      matchedKeywords: [],
      feedback: "마이크를 누르고 질문에 대한 답변을 말씀해보세요.",
    };
  }

  const cleanUser = userInput.toLowerCase();
  const userTokens = cleanUser
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !EVAL_STOP_WORDS.has(t));

  if (!questionItem) {
    // 질문 메타데이터가 없는 일반 환경
    return {
      relevanceScore: 80,
      status: "moderate",
      statusLabel: "주제 연관",
      matchedKeywords: [],
      feedback: "질문에 알맞게 답변을 이어가고 있습니다.",
    };
  }

  // 1. 질문 텍스트 및 키워드에서 주요 단어 추출
  const qEnText = (questionItem.q_en || "").toLowerCase();
  const qTokens = qEnText
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !EVAL_STOP_WORDS.has(t));

  const directKeywords = (questionItem.keywords || []).map((k) =>
    k.toLowerCase().trim(),
  );
  const category = (questionItem.cat || "").toLowerCase();

  // 2. 카테고리 기반 토픽 어휘 풀 수집
  const topicPool = new Set([...qTokens, ...directKeywords]);

  if (
    category.includes("집") ||
    category.includes("가구") ||
    category.includes("인테리어")
  ) {
    TOPIC_VOCABULARY_MAP.home.forEach((w) => topicPool.add(w));
  }
  if (category.includes("동네") || category.includes("이웃")) {
    TOPIC_VOCABULARY_MAP.neighborhood.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("여행") ||
    category.includes("휴가") ||
    category.includes("해외") ||
    category.includes("국내")
  ) {
    TOPIC_VOCABULARY_MAP.travel.forEach((w) => topicPool.add(w));
  }
  if (category.includes("호텔") || category.includes("숙소")) {
    TOPIC_VOCABULARY_MAP.hotel.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("공원") ||
    category.includes("산책") ||
    category.includes("자연")
  ) {
    TOPIC_VOCABULARY_MAP.park.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("음악") ||
    category.includes("콘서트") ||
    category.includes("노래")
  ) {
    TOPIC_VOCABULARY_MAP.music.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("영화") ||
    category.includes("공연") ||
    category.includes("배우")
  ) {
    TOPIC_VOCABULARY_MAP.movie.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("쇼핑") ||
    category.includes("구매") ||
    category.includes("매장")
  ) {
    TOPIC_VOCABULARY_MAP.shopping.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("식당") ||
    category.includes("카페") ||
    category.includes("음식") ||
    category.includes("요리")
  ) {
    TOPIC_VOCABULARY_MAP.restaurant.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("운동") ||
    category.includes("헬스") ||
    category.includes("조깅") ||
    category.includes("자전거")
  ) {
    TOPIC_VOCABULARY_MAP.exercise.forEach((w) => topicPool.add(w));
  }
  if (category.includes("날씨") || category.includes("계절")) {
    TOPIC_VOCABULARY_MAP.weather.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("롤플레이") ||
    category.includes("질문") ||
    category.includes("문의") ||
    category.includes("문제")
  ) {
    TOPIC_VOCABULARY_MAP.roleplay.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("과거") ||
    category.includes("기억") ||
    category.includes("경험")
  ) {
    TOPIC_VOCABULARY_MAP.past_experience.forEach((w) => topicPool.add(w));
  }
  if (
    category.includes("루틴") ||
    category.includes("습관") ||
    category.includes("일과")
  ) {
    TOPIC_VOCABULARY_MAP.routine.forEach((w) => topicPool.add(w));
  }

  // 3. 사용자 발화와 주제 단어 풀 매칭
  const matchedKeywords = [];
  const matchedSet = new Set();

  for (const topicWord of topicPool) {
    if (topicWord.includes(" ")) {
      if (cleanUser.includes(topicWord)) {
        if (!matchedSet.has(topicWord)) {
          matchedKeywords.push(topicWord);
          matchedSet.add(topicWord);
        }
      }
    } else {
      if (userTokens.includes(topicWord) || cleanUser.includes(topicWord)) {
        if (!matchedSet.has(topicWord)) {
          matchedKeywords.push(topicWord);
          matchedSet.add(topicWord);
        }
      }
    }
  }

  const matchCount = matchedKeywords.length;
  const wordCount = userTokens.length;

  // 4. 주제 적합도 점수 및 상태 산출
  let relevanceScore = 20;
  let status = "off-topic";
  let statusLabel = "🚨 주제 불일치 (Off-Topic)";
  let feedback = `⚠️ 질문 주제와 무관한 답변입니다. 에바의 질문 핵심 어휘나 관련 상황에 맞추어 답변해주세요. (OPIc 실전에서는 주제 불일치 시 IL 이하로 채점됩니다.)`;

  if (wordCount >= 4 && matchCount >= 4) {
    relevanceScore = 95;
    status = "high";
    statusLabel = "🌟 주제 완벽 부합";
    feedback =
      "질문의 핵심 주제와 완벽히 일치하며 관련 어휘를 풍부하게 사용했습니다.";
  } else if (wordCount >= 3 && matchCount >= 2) {
    relevanceScore = 80;
    status = "moderate";
    statusLabel = "🎯 주제 일치";
    feedback = "질문의 의도에 알맞은 주제 어휘를 사용하여 성실히 답변했습니다.";
  } else if (matchCount >= 1) {
    relevanceScore = 55;
    status = "low";
    statusLabel = "⚠️ 연관성 다소 부족";
    feedback =
      "질문과의 연관 어휘가 다소 부족합니다. 질문 속 핵심 단어들을 답변에 적극 활용해보세요.";
  }

  return {
    relevanceScore,
    status,
    statusLabel,
    matchedKeywords,
    feedback,
  };
}

// OPIc 종합 다면 평가 산출기 (발화량 하드캡 + 주제적합도 + 발음/유창성 + 담화표지어)
function calculateComprehensiveOpicScore({
  pronScore = 70,
  fluencyScore = 70,
  accuracyScore = 70,
  prosodyScore = 70,
  userText = "",
  questionItem = null,
  isAzure = false,
}) {
  const normUser = normalizeForEval(userText);
  if (!normUser) {
    return {
      finalScore: 0,
      opicGrade: {
        grade: "IL",
        label: "🥉 IL (Intermediate Low)",
        gradeClass: "grade-il",
      },
      volumeScore: 0,
      topicRelevance: {
        relevanceScore: 0,
        status: "empty",
        statusLabel: "답변 없음",
        matchedKeywords: [],
      },
      feedback: "마이크를 누르고 영어로 나만의 답변을 자유롭게 말해보세요.",
      volumeCapApplied: false,
      volumeWarning: null,
    };
  }

  const userTokens = normUser.split(" ").filter(Boolean);
  const wordCount = userTokens.length;
  const uniqueWords = new Set(userTokens).size;
  const virtualSentences = splitIntoVirtualSentences(userText);
  const sentenceCount = Math.max(
    1,
    virtualSentences.length ||
      (userText.match(/[.!?]+/g) || []).length ||
      Math.ceil(wordCount / 9),
  );

  const foundConnectors = matchWordList(userText, OPIC_CONNECTORS);
  const foundFillers = matchWordList(userText, OPIC_FILLERS);
  const foundPastVerbs = matchWordList(userText, OPIC_PAST_VERBS);

  // 1. 주제 적합도 분석
  const topicRelevance = evaluateTopicRelevance(userText, questionItem);

  // 2. 실제 ACTFL OPIc 시험 기준 발화량(Volume) 및 문단(Paragraph) 다면 평가
  // 실제 OPIc 시험 기준:
  // - AL (Advanced Low): 14문장 이상 (130단어 이상, 1분 30초~2분) - 완전한 복수 문단 및 상세 서술
  // - IH (Intermediate High): 10~13문장 (95~129단어, 1분 15초~1분 30초) - 유기적 문단 구성 + 시제/연결어
  // - IM3 (Intermediate Mid 3): 8~9문장 (75~94단어, 약 1분 15초) - 준문단 구성
  // - IM2 (Intermediate Mid 2): 6~7문장 (55~74단어, 약 1분) - 일상 묘사/루틴
  // - IM1 (Intermediate Mid 1): 5~6문장 (35~54단어, 약 45초) - 단순 문장 결합
  // - IL (Intermediate Low): 3~4문장 (19~34단어, 약 30초) - 단순 단문 나열
  // - Novice / 미흡: 1~2문장 (18단어 미만, 20초 미만) - 단답형 / 파편화된 구문

  const effectiveSentences = Math.max(sentenceCount, Math.round(wordCount / 9));

  let volumeScore = 25;
  let volumeCapGrade = "IL";
  let volumeCapMaxScore = 35;
  let volumeWarning = null;
  let volumeCapApplied = false;

  if (wordCount < 19 || effectiveSentences <= 2) {
    // Novice / 초미흡 (1~2문장)
    volumeScore = 25;
    volumeCapGrade = "IL";
    volumeCapMaxScore = 35;
    volumeCapApplied = true;
    volumeWarning = `⚠️ 발화량 현저히 부족 (1~2문장 / ${wordCount}단어): OPIc 실전에서는 1~2문장의 단답형 발화 시 아무리 발음이 좋아도 Novice~IL 등급에 머뭅니다. 최소 5~7문장 이상으로 답변을 확장해보세요! (실전 권장: AL 14문장+ / IH 10문장+ / IM 6~8문장)`;
  } else if (wordCount < 35 || effectiveSentences <= 4) {
    // IL (3~4문장, 19~34단어)
    volumeScore = 45;
    volumeCapGrade = "IL";
    volumeCapMaxScore = 48;
    volumeCapApplied = true;
    volumeWarning = `🌱 초급 수준 발화량 (3~4문장 / ${wordCount}단어): 단순 단문 나열 수준(IL)입니다. IM 등급으로 도약하려면 이유('because')나 시간 순서('then, after that')를 덧붙여 5~7문장(35단어 이상)으로 늘려보세요.`;
  } else if (wordCount < 55 || effectiveSentences <= 6) {
    // IM1 (5~6문장, 35~54단어)
    volumeScore = 58;
    volumeCapGrade = "IM1";
    volumeCapMaxScore = 63;
    volumeCapApplied = true;
    volumeWarning = `🥉 IM1 수준 발화량 (5~6문장 / ${wordCount}단어): 기본 의사전달이 가능하나 문단 확장이 필요합니다. 'also, however' 등의 연결어를 사용해 7~9문장(55단어 이상)으로 답변을 확장해보세요.`;
  } else if (wordCount < 75 || effectiveSentences <= 7) {
    // IM2 (6~7문장, 55~74단어)
    volumeScore = 68;
    volumeCapGrade = "IM2";
    volumeCapMaxScore = 74;
    volumeCapApplied = true;
    volumeWarning = `🥈 IM2 수준 발화량 (6~7문장 / ${wordCount}단어): 일상 대화 전달력이 안정적입니다. 과거 시제 경험이나 구체적인 에피소드를 덧붙여 8~9문장(75단어 이상)으로 확장하면 IM3~IH 도약이 가능합니다.`;
  } else if (wordCount < 95 || effectiveSentences <= 9) {
    // IM3 (8~9문장, 75~94단어)
    volumeScore = 78;
    volumeCapGrade = "IM3";
    volumeCapMaxScore = 82;
    volumeCapApplied = true;
    volumeWarning = `🥈 IM3 수준 발화량 (8~9문장 / ${wordCount}단어): IH 등급 진입 직전입니다! 서론-본론-결론의 유기적인 문단 구조와 자연스러운 필러('you know, honestly')를 더해 10문장(95단어 이상)을 완성해보세요.`;
  } else if (wordCount < 130 || effectiveSentences <= 13) {
    // IH (10~13문장, 95~129단어)
    volumeScore = 88;
    volumeCapGrade = "IH";
    volumeCapMaxScore = 92;
  } else {
    // AL (14문장 이상, 130단어 이상)
    volumeScore = 98;
    volumeCapGrade = "AL";
    volumeCapMaxScore = 100;
  }

  // 3. 주제 불일치(Off-Topic) 하드 캡
  if (topicRelevance.status === "off-topic") {
    volumeCapGrade = "IL";
    volumeCapMaxScore = Math.min(volumeCapMaxScore, 40);
    volumeCapApplied = true;
  }

  // 4. 가중치 기반 총점 계산
  // 발음/유창성(35%) + 발화량/문단구성(35%) + 주제적합도(20%) + 연결어/필러(10%)
  const speechScore = isAzure ? pronScore : 70;
  const discourseBonus = Math.min(
    100,
    foundConnectors.length * 25 +
      foundFillers.length * 20 +
      foundPastVerbs.length * 15,
  );

  const rawTotalScore = Math.round(
    speechScore * 0.35 +
      volumeScore * 0.35 +
      topicRelevance.relevanceScore * 0.2 +
      discourseBonus * 0.1,
  );

  // 상한선(Hard Cap) 적용
  const finalScore = Math.min(rawTotalScore, volumeCapMaxScore);

  // 5. 최종 OPIc 등급 결정
  let opicGrade = {
    grade: "IL",
    label: "🥉 IL (Intermediate Low)",
    gradeClass: "grade-il",
  };

  if (
    finalScore >= 90 &&
    volumeCapGrade === "AL" &&
    topicRelevance.status !== "off-topic"
  ) {
    opicGrade = {
      grade: "AL",
      label: "🏆 AL (Advanced Low)",
      gradeClass: "grade-al",
    };
  } else if (
    finalScore >= 80 &&
    (volumeCapGrade === "AL" || volumeCapGrade === "IH") &&
    topicRelevance.status !== "off-topic"
  ) {
    opicGrade = {
      grade: "IH",
      label: "🥇 IH (Intermediate High)",
      gradeClass: "grade-ih",
    };
  } else if (finalScore >= 70 && ["AL", "IH", "IM3"].includes(volumeCapGrade)) {
    opicGrade = {
      grade: "IM3",
      label: "🥈 IM3 (Intermediate Mid 3)",
      gradeClass: "grade-im",
    };
  } else if (
    finalScore >= 60 &&
    ["AL", "IH", "IM3", "IM2"].includes(volumeCapGrade)
  ) {
    opicGrade = {
      grade: "IM2",
      label: "🥈 IM2 (Intermediate Mid 2)",
      gradeClass: "grade-im",
    };
  } else if (
    finalScore >= 50 &&
    ["AL", "IH", "IM3", "IM2", "IM1"].includes(volumeCapGrade)
  ) {
    opicGrade = {
      grade: "IM1",
      label: "🥈 IM1 (Intermediate Mid 1)",
      gradeClass: "grade-im",
    };
  } else {
    opicGrade = {
      grade: "IL",
      label: "🥉 IL (Intermediate Low)",
      gradeClass: "grade-il",
    };
  }

  // 6. 종합 피드백 텍스트 생성
  let feedback = "";
  if (topicRelevance.status === "off-topic") {
    feedback = topicRelevance.feedback;
  } else if (volumeWarning) {
    feedback = volumeWarning;
  } else if (opicGrade.grade === "AL") {
    feedback =
      "🌟 탁월합니다! 풍부한 발화량, 자연스러운 연결어 및 담화 표지어 활용으로 완벽한 문단(Paragraph)을 구성했습니다. OPIc 최고 등급(AL) 수준입니다.";
  } else if (opicGrade.grade === "IH") {
    feedback =
      "🥇 훌륭합니다! 문장들이 접속사로 매끄럽게 연결되며 안정적인 문단을 형성하고 있습니다. OPIc IH 기준을 확실하게 충족합니다.";
  } else if (opicGrade.grade.startsWith("IM")) {
    feedback =
      "👍 좋습니다! 핵심 의사전달이 명확합니다. 'because, when, also' 같은 논리 연결어와 과거 경험을 1~2문장 더 덧붙이면 IH/AL로 즉시 도약할 수 있습니다.";
  } else {
    feedback =
      "🌱 답변 분량을 3~4문장 이상으로 늘리고, 질문 주제에 맞추어 이유나 느낌을 덧붙여보세요.";
  }

  return {
    finalScore,
    opicGrade,
    wordCount,
    sentenceCount,
    uniqueWords,
    foundConnectors,
    foundFillers,
    foundPastVerbs,
    topicRelevance,
    volumeScore,
    volumeCapGrade,
    volumeCapApplied,
    volumeWarning,
    feedback,
  };
}

// OPIc 실전 나만의 답변 발화 평가 (로컬 엔진)
function evaluateOpicSpeaking(userInput, questionItem = null) {
  const normUser = normalizeForEval(userInput);
  if (!normUser) {
    return {
      score: 0,
      diffHtml: "<span class='eval-word miss'>입력된 음성이 없습니다.</span>",
      feedback: "마이크를 누르고 영어로 나만의 답변을 자유롭게 말해보세요.",
      opicGrade: {
        grade: "IL",
        label: "🥉 IL (Intermediate Low)",
        gradeClass: "grade-il",
      },
    };
  }

  const userTokens = normUser.split(" ").filter(Boolean);
  const compResult = calculateComprehensiveOpicScore({
    userText: userInput,
    questionItem,
    isAzure: false,
  });

  const wordsHtml = userTokens
    .map((t) => `<span class="eval-word match">${escapeHtml(t)}</span>`)
    .join(" ");

  const tags = [];
  if (compResult.foundConnectors.length > 0) {
    tags.push(
      `🔗 연결어(${compResult.foundConnectors.length}개): ${compResult.foundConnectors.slice(0, 4).join(", ")}`,
    );
  }
  if (compResult.foundFillers.length > 0) {
    tags.push(
      `💬 필러(${compResult.foundFillers.length}개): ${compResult.foundFillers.slice(0, 3).join(", ")}`,
    );
  }
  if (compResult.foundPastVerbs.length > 0) {
    tags.push(
      `⏳ 과거시제(${compResult.foundPastVerbs.length}개): ${compResult.foundPastVerbs.slice(0, 3).join(", ")}`,
    );
  }

  const topicBadgeColor =
    compResult.topicRelevance.status === "high"
      ? "#059669"
      : compResult.topicRelevance.status === "moderate"
        ? "#4f46e5"
        : compResult.topicRelevance.status === "low"
          ? "#d97706"
          : "#dc2626";

  const statsHtml = `
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; padding: 10px 12px; background: var(--surface-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
      <div style="display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; align-items: center;">
        <span>📝 발화 단어: <strong style="color: var(--text-main);">${compResult.wordCount}단어 (${compResult.uniqueWords}개 고유어)</strong></span>
        <span>📑 문장 수: <strong style="color: var(--text-main);">약 ${compResult.sentenceCount}문장</strong></span>
        <span>🎯 주제 적합도: <strong style="color: ${topicBadgeColor};">${escapeHtml(compResult.topicRelevance.statusLabel)}</strong></span>
        <span style="font-size: 11px; color: var(--text-muted); background: var(--surface-default); padding: 1px 6px; border-radius: 4px; border: 1px solid var(--border-light);" title="ACTFL 실전 권장 발화량">📊 실전 기준: AL 130단어+ · IH 95단어+ · IM 55~85단어</span>
      </div>
      ${
        compResult.volumeWarning
          ? `<div style="font-size: 11.5px; color: #b45309; background: #fef3c7; padding: 6px 10px; border-radius: 6px; border: 1px solid #fde68a; line-height: 1.4;">
              ${escapeHtml(compResult.volumeWarning)}
            </div>`
          : ""
      }
      ${
        tags.length > 0
          ? `<div style="display: flex; gap: 8px; font-size: 11px; color: #4338ca; flex-wrap: wrap;">
              ${tags.map((t) => `<span style="background: #e0e7ff; padding: 1px 7px; border-radius: 4px; font-weight: 600;">${t}</span>`).join("")}
            </div>`
          : ""
      }
    </div>
  `;

  return {
    isAzure: false,
    score: compResult.finalScore,
    opicGrade: compResult.opicGrade,
    diffHtml: statsHtml + `<div class="eval-diff">${wordsHtml}</div>`,
    feedback: compResult.feedback,
  };
}

// 발음 평가 UI 통합 렌더링 (Azure AI 4대 지표 / 나만의 답변 & 로컬 하이브리드)
async function renderPronunciationAssessment({
  boxEl,
  badgeEl,
  diffEl,
  feedbackEl,
  mode = "practice",
  referenceText = "",
  userText = "",
  voiceBtn = null,
  questionItem = null,
}) {
  if (!boxEl) return;
  boxEl.classList.add("show");
  boxEl.style.display = "block";

  const wavBuffer = lastRecordedWavs[mode];
  const isOpic = mode === "opic";
  // OPIc 실전 모드는 모범 답안과 비교하지 않고 '내 실제 답변(userText)'을 기준으로 발음/유창성/운율을 정밀 진단!
  const targetAssessmentText = isOpic
    ? (userText || "").trim()
    : (referenceText || userText || "").trim();

  // 1. Azure AI 평가 가능한 상태 (WAV 음성 데이터 + Azure API Key 유효 + 발화 텍스트 있음)
  if (azureApiKey && azureApiKey.trim() && wavBuffer && targetAssessmentText) {
    if (diffEl) {
      diffEl.innerHTML = `
        <div class="eval-loading-wrap">
          <div class="eval-spinner"></div>
          <span>Azure AI로 내 답변 발음·유창성·운율 정밀 진단 중...</span>
        </div>
      `;
    }
    if (feedbackEl) feedbackEl.textContent = "";

    try {
      const azureResult = await assessPronunciationWithAzure(
        wavBuffer,
        targetAssessmentText,
      );
      renderAzureResultUI(azureResult);
      return;
    } catch (azureErr) {
      console.warn(
        "[PronAssessment] Azure AI failed, falling back to local:",
        azureErr.message,
      );
    }
  }

  // 2. 로컬 텍스트 폴백 렌더링
  if (isOpic) {
    const opicLocalResult = evaluateOpicSpeaking(userText, questionItem);
    renderLocalOpicResultUI(opicLocalResult);
  } else {
    const localResult = evaluateSpeech(userText, referenceText);
    renderLocalResultUI(localResult);
  }

  function renderAzureResultUI(res) {
    const usage = getAzureMonthlyUsage();

    // OPIc 모드일 경우 Azure 음향 지표 + 발화량 + 주제적합도를 결합한 실전 종합 점수 산출
    let compOpic = null;
    let finalGrade = res.opicGrade;
    let finalScore = res.pronScore;

    if (isOpic) {
      compOpic = calculateComprehensiveOpicScore({
        pronScore: res.pronScore,
        fluencyScore: res.fluencyScore,
        accuracyScore: res.accuracyScore,
        prosodyScore: res.prosodyScore,
        userText: userText,
        questionItem: questionItem,
        isAzure: true,
      });
      finalGrade = compOpic.opicGrade;
      finalScore = compOpic.finalScore;
    }

    if (badgeEl) {
      badgeEl.innerHTML = `
        <span class="opic-grade-badge ${finalGrade.gradeClass}">${finalGrade.label}</span>
        <span class="eval-score-badge ${finalScore >= 80 ? "high" : finalScore >= 50 ? "mid" : "low"}">${finalScore}점</span>
        <span class="azure-usage-pill" style="font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:12px;background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe;" title="이번 달 남은 무료 발음 평가 시간">⏳ ${usage.audioRemainingFormatted} 남음</span>
      `;
    }

    const wordsCount = res.words.length;
    let opicStatsBar = "";
    if (isOpic && compOpic) {
      const topicBadgeColor =
        compOpic.topicRelevance.status === "high"
          ? "#059669"
          : compOpic.topicRelevance.status === "moderate"
            ? "#4f46e5"
            : compOpic.topicRelevance.status === "low"
              ? "#d97706"
              : "#dc2626";

      const tags = [];
      if (compOpic.foundConnectors.length > 0) {
        tags.push(
          `🔗 연결어(${compOpic.foundConnectors.length}개): ${compOpic.foundConnectors.slice(0, 4).join(", ")}`,
        );
      }
      if (compOpic.foundFillers.length > 0) {
        tags.push(
          `💬 필러(${compOpic.foundFillers.length}개): ${compOpic.foundFillers.slice(0, 3).join(", ")}`,
        );
      }
      if (compOpic.foundPastVerbs.length > 0) {
        tags.push(
          `⏳ 과거시제(${compOpic.foundPastVerbs.length}개): ${compOpic.foundPastVerbs.slice(0, 3).join(", ")}`,
        );
      }

      opicStatsBar = `
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding: 10px 12px; background: var(--surface-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
          <div style="display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; align-items: center;">
            <span>📝 발화 단어: <strong style="color: var(--text-main);">${wordsCount}단어</strong></span>
            <span>📑 문장 수: <strong style="color: var(--text-main);">약 ${compOpic.sentenceCount}문장</strong></span>
            <span>🎯 주제 적합도: <strong style="color: ${topicBadgeColor};">${escapeHtml(compOpic.topicRelevance.statusLabel)}</strong></span>
            <span style="font-size: 11px; color: var(--text-muted); background: var(--surface-default); padding: 1px 6px; border-radius: 4px; border: 1px solid var(--border-light);" title="ACTFL 실전 권장 발화량">📊 실전 기준: AL 130단어+ · IH 95단어+ · IM 55~85단어</span>
          </div>
          ${
            compOpic.volumeWarning
              ? `<div style="font-size: 11.5px; color: #b45309; background: #fef3c7; padding: 6px 10px; border-radius: 6px; border: 1px solid #fde68a; line-height: 1.4;">
                  ${escapeHtml(compOpic.volumeWarning)}
                </div>`
              : ""
          }
          ${
            tags.length > 0
              ? `<div style="display: flex; gap: 8px; font-size: 11px; color: #4338ca; flex-wrap: wrap;">
                  ${tags.map((t) => `<span style="background: #e0e7ff; padding: 1px 7px; border-radius: 4px; font-weight: 600;">${t}</span>`).join("")}
                </div>`
              : ""
          }
        </div>
      `;
    }

    const metricsHtml = `
      ${opicStatsBar}
      <div class="eval-metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-name">🎯 발음 정확도</span>
            <span class="metric-score">${res.accuracyScore}%</span>
          </div>
          <div class="metric-bar-bg">
            <div class="metric-bar-fill ${res.accuracyScore >= 80 ? "high" : res.accuracyScore >= 50 ? "mid" : "low"}" style="width:${res.accuracyScore}%"></div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-name">🌊 말하기 유창성</span>
            <span class="metric-score">${res.fluencyScore}%</span>
          </div>
          <div class="metric-bar-bg">
            <div class="metric-bar-fill ${res.fluencyScore >= 80 ? "high" : res.fluencyScore >= 50 ? "mid" : "low"}" style="width:${res.fluencyScore}%"></div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-name">🎵 운율 & 억양</span>
            <span class="metric-score">${res.prosodyScore}%</span>
          </div>
          <div class="metric-bar-bg">
            <div class="metric-bar-fill ${res.prosodyScore >= 80 ? "high" : res.prosodyScore >= 50 ? "mid" : "low"}" style="width:${res.prosodyScore}%"></div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-name">📋 문장 완성도</span>
            <span class="metric-score">${res.completenessScore}%</span>
          </div>
          <div class="metric-bar-bg">
            <div class="metric-bar-fill ${res.completenessScore >= 80 ? "high" : res.completenessScore >= 50 ? "mid" : "low"}" style="width:${res.completenessScore}%"></div>
          </div>
        </div>
      </div>
    `;

    // Arpabet / IPA 음소 기호를 직관적인 한글 발음 및 기호 설명으로 변환
    const PHONEME_KOREAN_MAP = {
      // 모음 (Vowels)
      aa: "아",
      ae: "애(입크게)",
      ah: "어(짧은어)",
      ao: "오/어-(깊은소리)",
      aw: "아우",
      ay: "아이",
      eh: "에",
      er: "얼(혀굴림)",
      ey: "에이",
      ih: "이(짧은이)",
      iy: "이-(장모음)",
      ow: "오우",
      oy: "오이",
      uh: "우(짧은우)",
      uw: "우-(장모음)",
      ax: "어(약모음)",
      ix: "이(약모음)",
      axr: "얼(약모음)",

      // 자음 (Consonants)
      b: "ㅂ",
      ch: "ㅊ",
      d: "ㄷ",
      dh: "유성th(혀문 드)",
      dx: "플랩(ㄹ/ㄷ)",
      el: "받침l",
      em: "받침m",
      en: "받침n",
      f: "f(윗니+아랫입술 ㅍ)",
      g: "ㄱ",
      hh: "ㅎ",
      h: "ㅎ",
      jh: "ㅈ",
      k: "ㅋ",
      l: "l(ㄹ)",
      m: "ㅁ",
      n: "ㄴ",
      ng: "ㅇ(받침 이응)",
      p: "ㅍ",
      r: "r(혀당긴 ㄹ)",
      s: "ㅅ",
      sh: "쉬",
      t: "ㅌ",
      th: "무성th(혀문 쓰)",
      v: "v(윗니+아랫입술 ㅂ)",
      w: "w(입술오므린 우)",
      wh: "hw(휘)",
      y: "y(이)",
      z: "z(떨리는 ㅈ)",
      zh: "zh(부드러운 쥐)",
    };

    function getPhonemeKoreanDesc(phoneme) {
      if (!phoneme) return "";
      const cleanKey = String(phoneme).toLowerCase().replace(/[0-9]/g, "");
      const desc = PHONEME_KOREAN_MAP[cleanKey];
      return desc ? `${phoneme}(${desc})` : phoneme;
    }

    let wordsHtml = `<div class="eval-words-section">
      <div class="eval-words-label">
        <span>${isOpic ? "내 답변 단어별 발음 진단" : "단어별 정밀 발음 진단"}</span>
        <span class="sub">💡 단어를 누르면 음소별 점수가 표시됩니다</span>
      </div>
      <div class="eval-words-wrap">`;

    res.words.forEach((w) => {
      let scoreClass = "score-good";
      if (w.errorType === "Omission") scoreClass = "omission";
      else if (w.errorType === "Insertion") scoreClass = "insertion";
      else if (w.accuracyScore < 60) scoreClass = "score-bad";
      else if (w.accuracyScore < 80) scoreClass = "score-warn";

      const phonemeList = (w.phonemes || [])
        .map((p) => `${getPhonemeKoreanDesc(p.phoneme)}: ${p.accuracyScore}점`)
        .join(" · ");

      const tooltipText = phonemeList
        ? `${w.word} (${w.accuracyScore}점) - ${phonemeList}`
        : `${w.word}: ${w.accuracyScore}점`;

      wordsHtml += `
        <div class="azure-word-chip ${scoreClass}" tabindex="0" title="${escapeHtml(tooltipText)}">
          <span>${escapeHtml(w.word)}</span>
          <span class="word-score">${w.accuracyScore > 0 ? w.accuracyScore : ""}</span>
          ${phonemeList ? `<div class="phoneme-popover">${escapeHtml(phonemeList)}</div>` : ""}
        </div>
      `;
    });
    wordsHtml += `</div></div>`;

    if (diffEl) diffEl.innerHTML = metricsHtml + wordsHtml;
    if (feedbackEl)
      feedbackEl.textContent = compOpic ? compOpic.feedback : res.feedback;
  }

  function renderLocalOpicResultUI(res) {
    if (badgeEl) {
      badgeEl.innerHTML = `
        <span class="opic-grade-badge ${res.opicGrade.gradeClass}">${res.opicGrade.label}</span>
        <span class="eval-score-badge ${res.score >= 80 ? "high" : res.score >= 50 ? "mid" : "low"}">${res.score}점</span>
      `;
    }
    if (diffEl) {
      diffEl.innerHTML = `
        ${res.diffHtml}
        ${
          !azureApiKey
            ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">💡 <strong>⚙️ 음성 설정</strong>에서 Azure Speech API 키를 등록하면 내 답변의 정확도·유창성·운율·음소 정밀 진단이 지원됩니다.</div>`
            : ""
        }
      `;
    }
    if (feedbackEl) feedbackEl.textContent = res.feedback;
  }

  function renderLocalResultUI(res) {
    if (badgeEl) {
      badgeEl.innerHTML = `<span class="eval-score-badge ${res.score >= 80 ? "high" : res.score >= 50 ? "mid" : "low"}">${res.score}% 일치</span>`;
    }
    if (diffEl) {
      diffEl.innerHTML = `
        <div class="eval-diff">${res.diffHtml}</div>
        ${
          !azureApiKey
            ? `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">💡 <strong>⚙️ 음성 설정</strong>에서 Azure Speech API 키를 등록하면 정확도·유창성·운율·음소 정밀 진단이 지원됩니다.</div>`
            : ""
        }
      `;
    }
    if (feedbackEl) feedbackEl.textContent = res.feedback;
  }
}

// 하위 호환성 래퍼
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

// 번역 메모리 캐시 및 Rate Limit 쿨다운 관리
const translationCache = new Map();
let googleTranslateCooldownUntil = 0;

// 영문 텍스트를 한국어로 번역 (MyMemory + Google Translate 다중 폴백 및 캐싱)
async function translateToKorean(text) {
  const clean = (text || "").trim();
  if (!clean) return "";

  // 1. 캐시 히트 검사
  if (translationCache.has(clean)) {
    return translationCache.get(clean);
  }

  let translated = "";

  // 2. 1차 번역 엔진: MyMemory API (CORS 친화적 & 브라우저 안정성 우수)
  try {
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean.slice(0, 500))}&langpair=en|ko`;
    const res = await fetch(myMemoryUrl);
    if (res.ok) {
      const data = await res.json();
      if (
        data &&
        data.responseData &&
        data.responseData.translatedText &&
        !data.responseData.translatedText.startsWith("MYMEMORY WARNING:")
      ) {
        translated = data.responseData.translatedText.trim();
      }
    }
  } catch (e) {
    /* fallback to google */
  }

  // 3. 2차 번역 엔진: Google Translate API (쿨다운 상태가 아닐 때만 시도)
  if (!translated && Date.now() > googleTranslateCooldownUntil) {
    try {
      const url =
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=" +
        encodeURIComponent(clean);
      const res = await fetch(url);
      if (res.status === 429) {
        // 429 Too Many Requests 감지 시 60초간 Google 호출 차단 (CORS 에러 방지)
        googleTranslateCooldownUntil = Date.now() + 60000;
      } else if (res.ok) {
        const data = await res.json();
        translated = (data[0] || [])
          .map((chunk) => chunk[0])
          .join("")
          .trim();
      }
    } catch (e) {
      // CORS 또는 네트워크 에러 발생 시 60초 쿨다운 설정
      googleTranslateCooldownUntil = Date.now() + 60000;
    }
  }

  if (translated) {
    // 캐시 저장 (최대 100개 유지)
    if (translationCache.size > 100) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    translationCache.set(clean, translated);
  }

  return translated;
}

// 문법 검사 결과 및 교정 제안 UI 렌더링
async function renderGrammarResults(
  matches,
  text,
  targetBox = els.grammarBox,
  targetContent = els.grammarContent,
) {
  if (!targetBox || !targetContent) return;
  targetBox.classList.add("show");
  targetBox.style.display = "block";

  if (!matches || matches.length === 0) {
    targetContent.innerHTML = `<div class="g-good">✓ 문법 오류가 발견되지 않았어요. 자연스러운 문장이에요!</div>`;
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
  targetContent.innerHTML = html;
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

// ── STT (음성 인식) 및 실제 음성 캡처 시스템 ──────────────────────────
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

// ── 음성인식(STT) 한국인 영어 발화 오인식 자동 보정 & 가상 문장 분절 엔진 ──────

// 빈번한 한국인 음소 분절 및 오인식 표현 교정 규칙
const PHONETIC_CORRECTION_RULES = [
  { reg: /\ba\s+part\s+meant\b/gi, rep: "apartment" },
  { reg: /\ba\s+partment\b/gi, rep: "apartment" },
  { reg: /\bleaving\s+room\b/gi, rep: "living room" },
  { reg: /\bcause\s+he\b/gi, rep: "cozy" },
  { reg: /\bcazy\b/gi, rep: "cozy" },
  { reg: /\bfridge\s+later\b/gi, rep: "refrigerator" },
  { reg: /\bcan\s+be\s+near\b/gi, rep: "convenient" },
  { reg: /\bconve\s+near\b/gi, rep: "convenient" },
  { reg: /\btwo\s+some\s+place\b/gi, rep: "A Twosome Place" },
  { reg: /\btwo\s+some\b/gi, rep: "Twosome" },
  { reg: /\bstar\s+bucks\b/gi, rep: "Starbucks" },
  { reg: /\belectric\s+engineer\b/gi, rep: "electrical engineer" },
  { reg: /\brotat(?:ing|ion)\s+shift\b/gi, rep: "rotating shifts" },
  { reg: /\bdepartment\s+store\b/gi, rep: "department store" },
  { reg: /\bconvenience\s+store\b/gi, rep: "convenience store" },
  { reg: /\bsubway\s+station\b/gi, rep: "subway station" },
  { reg: /\bwork\s+out\b/gi, rep: "workout" },
  { reg: /\bworking\s+out\b/gi, rep: "working out" },
  { reg: /\bevery\s+day\b/gi, rep: "every day" },
  { reg: /\bfirst\s+of\s+all\b/gi, rep: "first of all" },
  { reg: /\byou\s+no\b/gi, rep: "you know" },
  { reg: /\bas\s+i\s+recall\b/gi, rep: "as I recall" },
  { reg: /\bi\s+am\s+agree\b/gi, rep: "I agree" },
  { reg: /\bin\s+front\s+off\b/gi, rep: "in front of" },
  { reg: /\bone\s+of\s+the\s+best\s+thing\b/gi, rep: "one of the best things" },

  // 한국 주요 지명 및 동/구 고유명사 오인식 보정 규칙
  {
    reg: /\b(?:bull|bool|pull|full)\s*(?:dang|tang)\s*(?:dong|tong)?\b/gi,
    rep: "Buldang-dong",
  },
  { reg: /\bbuilding\s+dong\b/gi, rep: "Buldang-dong" },
  { reg: /\b(?:chun\s*an|cheon\s*an|chun\s*ahn)\b/gi, rep: "Cheonan" },
  {
    reg: /\b(?:ssang\s*yong|sang\s*yong)\s*(?:dong)?\b/gi,
    rep: "Ssangyong-dong",
  },
  { reg: /\b(?:gang\s*nam|kang\s*nam)\s*(?:dong|gu)?\b/gi, rep: "Gangnam" },
  { reg: /\b(?:hong\s*dae|hong\s*day)\b/gi, rep: "Hongdae" },
  { reg: /\b(?:yeo\s*ui\s*do|yeoui\s*do)\b/gi, rep: "Yeouido" },
  { reg: /\b(?:sin\s*chon|shin\s*chon)\b/gi, rep: "Sinchon" },
  { reg: /\b(?:han\s*river|hangang|han\s*gang)\b/gi, rep: "the Han River" },

  // 외래어 악센트 및 단어 쪼개짐 보정
  { reg: /\bcaf[eé]\s*s\b/gi, rep: "cafes" },
  { reg: /\bcaf\s+s\b/gi, rep: "cafes" },
  { reg: /\bcaf[eé]s\b/gi, rep: "cafes" },
  { reg: /\bcaf[eé]\b/gi, rep: "cafe" },
];

// 음성 인식 텍스트 자동 보정기
function correctSttPhoneticErrors(text) {
  if (!text) return "";
  let corrected = sanitizeEnglishText(text);
  for (const rule of PHONETIC_CORRECTION_RULES) {
    if (typeof rule.rep === "function") {
      corrected = corrected.replace(rule.reg, rule.rep);
    } else {
      corrected = corrected.replace(rule.reg, rule.rep);
    }
  }
  return corrected;
}

// 텍스트 길이에 따라 textarea 높이를 실시간 자동 확장 (스크롤바 없이 한눈에 보기)
function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = "auto";
  const isOpic = el.id === "opicUserInput";
  const minHeight = isOpic ? 110 : 84;
  // 스크롤이 생기기 전 6px 여유 공간을 미리 확보하여 부드럽게 확장
  const newHeight = Math.max(minHeight, el.scrollHeight + 6);
  el.style.height = `${newHeight}px`;
}

// 구두점이 없는 긴 STT 발화 텍스트를 접속사/필러 기준으로 가상 분절하는 지능형 문장 분절기
function splitIntoVirtualSentences(text) {
  if (!text || !text.trim()) return [];
  const rawSentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // 이미 마침표 등으로 3개 이상 잘 분절되어 있다면 그대로 반환
  if (rawSentences.length >= 3) {
    return rawSentences;
  }

  // 구두점이 부족한 경우 접속사 및 담화표지어 경계를 기준으로 가상 분절
  const virtualSplitRegex =
    /\b(because|since|so|therefore|however|although|even though|but|when|whenever|after that|afterwards|before|then|also|besides|furthermore|moreover|what's more|plus|for example|for instance|in fact|you know|honestly|actually|frankly|i think|in my opinion|first of all|finally)\b/gi;

  const virtualSentences = [];
  for (const seg of rawSentences) {
    let cursor = 0;
    const tokens = seg.split(/\s+/);
    let currentChunk = [];

    for (const token of tokens) {
      const isSplitter = virtualSplitRegex.test(token);
      virtualSplitRegex.lastIndex = 0; // 정규식 리셋

      if (isSplitter && currentChunk.length >= 4) {
        virtualSentences.push(currentChunk.join(" "));
        currentChunk = [token];
      } else {
        currentChunk.push(token);
      }
    }
    if (currentChunk.length > 0) {
      virtualSentences.push(currentChunk.join(" "));
    }
  }

  return virtualSentences.length > 0 ? virtualSentences : [text.trim()];
}

let userExplicitlyStoppedMic = false; // 사용자가 명시적으로 마이크를 정지했는지 여부 (침묵 자동 재연결 제어용)

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
  if (els.patternMicBtn) els.patternMicBtn.classList.remove("listening");
}

// 음성 인식 및 녹음 중단
function stopSpeechRecognition() {
  userExplicitlyStoppedMic = true;
  stopListeningUI();
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {}
  }

  // MediaRecorder 중지 및 오디오 저장
  if (currentMediaRecorder && currentMediaRecorder.state !== "inactive") {
    try {
      currentMediaRecorder.stop();
    } catch (e) {}
  }
  if (currentMediaStream) {
    try {
      currentMediaStream.getTracks().forEach((track) => track.stop());
    } catch (e) {}
    currentMediaStream = null;
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

// 음성 인식 토글 함수 (문장 연습, OPIc 실전, 만능 패턴 모드 공용)
async function toggleSpeechRecognition(
  targetInput,
  targetBtn,
  targetError,
  modeOrIsOpic = false,
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

  // ⚡ 마이크 시작 시 재생 중인 모든 TTS 즉시 정지
  stopTTS();

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
  let mode = "practice";
  if (typeof modeOrIsOpic === "string") {
    mode = modeOrIsOpic;
  } else if (modeOrIsOpic === true) {
    mode = "opic";
  }
  const isOpic = mode === "opic";
  currentRecordingMode = mode;
  clearRecordedVoice(mode);

  activeTarget = {
    input: targetInput,
    btn: targetBtn,
    error: targetError,
    mode,
    isOpic,
  };

  baseTranscript = targetInput ? targetInput.value.trim() : "";
  finalTranscript = "";
  listening = true;
  micStarted = false;
  userExplicitlyStoppedMic = false;

  armStartupWatchdog();
  if (targetBtn) targetBtn.classList.add("listening");

  if (isOpic && typeof startSpeakingTimer === "function") {
    startSpeakingTimer();
  }

  // 실제 음성 녹음을 위한 MediaRecorder 시작
  recordedAudioChunks = [];
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      currentMediaStream = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      currentMediaRecorder = new MediaRecorder(stream, { mimeType: mime });
      currentMediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedAudioChunks.push(e.data);
        }
      };
      currentMediaRecorder.onstop = async () => {
        if (recordedAudioChunks.length > 0) {
          const rawBlob = new Blob(recordedAudioChunks, { type: mime });
          setRecordedVoiceBlob(mode, rawBlob);
          const wav = await blobTo16kHzWav(rawBlob);
          if (wav) {
            setRecordedWavBuffer(mode, wav);
          }
        }
      };
      currentMediaRecorder.start(100);
    }
  } catch (mediaErr) {
    console.warn("[MediaRecorder] Microphone stream failed:", mediaErr);
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

    // ⚡ 한국인 발화 빈출 음소 왜곡 자동 보정
    currentText = correctSttPhoneticErrors(currentText);

    if (activeTarget && activeTarget.input) {
      activeTarget.input.value = currentText;
      autoResizeTextarea(activeTarget.input);
      activeTarget.input.dispatchEvent(new Event("input"));
    }
  };

  recognition.onerror = (e) => {
    if (e.error === "aborted" || e.error === "no-speech") {
      // 침묵이나 일시적 중단은 무시하고 자동 재연결에 맡김
      return;
    }
    const msg =
      MIC_ERROR_MESSAGES[e.error] ||
      `마이크 오류가 발생했어요 (${e.error}). 다시 시도해주세요.`;
    showMicError(msg);
    stopSpeechRecognition();
  };

  recognition.onend = () => {
    // 사용자가 명시적으로 중지하지 않았고, 여전히 듣기 활성 상태라면 브라우저의 침묵 타임아웃 방어를 위해 자동 재연결
    if (listening && !userExplicitlyStoppedMic && activeTarget) {
      setTimeout(() => {
        if (listening && !userExplicitlyStoppedMic && recognition) {
          try {
            recognition.start();
          } catch (err) {
            console.warn(
              "[SpeechRecognition] Auto-restart silent retry failed:",
              err,
            );
          }
        }
      }, 150);
      return;
    }
    stopListeningUI();
  };
}

// ── 다크 모드 (Dark Theme) 관리 시스템 ─────────────────────────────
const THEME_STORAGE_KEY = "ko-en-opic-theme";

function initTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    applyTheme(isDark);
  } catch (e) {
    applyTheme(false);
  }
}

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = isDark ? "☀️" : "🌙";
    btn.title = isDark ? "라이트 모드로 전환" : "다크 모드로 전환";
  }
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark-theme");
  const nextState = !isDark;
  applyTheme(nextState);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextState ? "dark" : "light");
  } catch (e) {}
}

window.initTheme = initTheme;
window.toggleTheme = toggleTheme;
