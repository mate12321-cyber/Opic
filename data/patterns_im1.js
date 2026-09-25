/**
 * @file patterns_im1.js
 * @description OPIc IM1 대비 6대 만능 템플릿 및 실시간 슬롯 스위처 데이터셋
 * - 장소/선호, 루틴/습관, 과거 경험/계기, 돌발 문제/해결, 롤플레이(질문/대안) 등 6대 핵심 뼈대 제공
 * - 공통 뼈대(skeleton) 문장에 주제별 치환 슬롯(variations)을 결합하여 무제한 답변 생성 지원
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 */

/**
 * @typedef {Object} PatternSentence
 * @property {string} en - 영문 문장 (슬롯 표기 포함)
 * @property {string} ko - 한글 해석 문장
 */

/**
 * @typedef {Object} PatternVariation
 * @property {string} topic - 치환 주제명 (예: "카페", "공원")
 * @property {PatternSentence[]} sentences - 치환된 6개 문장 세트
 */

/**
 * @typedef {Object} PatternTemplate
 * @property {string} id - 패턴 고유 식별자 (예: "pat_01")
 * @property {string} name - 패턴명
 * @property {string} category - 적용 가능한 대표 토픽 목록
 * @property {string} icon - 이모지 아이콘
 * @property {string} desc - 패턴 활용 가이드 설명
 * @property {PatternSentence[]} skeleton - 공통 뼈대 6문장 배열
 * @property {PatternVariation[]} variations - 주제별 치환 슬롯 데이터 목록
 */

/** @type {PatternTemplate[]} */
window.PATTERNS_DATA = [
  {
    id: "pat_01",
    name: "장소 & 선호 묘사",
    whenToUse: "좋아하는 장소 / 자주 가는 곳 / 첫 묘사 질문",
    comboRole: "주제별 콤보 1단계 (2, 5, 8번)",
    questionSignals: [
      "Tell me about your favorite...",
      "Describe [장소] and what it looks like.",
      "Where do you usually go when...?",
    ],
    exampleQuestion:
      "Describe your favorite place you like to visit and what it looks like.",
    category:
      "내 방, 카페, 공원, 영화관, 헬스장, 대형마트, 드라이브, 캠핑장, 해변, 단골 식당, 호텔, 도서관, 제주도",
    icon: "🏠",
    desc: "어떤 장소나 좋아하는 곳을 말할 때, 6개 쉬운 문장으로 1~2단어만 바꿔서 바로 끝내는 만능 공식입니다.",
    skeleton: [
      {
        en: "1. Well, let me see... You know, Eva, my favorite place is [장소명].",
        ko: "1. 음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 [장소명]이야.",
      },
      {
        en: "2. It is near my house, so it takes five minutes on foot.",
        ko: "2. 저희 집 근처에 있어서, 걸어서 5분 걸려요.",
      },
      {
        en: "3. How can I say... inside, it is very clean, comfortable, and cozy.",
        ko: "3. 뭐라고 말해야 할까... 안에는 아주 깔끔하고, 편안하고, 아늑해요.",
      },
      {
        en: "4. There are [특징 1] and [특징 2], so it feels very nice.",
        ko: "4. [특징 1]과 [특징 2]가 있어서 느낌이 정말 좋아요.",
      },
      {
        en: "5. When I go there, I usually [쉬운 행동], and just relax.",
        ko: "5. 거기 가면, 저는 보통 [쉬운 행동]을 하고 그냥 편하게 쉬어요.",
      },
      {
        en: "6. So, I go there about two or three times a week.",
        ko: "6. 그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
      },
    ],
    variations: [
      {
        topic: "🏠 내 방",
        keyword: "my room in my apartment",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is my room.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 제 방이에요.",
          },
          {
            en: "It is near my office, so it takes five minutes on foot.",
            ko: "회사 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 안에는 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are a soft bed and a nice desk, so it feels very nice.",
            ko: "푹신한 침대와 좋은 책상이 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I stay there, I usually watch YouTube, and just relax.",
            ko: "거기 머물 때, 저는 보통 유튜브를 보며 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I stay there all the time.",
            ko: "그래서 저는 거기서 맨날 시간을 보내요.",
          },
        ],
      },
      {
        topic: "☕ 카페",
        keyword: "Starbucks near my house",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is Starbucks.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 스타벅스예요.",
          },
          {
            en: "It is near my house, so it takes five minutes on foot.",
            ko: "저희 집 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 안에는 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are large windows and nice seats, so it feels very nice.",
            ko: "큰 창문과 편안한 좌석이 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually drink iced Americano, and just relax.",
            ko: "거기 가면, 저는 보통 아이스 아메리카노를 마시고 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there about two or three times a week.",
            ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "🌳 공원",
        keyword: "the park near my house",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is the park.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 공원이에요.",
          },
          {
            en: "It is near my house, so it takes five minutes on foot.",
            ko: "저희 집 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 공원 안은 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are green trees and nice benches, so it feels very nice.",
            ko: "푸른 나무들과 편안한 벤치가 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually take a walk, and just relax.",
            ko: "거기 가면, 저는 보통 산책을 하고 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there about two or three times a week.",
            ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "🎬 영화관",
        keyword: "Megabox near my house",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is Megabox.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 메가박스예요.",
          },
          {
            en: "It is near my house, so it takes five minutes on foot.",
            ko: "저희 집 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 안에는 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are large screens and nice seats, so it feels very nice.",
            ko: "큰 스크린과 편안한 좌석이 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually eat popcorn and watch movies, and just relax.",
            ko: "거기 가면, 저는 보통 팝콘을 먹고 영화를 보며 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there about two or three times a week.",
            ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "🏋️ 헬스장",
        keyword: "the gym near my house",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is my gym.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 헬스장이에요.",
          },
          {
            en: "It is near my house, so it takes five minutes on foot.",
            ko: "저희 집 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 안에는 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are clean machines and free weights, so it feels very nice.",
            ko: "깨끗한 머신들과 프리웨이트가 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually run on the treadmill, and just exercise.",
            ko: "거기 가면, 저는 보통 러닝머신을 달리고 그냥 운동해요.",
          },
          {
            en: "So, I go there about two or three times a week.",
            ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "🛒 대형마트",
        keyword: "E-Mart near my house",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is E-Mart.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 이마트예요.",
          },
          {
            en: "It is near my house, so it takes five minutes on foot.",
            ko: "저희 집 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 안에는 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are fresh food and nice snacks, so it feels very nice.",
            ko: "신선한 음식과 맛있는 간식이 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually buy groceries, and just look around.",
            ko: "거기 가면, 저는 보통 장을 보고 그냥 구경하며 둘러봐요.",
          },
          {
            en: "So, I go there about two or three times a week.",
            ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "🚗 드라이브",
        keyword: "the quiet countryside route",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is the quiet route.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 한적한 코스예요.",
          },
          {
            en: "It is near my house, so it takes five minutes by car.",
            ko: "저희 집 근처에 있어서, 차로 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 차 안은 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are scenic views and quiet roads, so it feels very nice.",
            ko: "멋진 풍경과 한적한 도로가 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually listen to music, and just relax.",
            ko: "거기 가면, 저는 보통 음악을 듣고 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there about two or three times a week.",
            ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "🏕️ 캠핑장",
        keyword: "the campsite near the lake",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is the campsite.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 캠핑장이에요.",
          },
          {
            en: "It is near my house, so it takes thirty minutes by car.",
            ko: "저희 집 근처에 있어서, 차로 30분 걸려요.",
          },
          {
            en: "How can I say... the campsite is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 캠핑장은 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are tall green trees and a clean lake, so it feels very nice.",
            ko: "키 큰 푸른 나무들과 깨끗한 호수가 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually grill delicious meat, and just relax.",
            ko: "거기 가면, 저는 보통 맛있는 고기를 굽고 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there about two or three times a month.",
            ko: "그래서 저는 거기를 대략 한 달에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "🏖️ 해변",
        keyword: "Haeundae beach & blue ocean",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is Haeundae beach.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 해운대 해변이에요.",
          },
          {
            en: "It is near my hotel, so it takes five minutes on foot.",
            ko: "제가 묵는 호텔 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... the beach is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 해변은 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are blue ocean and soft white sand, so it feels very nice.",
            ko: "푸른 바다와 부드러운 하얀 모래가 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually look at the ocean, and just relax.",
            ko: "거기 가면, 저는 보통 바다를 바라보고 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there whenever I travel.",
            ko: "그래서 저는 여행을 갈 때마다 거기를 가요.",
          },
        ],
      },
      {
        topic: "🍽️ 단골 식당",
        keyword: "Italian pasta restaurant",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is the pasta restaurant.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 파스타 식당이에요.",
          },
          {
            en: "It is near my house, so it takes five minutes on foot.",
            ko: "저희 집 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 안에는 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are delicious pasta and nice wine, so it feels very nice.",
            ko: "맛있는 파스타와 좋은 와인이 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually eat spicy pasta, and just relax.",
            ko: "거기 가면, 저는 보통 매콤한 파스타를 먹고 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there about two or three times a week.",
            ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "🏨 호텔",
        keyword: "clean hotel with swimming pool",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is the Shilla Hotel.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 신라 호텔이에요.",
          },
          {
            en: "It is near the beach, so it takes five minutes on foot.",
            ko: "해변 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 안에는 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are a clean swimming pool and a soft bed, so it feels very nice.",
            ko: "깨끗한 수영장과 푹신한 침대가 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually swim in the pool, and just relax.",
            ko: "거기 가면, 저는 보통 수영장에서 수영을 하고 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there about two or three times a year.",
            ko: "그래서 저는 거기를 대략 일년에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "📚 도서관",
        keyword: "public library near home",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is the public library.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 공공 도서관이에요.",
          },
          {
            en: "It is near my house, so it takes five minutes on foot.",
            ko: "저희 집 근처에 있어서, 걸어서 5분 걸려요.",
          },
          {
            en: "How can I say... inside, it is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 안에는 아주 깔끔하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are lots of books and nice desks, so it feels very nice.",
            ko: "많은 책들과 편안한 책상이 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually read bestsellers, and just relax.",
            ko: "거기 가면, 저는 보통 베스트셀러를 읽고 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there about two or three times a week.",
            ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
          },
        ],
      },
      {
        topic: "🏝️ 제주도",
        keyword: "Jeju island beach & seafood",
        sentences: [
          {
            en: "Well, let me see... You know, Eva, my favorite place is Jeju Island.",
            ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 제주도예요.",
          },
          {
            en: "It is in the south, so it takes one hour by plane.",
            ko: "남쪽에 있어서, 비행기로 1시간 걸려요.",
          },
          {
            en: "How can I say... the island is very clean, comfortable, and cozy.",
            ko: "뭐라고 말해야 할까... 섬 전체가 아주 깨끗하고, 편안하고, 아늑해요.",
          },
          {
            en: "There are beautiful nature and fresh seafood, so it feels very nice.",
            ko: "아름다운 자연과 신선한 해산물이 있어서 느낌이 정말 좋아요.",
          },
          {
            en: "When I go there, I usually drive along the coast, and just relax.",
            ko: "거기 가면, 저는 보통 해안가를 따라 드라이브하고 그냥 편하게 쉬어요.",
          },
          {
            en: "So, I go there every summer vacation.",
            ko: "그래서 저는 여름 휴가마다 거기를 가요.",
          },
        ],
      },
    ],
  },
  {
    id: "pat_02",
    name: "일상 & 활동 루틴",
    whenToUse: "평소 하는 활동 / 주말 여가 일과 / 루틴 순서 질문",
    comboRole: "주제별 콤보 2단계 (3, 6, 9번)",
    questionSignals: [
      "What do you usually do when you...?",
      "Walk me through your typical routine...",
      "How do you spend your free time / weekends?",
    ],
    exampleQuestion:
      "What do you usually do when you visit the park? Tell me your routine from beginning to end.",
    category:
      "카페, 공원 산책, 헬스장, 요리, 코딩, 영화 관람, 마트 장보기, 드라이브, 주말 캠핑, 독서, 음악 감상, 집안 청소, 해변 산책",
    icon: "⏰",
    desc: "주말이나 평소 일과를 묻는 질문에 시간 순서(First ➔ Then ➔ When ➔ After that)로 쉽고 자연스럽게 답하는 만능 공식입니다.",
    skeleton: [
      {
        en: "1. Well, you know, when I have free time, I usually love to [활동/장소].",
        ko: "1. 음, 있잖아, 자유 시간이 날 때면, 저는 보통 [활동/장소]하는 걸 정말 좋아해요.",
      },
      {
        en: "2. First, I change into comfortable clothes, and get ready.",
        ko: "2. 우선, 편안한 옷으로 갈아입고, 준비를 해요.",
      },
      {
        en: "3. Then, I usually go there, listening to my favorite music.",
        ko: "3. 그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 거기로 가요.",
      },
      {
        en: "4. When I go there, I usually [행동 1] and [행동 2].",
        ko: "4. 거기 가면, 저는 보통 [행동 1]과 [행동 2]를 해요.",
      },
      {
        en: "5. After that, I come back home, and take a rest.",
        ko: "5. 그 후에는, 집에 돌아와서 휴식을 취해요.",
      },
      {
        en: "6. That is my [주제] routine.",
        ko: "6. 이게 바로 저의 [주제] 루틴이에요.",
      },
    ],
    variations: [
      {
        topic: "☕ 카페",
        keyword: "visit Starbucks alone",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to go to Starbucks.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 스타벅스에 가는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually go there, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 거기로 가요.",
          },
          {
            en: "When I go there, I usually drink iced coffee and read news.",
            ko: "거기 가면, 저는 보통 아이스 커피를 마시고 뉴스를 읽어요.",
          },
          {
            en: "After that, I come back home, and take a rest.",
            ko: "그 후에는, 집에 돌아와서 휴식을 취해요.",
          },
          {
            en: "That is my cafe routine.",
            ko: "이게 바로 저의 카페 루틴이에요.",
          },
        ],
      },
      {
        topic: "🚶 공원 산책",
        keyword: "walk in the park",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to walk in the park.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 공원에서 산책하는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually go there, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 거기로 가요.",
          },
          {
            en: "When I go there, I usually walk slowly and take photos.",
            ko: "거기 가면, 저는 보통 천천히 걷고 사진을 찍어요.",
          },
          {
            en: "After that, I come back home, and take a rest.",
            ko: "그 후에는, 집에 돌아와서 휴식을 취해요.",
          },
          {
            en: "That is my park routine.",
            ko: "이게 바로 저의 공원 루틴이에요.",
          },
        ],
      },
      {
        topic: "🏋️ 헬스장 운동",
        keyword: "work out at the gym",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to work out at the gym.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 헬스장에서 운동하는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually go there, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 거기로 가요.",
          },
          {
            en: "When I go there, I usually run on the treadmill and lift weights.",
            ko: "거기 가면, 저는 보통 러닝머신을 뛰고 웨이트를 해요.",
          },
          {
            en: "After that, I come back home, and take a rest.",
            ko: "그 후에는, 집에 돌아와서 휴식을 취해요.",
          },
          {
            en: "That is my workout routine.",
            ko: "이게 바로 저의 운동 루틴이에요.",
          },
        ],
      },
      {
        topic: "🍳 요리",
        keyword: "cook delicious food at home",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to cook delicious food.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 맛있는 요리하는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually start cooking, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 요리를 시작해요.",
          },
          {
            en: "In the kitchen, I usually make simple pasta and eat nicely.",
            ko: "주방에서, 저는 보통 간단한 파스타를 만들어 맛있게 먹어요.",
          },
          {
            en: "After that, I wash the dishes, and take a rest.",
            ko: "그 후에는, 설거지를 하고 휴식을 취해요.",
          },
          {
            en: "That is my cooking routine.",
            ko: "이게 바로 저의 요리 루틴이에요.",
          },
        ],
      },
      {
        topic: "💻 취미 코딩",
        keyword: "study coding at desk",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to study coding.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 코딩 공부하는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually turn on my computer, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 컴퓨터를 켜요.",
          },
          {
            en: "At my desk, I usually make web tools and test my code.",
            ko: "책상에서, 저는 보통 웹 도구를 만들고 제 코드를 테스트해요.",
          },
          {
            en: "After that, I shut down my computer, and take a rest.",
            ko: "그 후에는, 컴퓨터를 끄고 휴식을 취해요.",
          },
          {
            en: "That is my coding routine.",
            ko: "이게 바로 저의 코딩 루틴이에요.",
          },
        ],
      },
      {
        topic: "🎬 영화 관람",
        keyword: "watch new movies at Megabox",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to watch movies.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 영화 보는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually go there, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 거기로 가요.",
          },
          {
            en: "When I go there, I usually buy sweet popcorn and watch movies.",
            ko: "거기 가면, 저는 보통 달콤한 팝콘을 사고 영화를 봐요.",
          },
          {
            en: "After that, I come back home, and take a rest.",
            ko: "그 후에는, 집에 돌아와서 휴식을 취해요.",
          },
          {
            en: "That is my movie routine.",
            ko: "이게 바로 저의 영화 루틴이에요.",
          },
        ],
      },
      {
        topic: "🛒 마트 장보기",
        keyword: "grocery shopping at E-Mart",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to go grocery shopping.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 장보러 가는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually go there, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 거기로 가요.",
          },
          {
            en: "When I go there, I usually buy fresh food and nice snacks.",
            ko: "거기 가면, 저는 보통 신선한 음식과 맛있는 간식을 사요.",
          },
          {
            en: "After that, I come back home, and take a rest.",
            ko: "그 후에는, 집에 돌아와서 휴식을 취해요.",
          },
          {
            en: "That is my shopping routine.",
            ko: "이게 바로 저의 쇼핑 루틴이에요.",
          },
        ],
      },
      {
        topic: "🚗 드라이브",
        keyword: "drive on the quiet route",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to go for a drive.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 드라이브 가는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually get in my car, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 차에 타요.",
          },
          {
            en: "When I drive, I usually open the windows and feel the fresh air.",
            ko: "운전할 때, 저는 보통 창문을 열고 신선한 공기를 느껴요.",
          },
          {
            en: "After that, I come back home, and take a rest.",
            ko: "그 후에는, 집에 돌아와서 휴식을 취해요.",
          },
          {
            en: "That is my drive routine.",
            ko: "이게 바로 저의 드라이브 루틴이에요.",
          },
        ],
      },
      {
        topic: "🏕️ 주말 캠핑",
        keyword: "camping by the lake",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to go camping.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 캠핑 가는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually drive there, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 차를 몰고 가요.",
          },
          {
            en: "When I go there, I usually pitch a tent and grill delicious meat.",
            ko: "거기 가면, 저는 보통 텐트를 치고 맛있는 고기를 구워요.",
          },
          {
            en: "After that, I come back home, and take a rest.",
            ko: "그 후에는, 집에 돌아와서 휴식을 취해요.",
          },
          {
            en: "That is my camping routine.",
            ko: "이게 바로 저의 캠핑 루틴이에요.",
          },
        ],
      },
      {
        topic: "📚 독서·도서관",
        keyword: "read books at library",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to read books at the library.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 도서관에서 책 읽는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually go there, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 거기로 가요.",
          },
          {
            en: "When I go there, I usually find nice books and read quietly.",
            ko: "거기 가면, 저는 보통 좋은 책을 찾아서 조용히 읽어요.",
          },
          {
            en: "After that, I come back home, and take a rest.",
            ko: "그 후에는, 집에 돌아와서 휴식을 취해요.",
          },
          {
            en: "That is my library routine.",
            ko: "이게 바로 저의 도서관 루틴이에요.",
          },
        ],
      },
      {
        topic: "🎵 음악 감상",
        keyword: "listen to acoustic music",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to listen to music.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 음악 듣는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually put on my earphones, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으며 이어폰을 껴요.",
          },
          {
            en: "In my room, I usually lie on the bed and close my eyes.",
            ko: "제 방에서, 저는 보통 침대에 누워 눈을 감아요.",
          },
          {
            en: "After that, I fall asleep easily, and take a rest.",
            ko: "그 후에는, 스르륵 잠에 들며 휴식을 취해요.",
          },
          {
            en: "That is my music routine.",
            ko: "이게 바로 저의 음악 감상 루틴이에요.",
          },
        ],
      },
      {
        topic: "🧹 집안 청소",
        keyword: "vacuum room & clean house",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to clean my house.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 집 청소하는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually start cleaning, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 청소를 시작해요.",
          },
          {
            en: "In my room, I usually vacuum the floor and open the windows.",
            ko: "제 방에서, 저는 보통 청소기를 돌리고 창문을 열어요.",
          },
          {
            en: "After that, I take a quick shower, and take a rest.",
            ko: "그 후에는, 가볍게 샤워를 하고 휴식을 취해요.",
          },
          {
            en: "That is my cleaning routine.",
            ko: "이게 바로 저의 청소 루틴이에요.",
          },
        ],
      },
      {
        topic: "🏖️ 해변 산책",
        keyword: "walk along the sandy beach",
        sentences: [
          {
            en: "Well, you know, when I have free time, I usually love to walk along the beach.",
            ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 해변을 따라 산책하는 걸 정말 좋아해요.",
          },
          {
            en: "First, I change into comfortable clothes, and get ready.",
            ko: "우선, 편안한 옷으로 갈아입고, 준비를 해요.",
          },
          {
            en: "Then, I usually go there, listening to my favorite music.",
            ko: "그리고 나서, 저는 제가 가장 좋아하는 음악을 들으면서 거기로 가요.",
          },
          {
            en: "When I go there, I usually walk slowly and look at the ocean.",
            ko: "거기 가면, 저는 보통 천천히 걸으며 바다를 바라봐요.",
          },
          {
            en: "After that, I come back to my room, and take a rest.",
            ko: "그 후에는, 숙소로 돌아와서 휴식을 취해요.",
          },
          {
            en: "That is my beach routine.",
            ko: "이게 바로 저의 해변 산책 루틴이에요.",
          },
        ],
      },
    ],
  },
  {
    id: "pat_03",
    name: "과거 경험 & 기억에 남는 일",
    whenToUse: "기억에 남는 경험 / 최근 일어난 일 / 과거 특별한 추억 질문",
    comboRole: "주제별 콤보 3단계 (4, 7, 10번)",
    questionSignals: [
      "Tell me about a memorable experience...",
      "What kind of ... was it, and what was the story?",
      "When was the last time you went...?",
    ],
    exampleQuestion:
      "Tell me about a memorable day or experience you had recently. What did you do and how was it?",
    category:
      "영화, 축제, 새집 이사, 캠핑, 카페, 해변, 공원, 헬스장, 단골 식당, 호텔, 대형마트, 드라이브, 도서관, 제주도",
    icon: "✨",
    desc: "어떤 주제든 과거에 있었던 기억에 남는 일을 물을 때, 6개 쉬운 문장으로 어떤 질문에도 자연스럽게 완주하는 만능 공식입니다.",
    skeleton: [
      {
        en: "1. Talking about [주제], I remember a very special day.",
        ko: "1. [주제] 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
      },
      {
        en: "2. Last year, I [과거 행동/대상] with my friend.",
        ko: "2. 작년에, 저는 친구와 함께 [과거 행동/대상]을 했어요.",
      },
      {
        en: "3. The [스토리/음식/경치/분위기] was very [특징 1] and [특징 2].",
        ko: "3. [스토리/음식/경치/분위기]가 아주 [특징 1]하고 [특징 2]했어요.",
      },
      {
        en: "4. I had a really good time, so I really liked it.",
        ko: "4. 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
      },
      {
        en: "5. It was the best day for me.",
        ko: "5. 저한테는 최고의 날이었어요.",
      },
      {
        en: "6. So, I want to go there again.",
        ko: "6. 그래서 저는 거기 또 가고 싶어요.",
      },
    ],
    variations: [
      {
        topic: "🎬 영화",
        keyword: "watching an action movie with my friend",
        sentences: [
          {
            en: "Talking about movies, I remember a very special day.",
            ko: "영화 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I watched an exciting action movie with my friend.",
            ko: "작년에, 저는 친구와 함께 재미있는 액션 영화를 보았어요.",
          },
          {
            en: "The story was very interesting and exciting.",
            ko: "스토리가 정말 흥미롭고 흥미진진했어요.",
          },
          {
            en: "I had a really good time, so I really liked it.",
            ko: "정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to watch it again.",
            ko: "그래서 저는 그걸 또 보고 싶어요.",
          },
        ],
      },
      {
        topic: "🎪 축제",
        keyword: "local festival with friends",
        sentences: [
          {
            en: "Talking about festivals, I remember a very special day.",
            ko: "축제 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I went to a festival with my friends.",
            ko: "작년에, 저는 친구들과 함께 축제에 갔어요.",
          },
          {
            en: "The music was very exciting, and the food was delicious.",
            ko: "음악이 아주 신나고, 음식도 맛있었어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "🏡 새집 이사",
        keyword: "moving into my new apartment",
        sentences: [
          {
            en: "Talking about my home, I remember a very special day.",
            ko: "제 집 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I moved into my new apartment.",
            ko: "작년에, 저는 새 아파트로 이사했어요.",
          },
          {
            en: "The new room was very clean, quiet, and cozy.",
            ko: "새 방이 아주 깔끔하고 조용하며 아늑했어요.",
          },
          {
            en: "I had a really good time unpacking, so I really liked it.",
            ko: "짐을 풀며 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I stay there all the time.",
            ko: "그래서 저는 거기서 맨날 시간을 보내요.",
          },
        ],
      },
      {
        topic: "🏕️ 캠핑",
        keyword: "camping near the lake with friend",
        sentences: [
          {
            en: "Talking about camping, I remember a very special day.",
            ko: "캠핑 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I went camping near the lake with my friend.",
            ko: "작년에, 저는 친구와 함께 호숫가 근처로 캠핑을 갔어요.",
          },
          {
            en: "The view was very beautiful and peaceful.",
            ko: "경치가 아주 아름답고 평화로웠어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "☕ 카페",
        keyword: "meeting an old friend at Starbucks",
        sentences: [
          {
            en: "Talking about cafes, I remember a very special day.",
            ko: "카페 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I met an old friend at Starbucks.",
            ko: "작년에, 저는 스타벅스에서 오랜 친구를 만났어요.",
          },
          {
            en: "The coffee was delicious, and the vibe was very cozy.",
            ko: "커피가 맛있었고, 분위기도 아주 아늑했어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "🏖️ 해변",
        keyword: "trip to Haeundae beach",
        sentences: [
          {
            en: "Talking about the beach, I remember a very special day.",
            ko: "해변 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I went to Haeundae beach with my friends.",
            ko: "작년에, 저는 친구들과 함께 해운대 해변에 갔어요.",
          },
          {
            en: "The ocean view was very beautiful and nice.",
            ko: "바다 경치가 아주 아름답고 좋았어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "🌳 공원",
        keyword: "walking in the park with friend",
        sentences: [
          {
            en: "Talking about parks, I remember a very special day.",
            ko: "공원 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I walked in the park with my friends.",
            ko: "작년에, 저는 친구들과 함께 공원을 걸었어요.",
          },
          {
            en: "The weather was very sunny and nice.",
            ko: "날씨가 아주 화창하고 좋았어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "🏋️ 헬스장",
        keyword: "working out at the gym with friend",
        sentences: [
          {
            en: "Talking about working out, I remember a very special day.",
            ko: "운동 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I worked out at the gym with my friend.",
            ko: "작년에, 저는 친구와 함께 헬스장에서 운동을 했어요.",
          },
          {
            en: "The workout was very fun and refreshing.",
            ko: "운동이 아주 재미있고 상쾌했어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "🍽️ 단골 식당",
        keyword: "delicious dinner at pasta place",
        sentences: [
          {
            en: "Talking about good food, I remember a very special day.",
            ko: "맛있는 음식 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I had delicious dinner at the pasta restaurant.",
            ko: "작년에, 저는 파스타 식당에서 맛있는 저녁을 먹었어요.",
          },
          {
            en: "The food was very delicious and fresh.",
            ko: "음식이 아주 맛있고 신선했어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "🏨 호텔",
        keyword: "staying at Shilla Hotel",
        sentences: [
          {
            en: "Talking about traveling, I remember a very special day.",
            ko: "여행 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I stayed at the Shilla Hotel with my family.",
            ko: "작년에, 저는 가족과 함께 신라 호텔에 묵었어요.",
          },
          {
            en: "The room was very clean and comfortable.",
            ko: "방이 아주 깨끗하고 편안했어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "🛒 대형마트",
        keyword: "shopping at E-Mart",
        sentences: [
          {
            en: "Talking about shopping, I remember a very special day.",
            ko: "쇼핑 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I went to E-Mart with my friends.",
            ko: "작년에, 저는 친구들과 함께 이마트에 갔어요.",
          },
          {
            en: "The snacks were delicious, and the items were cheap.",
            ko: "간식도 맛있고, 물건들도 저렴했어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "🚗 드라이브",
        keyword: "scenic drive on weekend",
        sentences: [
          {
            en: "Talking about relaxing, I remember a very special day.",
            ko: "휴식 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I went on a drive with my friend.",
            ko: "작년에, 저는 친구와 함께 드라이브를 떠났어요.",
          },
          {
            en: "The scenery was very beautiful and nice.",
            ko: "풍경이 아주 아름답고 좋았어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "📚 도서관",
        keyword: "studying at the library",
        sentences: [
          {
            en: "Talking about studying, I remember a very special day.",
            ko: "공부 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I studied at the library with my friend.",
            ko: "작년에, 저는 친구와 함께 도서관에서 공부했어요.",
          },
          {
            en: "The atmosphere was very quiet and calm.",
            ko: "분위기가 아주 조용하고 차분했어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
      {
        topic: "🏝️ 제주도",
        keyword: "wonderful trip to Jeju Island",
        sentences: [
          {
            en: "Talking about vacations, I remember a very special day.",
            ko: "휴가 얘기가 나와서 말인데, 아주 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I traveled to Jeju Island with my friends.",
            ko: "작년에, 저는 친구들과 함께 제주도로 여행을 갔어요.",
          },
          {
            en: "The nature was very beautiful and peaceful.",
            ko: "자연이 아주 아름답고 평화로웠어요.",
          },
          {
            en: "I had a really good time there, so I really liked it.",
            ko: "거기서 정말 좋은 시간을 보내서, 정말 마음에 들었어요.",
          },
          {
            en: "It was the best day for me.",
            ko: "저한테는 최고의 날이었어요.",
          },
          {
            en: "So, I want to go there again.",
            ko: "그래서 저는 거기 또 가고 싶어요.",
          },
        ],
      },
    ],
  },
  {
    id: "pat_04",
    name: "문제 해결 & 돌발 상황",
    whenToUse: "기기 고장 / 예상치 못한 문제 / 돌발 상황 대처 경험 질문",
    comboRole: "돌발 문제 해결 (8~10번 또는 14번)",
    questionSignals: [
      "Have you ever experienced a problem...?",
      "Something unexpected happened...",
      "How did you deal with it / solve the problem?",
    ],
    exampleQuestion:
      "Have you ever had an unexpected problem with appliances or furniture? What was the issue and how did you solve it?",
    category: "에어컨 고장, 스마트폰 방전, 요리 연기, 갑작스런 비, 약속 지연",
    icon: "⚡",
    desc: "돌발 문제 질문에 장소·경험 템플릿과 똑같은 6문장으로 쉽고 자연스럽게 답하는 만능 공식입니다.",
    skeleton: [
      {
        en: "1. Whenever I think of [주제], I remember a big problem.",
        ko: "1. [주제]를 생각할 때마다, 큰 문제가 하나 기억나요.",
      },
      {
        en: "2. Last year, I was [장소/활동], and suddenly [돌발 상황].",
        ko: "2. 작년에, [장소/활동]을 하던 중 갑자기 [돌발 상황]이 일어났어요.",
      },
      {
        en: "3. I was very surprised and worried.",
        ko: "3. 저는 너무 놀라고 걱정이 되었어요.",
      },
      {
        en: "4. So, I quickly [대처 행동], and fixed it.",
        ko: "4. 그래서 빠르게 [대처 행동]을 해서 해결했어요.",
      },
      {
        en: "5. It was a hard day for me.",
        ko: "5. 저한테는 참 힘든 하루였어요.",
      },
      {
        en: "6. So, it became a good memory.",
        ko: "6. 그래도 결국 좋은 추억이 되었어요.",
      },
    ],
    variations: [
      {
        topic: "❄️ 에어컨 고장",
        keyword: "AC stopped working in summer",
        sentences: [
          {
            en: "Whenever I think of my home, I remember a big problem.",
            ko: "저희 집을 생각할 때마다, 큰 문제가 하나 기억나요.",
          },
          {
            en: "Last year, I was at home, and suddenly my air conditioner broke down.",
            ko: "작년에, 집에 있었는데 갑자기 에어컨이 고장 났어요.",
          },
          {
            en: "I was very surprised and worried.",
            ko: "저는 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "So, I quickly called the service center, and fixed it.",
            ko: "그래서 빠르게 서비스 센터에 전화해서 고쳤어요.",
          },
          {
            en: "It was a hard day for me.",
            ko: "저한테는 참 힘든 하루였어요.",
          },
          {
            en: "So, it became a good memory.",
            ko: "그래도 결국 좋은 추억이 되었어요.",
          },
        ],
      },
      {
        topic: "📱 스마트폰 방전",
        keyword: "phone battery died outside",
        sentences: [
          {
            en: "Whenever I think of my phone, I remember a big problem.",
            ko: "휴대폰을 생각할 때마다, 큰 문제가 하나 기억나요.",
          },
          {
            en: "Last year, I was outside, and suddenly my phone battery died.",
            ko: "작년에, 밖에 있었는데 갑자기 휴대폰 배터리가 방전되었어요.",
          },
          {
            en: "I was very surprised and worried.",
            ko: "저는 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "So, I quickly borrowed a charger, and fixed it.",
            ko: "그래서 빠르게 충전기를 빌려서 해결했어요.",
          },
          {
            en: "It was a hard day for me.",
            ko: "저한테는 참 힘든 하루였어요.",
          },
          {
            en: "So, it became a good memory.",
            ko: "그래도 결국 좋은 추억이 되었어요.",
          },
        ],
      },
      {
        topic: "🍳 요리 연기",
        keyword: "smoke while cooking dinner",
        sentences: [
          {
            en: "Whenever I think of cooking, I remember a big problem.",
            ko: "요리를 생각할 때마다, 큰 문제가 하나 기억나요.",
          },
          {
            en: "Last year, I was cooking dinner, and suddenly there was a lot of smoke.",
            ko: "작년에, 저녁 요리를 하던 중 갑자기 연기가 많이 났어요.",
          },
          {
            en: "I was very surprised and worried.",
            ko: "저는 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "So, I quickly opened all the windows, and fixed it.",
            ko: "그래서 빠르게 모든 창문을 열어서 해결했어요.",
          },
          {
            en: "It was a hard day for me.",
            ko: "저한테는 참 힘든 하루였어요.",
          },
          {
            en: "So, it became a good memory.",
            ko: "그래도 결국 좋은 추억이 되었어요.",
          },
        ],
      },
      {
        topic: "🌧️ 갑작스런 비",
        keyword: "heavy rain while walking",
        sentences: [
          {
            en: "Whenever I think of the park, I remember a big problem.",
            ko: "공원을 생각할 때마다, 큰 문제가 하나 기억나요.",
          },
          {
            en: "Last year, I was walking in the park, and suddenly it started raining hard.",
            ko: "작년에, 공원을 걷던 중 갑자기 비가 세차게 내렸어요.",
          },
          {
            en: "I was very surprised and worried.",
            ko: "저는 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "So, I quickly ran into a cafe, and solved it.",
            ko: "그래서 빠르게 카페로 뛰어가서 해결했어요.",
          },
          {
            en: "It was a hard day for me.",
            ko: "저한테는 참 힘든 하루였어요.",
          },
          {
            en: "So, it became a good memory.",
            ko: "그래도 결국 좋은 추억이 되었어요.",
          },
        ],
      },
      {
        topic: "👥 친구 약속 지연",
        keyword: "friend was very late",
        sentences: [
          {
            en: "Whenever I think of meeting friends, I remember a big problem.",
            ko: "친구 만나는 걸 생각할 때마다, 큰 문제가 하나 기억나요.",
          },
          {
            en: "Last year, I was waiting at a cafe, and suddenly my friend was very late.",
            ko: "작년에, 카페에서 기다리던 중 갑자기 친구가 많이 늦었어요.",
          },
          {
            en: "I was very surprised and worried.",
            ko: "저는 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "So, I quickly called my friend, and solved it.",
            ko: "그래서 빠르게 친구에게 전화해서 해결했어요.",
          },
          {
            en: "It was a hard day for me.",
            ko: "저한테는 참 힘든 하루였어요.",
          },
          {
            en: "So, it became a good memory.",
            ko: "그래도 결국 좋은 추억이 되었어요.",
          },
        ],
      },
    ],
  },
  {
    id: "pat_05",
    name: "과거 vs 현재 변화 & 비교",
    whenToUse: "과거와 현재 비교 / 예전과 달라진 점 / 트렌드 변화 질문",
    comboRole: "과거/현재 비교 심화 (14, 15번)",
    questionSignals: [
      "How has [주제] changed over the years?",
      "Compare [주제] in the past and now...",
      "What are the major differences between the two?",
    ],
    exampleQuestion:
      "How have cafes changed from when you were a child to now? Compare the past and the present.",
    category: "카페 변화, 영화 변화, 주거 변화, 음악 변화, 쇼핑 변화",
    icon: "🔄",
    desc: "과거와 현재의 차이를 묻는 질문에 장소·경험 템플릿과 똑같은 6문장으로 깔끔하게 비교하는 공식입니다.",
    skeleton: [
      {
        en: "1. Whenever I think of [주제], it changed a lot.",
        ko: "1. [주제]를 생각할 때마다, 정말 많이 변했어요.",
      },
      {
        en: "2. In the past, [주제] was small and simple.",
        ko: "2. 과거에는 [주제]가 작고 단순했어요.",
      },
      {
        en: "3. However, now, everything is very clean and convenient.",
        ko: "3. 하지만 지금은 모든 것이 아주 깔끔하고 편리해요.",
      },
      {
        en: "4. For example, we can use smart phones, so it is very fast.",
        ko: "4. 예를 들어 우리는 스마트폰을 쓸 수 있어서 아주 빨라요.",
      },
      {
        en: "5. It is the best change for me.",
        ko: "5. 저한테는 최고의 변화예요.",
      },
      {
        en: "6. So, I really like these changes.",
        ko: "6. 그래서 저는 이런 변화들이 정말 마음에 들어요.",
      },
    ],
    variations: [
      {
        topic: "☕ 카페 변화",
        keyword: "mobile order apps and bakeries",
        sentences: [
          {
            en: "Whenever I think of cafes, it changed a lot.",
            ko: "카페를 생각할 때마다, 정말 많이 변했어요.",
          },
          {
            en: "In the past, cafes were small and simple.",
            ko: "과거에는 카페가 작고 단순했어요.",
          },
          {
            en: "However, now, cafes are very clean and convenient.",
            ko: "하지만 지금은 카페가 아주 깔끔하고 편리해요.",
          },
          {
            en: "For example, we can use mobile order apps, so it is very fast.",
            ko: "예를 들어 모바일 주문 앱을 쓸 수 있어서 아주 빨라요.",
          },
          {
            en: "It is the best change for me.",
            ko: "저한테는 최고의 변화예요.",
          },
          {
            en: "So, I really like these changes.",
            ko: "그래서 저는 이런 변화들이 정말 마음에 들어요.",
          },
        ],
      },
      {
        topic: "🎬 영화 변화",
        keyword: "streaming Netflix at home",
        sentences: [
          {
            en: "Whenever I think of movies, it changed a lot.",
            ko: "영화를 생각할 때마다, 정말 많이 변했어요.",
          },
          {
            en: "In the past, we had to go to the theater.",
            ko: "과거에는 무조건 극장에 가야만 했어요.",
          },
          {
            en: "However, now, watching movies is very easy and convenient.",
            ko: "하지만 지금은 영화 보기가 아주 쉽고 편리해요.",
          },
          {
            en: "For example, we can watch Netflix at home, so it is very comfortable.",
            ko: "예를 들어 집에서 넷플릭스를 볼 수 있어서 아주 편안해요.",
          },
          {
            en: "It is the best change for me.",
            ko: "저한테는 최고의 변화예요.",
          },
          {
            en: "So, I really like these changes.",
            ko: "그래서 저는 이런 변화들이 정말 마음에 들어요.",
          },
        ],
      },
      {
        topic: "🏡 주거 변화",
        keyword: "smart apartments and gyms",
        sentences: [
          {
            en: "Whenever I think of apartments, it changed a lot.",
            ko: "아파트를 생각할 때마다, 정말 많이 변했어요.",
          },
          {
            en: "In the past, apartments were old and simple.",
            ko: "과거에는 아파트가 낡고 단순했어요.",
          },
          {
            en: "However, now, apartments are very clean and modern.",
            ko: "하지만 지금은 아파트가 아주 깔끔하고 현대적이에요.",
          },
          {
            en: "For example, we have nice gyms and smart apps, so it is very convenient.",
            ko: "예를 들어 좋은 헬스장과 스마트 앱이 있어서 아주 편리해요.",
          },
          {
            en: "It is the best change for me.",
            ko: "저한테는 최고의 변화예요.",
          },
          {
            en: "So, I really like these changes.",
            ko: "그래서 저는 이런 변화들이 정말 마음에 들어요.",
          },
        ],
      },
      {
        topic: "🎵 음악 변화",
        keyword: "streaming music apps",
        sentences: [
          {
            en: "Whenever I think of music, it changed a lot.",
            ko: "음악을 생각할 때마다, 정말 많이 변했어요.",
          },
          {
            en: "In the past, we bought CDs and MP3 files.",
            ko: "과거에는 CD나 MP3 파일을 사야만 했어요.",
          },
          {
            en: "However, now, listening to music is very easy and convenient.",
            ko: "하지만 지금은 음악 듣기가 아주 쉽고 편리해요.",
          },
          {
            en: "For example, we can stream all music on YouTube, so it is very fast.",
            ko: "예를 들어 유튜브로 모든 음악을 스트리밍할 수 있어서 아주 빨라요.",
          },
          {
            en: "It is the best change for me.",
            ko: "저한테는 최고의 변화예요.",
          },
          {
            en: "So, I really like these changes.",
            ko: "그래서 저는 이런 변화들이 정말 마음에 들어요.",
          },
        ],
      },
      {
        topic: "🛒 쇼핑 변화",
        keyword: "dawn delivery and online shopping",
        sentences: [
          {
            en: "Whenever I think of shopping, it changed a lot.",
            ko: "쇼핑을 생각할 때마다, 정말 많이 변했어요.",
          },
          {
            en: "In the past, we had to visit the store in person.",
            ko: "과거에는 직접 매장에 방문해야만 했어요.",
          },
          {
            en: "However, now, online shopping is very fast and convenient.",
            ko: "하지만 지금은 온라인 쇼핑이 아주 빠르고 편리해요.",
          },
          {
            en: "For example, we get dawn delivery the next morning, so it is very comfortable.",
            ko: "예를 들어 다음 날 아침 새벽 배송을 받아서 아주 편안해요.",
          },
          {
            en: "It is the best change for me.",
            ko: "저한테는 최고의 변화예요.",
          },
          {
            en: "So, I really like these changes.",
            ko: "그래서 저는 이런 변화들이 정말 마음에 들어요.",
          },
        ],
      },
    ],
  },
  {
    id: "pat_06",
    name: "롤플레이 (Role-play)",
    whenToUse: "상대방에게 문의(11번) / 문제 생겨 대안 제시(12번) 롤플레이",
    comboRole: "롤플레이 전용 세트 (11, 12, 13번)",
    questionSignals: [
      "Ask 3 to 4 questions to find out more...",
      "Call and explain the situation, and give 2 to 3 alternatives.",
      "There is a problem you need to solve...",
    ],
    exampleQuestion:
      "You want to buy concert tickets. Call the ticket box office and ask 3-4 questions to get information.",
    category:
      "티켓 문의(11번), 헬스장 문의(11번), 약속 지연(12번), 교환/환불(12번), 예약 변경(12번), 티켓 돌발(13번)",
    icon: "🎭",
    desc: "롤플레이 3대 핵심(11번 질문 문의 ➔ 12번 돌발 대안 제시 ➔ 13번 과거 유사 경험)을 쉬운 6문장으로 완벽 해결하는 공식입니다.",
    skeleton: [
      {
        en: "1. Hello, I'm calling to ask about [주제].",
        ko: "1. 안녕하세요, [주제]에 대해 여쭤보려고 전화드렸어요.",
      },
      {
        en: "2. First, where are you located? Is it near [역/장소]?",
        ko: "2. 먼저 위치가 어디인가요? 역 근처인가요?",
      },
      {
        en: "3. And what are your opening hours today?",
        ko: "3. 그리고 오늘 운영 시간은 어떻게 되나요?",
      },
      {
        en: "4. Also, how much is the price, and do you have discounts?",
        ko: "4. 또한 가격은 얼마이고, 혹시 할인이 있나요?",
      },
      {
        en: "5. By the way, is parking free for visitors?",
        ko: "5. 그런데 방문객 주차는 무료인가요?",
      },
      {
        en: "6. Thank you so much for your help. Have a nice day!",
        ko: "6. 도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
      },
    ],
    variations: [
      {
        topic: "🎫 티켓 문의",
        keyword: "location, hours, price, parking",
        skeleton: [
          {
            en: "1. Hello, I'm calling to ask about [주제].",
            ko: "1. 안녕하세요, [주제]에 대해 여쭤보려고 전화드렸어요.",
          },
          {
            en: "2. First, where are you located? Is it near [역/장소]?",
            ko: "2. 먼저 위치가 어디인가요? 역 근처인가요?",
          },
          {
            en: "3. And what are your opening hours today?",
            ko: "3. 그리고 오늘 운영 시간은 어떻게 되나요?",
          },
          {
            en: "4. Also, how much is the price, and do you have discounts?",
            ko: "4. 또한 가격은 얼마이고, 혹시 할인이 있나요?",
          },
          {
            en: "5. By the way, is parking free for visitors?",
            ko: "5. 그런데 방문객 주차는 무료인가요?",
          },
          {
            en: "6. Thank you so much for your help. Have a nice day!",
            ko: "6. 도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
          },
        ],
        sentences: [
          {
            en: "Hello, I'm calling to ask about the festival tickets.",
            ko: "안녕하세요, 축제 티켓에 대해 문의하려고 전화드렸어요.",
          },
          {
            en: "First, where is the hall? Is it near the subway station?",
            ko: "먼저 공연장이 어디인가요? 지하철역 근처인가요?",
          },
          {
            en: "And what time does the festival start today?",
            ko: "그리고 축제는 오늘 몇 시에 시작하나요?",
          },
          {
            en: "Also, what is the ticket price, and do you have discounts?",
            ko: "또한 티켓 가격은 얼마이고, 혹시 할인이 있나요?",
          },
          {
            en: "By the way, is parking free for ticket holders?",
            ko: "그런데 티켓이 있으면 주차는 무료인가요?",
          },
          {
            en: "Thank you so much for your help. Have a nice day!",
            ko: "도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
          },
        ],
      },
      {
        topic: "🏋️ 헬스장 문의",
        keyword: "gym membership & free parking",
        skeleton: [
          {
            en: "1. Hello, I'm calling to ask about [주제].",
            ko: "1. 안녕하세요, [주제]에 대해 여쭤보려고 전화드렸어요.",
          },
          {
            en: "2. First, where are you located? Is it near [역/장소]?",
            ko: "2. 먼저 위치가 어디인가요? 역 근처인가요?",
          },
          {
            en: "3. And what are your opening hours today?",
            ko: "3. 그리고 오늘 운영 시간은 어떻게 되나요?",
          },
          {
            en: "4. Also, how much is the price, and do you have discounts?",
            ko: "4. 또한 가격은 얼마이고, 혹시 할인이 있나요?",
          },
          {
            en: "5. By the way, is parking free for visitors?",
            ko: "5. 그런데 방문객 주차는 무료인가요?",
          },
          {
            en: "6. Thank you so much for your help. Have a nice day!",
            ko: "6. 도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
          },
        ],
        sentences: [
          {
            en: "Hello, I'm calling to ask about the gym membership.",
            ko: "안녕하세요, 헬스장 회원권에 대해 문의하려고 전화드렸어요.",
          },
          {
            en: "First, where are you located? Is it near my station?",
            ko: "먼저 위치가 어디인가요? 역 근처에 있나요?",
          },
          {
            en: "And what are your opening hours on weekends?",
            ko: "그리고 주말 영업 시간은 어떻게 되나요?",
          },
          {
            en: "Also, how much is the price, and do you have discounts?",
            ko: "또한 가격은 얼마이고, 혹시 할인이 있나요?",
          },
          {
            en: "By the way, is parking free for gym members?",
            ko: "그런데 헬스장 회원은 주차가 무료인가요?",
          },
          {
            en: "Thank you so much for your help. Have a nice day!",
            ko: "도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
          },
        ],
      },
      {
        topic: "🚗 약속 지연",
        keyword: "thirty minutes late & buy coffee",
        skeleton: [
          {
            en: "1. Hi [친구], it's [나]! I'm calling because there is a problem.",
            ko: "1. 안녕 [친구], 나 [나]야! 문제가 좀 생겨서 전화했어.",
          },
          {
            en: "2. The traffic is very heavy, so I will be thirty minutes late.",
            ko: "2. 차가 너무 막혀서 30분 정도 늦을 것 같아.",
          },
          {
            en: "3. I was very surprised and worried, and I am really sorry.",
            ko: "3. 갑자기 차가 막혀서 너무 당황스럽고 미안해.",
          },
          {
            en: "4. Please wait inside Starbucks, and I will buy you coffee!",
            ko: "4. 스타벅스 안에 들어가 있어, 내가 커피 살게! (대안 1)",
          },
          {
            en: "5. If you are too tired today, we can meet tomorrow instead.",
            ko: "5. 만약 오늘 피곤하면 대신 내일 만나도 괜찮아. (대안 2)",
          },
          {
            en: "6. I will get there as fast as I can. See you soon!",
            ko: "6. 최대한 빨리 달려갈게. 곧 보자!",
          },
        ],
        sentences: [
          {
            en: "Hi Minsoo, it's Hyosang! I'm calling because there is a problem.",
            ko: "안녕 민수야, 나 효상이야! 문제가 좀 생겨서 전화했어.",
          },
          {
            en: "The traffic is very heavy, so I will be thirty minutes late.",
            ko: "차가 너무 막혀서 30분 정도 늦을 것 같아.",
          },
          {
            en: "I was very surprised and worried, and I am really sorry.",
            ko: "갑자기 차가 막혀서 너무 당황스럽고 미안해.",
          },
          {
            en: "Please wait inside Starbucks near my house, and I will buy coffee!",
            ko: "우리 집 근처 스타벅스 안에 들어가 있어, 내가 커피 살게!",
          },
          {
            en: "If you are too tired today, we can meet tomorrow instead.",
            ko: "만약 오늘 너무 피곤하면 대신 내일 만나도 괜찮아.",
          },
          {
            en: "I will get there as fast as I can. See you soon!",
            ko: "최대한 빨리 달려갈게. 곧 보자!",
          },
        ],
      },
      {
        topic: "🛍️ 교환/환불",
        keyword: "scratch on product & full refund",
        skeleton: [
          {
            en: "1. Hello, I [구매/예약], but there is a problem.",
            ko: "1. 안녕하세요, [구매/예약] 관련하여 문제가 좀 생겼어요.",
          },
          {
            en: "2. [구체적 원인], so [현재 상황 설명].",
            ko: "2. [구체적 원인] 때문에 [현재 상황 설명].",
          },
          {
            en: "3. I was very surprised and worried.",
            ko: "3. 저는 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "4. Can I [대안 1: 새 제품 교환]?",
            ko: "4. 혹시 [대안 1: 새 제품 교환]할 수 있을까요?",
          },
          {
            en: "5. If that is not possible, can I [대안 2: 전액 환불]?",
            ko: "5. 만약 그게 어렵다면, [대안 2: 전액 환불]받을 수 있을까요?",
          },
          {
            en: "6. Thank you so much for your help. Have a nice day!",
            ko: "6. 도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
          },
        ],
        sentences: [
          {
            en: "Hello, I bought this product yesterday, but there is a problem.",
            ko: "안녕하세요, 어제 여기서 이 물건을 샀는데 문제가 있어요.",
          },
          {
            en: "When I opened the box, there was a big scratch on it.",
            ko: "상자를 열어보니 큰 흠집이 나 있더라고요.",
          },
          {
            en: "I was very surprised and worried.",
            ko: "처음에 보고 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "I have the receipt, so can I exchange it for a new one?",
            ko: "영수증이 있는데, 새 제품으로 교환할 수 있을까요?",
          },
          {
            en: "If that is not possible, can I get a full refund?",
            ko: "만약 그게 어렵다면, 전액 환불받을 수 있을까요?",
          },
          {
            en: "Thank you so much for your help. Have a nice day!",
            ko: "도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
          },
        ],
      },
      {
        topic: "🏨 예약 변경",
        keyword: "change reservation time or date",
        skeleton: [
          {
            en: "1. Hello, I [구매/예약], but there is a problem.",
            ko: "1. 안녕하세요, [구매/예약] 관련하여 문제가 좀 생겼어요.",
          },
          {
            en: "2. [구체적 원인], so [현재 상황 설명].",
            ko: "2. [구체적 원인] 때문에 [현재 상황 설명].",
          },
          {
            en: "3. I was very surprised and worried.",
            ko: "3. 저는 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "4. Can I [대안 1: 시간 연기]?",
            ko: "4. 혹시 [대안 1: 시간 연기]할 수 있을까요?",
          },
          {
            en: "5. If that is not possible, can I [대안 2: 날짜 변경]?",
            ko: "5. 만약 그게 어렵다면, [대안 2: 날짜 변경]할 수 있을까요?",
          },
          {
            en: "6. Thank you so much for your help. Have a nice day!",
            ko: "6. 도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
          },
        ],
        sentences: [
          {
            en: "Hello, I have a reservation tonight, but there is a problem.",
            ko: "안녕하세요, 오늘 밤 예약자인데 문제가 좀 생겼어요.",
          },
          {
            en: "I have urgent work at the office, so I cannot arrive on time.",
            ko: "회사에 급한 야근이 생겨서 제시간에 도착할 수가 없어요.",
          },
          {
            en: "I was very surprised and worried.",
            ko: "갑자기 일정이 꼬여서 너무 난감하고 걱정되었어요.",
          },
          {
            en: "Can I change my reservation to eight o'clock tonight?",
            ko: "오늘 밤 8시로 예약 시간을 바꿀 수 있을까요?",
          },
          {
            en: "If that is not possible, can I move it to tomorrow?",
            ko: "만약 그게 어렵다면, 내일로 날짜를 옮길 수 있을까요?",
          },
          {
            en: "Thank you so much for your help. Have a nice day!",
            ko: "도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
          },
        ],
      },
      {
        topic: "✨ 티켓 돌발",
        keyword: "server crash & app booking",
        skeleton: [
          {
            en: "1. Whenever I think of [주제], I remember a big problem.",
            ko: "1. [주제]를 생각할 때마다, 큰 문제가 하나 기억나요.",
          },
          {
            en: "2. Last year, I [활동], and suddenly [돌발 상황].",
            ko: "2. 작년에, [활동]을 하던 중 갑자기 [돌발 상황]이 일어났어요.",
          },
          {
            en: "3. I was very surprised and worried.",
            ko: "3. 저는 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "4. So, I quickly [대처 행동], and fixed it.",
            ko: "4. 그래서 빠르게 [대처 행동]을 해서 해결했어요.",
          },
          {
            en: "5. It was a hard day for me.",
            ko: "5. 저한테는 참 힘든 하루였어요.",
          },
          {
            en: "6. So, it became a good memory.",
            ko: "6. 그래도 결국 좋은 추억이 되었어요.",
          },
        ],
        sentences: [
          {
            en: "Whenever I think of tickets, I remember a big problem.",
            ko: "티켓 예매를 생각할 때마다, 큰 문제가 하나 기억나요.",
          },
          {
            en: "Last year, I tried to book concert tickets, and suddenly the website crashed.",
            ko: "작년에 콘서트 티켓을 예매하려 했는데, 갑자기 웹사이트 서버가 다운되었어요.",
          },
          {
            en: "I was very surprised and worried.",
            ko: "저는 너무 놀라고 걱정이 되었어요.",
          },
          {
            en: "So, I quickly opened the smartphone app, and fixed it.",
            ko: "그래서 빠르게 스마트폰 앱을 켜서 예매를 해결했어요.",
          },
          {
            en: "It was a hard day for me.",
            ko: "저한테는 참 힘든 하루였어요.",
          },
          {
            en: "So, it became a good memory.",
            ko: "그래도 결국 좋은 추억이 되었어요.",
          },
        ],
      },
    ],
  },
];
