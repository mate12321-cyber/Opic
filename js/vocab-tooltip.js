/**
 * [vocab-tooltip.js] 영어 문장 단어/표현 드래그 & 더블클릭/모바일 터치 인라인 번역 툴팁 시스템
 * - 429 Rate Limit 방지 및 100% 안정성 보장:
 *   1. Tier 1: OPIc & 기초 영단어 내장 사전 (네트워크 요청 0회, 0ms 즉각 반환)
 *   2. Tier 2: MyMemory 정식 오픈 번역 API (무제한급 안정성)
 *   3. Tier 3: Google Translate API (429 발생 시 자동 쿨다운 및 MyMemory 우회)
 * - Android / iOS 모바일 최적화 (더블탭 확대 방지, 핀치 줌 유지, 롱프레스 햅틱 및 OS 메뉴 방어)
 * - L1 메모리 캐시 + L2 LocalStorage 캐시
 * - Web Speech API 연동 발음 재생 및 내 단어장 저장 지원
 */

(function () {
  const VOCAB_CACHE_KEY = "ko-en-opic-vocab-cache";
  const SAVED_WORDS_KEY = "ko-en-opic-saved-words";
  const memCache = new Map(); // L1 초고속 인메모리 캐시
  let googleCooldownUntil = 0; // Google API 429 차단 시 쿨다운 타임스탬프

  // 📖 Tier 1: OPIc 빈출 및 기초 영단어 내장 딕셔너리 (네트워크 0회, 429 원천 차단)
  const BUILTIN_DICT = {
    best: { meaning: "가장 좋은, 최고의", posList: [{ pos: "형용사", meanings: ["최고의", "가장 좋은", "으뜸가는"] }, { pos: "명사", meanings: ["최선", "최고"] }] },
    better: { meaning: "더 좋은, 더 나은", posList: [{ pos: "형용사", meanings: ["더 좋은", "호전된"] }] },
    good: { meaning: "좋은, 훌륭한", posList: [{ pos: "형용사", meanings: ["좋은", "착한", "적절한"] }] },
    give: { meaning: "주다, 제공하다", posList: [{ pos: "동사", meanings: ["주다", "제공하다", "넘겨주다"] }] },
    gives: { meaning: "주다 (3인칭 단수)", posList: [{ pos: "동사", meanings: ["주다", "제공하다"] }] },
    given: { meaning: "주어진, 주입된", posList: [{ pos: "형용사", meanings: ["주어진", "소정의"] }] },
    take: { meaning: "가지다, 데려가다, (시간이) 걸리다", posList: [{ pos: "동사", meanings: ["취하다", "데려가다", "받아들이다"] }] },
    takes: { meaning: "걸리다, 가지다", posList: [{ pos: "동사", meanings: ["걸리다", "가지다"] }] },
    taking: { meaning: "가져가는 것, 수령", posList: [{ pos: "동사", meanings: ["가져가기", "복용하기"] }] },
    work: { meaning: "일하다, 작동하다, 직장", posList: [{ pos: "동사", meanings: ["일하다", "작동하다"] }, { pos: "명사", meanings: ["일", "직장", "업무"] }] },
    working: { meaning: "근무하는, 일하는", posList: [{ pos: "동사", meanings: ["일하는 중"] }, { pos: "형용사", meanings: ["근무의", "효과적인"] }] },
    shift: { meaning: "근무 조, 교대, 이동", posList: [{ pos: "명사", meanings: ["교대 근무", "변화", "전환"] }] },
    shifts: { meaning: "교대근무들", posList: [{ pos: "명사", meanings: ["교대 근무조"] }] },
    rotating: { meaning: "교대하는, 회전하는", posList: [{ pos: "형용사", meanings: ["순환하는", "교대하는"] }] },
    company: { meaning: "회사, 동료, 함께 있음", posList: [{ pos: "명사", meanings: ["회사", "동료", "친구"] }] },
    manage: { meaning: "관리하다, 경영하다", posList: [{ pos: "동사", meanings: ["관리하다", "다루다", "어떻게든 해내다"] }] },
    managing: { meaning: "관리하는 것", posList: [{ pos: "동사", meanings: ["관리하기", "운영하기"] }] },
    equipment: { meaning: "장비, 설비, 기구", posList: [{ pos: "명사", meanings: ["장비", "설비", "기기"] }] },
    electrical: { meaning: "전기의, 전열의", posList: [{ pos: "형용사", meanings: ["전기의", "전기 공학의"] }] },
    prefer: { meaning: "선호하다, 더 좋아하다", posList: [{ pos: "동사", meanings: ["더 좋아하다", "선호하다"] }] },
    usually: { meaning: "보통, 대개, 평소에", posList: [{ pos: "부사", meanings: ["보통", "대체로", "늘"] }] },
    often: { meaning: "자주, 종종", posList: [{ pos: "부사", meanings: ["자주", "흔히", "종종"] }] },
    always: { meaning: "항상, 언제나", posList: [{ pos: "부사", meanings: ["항상", "늘", "언제나"] }] },
    sometimes: { meaning: "때때로, 가끔", posList: [{ pos: "부사", meanings: ["때때로", "가끔"] }] },
    rarely: { meaning: "드물게, 거의 ~않다", posList: [{ pos: "부사", meanings: ["드물게", "좀처럼 ~않는"] }] },
    never: { meaning: "결코 ~않다, 전혀 없다", posList: [{ pos: "부사", meanings: ["결코 ~않다", "전혀"] }] },
    favorite: { meaning: "가장 좋아하는, 마음에 드는", posList: [{ pos: "형용사", meanings: ["가장 좋아하는"] }, { pos: "명사", meanings: ["인기 있는 사람/물건"] }] },
    because: { meaning: "~때문에, 왜냐하면", posList: [{ pos: "접속사", meanings: ["~때문에", "왜냐하면"] }] },
    although: { meaning: "비록 ~일지라도", posList: [{ pos: "접속사", meanings: ["비록 ~이지만", "~에도 불구하고"] }] },
    however: { meaning: "그러나, 하지만", posList: [{ pos: "부사", meanings: ["그러나", "그렇지만"] }] },
    recommend: { meaning: "추천하다, 권하다", posList: [{ pos: "동사", meanings: ["추천하다", "권고하다"] }] },
    experience: { meaning: "경험, 체험, 겪다", posList: [{ pos: "명사", meanings: ["경험", "체험"] }, { pos: "동사", meanings: ["경험하다", "겪다"] }] },
    memorable: { meaning: "기억에 남는, 인상적인", posList: [{ pos: "형용사", meanings: ["기억할 만한", "인상 깊은"] }] },
    delicious: { meaning: "맛있는, 아주 좋은", posList: [{ pos: "형용사", meanings: ["맛있는", "향긋한"] }] },
    travel: { meaning: "여행하다, 이동하다, 여행", posList: [{ pos: "동사", meanings: ["여행하다", "이동하다"] }, { pos: "명사", meanings: ["여행", "출장"] }] },
    trip: { meaning: "여행, 나들이, 걸려 넘어지다", posList: [{ pos: "명사", meanings: ["여행", "이동"] }] },
    weekend: { meaning: "주말", posList: [{ pos: "명사", meanings: ["주말", "토일요일"] }] },
    weekends: { meaning: "주말마다", posList: [{ pos: "명사", meanings: ["주말마다"] }] },
    holiday: { meaning: "휴일, 명절, 휴가", posList: [{ pos: "명사", meanings: ["휴일", "공휴일", "휴가"] }] },
    family: { meaning: "가족, 가문", posList: [{ pos: "명사", meanings: ["가족", "식구"] }] },
    friend: { meaning: "친구, 벗", posList: [{ pos: "명사", meanings: ["친구", "동료"] }] },
    friends: { meaning: "친구들", posList: [{ pos: "명사", meanings: ["친구들"] }] },
    movie: { meaning: "영화", posList: [{ pos: "명사", meanings: ["영화", "필름"] }] },
    movies: { meaning: "영화(감상)", posList: [{ pos: "명사", meanings: ["영화들"] }] },
    park: { meaning: "공원, 주차하다", posList: [{ pos: "명사", meanings: ["공원", "유원지"] }, { pos: "동사", meanings: ["주차하다"] }] },
    coffee: { meaning: "커피", posList: [{ pos: "명사", meanings: ["커피", "원두"] }] },
    relax: { meaning: "휴식을 취하다, 긴장을 풀다", posList: [{ pos: "동사", meanings: ["쉬다", "안정을 취하다"] }] },
    weather: { meaning: "날씨, 기상", posList: [{ pos: "명사", meanings: ["날씨", "기후"] }] },
    season: { meaning: "계절, 시즌", posList: [{ pos: "명사", meanings: ["계절", "시기"] }] },
    convenient: { meaning: "편리한, 간편한", posList: [{ pos: "형용사", meanings: ["편리한", "가까운", "알맞은"] }] },
    comfortable: { meaning: "편안한, 쾌적한", posList: [{ pos: "형용사", meanings: ["편안한", "안락한"] }] },
    popular: { meaning: "인기 있는, 대중적인", posList: [{ pos: "형용사", meanings: ["인기 있는", "유명한"] }] },
    important: { meaning: "중요한, 중대한", posList: [{ pos: "형용사", meanings: ["중요한", "유력한"] }] },
    special: { meaning: "특별한, 특수한", posList: [{ pos: "형용사", meanings: ["특별한", "특급의"] }] },
    place: { meaning: "장소, 곳, 두다", posList: [{ pos: "명사", meanings: ["장소", "위치", "곳"] }, { pos: "동사", meanings: ["놓다", "배치하다"] }] },
    routine: { meaning: "일상, 루틴, 규칙적인 일", posList: [{ pos: "명사", meanings: ["일상적인 일", "판에 박힌 일"] }] },
    around: { meaning: "주위에, 약, 대략", posList: [{ pos: "전치사", meanings: ["~주위에", "~대략", "~쯤"] }] },
    almost: { meaning: "거의, 하마터면", posList: [{ pos: "부사", meanings: ["거의", "대부분"] }] },
    together: { meaning: "함께, 같이", posList: [{ pos: "부사", meanings: ["함께", "동시에"] }] },
    especially: { meaning: "특히, 특별히", posList: [{ pos: "부사", meanings: ["특히", "각별히"] }] },
    recently: { meaning: "최근에, 요즈음", posList: [{ pos: "부사", meanings: ["최근에", "얼마 전에"] }] },
    lately: { meaning: "최근에, 요새", posList: [{ pos: "부사", meanings: ["최근에", "요즈음"] }] },
    usually: { meaning: "보통, 대개", posList: [{ pos: "부사", meanings: ["보통", "평소에"] }] },
    start: { meaning: "시작하다, 출발하다", posList: [{ pos: "동사", meanings: ["시작하다", "착수하다"] }] },
    finish: { meaning: "끝내다, 마치다", posList: [{ pos: "동사", meanings: ["끝마치다", "완료하다"] }] },
    enjoy: { meaning: "즐기다, 누리다", posList: [{ pos: "동사", meanings: ["즐기다", "만끽하다"] }] },
    listen: { meaning: "듣다, 귀를 기울이다", posList: [{ pos: "동사", meanings: ["듣다", "청취하다"] }] },
    watch: { meaning: "보다, 지켜보다, 시계", posList: [{ pos: "동사", meanings: ["보다", "관람하다"] }] },
    order: { meaning: "주문하다, 명령하다, 순서", posList: [{ pos: "동사", meanings: ["주문하다"] }, { pos: "명사", meanings: ["주문", "순서"] }] }
  };

  let tooltipEl = null;
  let currentTargetWord = "";
  let currentWordData = null;
  let isMouseInsideTooltip = false;
  let selectionDebounceTimer = null;

  // 모바일 터치 제스처 관리 변수
  let longPressTimer = null;
  let touchStartPos = null;
  let isLongPressTriggered = false;
  let lastTouchEndTime = 0;
  let lastTouchPoint = null;
  let lastShownTime = 0;

  // HTML 이스케이프 유틸
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // L2 로컬 스토리지 캐시 유틸
  function getVocabCache() {
    try {
      return JSON.parse(localStorage.getItem(VOCAB_CACHE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveVocabCache(key, data) {
    try {
      memCache.set(key, data);
      const cache = getVocabCache();
      cache[key] = data;
      const keys = Object.keys(cache);
      if (keys.length > 500) {
        keys.slice(0, 100).forEach((k) => delete cache[k]);
      }
      localStorage.setItem(VOCAB_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
  }

  // 초기 기동 시 L2 캐시를 L1 메모리에 워밍업
  try {
    const l2 = getVocabCache();
    for (const [k, v] of Object.entries(l2)) {
      memCache.set(k, v);
    }
  } catch (e) {}

  // 저장된 단어장 유틸
  function getSavedWords() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_WORDS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function isWordSaved(word) {
    if (!word) return false;
    const list = getSavedWords();
    return list.some((item) => item.word.toLowerCase() === word.toLowerCase());
  }

  function toggleSaveWord(wordData) {
    if (!wordData || !wordData.word) return false;
    let list = getSavedWords();
    const idx = list.findIndex(
      (item) => item.word.toLowerCase() === wordData.word.toLowerCase(),
    );
    let saved = false;
    if (idx >= 0) {
      list.splice(idx, 1);
      saved = false;
    } else {
      list.unshift({
        word: wordData.word,
        meaning: wordData.meaning,
        posList: wordData.posList || [],
        date: new Date().toISOString(),
      });
      saved = true;
    }
    try {
      localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(list));
    } catch (e) {}
    return saved;
  }

  // 툴팁 DOM 생성
  function createTooltipDOM() {
    if (tooltipEl && document.body.contains(tooltipEl)) {
      return tooltipEl;
    }

    const existing = document.getElementById("vocabTooltip");
    if (existing) {
      tooltipEl = existing;
      return tooltipEl;
    }

    tooltipEl = document.createElement("div");
    tooltipEl.id = "vocabTooltip";
    tooltipEl.className = "vocab-tooltip";
    tooltipEl.innerHTML = `
      <div class="vocab-tooltip-arrow" id="vocabTooltipArrow"></div>
      <div class="vocab-header">
        <div class="vocab-word-box">
          <span class="vocab-word" id="vocabWordText"></span>
          <span class="vocab-phonetic" id="vocabPhoneticText"></span>
        </div>
        <div class="vocab-actions">
          <button type="button" class="vocab-btn speak" id="vocabSpeakBtn" title="발음 듣기">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
          <button type="button" class="vocab-btn star" id="vocabStarBtn" title="단어장에 저장">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
          <button type="button" class="vocab-btn close" id="vocabCloseBtn" title="닫기">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="vocab-body" id="vocabBody">
        <div class="vocab-loading">
          <div class="vocab-spinner"></div>
          <span>뜻 검색 중...</span>
        </div>
      </div>
      <div class="vocab-footer">
        <span style="color: var(--text-faint, #94a3b8); font-size: 0.75rem;">사전 더보기</span>
        <div class="vocab-external-links">
          <a href="#" target="_blank" rel="noopener noreferrer" class="vocab-link" id="vocabGoogleLink">Google</a>
          <a href="#" target="_blank" rel="noopener noreferrer" class="vocab-link" id="vocabNaverLink">Naver 사전</a>
        </div>
      </div>
      <div class="vocab-toast" id="vocabToast"></div>
    `;

    document.body.appendChild(tooltipEl);

    // 이벤트 리스너 바인딩 (PC & 모바일 터치 대응)
    tooltipEl.addEventListener("mouseenter", () => {
      isMouseInsideTooltip = true;
    });
    tooltipEl.addEventListener("mouseleave", () => {
      isMouseInsideTooltip = false;
    });
    tooltipEl.addEventListener("touchstart", (e) => {
      e.stopPropagation();
      isMouseInsideTooltip = true;
    }, { passive: true });
    tooltipEl.addEventListener("touchend", () => {
      setTimeout(() => { isMouseInsideTooltip = false; }, 300);
    }, { passive: true });

    document.getElementById("vocabCloseBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      hideTooltip();
    });

    document.getElementById("vocabSpeakBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentTargetWord) {
        if (typeof speakText === "function") {
          speakText(currentTargetWord, "en-US");
        } else if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(currentTargetWord);
          u.lang = "en-US";
          window.speechSynthesis.speak(u);
        }
      }
    });

    const starBtn = document.getElementById("vocabStarBtn");
    starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!currentWordData) return;
      const isSaved = toggleSaveWord(currentWordData);
      updateStarBtnUI(isSaved);
      showToast(isSaved ? "⭐ 단어장에 저장되었어요!" : "단어장에서 삭제되었어요.");
    });

    return tooltipEl;
  }

  function showToast(msg) {
    const toast = document.getElementById("vocabToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 1600);
  }

  function updateStarBtnUI(isSaved) {
    const starBtn = document.getElementById("vocabStarBtn");
    if (!starBtn) return;
    if (isSaved) {
      starBtn.classList.add("saved");
      starBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      `;
    } else {
      starBtn.classList.remove("saved");
      starBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      `;
    }
  }

  // 툴팁 위치 계산 및 배치
  function positionTooltip(rect) {
    if (!tooltipEl) createTooltipDOM();

    const isMobile = window.innerWidth <= 600;
    const tooltipWidth = Math.min(290, window.innerWidth - 20);
    tooltipEl.style.width = `${tooltipWidth}px`;

    const targetCenterX = rect.left + rect.width / 2;
    let left = targetCenterX - tooltipWidth / 2;

    // 좌우 화면 경계 여백 보정 (최소 10px)
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    const arrowEl = document.getElementById("vocabTooltipArrow");
    const arrowLeft = Math.max(16, Math.min(tooltipWidth - 16, targetCenterX - left));

    if (arrowEl) {
      arrowEl.style.left = `${arrowLeft - 5}px`;
    }

    const approxHeight = 160;
    let top = 0;
    let placement = "top";

    if (isMobile) {
      // 📱 모바일: OS 복사/검색 바는 단어 위쪽에 뜨므로, 우리 툴팁은 단어 아래쪽에 우선 배치하여 겹침 100% 방지
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow > approxHeight + 20) {
        top = rect.bottom + 10;
        placement = "bottom";
      } else {
        top = Math.max(10, rect.top - approxHeight - 12);
        placement = "top";
      }
    } else {
      // 💻 PC: 단어 위쪽에 우선 배치
      if (rect.top - approxHeight - 12 > 10) {
        top = rect.top - approxHeight - 12;
        placement = "top";
      } else {
        top = rect.bottom + 10;
        placement = "bottom";
      }
    }

    tooltipEl.setAttribute("data-placement", placement);
    tooltipEl.style.left = `${Math.round(left)}px`;
    tooltipEl.style.top = `${Math.round(top)}px`;
    tooltipEl.classList.add("show");
  }

  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.classList.remove("show");
      currentTargetWord = "";
      currentWordData = null;
    }
  }

  // 다중 Fallback 번역 & 사전 엔진 (429 Rate Limit 방지)
  async function fetchWordDetails(queryText) {
    const key = queryText.toLowerCase().trim();

    // 1. Tier 1: 내장 딕셔너리 우선 검색 (네트워크 0회, 0ms 반환)
    if (BUILTIN_DICT[key]) {
      const builtin = BUILTIN_DICT[key];
      return {
        word: queryText,
        meaning: builtin.meaning,
        posList: builtin.posList || [],
      };
    }

    let mainMeaning = "";
    let posList = [];
    const now = Date.now();

    // 2. Tier 2: Google Translate API (쿨다운이 아닐 때만 시도)
    if (now > googleCooldownUntil) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const url =
          "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&hl=ko&dt=t&dt=bd&q=" +
          encodeURIComponent(queryText);
        
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.status === 429) {
          // 429 감지 시 3분간 Google API 호출 중단 및 MyMemory로 전환
          googleCooldownUntil = Date.now() + 3 * 60 * 1000;
        } else if (res.ok) {
          const data = await res.json();
          if (data && data[0]) {
            mainMeaning = data[0].map((chunk) => chunk[0]).join("").trim();
          }
          if (data && data[1] && Array.isArray(data[1])) {
            posList = data[1].slice(0, 3).map((item) => ({
              pos: item[0] || "",
              meanings: (item[1] || []).slice(0, 4),
            }));
          }
        }
      } catch (e) {
        // 네트워크 타임아웃 또는 CORS 차단 시 조용히 Fallback
      }
    }

    // 3. Tier 3: MyMemory API Fallback (429 영향 없음)
    if (!mainMeaning) {
      try {
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(queryText)}&langpair=en|ko`;
        const res = await fetch(myMemoryUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.responseData && data.responseData.translatedText) {
            mainMeaning = data.responseData.translatedText.trim();
          }
        }
      } catch (e) {}
    }

    return {
      word: queryText,
      meaning: mainMeaning || "한국어 뜻을 찾지 못했습니다.",
      posList: posList,
    };
  }

  // 툴팁 렌더링 헬퍼
  function renderBodyContent(data) {
    const bodyEl = document.getElementById("vocabBody");
    if (!bodyEl) return;

    let html = `
      <div class="vocab-meaning-main">
        ${escapeHtml(data.meaning || "뜻 검색 중...")}
      </div>
    `;

    if (data.posList && data.posList.length > 0) {
      html += `<div class="vocab-dict-def">`;
      data.posList.forEach((item) => {
        html += `
          <div style="margin-top: 4px; line-height: 1.4;">
            <span class="vocab-tag">${escapeHtml(item.pos)}</span>
            <span style="color: var(--text-body, #334155); font-size: 0.85rem;">
              ${item.meanings.map(escapeHtml).join(", ")}
            </span>
          </div>
        `;
      });
      html += `</div>`;
    }

    bodyEl.innerHTML = html;
  }

  // 툴팁 노출 메인 함수
  async function showVocabTooltip(selectedText, rect) {
    createTooltipDOM();
    currentTargetWord = selectedText;
    const cacheKey = selectedText.toLowerCase().trim();

    const wordEl = document.getElementById("vocabWordText");
    const phoneticEl = document.getElementById("vocabPhoneticText");
    const bodyEl = document.getElementById("vocabBody");
    const googleLink = document.getElementById("vocabGoogleLink");
    const naverLink = document.getElementById("vocabNaverLink");

    wordEl.textContent = selectedText;
    phoneticEl.textContent = "";

    googleLink.href = `https://translate.google.com/?sl=en&tl=ko&text=${encodeURIComponent(selectedText)}&op=translate`;
    naverLink.href = `https://en.dict.naver.com/#/search?query=${encodeURIComponent(selectedText)}`;

    updateStarBtnUI(isWordSaved(selectedText));

    // ⚡ 1. L1/L2 캐시 확인 -> 즉시 0ms 표시
    if (memCache.has(cacheKey)) {
      const cached = memCache.get(cacheKey);
      currentWordData = cached;
      renderBodyContent(cached);
      positionTooltip(rect);
      return;
    }

    // ⚡ 2. 내장 딕셔너리 확인 -> 즉시 0ms 표시
    if (BUILTIN_DICT[cacheKey]) {
      const builtin = {
        word: selectedText,
        meaning: BUILTIN_DICT[cacheKey].meaning,
        posList: BUILTIN_DICT[cacheKey].posList || [],
      };
      currentWordData = builtin;
      renderBodyContent(builtin);
      positionTooltip(rect);
      saveVocabCache(cacheKey, builtin);
      return;
    }

    bodyEl.innerHTML = `
      <div class="vocab-loading">
        <div class="vocab-spinner"></div>
        <span>뜻 검색 중...</span>
      </div>
    `;
    positionTooltip(rect);

    try {
      const result = await fetchWordDetails(selectedText);
      if (currentTargetWord !== selectedText) return;

      currentWordData = result;
      renderBodyContent(result);
      positionTooltip(rect);

      saveVocabCache(cacheKey, result);
    } catch (err) {
      if (currentTargetWord === selectedText) {
        bodyEl.innerHTML = `<div style="color:var(--danger, #ef4444); font-size:0.85rem;">번역을 불러오는 중 오류가 발생했습니다.</div>`;
      }
    }
  }

  // 터치/클릭 좌표(x, y) 아래의 단어 정밀 자동 인식 (Caret Range + Element Fallback)
  function getWordAtPoint(x, y) {
    // 1. Caret API 시도
    let range = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      if (pos && pos.offsetNode) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.setEnd(pos.offsetNode, pos.offset);
      }
    }

    if (range && range.startContainer) {
      let node = range.startContainer;
      let offset = range.startOffset;

      // Element 노드일 경우 자식 텍스트 노드로 이동
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.childNodes && node.childNodes.length > 0) {
          const childIdx = Math.min(offset, node.childNodes.length - 1);
          node = node.childNodes[childIdx];
        }
      }

      if (node && node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        let start = Math.min(Math.max(0, offset), text.length);
        
        // 클릭 위치가 공백이면 앞이나 뒤의 글자로 이동
        if (start < text.length && !/[a-zA-Z]/.test(text[start]) && start > 0 && /[a-zA-Z]/.test(text[start - 1])) {
          start--;
        }

        let wordStart = start;
        while (wordStart > 0 && /[a-zA-Z'-]/.test(text[wordStart - 1])) {
          wordStart--;
        }
        let wordEnd = start;
        while (wordEnd < text.length && /[a-zA-Z'-]/.test(text[wordEnd])) {
          wordEnd++;
        }

        const word = text.substring(wordStart, wordEnd).trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
        if (word && word.length >= 1 && /[a-zA-Z]/.test(word)) {
          try {
            const wordRange = document.createRange();
            wordRange.setStart(node, wordStart);
            wordRange.setEnd(node, wordEnd);
            const rect = wordRange.getBoundingClientRect();
            if (rect && (rect.width > 0 || rect.height > 0)) {
              return { word, rect };
            }
          } catch (e) {}
        }
      }
    }

    // 2. Element 바운딩 박스 기반 Fallback 검색 (Caret API 실패 시 완벽 보완)
    try {
      const el = document.elementFromPoint(x, y);
      if (el && !el.closest("#vocabTooltip")) {
        const textNodes = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          textNodes.push(n);
        }

        for (const tNode of textNodes) {
          const text = tNode.textContent || "";
          const regex = /[a-zA-Z'-]+/g;
          let match;
          while ((match = regex.exec(text)) !== null) {
            const wordRange = document.createRange();
            wordRange.setStart(tNode, match.index);
            wordRange.setEnd(tNode, match.index + match[0].length);
            const rect = wordRange.getBoundingClientRect();

            // 터치 지점 (x, y)가 단어 사각형(상하좌우 8px 여유) 안에 있는지 확인
            if (
              x >= rect.left - 8 &&
              x <= rect.right + 8 &&
              y >= rect.top - 8 &&
              y <= rect.bottom + 8
            ) {
              const word = match[0].trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
              if (word && /[a-zA-Z]/.test(word)) {
                return { word, rect };
              }
            }
          }
        }
      }
    } catch (e) {}

    return null;
  }

  // 텍스트 선택 핸들러 (PC selection + 모바일 selectionchange 공용)
  function handleSelection() {
    let cleanText = "";
    let rect = null;

    // 1. input / textarea 내부 텍스트 선택 확인
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA") &&
      typeof activeEl.selectionStart === "number" &&
      typeof activeEl.selectionEnd === "number" &&
      activeEl.selectionStart !== activeEl.selectionEnd
    ) {
      const raw = activeEl.value.substring(activeEl.selectionStart, activeEl.selectionEnd);
      cleanText = raw.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
      if (cleanText && /[a-zA-Z]/.test(cleanText) && cleanText.length <= 60) {
        rect = activeEl.getBoundingClientRect();
      }
    }

    // 2. 일반 DOM 텍스트 선택 확인 (window.getSelection - 롱프레스 & PC 드래그)
    if (!cleanText) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        const rawText = selection.toString();
        cleanText = rawText.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
        if (cleanText && cleanText.length <= 60 && /[a-zA-Z]/.test(cleanText)) {
          if (cleanText.length > 1 || /^[aAiI]$/.test(cleanText)) {
            try {
              const range = selection.getRangeAt(0);
              const r = range.getBoundingClientRect();
              if (r && (r.width > 0 || r.height > 0)) {
                rect = r;
              } else if (range.getClientRects().length > 0) {
                rect = range.getClientRects()[0];
              }
            } catch (e) {}
          }
        }
      }
    }

    if (cleanText && rect) {
      showVocabTooltip(cleanText, rect);
    }
  }

  function triggerSelectionDebounced(delay = 40) {
    if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
    selectionDebounceTimer = setTimeout(handleSelection, delay);
  }

  // 전역 초기화 함수
  function initVocabTooltip() {
    createTooltipDOM();

    // 1. PC 마우스 업 & 더블클릭
    document.addEventListener("mouseup", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      triggerSelectionDebounced(20);
    });

    document.addEventListener("dblclick", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      triggerSelectionDebounced(10);
    });

    // 2. iOS Safari & Android Chrome 롱프레스 / 텍스트 선택 이벤트 (selectionchange)
    document.addEventListener("selectionchange", () => {
      triggerSelectionDebounced(150);
    });

    // 3. 모바일 전용 롱프레스(380ms) 및 더블탭 제스처 리스너
    document.addEventListener("touchstart", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;

      // 두 손가락 이상(핀치 줌)일 경우 롱프레스 취소
      if (e.touches.length !== 1) {
        if (longPressTimer) clearTimeout(longPressTimer);
        return;
      }

      const touch = e.touches[0];
      touchStartPos = { x: touch.clientX, y: touch.clientY };
      isLongPressTriggered = false;

      // 380ms 동안 손가락을 대고 있으면 커스텀 롱프레스 발동
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        if (!touchStartPos) return;
        const detected = getWordAtPoint(touchStartPos.x, touchStartPos.y);
        if (detected) {
          isLongPressTriggered = true;
          lastShownTime = Date.now();
          if (navigator.vibrate) {
            try { navigator.vibrate(20); } catch (v) {}
          }
          showVocabTooltip(detected.word, detected.rect);
        }
      }, 380);
    }, { passive: true });

    // 터치 이동 시 (스크롤 동작): 롱프레스 취소
    document.addEventListener("touchmove", (e) => {
      if (touchStartPos && e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const dist = Math.hypot(touch.clientX - touchStartPos.x, touch.clientY - touchStartPos.y);
        if (dist > 10) {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        }
      }
    }, { passive: true });

    // 터치 종료 (touchend): 더블탭 감지 & 롱프레스 타이머 정리
    document.addEventListener("touchend", (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (tooltipEl && tooltipEl.contains(e.target)) return;
      if (isLongPressTriggered) return;

      const now = Date.now();
      const touch = e.changedTouches && e.changedTouches[0];

      // 📱 모바일 더블 탭 감지 (500ms 이내 동일 지점 40px 반경 연속 탭)
      if (touch && now - lastTouchEndTime < 500 && lastTouchPoint) {
        const dist = Math.hypot(touch.clientX - lastTouchPoint.x, touch.clientY - lastTouchPoint.y);
        if (dist < 40) {
          const detected = getWordAtPoint(touch.clientX, touch.clientY);
          if (detected) {
            lastShownTime = Date.now(); // 툴팁 노출 시간 기록 (합성 이벤트에 의한 즉시 닫힘 방지)
            if (navigator.vibrate) {
              try { navigator.vibrate(20); } catch (v) {}
            }
            showVocabTooltip(detected.word, detected.rect);
            lastTouchEndTime = 0;
            lastTouchPoint = null;
            return;
          }
        }
      }

      if (touch) {
        lastTouchPoint = { x: touch.clientX, y: touch.clientY };
      }
      lastTouchEndTime = now;

      triggerSelectionDebounced(100);
    }, { passive: true });

    // 4. 키보드 ESC 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        hideTooltip();
      }
    });

    // 6. 툴팁 외부 클릭/터치 시 닫기 (방금 뜬 툴팁은 500ms 동안 닫기 무시)
    document.addEventListener("mousedown", (e) => {
      if (Date.now() - lastShownTime < 500) return; // ⚡ 탭 직후 합성 mousedown으로 인한 즉시 닫힘 방지
      if (tooltipEl && !tooltipEl.contains(e.target)) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          hideTooltip();
        }
      }
    });

    document.addEventListener("touchstart", (e) => {
      if (Date.now() - lastShownTime < 500) return; // ⚡ 탭 직후 터치 닫힘 방지
      if (tooltipEl && !tooltipEl.contains(e.target)) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          hideTooltip();
        }
      }
    }, { passive: true });
  }

  // 즉시 초기화 & DOM 준비 시 재확인
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVocabTooltip);
  } else {
    initVocabTooltip();
  }

  // 브라우저 전역 노출
  window.initVocabTooltip = initVocabTooltip;
  window.showVocabTooltip = showVocabTooltip;
  window.hideVocabTooltip = hideTooltip;
  window.getSavedWords = getSavedWords;
})();
