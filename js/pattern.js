/**
 * [pattern.js] 만능 패턴 집중 훈련 (Master Patterns) 모드 컨트롤러
 * - 6대 만능 템플릿 뼈대 및 실시간 주제 스위처(Slot Switcher) 인터랙션
 * - 단계별 문장 발음 듣기 & 마이크 STT 발음 평가
 * - 패턴별 학습 진도 저장
 */

// 패턴 모드 전역 상태
let patternCur = 0; // 현재 선택된 패턴 인덱스
let patternVarCur = 0; // 현재 선택된 주제 변형(슬롯) 인덱스
let patternOrder = [0, 1, 2, 3, 4, 5];
let patternProgress = {};

// 패턴 진도 로컬스토리지 로드
async function loadPatternProgress() {
  try {
    const res = await storage.get(PATTERN_STORAGE_KEY, false);
    if (res && res.value) patternProgress = JSON.parse(res.value) || {};
  } catch (e) {
    patternProgress = {};
  }
}

// 패턴 진도 로컬스토리지 저장
async function savePatternProgress() {
  try {
    await storage.set(
      PATTERN_STORAGE_KEY,
      JSON.stringify(patternProgress),
      false,
    );
  } catch (e) {
    /* best effort */
  }
}

// 6대 패턴 목록 화면 렌더링
function renderPatternTopics() {
  const container = document.getElementById("patternTopicGrid");
  if (!container || !PATTERN_ITEMS.length) return;

  container.innerHTML = PATTERN_ITEMS.map((pat, idx) => {
    const isDone = patternProgress[pat.id];
    return `
      <div class="pattern-select-card" data-idx="${idx}">
        <div class="pattern-select-icon">${pat.icon || "🧩"}</div>
        <div class="pattern-select-body">
          <div class="pattern-select-name">
            <span>${idx + 1}. ${escapeHtml(pat.name)}</span>
            ${isDone ? '<span class="pattern-select-badge">완료 ✓</span>' : ""}
          </div>
          <div class="pattern-select-desc">${escapeHtml(pat.desc)}</div>
          <div class="pattern-select-cats">📌 적용 주제: ${escapeHtml(pat.category)}</div>
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".pattern-select-card").forEach((card) => {
    card.addEventListener("click", () => {
      patternCur = parseInt(card.dataset.idx, 10) || 0;
      patternVarCur = 0;
      showPatternCard();
    });
  });
}

// 패턴 학습 화면으로 전환
function showPatternCard() {
  hideAllScreens();
  const card = document.getElementById("patternCard");
  if (card) {
    card.style.display = "block";
    renderPatternCard();
  }
}

// 패턴 카드 상세 렌더링
function renderPatternCard() {
  const pat = PATTERN_ITEMS[patternCur];
  if (!pat) return;

  // 1. 인덱스 및 타이틀
  const idxLabel = document.getElementById("patternIdxLabel");
  if (idxLabel) {
    idxLabel.textContent = `PATTERN ${String(patternCur + 1).padStart(2, "0")} / ${String(PATTERN_ITEMS.length).padStart(2, "0")}`;
  }

  const titleEl = document.getElementById("patternMainTitle");
  if (titleEl) {
    titleEl.innerHTML = `${pat.icon || "🧩"} ${escapeHtml(pat.name)}`;
  }

  const descEl = document.getElementById("patternDescP");
  if (descEl) {
    descEl.textContent = pat.desc;
  }

  // 2. 템플릿 뼈대 (Skeleton) 렌더링
  const skeletonWrap = document.getElementById("patternSkeletonList");
  if (skeletonWrap && pat.skeleton) {
    skeletonWrap.innerHTML = pat.skeleton
      .map((line) => {
        return `<div class="skeleton-item">${escapeHtml(line)}</div>`;
      })
      .join("");
  }

  // 3. 인터랙티브 주제 스위처 칩 렌더링
  const switcherChips = document.getElementById("patternSwitcherChips");
  if (switcherChips && pat.variations) {
    switcherChips.innerHTML = pat.variations
      .map((v, vIdx) => {
        const activeClass = vIdx === patternVarCur ? "active" : "";
        return `
        <button type="button" class="switcher-chip ${activeClass}" data-vidx="${vIdx}">
          <span>${escapeHtml(v.topic)}</span>
        </button>
      `;
      })
      .join("");

    switcherChips.querySelectorAll(".switcher-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        patternVarCur = parseInt(chip.dataset.vidx, 10) || 0;
        renderPatternVariation();
      });
    });
  }

  renderPatternVariation();
}

// 현재 선택된 주제 변형(슬롯) 렌더링
function renderPatternVariation() {
  const pat = PATTERN_ITEMS[patternCur];
  if (!pat || !pat.variations || !pat.variations[patternVarCur]) return;

  const curVar = pat.variations[patternVarCur];

  // 칩 활성화 상태 업데이트
  document.querySelectorAll(".switcher-chip").forEach((chip) => {
    if (parseInt(chip.dataset.vidx, 10) === patternVarCur) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });

  // 문장 목록 렌더링
  const sentenceList = document.getElementById("patternSentenceList");
  if (sentenceList && curVar.sentences) {
    sentenceList.innerHTML = curVar.sentences
      .map((s, sIdx) => {
        return `
        <div class="pattern-sentence-item">
          <div class="ps-header">
            <span class="ps-num">문장 ${sIdx + 1}</span>
            <button type="button" class="tts-btn tts-btn-sm" data-sen-idx="${sIdx}" title="이 문장 발음 듣기">
              🔊 발음
            </button>
          </div>
          <div class="ps-en">${escapeHtml(s.en)}</div>
          <div class="ps-ko">${escapeHtml(s.ko)}</div>
        </div>
      `;
      })
      .join("");

    // 개별 문장 TTS 바인딩
    sentenceList.querySelectorAll(".tts-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sIdx = parseInt(btn.dataset.senIdx, 10);
        const sentence = curVar.sentences[sIdx];
        if (sentence && sentence.en) {
          speakText(sentence.en, "en-US", btn);
        }
      });
    });
  }

  // 전체 답변 텍스트 구성
  const fullEn = curVar.sentences.map((s) => s.en).join(" ");
  const fullKo = curVar.sentences.map((s) => s.ko).join(" ");

  const fullEnEl = document.getElementById("patternFullEn");
  if (fullEnEl) fullEnEl.textContent = fullEn;

  const fullKoEl = document.getElementById("patternFullKo");
  if (fullKoEl) fullKoEl.textContent = fullKo;

  // 전체 TTS 버튼
  const allTtsBtn = document.getElementById("patternTtsAllBtn");
  if (allTtsBtn) {
    allTtsBtn.onclick = () => speakText(fullEn, "en-US", allTtsBtn);
  }

  // 전체 복사 버튼
  const copyBtn = document.getElementById("patternCopyAllBtn");
  if (copyBtn) {
    copyBtn.onclick = () => copyText(fullEn, copyBtn);
  }
}

// 다음 패턴으로 이동
function nextPattern() {
  const pat = PATTERN_ITEMS[patternCur];
  if (pat) {
    patternProgress[pat.id] = true;
    savePatternProgress();
    logPracticeEvent();
  }

  if (patternCur < PATTERN_ITEMS.length - 1) {
    patternCur++;
    patternVarCur = 0;
    renderPatternCard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // 모든 패턴 완료
    alert("🎉 축하합니다! 6대 만능 패턴 학습을 모두 완료하셨습니다!");
    showHomeScreen();
  }
}

// 이전 패턴으로 이동
function prevPattern() {
  if (patternCur > 0) {
    patternCur--;
    patternVarCur = 0;
    renderPatternCard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
