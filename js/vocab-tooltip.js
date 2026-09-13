/**
 * @file vocab-tooltip.js
 * @description 영어 문장 단어/표현 드래그, 더블클릭, 모바일 롱터치 인라인 번역 툴팁 및 단어장 시스템
 *
 * =============================================================================
 * [3계층 사전 폴백 및 무제한 안정성 아키텍처]
 * =============================================================================
 * 1. Tier 1: OPIc 빈출 및 기초 영단어 내장 딕셔너리 (`BUILTIN_DICT`)
 *    - 네트워크 요청 0회, 0ms 즉각 반환으로 429 Rate Limit 원천 차단
 * 2. Tier 2: MyMemory 공식 오픈 번역 API
 *    - CORS 친화적이며 안정적인 단어/표현 번역 제공
 * 3. Tier 3: Google Translate gtx 엔드포인트
 *    - 429 감지 시 60초간 쿨다운 보호 및 MyMemory로 자동 우회
 * 4. 2단계 하이브리드 캐싱:
 *    - L1: Map 기반 초고속 인메모리 캐시
 *    - L2: LocalStorage 기반 최대 500개 영구 캐시 (LRU 방식 100개 단위 정리)
 * 5. 모바일/터치 디바이스 UX 최적화:
 *    - 브라우저 더블탭 확대 방지, 핀치 줌 제스처 보존, 롱프레스 햅틱 및 OS 컨텍스트 메뉴 간섭 차단
 * 6. 나만의 단어장 연동: 즐겨찾기(별표 토글), 단어장 모달, 발음 TTS 재생 지원
 *
 * @author Kim Hyo-sang
 * @version 2.2.0
 */

(function () {
  /** @const {string} 로컬 스토리지 번역 결과 캐시 저장 키 (구버전 오염 캐시 무효화) */
  const VOCAB_CACHE_KEY = "ko-en-opic-vocab-cache-v3";

  /** @const {string} 로컬 스토리지 나만의 단어장 저장 키 */
  const SAVED_WORDS_KEY = "ko-en-opic-saved-words";

  /** @type {Map<string, Object>} L1 초고속 인메모리 캐시 */
  const memCache = new Map();

  /** @type {number} Google 번역 API 429 Too Many Requests 방지용 쿨다운 타임스탬프 */
  let googleCooldownUntil = 0;

  // =============================================================================
  // 1. Tier 1: OPIc 빈출 및 필수 영단어 내장 오프라인 사전 (네트워크 0회)
  // =============================================================================
  const BUILTIN_DICT = {
    best: {
      meaning: "가장 좋은, 최고의",
      posList: [
        { pos: "형용사", meanings: ["최고의", "가장 좋은", "으뜸가는"] },
        { pos: "명사", meanings: ["최선", "최고"] },
      ],
    },
    better: {
      meaning: "더 좋은, 더 나은",
      posList: [{ pos: "형용사", meanings: ["더 좋은", "호전된"] }],
    },
    good: {
      meaning: "좋은, 훌륭한",
      posList: [{ pos: "형용사", meanings: ["좋은", "착한", "적절한"] }],
    },
    give: {
      meaning: "주다, 제공하다",
      posList: [{ pos: "동사", meanings: ["주다", "제공하다", "넘겨주다"] }],
    },
    gives: {
      meaning: "주다 (3인칭 단수)",
      posList: [{ pos: "동사", meanings: ["주다", "제공하다"] }],
    },
    given: {
      meaning: "주어진, 주입된",
      posList: [{ pos: "형용사", meanings: ["주어진", "소정의"] }],
    },
    take: {
      meaning: "가지다, 데려가다, (시간이) 걸리다",
      posList: [
        { pos: "동사", meanings: ["취하다", "데려가다", "받아들이다"] },
      ],
    },
    takes: {
      meaning: "걸리다, 가지다",
      posList: [{ pos: "동사", meanings: ["걸리다", "가지다"] }],
    },
    taking: {
      meaning: "가져가는 것, 수령",
      posList: [{ pos: "동사", meanings: ["가져가기", "복용하기"] }],
    },
    work: {
      meaning: "일하다, 작동하다, 직장",
      posList: [
        { pos: "동사", meanings: ["일하다", "작동하다"] },
        { pos: "명사", meanings: ["일", "직장", "업무"] },
      ],
    },
    working: {
      meaning: "근무하는, 일하는",
      posList: [
        { pos: "동사", meanings: ["일하는 중"] },
        { pos: "형용사", meanings: ["근무의", "효과적인"] },
      ],
    },
    shift: {
      meaning: "근무 조, 교대, 이동",
      posList: [{ pos: "명사", meanings: ["교대 근무", "변화", "전환"] }],
    },
    shifts: {
      meaning: "교대근무들",
      posList: [{ pos: "명사", meanings: ["교대 근무조"] }],
    },
    rotating: {
      meaning: "교대하는, 회전하는",
      posList: [{ pos: "형용사", meanings: ["순환하는", "교대하는"] }],
    },
    company: {
      meaning: "회사, 동료, 함께 있음",
      posList: [{ pos: "명사", meanings: ["회사", "동료", "친구"] }],
    },
    manage: {
      meaning: "관리하다, 경영하다",
      posList: [
        { pos: "동사", meanings: ["관리하다", "다루다", "어떻게든 해내다"] },
      ],
    },
    managing: {
      meaning: "관리하는 것",
      posList: [{ pos: "동사", meanings: ["관리하기", "운영하기"] }],
    },
    equipment: {
      meaning: "장비, 설비, 기구",
      posList: [{ pos: "명사", meanings: ["장비", "설비", "기기"] }],
    },
    electrical: {
      meaning: "전기의, 전열의",
      posList: [{ pos: "형용사", meanings: ["전기의", "전기 공학의"] }],
    },
    prefer: {
      meaning: "선호하다, 더 좋아하다",
      posList: [{ pos: "동사", meanings: ["더 좋아하다", "선호하다"] }],
    },
    usually: {
      meaning: "보통, 대개, 평소에",
      posList: [{ pos: "부사", meanings: ["보통", "대체로", "늘"] }],
    },
    often: {
      meaning: "자주, 종종",
      posList: [{ pos: "부사", meanings: ["자주", "흔히", "종종"] }],
    },
    always: {
      meaning: "항상, 언제나",
      posList: [{ pos: "부사", meanings: ["항상", "늘", "언제나"] }],
    },
    sometimes: {
      meaning: "때때로, 가끔",
      posList: [{ pos: "부사", meanings: ["때때로", "가끔"] }],
    },
    rarely: {
      meaning: "드물게, 거의 ~않다",
      posList: [{ pos: "부사", meanings: ["드물게", "좀처럼 ~않는"] }],
    },
    never: {
      meaning: "결코 ~않다, 전혀 없다",
      posList: [{ pos: "부사", meanings: ["결코 ~않다", "전혀"] }],
    },
    favorite: {
      meaning: "가장 좋아하는, 마음에 드는",
      posList: [
        { pos: "형용사", meanings: ["가장 좋아하는"] },
        { pos: "명사", meanings: ["인기 있는 사람/물건"] },
      ],
    },
    because: {
      meaning: "~때문에, 왜냐하면",
      posList: [{ pos: "접속사", meanings: ["~때문에", "왜냐하면"] }],
    },
    although: {
      meaning: "비록 ~일지라도",
      posList: [
        { pos: "접속사", meanings: ["비록 ~이지만", "~에도 불구하고"] },
      ],
    },
    however: {
      meaning: "그러나, 하지만",
      posList: [{ pos: "부사", meanings: ["그러나", "그렇지만"] }],
    },
    recommend: {
      meaning: "추천하다, 권하다",
      posList: [{ pos: "동사", meanings: ["추천하다", "권고하다"] }],
    },
    experience: {
      meaning: "경험, 체험, 겪다",
      posList: [
        { pos: "명사", meanings: ["경험", "체험"] },
        { pos: "동사", meanings: ["경험하다", "겪다"] },
      ],
    },
    memorable: {
      meaning: "기억에 남는, 인상적인",
      posList: [{ pos: "형용사", meanings: ["기억할 만한", "인상 깊은"] }],
    },
    delicious: {
      meaning: "맛있는, 아주 좋은",
      posList: [{ pos: "형용사", meanings: ["맛있는", "향긋한"] }],
    },
    travel: {
      meaning: "여행하다, 이동하다, 여행",
      posList: [
        { pos: "동사", meanings: ["여행하다", "이동하다"] },
        { pos: "명사", meanings: ["여행", "출장"] },
      ],
    },
    trip: {
      meaning: "여행, 나들이, 걸려 넘어지다",
      posList: [{ pos: "명사", meanings: ["여행", "이동"] }],
    },
    weekend: {
      meaning: "주말",
      posList: [{ pos: "명사", meanings: ["주말", "토일요일"] }],
    },
    weekends: {
      meaning: "주말마다",
      posList: [{ pos: "명사", meanings: ["주말마다"] }],
    },
    holiday: {
      meaning: "휴일, 명절, 휴가",
      posList: [{ pos: "명사", meanings: ["휴일", "공휴일", "휴가"] }],
    },
    family: {
      meaning: "가족, 가문",
      posList: [{ pos: "명사", meanings: ["가족", "식구"] }],
    },
    friend: {
      meaning: "친구, 벗",
      posList: [{ pos: "명사", meanings: ["친구", "동료"] }],
    },
    friends: {
      meaning: "친구들",
      posList: [{ pos: "명사", meanings: ["친구들"] }],
    },
    movie: {
      meaning: "영화",
      posList: [{ pos: "명사", meanings: ["영화", "필름"] }],
    },
    movies: {
      meaning: "영화(감상)",
      posList: [{ pos: "명사", meanings: ["영화들"] }],
    },
    park: {
      meaning: "공원, 주차하다",
      posList: [
        { pos: "명사", meanings: ["공원", "유원지"] },
        { pos: "동사", meanings: ["주차하다"] },
      ],
    },
    coffee: {
      meaning: "커피",
      posList: [{ pos: "명사", meanings: ["커피", "원두"] }],
    },
    relax: {
      meaning: "휴식을 취하다, 긴장을 풀다",
      posList: [{ pos: "동사", meanings: ["쉬다", "안정을 취하다"] }],
    },
    weather: {
      meaning: "날씨, 기상",
      posList: [{ pos: "명사", meanings: ["날씨", "기후"] }],
    },
    season: {
      meaning: "계절, 시즌",
      posList: [{ pos: "명사", meanings: ["계절", "시기"] }],
    },
    convenient: {
      meaning: "편리한, 간편한",
      posList: [{ pos: "형용사", meanings: ["편리한", "가까운", "알맞은"] }],
    },
    comfortable: {
      meaning: "편안한, 쾌적한",
      posList: [{ pos: "형용사", meanings: ["편안한", "안락한"] }],
    },
    popular: {
      meaning: "인기 있는, 대중적인",
      posList: [{ pos: "형용사", meanings: ["인기 있는", "유명한"] }],
    },
    important: {
      meaning: "중요한, 중대한",
      posList: [{ pos: "형용사", meanings: ["중요한", "유력한"] }],
    },
    special: {
      meaning: "특별한, 특수한",
      posList: [{ pos: "형용사", meanings: ["특별한", "특급의"] }],
    },
    place: {
      meaning: "장소, 곳, 두다",
      posList: [
        { pos: "명사", meanings: ["장소", "위치", "곳"] },
        { pos: "동사", meanings: ["놓다", "배치하다"] },
      ],
    },
    routine: {
      meaning: "일상, 루틴, 규칙적인 일",
      posList: [{ pos: "명사", meanings: ["일상적인 일", "판에 박힌 일"] }],
    },
    around: {
      meaning: "주위에, 약, 대략",
      posList: [{ pos: "전치사", meanings: ["~주위에", "~대략", "~쯤"] }],
    },
    almost: {
      meaning: "거의, 하마터면",
      posList: [{ pos: "부사", meanings: ["거의", "대부분"] }],
    },
    together: {
      meaning: "함께, 같이",
      posList: [{ pos: "부사", meanings: ["함께", "동시에"] }],
    },
    especially: {
      meaning: "특히, 특별히",
      posList: [{ pos: "부사", meanings: ["특히", "각별히"] }],
    },
    recently: {
      meaning: "최근에, 요즈음",
      posList: [{ pos: "부사", meanings: ["최근에", "얼마 전에"] }],
    },
    lately: {
      meaning: "최근에, 요새",
      posList: [{ pos: "부사", meanings: ["최근에", "요즈음"] }],
    },
    usually: {
      meaning: "보통, 대개",
      posList: [{ pos: "부사", meanings: ["보통", "평소에"] }],
    },
    start: {
      meaning: "시작하다, 출발하다",
      posList: [{ pos: "동사", meanings: ["시작하다", "착수하다"] }],
    },
    finish: {
      meaning: "끝내다, 마치다",
      posList: [{ pos: "동사", meanings: ["끝마치다", "완료하다"] }],
    },
    enjoy: {
      meaning: "즐기다, 누리다",
      posList: [{ pos: "동사", meanings: ["즐기다", "만끽하다"] }],
    },
    listen: {
      meaning: "듣다, 귀를 기울이다",
      posList: [{ pos: "동사", meanings: ["듣다", "청취하다"] }],
    },
    watch: {
      meaning: "보다, 지켜보다, 시계",
      posList: [{ pos: "동사", meanings: ["보다", "관람하다"] }],
    },
    order: {
      meaning: "주문하다, 명령하다, 순서",
      posList: [
        { pos: "동사", meanings: ["주문하다"] },
        { pos: "명사", meanings: ["주문", "순서"] },
      ],
    },
    vibe: {
      meaning: "분위기, 느낌",
      posList: [{ pos: "명사", meanings: ["분위기", "느낌", "기운"] }],
    },
    vibes: {
      meaning: "분위기, 감정들",
      posList: [{ pos: "명사", meanings: ["분위기", "느낌"] }],
    },
    amazing: {
      meaning: "놀라운, 대단한, 아주 멋진",
      posList: [{ pos: "형용사", meanings: ["놀라운", "굉장한", "멋진"] }],
    },
    awesome: {
      meaning: "굉장한, 아주 좋은",
      posList: [{ pos: "형용사", meanings: ["멋진", "대단한", "최고인"] }],
    },
    truly: {
      meaning: "진정으로, 정말로, 참으로",
      posList: [{ pos: "부사", meanings: ["진정으로", "정말로", "참으로"] }],
    },
    really: {
      meaning: "정말로, 아주, 진짜로",
      posList: [{ pos: "부사", meanings: ["정말", "진짜로", "매우"] }],
    },
    "i think": {
      meaning: "제 생각에는, 제가 보기에는",
      posList: [{ pos: "표현", meanings: ["제 생각에는", "내가 보기에는"] }],
    },
    "in my opinion": {
      meaning: "제 의견으로는, 제 생각에는",
      posList: [{ pos: "표현", meanings: ["제 의견으로는", "제 생각에는"] }],
    },
    "you know": {
      meaning: "있잖아, 알다시피",
      posList: [{ pos: "표현", meanings: ["있잖아", "알다시피"] }],
    },
    "for example": {
      meaning: "예를 들어, 예를 들자면",
      posList: [{ pos: "표현", meanings: ["예를 들어", "예컨대"] }],
    },
    "to be honest": {
      meaning: "솔직히 말해서, 사실대로 말하자면",
      posList: [{ pos: "표현", meanings: ["솔직히 말하면", "사실은"] }],
    },
    "favorite place": {
      meaning: "가장 좋아하는 장소, 최애 장소",
      posList: [
        { pos: "명사구", meanings: ["최애 장소", "가장 좋아하는 장소"] },
      ],
    },
    "near my house": {
      meaning: "우리 집 근처에, 집 근처",
      posList: [{ pos: "부사구", meanings: ["우리 집 근처에", "집 부근"] }],
    },
    "it is located": {
      meaning: "~에 위치해 있다",
      posList: [{ pos: "동사구", meanings: ["위치하다", "자리잡고 있다"] }],
    },
    "as well as": {
      meaning: "~뿐만 아니라, ~도 마찬가지로",
      posList: [{ pos: "접속사구", meanings: ["~뿐만 아니라", "게다가"] }],
    },
    "on the other hand": {
      meaning: "반면에, 다른 한편으로는",
      posList: [{ pos: "표현", meanings: ["반면에", "다른 한편으로는"] }],
    },
    "speaking of": {
      meaning: "~에 대해 말하자면, ~의 이야기라면",
      posList: [{ pos: "전치사구", meanings: ["~에 관하여 말하자면"] }],
    },
    "when it comes to": {
      meaning: "~에 관한 한, ~에 대해 말하자면",
      posList: [{ pos: "표현", meanings: ["~에 관해서라면"] }],
    },
    whenever: {
      meaning: "~할 때마다, 언제든 ~할 때",
      posList: [{ pos: "접속사", meanings: ["~할 때마다", "언제든지 ~할 때"] }],
    },
    "think of": {
      meaning: "~을 생각하다, 떠올리다",
      posList: [{ pos: "동사구", meanings: ["~을 생각하다", "~을 떠올리다"] }],
    },
    "whenever i think of": {
      meaning: "~을 생각할 때마다, ~이 떠오를 때마다",
      posList: [
        { pos: "표현", meanings: ["~을 생각할 때마다", "~이 떠오를 때마다"] },
      ],
    },
  };

  let tooltipEl = null;
  let currentTargetWord = "";
  let currentWordData = null;
  let isMouseInsideTooltip = false;
  let selectionDebounceTimer = null;
  let closeCooldownUntil = 0; // 툴팁 닫기 후 드래그/선택 잔여 이벤트로 인한 즉시 재오픈 방지용 쿨다운
  let lastMouseUpWasShift = false; // Shift+Click 선택 영역 확장 추적 플래그
  let isDragEnded = false; // 마우스/터치 드래그 완료 여부 플래그
  let isApplyingSnappedSelection = false; // 단어 스냅 Selection 업데이트 루프 방지 플래그

  // 모바일 터치 제스처 관리 변수
  let longPressTimer = null;
  let touchStartPos = null;
  let isLongPressTriggered = false;
  let lastTouchEndTime = 0;
  let lastTouchPoint = null;
  let lastShownTime = 0;

  // =============================================================================
  // 2. L1/L2 하이브리드 캐싱 및 단어장 영구 저장 관리
  // =============================================================================

  /**
   * HTML 특수문자 이스케이프 유틸리티
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * LocalStorage에 저장된 번역 사전 L2 캐시 객체 조회
   * @returns {Object<string, Object>}
   */
  function getVocabCache() {
    try {
      return JSON.parse(localStorage.getItem(VOCAB_CACHE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  /**
   * 번역 결과를 L1 인메모리 및 L2 LocalStorage에 동시 저장
   * - 캐시 크기가 500개를 초과할 경우 오래된 항목 100개를 자동 배치 정리
   * @param {string} key - 단어/표현 소문자 키
   * @param {Object} data - 번역 결과 객체
   */
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

  // 구버전 오염 캐시 즉시 제거 및 초기 기동 시 L2 캐시를 L1 메모리에 워밍업
  try {
    localStorage.removeItem("ko-en-opic-vocab-cache");
    localStorage.removeItem("ko-en-opic-vocab-cache-v2");
    const l2 = getVocabCache();
    for (const [k, v] of Object.entries(l2)) {
      // 만에 하나 플레이스홀더 패턴이 남아있는 항목이 있다면 필터링
      if (
        v &&
        typeof v.meaning === "string" &&
        /\[(주제|장소명|음식명|활동명)\]/.test(v.meaning)
      ) {
        continue;
      }
      memCache.set(k, v);
    }
  } catch (e) {}

  /**
   * LocalStorage에 보관된 사용자 단어장 목록 조회
   * @returns {Array<Object>} 저장된 단어 객체 배열
   */
  function getSavedWords() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_WORDS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 특정 단어가 현재 단어장에 저장되어 있는지 여부 검사
   * @param {string} word - 단어 문자열
   * @returns {boolean} 저장 여부
   */
  function isWordSaved(word) {
    if (!word) return false;
    const list = getSavedWords();
    return list.some((item) => item.word.toLowerCase() === word.toLowerCase());
  }

  /**
   * 단어장 저장/제거 토글
   * @param {Object} wordData - 저장할 단어 데이터 객체 (word, meaning, posList)
   * @returns {boolean} 저장되었으면 true, 제거되었으면 false
   */
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

  // =============================================================================
  // 3. 인라인 툴팁 DOM 생성, 위치 계산 및 3단계 사전 조회 엔진
  // =============================================================================

  /**
   * 번역 툴팁 DOM 엘리먼트 생성 및 이벤트 리스너 바인딩
   * @returns {HTMLElement}
   */
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

    // 툴팁 내부 텍스트 드래그 및 선택 방지
    tooltipEl.addEventListener("selectstart", (e) => e.preventDefault());
    tooltipEl.addEventListener("dragstart", (e) => e.preventDefault());

    // 이벤트 리스너 바인딩 (PC & 모바일 터치 대응)
    tooltipEl.addEventListener("mouseenter", () => {
      isMouseInsideTooltip = true;
    });
    tooltipEl.addEventListener("mouseleave", () => {
      isMouseInsideTooltip = false;
    });
    tooltipEl.addEventListener(
      "touchstart",
      (e) => {
        e.stopPropagation();
        isMouseInsideTooltip = true;
      },
      { passive: true },
    );
    tooltipEl.addEventListener(
      "touchend",
      () => {
        setTimeout(() => {
          isMouseInsideTooltip = false;
        }, 300);
      },
      { passive: true },
    );

    const vocabCloseBtn = document.getElementById("vocabCloseBtn");
    if (vocabCloseBtn) {
      vocabCloseBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      vocabCloseBtn.addEventListener(
        "touchstart",
        (e) => {
          e.stopPropagation();
        },
        { passive: true },
      );
      vocabCloseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideTooltip(true);
      });
    }

    const vocabSpeakBtn = document.getElementById("vocabSpeakBtn");
    vocabSpeakBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentTargetWord) {
        if (typeof speakText === "function") {
          speakText(currentTargetWord, "en-US", vocabSpeakBtn);
        } else if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(currentTargetWord);
          u.lang = "en-US";
          u.pitch = 1.22;
          if (typeof getBestVoice === "function") {
            const voice = getBestVoice("en-US");
            if (voice) u.voice = voice;
          }
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
      showToast(
        isSaved ? "⭐ 단어장에 저장되었어요!" : "단어장에서 삭제되었어요.",
      );
    });

    return tooltipEl;
  }

  /**
   * 토스트 피드백 메시지 노출
   * @param {string} msg
   */
  function showToast(msg) {
    let toast = document.getElementById("vocabToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "vocabToast";
      toast.className = "vocab-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 1800);
  }

  /**
   * 단어장 즐겨찾기 별표 버튼 UI 동기화
   * @param {boolean} isSaved
   */
  function updateStarBtnUI(isSaved) {
    const starBtn = document.getElementById("vocabStarBtn");
    if (!starBtn) return;
    if (isSaved) {
      starBtn.classList.add("saved");
      starBtn.innerHTML = "★";
      starBtn.title = "단어장에서 제거";
    } else {
      starBtn.classList.remove("saved");
      starBtn.innerHTML = "☆";
      starBtn.title = "단어장에 저장";
    }
  }

  /**
   * 선택된 텍스트 위치(rect)를 기준으로 화면 밖 이탈 없이 최적의 위치에 툴팁 배치
   * - 모바일: 아래쪽 공간 우선 배치 (상단 돋보기/시스템 선택바 간섭 방지)
   * - PC: 위쪽 공간 우선 배치
   * @param {DOMRect} rect - 선택 텍스트의 바운딩 렉트
   */
  function positionTooltip(rect) {
    if (!tooltipEl || !rect) return;
    lastTargetRect = rect;

    const viewportWidth =
      window.visualViewport && window.visualViewport.width
        ? window.visualViewport.width
        : window.innerWidth;
    const viewportHeight =
      window.visualViewport && window.visualViewport.height
        ? window.visualViewport.height
        : window.innerHeight;
    const viewportOffsetTop =
      window.visualViewport &&
      typeof window.visualViewport.offsetTop === "number"
        ? window.visualViewport.offsetTop
        : 0;

    const isMobile = viewportWidth <= 768;
    const tooltipWidth = Math.min(320, viewportWidth - (isMobile ? 20 : 32));
    tooltipEl.style.width = `${Math.round(tooltipWidth)}px`;

    // 1. 수평(X) 위치 계산: 선택 영역 중앙 정렬 후 화면 경계 클램핑
    const targetCenterX = rect.left + rect.width / 2;
    let left = targetCenterX - tooltipWidth / 2;
    const minX = isMobile ? 10 : 16;
    const maxX = viewportWidth - tooltipWidth - (isMobile ? 10 : 16);
    left = Math.max(minX, Math.min(left, maxX));

    // 2. 툴팁 화살표(Arrow) 정밀 정렬: 단어 중앙을 정확히 가리키도록 설정 (둥근 모서리 안쪽 안전 클램핑)
    const arrowEl = document.getElementById("vocabTooltipArrow");
    if (arrowEl) {
      const arrowHalf = 5;
      const rawArrowX = targetCenterX - left - arrowHalf;
      const clampedArrowX = Math.max(
        16,
        Math.min(tooltipWidth - 16 - arrowHalf * 2, rawArrowX),
      );
      arrowEl.style.left = `${Math.round(clampedArrowX)}px`;
    }

    // 3. 수직(Y) 위치 계산
    const actualHeight = tooltipEl.offsetHeight || 160;
    const margin = 10;
    const screenPaddingTop = Math.max(10, viewportOffsetTop + 10);
    const screenPaddingBottom = 12;

    const spaceAbove = rect.top - screenPaddingTop;
    const spaceBelow = viewportHeight - rect.bottom - screenPaddingBottom;

    let top = 0;
    let placement = "top";

    if (isMobile) {
      // 📱 모바일: 아래쪽 공간이 충분하면 아래쪽에 우선 배치
      if (spaceBelow >= actualHeight + margin) {
        top = rect.bottom + margin;
        placement = "bottom";
      } else if (spaceAbove >= actualHeight + margin) {
        top = rect.top - actualHeight - margin;
        placement = "top";
      } else {
        if (spaceBelow >= spaceAbove) {
          top = rect.bottom + margin;
          placement = "bottom";
        } else {
          top = rect.top - actualHeight - margin;
          placement = "top";
        }
      }
    } else {
      // 💻 PC: 위쪽 공간이 충분하면 위쪽에 우선 배치
      if (spaceAbove >= actualHeight + margin) {
        top = rect.top - actualHeight - margin;
        placement = "top";
      } else if (spaceBelow >= actualHeight + margin) {
        top = rect.bottom + margin;
        placement = "bottom";
      } else {
        if (spaceAbove >= spaceBelow) {
          top = rect.top - actualHeight - margin;
          placement = "top";
        } else {
          top = rect.bottom + margin;
          placement = "bottom";
        }
      }
    }

    // 최종 위치 안전 클램핑
    top = Math.max(
      screenPaddingTop,
      Math.min(top, viewportHeight - actualHeight - screenPaddingBottom),
    );

    tooltipEl.setAttribute("data-placement", placement);
    tooltipEl.style.left = `${Math.round(left)}px`;
    tooltipEl.style.top = `${Math.round(top)}px`;
    tooltipEl.classList.add("show");
  }

  /**
   * 브라우저 및 활성 입력 필드의 텍스트 드래그(선택) 영역 완전 해제
   */
  function clearSelection() {
    try {
      const sel = window.getSelection();
      if (sel) {
        if (typeof sel.removeAllRanges === "function") {
          sel.removeAllRanges();
        } else if (typeof sel.empty === "function") {
          sel.empty();
        }
      }
    } catch (e) {}

    try {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA") &&
        typeof activeEl.selectionStart === "number" &&
        typeof activeEl.selectionEnd === "number"
      ) {
        activeEl.setSelectionRange(
          activeEl.selectionEnd,
          activeEl.selectionEnd,
        );
      }
    } catch (e) {}
  }

  /**
   * 툴팁 숨김 처리 및 상태 리셋
   * @param {boolean} [shouldClearSelection=true] - 드래그/텍스트 선택 영역도 함께 해제할지 여부
   */
  function hideTooltip(shouldClearSelection = true) {
    if (tooltipEl) {
      tooltipEl.classList.remove("show");
      currentTargetWord = "";
      currentWordData = null;
      lastTargetRect = null;
      isMouseInsideTooltip = false;
    }

    if (selectionDebounceTimer) {
      clearTimeout(selectionDebounceTimer);
      selectionDebounceTimer = null;
    }

    // 툴팁을 닫은 직후 selectionchange/mouseup 등의 잔여 이벤트로 다시 열리는 것 방지
    closeCooldownUntil = Date.now() + 400;

    if (shouldClearSelection) {
      clearSelection();
    }
  }

  /**
   * 한글 및 특수문자를 제거하고 순수 영문 텍스트만 정제 추출
   * 💡 예: "Whenever I think of [주제], [장소명] is my favorite place." -> "Whenever I think of, is my favorite place."
   * 💡 예: "1. [주제] favorite place." -> "favorite place."
   * @param {string} text
   * @returns {string}
   */
  function cleanEnglishText(text) {
    if (!text || typeof text !== "string") return "";

    return (
      text
        // 1. 대괄호/중괄호/소괄호로 감싸진 내용 중 한글이 포함된 태그 제거 (예: [주제], [장소명], (답변) 등)
        .replace(/[\[\({][^\]\)}]*[ㄱ-ㅎㅏ-ㅣ가-힣][^\]\)}]*[\]\)}]/g, " ")
        // 2. 잔여 한글 문자 제거
        .replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]+/g, " ")
        // 3. 앞 번호 패턴 제거 (예: "1. ", "2) ", "#3. ")
        .replace(/^[\s\d.)(#\-]+/, "")
        // 4. 영어 단어/문장에 불필요한 특수문자 제거 (알파벳, 숫자, 공백, 아포스트로피('), 하이픈(-) 및 문장부호(. , ! ? ;) 허용)
        .replace(/[^a-zA-Z0-9\s'.,!?-]/g, " ")
        // 5. 쉼표 및 연속 부호 정돈
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s+,/g, ",")
        .replace(/,\s*,/g, ",")
        // 6. 다중 공백 단일화 및 양 끝 정리
        .replace(/\s+/g, " ")
        .replace(/^[^a-zA-Z]+|[^a-zA-Z0-9.!?]+$/g, "")
        .trim()
    );
  }

  /**
   * 영단어/구문 의미 조회 (내장 사전 우선 -> 온라인 번역 Fallback)
   * @param {string} queryText - 검색할 영단어/구문
   * @returns {Promise<Object>} 단어, 주요 뜻, 품사별 의미 배열
   */
  async function fetchWordDetails(queryText) {
    const cleanQuery = cleanEnglishText(queryText);
    if (!cleanQuery || !/[a-zA-Z]/.test(cleanQuery)) {
      return {
        word: queryText,
        meaning: "영어 단어 및 표현만 지원됩니다.",
        posList: [],
      };
    }

    const key = cleanQuery
      .toLowerCase()
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
      .trim();

    // 1. 내장 사전 우선 검색 (네트워크 0회, 0ms 반환)
    if (BUILTIN_DICT[key]) {
      const builtin = BUILTIN_DICT[key];
      return {
        word: cleanQuery,
        meaning: builtin.meaning,
        posList: builtin.posList || [],
      };
    }

    let mainMeaning = "";
    let posList = [];

    // 2. 온라인 번역 (MyMemory 공식 오픈 번역 API, CORS 허용)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanQuery)}&langpair=en|ko`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data && data.responseData && data.responseData.translatedText) {
          const trans = data.responseData.translatedText.trim();
          if (trans.toLowerCase() !== cleanQuery.toLowerCase()) {
            mainMeaning = trans;
          }
        }
      }
    } catch (e) {}

    return {
      word: cleanQuery,
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
        ${escapeHtml(data.meaning || "번역 검색 중...")}
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
    const cleanText = cleanEnglishText(selectedText);
    if (!cleanText || !/[a-zA-Z]/.test(cleanText)) return;
    createTooltipDOM();
    currentTargetWord = cleanText;
    lastTargetRect = rect;
    const cacheKey = cleanText.toLowerCase().trim();

    const wordEl = document.getElementById("vocabWordText");
    const phoneticEl = document.getElementById("vocabPhoneticText");
    const bodyEl = document.getElementById("vocabBody");
    const googleLink = document.getElementById("vocabGoogleLink");
    const naverLink = document.getElementById("vocabNaverLink");

    wordEl.textContent = cleanText;
    wordEl.title = cleanText;
    phoneticEl.textContent = "";

    googleLink.href = `https://translate.google.com/?sl=en&tl=ko&text=${encodeURIComponent(cleanText)}&op=translate`;
    naverLink.href = `https://en.dict.naver.com/#/search?query=${encodeURIComponent(cleanText)}`;

    updateStarBtnUI(isWordSaved(cleanText));

    // ⚡ 1. L1/L2 캐시 확인 -> 즉시 0ms 표시
    if (memCache.has(cacheKey)) {
      const cached = memCache.get(cacheKey);
      currentWordData = cached;
      renderBodyContent(cached);
      positionTooltip(rect);
      return;
    }

    // ⚡ 2. 내장 딕셔너리 확인 -> 즉시 0ms 표시
    const dictKey = cacheKey
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
      .trim();
    if (BUILTIN_DICT[dictKey]) {
      const builtin = {
        word: cleanText,
        meaning: BUILTIN_DICT[dictKey].meaning,
        posList: BUILTIN_DICT[dictKey].posList || [],
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
        <span>번역 검색 중...</span>
      </div>
    `;
    positionTooltip(rect);

    try {
      const result = await fetchWordDetails(selectedText);
      if (currentTargetWord !== selectedText) return;

      currentWordData = result;
      renderBodyContent(result);
      // 번역 내용이 렌더링되어 높이가 변경된 후 정밀 재배치
      positionTooltip(lastTargetRect || rect);

      saveVocabCache(cacheKey, result);
    } catch (err) {
      if (currentTargetWord === selectedText) {
        bodyEl.innerHTML = `<div style="color:var(--danger, #ef4444); font-size:0.85rem;">번역을 불러오는 중 오류가 발생했습니다.</div>`;
        positionTooltip(lastTargetRect || rect);
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
        if (
          start < text.length &&
          !/[a-zA-Z]/.test(text[start]) &&
          start > 0 &&
          /[a-zA-Z]/.test(text[start - 1])
        ) {
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

        const word = text
          .substring(wordStart, wordEnd)
          .trim()
          .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
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
              const word = match[0]
                .trim()
                .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
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

  // 텍스트 선택 영역을 띄어쓰기/단어 경계(Word Boundaries)로 자동 보정 & 확장하는 함수
  function snapRangeToWordBoundaries(range) {
    if (!range) return range;

    try {
      let startNode = range.startContainer;
      let startOffset = range.startOffset;
      let endNode = range.endContainer;
      let endOffset = range.endOffset;

      // 1. startNode가 Element일 경우 자식 텍스트 노드로 이동
      if (startNode.nodeType === Node.ELEMENT_NODE) {
        if (startNode.childNodes && startNode.childNodes.length > 0) {
          const idx = Math.min(startOffset, startNode.childNodes.length - 1);
          startNode = startNode.childNodes[idx];
          startOffset = 0;
        }
      }

      // 2. endNode가 Element일 경우 자식 텍스트 노드로 이동
      if (endNode.nodeType === Node.ELEMENT_NODE) {
        if (endNode.childNodes && endNode.childNodes.length > 0) {
          const idx = Math.min(endOffset, endNode.childNodes.length - 1);
          endNode = endNode.childNodes[idx];
          endOffset = (endNode.textContent || "").length;
        }
      }

      // 3. startNode가 텍스트 노드인 경우 단어 시작 지점으로 앞쪽 확장
      if (startNode && startNode.nodeType === Node.TEXT_NODE) {
        const text = startNode.textContent || "";
        let s = Math.min(Math.max(0, startOffset), text.length);

        // 선택 시작 위치의 바로 앞 글자가 단어 문자이면 단어의 맨 앞(공백/경계)까지 확장
        while (s > 0 && /[a-zA-Z0-9'-]/.test(text[s - 1])) {
          s--;
        }
        startOffset = s;
      }

      // 4. endNode가 텍스트 노드인 경우 단어 끝 지점으로 뒤쪽 확장
      if (endNode && endNode.nodeType === Node.TEXT_NODE) {
        const text = endNode.textContent || "";
        let e = Math.min(Math.max(0, endOffset), text.length);

        // 선택 끝 위치의 글자가 단어 문자이면 단어의 맨 끝(공백/경계)까지 확장
        while (e < text.length && /[a-zA-Z0-9'-]/.test(text[e])) {
          e++;
        }
        endOffset = e;
      }

      const newRange = document.createRange();
      newRange.setStart(startNode, startOffset);
      newRange.setEnd(endNode, endOffset);
      return newRange;
    } catch (e) {
      return range;
    }
  }

  function snapInputToWordBoundaries(activeEl) {
    if (!activeEl || typeof activeEl.selectionStart !== "number") return;
    try {
      const val = activeEl.value || "";
      let start = activeEl.selectionStart;
      let end = activeEl.selectionEnd;
      if (start === end) return;

      while (start > 0 && /[a-zA-Z0-9'-]/.test(val[start - 1])) {
        start--;
      }
      while (end < val.length && /[a-zA-Z0-9'-]/.test(val[end])) {
        end++;
      }
      activeEl.setSelectionRange(start, end);
    } catch (e) {}
  }

  // 텍스트 선택 핸들러 (단어 및 긴 문장 1500자까지 모두 지원 + 띄어쓰기 단위 드래그 자동 보정)
  function handleSelection() {
    if (Date.now() < closeCooldownUntil) return;

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
      const val = activeEl.value || "";
      let s = activeEl.selectionStart;
      let e = activeEl.selectionEnd;
      while (s > 0 && /[a-zA-Z0-9'-]/.test(val[s - 1])) s--;
      while (e < val.length && /[a-zA-Z0-9'-]/.test(val[e])) e++;

      // 💡 사용자의 드래그 행위가 끝난 시점이면 input 내부 선택 범위도 단어 경계로 즉시 반영
      if (
        isDragEnded &&
        (s !== activeEl.selectionStart || e !== activeEl.selectionEnd)
      ) {
        try {
          activeEl.setSelectionRange(s, e);
        } catch (err) {}
      }

      const raw = val.substring(s, e);
      // 💡 한글이나 특수문자가 포함된 경우 해당 내용을 제거하고 순수 영문만 정제
      cleanText = cleanEnglishText(raw);
      if (cleanText && /[a-zA-Z]/.test(cleanText) && cleanText.length <= 1500) {
        if (cleanText.length > 1 || /^[aAiI]$/.test(cleanText)) {
          rect = activeEl.getBoundingClientRect();
        }
      } else {
        cleanText = "";
      }
    }

    // 2. 일반 DOM 텍스트 선택 확인 (window.getSelection - 롱프레스 & PC 드래그)
    if (!cleanText) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        try {
          const originalRange = selection.getRangeAt(0);
          const snappedRange = snapRangeToWordBoundaries(originalRange);
          const effectiveRange = snappedRange || originalRange;

          // 💡 사용자의 드래그 행위가 완전히 끝난 뒤(mouseup / touchend) 또는 Shift+Click 확장 시:
          // 화면의 실제 브라우저 Selection 하이라이트 범위도 단어 전체로 스냅하여 반영!
          if ((isDragEnded || lastMouseUpWasShift) && snappedRange) {
            try {
              isApplyingSnappedSelection = true;
              selection.removeAllRanges();
              selection.addRange(snappedRange);
              setTimeout(() => {
                isApplyingSnappedSelection = false;
              }, 60);
            } catch (err) {
              isApplyingSnappedSelection = false;
            }
          }

          const rawText = effectiveRange.toString();
          // 💡 한글이나 특수문자가 포함된 경우 해당 내용을 제거하고 순수 영문만 정제
          cleanText = cleanEnglishText(rawText);
          if (
            cleanText &&
            cleanText.length <= 1500 &&
            /[a-zA-Z]/.test(cleanText)
          ) {
            if (cleanText.length > 1 || /^[aAiI]$/.test(cleanText)) {
              const r = effectiveRange.getBoundingClientRect();
              if (r && (r.width > 0 || r.height > 0)) {
                rect = r;
              } else if (effectiveRange.getClientRects().length > 0) {
                rect = effectiveRange.getClientRects()[0];
              }
            }
          } else {
            cleanText = "";
          }
        } catch (e) {}
      }
    }

    isDragEnded = false;
    lastMouseUpWasShift = false;

    if (cleanText && rect) {
      showVocabTooltip(cleanText, rect);
    } else if (tooltipEl && tooltipEl.classList.contains("show")) {
      // 한글 포함 드래그 또는 빈 선택 시 기존 툴팁 숨김
      hideTooltip(false);
    }
  }

  function triggerSelectionDebounced(delay = 40) {
    if (Date.now() < closeCooldownUntil) return;
    if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
    selectionDebounceTimer = setTimeout(handleSelection, delay);
  }

  // 전역 초기화 함수
  function initVocabTooltip() {
    createTooltipDOM();

    // 1. PC 마우스 업 & 더블클릭
    document.addEventListener("mouseup", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      lastMouseUpWasShift = !!e.shiftKey;
      isDragEnded = true;
      triggerSelectionDebounced(20);
    });

    document.addEventListener("dblclick", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      isDragEnded = true;
      triggerSelectionDebounced(10);
    });

    // 2. 텍스트 선택 이벤트 (PC 드래그 또는 모바일 핀 조절 시)
    document.addEventListener("selectionchange", () => {
      if (
        isApplyingSnappedSelection ||
        isTouchMoving ||
        Date.now() < closeCooldownUntil
      )
        return;
      const delay = window.innerWidth <= 768 ? 200 : 100;
      triggerSelectionDebounced(delay);
    });

    let isTouchMoving = false;

    // 3. 모바일 전용 롱프레스(380ms) 및 더블탭 제스처 리스너
    document.addEventListener(
      "touchstart",
      (e) => {
        isTouchMoving = false;
        if (tooltipEl && tooltipEl.contains(e.target)) return;

        // 💡 버튼, 링크, 입력창 등 인터랙티브 컨트롤 영역 위에서는 롱프레스 단어 검색 방지
        if (
          e.target.closest &&
          e.target.closest(
            "button, a, input, select, textarea, .btn, .vocab-tooltip, [role='button'], .audio-controls, .speed-chip",
          )
        ) {
          if (longPressTimer) clearTimeout(longPressTimer);
          return;
        }

        // 두 손가락 이상(핀치 줌)일 경우 롱프레스 취소
        if (e.touches.length !== 1) {
          if (longPressTimer) clearTimeout(longPressTimer);
          lastTouchEndTime = 0;
          lastTouchPoint = null;
          return;
        }

        const touch = e.touches[0];
        touchStartPos = { x: touch.clientX, y: touch.clientY };
        isLongPressTriggered = false;

        // 380ms 동안 손가락을 대고 있으면 커스텀 롱프레스 발동
        if (longPressTimer) clearTimeout(longPressTimer);
        longPressTimer = setTimeout(() => {
          if (!touchStartPos || isTouchMoving) return;
          const detected = getWordAtPoint(touchStartPos.x, touchStartPos.y);
          if (detected) {
            isLongPressTriggered = true;
            lastShownTime = Date.now();
            if (navigator.vibrate) {
              try {
                navigator.vibrate(20);
              } catch (v) {}
            }
            showVocabTooltip(detected.word, detected.rect);
          }
        }, 380);
      },
      { passive: true },
    );

    // 터치 이동 시 (스크롤 동작): 롱프레스 취소 및 더블탭 메모리 즉시 무효화
    document.addEventListener(
      "touchmove",
      (e) => {
        if (touchStartPos && e.touches && e.touches[0]) {
          const touch = e.touches[0];
          const dist = Math.hypot(
            touch.clientX - touchStartPos.x,
            touch.clientY - touchStartPos.y,
          );
          if (dist > 8) {
            isTouchMoving = true;
            lastTouchEndTime = 0;
            lastTouchPoint = null;
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          }
        }
      },
      { passive: true },
    );

    // 터치 종료 (touchend): 스크롤이 아닐 때만 더블탭 및 선택 영역 감지 & 롱프레스 타이머 정리
    document.addEventListener(
      "touchend",
      (e) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }

        if (tooltipEl && tooltipEl.contains(e.target)) return;
        if (isLongPressTriggered) return;

        // ⚡ 손가락을 움직여 스크롤한 경우 무시
        if (isTouchMoving) {
          lastTouchEndTime = 0;
          lastTouchPoint = null;
          return;
        }

        // 📱 모바일에서 네이티브 텍스트 선택 핸들(핀) 이동 후 손을 뗐을 때 툴팁 노출 연동
        if (window.getSelection) {
          const sel = window.getSelection();
          if (sel && !sel.isCollapsed && sel.toString().trim()) {
            isDragEnded = true;
            triggerSelectionDebounced(80);
            return;
          }
        }

        const now = Date.now();
        const touch = e.changedTouches && e.changedTouches[0];

        // 📱 모바일 순수 더블 탭 감지 (움직이지 않고 400ms 이내 동일 지점 30px 반경 연속 탭)
        if (touch && now - lastTouchEndTime < 400 && lastTouchPoint) {
          const dist = Math.hypot(
            touch.clientX - lastTouchPoint.x,
            touch.clientY - lastTouchPoint.y,
          );
          if (dist < 30) {
            const detected = getWordAtPoint(touch.clientX, touch.clientY);
            if (detected) {
              lastShownTime = Date.now();
              if (navigator.vibrate) {
                try {
                  navigator.vibrate(20);
                } catch (v) {}
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
      },
      { passive: true },
    );

    // 📱 모바일 커스텀 롱프레스 발동 직후 시스템 컨텍스트 메뉴(복사/공유 바) 차단
    document.addEventListener("contextmenu", (e) => {
      if (isLongPressTriggered) {
        e.preventDefault();
        setTimeout(() => {
          isLongPressTriggered = false;
        }, 300);
      }
    });

    // 4. 화면 스크롤 시 열려있는 툴팁 닫기
    window.addEventListener(
      "scroll",
      () => {
        if (Date.now() - lastShownTime > 800) {
          hideTooltip(false);
        }
      },
      { passive: true },
    );

    // 5. 키보드 ESC 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        hideTooltip(true);
      }
    });

    // 6. 툴팁 외부 클릭/터치 시 1클릭 즉시 닫기 및 선택 영역 정리
    const handleOutsideDismiss = (e) => {
      if (!tooltipEl || !tooltipEl.classList.contains("show")) return;
      if (tooltipEl.contains(e.target)) return;
      // 💡 Shift 키를 누른 채 클릭한 경우 선택 영역 확장(Extend Selection) 동작이므로 닫거나 선택을 해제하지 않음
      if (e.shiftKey) return;
      hideTooltip(true);
    };

    document.addEventListener("mousedown", handleOutsideDismiss);
    document.addEventListener("touchstart", handleOutsideDismiss, {
      passive: true,
    });

    // 7. 화면 회전(orientationchange) 및 리사이즈 시 위치 동적 갱신
    const handleViewportResize = () => {
      if (tooltipEl && tooltipEl.classList.contains("show") && lastTargetRect) {
        positionTooltip(lastTargetRect);
      }
    };
    window.addEventListener("resize", handleViewportResize, { passive: true });
    window.addEventListener(
      "orientationchange",
      () => {
        setTimeout(handleViewportResize, 150);
      },
      { passive: true },
    );
  }

  // =============================================================================
  // 4. 나만의 단어장 모달 및 저장 목록 관리
  // =============================================================================

  /**
   * 대시보드 칩 및 모달 헤더의 저장 단어 수 뱃지 갱신
   */
  function updateSavedWordsBadge() {
    const list = getSavedWords();
    const count = list.length;
    const badge = document.getElementById("savedWordsBadge");
    if (badge) {
      badge.textContent = count > 0 ? `${count}개` : "0개";
    }
    const countHeader = document.getElementById("vocabModalCount");
    if (countHeader) {
      countHeader.textContent = `(${count}개 저장됨)`;
    }
  }

  /**
   * 단어장 모달 내 저장된 단어 리스트 DOM 렌더링 및 이벤트 바인딩
   */
  function renderSavedWordsList() {
    const list = getSavedWords();
    const container = document.getElementById("savedWordsListContainer");
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `
        <div class="vocab-empty-state">
          <div style="font-size: 36px; margin-bottom: 8px;">⭐</div>
          <p style="font-weight: 600; color: var(--text-main); margin-bottom: 4px;">저장된 단어가 없습니다.</p>
          <p style="font-size: 13px; color: var(--text-muted); margin: 0;">문장 연습이나 모범 답안에서 단어를 드래그/더블클릭한 후 별표(⭐)를 눌러 단어장에 추가해보세요!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list
      .map(
        (item, idx) => `
      <div class="saved-word-item" data-word="${escapeHtml(item.word)}">
        <div class="sw-main">
          <div class="sw-word-row">
            <span class="sw-word">${escapeHtml(item.word)}</span>
            <button type="button" class="sw-speak-btn" data-word="${escapeHtml(item.word)}" title="발음 듣기">🔊</button>
          </div>
          <div class="sw-meaning">${escapeHtml(item.meaning || "")}</div>
        </div>
        <button type="button" class="sw-del-btn" data-word="${escapeHtml(item.word)}" title="단어장에서 삭제">✕</button>
      </div>
    `,
      )
      .join("");

    // 발음 버튼 이벤트 바인딩
    container.querySelectorAll(".sw-speak-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const w = btn.dataset.word;
        if (w) {
          if (typeof speakText === "function") {
            speakText(w, "en-US", btn);
          } else if ("speechSynthesis" in window) {
            const u = new SpeechSynthesisUtterance(w);
            u.lang = "en-US";
            window.speechSynthesis.speak(u);
          }
        }
      });
    });

    // 개별 삭제 버튼 이벤트 바인딩
    container.querySelectorAll(".sw-del-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const w = btn.dataset.word;
        if (w) {
          deleteSavedWord(w);
        }
      });
    });
  }

  /**
   * 특정 단어를 단어장에서 삭제
   * @param {string} word - 삭제할 단어
   */
  function deleteSavedWord(word) {
    let list = getSavedWords();
    list = list.filter(
      (item) => item.word.toLowerCase() !== word.toLowerCase(),
    );
    try {
      localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(list));
    } catch (e) {}
    renderSavedWordsList();
    updateSavedWordsBadge();
    if (
      currentTargetWord &&
      currentTargetWord.toLowerCase() === word.toLowerCase()
    ) {
      updateStarBtnUI(false);
    }
  }

  /**
   * 사용자의 확인을 거쳐 단어장에 보관된 모든 단어 일괄 삭제
   */
  function clearAllSavedWords() {
    if (!confirm("단어장에 저장된 모든 단어를 삭제하시겠습니까?")) return;
    try {
      localStorage.removeItem(SAVED_WORDS_KEY);
    } catch (e) {}
    renderSavedWordsList();
    updateSavedWordsBadge();
    updateStarBtnUI(false);
  }

  /**
   * 나만의 단어장 모달 오픈
   */
  function openVocabModal() {
    const modal = document.getElementById("vocabModal");
    if (!modal) return;
    renderSavedWordsList();
    updateSavedWordsBadge();
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  /**
   * 나만의 단어장 모달 닫기
   */
  function closeVocabModal() {
    const modal = document.getElementById("vocabModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  // =============================================================================
  // 5. 초기화 및 전역(Window) 바인딩
  // =============================================================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initVocabTooltip();
      updateSavedWordsBadge();
    });
  } else {
    initVocabTooltip();
    updateSavedWordsBadge();
  }

  window.initVocabTooltip = initVocabTooltip;
  window.showVocabTooltip = showVocabTooltip;
  window.hideVocabTooltip = hideTooltip;
  window.getSavedWords = getSavedWords;
  window.openVocabModal = openVocabModal;
  window.closeVocabModal = closeVocabModal;
  window.clearAllSavedWords = clearAllSavedWords;
  window.updateSavedWordsBadge = updateSavedWordsBadge;
})();
