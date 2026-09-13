/**
 * [dashboard.js] DOM 엘리먼트 캐시 및 화면 라우팅, 대시보드 렌더러
 * - 주요 DOM 엘리먼트 참조 객체 (els)
 * - 화면 전환 및 초기화 (hideAllScreens, showHomeScreen, showTopicScreen)
 * - 홈 화면 통계 & 주간 학습 차트 렌더링
 * - 문장 번역 및 문법 퀴즈 주제 선택 화면 렌더링
 *
 * --------------------------------------------------------------------------------
 * 💡 [확장성 및 유지보수 가이드 (Scalability & Customization Guide)]
 * 1. SPA 라우팅 확장 (New Screens & Modes):
 *    - 본 파일의 `navigateTo(screen, params)` 함수는 브라우저 히스토리(popstate)와 1:1 매핑됩니다.
 *    - 추후 '목표 등급 선택 화면(gradeSelector)', '나만의 맞춤 스크립트 작성 화면(customScript)',
 *      '실전 모의고사 15문항 풀세트 화면(mockExam)' 등의 신규 화면 추가 시
 *      `hideAllScreens()` 공통 처리 후 switch 분기에 해당 스크린 렌더링 함수를 연결하십시오.
 *
 * 2. DOM 캐시 및 네임스페이스 격리:
 *    - 현재 전역 `els` 객체에 150개 이상의 DOM 노드가 캐싱되어 있습니다.
 *    - 화면 단위로 `els.dashboard`, `els.practice`, `els.opic` 등으로 그룹화하거나
 *      모듈별 독립 스코프로 점진적 전환하면 유지보수성 및 충돌 방지에 유리합니다.
 * --------------------------------------------------------------------------------
 */

/// 주요 DOM 엘리먼트 캐시 객체 (동적 Proxy 기반: 지연 로딩 및 DOM 무결성 보장)
const elsCache = {};
const els = new Proxy(elsCache, {
  get(target, prop) {
    if (typeof prop === "symbol" || prop === "inspect") return target[prop];
    if (target[prop] && target[prop] instanceof Element) {
      return target[prop];
    }
    // 특수 ID 대체 매핑 지원
    let elem = null;
    if (prop === "copyPatternInput") {
      elem =
        document.getElementById("copyPatternInput") ||
        document.getElementById("patternCopyInput");
    } else if (prop === "fillerScreen") {
      elem =
        document.getElementById("fillerCard") ||
        document.getElementById("fillerScreen");
    } else {
      elem = document.getElementById(prop);
    }
    if (elem) {
      target[prop] = elem;
    }
    return elem;
  },
  set(target, prop, val) {
    target[prop] = val;
    return true;
  },
});

// =============================================================================
// 2. 화면 제어 및 상태 초기화 (Screen Lifecycle & Cleanups)
// =============================================================================

/**
 * 모든 서브 화면 컨테이너(.app-screen)를 일괄 숨기고,
 * 백그라운드에서 동작 중인 오디오/타이머/음성 인식을 초기화합니다.
 *
 * [클린업 대상]:
 * 1. TTS 오디오 즉시 중지 (stopTTS)
 * 2. 말하기 타이머(OPIc, 만능 패턴) 정지
 * 3. 필러 마이크 및 발화 연습 녹음 재생 중지
 * 4. 활성화된 음성인식(Web Speech API) 이벤트 핸들러 해제 및 정지
 *
 * @returns {void}
 */
function hideAllScreens() {
  stopTTS();
  if (typeof stopSpeakingTimer === "function") {
    stopSpeakingTimer();
  }
  if (typeof stopPatternSpeakingTimer === "function") {
    stopPatternSpeakingTimer();
  }
  if (typeof stopFillerMic === "function") {
    stopFillerMic();
  }
  const spAudio = document.getElementById("speechPracticeAudioPlayer");
  if (spAudio) {
    spAudio.pause();
  }
  if (listening && recognition) {
    recognition.onend = null;
    recognition.stop();
    initSpeechRecognition();
    stopListeningUI();
  }
  // 공통 .app-screen 컨테이너 일괄 은닉 및 클래스 초기화
  const screens = document.querySelectorAll(".app-screen");
  if (screens.length > 0) {
    screens.forEach((screen) => {
      screen.style.display = "none";
      screen.classList.remove("show");
    });
  } else {
    // 폴백 (클래스 미적용 시 하위 호환)
    els.homeScreen.style.display = "none";
    els.topicScreen.style.display = "none";
    els.practiceCard.style.display = "none";
    els.doneScreen.classList.remove("show");
    els.wordTopicScreen.style.display = "none";
    els.wordCard.style.display = "none";
    els.wordDoneScreen.classList.remove("show");
    if (els.opicTopicScreen) els.opicTopicScreen.style.display = "none";
    if (els.opicCard) els.opicCard.style.display = "none";
    if (els.opicDoneScreen) {
      els.opicDoneScreen.style.display = "none";
      els.opicDoneScreen.classList.remove("show");
    }
    if (els.patternTopicScreen) els.patternTopicScreen.style.display = "none";
    if (els.patternCard) els.patternCard.style.display = "none";
    if (els.fillerCard) els.fillerCard.style.display = "none";
    if (els.fillerScreen) els.fillerScreen.style.display = "none";
    if (els.speechPracticeCard) els.speechPracticeCard.style.display = "none";
  }
}

// =============================================================================
// 3. 홈 대시보드 통계 & 차트 렌더러 (Home Dashboard Renderer)
// =============================================================================

/**
 * 홈 대시보드 화면을 렌더링합니다.
 *
 * [주요 처리 로직]:
 * 1. 상단 통계 카드 갱신 (오늘 학습량, 이번 주 누적 학습량, 연속 학습일수 Streak)
 * 2. 최근 7일 학습 막대 차트(Bar Chart) 동적 생성 및 오늘 요일 강조 표시
 * 3. 메인 네비게이션 카드들의 서브텍스트 동적 갱신:
 *    - 문장 번역 / 문법 퀴즈 / 실전 OPIc: 진행 중인 경우 '이어하기' 상태 및 잔여 문항 수 표시
 *    - 만능 패턴 / 필러 훈련: 전체 콘텐츠 개수 및 가이드 안내 표시
 *
 * @returns {void}
 */
function renderHomeDashboard() {
  const days = last7Days();
  const today = dailyLog[days[days.length - 1].key] || 0;
  const week = days.reduce((sum, d) => sum + (dailyLog[d.key] || 0), 0);

  // 1. 상단 날짜 및 통계 지표 업데이트
  if (els.homeDate) {
    els.homeDate.textContent = new Date().toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  }
  if (els.statToday) els.statToday.textContent = today;
  if (els.statWeek) els.statWeek.textContent = week;
  if (els.statStreak) els.statStreak.textContent = computeStreak();

  // 2. 최근 7일 학습 막대 차트 렌더링
  if (els.homeChart) {
    const max = Math.max(1, ...days.map((d) => dailyLog[d.key] || 0));
    els.homeChart.innerHTML = days
      .map((d) => {
        const count = dailyLog[d.key] || 0;
        const h = Math.max(3, Math.round((count / max) * 44));
        return `<div class="bar-col">
          <div class="bar${d.isToday ? " today" : ""}" style="height:${h}px"></div>
          <div class="bar-label">${d.label}</div>
        </div>`;
      })
      .join("");
  }

  // 3. 메인 네비게이션 카드 서브텍스트 동적 업데이트
  // 문장 번역 모드
  if (els.navSentenceSub) {
    const sentenceResumable =
      typeof order !== "undefined" && order.length > 0 && cur < order.length;
    els.navSentenceSub.textContent = sentenceResumable
      ? `이어하기 · ${cur}/${order.length}문제 진행 중`
      : `${SENTENCES.length}문장 · ${CATEGORIES.length}개 주제`;
  }

  // 문법 포인트 퀴즈 모드
  if (els.navWordSub) {
    const wordResumable =
      typeof wordOrder !== "undefined" &&
      wordOrder.length > 0 &&
      wordCur < wordOrder.length;
    els.navWordSub.textContent = wordResumable
      ? `이어하기 · ${wordCur}/${wordOrder.length}문제 진행 중`
      : `${WORD_ITEMS.length}문제 · ${WORD_CATEGORIES.length}개 유형`;
  }

  // OPIc 실전 질문 답변 모드
  if (els.navOpicSub) {
    const opicResumable =
      typeof opicOrder !== "undefined" &&
      opicOrder.length > 0 &&
      opicCur < opicOrder.length;
    els.navOpicSub.textContent = opicResumable
      ? `이어하기 · ${opicCur + 1}/${opicOrder.length}번 진행 중`
      : `${OPIC_QUESTIONS.length}개 실전 기출 · 3단 콤보 & 무작위`;
  }

  // 만능 패턴 집중 훈련 모드
  if (els.navPatternSub) {
    els.navPatternSub.textContent = `${PATTERN_ITEMS.length || 6}대 만능 템플릿으로 모든 질문 정복`;
  }

  // 필러 집중 훈련 모드
  if (els.navFillerSub) {
    els.navFillerSub.textContent = `${FILLER_ITEMS.length || 16}개 핵심 필러 · 시점별 가이드 & 실전 연습`;
  }
}

// =============================================================================
// 4. 주제 선택 칩 렌더러 (Topic Filter Chips)
// =============================================================================

/**
 * 문장 번역 연습 주제 선택 카드 및 칩 목록을 렌더링합니다.
 * - 대분류 그룹(GROUPS)별 카드 생성
 * - 그룹 전체 선택/해제 및 개별 칩 토글 지원
 * - 선택된 문장 수 및 주제 개수 실시간 카운트
 *
 * @returns {void}
 */
function renderChips() {
  els.topicChips.innerHTML = "";

  const isAllSelected =
    selectedCats.size === CATEGORIES.length && CATEGORIES.length > 0;
  if (els.allTopicToggleBtn) {
    els.allTopicToggleBtn.textContent = isAllSelected
      ? "전체 해제"
      : "전체 선택";
    els.allTopicToggleBtn.onclick = () => {
      selectedCats = isAllSelected ? new Set() : new Set(CATEGORIES);
      renderChips();
    };
  }

  Object.entries(GROUPS).forEach(([groupName, cats]) => {
    const groupCard = document.createElement("div");
    groupCard.className = "topic-group-card";

    const groupHead = document.createElement("div");
    groupHead.className = "topic-group-head";

    const allInGroup = cats.every((c) => selectedCats.has(c));

    const titleSpan = document.createElement("span");
    titleSpan.className = "topic-group-title";
    titleSpan.textContent = groupName;

    const groupToggle = document.createElement("button");
    groupToggle.type = "button";
    groupToggle.className = "topic-group-toggle";
    groupToggle.textContent = allInGroup ? "그룹 해제" : "그룹 선택";
    groupToggle.onclick = () => {
      if (allInGroup) {
        cats.forEach((c) => selectedCats.delete(c));
      } else {
        cats.forEach((c) => selectedCats.add(c));
      }
      renderChips();
    };

    groupHead.appendChild(titleSpan);
    groupHead.appendChild(groupToggle);
    groupCard.appendChild(groupHead);

    const chipGrid = document.createElement("div");
    chipGrid.className = "topic-group-chips";
    cats.forEach((cat) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (selectedCats.has(cat) ? " active" : "");
      chip.textContent = cat;
      chip.onclick = () => {
        if (selectedCats.has(cat)) selectedCats.delete(cat);
        else selectedCats.add(cat);
        renderChips();
      };
      chipGrid.appendChild(chip);
    });

    groupCard.appendChild(chipGrid);
    els.topicChips.appendChild(groupCard);
  });

  const count = SENTENCES.filter((s) => selectedCats.has(s.cat)).length;
  els.topicCount.textContent = selectedCats.size
    ? `(${count}문장 · ${selectedCats.size}개 주제)`
    : "(주제를 선택하세요)";
  els.startBtn.disabled = selectedCats.size === 0;
  els.startBtn.style.opacity = selectedCats.size === 0 ? ".45" : "1";
  els.startBtn.style.cursor =
    selectedCats.size === 0 ? "not-allowed" : "pointer";
}

// =============================================================================
// 5. SPA 브라우저 히스토리 라우팅 (Single Page App Router)
// =============================================================================

let isNavigatingHistory = false;

/**
 * SPA 화면 전환 및 브라우저 세션 히스토리(pushState)를 관리합니다.
 *
 * [동작 원리]:
 * 1. pushHistory가 true이고 히스토리 탐색 중이 아닐 경우, window.history.pushState 실행
 * 2. 현재 열려 있는 모든 화면과 백그라운드 오디오를 hideAllScreens()로 일괄 정리
 * 3. 요청된 screen 키에 해당하는 DOM 컨테이너를 display/show 처리하고 해당 화면 렌더러 호출
 * 4. 페이지 상단(top: 0)으로 부드러운 스크롤 이동
 *
 * @param {string} screen - 전환할 대상 화면 식별자 ('home' | 'topic' | 'practice' | 'opicTopic' | 등)
 * @param {Object} [params={}] - 화면 전환 시 전달할 부가 파라미터 (예: { idx: 2 }, { targetIdx: 0 })
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 스택에 추가할지 여부
 * @returns {void}
 */
function navigateTo(screen, params = {}, pushHistory = true) {
  if (pushHistory && !isNavigatingHistory) {
    const currentState = window.history.state;
    const isSame =
      currentState &&
      currentState.screen === screen &&
      JSON.stringify(currentState.params || {}) ===
        JSON.stringify(params || {});
    if (!isSame) {
      window.history.pushState({ screen, params }, "", "");
    }
  }

  hideAllScreens();

  switch (screen) {
    case "home":
      els.homeScreen.style.display = "flex";
      renderHomeDashboard();
      break;

    case "topic":
      els.topicScreen.style.display = "block";
      renderChips();
      break;

    case "practice":
      els.practiceCard.style.display = "block";
      if (typeof renderCard === "function") renderCard();
      break;

    case "done":
      els.doneScreen.classList.add("show");
      break;

    case "wordTopic":
      els.wordTopicScreen.style.display = "block";
      renderWordChips();
      break;

    case "wordCard":
      els.wordCard.style.display = "block";
      if (typeof renderWordCard === "function") renderWordCard();
      break;

    case "wordDone":
      els.wordDoneScreen.classList.add("show");
      break;

    case "opicTopic":
      if (els.opicTopicScreen) {
        els.opicTopicScreen.style.display = "block";
        if (typeof renderOpicChips === "function") renderOpicChips();
      }
      break;

    case "opicCard":
      if (els.opicCard) {
        els.opicCard.style.display = "block";
        if (typeof renderOpicCard === "function") renderOpicCard();
      }
      break;

    case "opicDone":
      if (els.opicDoneScreen) {
        els.opicDoneScreen.style.display = "block";
        els.opicDoneScreen.classList.add("show");
      }
      break;

    case "patternTopic":
      if (els.patternTopicScreen) {
        els.patternTopicScreen.style.display = "block";
        if (typeof renderPatternTopics === "function") renderPatternTopics();
      }
      break;

    case "patternCard":
      if (els.patternCard) {
        els.patternCard.style.display = "block";
        if (
          params &&
          typeof params.idx === "number" &&
          typeof patternCur !== "undefined"
        ) {
          patternCur = params.idx;
          if (typeof patternVarCur !== "undefined") patternVarCur = 0;
        }
        if (typeof renderPatternCard === "function") renderPatternCard();
      }
      break;

    case "filler":
      const fCard = document.getElementById("fillerCard");
      if (fCard) {
        fCard.style.display = "block";
        if (
          params &&
          typeof params.targetIdx === "number" &&
          typeof fillerCur !== "undefined"
        ) {
          fillerCur = params.targetIdx;
        }
        if (typeof renderFillerCard === "function") renderFillerCard();
      }
      break;

    case "speechPractice":
      if (typeof showSpeechPracticeScreen === "function") {
        showSpeechPracticeScreen(false);
      } else if (els.speechPracticeCard) {
        els.speechPracticeCard.style.display = "block";
        els.speechPracticeCard.classList.add("show");
      }
      break;

    default:
      els.homeScreen.style.display = "flex";
      renderHomeDashboard();
      break;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 브라우저 뒤로가기 / 앞으로가기 popstate 이벤트 리스너
window.addEventListener("popstate", (event) => {
  isNavigatingHistory = true;
  try {
    if (event.state && event.state.screen) {
      navigateTo(event.state.screen, event.state.params || {}, false);
    } else {
      navigateTo("home", {}, false);
    }
  } finally {
    isNavigatingHistory = false;
  }
});

// =============================================================================
// 6. 화면 이동 단축 헬퍼 함수 (Navigation Helper Functions)
// =============================================================================

/**
 * 문장 번역 주제 선택 화면으로 이동합니다.
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 기록 여부
 */
function showTopicScreen(pushHistory = true) {
  navigateTo("topic", {}, pushHistory);
}

/**
 * 문법 포인트 퀴즈 유형 선택 화면으로 이동합니다.
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 기록 여부
 */
function showWordTopicScreen(pushHistory = true) {
  navigateTo("wordTopic", {}, pushHistory);
}

/**
 * OPIc 실전 질문 카테고리 선택 화면으로 이동합니다.
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 기록 여부
 */
function showOpicTopicScreen(pushHistory = true) {
  navigateTo("opicTopic", {}, pushHistory);
}

/**
 * 만능 패턴 6대 템플릿 목록 화면으로 이동합니다.
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 기록 여부
 */
function showPatternTopics(pushHistory = true) {
  navigateTo("patternTopic", {}, pushHistory);
}

/**
 * 특정 필러(Filler) 집중 훈련 화면으로 이동합니다.
 * @param {number} [targetIdx=0] - 대상 필러 인덱스 (0 ~ 15)
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 기록 여부
 */
function showFillerScreen(targetIdx = 0, pushHistory = true) {
  navigateTo("filler", { targetIdx }, pushHistory);
}

/**
 * 홈 대시보드 메인 화면으로 이동합니다.
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 기록 여부
 */
function showHomeScreen(pushHistory = true) {
  navigateTo("home", {}, pushHistory);
}

/**
 * 자유 발화 연습 화면으로 이동합니다.
 * @param {boolean} [pushHistory=true] - 브라우저 히스토리 기록 여부
 */
function showSpeechPractice(pushHistory = true) {
  navigateTo("speechPractice", {}, pushHistory);
}

// =============================================================================
// 7. 전역 스코프 등록 (Global Window Exports)
// =============================================================================
window.navigateTo = navigateTo;
window.showHomeScreen = showHomeScreen;
window.showTopicScreen = showTopicScreen;
window.showWordTopicScreen = showWordTopicScreen;
window.showOpicTopicScreen = showOpicTopicScreen;
window.showPatternTopics = showPatternTopics;
window.showFillerScreen = showFillerScreen;
window.showSpeechPractice = showSpeechPractice;
window.renderHomeDashboard = renderHomeDashboard;
