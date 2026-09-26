/**
 * @file speech-practice.js
 * @description [모드 6] 자유 발화 연습(Speech Practice) 모드 전담 컨트롤러
 * - 마이크 음성 인식(STT) 및 Whisper AI 로컬 모델을 통한 실시간 텍스트 자동 변환
 * - MediaRecorder 기반 사용자 실제 발화 음성 녹음 및 Blob URL 즉시 청취
 * - OPIc 실전 기준 발화량(단어수/문장수), 담화 표지어, 어휘 다양성 다면 평가
 * - LanguageTool API 연동 실시간 영문법 교정 및 원어민식 표현 제안
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 */

// =============================================================================
// 1. 발화 연습 모드 전역 상태 변수 (State Management)
// =============================================================================

let speechPracticeAudioUrl = null; // 녹음본 Blob 재생용 URL
let speechPracticeRecordedBlob = null; // 녹음된 Audio Blob 인스턴스
let speechPracticeEvaluated = false; // 채점 완료 여부 플래그
let speechPracticeStartText = ""; // 녹음 시작 전 기존 텍스트 (실시간 STT 수행 여부 판별)

/**
 * 마이크 녹음 시작 전 기준 텍스트를 저장합니다.
 * @param {string} text
 */
function setSpeechPracticeStartText(text) {
  speechPracticeStartText = typeof text === "string" ? text.trim() : "";
}
window.setSpeechPracticeStartText = setSpeechPracticeStartText;

// =============================================================================
// 2. 화면 전환 및 글자/단어 카운터 (Screen Lifecycle & Live Counters)
// =============================================================================

/**
 * 자유 발화 연습 화면으로 전환하고 텍스트에어리어 높이를 자동 조절합니다.
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 기록 여부
 * @returns {void}
 */
function showSpeechPracticeScreen(pushHistory = true) {
  if (typeof hideAllScreens === "function") {
    hideAllScreens();
  }

  const card = document.getElementById("speechPracticeCard");
  if (card) {
    card.style.display = "block";
    card.classList.add("show");
  }

  const input = document.getElementById("speechPracticeInput");
  if (input && typeof autoResizeTextarea === "function") {
    autoResizeTextarea(input);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * 텍스트에어리어의 입력 텍스트를 분석하여 단어 수와 글자 수를 실시간 배지에 동기화합니다.
 * @returns {void}
 */
function updateSpeechPracticeCount() {
  const input = document.getElementById("speechPracticeInput");
  const badge = document.getElementById("speechPracticeWordCount");
  if (!input || !badge) return;

  const text = input.value.trim();
  const charCount = input.value.length;
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  badge.textContent = `${wordCount}단어 · ${charCount}자`;
}

// =============================================================================
// 3. 녹음 완료 콜백 및 Whisper AI 변환 (Recording Done & Whisper STT)
// =============================================================================

/**
 * 마이크 녹음이 종료되었을 때 MediaRecorder onstop 이벤트에서 호출되는 콜백 함수입니다.
 * 1. 녹음본 Blob URL 생성 및 오디오 플레이어 연결
 * 2. '내 녹음 듣기' 버튼 즉시 활성화 (지연 시간 0초)
 * 3. 브라우저 내장 Whisper AI 모델을 통한 고정밀 로컬 음성 인식 실행
 *
 * @param {Blob} blob - 녹음된 오디오 Blob 객체
 * @returns {Promise<void>}
 */
async function onSpeechPracticeRecordingDone(blob) {
  speechPracticeRecordedBlob = blob;
  const player = document.getElementById("speechPracticeAudioPlayer");
  const playBtn = document.getElementById("speechPracticePlayRecordBtn");
  const playText = document.getElementById("speechPracticePlayRecordText");
  const playIcon = document.getElementById("speechPracticePlayRecordIcon");
  const statusDot = document.getElementById("speechPracticeStatusDot");
  const statusText = document.getElementById("speechPracticeAudioStatusText");
  const bottomRecordBtn = document.getElementById(
    "speechPracticeReplayRecordBtnBottom",
  );
  const input = document.getElementById("speechPracticeInput");

  if (!player || !blob) return;

  if (speechPracticeAudioUrl) {
    try {
      URL.revokeObjectURL(speechPracticeAudioUrl);
    } catch (e) {}
  }

  speechPracticeAudioUrl = URL.createObjectURL(blob);
  player.src = speechPracticeAudioUrl;

  // 1. '내 발음 다시 듣기' 버튼 즉시 활성화 (지연 0초)
  if (playBtn) {
    playBtn.disabled = false;
    playBtn.classList.add("has-recording");
    playBtn.classList.remove("playing");
    playBtn.title = "녹음된 내 실제 목소리 재생하기";
  }
  if (playText) playText.textContent = "내 발음 다시 듣기";
  if (playIcon) playIcon.textContent = "▶";
  if (bottomRecordBtn) bottomRecordBtn.style.display = "inline-flex";

  // 2. 실시간 STT 성공 여부 검사: 이미 실시간 STT로 텍스트화가 완료된 경우
  const currentText = input ? input.value.trim() : "";
  const hasSttTranscribed = currentText.length > speechPracticeStartText.length;

  if (hasSttTranscribed) {
    if (statusDot) statusDot.className = "sp-status-dot ready";
    if (statusText) {
      statusText.textContent =
        "✅ 녹음 완료! '내 발음 다시 듣기'로 발화를 확인하거나 채점해보세요.";
    }
    updateSpeechPracticeCount();
    return;
  }

  // 3. 모바일(안드로이드/갤럭시 마이크 독점 등)로 인해 실시간 STT가 누락된 경우 AI 자동 전사 실행
  if (statusDot) statusDot.className = "sp-status-dot recording";
  if (statusText) statusText.textContent = "⚡ AI 음성 텍스트 변환 중...";

  let transcribed = "";

  // 3-1. Azure Speech API 등록 환경: 0.5초 초고속 Azure STT 전사 우선 시도
  if (
    typeof transcribeWithAzure === "function" &&
    typeof blobTo16kHzWav === "function"
  ) {
    try {
      const wav = await blobTo16kHzWav(blob);
      if (wav) {
        transcribed = await transcribeWithAzure(wav);
      }
    } catch (azureSttErr) {
      console.warn("[SpeechPractice] Azure STT fallback failed:", azureSttErr);
    }
  }

  // 3-2. Azure 미설정 또는 오류 시 온디바이스 Whisper AI 폴백 전사
  if (!transcribed) {
    const transcriber =
      typeof transcribeAudioBlob === "function"
        ? transcribeAudioBlob
        : typeof window !== "undefined" &&
            typeof window.transcribeAudioBlob === "function"
          ? window.transcribeAudioBlob
          : null;

    if (transcriber && blob && blob.size > 50) {
      try {
        transcribed = await transcriber(blob, (stepMsg) => {
          if (statusText) statusText.textContent = stepMsg;
        });
      } catch (asrErr) {
        console.warn("[SpeechPractice] Whisper fallback failed:", asrErr);
      }
    }
  }

  if (transcribed && input) {
    const existing = speechPracticeStartText || input.value.trim();
    input.value = existing ? `${existing} ${transcribed}` : transcribed;

    if (typeof resetBaseTranscript === "function") {
      resetBaseTranscript(input.value.trim());
    }
    if (typeof autoResizeTextarea === "function") {
      autoResizeTextarea(input);
    }
    updateSpeechPracticeCount();

    if (statusDot) statusDot.className = "sp-status-dot ready";
    if (statusText) {
      statusText.textContent =
        "✅ 녹음 및 AI 텍스트 변환 완료! '내 발음 다시 듣기'로 확인하거나 채점해보세요.";
    }
  } else {
    if (statusDot) statusDot.className = "sp-status-dot ready";
    if (statusText) {
      statusText.textContent =
        "녹음 완료 · '내 발음 다시 듣기'로 발화를 확인해보세요";
    }
  }
}

// 마이크 상태 UI 동기화
function updateSpeechPracticeMicUI(isListening) {
  const btn = document.getElementById("speechPracticeMicBtn");
  const statusDot = document.getElementById("speechPracticeStatusDot");
  const statusText = document.getElementById("speechPracticeAudioStatusText");

  if (!btn) return;

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  if (isListening) {
    btn.classList.add("listening");
    if (statusDot) statusDot.className = "sp-status-dot recording";
    if (statusText) {
      statusText.textContent = isMobile
        ? "🎙️ 음성 인식 중... (말을 마치면 마이크를 다시 누르세요)"
        : "🎙️ 음성 인식 및 녹음 중... (말을 마치면 마이크를 다시 누르세요)";
    }
  } else {
    btn.classList.remove("listening");
    const input = document.getElementById("speechPracticeInput");
    const currentText = input ? input.value.trim() : "";
    const hasSttTranscribed =
      currentText.length > speechPracticeStartText.length;

    if (hasSttTranscribed || currentText.length > 0) {
      if (statusDot) statusDot.className = "sp-status-dot ready";
      if (statusText) {
        statusText.textContent = speechPracticeRecordedBlob
          ? "✅ 녹음 완료! '내 발음 다시 듣기'로 발화를 확인하거나 채점해보세요."
          : "✅ 음성 입력 완료! 입력된 내용을 확인하거나 채점해보세요.";
      }
      updateSpeechPracticeCount();
    } else if (!speechPracticeRecordedBlob) {
      if (statusDot) statusDot.className = "sp-status-dot";
      if (statusText) {
        statusText.textContent =
          "마이크(🎤)를 누르고 말하면 실시간 텍스트 변환과 녹음이 진행됩니다";
      }
    }
  }
}

// 내 녹음본 오디오 재생 / 일시정지 토글
function togglePlayRecordedAudio(triggerBtn = null) {
  const player = document.getElementById("speechPracticeAudioPlayer");
  const playBtn = document.getElementById("speechPracticePlayRecordBtn");
  const playText = document.getElementById("speechPracticePlayRecordText");
  const playIcon = document.getElementById("speechPracticePlayRecordIcon");
  const bottomBtn = document.getElementById(
    "speechPracticeReplayRecordBtnBottom",
  );

  if (!player || !player.src) {
    alert(
      "녹음된 음성이 없습니다. 먼저 마이크 버튼(🎤)을 눌러 영어로 말해보세요.",
    );
    return;
  }

  if (typeof stopTTS === "function") {
    stopTTS();
  }

  if (player.paused) {
    const playPromise = player.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (playBtn) playBtn.classList.add("playing");
          if (playText) playText.textContent = "재생 중지";
          if (playIcon) playIcon.textContent = "⏹";
          if (bottomBtn) bottomBtn.innerHTML = "⏹ 재생 중지";
        })
        .catch((err) => {
          console.warn("[SpeechPractice] Audio play failed:", err);
          if (playBtn) playBtn.classList.remove("playing");
          if (playText) playText.textContent = "내 발음 다시 듣기";
          if (playIcon) playIcon.textContent = "▶";
          if (bottomBtn) bottomBtn.innerHTML = "🎧 내 발음 다시 듣기";
        });
    } else {
      if (playBtn) playBtn.classList.add("playing");
      if (playText) playText.textContent = "재생 중지";
      if (playIcon) playIcon.textContent = "⏹";
      if (bottomBtn) bottomBtn.innerHTML = "⏹ 재생 중지";
    }
  } else {
    player.pause();
    player.currentTime = 0;
    if (playBtn) playBtn.classList.remove("playing");
    if (playText) playText.textContent = "내 발음 다시 듣기";
    if (playIcon) playIcon.textContent = "▶";
    if (bottomBtn) bottomBtn.innerHTML = "🎧 내 발음 다시 듣기";
  }
}

// =============================================================================
// 4. 발화 다면 채점 및 문법 교정 피드백 (Speaking Assessment & Grammar)
// =============================================================================

/**
 * 사용자의 자유 발화 텍스트에 대해 OPIc 다면 평가를 실행하고 결과를 렌더링합니다.
 *
 * [평가 항목]:
 * 1. OPIc 예상 등급 (IL ~ AL) 및 점수 배지
 * 2. 발화 통계 (총 단어 수, 고유 어휘 수, 문장 수, 발화량 수준)
 * 3. 담화 표지어 분석 (연결어, 필러, 과거 시제 동사)
 * 4. LanguageTool API 연동 실시간 영문법 오류 검출 및 교정 안내
 *
 * @returns {Promise<void>}
 */
async function evaluateSpeechPracticeAnswer() {
  const input = document.getElementById("speechPracticeInput");
  const evalBox = document.getElementById("speechPracticeEvalBox");
  const badgesWrap = document.getElementById("speechPracticeBadgesWrap");
  const statsGrid = document.getElementById("speechPracticeStatsGrid");
  const tagsWrap = document.getElementById("speechPracticeTagsWrap");
  const grammarWrap = document.getElementById("speechPracticeGrammarWrap");
  const grammarList = document.getElementById("speechPracticeGrammarList");
  const feedbackText = document.getElementById("speechPracticeFeedbackText");

  if (!input || !evalBox) return;

  const userText = input.value.trim();
  if (!userText) {
    alert("채점할 문장이 없습니다. 마이크로 말하거나 텍스트를 입력해주세요.");
    input.focus();
    return;
  }

  // 발화 평가 진행 (speech.js 내 evaluateOpicSpeaking 활용)
  const result =
    typeof evaluateOpicSpeaking === "function"
      ? evaluateOpicSpeaking(userText, null)
      : null;

  speechPracticeEvaluated = true;
  evalBox.style.display = "block";
  evalBox.classList.add("show");

  // 1. 발화량 및 속도 통계 그리드
  const words = userText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const uniqueWords = new Set(
    words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, "")),
  ).size;
  const sentenceCount =
    (userText.match(/[.!?]+/g) || []).length || (wordCount > 0 ? 1 : 0);

  if (statsGrid) {
    statsGrid.innerHTML = `
      <div class="sp-stat-item">
        <div class="sp-stat-val">${wordCount}</div>
        <div class="sp-stat-lbl">총 발화 단어</div>
      </div>
      <div class="sp-stat-item">
        <div class="sp-stat-val">${uniqueWords}</div>
        <div class="sp-stat-lbl">고유 어휘 수</div>
      </div>
      <div class="sp-stat-item">
        <div class="sp-stat-val">약 ${sentenceCount}개</div>
        <div class="sp-stat-lbl">발화 문장 수</div>
      </div>
      <div class="sp-stat-item">
        <div class="sp-stat-val">${wordCount >= 90 ? "AL급" : wordCount >= 60 ? "IH급" : wordCount >= 30 ? "IM급" : "IL급"}</div>
        <div class="sp-stat-lbl">발화량 수준</div>
      </div>
    `;
  }

  // 2. Azure AI 발음 / 음향 지표 / OPIc 정밀 채점 실행 (speech.js 내 renderPronunciationAssessment)
  const evalDiff = document.getElementById("speechPracticeEvalDiff");
  const playBtn = document.getElementById("speechPracticePlayRecordBtn");

  if (typeof renderPronunciationAssessment === "function") {
    await renderPronunciationAssessment({
      boxEl: evalBox,
      badgeEl: badgesWrap,
      diffEl: evalDiff,
      feedbackEl: feedbackText,
      mode: "speechPractice",
      referenceText: userText,
      userText: userText,
      voiceBtn: playBtn,
      questionItem: null,
    });
  } else {
    // 로컬 폴백 채점
    const result =
      typeof evaluateOpicSpeaking === "function"
        ? evaluateOpicSpeaking(userText, null)
        : null;

    if (badgesWrap) {
      if (result && result.opicGrade) {
        const score = result.compResult ? result.compResult.finalScore : 70;
        badgesWrap.innerHTML = `
          <span class="opic-grade-badge ${result.opicGrade.gradeClass}">${result.opicGrade.label}</span>
          <span class="eval-score-badge ${score >= 80 ? "high" : score >= 50 ? "mid" : "low"}">${score}점</span>
        `;
      } else {
        badgesWrap.innerHTML = `
          <span class="opic-grade-badge grade-im">🥈 IM1 (Intermediate Mid 1)</span>
          <span class="eval-score-badge mid">75점</span>
        `;
      }
    }
  }

  // 3. 담화 표지어 태그 (연결어, 필러, 과거시제 등)
  if (tagsWrap) {
    const tags = [];
    if (result && result.compResult) {
      const cr = result.compResult;
      if (cr.foundConnectors && cr.foundConnectors.length > 0) {
        tags.push(
          `🔗 연결어(${cr.foundConnectors.length}개): ${cr.foundConnectors.slice(0, 5).join(", ")}`,
        );
      }
      if (cr.foundFillers && cr.foundFillers.length > 0) {
        tags.push(
          `💬 필러(${cr.foundFillers.length}개): ${cr.foundFillers.slice(0, 4).join(", ")}`,
        );
      }
      if (cr.foundPastVerbs && cr.foundPastVerbs.length > 0) {
        tags.push(
          `⏳ 과거시제(${cr.foundPastVerbs.length}개): ${cr.foundPastVerbs.slice(0, 4).join(", ")}`,
        );
      }
    }

    if (tags.length === 0) {
      tags.push(
        "💡 필러(Well, You know 등)나 연결어(Because, Also)를 섞어주면 더 자연스러워집니다.",
      );
    }

    tagsWrap.innerHTML = tags
      .map(
        (tag) =>
          `<span class="sp-tag-pill">${typeof escapeHtml === "function" ? escapeHtml(tag) : tag}</span>`,
      )
      .join("");
  }

  // 4. 종합 피드백 코멘트
  if (feedbackText) {
    let fb = "";
    if (wordCount < 20) {
      fb =
        "발화량이 다소 짧습니다. 이유(Why)나 예시(For example)를 1~2문장 덧붙여 최소 30단어 이상 말하는 연습을 추천합니다.";
    } else if (wordCount < 50) {
      fb =
        "기본적인 의사 표현이 잘 전달되었습니다! OPIc IM2~IH 수준을 목표로 문장 간 연결어와 필러를 활용해 호흡을 늘려보세요.";
    } else if (wordCount < 90) {
      fb =
        "충분한 발화량과 안정적인 문장 구성이 돋보입니다! 시제 일치와 다채로운 어휘(동의어, 형용사)를 사용하면 IH 이상 고득점이 가능합니다.";
    } else {
      fb =
        "훌륭한 발화량과 유창성입니다! AL 목표 기준 발화량(90단어 이상)을 만족하고 있습니다. 디테일한 표현과 발음 억양에 집중해보세요.";
    }
    feedbackText.textContent = fb;
  }

  // 5. 문법 검사 (LanguageTool API 연동)
  if (grammarWrap && grammarList && typeof checkGrammar === "function") {
    grammarList.innerHTML = `<div style="font-size: 13px; color: var(--text-muted);">문법 분석 중...</div>`;
    grammarWrap.style.display = "block";

    try {
      const matches = await checkGrammar(userText);
      if (matches && matches.length > 0) {
        grammarList.innerHTML = matches
          .slice(0, 5)
          .map((m) => {
            const errWord = userText.substring(m.offset, m.offset + m.length);
            const replacements = (m.replacements || [])
              .slice(0, 3)
              .map((r) => r.value)
              .join(", ");
            return `
              <div class="sp-grammar-item">
                <span style="color: #dc2626; font-weight: 700; text-decoration: line-through;">${escapeHtml(errWord)}</span>
                ${replacements ? ` ➔ 추천: <span class="sp-grammar-corr">${escapeHtml(replacements)}</span>` : ""}
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${escapeHtml(m.message)}</div>
              </div>
            `;
          })
          .join("");
      } else {
        grammarList.innerHTML = `<div style="font-size: 13px; color: #059669; font-weight: 600;">✨ 감지된 문법 오류가 없습니다. 훌륭한 문장입니다!</div>`;
      }
    } catch (e) {
      grammarList.innerHTML = `<div style="font-size: 13px; color: var(--text-muted);">문법 검사를 완료하지 못했습니다. (오프라인 상태 또는 일시적 네트워크 지연)</div>`;
    }
  }

  // 결과 박스로 부드럽게 스크롤 이동
  evalBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// 발화 연습 모드 초기화
function initSpeechPractice() {
  const input = document.getElementById("speechPracticeInput");
  const micBtn = document.getElementById("speechPracticeMicBtn");
  const micError = document.getElementById("speechPracticeMicError");
  const copyBtn = document.getElementById("speechPracticeCopyBtn");
  const clearBtn = document.getElementById("speechPracticeClearBtn");
  const resetBtn = document.getElementById("speechPracticeResetBtn");
  const evalBtn = document.getElementById("speechPracticeEvalBtn");
  const playBtn = document.getElementById("speechPracticePlayRecordBtn");
  const replayBtnBottom = document.getElementById(
    "speechPracticeReplayRecordBtnBottom",
  );
  const ttsBtn = document.getElementById("speechPracticeTtsBtn");
  const ttsBtnBottom = document.getElementById("speechPracticeTtsBtnBottom");
  const toOpicLink = document.getElementById("toOpicFromSpeechPractice");
  const player = document.getElementById("speechPracticeAudioPlayer");

  if (!input) return;

  // 1. 입력 변경 시 글자/단어 수 카운트 & 높이 조절 & 수동 수정 시 baseTranscript 동기화
  input.addEventListener("input", (e) => {
    if (e.isTrusted && typeof resetBaseTranscript === "function") {
      resetBaseTranscript(input.value.trim());
    }
    if (typeof autoResizeTextarea === "function") {
      autoResizeTextarea(input);
    }
    updateSpeechPracticeCount();
  });

  // 2. 마이크 토글 버튼 (원클릭 실시간 음성 인식 & 오디오 동시 녹음)
  if (micBtn) {
    micBtn.addEventListener("click", () => {
      if (typeof toggleSpeechRecognition === "function") {
        if (!micBtn.classList.contains("listening")) {
          // 녹음 시작 전 기준 텍스트 길이 기억 (실시간 STT 성공 여부 판별)
          speechPracticeStartText = input.value.trim();
        }
        toggleSpeechRecognition(input, micBtn, micError, "speechPractice");
        setTimeout(() => {
          updateSpeechPracticeMicUI(micBtn.classList.contains("listening"));
        }, 100);
      }
    });
  }

  // 3. 복사 버튼
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) return;
      if (typeof copyText === "function") {
        copyText(text, copyBtn);
      }
    });
  }

  // 4. 지우기 버튼
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (typeof listening !== "undefined" && listening) {
        if (typeof stopSpeechRecognition === "function") {
          stopSpeechRecognition();
        }
      }
      input.value = "";
      speechPracticeStartText = "";
      if (typeof resetBaseTranscript === "function") {
        resetBaseTranscript("");
      }
      updateSpeechPracticeCount();
      if (typeof autoResizeTextarea === "function") {
        autoResizeTextarea(input);
      }
      // 오디오 상태 및 버튼 초기화
      const playBtn = document.getElementById("speechPracticePlayRecordBtn");
      const playText = document.getElementById("speechPracticePlayRecordText");
      const playIcon = document.getElementById("speechPracticePlayRecordIcon");
      const statusDot = document.getElementById("speechPracticeStatusDot");
      const statusText = document.getElementById(
        "speechPracticeAudioStatusText",
      );

      if (playBtn) {
        playBtn.disabled = true;
        playBtn.classList.remove("has-recording", "playing");
        playBtn.title = "마이크로 발화 후 녹음본 청취 가능";
      }
      if (playText) playText.textContent = "내 발음 다시 듣기";
      if (playIcon) playIcon.textContent = "▶";
      if (statusDot) statusDot.className = "sp-status-dot";
      if (statusText) {
        statusText.textContent =
          "마이크(🎤)를 누르고 말하면 실시간 텍스트 변환과 녹음이 진행됩니다";
      }

      if (replayBtnBottom) replayBtnBottom.style.display = "none";

      if (player) {
        player.pause();
        player.src = "";
      }
      if (typeof clearRecordedVoice === "function") {
        clearRecordedVoice("speechPractice");
      }
      speechPracticeRecordedBlob = null;
    });
  }

  // 5. 새로 쓰기 버튼
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (typeof listening !== "undefined" && listening) {
        if (typeof stopSpeechRecognition === "function") {
          stopSpeechRecognition();
        }
      }
      input.value = "";
      speechPracticeStartText = "";
      if (typeof resetBaseTranscript === "function") {
        resetBaseTranscript("");
      }
      updateSpeechPracticeCount();
      if (typeof autoResizeTextarea === "function") {
        autoResizeTextarea(input);
      }
      const evalBox = document.getElementById("speechPracticeEvalBox");
      if (evalBox) {
        evalBox.style.display = "none";
        evalBox.classList.remove("show");
      }

      // 오디오 상태 및 버튼 초기화
      const playBtn = document.getElementById("speechPracticePlayRecordBtn");
      const playText = document.getElementById("speechPracticePlayRecordText");
      const playIcon = document.getElementById("speechPracticePlayRecordIcon");
      const statusDot = document.getElementById("speechPracticeStatusDot");
      const statusText = document.getElementById(
        "speechPracticeAudioStatusText",
      );

      if (playBtn) {
        playBtn.disabled = true;
        playBtn.classList.remove("has-recording", "playing");
        playBtn.title = "마이크로 발화 후 녹음본 청취 가능";
      }
      if (playText) playText.textContent = "내 발음 다시 듣기";
      if (playIcon) playIcon.textContent = "▶";
      if (statusDot) statusDot.className = "sp-status-dot";
      if (statusText) {
        statusText.textContent =
          "마이크(🎤)를 누르고 말하면 실시간 텍스트 변환과 녹음이 진행됩니다";
      }

      if (replayBtnBottom) replayBtnBottom.style.display = "none";

      if (player) {
        player.pause();
        player.src = "";
      }
      if (typeof clearRecordedVoice === "function") {
        clearRecordedVoice("speechPractice");
      }
      speechPracticeRecordedBlob = null;
    });
  }

  // 6. 녹음본 오디오 플레이어 끝났을 때 버튼 라벨 복구
  if (player) {
    player.onended = () => {
      const playBtn = document.getElementById("speechPracticePlayRecordBtn");
      const playText = document.getElementById("speechPracticePlayRecordText");
      const playIcon = document.getElementById("speechPracticePlayRecordIcon");
      if (playBtn) playBtn.classList.remove("playing");
      if (playText) playText.textContent = "내 발음 다시 듣기";
      if (playIcon) playIcon.textContent = "▶";
      if (replayBtnBottom) replayBtnBottom.innerHTML = "🎧 내 녹음 다시 듣기";
    };
  }

  // 7. 내 녹음 듣기 버튼들
  if (playBtn) {
    playBtn.addEventListener("click", () => togglePlayRecordedAudio(playBtn));
  }
  if (replayBtnBottom) {
    replayBtnBottom.addEventListener("click", () =>
      togglePlayRecordedAudio(replayBtnBottom),
    );
  }

  // 8. 채점 버튼
  if (evalBtn) {
    evalBtn.addEventListener("click", () => {
      evaluateSpeechPracticeAnswer();
    });
  }

  // 9. 원어민 TTS 비교 청취 버튼들
  const handleTts = (btn) => {
    const text = input.value.trim();
    if (!text) {
      alert("원어민 발음을 들을 문장을 먼저 입력해주세요.");
      return;
    }
    if (typeof speakText === "function") {
      speakText(text, "en-US", btn);
    }
  };
  if (ttsBtn) ttsBtn.addEventListener("click", () => handleTts(ttsBtn));
  if (ttsBtnBottom)
    ttsBtnBottom.addEventListener("click", () => handleTts(ttsBtnBottom));

  // 10. 실전 모드로 이동 링크
  if (toOpicLink) {
    toOpicLink.addEventListener("click", () => {
      if (typeof navigateTo === "function") {
        navigateTo("opicTopic");
      }
    });
  }

  // 단어 수 초기화
  updateSpeechPracticeCount();
}

// 전역 등록
window.initSpeechPractice = initSpeechPractice;
window.showSpeechPracticeScreen = showSpeechPracticeScreen;
window.onSpeechPracticeRecordingDone = onSpeechPracticeRecordingDone;
window.evaluateSpeechPracticeAnswer = evaluateSpeechPracticeAnswer;
window.togglePlayRecordedAudio = togglePlayRecordedAudio;
