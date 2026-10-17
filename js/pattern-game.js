/**
 * @file pattern-game.js
 * @description [모드 4-2] 만능 패턴 게임 훈련 (Pattern Game Training) 컨트롤러
 * - 게임 1: 「슬롯 조립 퍼즐 (Block / Slot Assembly Game)」
 * - 6대 만능 패턴의 고정 뼈대(skeleton)와 주제별 문장(variations)을 비교 분석하여
 *   주제마다 바뀌는 핵심 가변 슬롯(Slot)을 자동으로 추출하고 조립 퍼즐을 생성합니다.
 * - 다른 주제의 슬롯 조각을 오답 함정 카드(Distractors)로 섞어 제공하며,
 *   정답 스냅 효과, TTS 자동 발음, 콤보/점수/클리어 기록 영속화를 지원합니다.
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 */

// =============================================================================
// 1. 만능 패턴 게임 전역 상태 변수 (Game State)
// =============================================================================

const PATTERN_GAME_STORAGE_KEY = "opic_pattern_game_clears_v1";

let pgCurPatternIdx = 0; // 현재 선택된 만능 패턴 인덱스 (0 ~ 5)
let pgCurVarIdx = 0; // 현재 선택된 주제 스테이지 인덱스
let pgShowKoHint = true; // 한글 해석 힌트 표시 여부

let pgCombo = 0; // 연속 정답 콤보
let pgScore = 0; // 누적 점수
let pgClearsMap = {}; // 스테이지 클리어 기록 { "pat_01_0": true, ... }

/**
 * 현재 스테이지의 슬롯 퍼즐 상태
 * @type {{
 *   sentences: Array<{
 *     senIdx: number,
 *     enFull: string,
 *     koFull: string,
 *     segments: Array<{ type: 'text'|'slot', text: string, slotId?: number, label?: string }>
 *   }>,
 *   slots: Array<{
 *     slotId: number,
 *     senIdx: number,
 *     label: string,
 *     answer: string,
 *     filled: boolean,
 *     justSnapped?: boolean
 *   }>,
 *   activeSlotId: number | null,
 *   deck: Array<{
 *     cardId: string,
 *     text: string,
 *     isUsed: boolean
 *   }>
 * }}
 */
let pgStageState = {
  sentences: [],
  slots: [],
  activeSlotId: null,
  deck: [],
};

// =============================================================================
// 2. 클리어 기록 로컬 스토리지 연동 (Persistence)
// =============================================================================

function loadPatternGameClears() {
  try {
    const raw = localStorage.getItem(PATTERN_GAME_STORAGE_KEY);
    if (raw) {
      pgClearsMap = JSON.parse(raw) || {};
    }
  } catch (e) {
    pgClearsMap = {};
  }
}

function savePatternGameClears() {
  try {
    localStorage.setItem(PATTERN_GAME_STORAGE_KEY, JSON.stringify(pgClearsMap));
  } catch (e) {}
}

function getPatternClearedCount(patIdx) {
  const items = window.PATTERNS_DATA || [];
  const pat = items[patIdx];
  if (!pat || !pat.variations) return 0;
  let cnt = 0;
  pat.variations.forEach((_, vIdx) => {
    if (pgClearsMap[`${pat.id}_${vIdx}`]) cnt++;
  });
  return cnt;
}

function getTotalPatternGameClears() {
  return Object.keys(pgClearsMap).filter((k) => pgClearsMap[k]).length;
}

// =============================================================================
// 3. 핵심 알고리즘: 뼈대(Skeleton) vs 변형(Variation) 슬롯 자동 추출기
// =============================================================================

/**
 * 문장 앞의 번호("1. ", "2. ")를 제거합니다.
 * @param {string} str
 * @returns {string}
 */
function stripLeadingNumber(str) {
  return String(str || "")
    .replace(/^\d+\.\s*/, "")
    .trim();
}

/**
 * 스켈레톤 문장(예: "There are [특징 1] and [특징 2], so it makes me...")과
 * 실제 주제 문장(예: "There are large windows and nice seats, so it makes me...")을 비교해
 * 텍스트 구간과 슬롯 구간 배열을 반환합니다.
 *
 * 만약 주제 문장이 스켈레톤의 고정 텍스트와 일부 달라서 정규식 매칭이 안 될 경우,
 * 다른 주제 문장들과의 단어 비교(Prefix/Suffix 공통 부분 제거)를 통해 핵심 가변 구문을 스마트하게 추출합니다.
 *
 * @param {string} skelEn - 스켈레톤 영문 문장
 * @param {string} targetEn - 현재 주제의 영문 문장
 * @param {string[]} siblingEnList - 같은 패턴 내 다른 주제들의 동일 번호 영문 문장 목록
 * @param {number} senIdx - 문장 인덱스 (0~5)
 * @returns {Array<{ type: 'text'|'slot', text: string, label?: string }>}
 */
function extractSentenceSegments(skelEn, targetEn, siblingEnList, senIdx) {
  const cleanSkel = stripLeadingNumber(skelEn);
  const cleanTarget = stripLeadingNumber(targetEn);

  // 1. 스켈레톤에 [슬롯] 표기가 있는 경우 정규식 그룹 매칭 시도
  const slotMatches = [...cleanSkel.matchAll(/\[([^\]]+)\]/g)];
  if (slotMatches.length > 0) {
    const labels = slotMatches.map((m) => m[1]);
    // 스켈레톤을 [슬롯] 기준으로 분할한 고정 텍스트 조각들
    const staticParts = cleanSkel.split(/\[[^\]]+\]/g);

    // 정규식 패턴 생성 (고정 조각들을 escape하고 슬롯 자리에 (.+?) 배치)
    const regexParts = [];
    for (let i = 0; i < staticParts.length; i++) {
      regexParts.push(
        staticParts[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      );
      if (i < labels.length) {
        regexParts.push("(.+?)");
      }
    }
    const fullRegex = new RegExp(`^${regexParts.join("")}$`, "i");
    const match = cleanTarget.match(fullRegex);

    if (match) {
      const segments = [];
      for (let i = 0; i < staticParts.length; i++) {
        if (staticParts[i]) {
          segments.push({ type: "text", text: staticParts[i] });
        }
        if (i < labels.length) {
          const captured = match[i + 1].trim();
          segments.push({
            type: "slot",
            text: captured,
            label: labels[i],
          });
        }
      }
      return segments;
    }
  }

  // 2. 다른 주제들의 같은 번호 문장과 비교하여 가변 구간(Diff Span) 자동 추출
  // (예: 스켈레톤에 대괄호가 없지만 주제별로 단어가 바뀌는 문장이나, 문장 구조가 약간 변형된 경우)
  if (siblingEnList && siblingEnList.length > 1) {
    const targetWords = cleanTarget.split(/\s+/);
    // 가장 비슷한 형제 문장 하나(단, 완전히 같지는 않은 문장)들을 대상으로 공통 접두/접미어 탐색
    const diffCandidates = siblingEnList
      .map((s) => stripLeadingNumber(s))
      .filter((s) => s && s.toLowerCase() !== cleanTarget.toLowerCase());

    if (diffCandidates.length > 0) {
      // 형제 문장들 중 공통 토큰 수가 가장 많은 문장 선택
      let bestSiblingWords = null;
      let bestOverlapScore = -1;

      for (const cand of diffCandidates) {
        const wList = cand.split(/\s+/);
        let p = 0;
        while (
          p < targetWords.length &&
          p < wList.length &&
          targetWords[p].toLowerCase() === wList[p].toLowerCase()
        ) {
          p++;
        }
        let s = 0;
        while (
          s < targetWords.length - p &&
          s < wList.length - p &&
          targetWords[targetWords.length - 1 - s].toLowerCase() ===
            wList[wList.length - 1 - s].toLowerCase()
        ) {
          s++;
        }
        const score = p + s;
        if (score > bestOverlapScore && p + s < targetWords.length) {
          bestOverlapScore = score;
          bestSiblingWords = { p, s };
        }
      }

      if (bestSiblingWords && bestOverlapScore >= 3) {
        const { p, s } = bestSiblingWords;
        const prefixWords = targetWords.slice(0, p);
        const middleWords = targetWords.slice(p, targetWords.length - s);
        const suffixWords = targetWords.slice(targetWords.length - s);

        // 중간 가변 구간이 너무 길지 않을 때(1~7단어) 슬롯으로 채택
        if (middleWords.length >= 1 && middleWords.length <= 7) {
          let middleText = middleWords.join(" ");
          let trailingPunct = "";
          const punctMatch = middleText.match(/([,.!?]+)$/);
          if (punctMatch) {
            trailingPunct = punctMatch[1];
            middleText = middleText.slice(0, -trailingPunct.length);
          }

          const segments = [];
          if (prefixWords.length > 0) {
            segments.push({ type: "text", text: prefixWords.join(" ") + " " });
          }
          const defaultLabel =
            slotMatches.length > 0 ? slotMatches[0][1] : `핵심 표현`;
          segments.push({
            type: "slot",
            text: middleText,
            label: defaultLabel,
          });
          const rightText =
            trailingPunct +
            (suffixWords.length > 0 ? " " + suffixWords.join(" ") : "");
          if (rightText) {
            segments.push({ type: "text", text: rightText });
          }
          return segments;
        }
      }
    }
  }

  // 3. 스켈레톤에 [슬롯]이 있었으나 위 매칭에 모두 실패한 경우: 문장 후반부 핵심 구문을 슬롯화
  if (slotMatches.length > 0) {
    const words = cleanTarget.split(/\s+/);
    if (words.length >= 5) {
      const cutStart = Math.max(2, words.length - 4);
      const prefix = words.slice(0, cutStart).join(" ") + " ";
      let slotPart = words.slice(cutStart).join(" ");
      let punct = "";
      const pm = slotPart.match(/([.!?]+)$/);
      if (pm) {
        punct = pm[1];
        slotPart = slotPart.slice(0, -punct.length);
      }
      return [
        { type: "text", text: prefix },
        { type: "slot", text: slotPart, label: slotMatches[0][1] },
        ...(punct ? [{ type: "text", text: punct }] : []),
      ];
    }
  }

  // 4. 고정 뼈대 문장 (모든 주제에서 동일한 문장)
  return [{ type: "text", text: cleanTarget }];
}

/**
 * 현재 선택된 패턴과 주제(variation)에 대한 조립 퍼즐 스테이지 데이터를 생성합니다.
 */
function buildPatternGameStage() {
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations || !pat.variations[pgCurVarIdx]) return;

  const curVar = pat.variations[pgCurVarIdx];
  const activeSkeleton = curVar.skeleton || pat.skeleton || [];

  const stageSentences = [];
  const stageSlots = [];
  let nextSlotId = 0;

  curVar.sentences.forEach((senObj, sIdx) => {
    const skelObj = activeSkeleton[sIdx] || { en: senObj.en, ko: senObj.ko };
    const skelEn = typeof skelObj === "object" ? skelObj.en : skelObj;
    const siblingEnList = pat.variations
      .map((v) => (v.sentences && v.sentences[sIdx] ? v.sentences[sIdx].en : ""))
      .filter(Boolean);

    const rawSegments = extractSentenceSegments(
      skelEn,
      senObj.en,
      siblingEnList,
      sIdx,
    );

    const mappedSegments = rawSegments.map((seg) => {
      if (seg.type === "slot") {
        const slotId = nextSlotId++;
        stageSlots.push({
          slotId,
          senIdx: sIdx,
          label: seg.label || `슬롯 ${slotId + 1}`,
          answer: seg.text,
          filled: false,
          justSnapped: false,
        });
        return {
          type: "slot",
          text: seg.text,
          label: seg.label || `슬롯 ${slotId + 1}`,
          slotId,
        };
      }
      return seg;
    });

    stageSentences.push({
      senIdx: sIdx,
      enFull: stripLeadingNumber(senObj.en),
      koFull: stripLeadingNumber(senObj.ko),
      segments: mappedSegments,
    });
  });

  // 만약 추출된 슬롯이 너무 적으면(예: 1개 이하), 4번/5번 핵심 문장의 후반부를 추가 슬롯으로 보강
  if (stageSlots.length < 2 && stageSentences.length >= 5) {
    [3, 4].forEach((targetSenIdx) => {
      const sen = stageSentences[targetSenIdx];
      if (!sen) return;
      const hasSlot = sen.segments.some((sg) => sg.type === "slot");
      if (!hasSlot) {
        const words = sen.enFull.split(/\s+/);
        if (words.length >= 5) {
          const splitIdx = Math.floor(words.length / 2);
          const leftText = words.slice(0, splitIdx).join(" ") + " ";
          let rightSlot = words.slice(splitIdx).join(" ");
          let punct = "";
          const pm = rightSlot.match(/([.!?]+)$/);
          if (pm) {
            punct = pm[1];
            rightSlot = rightSlot.slice(0, -punct.length);
          }
          const slotId = nextSlotId++;
          const slotObj = {
            slotId,
            senIdx: targetSenIdx,
            label: "핵심 구문",
            answer: rightSlot,
            filled: false,
            justSnapped: false,
          };
          stageSlots.push(slotObj);
          sen.segments = [
            { type: "text", text: leftText },
            {
              type: "slot",
              text: rightSlot,
              label: "핵심 구문",
              slotId,
            },
            ...(punct ? [{ type: "text", text: punct }] : []),
          ];
        }
      }
    });
  }

  // 슬롯 번호를 문장 순서대로 재정렬
  stageSlots.sort((a, b) => a.senIdx - b.senIdx || a.slotId - b.slotId);

  // 오답 함정 블록(Distractors) 추출: 같은 패턴의 다른 주제들에서 슬롯 텍스트 수집
  const answerSet = new Set(
    stageSlots.map((s) => s.answer.toLowerCase().trim()),
  );
  const distractorPool = [];

  pat.variations.forEach((otherVar, vIdx) => {
    if (vIdx === pgCurVarIdx || !otherVar.sentences) return;
    const otherSkel = otherVar.skeleton || pat.skeleton || [];
    otherVar.sentences.forEach((sObj, sIdx) => {
      const skObj = otherSkel[sIdx] || { en: sObj.en };
      const skEn = typeof skObj === "object" ? skObj.en : skObj;
      const segs = extractSentenceSegments(skEn, sObj.en, [], sIdx);
      segs.forEach((sg) => {
        if (sg.type === "slot" && sg.text) {
          const norm = sg.text.toLowerCase().trim();
          if (
            !answerSet.has(norm) &&
            !distractorPool.some((d) => d.toLowerCase().trim() === norm)
          ) {
            distractorPool.push(sg.text.trim());
          }
        }
      });
    });
  });

  // 함정 블록 무작위 셔플 후 4개 선택
  for (let i = distractorPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractorPool[i], distractorPool[j]] = [
      distractorPool[j],
      distractorPool[i],
    ];
  }
  const chosenDistractors = distractorPool.slice(0, 4);

  // 덱 카드 생성 (정답 카드 + 함정 카드)
  const deckCards = [
    ...stageSlots.map((s, idx) => ({
      cardId: `ans_${idx}_${s.slotId}`,
      text: s.answer,
      isUsed: false,
    })),
    ...chosenDistractors.map((dText, idx) => ({
      cardId: `dist_${idx}`,
      text: dText,
      isUsed: false,
    })),
  ];

  // 덱 카드 무작위 셔플
  for (let i = deckCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deckCards[i], deckCards[j]] = [deckCards[j], deckCards[i]];
  }

  pgStageState = {
    sentences: stageSentences,
    slots: stageSlots,
    activeSlotId: stageSlots.length > 0 ? stageSlots[0].slotId : null,
    deck: deckCards,
  };
}

// =============================================================================
// 4. 로비 및 게임 보드 UI 렌더링 (Renderers)
// =============================================================================

/**
 * 만능 패턴 게임 훈련 로비 화면(#patternGameTopicScreen)의 6대 패턴 스테이지 카드를 렌더링합니다.
 */
function renderPatternGameLobby() {
  loadPatternGameClears();
  const container = document.getElementById("patternGameTopicGrid");
  if (!container) return;

  const items = window.PATTERNS_DATA || [];
  if (!items.length) {
    container.innerHTML = `<div style="padding:20px; text-align:center;">패턴 데이터를 불러오는 중입니다...</div>`;
    return;
  }

  const totalClearsBadge = document.getElementById(
    "patternGameTotalClearsBadge",
  );
  if (totalClearsBadge) {
    totalClearsBadge.textContent = `🏆 총 ${getTotalPatternGameClears()}개 주제 클리어`;
  }

  container.innerHTML = items
    .map((pat, idx) => {
      const totalVars = pat.variations ? pat.variations.length : 0;
      const clearedVars = getPatternClearedCount(idx);
      const slotBadge = pat.slotBadge
        ? `<span class="pattern-slot-badge ${pat.slotClass || "slot-step1"}">${safeEscapeHtml(pat.slotBadge)}</span>`
        : "";

      const sampleSkel =
        pat.skeleton && pat.skeleton[0]
          ? stripLeadingNumber(pat.skeleton[0].en)
          : "";

      return `
        <button type="button" class="pattern-select-card" onclick="openPatternGameStage(${idx}, 0)">
          <div class="pattern-select-icon">${pat.icon || "🎮"}</div>
          <div class="pattern-select-body">
            <div class="pattern-select-name-row">
              <span class="pattern-select-name-text">STAGE ${idx + 1}. ${safeEscapeHtml(pat.name)}</span>
              <div class="pattern-badge-group">
                ${slotBadge}
                <span class="pattern-combo-badge" style="color:#6d28d9; background:#ede9fe; border-color:#ddd6fe;">
                  🕹️ ${clearedVars} / ${totalVars} 클리어
                </span>
              </div>
            </div>
            <div class="pattern-match-summary">
              <span class="pms-icon">🎯</span>
              <span class="pms-text">${safeEscapeHtml(pat.whenToUse || pat.desc)}</span>
            </div>
            <div style="font-size:12px; color:#6d28d9; font-weight:600; background:#f5f3ff; padding:5px 9px; border-radius:6px; border:1px dashed #c4b5fd; margin-top:2px;">
              🧩 대표 뼈대: ${formatSlotText(sampleSkel)}
            </div>
          </div>
        </button>
      `;
    })
    .join("");
}

/**
 * 특정 패턴 및 주제 인덱스로 슬롯 조립 게임을 시작합니다.
 * @param {number} patIdx
 * @param {number} [varIdx=0]
 * @param {boolean} [pushHistory=true]
 */
function openPatternGameStage(patIdx, varIdx = 0, pushHistory = true) {
  const items = window.PATTERNS_DATA || [];
  if (patIdx >= 0 && patIdx < items.length) {
    pgCurPatternIdx = patIdx;
    const maxVar = items[patIdx].variations
      ? items[patIdx].variations.length
      : 1;
    pgCurVarIdx = varIdx >= 0 && varIdx < maxVar ? varIdx : 0;
  }

  if (typeof navigateTo === "function") {
    navigateTo(
      "patternGameCard",
      { patIdx: pgCurPatternIdx, varIdx: pgCurVarIdx },
      pushHistory,
    );
    return;
  }
}

/**
 * 현재 설정된 패턴과 주제로 게임 스테이지를 초기화하고 화면을 렌더링합니다.
 */
function startPatternGameStage() {
  loadPatternGameClears();
  buildPatternGameStage();
  renderPatternGameCardUI();
}

/**
 * 게임 카드 전체 UI(헤더, 주제 칩, HUD, 6문장 조립 보드, 블록 덱)를 업데이트합니다.
 */
function renderPatternGameCardUI() {
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations || !pat.variations[pgCurVarIdx]) return;

  const curVar = pat.variations[pgCurVarIdx];
  const cleanTopic = (curVar.topic || "").replace(/\s*\([^)]*\)/g, "").trim();

  // 1. 상단 타이틀
  const titleEl = document.getElementById("pgMainTitle");
  if (titleEl) {
    titleEl.innerHTML = `${pat.icon || "🧩"} ${safeEscapeHtml(pat.name)} · 조립 퍼즐`;
  }

  // 2. 미션 주제 뱃지 & 에바 질문 연동
  const topicBadge = document.getElementById("pgTopicBadge");
  if (topicBadge) {
    topicBadge.textContent = cleanTopic;
  }

  const matchedQ =
    typeof getMatchingQuestionForVariation === "function"
      ? getMatchingQuestionForVariation(pat, curVar)
      : {
          q_en: pat.exampleQuestion || "Please describe this topic in detail.",
        };

  const qTextEl = document.getElementById("pgQuestionText");
  if (qTextEl && matchedQ) {
    qTextEl.textContent = `“${matchedQ.q_en}”`;
  }

  const listenQBtn = document.getElementById("pgListenQuestionBtn");
  if (listenQBtn && matchedQ) {
    listenQBtn.onclick = () => {
      if (typeof speakText === "function") {
        speakText(matchedQ.q_en, "en-US", listenQBtn);
      }
    };
  }

  // 3. 주제 선택 칩 렌더링 (클리어한 주제는 ✓ 표시)
  const chipsWrap = document.getElementById("pgTopicChips");
  if (chipsWrap && pat.variations) {
    chipsWrap.innerHTML = pat.variations
      .map((v, vIdx) => {
        const isCurrent = vIdx === pgCurVarIdx;
        const isCleared = !!pgClearsMap[`${pat.id}_${vIdx}`];
        const tName = (v.topic || "").replace(/\s*\([^)]*\)/g, "").trim();
        return `
          <button
            type="button"
            class="switcher-chip ${isCurrent ? "active" : ""}"
            onclick="selectPatternGameTopic(${vIdx})"
            title="${safeEscapeHtml(v.topic)}"
          >
            ${safeEscapeHtml(tName)}${isCleared ? " ✓" : ""}
          </button>
        `;
      })
      .join("");
  }

  // 4. 전체 6문장 듣기 버튼 바인딩
  const listenAllBtn = document.getElementById("pgListenAllBtn");
  const clearListenBtn = document.getElementById("pgClearListenBtn");
  const fullSpeech = curVar.sentences
    .map((s) => stripLeadingNumber(s.en))
    .join(" ");

  if (listenAllBtn) {
    listenAllBtn.onclick = () => {
      if (typeof speakText === "function") {
        speakText(fullSpeech, "en-US", listenAllBtn);
      }
    };
  }
  if (clearListenBtn) {
    clearListenBtn.onclick = () => {
      if (typeof speakText === "function") {
        speakText(fullSpeech, "en-US", clearListenBtn);
      }
    };
  }

  // 5. 보드, 덱, HUD 렌더링
  renderPatternGameBoardAndDeck();
}

/**
 * 진행 상태에 따라 HUD, 6문장 조립 보드, 하단 블록 덱, 클리어 배너를 갱신합니다.
 */
function renderPatternGameBoardAndDeck() {
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations) return;

  const totalSlots = pgStageState.slots.length;
  const filledSlots = pgStageState.slots.filter((s) => s.filled).length;
  const isAllCleared = totalSlots > 0 && filledSlots === totalSlots;

  // 1. HUD 업데이트
  const hudStage = document.getElementById("pgHudStage");
  if (hudStage) {
    hudStage.textContent = `${pgCurVarIdx + 1} / ${pat.variations.length}`;
  }
  const hudSlots = document.getElementById("pgHudSlots");
  if (hudSlots) {
    hudSlots.textContent = `${filledSlots} / ${totalSlots}`;
  }
  const hudCombo = document.getElementById("pgHudCombo");
  if (hudCombo) {
    hudCombo.textContent = `🔥 ${pgCombo}`;
  }
  const hudScore = document.getElementById("pgHudScore");
  if (hudScore) {
    hudScore.textContent = `${pgScore}`;
  }

  // 2. 6문장 보드 렌더링
  const boardEl = document.getElementById("pgSentencesBoard");
  if (boardEl) {
    boardEl.innerHTML = pgStageState.sentences
      .map((sen) => {
        const senSlots = pgStageState.slots.filter(
          (s) => s.senIdx === sen.senIdx,
        );
        const hasActive = senSlots.some(
          (s) => !s.filled && s.slotId === pgStageState.activeSlotId,
        );
        const isRowDone =
          senSlots.length > 0 && senSlots.every((s) => s.filled);

        const enHtml = sen.segments
          .map((seg) => {
            if (seg.type === "text") {
              return safeEscapeHtml(seg.text);
            }
            const slotObj = pgStageState.slots.find(
              (s) => s.slotId === seg.slotId,
            );
            if (!slotObj) return safeEscapeHtml(seg.text);

            if (slotObj.filled) {
              const snapClass = slotObj.justSnapped ? "snap-anim" : "";
              return `<span class="pg-slot-blank is-filled ${snapClass}">✓ ${safeEscapeHtml(slotObj.answer)}</span>`;
            }

            const isTarget = slotObj.slotId === pgStageState.activeSlotId;
            const targetClass = isTarget ? "is-target" : "is-empty";
            return `
              <button
                type="button"
                class="pg-slot-blank ${targetClass}"
                onclick="setActivePatternGameSlot(${slotObj.slotId})"
                title="클릭하여 이 빈칸 선택"
              >
                <span>🧩 [${safeEscapeHtml(slotObj.label)}]</span>
              </button>
            `;
          })
          .join("");

        return `
          <div class="pg-sentence-row ${hasActive ? "has-active-slot" : ""} ${isRowDone ? "row-completed" : ""}">
            <div class="pg-sen-top">
              <span class="pg-sen-num">문장 ${sen.senIdx + 1} ${senSlots.length === 0 ? "· 고정 뼈대" : isRowDone ? "· 조립 완료 ✓" : "· 슬롯 조립"}</span>
              <button
                type="button"
                class="tts-btn tts-btn-sm"
                onclick="speakPatternGameSentence(${sen.senIdx}, this)"
                title="이 문장 발음 듣기"
              >
                🔊 듣기
              </button>
            </div>
            <div class="pg-sen-en">${enHtml}</div>
            <div class="pg-sen-ko ${pgShowKoHint ? "" : "hidden-hint"}">${safeEscapeHtml(sen.koFull)}</div>
          </div>
        `;
      })
      .join("");

    // 스냅 애니메이션 플래그 초기화
    pgStageState.slots.forEach((s) => {
      s.justSnapped = false;
    });
  }

  // 3. 하단 블록 덱 및 클리어 배너 토글
  const deckSection = document.getElementById("pgDeckSection");
  const clearBanner = document.getElementById("pgClearBanner");
  const indicatorEl = document.getElementById("pgActiveSlotIndicator");
  const deckGrid = document.getElementById("pgDeckGrid");

  if (isAllCleared) {
    if (deckSection) deckSection.style.display = "none";
    if (clearBanner) clearBanner.style.display = "block";
  } else {
    if (deckSection) deckSection.style.display = "block";
    if (clearBanner) clearBanner.style.display = "none";

    const activeSlot = pgStageState.slots.find(
      (s) => s.slotId === pgStageState.activeSlotId,
    );
    if (indicatorEl && activeSlot) {
      indicatorEl.textContent = `문장 ${activeSlot.senIdx + 1}의 [${activeSlot.label}] 블록을 선택하세요`;
    }

    if (deckGrid) {
      deckGrid.innerHTML = pgStageState.deck
        .map((card, cIdx) => {
          const keyBadge =
            cIdx < 9
              ? `<kbd class="pg-block-key shortcut-key">${cIdx + 1}</kbd>`
              : "";
          return `
            <button
              type="button"
              class="pg-block-card ${card.isUsed ? "is-used" : ""}"
              id="pgDeckCard_${cIdx}"
              onclick="handlePatternGameBlockClick(${cIdx})"
            >
              ${keyBadge}
              <span>🧱</span>
              <span>${safeEscapeHtml(card.text)}</span>
            </button>
          `;
        })
        .join("");
    }
  }
}

// =============================================================================
// 5. 사용자 인터랙션 핸들러 (Slot & Block Click Handlers)
// =============================================================================

/**
 * 특정 빈칸 슬롯을 타겟으로 활성화합니다.
 * @param {number} slotId
 */
function setActivePatternGameSlot(slotId) {
  const slotObj = pgStageState.slots.find((s) => s.slotId === slotId);
  if (!slotObj || slotObj.filled) return;
  pgStageState.activeSlotId = slotId;
  renderPatternGameBoardAndDeck();
}

/**
 * 하단 블록 덱에서 영어 블록 카드를 클릭했을 때 정답 여부를 판별합니다.
 * @param {number} cardIdx
 */
function handlePatternGameBlockClick(cardIdx) {
  const card = pgStageState.deck[cardIdx];
  if (!card || card.isUsed) return;

  let activeSlot = pgStageState.slots.find(
    (s) => s.slotId === pgStageState.activeSlotId && !s.filled,
  );
  if (!activeSlot) {
    activeSlot = pgStageState.slots.find((s) => !s.filled);
    if (activeSlot) pgStageState.activeSlotId = activeSlot.slotId;
  }
  if (!activeSlot) return;

  const isCorrect =
    card.text.trim().toLowerCase() === activeSlot.answer.trim().toLowerCase();

  if (isCorrect) {
    // 정답 처리
    card.isUsed = true;
    activeSlot.filled = true;
    activeSlot.justSnapped = true;

    pgCombo++;
    pgScore += 100 + (pgCombo - 1) * 20;

    // 콤보 팝업 효과
    const comboBox = document.getElementById("pgHudComboBox");
    if (comboBox) {
      comboBox.classList.remove("combo-pop");
      void comboBox.offsetWidth;
      comboBox.classList.add("combo-pop");
    }

    // 해당 문장의 모든 슬롯이 채워졌는지 확인하여 문장 TTS 자동 재생
    const senIdx = activeSlot.senIdx;
    const senSlots = pgStageState.slots.filter((s) => s.senIdx === senIdx);
    const isSentenceComplete = senSlots.every((s) => s.filled);
    const senObj = pgStageState.sentences.find((s) => s.senIdx === senIdx);

    if (isSentenceComplete && senObj && typeof speakText === "function") {
      speakText(senObj.enFull, "en-US", null);
    }

    // 다음 미완성 슬롯 자동 포커스
    const nextEmpty = pgStageState.slots.find((s) => !s.filled);
    pgStageState.activeSlotId = nextEmpty ? nextEmpty.slotId : null;

    // 모든 슬롯 완료 시 클리어 기록 저장 및 학습 로그 반영
    if (!nextEmpty) {
      const items = window.PATTERNS_DATA || [];
      const pat = items[pgCurPatternIdx];
      if (pat) {
        pgClearsMap[`${pat.id}_${pgCurVarIdx}`] = true;
        savePatternGameClears();
      }
      if (typeof incrementDailyCount === "function") {
        incrementDailyCount();
      }
    }

    renderPatternGameBoardAndDeck();
  } else {
    // 오답 처리: 콤보 초기화 & 카드 흔들림 효과
    pgCombo = 0;
    const hudCombo = document.getElementById("pgHudCombo");
    if (hudCombo) hudCombo.textContent = `🔥 0`;

    const cardEl = document.getElementById(`pgDeckCard_${cardIdx}`);
    if (cardEl) {
      cardEl.classList.remove("wrong-shake");
      void cardEl.offsetWidth;
      cardEl.classList.add("wrong-shake");
    }
  }
}

/**
 * 개별 문장의 TTS 발음을 재생합니다.
 * @param {number} senIdx
 * @param {HTMLElement} btnEl
 */
function speakPatternGameSentence(senIdx, btnEl) {
  const senObj = pgStageState.sentences.find((s) => s.senIdx === senIdx);
  if (senObj && typeof speakText === "function") {
    speakText(senObj.enFull, "en-US", btnEl);
  }
}

/**
 * 한글 해석 힌트 표시 여부를 토글합니다.
 */
function togglePatternGameHint() {
  pgShowKoHint = !pgShowKoHint;
  const btn = document.getElementById("pgHintToggleBtn");
  if (btn) {
    btn.textContent = pgShowKoHint ? "💡 한글 힌트 ON" : "🙈 한글 힌트 OFF";
  }
  document.querySelectorAll("#pgSentencesBoard .pg-sen-ko").forEach((el) => {
    el.classList.toggle("hidden-hint", !pgShowKoHint);
  });
}

/**
 * 같은 패턴 내 특정 주제 인덱스로 전환합니다.
 * @param {number} vIdx
 */
function selectPatternGameTopic(vIdx) {
  if (typeof stopTTS === "function") stopTTS();
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations || !pat.variations[vIdx]) return;
  pgCurVarIdx = vIdx;
  startPatternGameStage();
}

/**
 * 다음 주제 스테이지로 이동합니다.
 */
function nextPatternGameTopic() {
  if (typeof stopTTS === "function") stopTTS();
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations || !pat.variations.length) return;
  pgCurVarIdx = (pgCurVarIdx + 1) % pat.variations.length;
  startPatternGameStage();
}

/**
 * 현재 패턴 내에서 무작위 주제로 변경합니다.
 */
function randomPatternGameTopic() {
  if (typeof stopTTS === "function") stopTTS();
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations || pat.variations.length <= 1) return;
  let nextIdx = pgCurVarIdx;
  let tries = 0;
  while (nextIdx === pgCurVarIdx && tries < 10) {
    nextIdx = Math.floor(Math.random() * pat.variations.length);
    tries++;
  }
  pgCurVarIdx = nextIdx;
  startPatternGameStage();
}

/**
 * 전체 6대 패턴 중 무작위 패턴 & 무작위 주제로 즉시 게임을 시작합니다.
 */
function startRandomPatternGame() {
  const items = window.PATTERNS_DATA || [];
  if (!items.length) return;
  const rPatIdx = Math.floor(Math.random() * items.length);
  const vars = items[rPatIdx].variations || [];
  const rVarIdx = vars.length > 0 ? Math.floor(Math.random() * vars.length) : 0;
  openPatternGameStage(rPatIdx, rVarIdx);
}

/**
 * 현재 스테이지를 처음부터 다시 조립하도록 리셋합니다.
 */
function resetCurrentPatternGameStage() {
  if (typeof stopTTS === "function") stopTTS();
  startPatternGameStage();
}

// =============================================================================
// 6. 전역 스코프(Window) 바인딩
// =============================================================================
window.renderPatternGameLobby = renderPatternGameLobby;
window.openPatternGameStage = openPatternGameStage;
window.startPatternGameStage = startPatternGameStage;
window.setActivePatternGameSlot = setActivePatternGameSlot;
window.handlePatternGameBlockClick = handlePatternGameBlockClick;
window.speakPatternGameSentence = speakPatternGameSentence;
window.togglePatternGameHint = togglePatternGameHint;
window.selectPatternGameTopic = selectPatternGameTopic;
window.nextPatternGameTopic = nextPatternGameTopic;
window.randomPatternGameTopic = randomPatternGameTopic;
window.startRandomPatternGame = startRandomPatternGame;
window.resetCurrentPatternGameStage = resetCurrentPatternGameStage;
window.getTotalPatternGameClears = getTotalPatternGameClears;

