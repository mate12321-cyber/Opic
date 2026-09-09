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

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (pushHistory && typeof navigateTo === "function") {
    // 히스토리 관리는 navigateTo를 통해 호출되거나 직접 연동
  }
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
  const emptyMsg = document.getElementById("speechPracticeAudioEmptyMsg");

  if (!player || !blob) return;

  if (speechPracticeAudioUrl) {
    URL.revokeObjectURL(speechPracticeAudioUrl);
  }

  speechPracticeAudioUrl = URL.createObjectURL(blob);
  player.src = speechPracticeAudioUrl;
  player.style.display = "block";
  if (emptyMsg) emptyMsg.style.display = "none";
}

// 마이크 상태 UI 동기화
function updateSpeechPracticeMicUI(isListening) {
  const btn = document.getElementById("speechPracticeMicBtn");
  const label = document.getElementById("speechPracticeMicLabel");
  if (!btn || !label) return;

  if (isListening) {
    btn.classList.add("listening");
    label.textContent = "말하기 완료 (정지)";
  } else {
    btn.classList.remove("listening");
    label.textContent = "말하기 시작";
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
        "💡 필러(Well, You know 등)나 문장 연결어(Because, However)를 더 추가하면 자연스러워집니다.",
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
        "발화량이 다소 짧습니다. 이유(Why), 예시(For example), 감정 표현(I feel like...)을 1~2문장 덧붙여 최소 40단어 이상 말하는 연습을 추천합니다.";
    } else if (wordCount < 50) {
      fb =
        "기본적인 의사 표현이 잘 이루어졌습니다! OPIc IM2~IH를 목표로 한다면 상황에 어울리는 접속사와 필러를 적절히 섞어 문장 간 호흡을 늘려보세요.";
    } else if (wordCount < 90) {
      fb =
        "충분한 발화량과 안정적인 문장 구성이 돋보입니다! 시제 일치와 다채로운 어휘(동의어, 형용사)를 사용하면 IH 이상 고득점이 가능합니다.";
    } else {
      fb =
        "훌륭한 발화량과 유창성입니다! AL 목표 기준 발화량(90단어 이상)을 훌륭하게 만족하고 있습니다. 디테일한 표현과 발음 억양에 집중해보세요.";
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
        grammarList.innerHTML = `<div style="font-size: 13px; color: #059669; font-weight: 600;">✨ 감지된 문법 오류가 없습니다. 깔끔한 문장입니다!</div>`;
      }
    } catch (e) {
      grammarList.innerHTML = `<div style="font-size: 13px; color: var(--text-muted);">문법 검사를 완료하지 못했습니다. (오프라인 상태 또는 네트워크 제한)</div>`;
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
  const ttsBtn = document.getElementById("speechPracticeTtsBtn");
  const toOpicLink = document.getElementById("toOpicFromSpeechPractice");

  if (!input) return;

  // 1. 입력 변경 시 글자/단어 수 카운트 & 높이 조절
  input.addEventListener("input", () => {
    if (typeof autoResizeTextarea === "function") {
      autoResizeTextarea(input);
    }
    updateSpeechPracticeCount();
  });

  // 2. 마이크 토글 버튼
  if (micBtn) {
    micBtn.addEventListener("click", () => {
      if (typeof toggleSpeechRecognition === "function") {
        toggleSpeechRecognition(input, micBtn, micError, "speechPractice");
        // 마이크 상태에 따른 UI 라벨 업데이트
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
      input.value = "";
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
      updateSpeechPracticeCount();
      if (typeof autoResizeTextarea === "function") {
        autoResizeTextarea(input);
      }
      const evalBox = document.getElementById("speechPracticeEvalBox");
      if (evalBox) {
        evalBox.classList.remove("show");
      }
      const player = document.getElementById("speechPracticeAudioPlayer");
      const emptyMsg = document.getElementById("speechPracticeAudioEmptyMsg");
      if (player) {
        player.pause();
        player.src = "";
        player.style.display = "none";
      }
      if (emptyMsg) emptyMsg.style.display = "block";
      if (typeof clearRecordedVoice === "function") {
        clearRecordedVoice("speechPractice");
      }
      speechPracticeRecordedBlob = null;
    });
  }

  // 6. 채점 버튼
  if (evalBtn) {
    evalBtn.addEventListener("click", () => {
      evaluateSpeechPracticeAnswer();
    });
  }

  // 7. 원어민 TTS 비교 청취 버튼
  if (ttsBtn) {
    ttsBtn.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) {
        alert("원어민 발음을 들을 문장을 먼저 입력해주세요.");
        return;
      }
      if (typeof speakText === "function") {
        speakText(text, "en-US", ttsBtn);
      }
    });
  }

  // 8. 실전 모드로 이동 링크
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
