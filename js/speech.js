/**
 * @file speech.js
 * @description OPIc 학습용 하이브리드 음성 엔진 및 인공지능 발음/다면 발화 평가 시스템
 *
 * =============================================================================
 * [주요 아키텍처 및 기능 구성]
 * =============================================================================
 * 1. 음성 합성 (TTS - Text to Speech):
 *    - 3계층 하이브리드 폴백 엔진: Azure Speech API (최우선 고품질 Neural Voice)
 *      → Google Translate TTS (경량 웹 폴백) → 브라우저 내장 Web Speech API (오프라인 폴백)
 *    - 발음 재생 속도(0.8x ~ 1.2x) 동적 변경, 자동 재생 토글, 발화 캐시 지원.
 * 2. Azure Speech F0 무료 티어(월 5시간 음성 평가, 50만자 TTS) 실시간 쿼터 트래커:
 *    - 월별 음성 시간(초) 및 TTS 문자 수 자동 누적 및 소진율/잔여량 실시간 UI 계산.
 * 3. 음성 인식 및 레코딩 (STT - Speech to Text):
 *    - Web Speech API 실시간 음성 전사 + MediaRecorder 고음질 오디오 Blob 동시 캡처.
 *    - 한국인 빈출 음소 왜곡(cafe, cozy, Buldang-dong 등) 자동 정규화 사전(`PHONETIC_CORRECTION_RULES`).
 *    - 장문 발화용 담화표지어/접속사 기반 가상 문장 분절 엔진(`splitIntoVirtualSentences`).
 * 4. OPIc 공식 채점 기준 기반 6대 영역 다면 평가 알고리즘 (`calculateComprehensiveOpicScore`):
 *    - ① 유창성(WPM, 쉼 호흡, 필러 사용률)
 *    - ② 발화량(목표 등급별 단어 수 충족도)
 *    - ③ 주제 적합도(핵심 키워드 및 연관 어휘 도메인 매칭률)
 *    - ④ 문법 정확도(LanguageTool 연동 오류 페널티)
 *    - ⑤ 어휘 다양성(TTR - Type-Token Ratio, 고급 어휘 가산점)
 *    - ⑥ 발음 일치도(Azure Pronunciation Assessment API 또는 단어 편집 거리 기반 Diff)
 *    - 최종 예측 등급(AL / IH / IM3 / IM2 / IM1 / IL / NH) 산출 및 상세 진단 보고서 렌더링.
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 */

// =============================================================================
// 1. Google AI 검색 질의 생성 헬퍼
// =============================================================================

/**
 * 문장 번역용 Google AI 검색 프롬프트 쿼리 생성
 * @returns {string} 검색창으로 전송할 한-영 문법 비교 질의 문자열
 */
function buildGoogleQuery() {
  const answer = els.userInput.value.trim();
  const ko = els.koText.textContent.trim();
  return `"${ko}"를 영어로 "${answer}"라고 썼는데 이 영어 문장 문법 분석해줘`;
}

/**
 * 문법 포인트/표현 학습용 Google AI 검색 프롬프트 쿼리 생성
 * @param {Object} item - 퀴즈 또는 문제 데이터 객체
 * @param {string} item.answer - 목표 정답 표현
 * @returns {string} 검색창 질의 문자열
 */
function buildWordGoogleQuery(item) {
  return `'${item.answer}' 표현은 언제 사용해?`;
}

// =============================================================================
// 2. TTS (음성 합성) 하이브리드 엔진 상태 및 환경설정
// =============================================================================

/** @type {number} 기본 발음 재생 속도 (0.8 ~ 1.2) */
let ttsRate = 1.0;

/** @type {boolean} 문제 로드 또는 정답 확인 시 자동 음성 재생 활성화 여부 */
let autoPlayTtsEnabled = false;

/** @type {"azure" | "google" | "native"} 우선 순위 TTS 엔진 */
let ttsEngine = "azure";

/** @type {string} Azure Cognitive Services 음성 리소스 API Key */
let azureApiKey = "";

/** @type {string} Azure Cognitive Services 리전 (예: eastus, koreacentral) */
let azureRegion = "eastus";

/** @type {string} Azure Neural Voice 모델 식별자 */
let azureVoice = "en-US-AvaNeural";

/** @type {HTMLElement|null} 현재 오디오를 재생 중인 버튼 엘리먼트 참조 */
let currentSpeakingBtn = null;

/** @type {HTMLAudioElement|null} 현재 활성화된 오디오 재생 객체 */
let activeAudio = null;

/** @type {string|null} 현재 생성된 오디오 Blob URL (메모리 누수 방지용 revokeTarget) */
let activeAudioUrl = null;

/** @const {string} 로컬 스토리지 TTS 설정 저장 키 */
const TTS_SETTINGS_KEY = "ko-en-opic-tts-settings";

/**
 * Azure SSML 요청에 포함될 특수문자 XML 이스케이프 유틸리티
 * @param {string} str - 원본 텍스트
 * @returns {string} XML 안전 문자열
 */
function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * LocalStorage에서 사용자의 맞춤형 TTS 설정을 로드하여 전역 상태 및 UI와 동기화
 */
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

  // 환경 변수 (window.ENV / js/config.js) 기본값 자동 주입:
  // 강력 새로고침, 캐시 삭제 등으로 localStorage가 비어있거나 키가 미설정된 경우 config.js 설정 자동 사용
  if (typeof window !== "undefined" && window.ENV) {
    if (!azureApiKey && window.ENV.AZURE_SPEECH_KEY) {
      azureApiKey = window.ENV.AZURE_SPEECH_KEY;
    }
    if ((!azureRegion || azureRegion === "koreacentral") && window.ENV.AZURE_SPEECH_REGION) {
      azureRegion = window.ENV.AZURE_SPEECH_REGION;
    }
    if (window.ENV.AZURE_SPEECH_VOICE) {
      azureVoice = window.ENV.AZURE_SPEECH_VOICE;
    }
  }

  updateTtsSettingsUI();
}

/**
 * 현재 전역 상태의 TTS 설정을 LocalStorage에 영구 보관
 */
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

/**
 * 대시보드 및 설정 모달의 속도 조절 칩과 자동 재생 토글 UI 동기화
 */
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

// =============================================================================
// 3. Azure Speech F0 무료 쿼터 실시간 사용량 추적기 (월간 5시간 음성 / 50만자 TTS)
// =============================================================================

/** @const {string} 로컬 스토리지 Azure F0 누적 사용량 저장 키 */
const AZURE_USAGE_STORAGE_KEY = "ko-en-opic-azure-f0-usage";

/** @const {number} Azure F0 오디오 녹음/발음평가 무료 한도 (5시간 = 18,000초 = 300분) */
const AZURE_F0_AUDIO_LIMIT_SEC = 5 * 3600;

/** @const {number} Azure F0 Neural TTS 음성 합성 문자 수 무료 한도 (500,000자) */
const AZURE_F0_TTS_CHAR_LIMIT = 500000;

/**
 * 현재 시스템 일자 기준 'YYYY-MM' 포맷 문자열 반환
 * @returns {string} 예: '2026-09'
 */
function getCurrentYearMonth() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * 사용자 친화적인 연월 레이블 반환
 * @returns {string} 예: '2026년 9월'
 */
function getCurrentYearMonthLabel() {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

/**
 * 이번 달 Azure Cognitive Services F0 무료 티어 사용량 통계 조회
 * - 월이 변경된 경우(새로운 달 진입) 자동으로 0으로 리셋 후 반환
 * @returns {Object} 사용량 지표 객체 (음성 초/퍼센트/잔여시간, TTS 문자수/퍼센트/잔여글자)
 */
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

/**
 * Azure 사용량 데이터를 LocalStorage에 영구 저장
 * @param {Object} data - 저장할 사용량 데이터
 */
function saveAzureMonthlyUsage(data) {
  try {
    localStorage.setItem(AZURE_USAGE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

/**
 * Azure Pronunciation Assessment 평가 완료 시 녹음된 오디오 길이(초) 누적
 * @param {number} seconds - 녹음된 오디오 초 단위 길이
 */
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

/**
 * Azure Neural TTS 호출 성공 시 합성된 영문 문자 수 누적
 * @param {number} chars - 합성 요청된 문자 수
 */
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

/**
 * 사용자의 수동 요청에 따라 이번 달 Azure 누적 사용량 강제 0 리셋
 */
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

/**
 * 모달 및 설정 화면 내 Azure F0 사용량 게이지 바 및 텍스트 갱신
 */
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

// =============================================================================
// 4. TTS 환경설정 모달 및 음성 엔진 초기화
// =============================================================================

/**
 * TTS 설정 모달 UI 이벤트 바인딩 및 IndexedDB 캐시/Azure 사용량 통계 갱신
 */
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

  /**
   * IndexedDB 오디오 캐시 용량 및 건수 비동기 조회 후 뱃지 업데이트
   */
  async function refreshCacheStats() {
    if (!cacheBadge || !window.AudioCache) return;
    try {
      const stats = await window.AudioCache.getStats();
      cacheBadge.textContent = `${stats.count}개 보관 중 (${stats.sizeFormatted})`;
    } catch (e) {
      cacheBadge.textContent = "0개 (0 KB)";
    }
  }

  /**
   * 모달 오픈 핸들러
   */
  function openModal() {
    if (engineSelect) engineSelect.value = ttsEngine;
    if (azureKeyInput)
      azureKeyInput.value =
        azureApiKey || (window.ENV && window.ENV.AZURE_SPEECH_KEY) || "";
    if (azureRegionInput)
      azureRegionInput.value =
        azureRegion ||
        (window.ENV && window.ENV.AZURE_SPEECH_REGION) ||
        "eastus";
    if (azureVoiceSelect)
      azureVoiceSelect.value =
        azureVoice ||
        (window.ENV && window.ENV.AZURE_SPEECH_VOICE) ||
        "en-US-AvaNeural";

    if (azureSection) {
      azureSection.style.display = ttsEngine === "azure" ? "flex" : "none";
    }

    refreshCacheStats();
    updateAzureUsageUI();
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  /**
   * 모달 닫기 핸들러
   */
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
      ttsEngine = e.target.value;
      azureSection.style.display = e.target.value === "azure" ? "flex" : "none";
      saveTtsSettings();
    });
  }

  if (azureVoiceSelect) {
    azureVoiceSelect.addEventListener("change", (e) => {
      azureVoice = e.target.value;
      saveTtsSettings();
    });
  }

  if (azureKeyInput) {
    azureKeyInput.addEventListener("change", (e) => {
      azureApiKey = e.target.value.trim();
      saveTtsSettings();
    });
  }

  if (azureRegionInput) {
    azureRegionInput.addEventListener("change", (e) => {
      azureRegion = e.target.value.trim() || "eastus";
      saveTtsSettings();
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

        // ⚡ 테스트 성공 시 입력된 설정값 즉시 전역 반영 및 영구 저장
        azureApiKey = tempKey;
        azureRegion = tempRegion;
        azureVoice = tempVoice;
        if (engineSelect) ttsEngine = engineSelect.value;
        saveTtsSettings();

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

/**
 * TTS 음성 합성 시스템 전역 초기화 (설정 복원, 모달 리스너, 속도 선택 칩 바인딩)
 */
/**
 * iOS Safari 및 모바일 브라우저의 오디오 자동 재생 제한(User Gesture Lock)을 해제하기 위한 언락커
 * 사용자의 첫 인터랙션(클릭 또는 터치) 발생 시 무음 오디오를 재생하여 AudioContext 및 HTMLAudioElement를 활성화합니다.
 */
function initMobileAudioUnlock() {
  const unlock = () => {
    // 1. HTMLAudioElement 언락용 무음 버퍼 재생
    try {
      const silentAudio = new Audio(
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA",
      );
      const playPromise = silentAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            silentAudio.pause();
          })
          .catch(() => {});
      }
    } catch (e) {}

    // 2. Web Speech API 언락용 더미 utterance
    if ("speechSynthesis" in window && !speechSynthesis.speaking) {
      try {
        const dummyUtterance = new SpeechSynthesisUtterance("");
        dummyUtterance.volume = 0;
        speechSynthesis.speak(dummyUtterance);
        speechSynthesis.cancel();
      } catch (e) {}
    }

    // 3. AudioContext 언락 (지원 브라우저)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      try {
        const ctx = new AudioContextClass();
        if (ctx.state === "suspended") {
          ctx.resume();
        }
      } catch (e) {}
    }

    window.removeEventListener("touchstart", unlock, { capture: true });
    window.removeEventListener("touchend", unlock, { capture: true });
    window.removeEventListener("click", unlock, { capture: true });
  };

  window.addEventListener("touchstart", unlock, { capture: true, once: true });
  window.addEventListener("touchend", unlock, { capture: true, once: true });
  window.addEventListener("click", unlock, { capture: true, once: true });
}

function initTTS() {
  initMobileAudioUnlock();
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

/**
 * Web Speech API 환경에서 언어별 최적의 여성 자연어 음성 객체(SpeechSynthesisVoice) 탐색
 * [디바이스 대응 정책]
 * - 안드로이드/삼성 갤럭시: 삼성 TTS 고품질 및 Google TTS 여성 보이스 자동 우선 배정
 * - iOS/macOS Safari: Siri / Samantha / Karen 등 고품질 자연어 여성 보이스 우선 배정
 * @param {string} [lang="en-US"] - 대상 언어 코드
 * @returns {SpeechSynthesisVoice|null} 매칭된 최적 음성 객체
 */
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

// =============================================================================
// 5. 음성 재생 제어 및 하이브리드 TTS 파이프라인
// =============================================================================

/** @type {number} 비동기 네트워크/캐시 대기 중 중복 발화 및 레이스 컨디션 방지용 시퀀스 ID */
let currentTtsRequestId = 0;

/**
 * 현재 재생 중인 모든 오디오 및 음성 합성 프로세스 강제 중단
 * - HTMLAudioElement 일시정지 및 리소스 해제 (Object URL revoke)
 * - 브라우저 Web Speech API 큐 취소
 * - 대기 중이던 비동기 TTS 콜백 무효화
 */
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
  if (activeAudioUrl) {
    try {
      URL.revokeObjectURL(activeAudioUrl);
    } catch (e) {}
    activeAudioUrl = null;
  }
  if ("speechSynthesis" in window) {
    try {
      speechSynthesis.cancel();
    } catch (e) {}
  }
  resetCurrentButton();
}

/**
 * 음성 재생 시작 시 해당 버튼의 시각적 활성화 클래스(.speaking) 토글
 * @param {HTMLElement|null} btn - 대상 버튼 엘리먼트
 */
function setButtonPlaying(btn) {
  if (!btn) return;
  resetCurrentButton();
  currentSpeakingBtn = btn;
  btn.classList.add("speaking");
}

/**
 * 음성 재생 종료 시 버튼의 .speaking 클래스 제거 및 상태 초기화
 */
function resetCurrentButton() {
  if (currentSpeakingBtn) {
    currentSpeakingBtn.classList.remove("speaking");
    currentSpeakingBtn = null;
  }
}

/**
 * Azure Cognitive Services Speech REST API 호출 및 오디오 데이터 캐싱
 * [비즈니스 로직]
 * 1. IndexedDB 캐시 조회: 속도/보이스/텍스트 일치 항목이 존재하면 API 호출 없이 캐시 Blob 즉시 반환
 * 2. 캐시 미스 시: Azure REST 엔드포인트(/cognitiveservices/v1)로 SSML XML 전송
 * 3. 응답 성공 시: Azure F0 월간 텍스트 사용량 누적 및 IndexedDB 영구 보존
 * @param {string} text - 음성 합성할 영문 텍스트
 * @param {string} [voiceName="en-US-AvaNeural"] - Azure Neural Voice 명칭
 * @param {number} [rate=1.0] - 재생 속도 배율
 * @param {string|null} [lang=null] - 언어 코드 (기본값 en-US)
 * @returns {Promise<Blob>} 합성된 오디오 MP3 Blob
 * @throws {Error} API 키 누락 또는 네트워크/HTTP 오류 발생 시
 */
async function fetchAzureTtsAudio(
  text,
  voiceName = "en-US-AvaNeural",
  rate = 1.0,
  lang = null,
) {
  if (!azureApiKey || !azureApiKey.trim()) {
    throw new Error("Azure API Key is not set.");
  }

  const selectedVoice = voiceName || azureVoice || "en-US-AvaNeural";
  const selectedLang =
    lang || selectedVoice.split("-").slice(0, 2).join("-") || "en-US";
  const selectedRate =
    typeof rate === "number" ? rate : parseFloat(rate) || 1.0;

  // 1. IndexedDB 캐시 조회 (속도/보이스/텍스트 키)
  const cacheKey = window.AudioCache
    ? window.AudioCache.makeKey("azure", selectedVoice, text, selectedRate)
    : null;
  if (cacheKey && window.AudioCache) {
    const cachedBlob = await window.AudioCache.getAudio(cacheKey);
    if (cachedBlob) {
      return cachedBlob;
    }
  }

  // 2. 캐시 미스 시 Azure REST API 직접 호출
  const url = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ratePercent = Math.round((selectedRate - 1.0) * 100);
  const ssmlRate =
    selectedRate === 1.0
      ? "default"
      : `${ratePercent >= 0 ? "+" : ""}${ratePercent}%`;

  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${escapeXml(selectedLang)}'><voice name='${escapeXml(selectedVoice)}'><prosody rate='${ssmlRate}'>${escapeXml(text)}</prosody></voice></speak>`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": azureApiKey.trim(),
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "OPIcStudyApp",
    },
    body: ssml,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(
      `Azure TTS Error (${res.status}): ${res.statusText} ${errBody}`,
    );
  }

  const blob = await res.blob();
  addAzureTtsUsage(text.length);

  // 3. 응답받은 오디오 Blob을 IndexedDB에 영구 캐시
  if (window.AudioCache && cacheKey) {
    window.AudioCache.saveAudio(cacheKey, blob, text).catch(() => {});
  }
  return blob;
}

/**
 * Google 번역 무료 TTS 엔드포인트 호출 및 Audio 캐싱 (1차 경량 웹 폴백)
 * @param {string} text - 음성 합성할 텍스트 (200자 이하 권장)
 * @param {string} [lang="en-US"] - 언어 코드
 * @returns {Promise<Blob>} 오디오 Blob 객체
 */
async function fetchGoogleTtsAudio(text, lang = "en-US") {
  const cacheKey = AudioCache.makeKey("google", "default", text, 1.0);
  const cachedBlob = await AudioCache.getAudio(cacheKey);
  if (cachedBlob) {
    return cachedBlob;
  }

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Google TTS Fetch failed");

  const blob = await res.blob();
  AudioCache.saveAudio(cacheKey, blob, text).catch(() => {});
  return blob;
}

/**
 * 브라우저 메모리 Blob URL을 생성하여 HTMLAudioElement로 재생
 * - 재생 완료 또는 중단 시 Object URL revoke를 통한 메모리 누수 방지
 * - 비동기 시퀀스 ID(`requestId`) 검증을 통한 중복/레이스 재생 차단
 * @param {Blob} blob - 재생할 오디오 Blob
 * @param {HTMLElement|null} btn - 연동된 재생 버튼
 * @param {number} [requestId] - 요청 시 발급된 시퀀스 ID
 * @returns {Promise<void>}
 */
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
      if (activeAudioUrl) {
        try {
          URL.revokeObjectURL(activeAudioUrl);
        } catch (e) {}
        activeAudioUrl = null;
      }
      if ("speechSynthesis" in window) {
        try {
          speechSynthesis.cancel();
        } catch (e) {}
      }

      const audioUrl = URL.createObjectURL(blob);
      activeAudioUrl = audioUrl;
      const audio = new Audio(audioUrl);
      activeAudio = audio;
      setButtonPlaying(btn);

      const cleanup = () => {
        if (activeAudioUrl === audioUrl) {
          try {
            URL.revokeObjectURL(audioUrl);
          } catch (e) {}
          activeAudioUrl = null;
        }
        if (activeAudio === audio) {
          activeAudio = null;
          resetCurrentButton();
        }
      };

      audio.onended = () => {
        cleanup();
        resolve();
      };
      audio.onerror = (e) => {
        cleanup();
        reject(e);
      };
      audio.play().catch((err) => {
        cleanup();
        reject(err);
      });
    } catch (err) {
      resetCurrentButton();
      reject(err);
    }
  });
}

/**
 * Web Speech API (브라우저 기본 내장 TTS) 오프라인 폴백 재생
 * - 모바일/태블릿 네이티브 음성 합성 엔진 활용
 * - 비동기 requestId 검증을 통한 세션 중복 충돌 방어
 * @param {string} text - 음성 합성할 텍스트
 * @param {string} [lang="en-US"] - 언어 코드
 * @param {HTMLElement|null} [btn=null] - 연동된 버튼 엘리먼트
 * @param {number} [requestId] - 요청 시 발급된 시퀀스 ID
 */
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

/**
 * 텍스트 음성 합성(TTS) 통합 오케스트레이터
 * [실행 파이프라인]
 * 1. 실행 중인 이전 TTS 및 오디오 전면 중단(stopTTS) & 신규 requestId 채번
 * 2. 1단계: IndexedDB 캐시 검사 (동일 텍스트/속도/보이스가 이미 저장된 경우 0ms 무비용 즉시 재생)
 * 3. 2단계: Azure Speech REST API 호출 (영문이고 Azure Key 유효 시 최고 품질 Neural 음성 합성)
 * 4. 3단계: Google Translate TTS 호출 (Azure 미설정 또는 실패 시 200자 이하 경량 웹 폴백)
 * 5. 4단계: 브라우저 Web Speech API 폴백 (오프라인 환경 및 최후 보루)
 * @param {string} text - 발화할 영문 또는 한글 텍스트
 * @param {string} [lang="en-US"] - 발화 언어
 * @param {HTMLElement|null} [btn=null] - 음성 재생 토글 버튼
 */
async function speakText(text, lang = "en-US", btn = null) {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  // [UX 토글 정책]:
  // 현재 말하고 있는 동일한 버튼을 다시 클릭하면 즉시 음성을 음소거(Mute)하고 정지
  if (
    currentSpeakingBtn === btn &&
    (activeAudio || (window.speechSynthesis && speechSynthesis.speaking))
  ) {
    stopTTS();
    return;
  }

  // [동시성 및 경합 조건(Race Condition) 방어]:
  // 사용자가 버튼을 연타하거나 다음 문제로 빠르게 넘어갈 때, 이전 비동기 fetch/Blob 대기 작업이
  // 뒤늦게 완료되어 새 문장의 오디오와 겹쳐서 재생되는 현상을 막기 위해 시퀀스 ID(currentTtsRequestId)를 증가시킴
  stopTTS();
  const thisRequestId = currentTtsRequestId;

  const isKorean = lang.startsWith("ko");
  const effectiveEngine = isKorean ? "google" : ttsEngine;
  const voiceName = isKorean ? "ko-KR" : azureVoice || "en-US-AvaNeural";

  // [1단계: IndexedDB 무비용 영구 캐시 검사]
  // 동일 엔진, 보이스, 문장, 속도로 생성된 Blob이 있으면 네트워크 트래픽 0바이트, 0ms 즉각 재생
  const cacheKey = window.AudioCache
    ? window.AudioCache.makeKey(effectiveEngine, voiceName, cleanText, ttsRate)
    : null;

  if (cacheKey && window.AudioCache) {
    try {
      const cachedBlob = await window.AudioCache.getAudio(cacheKey);
      if (thisRequestId !== currentTtsRequestId) return; // 비동기 대기 중 새로운 요청 발생 시 취소

      if (cachedBlob) {
        await playAudioBlob(cachedBlob, btn, thisRequestId);
        return;
      }
    } catch (e) {
      console.warn("[TTS] Cache lookup failed:", e);
    }
  }

  if (thisRequestId !== currentTtsRequestId) return;

  // [2단계: Azure Cognitive Neural TTS (최고 품질 뉴럴 음성)]
  // 영문이고 사용자의 Azure API 키가 유효할 때 호출 (월 50만 자 무료 쿼터)
  if (
    !isKorean &&
    effectiveEngine === "azure" &&
    azureApiKey &&
    azureApiKey.trim()
  ) {
    try {
      const blob = await fetchAzureTtsAudio(cleanText, voiceName, ttsRate);
      if (thisRequestId !== currentTtsRequestId) return; // 비동기 대기 중 새 요청 발생 시 취소

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

  // [3단계: Google Translate 경량 웹 TTS 폴백]
  // 브라우저의 CORS 정책상 fetch는 외부 엔드포인트에서 차단될 수 있으므로,
  // 영문 텍스트는 지연 없이 고품질 네이티브 음성(Web Speech API)을 우선 사용하고,
  // Google 엔진이 명시적으로 선택된 짧은 한글 텍스트에 한해서만 시도합니다.
  if (effectiveEngine === "google" && isKorean && cleanText.length <= 100) {
    try {
      const blob = await fetchGoogleTtsAudio(cleanText, lang);
      if (thisRequestId !== currentTtsRequestId) return; // 비동기 대기 중 새 요청 발생 시 취소

      await playAudioBlob(blob, btn, thisRequestId);
      return;
    } catch (err) {
      // CORS 또는 네트워크 오류 시 콘솔 경고 없이 조용히 Web Speech API로 전환
    }
  }

  if (thisRequestId !== currentTtsRequestId) return;

  // [4단계: 브라우저 내장 Web Speech API (권장 기본 네이티브 엔진)]
  // 0ms 무지연, 완벽한 오프라인 작동 및 고품질 원어민/한국어 발음 제공
  playNativeTTS(cleanText, lang, btn, thisRequestId);
}

// =============================================================================
// 6. 음성 녹음(MediaRecorder) 및 인메모리 오디오 버퍼 관리
// =============================================================================

/** @type {Object<string, Blob|null>} 각 학습 모드별 최근 녹음된 원본 오디오 Blob 보관소 */
let lastRecordedBlobs = {
  practice: null,
  opic: null,
  pattern: null,
  speechPractice: null,
};

/** @type {Object<string, ArrayBuffer|null>} Azure 발음 평가용 16kHz 모노 PCM WAV 버퍼 보관소 */
let lastRecordedWavs = {
  practice: null,
  opic: null,
  pattern: null,
  speechPractice: null,
};

/** @type {MediaRecorder|null} 현재 활성화된 브라우저 미디어 레코더 인스턴스 */
let currentMediaRecorder = null;

/** @type {MediaStream|null} 현재 캡처 중인 마이크 오디오 스트림 */
let currentMediaStream = null;

/** @type {Promise<void>|null} 녹음 중단 및 16kHz WAV 변환 완료 대기 Promise */
let mediaRecorderDonePromise = null;
let mediaRecorderDoneResolver = null;

/** @type {Blob[]} 청크 단위로 분할 수집되는 오디오 데이터 청크 배열 */
let recordedAudioChunks = [];

/** @type {"practice" | "opic" | "pattern" | "speechPractice"} 현재 활성화된 녹음 모드 */
let currentRecordingMode = "practice";

/**
 * 특정 학습 모드의 최근 녹음된 오디오 Blob 조회
 * @param {"practice" | "opic" | "pattern" | "speechPractice"} [mode="practice"]
 * @returns {Blob|null}
 */
function getRecordedVoiceBlob(mode = "practice") {
  return lastRecordedBlobs[mode] || null;
}

/**
 * 특정 학습 모드의 녹음된 오디오 Blob 인메모리 저장
 * @param {"practice" | "opic" | "pattern" | "speechPractice"} mode
 * @param {Blob} blob
 */
function setRecordedVoiceBlob(mode, blob) {
  lastRecordedBlobs[mode] = blob;
}

/**
 * 16kHz 변환된 WAV 버퍼 인메모리 저장
 * @param {"practice" | "opic" | "pattern" | "speechPractice"} mode
 * @param {ArrayBuffer} buffer
 */
function setRecordedWavBuffer(mode, buffer) {
  lastRecordedWavs[mode] = buffer;
}

/**
 * 특정 모드의 인메모리 오디오 Blob 및 WAV 버퍼 초기화
 * @param {"practice" | "opic" | "pattern" | "speechPractice"} [mode="practice"]
 */
function clearRecordedVoice(mode = "practice") {
  lastRecordedBlobs[mode] = null;
  lastRecordedWavs[mode] = null;
}

/**
 * 학습자가 방금 녹음한 실제 육성 오디오 재생 (녹음본 부재 시 텍스트 TTS로 자동 폴백)
 * @param {"practice" | "opic" | "pattern" | "speechPractice"} [mode="practice"] - 학습 모드
 * @param {HTMLElement|null} [btn=null] - 재생 토글 버튼
 * @param {string} [fallbackText=""] - 녹음본이 없을 경우 대체 재생할 정답 텍스트
 */
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

/**
 * 브라우저 오디오 Blob(webm, mp4, aac 등)을 Azure AI Speech 및 Whisper 입력 규격인
 * 16kHz 16-bit Mono PCM WAV 버퍼(ArrayBuffer)로 변환
 * [파이프라인]
 * 1. AudioContext를 통해 원본 압축 오디오를 AudioBuffer로 디코딩
 * 2. OfflineAudioContext를 생성하여 16000Hz 단일 채널(Mono)로 리샘플링 렌더링
 * 3. 44바이트 표준 RIFF WAV 헤더 생성 및 PCM 16bit 정수 샘플링 변환
 * @param {Blob} blob - 사용자 마이크 녹음 Blob
 * @returns {Promise<ArrayBuffer|null>} 변환된 16kHz WAV 버퍼, 실패 시 null
 */
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

    /**
     * 바이너리 뷰 오프셋 위치에 ASCII 문자열 기록
     * @param {DataView} v
     * @param {number} offset
     * @param {string} str
     */
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

/**
 * 프랑스어/스페인어 차용어 악센트(é, è, ê, á, ñ 등)를 표준 영어 ASCII 알파벳으로 변환
 * - 유니코드 정규화(NFD)를 적용하여 결합 발음 구별 기호 제거
 * @param {string} text - 원본 영문 텍스트
 * @returns {string} 살균 정규화된 텍스트
 */
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

/**
 * UTF-8 한글 및 특수기호가 포함된 문자열을 HTTP 헤더 안전 Base64 문자열로 인코딩
 * @param {string} str - 원본 문자열
 * @returns {string} Base64 인코딩 결과
 */
function utf8ToBase64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );
}

// =============================================================================
// 7. Azure AI 음성 정밀 발음 평가 (Pronunciation Assessment API)
// =============================================================================

/**
 * 16kHz 16-bit PCM WAV 버퍼에 실제 유효한 음성 에너지가 존재하는지 검사
 * - 데스크톱/모바일 브라우저에서 마이크 스트림 충돌로 인해 무음(Silence)이 녹음된 경우
 *   Azure가 0점을 반환하는 현상을 사전 차단하기 위한 가드 함수
 * @param {ArrayBuffer} wavBuffer - 16kHz WAV 버퍼
 * @returns {boolean} 유효한 음성 에너지 존재 여부
 */
function hasSufficientAudioEnergy(wavBuffer) {
  if (!wavBuffer || wavBuffer.byteLength <= 44) return false;
  try {
    const view = new DataView(wavBuffer, 44);
    const totalSamples = Math.floor((wavBuffer.byteLength - 44) / 2);
    if (totalSamples < 800) return false; // 0.05초 미만

    let sumSq = 0;
    let maxPeak = 0;
    const step = Math.max(1, Math.floor(totalSamples / 4000));
    let count = 0;

    for (let i = 0; i < totalSamples; i += step) {
      const sample = Math.abs(view.getInt16(i * 2, true));
      if (sample > maxPeak) maxPeak = sample;
      sumSq += sample * sample;
      count++;
    }

    const rms = Math.sqrt(sumSq / Math.max(1, count));
    // 16-bit PCM(-32768~32767) 기준 피크가 100 미만이거나 RMS가 12 미만이면 완전 무음으로 판정
    return maxPeak >= 100 && rms >= 12;
  } catch (e) {
    return true;
  }
}

/**
 * Azure 연속 음성 인식(Continuous Recognition) 세그먼트 배열 종합 산출
 * - 다문장, 긴 문장, OPIc 전체 발화의 각 세그먼트별 단어 및 음소, 점수를 단어 수 가중치로 종합 병합
 * - STT 오인식 단어와 실제 발음 간의 괴리로 인한 억울한 0점(Omission/극저점) 방어 보정 포함
 * @param {Array<Object>} segments - NBest[0] 세그먼트 결과 배열
 * @param {boolean} [isUserSpokenRef=false] - 평가 대본이 사용자의 실시간 STT 발화에서 생성되었는지 여부
 * @returns {Object} 정밀 평가 결과 객체
 */
function aggregateAzureSegments(segments, isUserSpokenRef = false) {
  if (!segments || segments.length === 0) {
    throw new Error("음성 인식 결과가 없습니다. 다시 시도해 주세요.");
  }

  let totalWords = 0;
  let weightedPron = 0;
  let weightedAccuracy = 0;
  let weightedFluency = 0;
  let weightedProsody = 0;
  let weightedCompleteness = 0;
  const allWords = [];
  const displayTexts = [];

  segments.forEach((nbest) => {
    const rawWords = nbest.Words || [];
    const count = Math.max(1, rawWords.length);

    // Azure STT REST API 및 Speech SDK NBest 객체 구조 지원:
    // 점수 필드는 NBest[0].PronunciationAssessment 또는 NBest[0].PronAssessment 객체 내에 존재함
    const pa =
      nbest.PronunciationAssessment ||
      nbest.PronAssessment ||
      nbest;

    let pron = Number(pa.PronScore ?? nbest.PronScore ?? 0);
    let acc = Number(pa.AccuracyScore ?? nbest.AccuracyScore ?? 0);
    let flu = Number(pa.FluencyScore ?? nbest.FluencyScore ?? 0);
    let pro = Number(pa.ProsodyScore ?? nbest.ProsodyScore ?? 0);
    let comp = Number(pa.CompletenessScore ?? nbest.CompletenessScore ?? 0);

    const display = nbest.Display || nbest.DisplayText || nbest.Lexical;
    if (display) {
      displayTexts.push(display);
    }

    let segWordAccSum = 0;
    let segValidWordCount = 0;

    rawWords.forEach((w) => {
      // 단어 레벨 점수 및 오류 유형 추출
      const wpa =
        w.PronunciationAssessment ||
        w.PronAssessment ||
        w;

      let wordAccuracy = Number(wpa.AccuracyScore ?? w.AccuracyScore ?? 0);
      let wordError = wpa.ErrorType || w.ErrorType || "None";

      const phonemes = (w.Phonemes || []).map((p) => {
        const ppa =
          p.PronunciationAssessment ||
          p.PronAssessment ||
          p;
        return {
          phoneme: p.Phoneme,
          accuracyScore: Math.round(
            Number(ppa.AccuracyScore ?? p.AccuracyScore ?? 0),
          ),
        };
      });

      // 음소 점수는 존재하나 단어 점수가 0으로 누락된 경우 음소 평균으로 복원
      if (wordAccuracy === 0 && phonemes.length > 0) {
        const posPhonemes = phonemes.filter((p) => p.accuracyScore > 0);
        if (posPhonemes.length > 0) {
          wordAccuracy =
            posPhonemes.reduce((s, p) => s + p.accuracyScore, 0) /
            posPhonemes.length;
        }
      }

      // ⚡ 핵심 보정: 사용자가 실제로 말해서 STT로 전사된 단어이거나 발음이 조금 부정확해
      // 브라우저 STT가 다른 단어로 전사한 경우, Azure가 해당 단어를 Omission(0점)이나 극저점(<45점)으로
      // 처리하여 전체 문장 점수가 무너지는 현상을 방지
      if (isUserSpokenRef) {
        if (wordError === "Omission" || wordAccuracy === 0) {
          wordError = "Mispronunciation";
          wordAccuracy = Math.max(wordAccuracy, 62);
        } else if (wordAccuracy > 0 && wordAccuracy < 48) {
          wordAccuracy = Math.round(48 + wordAccuracy * 0.4);
        }
      } else if (wordError === "Mispronunciation" && wordAccuracy > 0 && wordAccuracy < 35) {
        // 모범 답안 비교 시에도 일부 음소가 발음된 경우 최소 부분 점수(35~50점) 보장
        wordAccuracy = Math.round(35 + wordAccuracy * 0.5);
      }

      const roundedWordAcc = Math.round(wordAccuracy);
      if (wordError !== "Insertion") {
        segWordAccSum += roundedWordAcc;
        segValidWordCount++;
      }

      allWords.push({
        word: w.Word,
        accuracyScore: roundedWordAcc,
        errorType: wordError,
        phonemes,
      });
    });

    // 세그먼트 내 단어 보정 점수를 반영하여 세그먼트 정확도/완성도/종합점수 동기화
    if (segValidWordCount > 0) {
      const recomputedAcc = Math.round(segWordAccSum / segValidWordCount);
      if (recomputedAcc > acc) {
        acc = recomputedAcc;
      }
      const nonOmitted = rawWords.filter(
        (w) =>
          (w.PronunciationAssessment?.ErrorType || w.ErrorType) !== "Omission",
      ).length;
      const recomputedComp = isUserSpokenRef
        ? Math.max(comp, 85)
        : Math.max(comp, Math.round((nonOmitted / count) * 100));
      comp = Math.min(100, recomputedComp);
    }

    if (flu === 0 && acc > 0) flu = Math.min(100, Math.max(65, acc));
    if (pro === 0 && acc > 0) pro = Math.min(100, Math.max(65, acc));
    if (comp === 0 && acc > 0) comp = Math.min(100, Math.max(70, acc));

    const computedPron = Math.round(
      acc * 0.45 + flu * 0.25 + pro * 0.15 + comp * 0.15,
    );
    if (pron === 0 || computedPron > pron) {
      pron = computedPron;
    }

    totalWords += count;
    weightedPron += pron * count;
    weightedAccuracy += acc * count;
    weightedFluency += flu * count;
    weightedProsody += pro * count;
    weightedCompleteness += comp * count;
  });

  const pronScore = Math.round(weightedPron / Math.max(1, totalWords));
  const accuracyScore = Math.round(weightedAccuracy / Math.max(1, totalWords));
  const fluencyScore = Math.round(weightedFluency / Math.max(1, totalWords));
  const prosodyScore = Math.round(weightedProsody / Math.max(1, totalWords));
  const completenessScore = Math.round(
    weightedCompleteness / Math.max(1, totalWords),
  );

  // ⚡ 모든 점수가 0점인 경우(마이크 무음 또는 인식 실패) 에러를 발생시켜 로컬 채점으로 즉시 안전하게 폴백
  if (pronScore <= 0 && accuracyScore <= 0) {
    throw new Error("유효한 발음 점수가 산출되지 않아 로컬 채점으로 전환합니다.");
  }

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
    words: allWords,
    feedback,
    recognizedText: displayTexts.join(" "),
  };
}

/**
 * Azure Cognitive Services Speech SDK를 활용한 무제한 연속 발음 평가 (Continuous Recognition)
 * - 30초 REST API 제한을 극복하고, 중간 쉼/침묵이 있는 긴 복합문장 및 6개 문장 전체를 한 번에 채점
 * @param {ArrayBuffer} wavBuffer - 16kHz 16bit 모노 PCM WAV 오디오
 * @param {string} referenceText - 모범 기준 정답 텍스트
 * @param {boolean} [isUserSpokenRef=false] - 사용자 발화 기반 대본 여부
 * @returns {Promise<Object>} 정밀 평가 결과 객체
 */
async function assessPronunciationWithSpeechSDK(
  wavBuffer,
  referenceText,
  isUserSpokenRef = false,
) {
  const sdk = typeof window !== "undefined" ? window.SpeechSDK : null;
  if (!sdk || !sdk.SpeechConfig || !sdk.SpeechRecognizer) {
    throw new Error("SpeechSDK is not available");
  }

  const cleanRef = sanitizeEnglishText(referenceText.trim());
  const region = (azureRegion || "eastus").trim();
  const apiKey = azureApiKey.trim();

  const speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
  speechConfig.speechRecognitionLanguage = "en-US";

  // 문장 간 호흡/침묵(최대 3초)에도 세션이 조기 종료되지 않도록 타임아웃 확장
  if (sdk.PropertyId) {
    if (sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs) {
      speechConfig.setProperty(
        sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs,
        "2500",
      );
    }
    if (sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs) {
      speechConfig.setProperty(
        sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs,
        "8000",
      );
    }
    if (sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs) {
      speechConfig.setProperty(
        sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
        "3000",
      );
    }
  }

  // PushStream을 사용하여 오디오 버퍼가 즉시 EOF 처리되어 끊기는 현상을 방지
  const streamFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
  const pushStream = sdk.AudioInputStream.createPushStream(streamFormat);
  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

  const pronConfig = new sdk.PronunciationAssessmentConfig(
    cleanRef,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true, // enableMiscue = true (다문장 연속 인식 필수)
  );
  pronConfig.enableProsodyAssessment = true;

  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  pronConfig.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    const segments = [];
    let isFinished = false;
    let safetyTimer = null;

    const cleanup = () => {
      if (safetyTimer) {
        clearTimeout(safetyTimer);
        safetyTimer = null;
      }
      try {
        recognizer.close();
      } catch (e) {}
    };

    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      try {
        recognizer.stopContinuousRecognitionAsync(
          () => {
            cleanup();
            if (segments.length === 0) {
              reject(new Error("음성 인식 결과가 없습니다."));
            } else {
              try {
                const res = aggregateAzureSegments(segments, isUserSpokenRef);
                if (!res || !res.words || res.words.length === 0) {
                  reject(new Error("인식된 유효 단어가 없습니다."));
                } else {
                  resolve(res);
                }
              } catch (err) {
                reject(err);
              }
            }
          },
          (err) => {
            cleanup();
            if (segments.length > 0) {
              try {
                const res = aggregateAzureSegments(segments, isUserSpokenRef);
                if (res && res.words && res.words.length > 0) {
                  resolve(res);
                  return;
                }
              } catch (e2) {}
            }
            reject(new Error(err || "연속 음성 인식 중단 오류"));
          },
        );
      } catch (err) {
        cleanup();
        if (segments.length > 0) {
          try {
            const res = aggregateAzureSegments(segments, isUserSpokenRef);
            if (res && res.words && res.words.length > 0) {
              resolve(res);
              return;
            }
          } catch (e3) {}
        }
        reject(err);
      }
    };

    recognizer.recognized = (s, e) => {
      if (e.result && e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        const jsonStr = e.result.properties.getProperty(
          sdk.PropertyId.SpeechServiceResponse_JsonResult,
        );
        if (jsonStr) {
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed && parsed.NBest && parsed.NBest[0]) {
              const wordCount = parsed.NBest[0].Words?.length || 0;
              if (wordCount > 0) {
                segments.push(parsed.NBest[0]);
              }
            }
          } catch (jsonErr) {
            console.warn("[SpeechSDK] JSON parse warning:", jsonErr);
          }
        }
      }
    };

    recognizer.canceled = (s, e) => {
      if (e.reason === sdk.CancellationReason.Error) {
        console.warn(
          "[SpeechSDK] Recognition canceled with error:",
          e.errorDetails,
        );
      }
      finish();
    };

    recognizer.sessionStopped = () => {
      finish();
    };

    // 안전 타임아웃: 오디오 길이에 비례하되 최대 45초
    const audioSec = Math.max(1, (wavBuffer.byteLength - 44) / 32000);
    const timeoutMs = Math.min(
      45000,
      Math.max(12000, Math.round(audioSec * 1200) + 6000),
    );

    safetyTimer = setTimeout(() => {
      console.warn("[SpeechSDK] Continuous recognition safety timeout fired");
      finish();
    }, timeoutMs);

    recognizer.startContinuousRecognitionAsync(
      () => {
        try {
          const pcmBytes =
            wavBuffer.byteLength > 44 ? wavBuffer.slice(44) : wavBuffer;
          const chunkSize = 8192;
          let offset = 0;
          while (offset < pcmBytes.byteLength) {
            const chunk = pcmBytes.slice(
              offset,
              Math.min(offset + chunkSize, pcmBytes.byteLength),
            );
            pushStream.write(chunk);
            offset += chunkSize;
          }
          // 마지막 문장이 잘리지 않도록 0.5초 분량의 무음(Zero PCM) 패딩 추가 후 close
          const silencePadding = new ArrayBuffer(16000);
          pushStream.write(silencePadding);
          pushStream.close();
        } catch (writeErr) {
          console.error("[SpeechSDK] PushStream write error:", writeErr);
          finish();
        }
      },
      (startErr) => {
        cleanup();
        reject(new Error(startErr || "음성 인식 시작 실패"));
      },
    );
  });
}

/**
 * Azure Cognitive Services Pronunciation Assessment 단일 REST API 호출 (NBest 원시 객체 반환)
 * @param {ArrayBuffer} wavBuffer - 16kHz 16bit 모노 PCM WAV 오디오
 * @param {string} referenceText - 모범 기준 정답 텍스트
 * @returns {Promise<Object>} NBest[0] 평가 데이터 객체
 */
async function assessPronunciationWithAzureRestRaw(wavBuffer, referenceText) {
  const cleanRef = sanitizeEnglishText(referenceText.trim());
  const region = (azureRegion || "eastus").trim();
  const endpoint = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;

  const pronConfig = {
    ReferenceText: cleanRef,
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    Dimension: "Comprehensive",
    EnableProsodyAssessment: "True",
    EnableMiscue: "True",
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

  const data = await res.json();
  if (data.RecognitionStatus !== "Success" || !data.NBest || !data.NBest[0]) {
    throw new Error(`음성 인식 실패 (${data.RecognitionStatus || "No match"})`);
  }

  return data.NBest[0];
}

/**
 * Azure Cognitive Services Pronunciation Assessment REST API (단문 및 중문 집계 모드)
 * @param {ArrayBuffer} wavBuffer - 16kHz 16bit 모노 PCM WAV 오디오
 * @param {string} referenceText - 모범 기준 정답 텍스트
 * @param {boolean} [isUserSpokenRef=false] - 사용자 발화 기반 대본 여부
 * @returns {Promise<Object>} 집계된 평가 결과 객체
 */
async function assessPronunciationWithAzureRest(
  wavBuffer,
  referenceText,
  isUserSpokenRef = false,
) {
  const nbest = await assessPronunciationWithAzureRestRaw(
    wavBuffer,
    referenceText,
  );
  return aggregateAzureSegments([nbest], isUserSpokenRef);
}

/**
 * Azure AI 음성 정밀 발음 평가 (고속 단일 REST + 장문 SpeechSDK 하이브리드 파이프라인)
 * - 오디오 무음 검사를 통해 하드웨어 충돌 시 0점 반환을 원천 차단
 * - 30초 이하 발화는 오디오 강제 절단(Slicing) 없이 단일 REST(EnableMiscue=True)로 전체 문장을 한 번에 정확히 채점
 * - 긴 침묵이 포함된 장문 발화는 SpeechSDK PushStream 연속 인식으로 누락 없이 100% 채점
 * @param {ArrayBuffer} wavBuffer - 16kHz 16bit 모노 PCM WAV 오디오
 * @param {string} referenceText - 모범 기준 정답 텍스트
 * @param {boolean} [isUserSpokenRef=false] - 사용자 발화 기반 대본 여부
 * @returns {Promise<Object>} 정밀 평가 결과 객체 (점수, 음소/단어 분석, OPIc 예상 등급)
 * @throws {Error} API 키 부재, 오디오 데이터 부족/무음, 인식 실패 시
 */
async function assessPronunciationWithAzure(
  wavBuffer,
  referenceText,
  isUserSpokenRef = false,
) {
  if (!azureApiKey || !azureApiKey.trim()) {
    throw new Error("Azure API Key가 설정되지 않았습니다.");
  }
  if (!wavBuffer || wavBuffer.byteLength < 1000) {
    throw new Error("평가할 오디오 데이터가 부족합니다.");
  }
  if (!hasSufficientAudioEnergy(wavBuffer)) {
    throw new Error("오디오 무음 감지: 로컬 채점 엔진으로 전환합니다.");
  }

  const audioSec = Math.max(0.5, (wavBuffer.byteLength - 44) / 32000);
  const totalWords = referenceText.trim().split(/\s+/).filter(Boolean).length;

  // 1. 28초 이하 오디오는 단일 REST API 호출을 최우선 시도 (1~2초 내 응답, 오디오 슬라이싱 왜곡 없음)
  if (audioSec <= 28) {
    try {
      const restResult = await assessPronunciationWithAzureRest(
        wavBuffer,
        referenceText,
        isUserSpokenRef,
      );
      const recognizedCount = (restResult.words || []).filter(
        (w) => w.errorType !== "Omission",
      ).length;

      // 전체 단어의 60% 이상이 정상 매칭되었거나 단문인 경우 즉시 반환
      if (totalWords <= 8 || recognizedCount >= Math.floor(totalWords * 0.6)) {
        addAzureAudioUsage(audioSec);
        return restResult;
      }
      console.log(
        `[PronAssessment] REST partial coverage (${recognizedCount}/${totalWords} words due to long pause), trying SpeechSDK continuous recognition...`,
      );
    } catch (restErr) {
      console.warn(
        "[PronAssessment] Direct REST assessment failed, trying SpeechSDK:",
        restErr.message,
      );
    }
  }

  // 2. 28초 초과 장문 발화 또는 중간에 긴 침묵이 있어 REST에서 일부 문장만 인식된 경우:
  // Azure Speech SDK 연속 인식(PushStream)으로 전체 문장 채점
  if (
    typeof window !== "undefined" &&
    window.SpeechSDK &&
    window.SpeechSDK.SpeechConfig &&
    window.SpeechSDK.SpeechRecognizer
  ) {
    try {
      const sdkResult = await assessPronunciationWithSpeechSDK(
        wavBuffer,
        referenceText,
        isUserSpokenRef,
      );
      addAzureAudioUsage(audioSec);
      return sdkResult;
    } catch (sdkErr) {
      console.warn(
        "[PronAssessment] SpeechSDK continuous mode failed:",
        sdkErr.message,
      );
    }
  }

  // 3. 최후 폴백: 단일 REST 호출
  const fallbackResult = await assessPronunciationWithAzureRest(
    wavBuffer,
    referenceText,
    isUserSpokenRef,
  );
  addAzureAudioUsage(audioSec);
  return fallbackResult;
}

// =============================================================================
// 8. 텍스트 정규화, 발음 유사도(Phonetic Similarity) 및 일치도(Diff) 평가
// =============================================================================

/**
 * 텍스트 비교 평가를 위한 영문 소문자/특수문자 정규화 헬퍼
 * @param {string} text - 원본 텍스트
 * @returns {string} 정규화된 텍스트 (알파벳, 숫자, 아포스트로피, 공백만 허용)
 */
function normalizeForEval(text) {
  return sanitizeEnglishText(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 영어 단어의 기본 어간(Stem) 정규화 (복수형, 과거형, 진행형 어미 유연 매칭용)
 * @param {string} word - 소문자 영단어
 * @returns {string} 어간 문자열
 */
function getWordStem(word) {
  if (!word || word.length <= 3) return word || "";
  let w = word.toLowerCase().replace(/^'+|'+$/g, "");
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("ing") && w.length > 5) {
    const base = w.slice(0, -3);
    return base.length >= 3 ? base : w;
  }
  if (w.endsWith("ed") && w.length > 4) {
    const base = w.slice(0, -2);
    return base.length >= 3 ? base : w;
  }
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3)
    return w.slice(0, -1);
  return w;
}

/**
 * 한국인 학습자의 주요 발음 혼동 음소(L/R, F/P, V/B, TH/S/D, Z/J, 장단모음 등)를
 * 동일한 음운 골격(Phonetic Skeleton)으로 변환하여 억울한 오인식 감점을 방지
 * @param {string} word - 소문자 영단어
 * @returns {string} 음운 골격 문자열
 */
function getPhoneticSkeleton(word) {
  if (!word) return "";
  let s = getWordStem(word)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (!s) return "";

  s = s
    .replace(/ph/g, "p")
    .replace(/th/g, "s")
    .replace(/sh/g, "s")
    .replace(/ch/g, "c")
    .replace(/ck/g, "k")
    .replace(/qu/g, "k")
    .replace(/dg/g, "j")
    .replace(/gh/g, "")
    .replace(/kn/g, "n")
    .replace(/wr/g, "r")
    .replace(/wh/g, "w")
    .replace(/[lr]/g, "r")
    .replace(/[fp]/g, "p")
    .replace(/[vb]/g, "b")
    .replace(/[zj]/g, "j")
    .replace(/(?:ee|ea|ie|ey|y)/g, "i")
    .replace(/(?:oo|ou|ow|ew)/g, "u")
    .replace(/(?:ai|ay|ei)/g, "e")
    .replace(/(?:au|aw|oa)/g, "o")
    .replace(/(?:er|ir|ur|or|ar)/g, "r")
    .replace(/[aeiou]+/g, "a")
    .replace(/(.)\1+/g, "$1");

  return s;
}

/**
 * 두 영단어 간의 레벤슈타인 편집 거리(Levenshtein Edit Distance) 계산
 * @param {string} a
 * @param {string} b
 * @returns {number} 편집 거리
 */
function getLevenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const dp = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const temp = dp[i];
      if (a[i - 1] === b[j - 1]) {
        dp[i] = prev;
      } else {
        dp[i] = 1 + Math.min(prev, dp[i], dp[i - 1]);
      }
      prev = temp;
    }
  }
  return dp[a.length];
}

/**
 * 사용자가 말한 단어(STT 전사)와 목표 단어 간의 발음/철자 유사도 점수(0.0 ~ 1.0) 산출
 * - 완전 일치: 1.0
 * - 축약형/어간(단복수·시제) 일치: 0.90
 * - 음운 골격(L/R, F/P, V/B, 장단모음 등) 일치: 0.84
 * - 편집 거리 기반 발음 유사: 0.65 ~ 0.85
 * @param {string} spokenWord - 사용자 발화 인식 단어
 * @param {string} targetWord - 비교 대상 목표 단어
 * @returns {number} 유사도 비율 (0.0 ~ 1.0)
 */
function getWordSimilarityScore(spokenWord, targetWord) {
  if (!spokenWord || !targetWord) return 0;
  const u = spokenWord.toLowerCase().replace(/^'+|'+$/g, "");
  const t = targetWord.toLowerCase().replace(/^'+|'+$/g, "");
  if (!u || !t) return 0;
  if (u === t) return 1.0;

  // 아포스트로피 제거 일치 (don't <-> dont, I'm <-> im)
  if (u.replace(/'/g, "") === t.replace(/'/g, "")) return 0.98;

  // 어간(Stem) 일치 (cafe <-> cafes, walk <-> walked, live <-> living)
  const uStem = getWordStem(u);
  const tStem = getWordStem(t);
  if (uStem.length >= 3 && uStem === tStem) return 0.9;

  // 2글자 이하 짧은 기능어는 오매칭 방지를 위해 엄격 비교
  if (t.length <= 2 || u.length <= 2) {
    return 0;
  }

  // 음운 골격(Phonetic Skeleton) 일치 (living <-> leaving, walk <-> work, light <-> right 등)
  const uSkel = getPhoneticSkeleton(u);
  const tSkel = getPhoneticSkeleton(t);
  if (uSkel.length >= 2 && uSkel === tSkel) {
    return 0.84;
  }

  // 철자 편집 거리 비율 및 음운 골격 편집 거리 비율 중 높은 값 채택
  const maxLen = Math.max(u.length, t.length);
  const charDist = getLevenshteinDistance(u, t);
  const charSim = 1 - charDist / maxLen;

  let skelSim = 0;
  if (uSkel.length >= 2 && tSkel.length >= 2) {
    const skelMax = Math.max(uSkel.length, tSkel.length);
    const skelDist = getLevenshteinDistance(uSkel, tSkel);
    skelSim = (1 - skelDist / skelMax) * 0.92;
  }

  // 첫 글자(또는 음운 첫 소리)가 같거나 어근이 포함 관계이면 가산점
  let bonus = 0;
  if (u[0] === t[0] || (uSkel && tSkel && uSkel[0] === tSkel[0])) {
    bonus += 0.05;
  }
  if (
    u.length >= 4 &&
    t.length >= 4 &&
    (u.startsWith(t.slice(0, 3)) || t.startsWith(u.slice(0, 3)))
  ) {
    bonus += 0.05;
  }

  return Math.min(0.88, Math.max(charSim, skelSim) + bonus);
}

/**
 * 브라우저 STT가 발음 부정확으로 인해 다른 단어로 오인식한 토큰을
 * 모범 답안(referenceText) 및 질문 핵심 어휘(questionItem)와 대조하여 의도한 단어로 자동 정렬·복원
 * @param {string} userText - 사용자 STT 전사 텍스트
 * @param {string} [referenceText=""] - 모범 기준 문장/스크립트
 * @param {Object|null} [questionItem=null] - OPIc 질문 메타데이터
 * @returns {string} 발음 오인식이 보정된 텍스트
 */
function alignSttWithReference(
  userText,
  referenceText = "",
  questionItem = null,
) {
  if (!userText || !userText.trim()) return "";
  let corrected = correctSttPhoneticErrors(userText);

  // 모범 답안 및 질문 키워드에서 참조 어휘 사전 구축
  const refSources = [];
  if (referenceText) refSources.push(referenceText);
  if (questionItem) {
    if (questionItem.q_en) refSources.push(questionItem.q_en);
    if (questionItem.model_en) refSources.push(questionItem.model_en);
    if (Array.isArray(questionItem.keywords))
      refSources.push(questionItem.keywords.join(" "));
  }
  if (refSources.length === 0) return corrected;

  const refWordsMap = new Map(); // lower -> original word
  refSources.join(" ").split(/\s+/).forEach((raw) => {
    const clean = raw.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, "");
    const lower = clean.toLowerCase();
    if (lower.length >= 3 && !refWordsMap.has(lower)) {
      refWordsMap.set(lower, clean);
    }
  });

  if (refWordsMap.size === 0) return corrected;

  const refWordList = Array.from(refWordsMap.keys());
  const tokens = corrected.split(/\s+/);
  const alignedTokens = [];

  for (let i = 0; i < tokens.length; i++) {
    const rawToken = tokens[i];
    const prefixMatch = rawToken.match(/^[^a-zA-Z0-9']*/);
    const suffixMatch = rawToken.match(/[^a-zA-Z0-9']*$/);
    const prefix = prefixMatch ? prefixMatch[0] : "";
    const suffix = suffixMatch ? suffixMatch[0] : "";
    const core = rawToken.slice(
      prefix.length,
      rawToken.length - suffix.length,
    );
    const lowerCore = core.toLowerCase();

    // 1. 이미 참조 사전에 정확히 존재하는 단어이면 그대로 유지
    if (lowerCore.length < 3 || refWordsMap.has(lowerCore)) {
      alignedTokens.push(rawToken);
      continue;
    }

    // 2. 연속된 두 단어가 하나의 목표 단어로 쪼개져 오인식된 경우 병합 검사 (예: "leave in" -> "living")
    if (i + 1 < tokens.length) {
      const nextRaw = tokens[i + 1];
      const nextSuffixMatch = nextRaw.match(/[^a-zA-Z0-9']*$/);
      const nextSuffix = nextSuffixMatch ? nextSuffixMatch[0] : "";
      const nextCore = nextRaw.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, "");
      const combinedLower = (lowerCore + nextCore.toLowerCase());
      if (combinedLower.length >= 5) {
        let bestCombinedTarget = null;
        let bestCombinedSim = 0;
        for (const refLower of refWordList) {
          if (Math.abs(refLower.length - combinedLower.length) > 3) continue;
          const sim = getWordSimilarityScore(combinedLower, refLower);
          if (sim >= 0.80 && sim > bestCombinedSim) {
            bestCombinedSim = sim;
            bestCombinedTarget = refWordsMap.get(refLower);
          }
        }
        if (bestCombinedTarget) {
          alignedTokens.push(prefix + bestCombinedTarget + nextSuffix);
          i++; // 다음 토큰 소모
          continue;
        }
      }
    }

    // 3. 흔한 기본 기능어(I, my, the, and, with, very 등)는 다른 단어로 강제 치환하지 않음
    if (EVAL_STOP_WORDS && EVAL_STOP_WORDS.has(lowerCore)) {
      alignedTokens.push(rawToken);
      continue;
    }

    // 4. 참조 어휘 사전에서 발음 유사도가 높은 목표 단어 탐색
    let bestTarget = null;
    let bestSim = 0;
    for (const refLower of refWordList) {
      if (Math.abs(refLower.length - lowerCore.length) > 3) continue;
      const sim = getWordSimilarityScore(lowerCore, refLower);
      if (sim >= 0.74 && sim > bestSim) {
        bestSim = sim;
        bestTarget = refWordsMap.get(refLower);
      }
    }

    if (bestTarget) {
      alignedTokens.push(prefix + bestTarget + suffix);
    } else {
      alignedTokens.push(rawToken);
    }
  }

  return alignedTokens.join(" ");
}
window.alignSttWithReference = alignSttWithReference;
window.getWordSimilarityScore = getWordSimilarityScore;

/**
 * 로컬 단어 일치도(Diff & Score) 평가 (문장 번역, 만능 패턴, 개별 문장 따라 말하기 공용)
 * - 1차: 정확한 단어 일치(match, 100% 인정)
 * - 2차: 발음이 조금 부정확하여 유사 단어로 전사된 경우 음운/편집거리 유사도 매칭(partial, 70~90% 부분 점수 인정)
 * - 누락 단어(miss), 일치 단어(match), 유사 발음 단어(partial), 추가 인식 단어(actual) 시각화 HTML 생성
 * @param {string} userInput - 학습자가 음성으로 입력한 문장
 * @param {string} modelAnswer - 시스템 모범 정답 문장
 * @returns {Object} 일치율 점수(0~100), Diff 시각화 HTML, 한국어 피드백 문자열
 */
function evaluateSpeech(userInput, modelAnswer) {
  const correctedInput = correctSttPhoneticErrors(userInput || "");
  const normUser = normalizeForEval(correctedInput);
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

  let matchCredit = 0;
  let partialCount = 0;
  const matchedUserIndices = new Set();
  const modelMatchResults = new Array(modelTokens.length).fill(null);

  // 1차 패스: 완전 일치(Exact Match) 우선 탐색
  modelTokens.forEach((targetWord, mIdx) => {
    for (let j = 0; j < userTokens.length; j++) {
      if (!matchedUserIndices.has(j) && userTokens[j] === targetWord) {
        matchedUserIndices.add(j);
        matchCredit += 1.0;
        modelMatchResults[mIdx] = {
          type: "match",
          targetWord,
          spokenWord: userTokens[j],
          sim: 1.0,
        };
        break;
      }
    }
  });

  // 2차 패스: 미매칭 목표 단어에 대해 발음 유사 단어(Phonetic/Fuzzy Match) 탐색하여 부분 점수 부여
  modelTokens.forEach((targetWord, mIdx) => {
    if (modelMatchResults[mIdx]) return;

    let bestUserIdx = -1;
    let bestSim = 0;
    for (let j = 0; j < userTokens.length; j++) {
      if (matchedUserIndices.has(j)) continue;
      const sim = getWordSimilarityScore(userTokens[j], targetWord);
      // 3글자 이상 단어는 0.65 이상, 짧은 단어는 0.80 이상일 때 발음 유사 단어로 인정
      const threshold = targetWord.length >= 4 ? 0.65 : 0.78;
      if (sim >= threshold && sim > bestSim) {
        bestSim = sim;
        bestUserIdx = j;
      }
    }

    if (bestUserIdx !== -1) {
      matchedUserIndices.add(bestUserIdx);
      const spokenWord = userTokens[bestUserIdx];
      // 어간/복수형 일치(>=0.90)는 완전 일치에 준하게 처리하고, 발음 유사 단어는 부분 점수(0.75~0.88) 부여
      if (bestSim >= 0.90) {
        matchCredit += 0.95;
        modelMatchResults[mIdx] = {
          type: "match",
          targetWord,
          spokenWord,
          sim: bestSim,
        };
      } else {
        partialCount++;
        matchCredit += Math.max(0.72, bestSim);
        modelMatchResults[mIdx] = {
          type: "partial",
          targetWord,
          spokenWord,
          sim: bestSim,
        };
      }
    } else {
      modelMatchResults[mIdx] = {
        type: "miss",
        targetWord,
      };
    }
  });

  const diffParts = modelMatchResults.map((item) => {
    if (item.type === "match") {
      return `<span class="eval-word match">${escapeHtml(item.targetWord)}</span>`;
    }
    if (item.type === "partial") {
      const pct = Math.round(item.sim * 100);
      return `<span class="eval-word partial" style="background:#fef3c7;color:#b45309;border:1px solid #fcd34d;padding:2px 6px;border-radius:6px;font-weight:600;" title="발음 유사 인정 (${pct}%): '${escapeHtml(item.spokenWord)}'로 인식됨 → 목표 단어 '${escapeHtml(item.targetWord)}'">${escapeHtml(item.targetWord)} <small style="font-weight:500;opacity:0.85;">(≈${escapeHtml(item.spokenWord)})</small></span>`;
    }
    return `<span class="eval-word miss">${escapeHtml(item.targetWord)}</span>`;
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
    Math.round((matchCredit / modelTokens.length) * 100),
  );
  let feedback = "";
  if (score >= 90) {
    feedback =
      partialCount > 0
        ? "🌟 훌륭합니다! 노란색으로 표시된 유사 발음 단어만 한 번 더 확인해보세요."
        : "🌟 훌륭합니다! 원어민 모범 답안과 거의 완벽하게 일치해요.";
  } else if (score >= 70) {
    feedback =
      partialCount > 0
        ? "👍 잘하셨어요! 노란색(발음 유사) 및 빨간색(누락) 단어의 발음을 유의해서 한 번 더 말해보세요."
        : "👍 잘하셨어요! 놓친 단어들을 확인하고 한 번 더 말해보세요.";
  } else if (score >= 40) {
    feedback =
      "💪 좋아요! 노란색·빨간색으로 표시된 단어 발음에 유의해서 다시 연습해 보세요.";
  } else {
    feedback = "🌱 천천히 또박또박 모범 답안 발음을 듣고 따라 해보세요.";
  }

  return { isAzure: false, score, diffHtml: diffParts.join(" "), feedback };
}

// =============================================================================
// 9. OPIc 시험 주제 적합도 및 다면 평가 도메인 사전
// =============================================================================

/** @type {Object<string, string[]>} OPIc 14대 핵심 카테고리별 도메인 필수 어휘 풀 (js/eval-dict.js 로드) */
const TOPIC_VOCABULARY_MAP = window.EvalDict
  ? window.EvalDict.TOPIC_VOCABULARY_MAP
  : {};

/** @type {Set<string>} 불용어(Stop Words) 제외 목록 */
const EVAL_STOP_WORDS = window.EvalDict
  ? window.EvalDict.STOP_WORDS
  : new Set();

/** @type {string[]} OPIc 논리 전개용 담화 연결어 목록 (because, therefore, however 등) */
const OPIC_CONNECTORS = window.EvalDict ? window.EvalDict.CONNECTORS : [];

/** @type {string[]} 자연스러운 발화 지연 필러 표현 목록 (you know, honestly, well 등) */
const OPIC_FILLERS = window.EvalDict ? window.EvalDict.FILLERS : [];

/** @type {string[]} 돌발/경험 질문 필수 과거 시제 동사 목록 */
const OPIC_PAST_VERBS = window.EvalDict ? window.EvalDict.PAST_VERBS : [];

/**
 * 단어 경계(Word Boundary)를 보장하는 정규식 기반 고정밀 어휘 매칭 헬퍼
 * @param {string} text - 사용자 발화 텍스트
 * @param {string[]} list - 대상 단어/표현 목록
 * @returns {string[]} 발견된 매칭 단어 목록
 */
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

/**
 * 에바의 질문과 수험자 답변 간의 주제 적합성(Topic Relevance) 진단 알고리즘
 * [평가 기준]
 * 1. 질문 영문 텍스트 내 핵심 명사/동사 토큰 추출
 * 2. 질문 카테고리(집, 동네, 여행, 호텔 등)에 따른 연관 도메인 어휘 풀 매칭
 * 3. 주제 불일치(Off-Topic) 판정 시 OPIc 시험 기준 IL 이하 하드 캡 부과
 * @param {string} userInput - 수험자의 발화 전사 텍스트
 * @param {Object|null} questionItem - 질문 메타데이터 객체 (q_en, cat, keywords 등)
 * @returns {Object} 주제 적합도 점수(0~100), 판정 상태(high/moderate/low/off-topic), 피드백
 */
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

  // 3. 사용자 발화와 주제 단어 풀 매칭 (발음 오인식 및 어간 변화 허용)
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
      let isMatched =
        userTokens.includes(topicWord) || cleanUser.includes(topicWord);
      if (!isMatched && topicWord.length >= 4) {
        isMatched = userTokens.some(
          (uTok) => getWordSimilarityScore(uTok, topicWord) >= 0.78,
        );
      }
      if (isMatched && !matchedSet.has(topicWord)) {
        matchedKeywords.push(topicWord);
        matchedSet.add(topicWord);
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

// =============================================================================
// 10. OPIc 다면 평가 종합 채점 엔진 (ACTFL 공식 기준 기반)
// =============================================================================

/**
 * ACTFL OPIc 공식 평가 가이드라인 기반 6대 영역 종합 다면 평가 알고리즘
 *
 * [평가 지표 및 배점 가중치]
 * 1. 발음 및 유창성 (Speech Score: 35%):
 *    - Azure Pronunciation Assessment API (정확도/유창성/운율) 또는 로컬 STT 신뢰도
 * 2. 발화량 및 문단 구성력 (Volume Score: 35%):
 *    - AL: 14문장 이상 (130단어 이상) - 복수 문단 구성 및 상세 묘사
 *    - IH: 10~13문장 (95~129단어) - 유기적 문단 연결
 *    - IM3: 8~9문장 (75~94단어) - 준문단 구성
 *    - IM2: 6~7문장 (55~74단어) - 일상 묘사/루틴
 *    - IM1: 5~6문장 (35~54단어) - 단순 문장 결합
 *    - IL: 3~4문장 (19~34단어) - 단순 단문 나열
 *    - Novice: 1~2문장 (18단어 미만) - 단답형 파편화
 * 3. 주제 적합도 (Topic Relevance: 20%):
 *    - 질문 의도 및 도메인 핵심 어휘 매칭 (Off-Topic 판정 시 최대 IL 등급 하드 캡)
 * 4. 담화 표지어 및 시제 다양성 (Discourse Bonus: 10%):
 *    - 논리 연결어(Connectors), 자연스러운 필러(Fillers), 과거 시제 동사 가산점
 *
 * [비즈니스 룰 - 등급 상한선(Hard Cap)]
 * - 발음이 아무리 원어민 같아도, 1~2문장 단답형 발화 시 IL 이상 부여 불가
 * - 질문과 무관한 엉뚱한 답변(Off-Topic) 시 점수 무관하게 IL 등급으로 강제 제한
 *
 * @param {Object} params
 * @param {number} [params.pronScore=70] - 발음 정확도 점수
 * @param {number} [params.fluencyScore=70] - 발화 유창성 점수
 * @param {number} [params.accuracyScore=70] - 음소 정확도 점수
 * @param {number} [params.prosodyScore=70] - 억양 및 운율 점수
 * @param {string} [params.userText=""] - 수험자 발화 전사 텍스트
 * @param {Object|null} [params.questionItem=null] - 질문 메타데이터
 * @param {boolean} [params.isAzure=false] - Azure AI 평가 여부
 * @returns {Object} 종합 평가 결과 (finalScore, opicGrade, wordCount, sentenceCount, volumeWarning 등)
 */
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

/**
 * OPIc 실전 모드 전용 나만의 자유 발화 평가 (로컬 엔진 폴백 모드)
 * - 발화 어휘 수, 고유 단어 수, 문장 수, 연결어/필러/과거시제 매칭 태그 분석
 * - OPIc 시험 기준 발화량 가이드 및 주제 적합도 뱃지 렌더링
 * @param {string} userInput - 수험자의 발화 텍스트
 * @param {Object|null} [questionItem=null] - 에바의 질문 메타데이터
 * @returns {Object} 점수, 예측 등급(opicGrade), 시각화 HTML(diffHtml), 피드백
 */
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
    compResult: compResult,
    diffHtml: statsHtml + `<div class="eval-diff">${wordsHtml}</div>`,
    feedback: compResult.feedback,
  };
}

// =============================================================================
// 11. 발음 및 다면 평가 결과 UI 렌더러
// =============================================================================

/**
 * 발음 및 다면 발화 평가 결과 UI 통합 렌더러 (하이브리드: Azure AI 정밀 진단 ↔ 로컬 엔진)
 * @param {Object} options
 * @param {HTMLElement} options.boxEl - 결과 컨테이너 박스
 * @param {HTMLElement} options.badgeEl - 점수/등급 뱃지 엘리먼트
 * @param {HTMLElement} options.diffEl - Diff 및 세부 통계 엘리먼트
 * @param {HTMLElement} options.feedbackEl - 한국어 총평 피드백 엘리먼트
 * @param {string} [options.mode="practice"] - 학습 모드
 * @param {string} [options.referenceText=""] - 기준 정답 텍스트
 * @param {string} [options.userText=""] - 수험자 입력 텍스트
 * @param {HTMLElement|null} [options.voiceBtn=null] - 녹음 듣기 버튼
 * @param {Object|null} [options.questionItem=null] - 질문 메타데이터
 */
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

  const isOpic = mode === "opic" || mode === "speechPractice";

  // 녹음이 진행 중이거나 아직 WAV 변환 중이면 완료될 때까지 안전하게 대기
  try {
    await ensureRecordingStoppedAndReady(mode);
  } catch (e) {}

  let wavBuffer = lastRecordedWavs[mode];
  if (!wavBuffer && lastRecordedBlobs[mode]) {
    try {
      wavBuffer = await blobTo16kHzWav(lastRecordedBlobs[mode]);
      if (wavBuffer) {
        setRecordedWavBuffer(mode, wavBuffer);
      }
    } catch (e) {}
  }

  // ⚡ 사용자가 말한 문장(userText)에서 발음이 부정확하여 브라우저 STT가 다른 단어로 잘못 전사한 경우,
  // 모범 답안(referenceText) 및 질문 핵심 어휘(questionItem)와 음운 유사도를 비교해 의도한 단어로 복원
  const alignedUserText = userText
    ? alignSttWithReference(userText.trim(), referenceText, questionItem)
    : "";

  // 평가 기준 대본(targetAssessmentText) 결정:
  // 사용자가 마이크로 실제로 말한 답변(alignedUserText)이 존재하면, 말한 문장 전체가 빠짐없이
  // 온전히 채점되도록 alignedUserText를 평가 기준 대본으로 최우선 지정합니다.
  let targetAssessmentText = "";
  let isUserSpokenRef = false;
  if (alignedUserText && alignedUserText.split(/\s+/).filter(Boolean).length >= 1) {
    targetAssessmentText = alignedUserText;
    isUserSpokenRef = true;
  } else {
    targetAssessmentText = (referenceText || alignedUserText || "").trim();
  }

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
        isUserSpokenRef,
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
  const effectiveUserText = alignedUserText || userText;
  if (isOpic) {
    const opicLocalResult = evaluateOpicSpeaking(
      effectiveUserText,
      questionItem,
    );
    renderLocalOpicResultUI(opicLocalResult);
  } else {
    const localResult = evaluateSpeech(
      effectiveUserText,
      referenceText || effectiveUserText,
    );
    renderLocalResultUI(localResult);
  }

  function renderAzureResultUI(res) {
    const usage = getAzureMonthlyUsage();

    // OPIc / 자유발화 모드일 경우 Azure 음향 지표 + 발화량 + 주제적합도를 결합한 실전 종합 점수 산출
    let compOpic = null;
    let finalGrade = res.opicGrade;
    let finalScore = res.pronScore;

    if (isOpic) {
      compOpic = calculateComprehensiveOpicScore({
        pronScore: res.pronScore,
        fluencyScore: res.fluencyScore,
        accuracyScore: res.accuracyScore,
        prosodyScore: res.prosodyScore,
        userText: alignedUserText || userText,
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
      let displayScore = w.accuracyScore > 0 ? w.accuracyScore : "";
      let errorLabel = "";

      if (w.errorType === "Omission") {
        scoreClass = "omission";
        displayScore = "누락";
        errorLabel = "[미발화/누락]";
      } else if (w.errorType === "Insertion") {
        scoreClass = "insertion";
        displayScore = "+추가";
        errorLabel = "[추가 발화]";
      } else if (w.accuracyScore < 60) {
        scoreClass = "score-bad";
      } else if (w.accuracyScore < 80) {
        scoreClass = "score-warn";
      }

      const phonemeList = (w.phonemes || [])
        .map((p) => `${getPhonemeKoreanDesc(p.phoneme)}: ${p.accuracyScore}점`)
        .join(" · ");

      let tooltipText = `${w.word}: ${w.accuracyScore}점`;
      if (errorLabel) {
        tooltipText = `${w.word} ${errorLabel} - ${
          w.errorType === "Omission"
            ? "발음되지 않았거나 인식이 누락됨"
            : "대본에 없는 추가 발화"
        }`;
      } else if (phonemeList) {
        tooltipText = `${w.word} (${w.accuracyScore}점) - ${phonemeList}`;
      }

      wordsHtml += `
        <div class="azure-word-chip ${scoreClass}" tabindex="0" title="${escapeHtml(tooltipText)}">
          <span>${escapeHtml(w.word)}</span>
          <span class="word-score">${escapeHtml(String(displayScore))}</span>
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

// =============================================================================
// 12. 영문 문법 교정(LanguageTool) 및 하이브리드 한-영 번역 엔진
// =============================================================================

/**
 * LanguageTool 오픈소스 REST API를 활용한 영어 문법/철자 오류 검사
 * @param {string} text - 검사 대상 영문 텍스트
 * @returns {Promise<Array<Object>>} 검출된 문법 오류 매칭 객체 목록 (offset, length, message, replacements)
 */
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

/** @type {Map<string, string>} 인메모리 번역 LRU 캐시 (최대 100개 유지) */
const translationCache = new Map();

/** @type {number} Google 번역 API 429 Too Many Requests 방지용 쿨다운 타임스탬프 */
let googleTranslateCooldownUntil = 0;

/** @type {number} MyMemory 번역 API 429 Too Many Requests 방지용 쿨다운 타임스탬프 */
let myMemoryCooldownUntil = 0;

/**
 * 영문 문장을 한국어로 실시간 번역
 * [하이브리드 아키텍처]
 * 1. 번역 인메모리 캐시 히트 검사
 * 2. 1차 번역 엔진: Google Translate gtx 엔드포인트 (고속 & 실시간 STT 최적화)
 * 3. 2차 번역 엔진: MyMemory API 폴백 (429 쿨다운 보호 적용)
 * @param {string} text - 번역할 영문 문자열
 * @returns {Promise<string>} 번역된 한국어 문자열
 */
async function translateToKorean(text) {
  const clean = (text || "").trim();
  if (!clean) return "";

  // 1. 캐시 히트 검사
  if (translationCache.has(clean)) {
    return translationCache.get(clean);
  }

  let translated = "";

  // 2. 1차 번역 엔진: Google Translate API (실시간 전사에 최적화)
  if (Date.now() > googleTranslateCooldownUntil) {
    try {
      const queryText = clean.slice(0, 300);
      const url =
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=" +
        encodeURIComponent(queryText);
      const res = await fetch(url);
      if (res.status === 429) {
        googleTranslateCooldownUntil = Date.now() + 600000; // 10분 쿨다운
      } else if (res.ok) {
        const data = await res.json();
        translated = (data[0] || [])
          .map((chunk) => chunk[0])
          .join("")
          .trim();
      }
    } catch (e) {
      googleTranslateCooldownUntil = Date.now() + 600000;
    }
  }

  // 3. 2차 번역 엔진: MyMemory API 폴백 (429 감지 시 10분 쿨다운)
  if (!translated && Date.now() > myMemoryCooldownUntil) {
    try {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean.slice(0, 300))}&langpair=en|ko`;
      const res = await fetch(myMemoryUrl);
      if (res.status === 429) {
        myMemoryCooldownUntil = Date.now() + 600000;
      } else if (res.ok) {
        const data = await res.json();
        if (
          data &&
          data.responseData &&
          data.responseData.translatedText &&
          !data.responseData.translatedText.startsWith("MYMEMORY WARNING:")
        ) {
          translated = data.responseData.translatedText.trim();
        } else {
          myMemoryCooldownUntil = Date.now() + 600000;
        }
      }
    } catch (e) {
      myMemoryCooldownUntil = Date.now() + 600000;
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

/**
 * 문법 검사 결과 및 교정 제안 리스트 UI 렌더링
 * @param {Array<Object>} matches - LanguageTool 오류 목록
 * @param {string} text - 원본 영문 텍스트
 * @param {HTMLElement} [targetBox=els.grammarBox] - 렌더링 박스 엘리먼트
 * @param {HTMLElement} [targetContent=els.grammarContent] - 내용 엘리먼트
 */
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
    ? `<div class="g-note" style="margin-bottom:8px">내 답변 해석: "${escapeHtml(translated)}"</div>`
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

/** @type {number|null} 실시간 번역 디바운스 타이머 식별자 */
let translateTimer = null;

/**
 * 음성 인식(STT) 진행 중 또는 타이핑 중 실시간 한국어 번역 프리뷰 렌더링
 * @param {string} text - 실시간 입력 텍스트
 */
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

// =============================================================================
// 13. STT(음성 인식) 및 한국인 발화 음소 자동 보정 엔진
// =============================================================================

/** @type {SpeechRecognition|null} Web Speech API 음성 인식 인스턴스 */
let recognition = null;

/** @type {boolean} 마이크 활성 수신 상태 플래그 */
let listening = false;

/** @type {number|null} 마이크 응답 지연 감시 타이머 (Watchdog) */
let micStartTimer = null;

/** @type {number|null} 안드로이드/모바일 음성인식 무봉제 재연결 타이머 */
let speechRestartTimer = null;

/** @type {boolean} 실제 마이크 하드웨어 스트림 시작 여부 */
let micStarted = false;

/** @type {Object|null} 현재 마이크 입력을 받고 있는 대상 UI 요소 묶음 */
let activeTarget = null;

/** @type {string} 마이크 시작 전 텍스트에어리어에 이미 작성되어 있던 기존 텍스트 */
let baseTranscript = "";

/** @type {string} 현재 음성 인식 세션에서 확정된(final) 전사 텍스트 버퍼 */
let currentSessionFinal = "";

/** @type {string} 현재 음성 인식 세션에서 미확정된(interim) 임시 전사 텍스트 버퍼 (Safari/Samsung 인터넷 및 즉시 정지 시 누락 방지용) */
let currentSessionInterim = "";

/** @type {string} 확정된 음성 전사 텍스트 */
let finalTranscript = "";

/** @const {Object<string, string>} Web Speech API 에러 코드별 한국어 안내 메시지 */
const MIC_ERROR_MESSAGES = {
  "not-allowed":
    "마이크 권한이 필요해요. 브라우저 주소창의 🔒 아이콘 → 마이크 → 허용으로 설정해주세요.",
  "permission-denied":
    "마이크 권한이 필요해요. 브라우저 주소창의 🔒 아이콘 → 마이크 → 허용으로 설정해주세요.",
  "service-not-allowed":
    "이 브라우저는 음성 인식 서비스를 지원하지 않아요. Chrome 또는 삼성 인터넷 브라우저에서 시도해보세요.",
  "no-speech":
    "음성이 감지되지 않았어요. 마이크를 가까이 대고 다시 말씀해주세요.",
  network:
    "네트워크 오류로 음성을 인식하지 못했어요. 인터넷 연결을 확인해주세요.",
  "audio-capture":
    "마이크 장치에 접근할 수 없어요. 다른 앱(통화, 녹음 등)이 마이크를 사용 중인지 확인해주세요.",
};

/**
 * 마이크 오류 메시지를 대상 UI 엘리먼트에 시각적으로 표시
 * @param {string} msg - 안내할 에러 메시지
 * @param {HTMLElement|null} [errorEl=null] - 메시지 표시용 엘리먼트
 */
function showMicError(msg, errorEl) {
  const targetEl =
    errorEl || (activeTarget && activeTarget.error) || els.micError;
  if (!targetEl) return;
  targetEl.textContent = msg;
  targetEl.classList.add("show");
}

/**
 * 마이크 오류 메시지 초기화 및 숨김 처리
 * @param {HTMLElement|null} [errorEl=null]
 */
function clearMicError(errorEl) {
  const targetEl =
    errorEl || (activeTarget && activeTarget.error) || els.micError;
  if (!targetEl) return;
  targetEl.textContent = "";
  targetEl.classList.remove("show");
}

/**
 * 한국인 영어 학습자의 빈번한 음소 분절 및 왜곡 표현 자동 치환 규칙 목록
 * [주요 보정 대상]
 * - 아파트 분절: "a part meant" -> "apartment"
 * - 카페 쪼개짐: "caf s" -> "cafes"
 * - 국내 주요 지명/브랜드: "building dong" -> "Buldang-dong", "two some" -> "Twosome"
 */
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

/**
 * 실시간 STT 전사 텍스트에 한국인 발화 오인식 보정 규칙 일괄 적용
 * @param {string} text - 원본 음성 전사 텍스트
 * @returns {string} 자동 교정된 텍스트
 */
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

/**
 * 마침표 등 구두점이 누락된 긴 STT 발화 스트림을 접속사/필러/담화표지어 기준으로 가상 분절
 * @param {string} text - 원본 발화 텍스트
 * @returns {string[]} 가상 분절된 문장 배열
 */
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

/** @type {boolean} 사용자가 수동으로 마이크 종료 버튼을 눌렀는지 여부 (침묵 시 브라우저 자동 연결 제어용) */
let userExplicitlyStoppedMic = false;

/**
 * 마이크/녹음 버튼을 '듣는 중(정지 가능)' 상태(⏹️)로 전환
 * @param {HTMLElement|null} btn - 대상 마이크 버튼
 */
function setMicBtnListeningUI(btn) {
  if (!btn) return;
  btn.classList.add("listening");
  if (!btn.hasAttribute("data-orig-html")) {
    btn.setAttribute("data-orig-html", btn.innerHTML.trim() || "🎤");
  }
  if (!btn.hasAttribute("data-orig-title")) {
    btn.setAttribute("data-orig-title", btn.getAttribute("title") || "");
  }
  btn.innerHTML = "⏹️";
  btn.setAttribute("title", "음성 입력 및 녹음 중지 (클릭 시 정지)");
}

/**
 * 마이크/녹음 버튼을 원래 대기 상태(🎤)로 복원
 * @param {HTMLElement|null} btn - 대상 마이크 버튼
 */
function resetMicBtnListeningUI(btn) {
  if (!btn) return;
  btn.classList.remove("listening");
  if (btn.hasAttribute("data-orig-html")) {
    btn.innerHTML = btn.getAttribute("data-orig-html") || "🎤";
    btn.removeAttribute("data-orig-html");
  } else {
    btn.innerHTML = "🎤";
  }
  if (btn.hasAttribute("data-orig-title")) {
    const origTitle = btn.getAttribute("data-orig-title");
    if (origTitle) {
      btn.setAttribute("title", origTitle);
    } else {
      btn.removeAttribute("title");
    }
    btn.removeAttribute("data-orig-title");
  }
}
window.setMicBtnListeningUI = setMicBtnListeningUI;
window.resetMicBtnListeningUI = resetMicBtnListeningUI;

/**
 * 마이크 수신 상태 UI 비활성화 및 타이머 정리
 */
function stopListeningUI() {
  listening = false;
  micStarted = false;
  if (micStartTimer) {
    clearTimeout(micStartTimer);
    micStartTimer = null;
  }
  if (speechRestartTimer) {
    clearTimeout(speechRestartTimer);
    speechRestartTimer = null;
  }
  if (activeTarget && activeTarget.btn) {
    resetMicBtnListeningUI(activeTarget.btn);
  }
  if (els.micBtn) resetMicBtnListeningUI(els.micBtn);
  if (els.opicMicBtn) resetMicBtnListeningUI(els.opicMicBtn);
  if (els.patternMicBtn) resetMicBtnListeningUI(els.patternMicBtn);
  const spMicBtn = document.getElementById("speechPracticeMicBtn");
  if (spMicBtn) resetMicBtnListeningUI(spMicBtn);
  if (typeof updateSpeechPracticeMicUI === "function")
    updateSpeechPracticeMicUI(false);

  // 말하기 타이머 정지 (OPIc 실전 및 만능 패턴)
  if (typeof stopSpeakingTimer === "function") {
    stopSpeakingTimer();
  }
  if (typeof stopPatternSpeakingTimer === "function") {
    stopPatternSpeakingTimer();
  }
}

/**
 * 음성 인식 내부 텍스트 버퍼 리셋 함수 (사용자가 입력창을 비우거나 새로 쓰기를 누를 때 연동)
 * @param {string} [newText=""] - 새로운 기본 텍스트
 */
function resetBaseTranscript(newText = "") {
  baseTranscript = newText || "";
  currentSessionFinal = "";
  currentSessionInterim = "";
}
window.resetBaseTranscript = resetBaseTranscript;

/**
 * 진행 중인 모든 음성 인식(STT) 및 MediaRecorder 녹음 완전 중단
 */
function stopSpeechRecognition() {
  userExplicitlyStoppedMic = true;
  if (speechRestartTimer) {
    clearTimeout(speechRestartTimer);
    speechRestartTimer = null;
  }
  stopListeningUI();
  if (activeTarget && activeTarget.input) {
    const sessionSpoken = [currentSessionFinal, currentSessionInterim]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join(" ");
    currentSessionFinal = "";
    currentSessionInterim = "";

    if (sessionSpoken) {
      const correctedSession = correctSttPhoneticErrors(sessionSpoken);
      baseTranscript = baseTranscript
        ? `${baseTranscript} ${correctedSession}`.trim()
        : correctedSession.trim();
    } else if (activeTarget.input.value.trim()) {
      baseTranscript = activeTarget.input.value.trim();
    }
    activeTarget.input.value = baseTranscript;
    autoResizeTextarea(activeTarget.input);
    activeTarget.input.dispatchEvent(new Event("input"));
  } else {
    currentSessionFinal = "";
    currentSessionInterim = "";
  }
  if (recognition) {
    try {
      recognition.onstart = null;
      recognition.onaudiostart = null;
      recognition.onsoundstart = null;
      recognition.onspeechstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    } catch (e) {}
    // ⚡ 안드로이드/갤럭시 기기는 한 번 정지된 SpeechRecognition 인스턴스에 start()를 재호출하면
    // DOMException 오류가 발생하거나 오디오 스트림이 먹통이 되므로 반드시 null로 초기화하여 신규 생성 보장
    recognition = null;
  }

  // MediaRecorder 중지 및 오디오 저장
  if (currentMediaRecorder && currentMediaRecorder.state !== "inactive") {
    try {
      currentMediaRecorder.stop();
    } catch (e) {}
    // ⚡ 트랙 종료는 onstop 콜백에서 녹음 데이터가 완전히 플러시된 후 수행하여 조기 절단 방지
  } else if (currentMediaStream) {
    try {
      currentMediaStream.getTracks().forEach((track) => track.stop());
    } catch (e) {}
    currentMediaStream = null;
  }

  activeTarget = null;
}

/**
 * 진행 중인 오디오 녹음을 안전하게 종료하고, 최신 16kHz WAV 버퍼 변환이 완료될 때까지 대기
 * @param {string} [mode="practice"] - 학습 모드
 * @param {number} [timeoutMs=3500] - 최대 대기 시간
 * @returns {Promise<void>}
 */
async function ensureRecordingStoppedAndReady(mode = "practice", timeoutMs = 3500) {
  const needsStop =
    (currentMediaRecorder && currentMediaRecorder.state !== "inactive") ||
    listening;

  if (needsStop) {
    stopSpeechRecognition();
  }

  if (mediaRecorderDonePromise) {
    let timer = null;
    const timeoutPromise = new Promise((resolve) => {
      timer = setTimeout(resolve, timeoutMs);
    });
    await Promise.race([mediaRecorderDonePromise, timeoutPromise]);
    if (timer) clearTimeout(timer);
  }
}
window.ensureRecordingStoppedAndReady = ensureRecordingStoppedAndReady;

/**
 * 마이크 응답 없음 감시 타이머 (Watchdog)
 * - 모바일 브라우저의 권한 승인 대기시간 및 네트워크 핸드셰이크를 고려하여 모바일 14초, 데스크톱 8초 부여
 */
function armStartupWatchdog() {
  if (micStartTimer) clearTimeout(micStartTimer);
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  const timeoutMs = isMobile ? 14000 : 8000;
  micStartTimer = setTimeout(() => {
    if (listening && !micStarted) {
      showMicError(
        "마이크 응답이 지연되고 있어요. 브라우저 설정에서 마이크 권한이 허용되어 있는지 확인해주세요.",
      );
      stopSpeechRecognition();
    }
  }, timeoutMs);
}

/**
 * 통합 음성 인식/녹음 토글 컨트롤러 (문장 연습, OPIc 실전, 만능 패턴, 발화 연습 공용)
 * [모바일/데스크톱 최적화 정책]
 * - 모바일 발화 연습(speechPractice): MediaRecorder 녹음 후 온디바이스 Whisper AI가 전사하므로 마이크 충돌 방지를 위해 단독 레코딩 실행
 * - 모바일 기타 모드(문장/OPIc/패턴): 실시간 Web Speech STT 전용 실행
 * - 데스크톱: STT 실시간 전사 + MediaRecorder 고음질 오디오 Blob 동시 캡처
 * @param {HTMLInputElement|HTMLTextAreaElement} targetInput - 전사 텍스트가 입력될 엘리먼트
 * @param {HTMLElement} targetBtn - 마이크 토글 버튼 엘리먼트
 * @param {HTMLElement|null} targetError - 에러 메시지 출력 엘리먼트
 * @param {string|boolean} [modeOrIsOpic=false] - 학습 모드 식별자
 * @param {string|null} [subMode=null] - 세부 모드
 */
function toggleSpeechRecognition(
  targetInput,
  targetBtn,
  targetError,
  modeOrIsOpic = false,
  subMode = null,
) {
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  let mode = "practice";
  if (typeof modeOrIsOpic === "string") {
    mode = modeOrIsOpic;
  } else if (modeOrIsOpic === true) {
    mode = "opic";
  }
  const isOpic = mode === "opic";

  // 발화 연습 및 모든 학습 모드의 STT/녹음 실행 정책
  let shouldRunStt = true;
  let shouldRunRecord = true;

  if (isMobileDevice) {
    // ⚡ 모바일(갤럭시/안드로이드/아이폰) 최적화 정책:
    // 모바일 OS(특히 안드로이드 AudioFlinger HAL)는 마이크 하드웨어를 한 번에 하나의 프로세스/소스에만 배정합니다.
    // getUserMedia(MediaRecorder 녹음)와 Web Speech API(STT 음성 인식)를 동시에 구동하면,
    // 안드로이드 OS가 마이크를 MediaRecorder에만 배정하여 Web Speech API가 무음(Silence)을 전달받아
    // 녹음은 되지만 텍스트 입력(STT)이 전혀 동작하지 않는 치명적인 하드웨어 충돌이 발생합니다.
    // 따라서 다른 모드(문장 연습, OPIc 실전, 만능 패턴)와 동일하게 발화 연습에서도 실시간 STT를 단독 배정하여
    // 갤럭시/모바일 기기에서도 말하는 즉시 입력창에 텍스트가 실시간 전사되도록 보장합니다.
    shouldRunStt = true;
    shouldRunRecord = false;
  } else {
    // 데스크톱 환경에서는 브라우저의 마이크 멀티스트림 공유가 원활하므로
    // 실시간 STT 전사와 MediaRecorder 고음질 오디오 녹음을 동시에 안전하게 진행합니다.
    shouldRunStt = true;
    shouldRunRecord = true;
  }

  if (shouldRunStt) {
    createSpeechRecognitionInstance();
    if (!recognition) {
      if (mode === "speechPractice") {
        console.warn(
          "[Speech] Web Speech API 미지원 환경: MediaRecorder 및 온디바이스 Whisper AI로 대체 실행합니다.",
        );
        shouldRunStt = false;
      } else {
        const isWebView = /KAKAOTALK|NAVER|Instagram|FB_IAB|Line\//i.test(
          navigator.userAgent,
        );
        if (isWebView) {
          showMicError(
            "앱 내 브라우저에서는 음성 인식이 제한될 수 있습니다. 우측 상단 메뉴(⋮)를 눌러 'Chrome으로 열기' 또는 '삼성 인터넷으로 열기'를 선택해주세요.",
            targetError,
          );
        } else {
          showMicError(
            "이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 삼성 인터넷(Samsung Internet) 브라우저를 사용해주세요.",
            targetError,
          );
        }
        return;
      }
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
  currentRecordingMode = mode;
  if (shouldRunRecord) {
    clearRecordedVoice(mode);
  }

  activeTarget = {
    input: targetInput,
    btn: targetBtn,
    error: targetError,
    mode,
    isOpic,
  };

  baseTranscript = targetInput ? targetInput.value.trim() : "";
  currentSessionFinal = "";
  currentSessionInterim = "";
  if (
    mode === "speechPractice" &&
    typeof setSpeechPracticeStartText === "function"
  ) {
    setSpeechPracticeStartText(baseTranscript);
  }
  finalTranscript = "";
  listening = true;
  micStarted = false;
  userExplicitlyStoppedMic = false;

  if (shouldRunStt) {
    armStartupWatchdog();
  } else {
    micStarted = true;
  }

  if (targetBtn) setMicBtnListeningUI(targetBtn);

  if (isOpic && typeof startSpeakingTimer === "function") {
    startSpeakingTimer();
  } else if (
    mode === "pattern" &&
    typeof startPatternSpeakingTimer === "function"
  ) {
    startPatternSpeakingTimer();
  }

  // ⚡ 1. STT 실행 모드인 경우 recognition.start()를 즉시 동기 실행!
  if (shouldRunStt && recognition) {
    try {
      recognition.start();
    } catch (e) {
      console.warn("[SpeechRecognition] Initial start failed:", e);
      if (!e.message || !e.message.includes("already started")) {
        // 안드로이드/갤럭시 기기 등에서 첫 시작 시 start() 예외 발생 시 인스턴스 재생성 후 재시도
        try {
          createSpeechRecognitionInstance();
          if (recognition) recognition.start();
        } catch (retryErr) {
          if (mode === "speechPractice" && shouldRunRecord) {
            console.warn(
              "[SpeechRecognition] STT 시작 실패, 오디오 녹음 및 Whisper 폴백 모드로 계속 진행합니다:",
              retryErr,
            );
            shouldRunStt = false;
          } else {
            showMicError(
              "마이크를 시작하지 못했어요. 브라우저 주소창의 자물쇠(🔒) 아이콘에서 마이크 권한을 확인해주세요.",
              targetError,
            );
            stopSpeechRecognition();
            return;
          }
        }
      }
    }
  }

  // ⚡ 2. 실제 오디오 녹음(MediaRecorder) - 모바일(갤럭시/아이폰) 및 데스크톱 전 기기 지원
  recordedAudioChunks = [];
  if (
    shouldRunRecord &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  ) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (!listening) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        micStarted = true;
        if (micStartTimer) {
          clearTimeout(micStartTimer);
          micStartTimer = null;
        }
        currentMediaStream = stream;

        // 브라우저 및 OS(Windows, Mac, iOS, Android) 호환 안전 MIME 타입 자동 선택
        let mime = "";
        if (
          typeof MediaRecorder !== "undefined" &&
          typeof MediaRecorder.isTypeSupported === "function"
        ) {
          if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
            mime = "audio/webm;codecs=opus";
          } else if (MediaRecorder.isTypeSupported("audio/webm")) {
            mime = "audio/webm";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mime = "audio/mp4";
          } else if (MediaRecorder.isTypeSupported("audio/aac")) {
            mime = "audio/aac";
          }
        }
        const recorderOptions = mime ? { mimeType: mime } : undefined;

        try {
          currentMediaRecorder = new MediaRecorder(stream, recorderOptions);
        } catch (recErr) {
          console.warn("[MediaRecorder] Fallback default constructor:", recErr);
          try {
            currentMediaRecorder = new MediaRecorder(stream);
          } catch (recErr2) {
            console.error("[MediaRecorder] Construction failed:", recErr2);
            showMicError(
              "이 브라우저에서 오디오 녹음을 생성하지 못했습니다.",
              targetError,
            );
            stopSpeechRecognition();
            return;
          }
        }

        mediaRecorderDonePromise = new Promise((resolve) => {
          mediaRecorderDoneResolver = resolve;
        });

        currentMediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedAudioChunks.push(e.data);
          }
        };

        currentMediaRecorder.onstop = async () => {
          try {
            // 녹음 완료 후 안전하게 마이크 트랙 정지 (인코딩 조기 중단 방지)
            if (currentMediaStream) {
              try {
                currentMediaStream.getTracks().forEach((track) => track.stop());
              } catch (e) {}
              currentMediaStream = null;
            }

            if (recordedAudioChunks.length > 0) {
              const actualMime =
                currentMediaRecorder.mimeType || mime || "audio/webm";
              const rawBlob = new Blob(recordedAudioChunks, { type: actualMime });
              setRecordedVoiceBlob(mode, rawBlob);

              // ⚡ 발화 연습 모드 콜백을 즉시 호출하여 모바일/데스크톱에서도 지연 없이 '내 녹음 듣기' 버튼 활성화!
              if (
                mode === "speechPractice" &&
                typeof onSpeechPracticeRecordingDone === "function"
              ) {
                onSpeechPracticeRecordingDone(rawBlob);
              }

              // Azure 발음 채점용 16kHz 변환은 백그라운드에서 비동기 처리
              try {
                const wav = await blobTo16kHzWav(rawBlob);
                if (wav) {
                  setRecordedWavBuffer(mode, wav);
                }
              } catch (wavErr) {
                console.warn("[MediaRecorder] wav conversion skipped:", wavErr);
              }
            }
          } finally {
            if (mediaRecorderDoneResolver) {
              mediaRecorderDoneResolver();
              mediaRecorderDoneResolver = null;
            }
          }
        };

        // timeslice 인자 없이 호출하여 Safari 및 전 브라우저에서 단일 온전한 컨테이너(헤더+오디오 전체) 생성
        currentMediaRecorder.start();
      })
      .catch((mediaErr) => {
        console.warn("[MediaRecorder] Microphone stream error:", mediaErr);
        if (listening) {
          // ⚡ STT가 이미 성공적으로 구동 중이라면 녹음 실패로 인해 전체 음성 인식을 강제 종료하지 않음!
          if (shouldRunStt && micStarted) {
            console.warn(
              "[MediaRecorder] Recording stream failed but STT is active; continuing STT transcription.",
            );
            return;
          }
          let errorMsg =
            "마이크를 사용할 수 없습니다. 권한 설정을 확인해주세요.";
          if (
            mediaErr.name === "NotAllowedError" ||
            mediaErr.name === "PermissionDeniedError"
          ) {
            errorMsg =
              "마이크 사용 권한이 차단되었습니다. 브라우저 주소창의 🔒(자물쇠) 아이콘 또는 설정에서 마이크 액세스를 허용해주세요.";
          } else if (
            mediaErr.name === "NotFoundError" ||
            mediaErr.name === "DevicesNotFoundError"
          ) {
            errorMsg =
              "연결된 마이크 장치를 찾을 수 없습니다. 마이크 연결 상태를 확인해주세요.";
          } else if (
            mediaErr.name === "NotReadableError" ||
            mediaErr.name === "TrackStartError"
          ) {
            errorMsg =
              "마이크 장치에 접근할 수 없습니다. 다른 프로그램(Zoom, 통화 등)이 마이크를 독점 중인지 확인해주세요.";
          }
          showMicError(errorMsg, targetError);
          stopSpeechRecognition();
        }
      });
  } else if (
    shouldRunRecord &&
    (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
  ) {
    if (
      !window.isSecureContext &&
      location.hostname !== "localhost" &&
      location.hostname !== "127.0.0.1"
    ) {
      showMicError(
        "마이크 녹음은 보안 연결(HTTPS) 또는 localhost 환경에서만 사용할 수 있습니다.",
        targetError,
      );
      stopSpeechRecognition();
    }
  }
}

/**
 * Web Speech API 음성 인식기(SpeechRecognition) 인스턴스 생성 및 이벤트 바인딩
 * [갤럭시/안드로이드 최적화]
 * - 안드로이드/삼성 인터넷은 종료된 SpeechRecognition 인스턴스에 start()를 재호출하면
 *   DOMException(이미 시작되었거나 종료됨)이 발생하거나 하드웨어 스트림이 먹통이 되므로
 *   세션 시작 및 무봉제 재연결 시마다 반드시 신규 인스턴스를 생성해야 합니다.
 * @returns {SpeechRecognition|null}
 */
function createSpeechRecognitionInstance() {
  if (recognition) {
    try {
      recognition.onstart = null;
      recognition.onaudiostart = null;
      recognition.onsoundstart = null;
      recognition.onspeechstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    } catch (e) {}
    recognition = null;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const rec = new SpeechRecognition();
  rec.lang = "en-US";
  // Chrome/Edge 데스크톱에서는 continuous=true로 계속 수신, Safari 및 모바일 안드로이드는 안정적인 자동 재연결 모드
  rec.continuous = !isAndroid && !isSafari;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  const markStarted = () => {
    micStarted = true;
    if (micStartTimer) {
      clearTimeout(micStartTimer);
      micStartTimer = null;
    }
    clearMicError();
    if (activeTarget && activeTarget.btn) {
      setMicBtnListeningUI(activeTarget.btn);
    }
  };

  rec.onstart = markStarted;
  rec.onaudiostart = markStarted;
  rec.onsoundstart = markStarted;
  rec.onspeechstart = markStarted;

  rec.onresult = (e) => {
    markStarted();

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

    currentSessionFinal = accumulatedFinal;
    currentSessionInterim = interim.trim();

    // 마이크 시작 전 기존 텍스트 + 확정된 음성 텍스트 + 현재 발화 중인 임시 텍스트 결합
    let currentText = baseTranscript;
    if (accumulatedFinal) {
      currentText += (currentText ? " " : "") + accumulatedFinal;
    }
    if (interim) {
      currentText += (currentText ? " " : "") + interim.trim();
    }

    // ⚡ 한국인 발화 빈출 음소 왜곡 자동 보정
    currentText = correctSttPhoneticErrors(currentText);

    if (activeTarget && activeTarget.input) {
      activeTarget.input.value = currentText;
      autoResizeTextarea(activeTarget.input);
      activeTarget.input.dispatchEvent(new Event("input"));
    }
  };

  rec.onerror = (e) => {
    console.warn("[SpeechRecognition] error:", e.error);
    if (e.error === "aborted" || e.error === "no-speech") {
      // 침묵이나 일시적 중단은 무시하고 자동 재연결에 맡김
      return;
    }

    // ⚡ 발화연습(speechPractice) 모드이거나 오디오 녹음(MediaRecorder)이 진행 중인 경우:
    // Web Speech API에서 network, audio-capture, service-not-allowed 등 오류가 발생하더라도
    // 사용자 녹음(MediaRecorder)을 절대 강제 종료하지 않음!
    // 녹음 종료 시 브라우저 내장 Whisper AI가 자동으로 오디오 Blob을 텍스트로 전사함
    const isRecordingActive =
      Boolean(currentMediaStream) ||
      (currentMediaRecorder && currentMediaRecorder.state !== "inactive");

    if (isRecordingActive) {
      console.warn(
        `[SpeechRecognition] Non-fatal STT error (${e.error}) suppressed during speech recording; Whisper AI will handle transcription on stop.`,
      );
      if (activeTarget && activeTarget.btn) {
        setMicBtnListeningUI(activeTarget.btn);
      }
      return;
    }

    // 모바일/안드로이드 환경에서 일시적인 audio-capture 또는 network 끊김은 자동 재연결로 복구 시도
    if (
      listening &&
      !userExplicitlyStoppedMic &&
      (e.error === "audio-capture" || e.error === "network")
    ) {
      console.warn(
        `[SpeechRecognition] Transient mobile error (${e.error}), attempting seamless recovery.`,
      );
      return;
    }

    // 자동 재연결 중 발생한 not-allowed (백그라운드 제스처 만료 등): 이미 사용자가 말을 입력한 상태면 조용히 종료
    if (
      listening &&
      !userExplicitlyStoppedMic &&
      e.error === "not-allowed" &&
      baseTranscript
    ) {
      console.warn(
        "[SpeechRecognition] User gesture expired on restart, concluding session gracefully.",
      );
      stopListeningUI();
      return;
    }

    const msg =
      MIC_ERROR_MESSAGES[e.error] ||
      `마이크 오류가 발생했어요 (${e.error}). 다시 시도해주세요.`;
    showMicError(msg);
    stopSpeechRecognition();
  };

  rec.onend = () => {
    // ⚡ Safari, 삼성 인터넷, 모바일 Chrome 등에서 isFinal 이벤트 없이 세션이 종료되거나
    // 문장 중간 쉼 호흡으로 세션이 재시작될 때 확정(final) 텍스트뿐만 아니라 미확정(interim) 텍스트까지
    // 모두 baseTranscript에 안전하게 병합하여 문장 누락 및 0점 오류를 원천 차단
    const sessionSpoken = [currentSessionFinal, currentSessionInterim]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join(" ");
    currentSessionFinal = "";
    currentSessionInterim = "";

    if (sessionSpoken) {
      const correctedSession = correctSttPhoneticErrors(sessionSpoken);
      baseTranscript = baseTranscript
        ? `${baseTranscript} ${correctedSession}`.trim()
        : correctedSession.trim();
    }
    if (activeTarget && activeTarget.input) {
      activeTarget.input.value = baseTranscript;
      autoResizeTextarea(activeTarget.input);
      activeTarget.input.dispatchEvent(new Event("input"));
    }

    // 사용자가 명시적으로 중지하지 않았고, 여전히 듣기 활성 상태라면 브라우저의 침묵 타임아웃 방어를 위해 자동 재시작
    if (listening && !userExplicitlyStoppedMic && activeTarget) {
      // 안드로이드/갤럭시 기기는 AudioRecord 하드웨어 해제 시간(약 300~400ms)이 필요하며 인스턴스를 새로 생성해야 함
      const restartDelay = isAndroid ? 350 : 150;
      if (speechRestartTimer) clearTimeout(speechRestartTimer);
      speechRestartTimer = setTimeout(() => {
        if (!listening || userExplicitlyStoppedMic || !activeTarget) return;
        try {
          // 핵심: 안드로이드에서는 종료된 인스턴스를 재사용할 수 없으므로 항상 신규 인스턴스 생성!
          createSpeechRecognitionInstance();
          if (recognition) {
            recognition.start();
          }
        } catch (err) {
          console.warn(
            "[SpeechRecognition] Auto-restart silent retry failed:",
            err,
          );
          if (listening && !userExplicitlyStoppedMic && activeTarget) {
            setTimeout(
              () => {
                if (!listening || userExplicitlyStoppedMic || !activeTarget)
                  return;
                try {
                  createSpeechRecognitionInstance();
                  if (recognition) recognition.start();
                } catch (e2) {
                  console.warn(
                    "[SpeechRecognition] Secondary restart failed:",
                    e2,
                  );
                }
              },
              isAndroid ? 600 : 300,
            );
          }
        }
      }, restartDelay);
      return;
    }
    stopListeningUI();
  };

  recognition = rec;
  return rec;
}

/**
 * Web Speech API 음성 인식기(SpeechRecognition) 초기화 래퍼 (하위 호환성 유지)
 */
function initSpeechRecognition() {
  return createSpeechRecognitionInstance();
}

// =============================================================================
// 14. 개별 문장(1~6번) 따라 말하기 및 즉각 발음 채점 엔진
// =============================================================================

/** @type {Object|null} 현재 활성화된 개별 문장 음성인식 세션 */
let activeSingleSentenceRec = null;

/**
 * 만능 패턴 6문장 분할 뷰 등에서 개별 문장 단위로 음성을 인식하고 즉시 일치율을 채점
 * @param {string} targetText - 모범 목표 영문장
 * @param {HTMLElement} micBtn - 개별 마이크 버튼
 * @param {HTMLElement} evalBoxEl - 결과 출력 박스 엘리먼트
 */
function practiceSingleSentenceSpeech(targetText, micBtn, evalBoxEl) {
  stopTTS();

  // 이미 해당 버튼이 듣는 중이면 토글 정지
  if (activeSingleSentenceRec && activeSingleSentenceRec.btn === micBtn) {
    stopSingleSentenceSpeech();
    return;
  }

  // 다른 개별 문장 마이크가 켜져 있으면 중지
  if (activeSingleSentenceRec) {
    stopSingleSentenceSpeech();
  }

  // 전역 STT 실행 중이면 중지
  if (typeof listening !== "undefined" && listening) {
    stopSpeechRecognition();
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const isWebView = /KAKAOTALK|NAVER|Instagram|FB_IAB|Line\//i.test(
      navigator.userAgent,
    );
    if (isWebView) {
      alert(
        "앱 내 브라우저에서는 음성 인식이 제한될 수 있습니다. 우측 상단 메뉴(⋮)를 눌러 'Chrome으로 열기' 또는 '삼성 인터넷으로 열기'를 선택해주세요.",
      );
    } else {
      alert(
        "이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 삼성 인터넷(Samsung Internet) 브라우저를 사용해주세요.",
      );
    }
    return;
  }

  try {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    // 문장 중간에 쉼표(,)나 호흡이 있어도 문장 끝까지 모두 인식할 수 있도록 데스크톱에서는 continuous 활성화
    rec.continuous = !isAndroid && !isSafari;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    const targetWordCount = Math.max(
      1,
      normalizeForEval(targetText).split(" ").filter(Boolean).length,
    );

    const sessionState = {
      rec,
      btn: micBtn,
      box: evalBoxEl,
      targetText,
      spokenTranscript: "",
      isEvaluated: false,
      silenceTimer: null,
    };
    activeSingleSentenceRec = sessionState;

    micBtn.classList.add("listening");
    const origHtml = micBtn.innerHTML;
    micBtn.setAttribute("data-orig-html", origHtml);
    const origTitle = micBtn.getAttribute("title") || "";
    micBtn.setAttribute("data-orig-title", origTitle);
    micBtn.setAttribute("title", "말하기 중지 및 채점 (클릭 시 정지)");
    if (micBtn.classList.contains("sentence-mic-btn")) {
      micBtn.innerHTML = "⏹️";
    } else {
      micBtn.innerHTML = "⏹️ 정지";
    }

    if (evalBoxEl) {
      evalBoxEl.style.display = "block";
      evalBoxEl.innerHTML = `<div class="single-sen-eval-status">🎙️ 귀 기울여 듣고 있습니다. 문장 끝까지 말씀하신 후 잠시 기다리거나 ⏹️ 버튼을 눌러주세요...</div>`;
    }

    const finalizeAndScore = () => {
      if (sessionState.isEvaluated) return;
      if (sessionState.silenceTimer) {
        clearTimeout(sessionState.silenceTimer);
        sessionState.silenceTimer = null;
      }
      if (sessionState.spokenTranscript && sessionState.spokenTranscript.trim()) {
        sessionState.isEvaluated = true;
        renderSingleSentenceResult(
          targetText,
          sessionState.spokenTranscript,
          evalBoxEl,
        );
      }
      stopSingleSentenceSpeech();
    };
    sessionState.finalizeAndScore = finalizeAndScore;

    const markRecStarted = () => {
      if (evalBoxEl && !sessionState.spokenTranscript) {
        evalBoxEl.innerHTML = `<div class="single-sen-eval-status">🎙️ 귀 기울여 듣고 있습니다. 문장 끝까지 말씀하신 후 잠시 기다리거나 ⏹️ 버튼을 눌러주세요...</div>`;
      }
    };
    rec.onstart = markRecStarted;
    rec.onaudiostart = markRecStarted;
    rec.onsoundstart = markRecStarted;
    rec.onspeechstart = markRecStarted;

    rec.onresult = (e) => {
      let finalChunks = "";
      let interimChunks = "";
      let latestIsFinal = false;

      for (let i = 0; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalChunks += (finalChunks ? " " : "") + chunk.trim();
          latestIsFinal = true;
        } else {
          interimChunks += chunk;
        }
      }

      const combined = [finalChunks, interimChunks.trim()]
        .filter(Boolean)
        .join(" ")
        .trim();
      sessionState.spokenTranscript = correctSttPhoneticErrors(combined);

      if (evalBoxEl) {
        evalBoxEl.innerHTML = `<div class="single-sen-spoken">🗣️ "${escapeHtml(sessionState.spokenTranscript)}"</div>`;
      }

      if (sessionState.silenceTimer) {
        clearTimeout(sessionState.silenceTimer);
      }

      const spokenWordCount = normalizeForEval(sessionState.spokenTranscript)
        .split(" ")
        .filter(Boolean).length;

      // 목표 문장의 단어 수를 거의 다 말했고(85% 이상) 확정(isFinal)된 경우 0.7초 대기 후 자동 채점,
      // 아직 문장 중간을 말하는 중이면 2.2초 침묵 대기 후 채점하여 문장 앞부분만 잘려 채점되는 현상 방지
      const waitMs =
        latestIsFinal && spokenWordCount >= Math.ceil(targetWordCount * 0.85)
          ? 700
          : 2200;

      sessionState.silenceTimer = setTimeout(() => {
        finalizeAndScore();
      }, waitMs);
    };

    rec.onerror = (e) => {
      console.warn("[SingleSentenceMic] Error:", e.error);
      if (sessionState.silenceTimer) {
        clearTimeout(sessionState.silenceTimer);
        sessionState.silenceTimer = null;
      }
      if (sessionState.spokenTranscript && sessionState.spokenTranscript.trim()) {
        finalizeAndScore();
        return;
      }
      if (e.error === "no-speech") {
        if (evalBoxEl) {
          evalBoxEl.innerHTML = `<div class="single-sen-eval-status" style="color:var(--text-muted);">목소리가 감지되지 않았어요. 마이크를 누르고 다시 말씀해보세요.</div>`;
        }
      } else if (e.error !== "aborted") {
        if (evalBoxEl) {
          const errMsg =
            e.error === "not-allowed"
              ? "마이크 권한이 필요합니다. 브라우저 주소창의 🔒 아이콘에서 마이크를 허용해주세요."
              : e.error === "audio-capture"
                ? "마이크 장치를 사용할 수 없습니다. 다른 앱이 마이크를 사용 중인지 확인해주세요."
                : `마이크 오류 (${e.error}) - 다시 시도해주세요.`;
          evalBoxEl.innerHTML = `<div class="single-sen-eval-status" style="color:var(--danger);">${errMsg}</div>`;
        }
      }
      stopSingleSentenceSpeech();
    };

    rec.onend = () => {
      if (sessionState.silenceTimer) {
        clearTimeout(sessionState.silenceTimer);
        sessionState.silenceTimer = null;
      }
      if (
        !sessionState.isEvaluated &&
        sessionState.spokenTranscript &&
        sessionState.spokenTranscript.trim()
      ) {
        sessionState.isEvaluated = true;
        renderSingleSentenceResult(
          targetText,
          sessionState.spokenTranscript,
          evalBoxEl,
        );
      }
      stopSingleSentenceSpeech();
    };

    rec.start();
  } catch (err) {
    console.error("[SingleSentenceMic] Start failed:", err);
    stopSingleSentenceSpeech();
  }
}

/**
 * 진행 중인 개별 문장 따라 말하기 음성 인식 중단 (이미 말한 내용이 있으면 즉시 채점 수행)
 */
function stopSingleSentenceSpeech() {
  if (!activeSingleSentenceRec) return;
  const currentSession = activeSingleSentenceRec;
  activeSingleSentenceRec = null;

  if (currentSession.silenceTimer) {
    clearTimeout(currentSession.silenceTimer);
    currentSession.silenceTimer = null;
  }

  const { rec, btn, targetText, spokenTranscript, box } = currentSession;
  if (rec) {
    try {
      rec.onstart = null;
      rec.onaudiostart = null;
      rec.onsoundstart = null;
      rec.onspeechstart = null;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      rec.stop();
    } catch (e) {}
  }
  if (btn) {
    btn.classList.remove("listening");
    const origHtml = btn.getAttribute("data-orig-html") || "🎤";
    btn.innerHTML = origHtml;
    const origTitle = btn.getAttribute("data-orig-title");
    if (origTitle) {
      btn.setAttribute("title", origTitle);
      btn.removeAttribute("data-orig-title");
    }
    btn.removeAttribute("data-orig-html");
  }

  // 사용자가 ⏹️ 정지 버튼을 눌렀을 때 말한 문장이 있으면 누락 없이 즉시 채점 결과 표시
  if (
    !currentSession.isEvaluated &&
    spokenTranscript &&
    spokenTranscript.trim() &&
    box
  ) {
    currentSession.isEvaluated = true;
    renderSingleSentenceResult(targetText, spokenTranscript, box);
  }
}

/**
 * 개별 문장 발음 채점 결과 카드 렌더링
 * @param {string} targetText - 모범 목표 문장
 * @param {string} spokenText - 사용자 발화 문장
 * @param {HTMLElement} evalBoxEl - 결과 엘리먼트
 */
function renderSingleSentenceResult(targetText, spokenText, evalBoxEl) {
  if (!evalBoxEl) return;
  const correctedSpoken = correctSttPhoneticErrors(spokenText || "");
  const result = evaluateSpeech(correctedSpoken, targetText);
  const score = result.score || 0;
  let badgeColor = "#ef4444";
  let badgeIcon = "💡";
  let badgeLabel = "다시 시도";

  if (score >= 85) {
    badgeColor = "#10b981";
    badgeIcon = "🎉";
    badgeLabel = "완벽한 발음";
  } else if (score >= 70) {
    badgeColor = "#3b82f6";
    badgeIcon = "👍";
    badgeLabel = "좋은 발음";
  } else if (score >= 50) {
    badgeColor = "#f59e0b";
    badgeIcon = "⚡";
    badgeLabel = "조금 더 또렷하게";
  }

  evalBoxEl.innerHTML = `
    <div class="single-sen-eval-card">
      <div class="single-sen-eval-header">
        <span class="single-sen-badge" style="background:${badgeColor}20; color:${badgeColor}; border:1px solid ${badgeColor}60;">
          ${badgeIcon} ${badgeLabel} (${score}점)
        </span>
      </div>
      <div class="single-sen-spoken">🗣️ "<strong>${escapeHtml(correctedSpoken)}</strong>"</div>
      <div class="single-sen-diff">${result.diffHtml}</div>
    </div>
  `;
}

// 전역 바인딩 (HTML onclick 호출 호환)
window.practiceSingleSentenceSpeech = practiceSingleSentenceSpeech;
window.stopSingleSentenceSpeech = stopSingleSentenceSpeech;
