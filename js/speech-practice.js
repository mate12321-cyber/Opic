/**
 * [speech-practice.js] 발화 연습 모드 컨트롤러
 * - 자유 발화 입력창 (마이크 음성 인식 STT + 실시간 텍스트 변환)
 * - 내 녹음본 듣기 (마이크 녹음 오디오 Blob 즉시 청취 및 원어민 TTS 비교)
 * - 채점 기능 (예상 OPIc 등급, 단어/문장 통계, 담화 표지어, LanguageTool 문법 교정 피드백)
 */

let speechPracticeAudioUrl = null;
let speechPracticeRecordedBlob = null;
let speechPracticeEvaluated = false;

// 발화 연습 화면 진입
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

// 실시간 단어 및 글자 수 업데이트
function updateSpeechPracticeCount() {
  const input = document.getElementById("speechPracticeInput");
  const badge = document.getElementById("speechPracticeWordCount");
  if (!input || !badge) return;

  const text = input.value.trim();
  const charCount = input.value.length;
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  badge.textContent = `${wordCount}단어 · ${charCount}자`;
}

// 마이크 녹음 완료 시 호출되는 콜백 (speech.js의 MediaRecorder onstop에서 호출됨)
function onSpeechPracticeRecordingDone(blob) {
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

  if (!player || !blob) return;

  if (speechPracticeAudioUrl) {
    URL.revokeObjectURL(speechPracticeAudioUrl);
  }

  speechPracticeAudioUrl = URL.createObjectURL(blob);
  player.src = speechPracticeAudioUrl;

  // 내 녹음 듣기 버튼 활성화 및 하이라이트
  if (playBtn) {
    playBtn.disabled = false;
    playBtn.classList.add("has-recording");
    playBtn.classList.remove("playing");
    playBtn.title = "녹음된 내 실제 목소리 재생하기";
  }
  if (playText) playText.textContent = "내 녹음 듣기";
  if (playIcon) playIcon.textContent = "▶";

  // 상태 인디케이터 업데이트
  if (statusDot) statusDot.className = "sp-status-dot ready";
  if (statusText)
    statusText.textContent = "녹음 완료 · 언제든 내 발화를 다시 들어보세요";

  if (bottomRecordBtn) bottomRecordBtn.style.display = "inline-flex";
}

// 모바일(갤럭시/아이폰) 환경 감지 및 기본 모드 결정 (모바일: stt, 데스크톱: both)
const isMobileDevice =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
let currentSpeechPracticeSubMode = isMobileDevice ? "stt" : "both";

// 발화 모드(STT / 녹음 / 통합) 변경 함수
function setSpeechPracticeSubMode(subMode) {
  currentSpeechPracticeSubMode = subMode;

  document.querySelectorAll(".sp-mode-pill").forEach((pill) => {
    if (pill.dataset.mode === subMode) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });

  const micBtn = document.getElementById("speechPracticeMicBtn");
  const input = document.getElementById("speechPracticeInput");
  const tip = document.getElementById("spModeTip");
  const statusText = document.getElementById("speechPracticeAudioStatusText");

  if (subMode === "stt") {
    if (micBtn) micBtn.title = "마이크 켜기 (✍️ 텍스트 자동 입력)";
    if (input)
      input.placeholder =
        "마이크(🎤)를 누르고 영어로 말하면 텍스트가 실시간으로 자동 입력됩니다.";
    if (tip)
      tip.innerHTML =
        "💡 <strong>[텍스트 자동 입력]</strong>: 영어로 말하면 실시간으로 입력창에 자동 타이핑됩니다.";
    if (statusText && !speechPracticeRecordedBlob)
      statusText.textContent = "마이크(🎤)를 누르면 말하는 영어가 자동 입력됩니다";
  } else if (subMode === "record") {
    if (micBtn) micBtn.title = "마이크 켜기 (🎙️ 내 발음 녹음)";
    if (input)
      input.placeholder =
        "마이크(🎤)를 누르고 말하면 목소리가 녹음되어 '내 녹음 듣기'로 청취할 수 있습니다.";
    if (tip)
      tip.innerHTML =
        "💡 <strong>[내 발음 녹음]</strong>: 내 목소리를 녹음하여 '내 녹음 듣기'로 직접 들어볼 수 있습니다.";
    if (statusText && !speechPracticeRecordedBlob)
      statusText.textContent = "마이크(🎤)로 말하면 녹음본이 생성됩니다";
  } else {
    if (micBtn) micBtn.title = "마이크 켜기 (⚡ 텍스트 입력 & 동시 녹음)";
    if (input)
      input.placeholder =
        "마이크(🎤)를 누르고 영어로 자유롭게 말해보세요. 텍스트 입력과 녹음이 동시에 진행됩니다.";
    if (tip)
      tip.innerHTML =
        "💡 <strong>[통합 모드]</strong>: 텍스트 자동 입력과 음성 녹음이 동시에 실행됩니다 (PC/데스크톱 권장).";
    if (statusText && !speechPracticeRecordedBlob)
      statusText.textContent = "실시간 텍스트 변환과 내 목소리 녹음이 함께 진행됩니다";
  }
}

// 마이크 상태 UI 동기화
function updateSpeechPracticeMicUI(isListening) {
  const btn = document.getElementById("speechPracticeMicBtn");
  const statusDot = document.getElementById("speechPracticeStatusDot");
  const statusText = document.getElementById("speechPracticeAudioStatusText");

  if (!btn) return;

  if (isListening) {
    btn.classList.add("listening");
    if (statusDot) statusDot.className = "sp-status-dot recording";
    if (statusText) {
      if (currentSpeechPracticeSubMode === "stt") {
        statusText.textContent =
          "✍️ 실시간 음성 인식 중... (영어로 말씀하세요)";
      } else if (currentSpeechPracticeSubMode === "record") {
        statusText.textContent =
          "🎙️ 내 목소리 녹음 중... (마치면 마이크를 다시 누르세요)";
      } else {
        statusText.textContent =
          "⚡ 실시간 텍스트 변환 및 녹음 중... (마치면 마이크를 다시 누르세요)";
      }
    }
  } else {
    btn.classList.remove("listening");
    if (!speechPracticeRecordedBlob) {
      if (statusDot) statusDot.className = "sp-status-dot";
      if (statusText) {
        if (currentSpeechPracticeSubMode === "stt") {
          statusText.textContent =
            "마이크(🎤)를 누르면 말하는 영어가 자동 입력됩니다";
        } else if (currentSpeechPracticeSubMode === "record") {
          statusText.textContent = "마이크(🎤)로 말하면 녹음본이 생성됩니다";
        } else {
          statusText.textContent =
            "마이크(🎤)로 말하면 텍스트 입력과 녹음이 동시 진행됩니다";
        }
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
          if (playText) playText.textContent = "내 녹음 듣기";
          if (playIcon) playIcon.textContent = "▶";
          if (bottomBtn) bottomBtn.innerHTML = "🎧 내 녹음 다시 듣기";
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
    if (playText) playText.textContent = "내 녹음 듣기";
    if (playIcon) playIcon.textContent = "▶";
    if (bottomBtn) bottomBtn.innerHTML = "🎧 내 녹음 다시 듣기";
  }
}

// 발화 다면 채점 실행
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

  // 1. 등급 및 점수 배지
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

  // 2. 발화량 및 속도 통계 그리드
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

  // 2. 마이크 토글 버튼
  if (micBtn) {
    micBtn.addEventListener("click", () => {
      if (typeof toggleSpeechRecognition === "function") {
        toggleSpeechRecognition(
          input,
          micBtn,
          micError,
          "speechPractice",
          currentSpeechPracticeSubMode,
        );
        setTimeout(() => {
          updateSpeechPracticeMicUI(micBtn.classList.contains("listening"));
        }, 100);
      }
    });
  }

  // 2-1. 발화 모드 선택 탭 (STT / 내 발음 녹음 / 통합)
  document.querySelectorAll(".sp-mode-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const mode = pill.dataset.mode || "stt";
      setSpeechPracticeSubMode(mode);
    });
  });
  setSpeechPracticeSubMode(currentSpeechPracticeSubMode);

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
      input.value = "";
      if (typeof resetBaseTranscript === "function") {
        resetBaseTranscript("");
      }
      updateSpeechPracticeCount();
      if (typeof autoResizeTextarea === "function") {
        autoResizeTextarea(input);
      }
    });
  }

  // 5. 새로 쓰기 버튼
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      input.value = "";
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
      if (playText) playText.textContent = "내 녹음 듣기";
      if (playIcon) playIcon.textContent = "▶";
      if (statusDot) statusDot.className = "sp-status-dot";
      if (statusText)
        statusText.textContent = "마이크(🎤)로 말하면 녹음본이 생성됩니다";

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
      if (playText) playText.textContent = "내 녹음 듣기";
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
