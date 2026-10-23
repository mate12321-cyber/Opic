/**
 * @file pattern-game.js
 * @description [모드 4-2] 만능 패턴 게임 훈련 (Pattern Game Training) 컨트롤러
 * - 게임 1 (puzzle): 「🧩 슬롯 조립 퍼즐 (Block / Slot Assembly Game)」
 *   6대 만능 패턴의 고정 뼈대(skeleton)와 주제별 문장(variations)을 비교 분석하여
 *   주제마다 바뀌는 핵심 가변 슬롯(Slot)을 자동으로 추출하고 조립 퍼즐을 생성합니다.
 * - 게임 2 (slotmachine): 「🎰 랜덤 슬롯머신 5초 순발력 챌린지 (Slot Machine Roulette)」
 *   고정된 뼈대 문장에서 슬롯머신 룰렛이 돌아가며 주제가 무작위로 바뀌면,
 *   제한 시간(기본 5초) 안에 해당 주제의 알맞은 영어 슬롯 블록을 순발력 있게 고르는 게임입니다.
 *
 * @author Kim Hyo-sang
 * @version 2.3.0
 */

// =============================================================================
// 1. 만능 패턴 게임 전역 상태 변수 (Game State)
// =============================================================================

const PATTERN_GAME_STORAGE_KEY = "opic_pattern_game_clears_v1";
const SLOT_MACHINE_STORAGE_KEY = "opic_slot_machine_records_v1";

/** @type {'puzzle' | 'slotmachine'} 현재 선택된 게임 서브모드 */
let pgGameMode = "puzzle";

let pgCurPatternIdx = 0; // 현재 선택된 만능 패턴 인덱스 (0 ~ 5)
let pgCurVarIdx = 0; // 현재 선택된 주제 스테이지 인덱스
let pgShowKoHint = true; // 한글 해석 힌트 표시 여부

let pgCombo = 0; // 연속 정답 콤보 (Game 1)
let pgScore = 0; // 누적 점수 (Game 1)
let pgClearsMap = {}; // Game 1 스테이지 클리어 기록 { "pat_01_0": true, ... }
let smRecordsMap = {}; // Game 2 패턴별 최고 기록 { "pat_01": { bestCombo: 8, bestScore: 1200, clears: 2 } }

/**
 * [Game 1] 현재 스테이지의 슬롯 퍼즐 상태
 */
let pgStageState = {
  sentences: [],
  slots: [],
  activeSlotId: null,
  deck: [],
};

/**
 * [Game 2] 랜덤 슬롯머신 5초 챌린지 상태
 */
let smState = {
  totalRounds: 10,
  curRound: 1,
  timeLimitSec: 15, // 기본 15초(표준 실전), 25초(여유), 10초(스피드), 0(무제한)
  remainingMs: 15000,
  timerInterval: null,
  readyInterval: null,
  readyTimeout: null,
  spinTimeout: null,
  nextRoundTimeout: null,
  isSpinning: false,
  isReadyPhase: false, // 3초 문제 읽기 유예 상태
  readyRemainingSec: 3,
  isRoundResolved: false,
  combo: 0,
  maxCombo: 0,
  score: 0,
  correctCount: 0,
  sentenceFilter: "all", // 'all' 또는 0~5 문장 인덱스
  currentQuestion: null, // 현재 라운드 출제 슬롯 정보
  options: [], // 4지선다 보기 배열
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
  try {
    const rawSm = localStorage.getItem(SLOT_MACHINE_STORAGE_KEY);
    if (rawSm) {
      smRecordsMap = JSON.parse(rawSm) || {};
    }
  } catch (e) {
    smRecordsMap = {};
  }
}

function savePatternGameClears() {
  try {
    localStorage.setItem(PATTERN_GAME_STORAGE_KEY, JSON.stringify(pgClearsMap));
  } catch (e) {}
}

function saveSlotMachineRecords() {
  try {
    localStorage.setItem(
      SLOT_MACHINE_STORAGE_KEY,
      JSON.stringify(smRecordsMap),
    );
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
  loadPatternGameClears();
  const puzzleClears = Object.keys(pgClearsMap).filter(
    (k) => pgClearsMap[k],
  ).length;
  const smClears = Object.values(smRecordsMap).reduce(
    (acc, r) => acc + (r && r.clears ? r.clears : 0),
    0,
  );
  return puzzleClears + smClears;
}

// =============================================================================
// 3. 핵심 알고리즘: 뼈대(Skeleton) vs 변형(Variation) 슬롯 자동 추출기
// =============================================================================

function stripLeadingNumber(str) {
  return String(str || "")
    .replace(/^\d+\.\s*/, "")
    .trim();
}

/**
 * 스켈레톤 문장과 실제 주제 문장을 비교해 텍스트 구간과 슬롯 구간 배열을 반환합니다.
 */
function extractSentenceSegments(skelEn, targetEn, siblingEnList, senIdx) {
  const cleanSkel = stripLeadingNumber(skelEn);
  const cleanTarget = stripLeadingNumber(targetEn);

  // 1. 스켈레톤에 [슬롯] 표기가 있는 경우 정규식 그룹 매칭 시도
  const slotMatches = [...cleanSkel.matchAll(/\[([^\]]+)\]/g)];
  if (slotMatches.length > 0) {
    const labels = slotMatches.map((m) => m[1]);
    const staticParts = cleanSkel.split(/\[[^\]]+\]/g);

    const regexParts = [];
    for (let i = 0; i < staticParts.length; i++) {
      regexParts.push(staticParts[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
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
  if (siblingEnList && siblingEnList.length > 1) {
    const targetWords = cleanTarget.split(/\s+/);
    const diffCandidates = siblingEnList
      .map((s) => stripLeadingNumber(s))
      .filter((s) => s && s.toLowerCase() !== cleanTarget.toLowerCase());

    if (diffCandidates.length > 0) {
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

  // 3. 스켈레톤에 [슬롯]이 있었으나 위 매칭에 실패한 경우: 문장 후반부 핵심 구문을 슬롯화
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

  // 4. 고정 뼈대 문장
  return [{ type: "text", text: cleanTarget }];
}

// =============================================================================
// 4. 게임 모드 전환 (Mode 1: Puzzle ↔ Mode 2: Slot Machine)
// =============================================================================

/**
 * 슬롯머신 타이머 및 진행 중인 스핀 애니메이션을 모두 정리합니다.
 */
function stopSlotMachineTimers() {
  if (smState.timerInterval) {
    clearInterval(smState.timerInterval);
    smState.timerInterval = null;
  }
  if (smState.readyInterval) {
    clearInterval(smState.readyInterval);
    smState.readyInterval = null;
  }
  if (smState.readyTimeout) {
    clearTimeout(smState.readyTimeout);
    smState.readyTimeout = null;
  }
  if (smState.spinTimeout) {
    clearTimeout(smState.spinTimeout);
    smState.spinTimeout = null;
  }
  if (smState.nextRoundTimeout) {
    clearTimeout(smState.nextRoundTimeout);
    smState.nextRoundTimeout = null;
  }
  smState.isSpinning = false;
  smState.isReadyPhase = false;
}

/**
 * 게임 서브모드('puzzle' | 'slotmachine')를 전환합니다.
 * @param {'puzzle' | 'slotmachine'} mode
 */
function switchPatternGameMode(mode) {
  if (mode !== "puzzle" && mode !== "slotmachine") return;
  if (typeof stopTTS === "function") stopTTS();
  stopSlotMachineTimers();

  pgGameMode = mode;

  // 로비 탭 활성화 상태 동기화
  const lobbyPuzzleBtn = document.getElementById("pgLobbyTabPuzzle");
  const lobbySmBtn = document.getElementById("pgLobbyTabSlotMachine");
  if (lobbyPuzzleBtn)
    lobbyPuzzleBtn.classList.toggle("active", mode === "puzzle");
  if (lobbySmBtn)
    lobbySmBtn.classList.toggle("active", mode === "slotmachine");

  // 카드 상단 스위처 버튼 동기화
  const cardPuzzleBtn = document.getElementById("pgCardModePuzzleBtn");
  const cardSmBtn = document.getElementById("pgCardModeSlotMachineBtn");
  if (cardPuzzleBtn)
    cardPuzzleBtn.classList.toggle("active", mode === "puzzle");
  if (cardSmBtn)
    cardSmBtn.classList.toggle("active", mode === "slotmachine");

  // 로비 화면이 열려 있다면 스테이지 카드 뱃지 재렌더링
  const lobbyScreen = document.getElementById("patternGameTopicScreen");
  if (lobbyScreen && lobbyScreen.style.display !== "none") {
    renderPatternGameLobby();
  }

  // 플레이 카드 화면이 열려 있다면 해당 모드 뷰로 즉시 전환
  const gameCard = document.getElementById("patternGameCard");
  if (gameCard && gameCard.style.display !== "none") {
    startPatternGameStage();
  }
}

/**
 * 상단 우측 [🎲 랜덤 주제 / 즉시 스핀] 버튼 액션
 */
function randomPatternGameAction() {
  if (pgGameMode === "slotmachine") {
    spinSlotMachineRound();
  } else {
    randomPatternGameTopic();
  }
}

// =============================================================================
// 5. [GAME 1] 슬롯 조립 퍼즐 스테이지 빌더 & 렌더러
// =============================================================================

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

  stageSlots.sort((a, b) => a.senIdx - b.senIdx || a.slotId - b.slotId);

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

  for (let i = distractorPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractorPool[i], distractorPool[j]] = [
      distractorPool[j],
      distractorPool[i],
    ];
  }
  const chosenDistractors = distractorPool.slice(0, 4);

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

/**
 * 만능 패턴 게임 훈련 로비 화면(#patternGameTopicScreen)을 렌더링합니다.
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

  // 로비 모드 탭 상태 동기화
  const lobbyPuzzleBtn = document.getElementById("pgLobbyTabPuzzle");
  const lobbySmBtn = document.getElementById("pgLobbyTabSlotMachine");
  if (lobbyPuzzleBtn)
    lobbyPuzzleBtn.classList.toggle("active", pgGameMode === "puzzle");
  if (lobbySmBtn)
    lobbySmBtn.classList.toggle("active", pgGameMode === "slotmachine");

  const totalClearsBadge = document.getElementById(
    "patternGameTotalClearsBadge",
  );
  if (totalClearsBadge) {
    totalClearsBadge.textContent = `🏆 총 ${getTotalPatternGameClears()}회 클리어`;
  }

  container.innerHTML = items
    .map((pat, idx) => {
      const totalVars = pat.variations ? pat.variations.length : 0;
      const clearedVars = getPatternClearedCount(idx);
      const smRec = smRecordsMap[pat.id] || {
        bestCombo: 0,
        bestScore: 0,
        clears: 0,
      };
      const slotBadge = pat.slotBadge
        ? `<span class="pattern-slot-badge ${pat.slotClass || "slot-step1"}">${safeEscapeHtml(pat.slotBadge)}</span>`
        : "";

      const sampleSkel =
        pat.skeleton && pat.skeleton[0]
          ? stripLeadingNumber(pat.skeleton[0].en)
          : "";

      const progressBadgeHtml =
        pgGameMode === "slotmachine"
          ? `<span class="pattern-combo-badge pg-badge-sm">
               🎰 최고 ${smRec.bestCombo}콤보 · ${smRec.clears}회 완주
             </span>`
          : `<span class="pattern-combo-badge pg-badge-puzzle">
               🧩 ${clearedVars} / ${totalVars} 조립 클리어
             </span>`;

      return `
        <button type="button" class="pattern-select-card" onclick="openPatternGameStage(${idx}, 0)">
          <div class="pattern-select-icon">${pat.icon || "🎮"}</div>
          <div class="pattern-select-body">
            <div class="pattern-select-name-row">
              <span class="pattern-select-name-text">STAGE ${idx + 1}. ${safeEscapeHtml(pat.name)}</span>
              <div class="pattern-badge-group">
                ${slotBadge}
                ${progressBadgeHtml}
              </div>
            </div>
            <div class="pattern-match-summary">
              <span class="pms-icon">🎯</span>
              <span class="pms-text">${safeEscapeHtml(pat.whenToUse || pat.desc)}</span>
            </div>
            <div class="pg-stage-skel-preview">
              🧩 대표 뼈대: ${formatSlotText(sampleSkel)}
            </div>
          </div>
        </button>
      `;
    })
    .join("");
}

/**
 * 특정 패턴 및 주제 인덱스로 게임 화면에 진입합니다.
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
      { patIdx: pgCurPatternIdx, varIdx: pgCurVarIdx, mode: pgGameMode },
      pushHistory,
    );
    return;
  }
}

/**
 * 현재 설정된 게임 모드(puzzle 또는 slotmachine)에 맞춰 스테이지를 시작합니다.
 */
function startPatternGameStage() {
  loadPatternGameClears();
  stopSlotMachineTimers();

  const puzzleView = document.getElementById("pgPuzzleView");
  const smView = document.getElementById("pgSlotMachineView");
  const cardPuzzleBtn = document.getElementById("pgCardModePuzzleBtn");
  const cardSmBtn = document.getElementById("pgCardModeSlotMachineBtn");
  const randomBtn = document.getElementById("pgRandomTopicBtn");

  if (cardPuzzleBtn)
    cardPuzzleBtn.classList.toggle("active", pgGameMode === "puzzle");
  if (cardSmBtn)
    cardSmBtn.classList.toggle("active", pgGameMode === "slotmachine");

  if (pgGameMode === "slotmachine") {
    if (puzzleView) puzzleView.style.display = "none";
    if (smView) smView.style.display = "block";
    if (randomBtn) randomBtn.textContent = "🎰 즉시 스핀";
    startSlotMachineGame();
  } else {
    if (puzzleView) puzzleView.style.display = "block";
    if (smView) smView.style.display = "none";
    if (randomBtn) randomBtn.textContent = "🎲 랜덤 주제";
    buildPatternGameStage();
    renderPatternGameCardUI();
  }
}

function renderPatternGameCardUI() {
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations || !pat.variations[pgCurVarIdx]) return;

  const curVar = pat.variations[pgCurVarIdx];
  const cleanTopic = (curVar.topic || "").replace(/\s*\([^)]*\)/g, "").trim();

  const titleEl = document.getElementById("pgMainTitle");
  if (titleEl) {
    titleEl.innerHTML = `${pat.icon || "🧩"} ${safeEscapeHtml(pat.name)} · 조립 퍼즐`;
  }

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

  renderPatternGameBoardAndDeck();
}

function renderPatternGameBoardAndDeck() {
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations) return;

  const totalSlots = pgStageState.slots.length;
  const filledSlots = pgStageState.slots.filter((s) => s.filled).length;
  const isAllCleared = totalSlots > 0 && filledSlots === totalSlots;

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

    pgStageState.slots.forEach((s) => {
      s.justSnapped = false;
    });
  }

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

function setActivePatternGameSlot(slotId) {
  const slotObj = pgStageState.slots.find((s) => s.slotId === slotId);
  if (!slotObj || slotObj.filled) return;
  pgStageState.activeSlotId = slotId;
  renderPatternGameBoardAndDeck();
}

function handlePatternGameBlockClick(cardIdx) {
  // 만약 현재 모드가 슬롯머신이면 슬롯머신 카드 선택 핸들러로 위임 (키보드 단축키 1~4 호환)
  if (pgGameMode === "slotmachine") {
    handleSlotMachineOptionClick(cardIdx);
    return;
  }

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
    card.isUsed = true;
    activeSlot.filled = true;
    activeSlot.justSnapped = true;

    pgCombo++;
    pgScore += 100 + (pgCombo - 1) * 20;

    const comboBox = document.getElementById("pgHudComboBox");
    if (comboBox) {
      comboBox.classList.remove("combo-pop");
      void comboBox.offsetWidth;
      comboBox.classList.add("combo-pop");
    }

    const senIdx = activeSlot.senIdx;
    const senSlots = pgStageState.slots.filter((s) => s.senIdx === senIdx);
    const isSentenceComplete = senSlots.every((s) => s.filled);
    const senObj = pgStageState.sentences.find((s) => s.senIdx === senIdx);

    if (isSentenceComplete && senObj && typeof speakText === "function") {
      speakText(senObj.enFull, "en-US", null);
    }

    const nextEmpty = pgStageState.slots.find((s) => !s.filled);
    pgStageState.activeSlotId = nextEmpty ? nextEmpty.slotId : null;

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

// =============================================================================
// 6. [GAME 2] 🎰 랜덤 슬롯머신 & 5초 순발력 챌린지 엔진
// =============================================================================

/**
 * 현재 선택된 만능 패턴(pgCurPatternIdx)의 모든 주제에서 출제 가능한 슬롯 문제 풀을 생성합니다.
 */
function buildSlotMachinePool(patIdx, senFilter = "all") {
  const items = window.PATTERNS_DATA || [];
  const pat = items[patIdx];
  if (!pat || !pat.variations) return [];

  const pool = [];

  pat.variations.forEach((v, vIdx) => {
    const cleanTopic = (v.topic || "").replace(/\s*\([^)]*\)/g, "").trim();
    const activeSkel = v.skeleton || pat.skeleton || [];

    v.sentences.forEach((senObj, sIdx) => {
      if (senFilter !== "all" && Number(senFilter) !== sIdx) return;

      const skelObj = activeSkel[sIdx] || { en: senObj.en, ko: senObj.ko };
      const skelEn = typeof skelObj === "object" ? skelObj.en : skelObj;
      const siblingEnList = pat.variations
        .map((otherV) =>
          otherV.sentences && otherV.sentences[sIdx]
            ? otherV.sentences[sIdx].en
            : "",
        )
        .filter(Boolean);

      const segs = extractSentenceSegments(
        skelEn,
        senObj.en,
        siblingEnList,
        sIdx,
      );

      const slotSegIndices = [];
      segs.forEach((sg, idx) => {
        if (sg.type === "slot") slotSegIndices.push(idx);
      });

      slotSegIndices.forEach((targetSegIdx) => {
        const targetSeg = segs[targetSegIdx];
        pool.push({
          vIdx,
          topic: cleanTopic,
          senIdx: sIdx,
          label: targetSeg.label || "핵심 표현",
          answer: targetSeg.text.trim(),
          enFull: stripLeadingNumber(senObj.en),
          koFull: stripLeadingNumber(senObj.ko),
          segments: segs,
          targetSegIdx,
        });
      });
    });
  });

  return pool;
}

/**
 * 슬롯머신 10라운드 새 세션을 시작합니다.
 */
function startSlotMachineGame() {
  stopSlotMachineTimers();
  if (typeof stopTTS === "function") stopTTS();

  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat) return;

  const titleEl = document.getElementById("pgMainTitle");
  if (titleEl) {
    titleEl.innerHTML = `🎰 ${safeEscapeHtml(pat.name)} · 슬롯머신 챌린지`;
  }

  smState.curRound = 1;
  smState.combo = 0;
  smState.maxCombo = 0;
  smState.score = 0;
  smState.correctCount = 0;
  smState.isRoundResolved = false;

  // 제한시간 칩 액티브 상태 동기화
  document.querySelectorAll(".sm-speed-chip").forEach((btn) => {
    btn.classList.toggle(
      "active",
      Number(btn.dataset.sec) === smState.timeLimitSec,
    );
  });

  const cabinetEl = document.getElementById("smCabinet");
  const resultBanner = document.getElementById("smResultBanner");
  if (cabinetEl) cabinetEl.style.display = "block";
  if (resultBanner) resultBanner.style.display = "none";

  renderSlotMachineSentenceFilter();
  updateSlotMachineHud();
  spinSlotMachineRound();
}

/**
 * 타겟 문장 필터 칩(전체 랜덤 / 슬롯이 있는 문장 번호)을 렌더링합니다.
 */
function renderSlotMachineSentenceFilter() {
  const wrap = document.getElementById("smSentenceFilterWrap");
  if (!wrap) return;

  const fullPool = buildSlotMachinePool(pgCurPatternIdx, "all");
  const availableSenIndices = Array.from(
    new Set(fullPool.map((item) => item.senIdx)),
  ).sort((a, b) => a - b);

  // 만약 현재 설정된 문장 필터가 이 패턴에 없으면 'all'로 리셋
  if (
    smState.sentenceFilter !== "all" &&
    !availableSenIndices.includes(Number(smState.sentenceFilter))
  ) {
    smState.sentenceFilter = "all";
  }

  const chips = [
    `<button type="button" class="sm-sen-chip ${smState.sentenceFilter === "all" ? "active" : ""}" onclick="setSlotMachineSentenceFilter('all')">전체 문장</button>`,
    ...availableSenIndices.map(
      (sIdx) =>
        `<button type="button" class="sm-sen-chip ${Number(smState.sentenceFilter) === sIdx ? "active" : ""}" onclick="setSlotMachineSentenceFilter(${sIdx})">${sIdx + 1}번 문장</button>`,
    ),
  ];

  wrap.innerHTML = chips.join("");
}

/**
 * 슬롯머신 제한 시간(5초 / 8초 / 무제한)을 변경합니다.
 * @param {number} sec
 */
function setSlotMachineTimeLimit(sec) {
  smState.timeLimitSec = Number(sec);
  document.querySelectorAll(".sm-speed-chip").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.sec) === smState.timeLimitSec);
  });
  spinSlotMachineRound();
}

/**
 * 슬롯머신 타겟 문장 필터('all' 또는 0~5)를 변경합니다.
 * @param {'all'|number} filterVal
 */
function setSlotMachineSentenceFilter(filterVal) {
  smState.sentenceFilter = filterVal === "all" ? "all" : Number(filterVal);
  renderSlotMachineSentenceFilter();
  spinSlotMachineRound();
}

/**
 * 슬롯머신 룰렛을 회전시켜 새 라운드 문제를 출제합니다.
 */
function spinSlotMachineRound() {
  stopSlotMachineTimers();
  if (typeof stopTTS === "function") stopTTS();

  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat) return;

  let pool = buildSlotMachinePool(pgCurPatternIdx, smState.sentenceFilter);
  if (!pool.length) {
    pool = buildSlotMachinePool(pgCurPatternIdx, "all");
  }
  if (!pool.length) return;

  // 직전 문제와 다른 문제 우선 추첨
  let nextQ = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1 && smState.currentQuestion) {
    let tries = 0;
    while (
      nextQ.vIdx === smState.currentQuestion.vIdx &&
      nextQ.senIdx === smState.currentQuestion.senIdx &&
      nextQ.targetSegIdx === smState.currentQuestion.targetSegIdx &&
      tries < 10
    ) {
      nextQ = pool[Math.floor(Math.random() * pool.length)];
      tries++;
    }
  }
  smState.currentQuestion = nextQ;
  smState.isRoundResolved = false;
  smState.isSpinning = true;

  // 오답 보기(Distractors) 3개 생성 (같은 문장 번호의 다른 주제 슬롯 우선)
  const allPool = buildSlotMachinePool(pgCurPatternIdx, "all");
  const sameSenDistractors = [];
  const otherDistractors = [];
  const normAns = nextQ.answer.toLowerCase();

  allPool.forEach((p) => {
    const normP = p.answer.toLowerCase();
    if (normP === normAns) return;
    if (p.senIdx === nextQ.senIdx) {
      if (!sameSenDistractors.some((d) => d.toLowerCase() === normP)) {
        sameSenDistractors.push(p.answer);
      }
    } else {
      if (!otherDistractors.some((d) => d.toLowerCase() === normP)) {
        otherDistractors.push(p.answer);
      }
    }
  });

  const shuffleArr = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  shuffleArr(sameSenDistractors);
  shuffleArr(otherDistractors);

  const combinedDistractors = [
    ...sameSenDistractors,
    ...otherDistractors,
  ].slice(0, 3);

  const options = shuffleArr([
    { text: nextQ.answer, isCorrect: true },
    ...combinedDistractors.map((d) => ({ text: d, isCorrect: false })),
  ]);
  smState.options = options;

  // 룰렛 회전 연출 (450ms 동안 빠르게 토픽 이름이 바뀌는 애니메이션)
  const reelTopicBox = document.getElementById("smReelTopicBox");
  const reelSlotBox = document.getElementById("smReelSlotBox");
  const reelTopicVal = document.getElementById("smReelTopicValue");
  const reelSlotVal = document.getElementById("smReelSlotValue");
  const statusMsg = document.getElementById("smStatusMsg");

  if (reelTopicBox) reelTopicBox.classList.add("is-spinning");
  if (reelSlotBox) reelSlotBox.classList.add("is-spinning");
  if (statusMsg) {
    statusMsg.textContent = "🎰 슬롯머신 룰렛 회전 중...";
    statusMsg.className = "sm-status-msg";
  }

  let spinTick = 0;
  const spinEffectInterval = setInterval(() => {
    const randItem = pool[spinTick % pool.length];
    if (reelTopicVal && randItem) reelTopicVal.textContent = randItem.topic;
    if (reelSlotVal && randItem)
      reelSlotVal.textContent = `문장 ${randItem.senIdx + 1} · [${randItem.label}]`;
    spinTick++;
  }, 55);

  smState.spinTimeout = setTimeout(() => {
    clearInterval(spinEffectInterval);
    smState.isSpinning = false;
    if (reelTopicBox) reelTopicBox.classList.remove("is-spinning");
    if (reelSlotBox) reelSlotBox.classList.remove("is-spinning");
    if (reelTopicVal) reelTopicVal.textContent = nextQ.topic;
    if (reelSlotVal)
      reelSlotVal.textContent = `문장 ${nextQ.senIdx + 1} · [${nextQ.label}]`;

    renderSlotMachineStageQuestion();
    if (smState.timeLimitSec > 0) {
      startSlotMachineReadyPhase();
    } else {
      startSlotMachineCountdown();
    }
  }, 420);

  updateSlotMachineHud();
}

/**
 * 스핀 정지 후 플레이어가 문제와 빈칸 위치를 여유롭게 파악할 수 있도록
 * 3초간의 READY(문제 읽기 유예) 시간을 제공합니다.
 */
function startSlotMachineReadyPhase() {
  if (smState.timerInterval) clearInterval(smState.timerInterval);
  if (smState.readyInterval) clearInterval(smState.readyInterval);

  smState.isReadyPhase = true;
  smState.readyRemainingSec = 3;

  const timerBar = document.getElementById("smTimerBar");
  const hudTime = document.getElementById("smHudTime");
  const statusMsg = document.getElementById("smStatusMsg");
  const q = smState.currentQuestion;

  if (timerBar) {
    timerBar.className = "sm-timer-bar is-ready";
    timerBar.style.width = "100%";
  }

  if (hudTime) {
    hudTime.innerHTML = `<span class="ready-time-tag">👀 3s</span>`;
  }

  if (statusMsg && q) {
    statusMsg.innerHTML = `<span class="sm-ready-badge">👀 문제 파악 (3초)</span> 👉 <strong>[${safeEscapeHtml(q.topic)}]</strong> 주제의 <strong>[${safeEscapeHtml(q.label)}]</strong> 빈칸을 먼저 확인하세요!`;
    statusMsg.className = "sm-status-msg is-ready-msg";
  }

  smState.readyInterval = setInterval(() => {
    smState.readyRemainingSec--;

    if (smState.readyRemainingSec > 0) {
      if (hudTime) {
        hudTime.innerHTML = `<span class="ready-time-tag">👀 ${smState.readyRemainingSec}s</span>`;
      }
    } else {
      // 3초 파악 시간 완료 -> 본 제한 시간 카운트다운 시작
      clearInterval(smState.readyInterval);
      smState.readyInterval = null;
      smState.isReadyPhase = false;

      if (statusMsg && q) {
        statusMsg.innerHTML = `⚡ <strong>[${safeEscapeHtml(q.topic)}]</strong>에 어울리는 <strong>[${safeEscapeHtml(q.label)}]</strong> 블록을 터치하세요!`;
        statusMsg.className = "sm-status-msg is-go-msg";
      }

      startSlotMachineCountdown();
    }
  }, 1000);
}

/**
 * 슬롯머신 전광판의 타겟 문장과 4지선다 카드를 렌더링합니다.
 */
function renderSlotMachineStageQuestion() {
  const q = smState.currentQuestion;
  if (!q) return;

  const badgeEl = document.getElementById("smSenBadge");
  if (badgeEl) {
    badgeEl.textContent = `문장 ${q.senIdx + 1} 뼈대 · ${q.topic} [${q.label}]`;
  }

  const statusMsg = document.getElementById("smStatusMsg");
  if (statusMsg && !smState.isRoundResolved && !smState.isReadyPhase) {
    statusMsg.innerHTML =
      smState.timeLimitSec > 0
        ? `⚡ <strong>${smState.timeLimitSec}초</strong> 안에 <strong>[${safeEscapeHtml(q.topic)}]</strong>에 맞는 블록을 터치하세요!`
        : `🎯 <strong>[${safeEscapeHtml(q.topic)}]</strong>에 맞는 블록을 선택하세요!`;
    statusMsg.className = "sm-status-msg";
  }

  const listenBtn = document.getElementById("smListenSenBtn");
  if (listenBtn) {
    listenBtn.onclick = () => {
      if (typeof speakText === "function") {
        speakText(q.enFull, "en-US", listenBtn);
      }
    };
  }

  const enDisplay = document.getElementById("smSenEnDisplay");
  if (enDisplay) {
    enDisplay.innerHTML = q.segments
      .map((seg, idx) => {
        if (idx === q.targetSegIdx) {
          if (smState.isRoundResolved) {
            return `<span class="pg-slot-blank is-filled snap-anim">✓ ${safeEscapeHtml(q.answer)}</span>`;
          }
          return `
            <span class="pg-slot-blank is-target sm-target-spotlight" id="smActiveSlotBlank">
              <span class="sm-slot-indicator">👇 채울 빈칸</span>
              <span class="sm-slot-inner">🎯 [ ${safeEscapeHtml(q.label)} ]</span>
            </span>
          `;
        }
        return safeEscapeHtml(seg.text);
      })
      .join("");
  }

  const koDisplay = document.getElementById("smSenKoDisplay");
  if (koDisplay) {
    koDisplay.textContent = q.koFull;
    koDisplay.classList.toggle("hidden-hint", !pgShowKoHint);
  }

  const gridEl = document.getElementById("smOptionsGrid");
  if (gridEl) {
    gridEl.innerHTML = smState.options
      .map((opt, idx) => {
        return `
          <button
            type="button"
            class="sm-option-card"
            id="smOptCard_${idx}"
            onclick="handleSlotMachineOptionClick(${idx})"
          >
            <kbd class="pg-block-key shortcut-key">${idx + 1}</kbd>
            <span class="sm-opt-text">${safeEscapeHtml(opt.text)}</span>
          </button>
        `;
      })
      .join("");
  }
}

/**
 * 실시간 카운트다운 게이지 타이머를 작동시킵니다.
 */
function startSlotMachineCountdown() {
  const timerBar = document.getElementById("smTimerBar");
  const hudTime = document.getElementById("smHudTime");

  if (smState.timeLimitSec <= 0) {
    if (timerBar) {
      timerBar.style.width = "100%";
      timerBar.className = "sm-timer-bar";
    }
    if (hudTime) hudTime.textContent = "♾️";
    return;
  }

  const totalMs = smState.timeLimitSec * 1000;
  smState.remainingMs = totalMs;

  if (timerBar) {
    timerBar.style.width = "100%";
    timerBar.className = "sm-timer-bar";
  }

  smState.timerInterval = setInterval(() => {
    smState.remainingMs = Math.max(0, smState.remainingMs - 50);
    const pct = (smState.remainingMs / totalMs) * 100;

    if (timerBar) {
      timerBar.style.width = `${pct}%`;
      if (pct <= 30) {
        timerBar.className = "sm-timer-bar danger";
      } else if (pct <= 60) {
        timerBar.className = "sm-timer-bar warning";
      } else {
        timerBar.className = "sm-timer-bar";
      }
    }

    if (hudTime) {
      hudTime.textContent = `${(smState.remainingMs / 1000).toFixed(1)}s`;
    }

    if (smState.remainingMs <= 0) {
      handleSlotMachineTimeout();
    }
  }, 50);
}

/**
 * 제한 시간 초과(TIME OUT) 시 처리합니다.
 */
function handleSlotMachineTimeout() {
  stopSlotMachineTimers();
  smState.isRoundResolved = true;
  smState.combo = 0;

  const statusMsg = document.getElementById("smStatusMsg");
  if (statusMsg) {
    statusMsg.textContent = "⏰ TIME OUT! 정답 블록을 확인하세요!";
    statusMsg.className = "sm-status-msg is-timeout";
  }

  // 정답 카드 하이라이트 표시
  smState.options.forEach((opt, idx) => {
    const btn = document.getElementById(`smOptCard_${idx}`);
    if (btn && opt.isCorrect) {
      btn.classList.add("correct-choice");
    }
  });

  renderSlotMachineStageQuestion();
  updateSlotMachineHud();

  smState.nextRoundTimeout = setTimeout(() => {
    advanceSlotMachineRound();
  }, 1500);
}

/**
 * 슬롯머신 4지선다 보기 카드를 선택했을 때 정답 여부를 판정합니다.
 * @param {number} optIdx
 */
function handleSlotMachineOptionClick(optIdx) {
  if (smState.isSpinning || smState.isRoundResolved) return;
  const opt = smState.options[optIdx];
  if (!opt) return;

  const btnEl = document.getElementById(`smOptCard_${optIdx}`);

  if (opt.isCorrect) {
    stopSlotMachineTimers();
    smState.isRoundResolved = true;
    smState.correctCount++;
    smState.combo++;
    if (smState.combo > smState.maxCombo) {
      smState.maxCombo = smState.combo;
    }

    const speedBonus =
      smState.timeLimitSec > 0
        ? Math.round((smState.remainingMs / (smState.timeLimitSec * 1000)) * 50)
        : 20;
    smState.score += 100 + smState.combo * 25 + speedBonus;

    if (btnEl) btnEl.classList.add("correct-choice");

    const comboBox = document.getElementById("smHudComboBox");
    if (comboBox) {
      comboBox.classList.remove("combo-pop");
      void comboBox.offsetWidth;
      comboBox.classList.add("combo-pop");
    }

    const statusMsg = document.getElementById("smStatusMsg");
    if (statusMsg) {
      statusMsg.textContent = `🎉 정답! (+${100 + smState.combo * 25 + speedBonus}점 · ${smState.combo} COMBO!)`;
      statusMsg.className = "sm-status-msg is-correct";
    }

    // 전광판 빈칸에 정답 장착 표시
    const q = smState.currentQuestion;
    const enDisplay = document.getElementById("smSenEnDisplay");
    if (enDisplay && q) {
      enDisplay.innerHTML = q.segments
        .map((seg, idx) => {
          if (idx === q.targetSegIdx) {
            return `<span class="pg-slot-blank is-filled snap-anim">✓ ${safeEscapeHtml(q.answer)}</span>`;
          }
          return safeEscapeHtml(seg.text);
        })
        .join("");
    }

    if (q && typeof speakText === "function") {
      speakText(q.enFull, "en-US", null);
    }

    updateSlotMachineHud();

    smState.nextRoundTimeout = setTimeout(() => {
      advanceSlotMachineRound();
    }, 1250);
  } else {
    // 오답 선택 시: 콤보 초기화 & 해당 카드 흔들림
    smState.combo = 0;
    updateSlotMachineHud();

    if (btnEl) {
      btnEl.classList.remove("wrong-shake");
      void btnEl.offsetWidth;
      btnEl.classList.add("wrong-shake");
    }

    const statusMsg = document.getElementById("smStatusMsg");
    if (statusMsg) {
      statusMsg.textContent = "❌ 다른 주제의 블록입니다! 다시 골라보세요!";
      statusMsg.className = "sm-status-msg is-timeout";
    }
  }
}

/**
 * 다음 라운드로 진행하거나 10라운드 종료 시 결과 리포트를 표시합니다.
 */
function advanceSlotMachineRound() {
  if (smState.curRound >= smState.totalRounds) {
    finishSlotMachineSession();
  } else {
    smState.curRound++;
    spinSlotMachineRound();
  }
}

/**
 * 10라운드 완주 시 최고 기록을 저장하고 결과 배너를 표시합니다.
 */
function finishSlotMachineSession() {
  stopSlotMachineTimers();
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];

  if (pat) {
    const prev = smRecordsMap[pat.id] || {
      bestCombo: 0,
      bestScore: 0,
      clears: 0,
    };
    smRecordsMap[pat.id] = {
      bestCombo: Math.max(prev.bestCombo || 0, smState.maxCombo),
      bestScore: Math.max(prev.bestScore || 0, smState.score),
      clears: (prev.clears || 0) + 1,
    };
    saveSlotMachineRecords();
  }

  if (typeof incrementDailyCount === "function") {
    incrementDailyCount();
  }

  const cabinetEl = document.getElementById("smCabinet");
  const resultBanner = document.getElementById("smResultBanner");
  const resultTitle = document.getElementById("smResultTitle");
  const resultDesc = document.getElementById("smResultDesc");

  if (cabinetEl) cabinetEl.style.display = "none";
  if (resultBanner) resultBanner.style.display = "block";

  if (resultTitle) {
    resultTitle.textContent = `🎰 10 ROUND CLEAR! (${smState.correctCount} / ${smState.totalRounds} 성공)`;
  }
  if (resultDesc) {
    resultDesc.textContent = `최종 점수: ${smState.score}점 · 최고 콤보: ⚡ ${smState.maxCombo} COMBO 달성! 이제 어떤 주제가 나와도 1초 만에 슬롯을 바꿀 수 있어요!`;
  }
}

/**
 * 슬롯머신 HUD(ROUND, TIME, COMBO, SCORE)를 갱신합니다.
 */
function updateSlotMachineHud() {
  const rEl = document.getElementById("smHudRound");
  if (rEl) rEl.textContent = `${smState.curRound} / ${smState.totalRounds}`;

  const cEl = document.getElementById("smHudCombo");
  if (cEl) cEl.textContent = `⚡ ${smState.combo}`;

  const sEl = document.getElementById("smHudScore");
  if (sEl) sEl.textContent = `${smState.score}`;
}

/**
 * 슬롯머신 완료 후 다음 만능 패턴으로 이동합니다.
 */
function nextSlotMachinePattern() {
  const items = window.PATTERNS_DATA || [];
  if (!items.length) return;
  pgCurPatternIdx = (pgCurPatternIdx + 1) % items.length;
  pgCurVarIdx = 0;
  startSlotMachineGame();
}

// =============================================================================
// 7. 공통 유틸리티 및 네비게이션 핸들러
// =============================================================================

function speakPatternGameSentence(senIdx, btnEl) {
  const senObj = pgStageState.sentences.find((s) => s.senIdx === senIdx);
  if (senObj && typeof speakText === "function") {
    speakText(senObj.enFull, "en-US", btnEl);
  }
}

function togglePatternGameHint() {
  pgShowKoHint = !pgShowKoHint;
  const btn = document.getElementById("pgHintToggleBtn");
  if (btn) {
    btn.textContent = pgShowKoHint ? "💡 한글 힌트 ON" : "🙈 한글 힌트 OFF";
  }
  document.querySelectorAll("#pgSentencesBoard .pg-sen-ko").forEach((el) => {
    el.classList.toggle("hidden-hint", !pgShowKoHint);
  });
  const smKo = document.getElementById("smSenKoDisplay");
  if (smKo) {
    smKo.classList.toggle("hidden-hint", !pgShowKoHint);
  }
}

function selectPatternGameTopic(vIdx) {
  if (typeof stopTTS === "function") stopTTS();
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations || !pat.variations[vIdx]) return;
  pgCurVarIdx = vIdx;
  startPatternGameStage();
}

function nextPatternGameTopic() {
  if (pgGameMode === "slotmachine") {
    const resultBanner = document.getElementById("smResultBanner");
    if (resultBanner && resultBanner.style.display !== "none") {
      startSlotMachineGame();
    } else {
      spinSlotMachineRound();
    }
    return;
  }

  if (typeof stopTTS === "function") stopTTS();
  const items = window.PATTERNS_DATA || [];
  const pat = items[pgCurPatternIdx];
  if (!pat || !pat.variations || !pat.variations.length) return;
  pgCurVarIdx = (pgCurVarIdx + 1) % pat.variations.length;
  startPatternGameStage();
}

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

function startRandomPatternGame() {
  const items = window.PATTERNS_DATA || [];
  if (!items.length) return;
  const rPatIdx = Math.floor(Math.random() * items.length);
  const vars = items[rPatIdx].variations || [];
  const rVarIdx = vars.length > 0 ? Math.floor(Math.random() * vars.length) : 0;
  openPatternGameStage(rPatIdx, rVarIdx);
}

function resetCurrentPatternGameStage() {
  if (typeof stopTTS === "function") stopTTS();
  if (pgGameMode === "slotmachine") {
    spinSlotMachineRound();
  } else {
    startPatternGameStage();
  }
}

// =============================================================================
// 8. 전역 스코프(Window) 바인딩
// =============================================================================
window.renderPatternGameLobby = renderPatternGameLobby;
window.openPatternGameStage = openPatternGameStage;
window.startPatternGameStage = startPatternGameStage;
window.switchPatternGameMode = switchPatternGameMode;
window.randomPatternGameAction = randomPatternGameAction;
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
window.startSlotMachineGame = startSlotMachineGame;
window.spinSlotMachineRound = spinSlotMachineRound;
window.setSlotMachineTimeLimit = setSlotMachineTimeLimit;
window.setSlotMachineSentenceFilter = setSlotMachineSentenceFilter;
window.handleSlotMachineOptionClick = handleSlotMachineOptionClick;
window.nextSlotMachinePattern = nextSlotMachinePattern;
window.stopSlotMachineTimers = stopSlotMachineTimers;
