/**
 * @file fillers_im1.js
 * @description OPIc 핵심 필러(Filler Words) 22선 및 만능 답변 연계 실전 활용 가이드 데이터셋
 * - 시작/생각 시간 벌기, 문장 연결/호흡, 감정/스토리텔링 반전, 깔끔한 마무리 등 4대 카테고리
 * - 만능 템플릿 6대 공식(1단계 묘사, 2단계 루틴, 3단계 과거경험, 4단계 문제해결, 5단계 비교변화, 6단계 롤플레이) 100% 연계
 * - 한국어 발음 표기, 타이밍 가이드, 실전 상황별 대화 예문 제공
 *
 * @author Kim Hyo-sang
 * @version 2.3.0
 */

/**
 * @typedef {Object} FillerExample
 * @property {string} context - 발화 상황 설명
 * @property {string} en - 필러가 포함된 영어 실전 문장
 * @property {string} ko - 한글 해석 문장
 */

/**
 * @typedef {Object} FillerItem
 * @property {string} id - 필러 고유 식별자 (예: "fil_01")
 * @property {string} category - 카테고리 키 ("start", "bridge", "emotion", "finish")
 * @property {string} categoryName - 카테고리 표시명
 * @property {string} categoryIcon - 이모지 아이콘
 * @property {string} phrase - 필러 영문 표현
 * @property {string} pronunciation - 한글 발음 가이드
 * @property {string} meaning - 한글 뉘앙스 의미
 * @property {string} timingGuide - 원어민 발화 타이밍 가이드
 * @property {string} tip - OPIc 고득점 활용 팁
 * @property {FillerExample[]} examples - 실전 예문 목록
 */

/** @type {FillerItem[]} */
window.FILLERS_DATA = [
  // ── [카테고리 1: 시작 & 생각 시간 벌기 (start)] ──
  {
    id: "fil_01",
    category: "start",
    categoryName: "시작 & 생각 시간 벌기",
    categoryIcon: "⏱️",
    phrase: "Well...",
    pronunciation: "[웰~]",
    meaning: "음, 글쎄요...",
    timingGuide:
      "질문이 끝나고 첫 문장을 시작할 때 1~2초 생각할 시간이 필요할 때 사용합니다.",
    tip: "한국어의 '어...'나 '음...' 대신 'Well...'을 1초 정도 길게 끌어주면 아주 자연스러운 원어민 억양이 됩니다.",
    examples: [
      {
        context: "[만능 템플릿 1단계 뼈대] 최애 장소 선호 묘사 오프닝",
        en: "Well, let me see... You know, Eva, my favorite place is Starbucks.",
        ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 스타벅스야.",
      },
      {
        context: "주말 루틴 질문을 받았을 때",
        en: "Well, usually on weekends, I love to take a walk in the park near my house alone.",
        ko: "글쎄요, 보통 주말에는 혼자 집 근처 공원에서 산책하는 것을 아주 좋아해요.",
      },
    ],
  },
  {
    id: "fil_02",
    category: "start",
    categoryName: "시작 & 생각 시간 벌기",
    categoryIcon: "⏱️",
    phrase: "You know...",
    pronunciation: "[유노~]",
    meaning: "있잖아요, 아시다시피...",
    timingGuide:
      "문장을 시작하거나 문장 중간에서 상대방(에바)에게 공감을 유도하며 호흡을 가다듬을 때 사용합니다.",
    tip: "외운 티를 벗고 실제 원어민과 편안하게 수다를 떠는 듯한 인상을 주는 OPIc 최고의 만능 필러입니다.",
    examples: [
      {
        context: "[만능 템플릿 2단계 뼈대] 자유 시간 루틴 활동 묘사",
        en: "Well, you know, when I have free time, I usually love to walk in the park.",
        ko: "음, 있잖아, 자유 시간이 날 때면, 저는 보통 공원에서 산책하는 걸 정말 좋아해요.",
      },
      {
        context: "주거 환경을 묘사할 때",
        en: "You know, my apartment is located near the park, so it is super convenient to live in.",
        ko: "있잖아요, 제 아파트는 공원 근처에 위치해 있어서 살기에 정말 편리해요.",
      },
    ],
  },
  {
    id: "fil_03",
    category: "start",
    categoryName: "시작 & 생각 시간 벌기",
    categoryIcon: "⏱️",
    phrase: "Let me see... / Let's see...",
    pronunciation: "[렛미씨~]",
    meaning: "어디 보자... 어디 생각 좀 해볼게요...",
    timingGuide:
      "질문을 듣고 머릿속에서 특정 장소나 기억, 키워드를 고르고 있을 때 2~3초 침묵 없이 자연스럽게 시간을 벌 때 사용합니다.",
    tip: "'Let me think...'와 함께 쓰이며, 에바의 질문에 진지하게 고민해서 답하는 자연스러운 리듬을 만듭니다.",
    examples: [
      {
        context: "[만능 템플릿 3단계 뼈대] 가장 기억에 남는 과거 경험 회상",
        en: "Well, let me see... You know, Eva, I remember a very special day.",
        ko: "음, 어디 보자... 있잖아 에바, 아주 특별했던 하루가 하나 기억나.",
      },
      {
        context: "좋아하는 영화 장르를 고를 때",
        en: "Let me see... I think my favorite movie of all time is definitely The Truman Show.",
        ko: "어디 생각 좀 해볼게요... 제가 가장 좋아하는 인생 영화는 확실히 '트루먼 쇼'인 것 같아요.",
      },
    ],
  },
  {
    id: "fil_17",
    category: "start",
    categoryName: "시작 & 생각 시간 벌기",
    categoryIcon: "⏱️",
    phrase: "You know, Eva, ...",
    pronunciation: "[유노, 에바~]",
    meaning: "있잖아 에바, 에바 당신도 알다시피...",
    timingGuide:
      "답변 첫 문장을 시작할 때 에바의 이름을 부르며 1:1 대화하듯 친근하게 운을 뗄 때 사용합니다.",
    tip: "만능 템플릿 1, 3, 4단계 공통 오프닝('Well, let me see... You know, Eva, ...')의 핵심 필러입니다. 에바(Eva)의 이름을 부르면 암기한 답변이 아닌 진짜 수다를 떠는 자연스러운 인터랙션 점수를 받습니다.",
    examples: [
      {
        context: "[만능 템플릿 1단계] 최애 장소 첫 문장 오프닝",
        en: "Well, let me see... You know, Eva, my favorite place is my room.",
        ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 제 방이야.",
      },
      {
        context: "[만능 템플릿 4단계] 잊지 못할 돌발 문제 오프닝",
        en: "Well, let me see... You know, Eva, I remember a big problem I had last month.",
        ko: "음, 어디 보자... 있잖아 에바, 지난달에 겪었던 큰 문제가 하나 기억나.",
      },
    ],
  },
  {
    id: "fil_18",
    category: "start",
    categoryName: "시작 & 생각 시간 벌기",
    categoryIcon: "⏱️",
    phrase: "Whenever I think of...",
    pronunciation: "[웬에버 아이 띵크 오브~]",
    meaning: "~를 생각할 때마다, ~에 대해 떠올리면...",
    timingGuide:
      "5단계 과거 vs 현재 비교 변화 질문이나, 특정 장소·추억을 회상하는 답변의 첫 시작으로 사용합니다.",
    tip: "만능 템플릿 5단계 뼈대('Whenever I think of [주제], it changed a lot.')의 도입 공식입니다. 단순 나열보다 훨씬 세련된 인상을 주어 IM1~IM2 고득점을 확정 짓습니다.",
    examples: [
      {
        context: "[만능 템플릿 5단계] 과거 vs 현재 변화 비교 도입",
        en: "Whenever I think of coffee shops, they changed a lot compared to the past.",
        ko: "카페를 생각할 때마다, 과거와 비교해 정말 많이 변했어요.",
      },
      {
        context: "[만능 템플릿 4단계] 기억에 남는 돌발 문제 회상",
        en: "Whenever I think of camping, I remember a big problem I had last year.",
        ko: "캠핑을 생각할 때마다, 작년에 겪었던 큰 문제가 하나 기억나요.",
      },
    ],
  },
  {
    id: "fil_04",
    category: "start",
    categoryName: "시작 & 생각 시간 벌기",
    categoryIcon: "⏱️",
    phrase: "To be honest... / Honestly...",
    pronunciation: "[투비 어니스트 / 어니슬리]",
    meaning: "솔직히 말씀드리면...",
    timingGuide:
      "내 진짜 취향, 솔직한 느낌, 혹은 완벽하지 않은 경험을 솔직하게 털어놓으며 답변을 시작할 때 사용합니다.",
    tip: "'솔직히 말해서'라는 뉘앙스는 시험관에게 진솔하고 대화다운 느낌을 주어 점수를 높여줍니다.",
    examples: [
      {
        context: "요리 실력이나 습관에 대해 말할 때",
        en: "To be honest, I am not a professional chef, but I really enjoy making simple pasta on weekends.",
        ko: "솔직히 말씀드리면, 제가 요리사는 아니지만 주말에 간단한 파스타 만드는 것을 정말 좋아해요.",
      },
      {
        context: "돌발 상황(에어컨 고장)에 대해 말할 때",
        en: "Honestly, I was quite surprised and worried at first because it was a very hot summer day.",
        ko: "솔직히 말해서, 한여름 무더위 날씨여서 처음에는 꽤 당황스럽고 걱정되었어요.",
      },
    ],
  },
  {
    id: "fil_05",
    category: "start",
    categoryName: "시작 & 생각 시간 벌기",
    categoryIcon: "⏱️",
    phrase: "Actually...",
    pronunciation: "[액츌리~]",
    meaning: "사실은, 실은...",
    timingGuide:
      "답변 서두에 내 실제 상태를 소개하거나, 반전이 있는 사실을 덧붙이고자 할 때 사용합니다.",
    tip: "‘한국어의 실은 말이죠~’처럼 문장 맨 앞이나 동사 바로 앞에 배치하여 자연스럽게 치고 나갑니다.",
    examples: [
      {
        context: "[만능 템플릿 3단계 뼈대] 과거 경험 장소 현장 묘사",
        en: "Actually, the place was very large, clean, and beautiful.",
        ko: "사실은, 그 장소가 정말 크고 깨끗하고 아름다웠어요.",
      },
      {
        context: "직장 및 일상 루틴을 소개할 때",
        en: "Actually, I work at an office from nine to six, so my daily schedule is quite consistent.",
        ko: "사실은, 제가 사무실에서 9시부터 6시까지 일해서 일상 일정이 꽤 일정해요.",
      },
    ],
  },

  // ── [카테고리 2: 문장 연결 & 단어 생각 안 날 때 (bridge)] ──
  {
    id: "fil_19",
    category: "bridge",
    categoryName: "문장 연결 & 단어 생각 안 날 때",
    categoryIcon: "🔄",
    phrase: "How can I say...",
    pronunciation: "[하우 캔 아이 세이~]",
    meaning: "뭐라고 말해야 할까... / 어떻게 표현해야 할까...",
    timingGuide:
      "장소나 사물의 분위기, 특징을 묘사하는 형용사를 떠올릴 때 침묵 없이 1~2초 자연스럽게 호흡을 둘 때 사용합니다.",
    tip: "만능 템플릿 1단계 뼈대 문장 3번('How can I say... it is very clean, comfortable, and cozy.')의 상징적 필러입니다. 외운 티를 벗고 현장에서 직접 묘사하는 듯한 원어민 억양을 만들어 줍니다.",
    examples: [
      {
        context: "[만능 템플릿 1단계 뼈대] 장소 실내 분위기 및 특징 묘사",
        en: "How can I say... it is very clean, comfortable, and cozy.",
        ko: "뭐라고 말해야 할까... 거기는 아주 깔끔하고, 편안하고, 아늑해요.",
      },
      {
        context: "동네 공원의 차분한 힐링 분위기를 묘사할 때",
        en: "How can I say... it is very peaceful and relaxing with tall green trees.",
        ko: "어떻게 말해야 할까... 푸른 나무들이 많아서 아주 평화롭고 마음이 편안해져요.",
      },
    ],
  },
  {
    id: "fil_09",
    category: "bridge",
    categoryName: "문장 연결 & 단어 생각 안 날 때",
    categoryIcon: "🔄",
    phrase: "How should I put it?",
    pronunciation: "[하우 슈다이 푸딧?]",
    meaning: "어떻게 표현해야 할까요? / 뭐라고 말해야 할까?",
    timingGuide:
      "적절한 영어 단어나 문장이 바로 떠오르지 않을 때 당황한 침묵 대신 3초를 벌어주는 고득점 필러입니다.",
    tip: "이 한 문장을 던지는 순간 시험관은 '단어가 막혔다'가 아니라 '적절한 표현을 고르고 있구나'로 인식합니다.",
    examples: [
      {
        context: "영화 '트루먼 쇼'의 감상을 설명할 때",
        en: "How should I put it? The movie makes people think deeply about true freedom and reality.",
        ko: "어떻게 표현해야 할까요? 그 영화는 사람들에게 진정한 자유와 현실에 대해 깊이 생각하게 만들어요.",
      },
      {
        context: "공원의 특별한 매력을 설명할 때",
        en: "How should I put it? It has a very calming atmosphere that heals my mind.",
        ko: "뭐라고 말해야 할까요? 그곳은 제 마음을 치유해 주는 아주 차분한 분위기를 가지고 있어요.",
      },
    ],
  },
  {
    id: "fil_06",
    category: "bridge",
    categoryName: "문장 연결 & 단어 생각 안 날 때",
    categoryIcon: "🔄",
    phrase: "I mean...",
    pronunciation: "[아이민~]",
    meaning: "그러니까 내 말은, 제 뜻은...",
    timingGuide:
      "앞서 말한 문장을 보충 설명하거나, 방금 말한 단어를 더 나은 표현으로 바꾸고 싶을 때 사용합니다.",
    tip: "말문이 막히거나 문법이 꼬였을 때 멈추지 말고 'I mean...'을 외친 후 올바른 문장으로 다시 이어가세요!",
    examples: [
      {
        context: "카페 분위기를 덧붙여 설명할 때",
        en: "Inside the cafe, it is very cozy. I mean, the lighting is warm and the soft jazz music is so relaxing.",
        ko: "카페 내부는 정말 아늑해요. 제 말은, 조명이 따뜻하고 잔잔한 재즈 음악이 마음을 정말 편안하게 해준다는 뜻이에요.",
      },
      {
        context: "스마트홈의 편리함을 설명할 때",
        en: "Our new apartment is very smart. I mean, we can easily control lighting and heating with a mobile app.",
        ko: "우리 새 아파트는 정말 스마트해요. 그러니까, 스마트폰 앱으로 조명과 난방을 손쉽게 제어할 수 있거든요.",
      },
    ],
  },
  {
    id: "fil_07",
    category: "bridge",
    categoryName: "문장 연결 & 단어 생각 안 날 때",
    categoryIcon: "🔄",
    phrase: "Like...",
    pronunciation: "[라익~]",
    meaning: "약간 ~같은, 뭐랄까, 대략...",
    timingGuide:
      "명사, 형용사, 숫자 바로 앞에서 완벽한 단어를 고르는 동안 0.5초 호흡을 둘 때 사용합니다.",
    tip: "미국 원어민들이 가장 많이 쓰는 구어체 필러입니다. 'It was, like, really amazing!' 처럼 부드럽게 넣어보세요.",
    examples: [
      {
        context: "공원에서 보내는 시간을 말할 때",
        en: "I usually spend, like, one or two hours walking around the park alone.",
        ko: "저는 보통 혼자 공원을 걸으며, 뭐랄까 대략 한두 시간 정도를 보내요.",
      },
      {
        context: "지인을 우연히 마주쳤을 때의 느낌을 말할 때",
        en: "It was, like, a big surprise to see my old colleague there.",
        ko: "거기서 예전 직장 동료를 만난 건, 뭐랄까 정말 큰 깜짝 선물 같았어요.",
      },
    ],
  },
  {
    id: "fil_08",
    category: "bridge",
    categoryName: "문장 연결 & 단어 생각 안 날 때",
    categoryIcon: "🔄",
    phrase: "Kind of... / Sort of...",
    pronunciation: "[카인다 / 소르타]",
    meaning: "약간 그런 느낌, 어느 정도는...",
    timingGuide:
      "단정적으로 말하기 애매하거나 감정/상태를 부드럽고 유연하게 표현할 때 사용합니다.",
    tip: "발음할 때 '카인드 오브'가 아니라 '카인다(kinda)', '소르타(sorta)'로 부드럽게 뭉개서 발음하는 것이 핵심입니다.",
    examples: [
      {
        context: "힘든 하루 뒤의 감정을 표현할 때",
        en: "After working hard all week, I was kind of tired, so I needed some rest.",
        ko: "한 주 내내 열심히 일한 뒤라 약간 피곤해서, 휴식이 어느 정도 필요했어요.",
      },
      {
        context: "새 동네 분위기를 설명할 때",
        en: "My neighborhood is sort of a new and modern town with lots of great cafes and restaurants.",
        ko: "우리 동네는 멋진 카페와 식당들이 많은, 약간 신도시 느낌의 현대적인 동네예요.",
      },
    ],
  },
  {
    id: "fil_10",
    category: "bridge",
    categoryName: "문장 연결 & 단어 생각 안 날 때",
    categoryIcon: "🔄",
    phrase: "What I mean is...",
    pronunciation: "[왓 아이 민 이즈~]",
    meaning: "제 말은 그러니까...",
    timingGuide:
      "앞선 문장의 핵심 요점을 다시 한번 명확하게 정리해서 강조하고 싶을 때 사용합니다.",
    tip: "문장이 다소 길어지거나 정리가 필요할 때 이 필러 뒤에 결론 한 줄을 딱 얹어주면 답변의 논리력이 급상승합니다.",
    examples: [
      {
        context: "휴식의 중요성을 강조할 때",
        en: "What I mean is, taking a short break on weekends helps me work much better on weekdays.",
        ko: "제 말은 그러니까, 주말에 잠깐의 휴식을 취하는 것이 평일에 훨씬 더 일을 잘하게 도와준다는 거예요.",
      },
      {
        context: "에어컨 수리 교훈을 정리할 때",
        en: "What I mean is, it is always a good idea to check household appliances before summer starts.",
        ko: "제 말의 요지는, 여름이 시작되기 전에 가전제품을 미리 점검하는 것이 항상 좋은 생각이라는 거죠.",
      },
    ],
  },
  {
    id: "fil_20",
    category: "bridge",
    categoryName: "문장 연결 & 단어 생각 안 날 때",
    categoryIcon: "🔄",
    phrase: "By the way...",
    pronunciation: "[바이 더 웨이~]",
    meaning: "그나저나, 그런데 말이죠...",
    timingGuide:
      "6단계 롤플레이(11번 질문하기, 15번 역질문)에서 자연스럽게 추가 질문을 던지거나 화제를 넘길 때 사용합니다.",
    tip: "전화 문의나 에바와의 대화에서 'First... And... By the way...' 순서로 질문을 던지면 실제 원어민과 통화하듯 매끄러운 흐름이 유지됩니다.",
    examples: [
      {
        context: "[만능 템플릿 6단계 롤플레이] 11번 문의 전화 추가 질문",
        en: "By the way, what are your opening hours today? Is there parking available?",
        ko: "그런데 말이죠, 오늘 영업시간이 어떻게 되나요? 주차는 가능한가요?",
      },
      {
        context: "[만능 템플릿 6단계 15번 문항] 에바에게 역질문하기",
        en: "By the way, Eva, where is your favorite place to hang out with friends?",
        ko: "그나저나 에바, 당신이 친구들과 어울려 놀기 가장 좋아하는 장소는 어디인가요?",
      },
    ],
  },

  // ── [카테고리 3: 감정 & 스토리텔링 위기극복 전환 (emotion)] ──
  {
    id: "fil_21",
    category: "emotion",
    categoryName: "감정 & 스토리텔링 전환",
    categoryIcon: "💡",
    phrase: "At first...",
    pronunciation: "[앳 퍼스트~]",
    meaning: "처음에는, 시작할 때는...",
    timingGuide:
      "4단계 돌발 문제나 과거 경험을 시간 순서대로 풀어나갈 때, 초기의 당황했던 감정('so surprised and worried')을 실감 나게 전할 때 사용합니다.",
    tip: "만능 템플릿 4단계 뼈대('At first, I was so surprised and worried.')의 스토리 전개 필러입니다. 'At first(처음엔) → Then(그 다음에) → Fortunately(다행히도)'로 이어지는 극적인 스토리텔링을 완성합니다.",
    examples: [
      {
        context: "[만능 템플릿 4단계 뼈대] 돌발 문제 발생 직후의 감정",
        en: "At first, I was so surprised and worried, and I didn't know what to do.",
        ko: "처음에는, 너무 놀라고 걱정되어서 어떻게 해야 할지 몰랐어요.",
      },
      {
        context: "처음 외국인을 만나거나 영어를 말했던 경험",
        en: "At first, I was very nervous, but as time passed, it became much easier.",
        ko: "처음에는 매우 긴장했지만, 시간이 지나면서 훨씬 수월해졌어요.",
      },
    ],
  },
  {
    id: "fil_22",
    category: "emotion",
    categoryName: "감정 & 스토리텔링 전환",
    categoryIcon: "💡",
    phrase: "Fortunately... / Luckily...",
    pronunciation: "[포츄너틀리 / 럭킬리]",
    meaning: "다행히도, 천만다행으로...",
    timingGuide:
      "4단계 돌발 문제 및 해결 답변에서, 당황스러웠던 위기 상황이 극적으로 해결되는 반전 타이밍에 사용합니다.",
    tip: "만능 템플릿 4단계 뼈대 문장 5번('Fortunately, [해결 행동], and everything was okay.')의 핵심 전환 필러입니다. 걱정('worried') 뒤에 'Fortunately'를 던지면 답변의 완급 조절과 몰입도가 극대화됩니다.",
    examples: [
      {
        context: "[만능 템플릿 4단계 뼈대] 돌발 문제 해결 상황",
        en: "Fortunately, a kind staff helped me, and everything was okay.",
        ko: "다행히도, 친절한 직원이 도와주어서 모든 것이 괜찮아졌어요.",
      },
      {
        context: "카페에서 커피를 쏟았거나 물건을 잃어버렸을 때",
        en: "Fortunately, the barista made me a new drink with a bright smile.",
        ko: "다행스럽게도, 바리스타가 환한 미소로 새 음료를 만들어 주셨어요.",
      },
    ],
  },
  {
    id: "fil_11",
    category: "emotion",
    categoryName: "감정 & 스토리텔링 전환",
    categoryIcon: "💡",
    phrase: "Seriously...",
    pronunciation: "[씨리어슬리~]",
    meaning: "진짜로, 레알, 정말이지...",
    timingGuide:
      "정말 맛있었거나, 너무 힘들었거나, 정말 좋았던 감정을 강하게 어필할 때 사용합니다.",
    tip: "감정을 실어 약간 눈을 크게 뜨거나 억양을 올려 'Seriously,'라고 발음하면 원어민스러운 생동감이 폭발합니다.",
    examples: [
      {
        context: "맛있는 스테이크를 설명할 때",
        en: "Seriously, the steak was so juicy and delicious that we ate every single bite.",
        ko: "진짜로, 스테이크가 육즙이 가득하고 너무 맛있어서 한 점도 남김없이 다 먹었어요.",
      },
      {
        context: "새 아파트 헬스장 시설에 만족할 때",
        en: "Seriously, the resident fitness center is so modern and convenient that I go there every night.",
        ko: "정말이지, 입주민 헬스장이 너무 현대적이고 편리해서 매일 밤마다 운동하러 가요.",
      },
    ],
  },
  {
    id: "fil_12",
    category: "emotion",
    categoryName: "감정 & 스토리텔링 전환",
    categoryIcon: "💡",
    phrase: "Definitely... / Absolutely...",
    pronunciation: "[데피닛리 / 앱솔루틀리]",
    meaning: "확실히, 완전 그래요, 당연하죠!",
    timingGuide:
      "어떤 대상에 대한 확신이나 강한 만족감을 나타낼 때 사용합니다.",
    tip: "질문의 주제에 대한 선호도를 말할 때 'It is definitely my favorite place.'처럼 사용하세요.",
    examples: [
      {
        context: "최애 장소를 강조할 때",
        en: "This cafe is definitely my favorite spot in my neighborhood, and I recommend it to all my friends.",
        ko: "이 카페는 확실히 우리 동네에서 제가 가장 좋아하는 장소이고, 모든 친구들에게 추천해요.",
      },
      {
        context: "스마트홈의 편의성을 강조할 때",
        en: "These modern smart systems are absolutely changing our daily lifestyle for the better.",
        ko: "이러한 현대 스마트 시스템들은 우리의 일상 라이프스타일을 확실하게 더 낫게 바꾸고 있어요.",
      },
    ],
  },
  {
    id: "fil_13",
    category: "emotion",
    categoryName: "감정 & 스토리텔링 전환",
    categoryIcon: "💡",
    phrase: "You know what I mean?",
    pronunciation: "[유노 왓아이민?]",
    meaning: "무슨 말인지 아시죠? / 느낌 아시죠?",
    timingGuide:
      "설명을 마친 뒤 상대방(에바)에게 공감과 동의를 구하며 대화의 유대감을 형성할 때 사용합니다.",
    tip: "혼자 독백하는 시험이 아니라 에바와 실시간으로 대화하고 있다는 '인터랙션' 점수를 획득하는 마법의 문장입니다.",
    examples: [
      {
        context: "바쁜 일상 후 휴식의 소중함을 말할 때",
        en: "Drinking warm coffee with sweet dessert gives me so much peace of mind, you know what I mean?",
        ko: "달콤한 디저트와 함께 따뜻한 커피를 마시면 마음에 큰 평화가 찾아와요, 무슨 느낌인지 아시죠?",
      },
      {
        context: "오랜 친구를 우연히 만났을 때의 반가움을 말할 때",
        en: "Seeing an old friend after several years just brings back all the memories, you know what I mean?",
        ko: "몇 년 만에 옛 친구를 만나면 모든 옛 추억들이 주마등처럼 스쳐 지나가잖아요, 어떤 기분인지 아시죠?",
      },
    ],
  },
  {
    id: "fil_14",
    category: "emotion",
    categoryName: "감정 & 스토리텔링 전환",
    categoryIcon: "💡",
    phrase: "I guess...",
    pronunciation: "[아이 게스~]",
    meaning: "제 생각에는 ~인 것 같아요, 아마도...",
    timingGuide:
      "단정적으로 딱 잘라 말하기보다는 부드럽고 겸손하게 내 생각이나 추측을 덧붙일 때 사용합니다.",
    tip: "OPIc에서 너무 딱딱한 발표조(I think that...) 대신 'I guess...'를 섞어 쓰면 부드러운 구어체가 완성됩니다.",
    examples: [
      {
        context: "카페에 자주 가는 이유를 말할 때",
        en: "I guess visiting cafes has become one of my regular weekend habits.",
        ko: "제 생각에는 카페를 찾는 것이 제 주말의 정기적인 습관 중 하나가 된 것 같아요.",
      },
      {
        context: "앞으로의 취미 계획을 말할 때",
        en: "I guess I will keep jogging in the park regularly as long as the weather is nice.",
        ko: "날씨가 좋은 한 저는 공원에서 정기적으로 계속 조깅을 할 것 같아요.",
      },
    ],
  },

  // ── [카테고리 4: 깔끔한 답변 마무리 (finish)] ──
  {
    id: "fil_15",
    category: "finish",
    categoryName: "깔끔한 답변 마무리 (맺음말)",
    categoryIcon: "🏁",
    phrase: "Anyway...",
    pronunciation: "[애니웨이~]",
    meaning: "어쨌든, 아무튼...",
    timingGuide:
      "경험이나 세부 묘사가 길어졌을 때 메인 주제로 돌아오거나 답변을 슬슬 마무리 지으려 할 때 사용합니다.",
    tip: "'Anyway, so...' 형태로 결론 문장과 연결하면 자연스러운 전환(Transition)이 완성됩니다.",
    examples: [
      {
        context: "과거 경험 이야기 후 마무리할 때",
        en: "Anyway, it was one of the most unforgettable experiences in my life, and I will never forget it.",
        ko: "어쨌든, 그것은 제 인생에서 가장 잊을 수 없는 경험 중 하나였고 영원히 잊지 못할 거예요.",
      },
      {
        context: "장소 묘사 후 마무리할 때",
        en: "Anyway, it is my favorite place in my neighborhood, and I go there about two or three times a week.",
        ko: "아무튼, 그곳은 우리 동네에서 제가 가장 좋아하는 장소이고 대략 일주일에 2~3번 가요.",
      },
    ],
  },
  {
    id: "fil_16",
    category: "finish",
    categoryName: "깔끔한 답변 마무리 (맺음말)",
    categoryIcon: "🏁",
    phrase: "So yeah... / That's pretty much it.",
    pronunciation: "[쏘 예~ / 댓츠 프리티 머치 잇]",
    meaning: "그래서 그래요, 뭐 대략 그 정도인 것 같아요.",
    timingGuide:
      "답변을 모두 마치고 마지막으로 에바에게 '여기까지가 제 답변입니다'라고 자연스럽게 끝맺을 때 사용합니다.",
    tip: "말끝을 흐리거나 'Thank you'로 어색하게 끝내는 대신 'So yeah, that's pretty much all about my favorite cafe.'라고 깔끔하게 마무리하세요.",
    examples: [
      {
        context: "답변을 자연스럽게 매듭지을 때",
        en: "So yeah, that's pretty much everything about my daily weekend routine.",
        ko: "그래서 그래요, 대략 이것이 저의 일상적인 주말 루틴에 대한 모든 것이에요.",
      },
      {
        context: "장소 묘사를 끝마칠 때",
        en: "So yeah, that's pretty much it. I really love spending time at that park alone.",
        ko: "뭐 대략 그 정도인 것 같아요. 저는 혼자 그 공원에서 시간 보내는 것을 정말 좋아해요.",
      },
    ],
  },
];
