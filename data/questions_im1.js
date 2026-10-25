/**
 * @file questions_im1.js
 * @description OPIc 실전 질문 및 IM1 맞춤 5~7문장 답변 데이터셋 (총 111문항)
 * - 12개 빈출 주제 (일반 11개 주제 × 9문항 + 롤플레이 12문항 = 총 111문항)
 * - 실제 OPIc 3-3 시험의 3단 콤보 및 에바 공식 기출 프롬프트 100% 일치
 * - 정규화된 sentences 배열을 단일 진실 공급원(Single Source of Truth)으로 사용
 * - 파일 하단에서 q.answer_en, q.answer_ko를 자동 합성하여 무결성 보장
 *
 * @author Kim Hyo-sang
 * @version 2.3.1
 */

// OPIc Practice Questions Dataset (Normalized: sentences are single source of truth)
window.QUESTIONS_DATA = [
  {
    id: "q_intro_01",
    cat: "자기소개",
    type: "인물 묘사",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "Let's start the interview now. Please tell me a little bit about yourself.",
    q_ko: "인터뷰를 시작하겠습니다. 본인에 대해 간단히 소개해 주세요.",
    sentences: [
      {
        en: "Hello, Eva! My name is Hyosang Kim, and I am twenty-eight years old.",
        ko: "안녕하세요, 에바! 제 이름은 김효상이고 28살입니다.",
      },
      {
        en: "I live alone in a cozy apartment near my office.",
        ko: "저는 회사 근처의 아늑한 아파트에 혼자 살고 있어요.",
      },
      {
        en: "I work at an office from nine to six.",
        ko: "저는 사무실에서 9시부터 6시까지 일하고 있습니다.",
      },
      {
        en: "In my free time, I really like cooking, coding, and walking.",
        ko: "여가 시간에는 요리하기, 코딩, 산책하는 것을 정말 좋아해요.",
      },
      {
        en: "I am a very positive, calm, and friendly person.",
        ko: "제 성격은 매우 긍정적이고 차분하며 친절한 편이에요.",
      },
      {
        en: "I am very happy to take this test today, and I will do my best.",
        ko: "오늘 이 시험을 보게 되어 기쁘고, 최선을 다하겠습니다.",
      },
    ],
    keywords: [
      "twenty-eight years old",
      "live alone in cozy apartment",
      "work nine to six",
      "cooking and coding",
      "positive and friendly",
    ],
    tip: "[초간단 자기소개] 이름/나이 → 1인 가구 거주지 → 9 to 6 근무 → 취미(요리, 코딩, 산책) → 긍정적 성격 → 최선 다짐.",
  },
  {
    id: "q_intro_02",
    cat: "자기소개",
    type: "일상/취미",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "Tell me more about yourself. What is your daily routine like on weekdays, and what do you usually do on weekends?",
    q_ko: "본인에 대해 더 자세히 말씀해 주세요. 평일 하루 일과는 어떻고 주말에는 주로 무엇을 하시나요?",
    sentences: [
      {
        en: "On weekdays, I usually work at an office from nine to six.",
        ko: "평일에는 보통 사무실에서 9시부터 6시까지 일해요.",
      },
      {
        en: "When I get home after work, I take a shower and eat dinner alone.",
        ko: "퇴근하고 집에 오면 샤워를 하고 혼자 저녁을 먹습니다.",
      },
      {
        en: "On weekends, when I have free time, I love to walk in the park near my house.",
        ko: "주말에는 여유 시간이 있을 때 집 근처 공원을 걷는 것을 아주 좋아해요.",
      },
      {
        en: "I often go to Starbucks to drink an iced Americano alone.",
        ko: "종종 스타벅스에 가서 혼자 아이스 아메리카노를 마시곤 합니다.",
      },
      {
        en: "Spending quiet time like this makes me relaxed.",
        ko: "이렇게 조용한 시간을 보내면 마음이 편안해져요.",
      },
      {
        en: "So, I really like my simple and happy life.",
        ko: "그래서 저는 저의 단순하고 행복한 삶을 정말 좋아합니다.",
      },
    ],
    keywords: [
      "work nine to six",
      "eat dinner alone",
      "park near my house",
      "Starbucks iced Americano",
      "makes me relaxed",
      "simple and happy life",
    ],
    tip: "[초간단 루틴] 평일 9 to 6 근무 → 퇴근 후 저녁 → 주말 집 근처 공원 산책 → 스타벅스 커피 → 스트레스 해소 → 행복한 삶.",
  },
  {
    id: "q_intro_03",
    cat: "자기소개",
    type: "과거 기억",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_03",
    q_en: "Tell me about when and why you first started learning English. Do you remember the first time you spoke to a foreigner? Tell me about that experience in detail.",
    q_ko: "언제 왜 처음 영어를 배우기 시작했는지 말씀해 주세요. 처음 외국인과 대화했던 때를 기억하시나요? 그 경험에 대해 자세히 말씀해 주세요.",
    sentences: [
      {
        en: "I first started learning English when I was in middle school.",
        ko: "저는 중학교 때 처음 영어를 배우기 시작했어요.",
      },
      {
        en: "At first, grammar was very difficult, but I really enjoyed learning new words.",
        ko: "처음에는 문법이 매우 어려웠지만, 새로운 단어를 배우는 것은 정말 재미있었습니다.",
      },
      {
        en: "A few years ago, I met a foreign tourist on the subway and gave him directions.",
        ko: "몇 년 전, 지하철에서 한 외국인 관광객을 만나 길을 안내해 준 적이 있어요.",
      },
      {
        en: "I was very nervous, but he thanked me with a big smile.",
        ko: "매우 긴장했지만, 그분이 활짝 웃으며 감사 인사를 해주셨습니다.",
      },
      {
        en: "That special experience motivated me to practice English speaking much harder.",
        ko: "그 특별한 경험 덕분에 영어 말하기를 훨씬 더 열심히 연습하게 되었어요.",
      },
      {
        en: "It is still a very memorable and proud memory for me.",
        ko: "그 일은 저에게 여전히 매우 기억에 남고 뿌듯한 추억입니다.",
      },
    ],
    keywords: [
      "middle school",
      "learning new words",
      "foreign tourist",
      "gave directions",
      "proud memory",
    ],
    tip: "[영어 시작 계기/과거 기억] 중학교 첫 학습 → 외국인에게 길 안내한 에피소드 → 큰 보람과 동기부여 강조.",
  },
  {
    id: "q_intro_04",
    cat: "자기소개",
    type: "성격 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "How would you describe your personality? What kind of person are you, and how do your friends or coworkers describe you? Tell me in detail.",
    q_ko: "본인의 성격에 대해 어떻게 설명하시겠습니까? 어떤 성격이고 주변 친구나 동료들은 당신을 어떻게 평가하나요? 자세히 말씀해 주세요.",
    sentences: [
      {
        en: "I would describe myself as a very calm, friendly, and positive person.",
        ko: "제 자신을 소개하자면 매우 차분하고 다정하며 긍정적인 사람입니다.",
      },
      {
        en: "I always try to listen carefully to others when having conversations.",
        ko: "저는 대화를 나눌 때 항상 다른 사람의 말에 귀를 기울이려고 노력해요.",
      },
      {
        en: "My close friends often tell me that I am very reliable and easygoing.",
        ko: "친한 친구들은 종종 제가 매우 믿음직스럽고 원만한 사람이라고 말합니다.",
      },
      {
        en: "Even when I face a difficult problem, I try not to panic and stay calm.",
        ko: "어려운 문제에 부딪혀도 당황하지 않고 침착함을 유지하려고 해요.",
      },
      {
        en: "I think having a positive mindset is one of my greatest strengths.",
        ko: "긍정적인 사고방식을 갖는 것이 저의 가장 큰 장점 중 하나라고 생각합니다.",
      },
      {
        en: "I hope my friendly energy brings good vibes to the people around me.",
        ko: "저의 다정한 에너지가 주변 사람들에게 좋은 기운을 주기를 바랍니다.",
      },
    ],
    keywords: [
      "calm and friendly",
      "listen carefully",
      "reliable and easygoing",
      "stay calm",
      "positive mindset",
    ],
    tip: "[성격 및 장점 묘사] 차분하고 친절함 선언 → 경청 태도 → 친구들의 긍정적 평가 → 긍정적 마인드 강조.",
  },
  {
    id: "q_intro_05",
    cat: "자기소개",
    type: "일상 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you normally do in your free time after work or on weekends? Tell me about your typical routine when you enjoy your hobbies.",
    q_ko: "퇴근 후 여가 시간이나 주말에 주로 무엇을 하시나요? 취미를 즐기는 전형적인 일과 루틴에 대해 말씀해 주세요.",
    sentences: [
      {
        en: "When I have free time after work, I usually enjoy reading or listening to music.",
        ko: "퇴근 후 여유 시간이 생기면 주로 독서를 하거나 음악을 즐겨 듣습니다.",
      },
      {
        en: "First, I change into comfortable clothes and make a warm cup of tea.",
        ko: "먼저 편한 옷으로 갈아입고 따뜻한 차 한 잔을 준비해요.",
      },
      {
        en: "Then, I sit on the sofa and play some calm acoustic music.",
        ko: "그런 다음 소파에 앉아 잔잔한 어쿠스틱 음악을 틉니다.",
      },
      {
        en: "While listening to music, I read a book for about an hour.",
        ko: "음악을 들으면서 약 한 시간 동안 책을 읽어요.",
      },
      {
        en: "After that, I write a short journal about my day before going to bed.",
        ko: "그 후에는 잠자리에 들기 전 하루 일과에 대한 짧은 일기를 씁니다.",
      },
      {
        en: "This simple evening routine helps me recharge my energy after a busy day.",
        ko: "이 소박한 저녁 루틴은 바쁜 하루를 보낸 후 에너지를 재충전하는 데 큰 도움이 돼요.",
      },
    ],
    keywords: [
      "free time after work",
      "comfortable clothes",
      "calm acoustic music",
      "read a book",
      "recharge my energy",
    ],
    tip: "[저녁 취미 루틴] 편한 옷 환복 → 차 준비 → 잔잔한 음악과 독서 → 일기 작성 및 힐링 마무리.",
  },
  {
    id: "q_intro_06",
    cat: "자기소개",
    type: "변화/비교",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 변화·비교 심화",
    pattern_id: "pat_05",
    q_en: "How has your daily lifestyle or personality changed compared to when you were younger? What are the differences between then and now?",
    q_ko: "과거 어릴 적과 비교하여 당신의 일상 라이프스타일이나 성격이 어떻게 변화했나요? 그때와 지금의 차이점에 대해 말씀해 주세요.",
    sentences: [
      {
        en: "Compared to the past, my daily lifestyle has changed quite a lot.",
        ko: "과거와 비교하여 저의 일상적인 라이프스타일은 꽤 많이 달라졌습니다.",
      },
      {
        en: "In the past, I used to stay up late playing computer games.",
        ko: "예전에는 컴퓨터 게임을 하느라 늦게까지 깨어 있곤 했어요.",
      },
      {
        en: "However, these days, I care much more about my health and daily routine.",
        ko: "하지만 요즘에는 건강과 규칙적인 일과를 훨씬 더 중요하게 생각합니다.",
      },
      {
        en: "I try to wake up early, drink plenty of water, and exercise regularly.",
        ko: "아침에 일찍 일어나 물을 많이 마시고 규칙적으로 운동하려고 노력해요.",
      },
      {
        en: "Also, I spend more time learning practical skills like English.",
        ko: "또한 영어처럼 실용적인 새로운 기술을 배우는 데 더 많은 시간을 씁니다.",
      },
      {
        en: "I feel much healthier and more productive now, which makes me very happy.",
        ko: "예전보다 훨씬 건강하고 생산적으로 느껴져서 매우 만족스럽습니다.",
      },
    ],
    keywords: [
      "stay up late",
      "care about health",
      "wake up early",
      "exercise regularly",
      "healthier and more productive",
    ],
    tip: "[라이프스타일 비교] 과거(밤샘 게임) vs 현재(규칙적 운동, 건강, 자기계발) 대비 → 긍정적 만족감.",
  },
  {
    id: "q_home_01",
    cat: "집/주거",
    type: "장소 묘사",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you live in an apartment. Please describe your home to me. What does it look like, and what rooms do you have? Tell me about your home in as much detail as possible.",
    q_ko: "설문에서 아파트에 거주한다고 하셨습니다. 거주하시는 집에 대해 설명해 주세요. 집이 어떻게 생겼고 어떤 방들이 있나요? 가능한 한 자세히 설명해 주세요.",
    sentences: [
      {
        en: "Whenever I think of my house, the living room is my favorite place.",
        ko: "제 집을 생각할 때마다, 거실이 제 최애 장소예요.",
      },
      {
        en: "It is located near my office, so it is very easy to commute.",
        ko: "회사 근처에 있어서, 출퇴근하기가 정말 편해요.",
      },
      {
        en: "Also, the vibe is very relaxing and cozy.",
        ko: "또한, 분위기가 아주 편안하고 아늑해요.",
      },
      {
        en: "There are a soft sofa and a big TV, so I really like it.",
        ko: "폭신한 소파와 큰 TV가 있어서 정말 마음에 들어요.",
      },
      {
        en: "It is the best place for me.",
        ko: "저한테는 여기가 최고의 장소예요.",
      },
      {
        en: "So, I stay there all the time.",
        ko: "그래서 저는 거기서 맨날 시간을 보내요.",
      },
    ],
    keywords: [
      "living room favorite place",
      "near my office",
      "relaxing and cozy",
      "soft sofa and big TV",
      "watching YouTube",
      "stay there all the time",
    ],
    tip: "[만능 집 묘사] 거실 최애 장소 → 회사 근처 편리함 → 편안하고 아늑한 분위기 → 소파와 TV → 유튜브 힐링 → 편안함.",
  },
  {
    id: "q_home_02",
    cat: "집/주거",
    type: "일상 루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you usually do at home on weekdays and weekends? Tell me about your typical daily routine at home from morning until you go to bed.",
    q_ko: "평일과 주말에 집에서 보통 무엇을 하시나요? 아침부터 잠자리에 들 때까지 집에서의 일반적인 일상 루틴을 말씀해 주세요.",
    sentences: [
      {
        en: "Usually, when I get home after work, I have a simple evening routine.",
        ko: "보통 퇴근 후 집에 오면 간단한 저녁 루틴을 보냅니다.",
      },
      {
        en: "First, I wash my hands and change into casual clothes.",
        ko: "먼저 손을 씻고 편한 옷으로 갈아입어요.",
      },
      {
        en: "Then, I cook a simple dinner like fried rice and eat alone.",
        ko: "그 다음 볶음밥처럼 간단한 저녁을 만들어서 혼자 먹습니다.",
      },
      {
        en: "While eating, I watch interesting videos on YouTube.",
        ko: "밥을 먹으면서 유튜브에서 재미있는 영상을 봅니다.",
      },
      {
        en: "After that, I take a warm shower and lie down on my sofa.",
        ko: "그 후에 따뜻한 샤워를 하고 소파에 편하게 눕습니다.",
      },
      {
        en: "Doing this routine makes me relaxed, so I do it every day.",
        ko: "이런 루틴을 하면 마음이 편안해져서 매일 이렇게 해요.",
      },
    ],
    keywords: [
      "simple evening routine",
      "casual clothes",
      "simple dinner alone",
      "watch YouTube videos",
      "warm shower and sofa",
      "makes me relaxed",
    ],
    tip: "[초간단 집 루틴] 편한 옷 갈아입기 → 간단 요리(볶음밥) 혼밥 → 유튜브 시청 → 따뜻한 샤워 & 소파 휴식 → 스트레스 해소.",
  },
  {
    id: "q_home_03",
    cat: "집/주거",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_04",
    q_en: "Have you ever experienced an unexpected problem at home, such as something broken or an appliance not working? What was the problem, and how did you resolve it?",
    q_ko: "물건이 고장 나거나 가전제품이 작동하지 않는 등 집에서 예상치 못한 문제를 겪은 적이 있나요? 무슨 문제였고 어떻게 해결하셨나요?",
    sentences: [
      {
        en: "I remember a problem when I was resting at home last summer.",
        ko: "지난여름 집에서 쉬던 중에 겪었던 문제가 하나 기억나요.",
      },
      {
        en: "Suddenly, my air conditioner stopped working on a very hot day.",
        ko: "갑자기 아주 더운 날에 에어컨 작동이 멈췄어요.",
      },
      {
        en: "I was very surprised and worried at first.",
        ko: "처음에는 너무 놀라고 걱정이 되었습니다.",
      },
      {
        en: "However, I calmed down and quickly called the repair center.",
        ko: "하지만 마음을 가라앉히고 빠르게 수리 센터에 전화했어요.",
      },
      {
        en: "Fortunately, a repairman came the next morning and fixed it quickly.",
        ko: "다행히 수리 기사님이 다음 날 아침에 오셔서 빠르게 고쳐주셨어요.",
      },
      {
        en: "It was hot, but it was a great relief and a good memory.",
        ko: "더웠지만, 정말 안도했고 좋은 추억이 되었습니다.",
      },
    ],
    keywords: [
      "problem at home last summer",
      "air conditioner stopped working",
      "surprised and worried",
      "called repair center",
      "repairman fixed it quickly",
      "great relief",
    ],
    tip: "[초간단 집 문제해결] 에어컨 고장 → 놀람과 걱정 → 수리 센터 전화 → 기사님 빠른 수리 → 안도와 좋은 추억.",
  },
  {
    id: "q_home_05",
    cat: "집/주거",
    type: "공간 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "Please tell me about your favorite room in your home. What does it look like, what kinds of furniture are in that room, and why do you like spending time there?",
    q_ko: "집에서 가장 좋아하는 방에 대해 말씀해 주세요. 어떻게 생겼고 어떤 가구들이 있으며 왜 그곳에서 시간 보내는 것을 좋아하시나요?",
    sentences: [
      {
        en: "My favorite space in my home is definitely my cozy living room.",
        ko: "집에서 제가 가장 좋아하는 공간은 단연 아늑한 거실입니다.",
      },
      {
        en: "It has a large window that lets in a lot of bright warm sunlight.",
        ko: "그곳에는 밝고 따뜻한 햇살이 가득 들어오는 큰 창문이 있어요.",
      },
      {
        en: "There is a soft grey sofa, a small wooden table, and a green plant.",
        ko: "부드러운 회색 소파와 작은 원목 테이블, 그리고 초록빛 화분이 하나 놓여 있습니다.",
      },
      {
        en: "The atmosphere is always very clean, quiet, and peaceful.",
        ko: "거실의 분위기는 언제나 매우 깔끔하고 조용하며 평화로워요.",
      },
      {
        en: "I usually sit on the sofa to drink coffee and listen to quiet music there.",
        ko: "저는 주로 그곳 소파에 앉아 커피를 마시고 조용한 음악을 듣곤 합니다.",
      },
      {
        en: "It is truly the best healing spot in my entire house.",
        ko: "그 공간은 진정 제 온 집안에서 최고의 힐링 공간이에요.",
      },
    ],
    keywords: [
      "cozy living room",
      "warm sunlight",
      "soft grey sofa",
      "clean and peaceful",
      "best healing spot",
    ],
    tip: "[선호 공간 묘사] 거실 선언 → 큰 창문과 채광 → 가구(소파, 테이블, 화분) → 힐링 공간 강조.",
  },
  {
    id: "q_home_06",
    cat: "집/주거",
    type: "정리 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you usually do to keep your house clean? Please describe your cleaning routine from the beginning to the end.",
    q_ko: "집을 깨끗하게 유지하기 위해 보통 무엇을 하시나요? 청소 루틴을 처음부터 끝까지 설명해 주세요.",
    sentences: [
      {
        en: "I usually clean and organize my house every Saturday morning.",
        ko: "저는 보통 매주 토요일 아침에 집을 청소하고 정리합니다.",
      },
      {
        en: "First, I open all the windows wide to let fresh air inside.",
        ko: "먼저 상쾌한 공기가 들어오도록 모든 창문을 활짝 열어요.",
      },
      {
        en: "Then, I use a vacuum cleaner to clean the floors in every room.",
        ko: "그런 다음 진공청소기를 사용해 모든 방의 바닥을 청소합니다.",
      },
      {
        en: "Next, I wipe the kitchen table and desk with a wet cloth.",
        ko: "다음으로 젖은 걸레로 식탁과 책상을 깨끗이 닦습니다.",
      },
      {
        en: "After that, I take out the trash and water my small houseplant.",
        ko: "그 후에는 쓰레기를 내다 버리고 작은 화분에 물을 줍니다.",
      },
      {
        en: "When everything is neat and tidy, I feel so refreshed and happy.",
        ko: "모든 것이 깔끔하고 정돈되면 기분이 정말 상쾌하고 행복해져요.",
      },
    ],
    keywords: [
      "Saturday morning",
      "open all the windows",
      "vacuum cleaner",
      "wipe with a wet cloth",
      "neat and tidy",
    ],
    tip: "[집 청소 루틴] 토요일 아침 환기 → 청소기 돌리기 → 걸레질 → 분리수거 및 식물 물주기 → 상쾌한 마무리.",
  },
  {
    id: "q_home_04",
    cat: "집/주거",
    type: "변화/인테리어",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 변화·비교 심화",
    pattern_id: "pat_05",
    q_en: "How has your current home changed compared to the home you lived in when you were a child? What changes have been made, such as new furniture or interior renovations?",
    q_ko: "어릴 적 살던 집과 비교하여 현재 살고 있는 집은 어떻게 달라졌나요? 새 가구를 사거나 인테리어를 바꾸는 등 어떤 변화가 있었나요?",
    sentences: [
      {
        en: "In the past, my house was very different from now.",
        ko: "과거에는 제 집이 지금과 많이 달랐어요.",
      },
      {
        en: "In the past, my room was small and had old furniture.",
        ko: "과거에는 방이 좁았고 오래된 가구들만 있었어요.",
      },
      {
        en: "However, now, my new apartment is very clean and modern.",
        ko: "하지만 지금 제 새 아파트는 아주 깔끔하고 현대적이에요.",
      },
      {
        en: "For example, I bought a cozy sofa and a warm mood light.",
        ko: "예를 들어 아늑한 소파와 따뜻한 무드등을 샀습니다.",
      },
      {
        en: "So, resting at home after work feels much more healing and fun.",
        ko: "그래서 퇴근 후 집에서 쉬는 게 훨씬 더 힐링되고 즐거워요.",
      },
      {
        en: "So, I really like my new house and I am very happy.",
        ko: "그래서 저는 새집이 정말 마음에 들고 아주 행복합니다.",
      },
    ],
    keywords: [
      "very different from now",
      "room was small and old",
      "clean and modern",
      "cozy sofa and mood light",
      "resting at home after work",
      "very happy",
    ],
    tip: "[초간단 집 변화 비교] 옛날 작은 집 ➔ 지금 새 아파트 깔끔함 ➔ 소파와 무드등 ➔ 퇴근 후 힐링 ➔ 대만족.",
  },
  {
    id: "q_work_01",
    cat: "직장/업무",
    type: "장소 묘사",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you work. Please describe the company you work for. Where is it located, and what does the building and your office look like?",
    q_ko: "설문에서 직장에 다닌다고 하셨습니다. 다니시는 회사에 대해 설명해 주세요. 어디에 위치해 있고 회사 건물과 사무실은 어떻게 생겼나요?",
    sentences: [
      {
        en: "Whenever I think of my workplace, my office is my favorite place.",
        ko: "제 직장을 생각할 때마다, 제 사무실이 가장 정이 가는 곳이에요.",
      },
      {
        en: "My company is located near my house, so it is very easy to commute there.",
        ko: "저희 회사는 집 근처에 있어서, 출퇴근하기가 정말 편해요.",
      },
      {
        en: "And the vibe is very clean, bright, and well-organized.",
        ko: "그리고 분위기가 아주 깔끔하고 밝으며 잘 정돈되어 있어요.",
      },
      {
        en: "There are nice desks and dual-screen computers, so we can work easily.",
        ko: "좋은 책상과 듀얼 모니터 컴퓨터가 있어서 편하게 일할 수 있어요.",
      },
      {
        en: "I love this place because my colleagues are very kind and friendly.",
        ko: "동료들이 매우 친절하고 상냥해서 이 직장을 너무 좋아해요.",
      },
      {
        en: "So, I always feel happy and proud whenever I work there.",
        ko: "그래서 일할 때마다 저는 항상 보람과 자부심을 느껴요.",
      },
    ],
    keywords: [
      "office near my house",
      "easy to commute",
      "clean, bright, and well-organized",
      "nice desks and computers",
      "kind and friendly colleagues",
      "happy and proud",
    ],
    tip: "[초간단 직장 묘사] 집 근처 회사 → 편리한 출퇴근 → 깔끔하고 밝은 사무실 → 책상과 컴퓨터 → 친절한 동료들과 보람.",
  },
  {
    id: "q_work_02",
    cat: "직장/업무",
    type: "일상/루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "Tell me about your daily responsibilities at work. What tasks do you handle on a typical workday from start to finish?",
    q_ko: "직장에서의 일상적인 업무에 대해 말씀해 주세요. 일반적인 근무 시간 동안 출근해서 퇴근할 때까지 어떤 일들을 처리하시나요?",
    sentences: [
      {
        en: "As an office worker, I work from nine to six every day.",
        ko: "회사원으로서, 저는 매일 9시부터 6시까지 일합니다.",
      },
      {
        en: "First, when I arrive at work, I check my emails and write my to-do list.",
        ko: "먼저 출근하면 이메일을 확인하고 오늘의 할 일 목록을 적어요.",
      },
      {
        en: "Then, I have a morning meeting with my team to talk about our schedule.",
        ko: "그 후 팀원들과 아침 미팅을 하며 일정을 이야기해요.",
      },
      {
        en: "In the afternoon, I write business reports and check work data on my computer.",
        ko: "오후에는 컴퓨터로 업무 보고서를 쓰고 데이터를 확인합니다.",
      },
      {
        en: "Before going home, I clean my desk and review today's work.",
        ko: "퇴근하기 전에는 책상을 치우고 오늘 한 일들을 검토해요.",
      },
      {
        en: "Finishing my work brings me great joy, so I work hard every day.",
        ko: "하루 일을 잘 마치면 큰 보람을 느껴서 매일 열심히 일합니다.",
      },
    ],
    keywords: [
      "work nine to six",
      "check emails and to-do list",
      "morning team meeting",
      "write reports and check data",
      "clean desk before going home",
      "great joy",
    ],
    tip: "[초간단 업무 루틴] 9 to 6 근무 → 출근 후 이메일 & 할 일 체크 → 팀 아침 회의 → 보고서 작성 및 데이터 확인 → 퇴근 전 정돈 및 보람.",
  },
  {
    id: "q_work_03",
    cat: "직장/업무",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_04",
    q_en: "Tell me about a memorable project you worked on or an unexpected problem you solved at work. What was the situation, and how did you resolve it?",
    q_ko: "직장에서 수행했던 기억에 남는 프로젝트나 해결했던 긴급한 문제에 대해 말씀해 주세요. 어떤 상황이었고 어떻게 해결하셨나요?",
    sentences: [
      {
        en: "I remember an urgent problem I had at work last year.",
        ko: "작년에 회사에서 겪었던 긴급한 문제가 하나 기억나요.",
      },
      {
        en: "Suddenly, my computer showed an error right before an important deadline.",
        ko: "중요한 마감 직전에 갑자기 컴퓨터에 에러가 떴어요.",
      },
      {
        en: "The screen turned blue, so I was very surprised and worried at first.",
        ko: "화면이 파랗게 변해서 처음에는 너무 놀라고 걱정되었어요.",
      },
      {
        en: "However, I calmed down and quickly checked the file with my colleague.",
        ko: "하지만 마음을 가라앉히고 빠르게 동료와 함께 파일을 점검했어요.",
      },
      {
        en: "Fortunately, we fixed the error quickly and sent the report on time.",
        ko: "다행히 에러를 빠르게 고쳐서 보고서를 제시간에 보냈습니다.",
      },
      {
        en: "It was urgent, but our teamwork made me feel very proud.",
        ko: "긴급했지만, 우리 팀의 협동심 덕분에 정말 자랑스러웠어요.",
      },
    ],
    keywords: [
      "urgent problem at work",
      "computer error before deadline",
      "surprised and worried",
      "checked file with colleague",
      "fixed error on time",
      "felt very proud",
    ],
    tip: "[초간단 직장 문제해결] 마감 직전 에러 발생 → 당황과 걱정 → 침착하게 동료와 파일 점검 → 신속 수정 및 제시간 전송 → 보람과 자부심.",
  },
  {
    id: "q_work_05",
    cat: "직장/업무",
    type: "인물 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "Tell me about a coworker or supervisor you work closely with. What is this person like, and what kind of work do you do together?",
    q_ko: "직장에서 가장 가깝게 일하는 동료나 상사에 대해 말씀해 주세요. 그분은 어떤 성향이고 어떤 업무를 함께 하시나요?",
    sentences: [
      {
        en: "I would like to tell you about my team leader, Mr. Park.",
        ko: "제가 가깝게 일하는 저희 팀장님인 박 팀장님에 대해 말씀드리고 싶어요.",
      },
      {
        en: "He has been working at our company for more than seven years.",
        ko: "그분은 저희 회사에서 7년 넘게 근무해 오셨습니다.",
      },
      {
        en: "He is always very calm, supportive, and extremely professional.",
        ko: "그는 항상 매우 침착하고 잘 도와주시며 대단히 프로페셔널해요.",
      },
      {
        en: "Whenever I have a difficult question or problem, he explains things step by step.",
        ko: "어려운 질문이나 문제가 생길 때마다 차근차근 단계별로 설명해 주십니다.",
      },
      {
        en: "We work together every day on data analysis and weekly reporting.",
        ko: "우리는 매일 데이터 분석과 주간 보고서 작성 업무를 함께 수행해요.",
      },
      {
        en: "I feel very lucky to work with such a kind and reliable mentor.",
        ko: "이렇게 친절하고 신뢰할 수 있는 멘토와 함께 일할 수 있어 참 행운이라고 생각합니다.",
      },
    ],
    keywords: [
      "team leader",
      "calm and supportive",
      "extremely professional",
      "explains step by step",
      "reliable mentor",
    ],
    tip: "[직장 동료/상사 묘사] 팀장님 소개 → 경력 및 전문성 → 친절한 지도 방식 → 협업 업무 → 존경과 감사.",
  },
  {
    id: "q_work_06",
    cat: "직장/업무",
    type: "업무 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "How do you usually conduct meetings or collaborate with your colleagues at work? Tell me about what happens during a typical meeting from start to finish.",
    q_ko: "직장에서 동료들과 회의를 하거나 협업할 때 주로 어떻게 진행하시나요? 일반적인 회의에서 시작부터 끝까지 어떤 일이 일어나는지 말씀해 주세요.",
    sentences: [
      {
        en: "Our team has a regular project meeting every Monday morning at ten.",
        ko: "저희 팀은 매주 월요일 오전 10시에 정기 프로젝트 회의를 갖습니다.",
      },
      {
        en: "First, I prepare the agenda and review my weekly work status.",
        ko: "먼저 회의 안건을 준비하고 저의 주간 업무 현황을 검토해요.",
      },
      {
        en: "Then, all team members gather in the conference room or on video call.",
        ko: "그런 다음 모든 팀원들이 회의실에 모이거나 화상 통화에 접속합니다.",
      },
      {
        en: "Each person shares their completed tasks and upcoming weekly goals.",
        ko: "각자 완료한 업무와 이번 주에 진행할 목표를 차례대로 공유해요.",
      },
      {
        en: "After discussing current issues, we write down clear action items for each member.",
        ko: "현재 이슈에 대해 토론한 후, 각 구성원의 구체적인 실행 과제를 정리합니다.",
      },
      {
        en: "Having this structured meeting helps us stay on the same page and work efficiently.",
        ko: "이러한 체계적인 회의 덕분에 같은 방향을 공유하며 효율적으로 일할 수 있습니다.",
      },
    ],
    keywords: [
      "regular project meeting",
      "prepare the agenda",
      "gather in conference room",
      "share completed tasks",
      "work efficiently",
    ],
    tip: "[회의/협업 루틴] 월요일 회의 → 안건 준비 → 팀원 공유 및 논의 → 실행 과제 도출 → 효율적 업무.",
  },
  {
    id: "q_work_04",
    cat: "직장/업무",
    type: "과거 경험",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 변화·비교 심화",
    pattern_id: "pat_03",
    q_en: "Tell me about your very first day at work. What was your first impression of the company, what did you do, and how did you feel?",
    q_ko: "현재 직장에 처음 출근했던 첫날에 대해 말씀해 주세요. 회사의 첫인상은 어땠고, 무엇을 하셨으며 어떤 기분이 드셨나요?",
    sentences: [
      {
        en: "I remember my very first day at my company clearly.",
        ko: "회사에 처음 출근했던 첫날이 또렷하게 기억나요.",
      },
      {
        en: "When I first walked into the office, everything looked new and exciting.",
        ko: "사무실에 처음 들어갔을 때, 모든 것이 새롭고 신기했어요.",
      },
      {
        en: "I sat at my new desk, and I felt a little nervous.",
        ko: "새 책상에 앉았을 때, 조금 긴장도 되었습니다.",
      },
      {
        en: "However, my colleagues smiled warmly and showed me around the office.",
        ko: "하지만 동료들이 따뜻하게 웃어주며 사무실을 안내해 주었어요.",
      },
      {
        en: "We ate a delicious lunch together, and they were very kind to me.",
        ko: "우리는 함께 맛있는 점심을 먹었고, 다들 저에게 아주 친절했어요.",
      },
      {
        en: "It was a wonderful day, and I will never forget it.",
        ko: "정말 멋진 하루였고, 영원히 잊지 못할 거예요.",
      },
    ],
    keywords: [
      "very first day at work",
      "walked into office",
      "felt a little nervous",
      "colleagues smiled warmly",
      "delicious lunch together",
      "never forget it",
    ],
    tip: "[초간단 첫 출근] 첫 출근의 설렘 → 새 책상과 긴장감 → 동료들의 따뜻한 미소와 사무실 안내 → 맛있는 점심 식사 → 잊지 못할 추억.",
  },
  {
    id: "q_cafe_01",
    cat: "카페가기",
    type: "장소 묘사",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you like going to cafes. Please describe your favorite cafe in detail. Where is it located, and what kind of atmosphere does it have?",
    q_ko: "설문에서 카페 가기를 좋아한다고 하셨습니다. 가장 좋아하시는 카페에 대해 자세히 설명해 주세요. 어디에 위치해 있고 분위기는 어떤가요?",
    sentences: [
      {
        en: "Whenever I think of cafes, Starbucks is my favorite place.",
        ko: "카페를 생각할 때마다, 스타벅스가 제 최애 장소예요.",
      },
      {
        en: "It is located near my house, so it is just five minutes.",
        ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
      },
      {
        en: "Also, the vibe is very relaxing and cozy.",
        ko: "또한, 분위기가 아주 편안하고 아늑해요.",
      },
      {
        en: "There are large windows and nice seats, so I really like it.",
        ko: "큰 창문과 좋은 좌석이 있어서 정말 마음에 들어요.",
      },
      {
        en: "It is the best place for me.",
        ko: "저한테는 여기가 최고의 장소예요.",
      },
      {
        en: "So, I go there about two or three times a week.",
        ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
      },
    ],
    keywords: [
      "Starbucks near my house",
      "just five minutes",
      "relaxing and cozy",
      "large windows and nice seats",
      "best place for me",
      "go there about two or three times a week",
    ],
    tip: "[만능 카페 묘사] 스타벅스 최애 장소 → 집 근처 편리함 → 편안하고 아늑한 분위기 → 큰 창문과 편한 좌석 → 퇴근 후 커피 힐링 → 편안함.",
  },
  {
    id: "q_cafe_02",
    cat: "카페가기",
    type: "일상 루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you normally do when you go to a cafe? Please tell me about your routine from the moment you enter until you leave.",
    q_ko: "카페에 가면 보통 무엇을 하시나요? 카페에 들어설 때부터 나올 때까지의 일반적인 일과 루틴을 말씀해 주세요.",
    sentences: [
      {
        en: "Usually, on weekend afternoons, I go to Starbucks near my house.",
        ko: "보통 주말 오후에 저는 집 근처 스타벅스에 갑니다.",
      },
      {
        en: "First, I enter the cafe and order an iced Americano with the mobile app.",
        ko: "먼저 카페에 들어가서 모바일 앱으로 아이스 아메리카노를 주문해요.",
      },
      {
        en: "While waiting for my drink, I find a quiet table near the window.",
        ko: "음료를 기다리는 동안 창가 근처의 조용한 자리를 잡습니다.",
      },
      {
        en: "While drinking my coffee, I enjoy reading news or listening to music.",
        ko: "커피를 마시면서 뉴스를 읽거나 음악 듣는 것을 즐겨요.",
      },
      {
        en: "After one or two hours, I feel very happy and refreshed.",
        ko: "1~2시간 뒤면 정말 행복하고 재충전된 기분이 들어요.",
      },
      {
        en: "It makes me relaxed, so I go there often.",
        ko: "마음이 편안해져서 저는 그곳에 자주 갑니다.",
      },
    ],
    keywords: [
      "Starbucks near my house",
      "order with mobile app",
      "table near the window",
      "reading news or listening to music",
      "one or two hours",
      "makes me relaxed",
    ],
    tip: "[초간단 카페 루틴] 주말 오후 스타벅스 → 모바일 앱 주문 → 창가 조용한 자리 → 커피 마시며 뉴스/음악 → 재충전 및 스트레스 해소.",
  },
  {
    id: "q_cafe_03",
    cat: "카페가기",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_03",
    q_en: "Tell me about a memorable or special experience you had at a cafe recently. Who were you with, what happened, and why was it so memorable?",
    q_ko: "최근 카페에서 겪었던 기억에 남거나 특별했던 경험에 대해 말씀해 주세요. 누구와 있었고 무슨 일이 있었으며 왜 기억에 남나요?",
    sentences: [
      {
        en: "I remember a sweet memory at a cafe last year.",
        ko: "작년에 카페에서 있었던 아주 달콤한 기억이 하나 있어요.",
      },
      {
        en: "On my birthday, I went to a pretty dessert cafe near my house alone.",
        ko: "제 생일에 혼자 집 근처 예쁜 디저트 카페에 갔어요.",
      },
      {
        en: "The cafe was decorated with flowers, and soft ballad music was playing.",
        ko: "카페는 꽃들로 꾸며져 있었고, 잔잔한 발라드 음악이 나오고 있었어요.",
      },
      {
        en: "I ordered warm coffee and a slice of delicious strawberry cake.",
        ko: "따뜻한 커피와 맛있는 딸기 케이크 한 조각을 주문했습니다.",
      },
      {
        en: "I listened to music and took a quiet rest for myself.",
        ko: "음악을 듣고 저 자신을 위해 조용한 휴식을 취했어요.",
      },
      {
        en: "It was a great day, and I was so happy.",
        ko: "정말 멋진 하루였고, 저는 너무 행복했어요.",
      },
    ],
    keywords: [
      "sweet memory at cafe",
      "pretty dessert cafe near my house",
      "flowers and soft music",
      "warm coffee and strawberry cake",
      "quiet rest for myself",
      "never forget it",
    ],
    tip: "[초간단 카페 경험] 생일날 집 근처 디저트 카페 → 꽃과 잔잔한 음악 → 따뜻한 커피 & 딸기 케이크 → 혼자만의 조용한 힐링 휴식 → 평생 추억.",
  },
  {
    id: "q_cafe_05",
    cat: "카페가기",
    type: "메뉴 선호",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "What kind of coffee, drink, or dessert do you usually order when you go to a cafe? Why is it your favorite?",
    q_ko: "카페에 가면 주로 어떤 커피나 음료, 디저트를 주문하시나요? 왜 그것을 가장 좋아하시나요?",
    sentences: [
      {
        en: "Whenever I go to a cafe, my go-to drink is always an iced Americano.",
        ko: "제가 카페에 갈 때마다 가장 즐겨 찾는 음료는 언제나 아이스 아메리카노입니다.",
      },
      {
        en: "It tastes so fresh, bold, and never too sweet.",
        ko: "맛이 매우 깔끔하고 진하며 결코 너무 달지 않아요.",
      },
      {
        en: "If I feel a little bit hungry, I also order a slice of cheesecake.",
        ko: "출출할 때에는 치즈케이크 한 조각을 함께 주문하곤 합니다.",
      },
      {
        en: "The rich, sweet cheese flavor goes perfectly with the bitter coffee.",
        ko: "진하고 달콤한 치즈 맛이 쌉싸름한 커피와 완벽하게 어우러져요.",
      },
      {
        en: "It gives me a quick energy boost whenever I feel tired.",
        ko: "피곤할 때마다 즉시 기운을 북돋아 줍니다.",
      },
      {
        en: "That is why this coffee and cake combo is my absolute favorite.",
        ko: "그것이 바로 이 커피와 케이크 조합이 저의 최애 조합인 이유예요.",
      },
    ],
    keywords: [
      "iced Americano",
      "fresh and bold",
      "slice of cheesecake",
      "goes perfectly with",
      "energy boost",
    ],
    tip: "[음료/디저트 선호 묘사] 아이스 아메리카노 선언 → 깔끔한 맛 → 치즈케이크 곁들임 → 최고의 조합 강조.",
  },
  {
    id: "q_cafe_06",
    cat: "카페가기",
    type: "만남 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "When you visit a cafe to meet friends or study alone, what do you usually do? Tell me about your routine step by step.",
    q_ko: "친구를 만나거나 혼자 공부하기 위해 카페에 갈 때 보통 무엇을 하시나요? 단계별 루틴을 말씀해 주세요.",
    sentences: [
      {
        en: "On weekends, I often spend two or three hours studying or chatting at a cafe.",
        ko: "주말에는 카페에서 공부를 하거나 대화를 나누며 2~3시간을 보내곤 합니다.",
      },
      {
        en: "First, I look around and find a quiet table near a power outlet.",
        ko: "먼저 콘센트 근처의 조용한 자리를 찾아 자리를 잡아요.",
      },
      {
        en: "Then, I go to the counter, order an iced Americano, and pick it up.",
        ko: "그런 다음 카운터로 가서 아이스 아메리카노를 주문하고 받아옵니다.",
      },
      {
        en: "Next, I open my laptop and study while sipping my coffee.",
        ko: "다음으로 노트북을 켜고 커피를 마시며 공부를 해요.",
      },
      {
        en: "When I meet a friend, we talk about our week and share funny stories.",
        ko: "친구를 만날 때에는 서로의 한 주 일상을 나누며 재미있는 이야기를 주고받습니다.",
      },
      {
        en: "It is always a relaxing and productive way to spend my afternoon.",
        ko: "그것은 언제나 오후 시간을 보내는 여유롭고 생산적인 방법이에요.",
      },
    ],
    keywords: [
      "two or three hours",
      "quiet table",
      "iced Americano",
      "open laptop",
      "relaxing and productive",
    ],
    tip: "[카페 만남/공부 루틴] 콘센트 자리잡기 → 음료 픽업 → 노트북 작업 및 수다 → 여유로운 오후 마무리.",
  },
  {
    id: "q_cafe_04",
    cat: "카페가기",
    type: "변화/비교",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 변화·비교 심화",
    pattern_id: "pat_05",
    q_en: "How have cafes changed compared to the past? Please describe what cafes were like before and how they are different today.",
    q_ko: "과거와 비교하여 카페가 어떻게 변화했나요? 예전의 카페 모습과 오늘날의 카페는 어떻게 다른지 설명해 주세요.",
    sentences: [
      {
        en: "In the past, cafes in Korea were very different from now.",
        ko: "과거에는 한국의 카페가 지금과 많이 달랐어요.",
      },
      {
        en: "In the past, cafes were simple and choices were limited.",
        ko: "과거에는 카페가 단순했고 메뉴 선택이 별로 없었어요.",
      },
      {
        en: "However, now, cafes are very convenient and modern.",
        ko: "하지만 지금은 카페가 아주 편리하고 현대적이에요.",
      },
      {
        en: "For example, we can use mobile order apps easily without waiting in line.",
        ko: "예를 들어 우리는 줄을 서지 않고 모바일 주문 앱을 쉽게 써요.",
      },
      {
        en: "Also, we can enjoy delicious bakeries and premium desserts.",
        ko: "또한 맛있는 빵과 고급 디저트를 즐길 수 있습니다.",
      },
      {
        en: "So, I really like these nice changes.",
        ko: "그래서 저는 이런 좋은 변화들이 정말 마음에 들어요.",
      },
    ],
    keywords: [
      "very different from now",
      "simple and choices limited",
      "convenient and modern",
      "mobile order apps without line",
      "delicious bakeries and desserts",
      "really like these changes",
    ],
    tip: "[초간단 카페 변화 비교] 과거 단순한 메뉴 ➔ 현재 모던하고 편리함 ➔ 줄 서지 않는 모바일 주문 ➔ 맛있는 베이커리 ➔ 대만족.",
  },
  {
    id: "q_park_01",
    cat: "공원가기",
    type: "장소 묘사",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you like going to parks. Please describe a park you frequently visit. Where is it located and what does it look like?",
    q_ko: "설문에서 공원 가기를 좋아한다고 하셨습니다. 자주 가시는 공원에 대해 설명해 주세요. 어디에 있고 어떻게 생겼나요?",
    sentences: [
      {
        en: "Whenever I think of parks, Areumdeuri Park is my favorite place.",
        ko: "공원을 생각할 때마다, 아름드리 공원이 제 최애 장소예요.",
      },
      {
        en: "It is located near my house, so it is just five minutes.",
        ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
      },
      {
        en: "Also, the vibe is very relaxing and cozy.",
        ko: "또한, 분위기가 아주 편안하고 아늑해요.",
      },
      {
        en: "There are many trees and beautiful flowers, so I really like it.",
        ko: "많은 나무들과 아름다운 꽃들이 있어서 정말 마음에 들어요.",
      },
      {
        en: "It is the best place for me.",
        ko: "저한테는 여기가 최고의 장소예요.",
      },
      {
        en: "So, I go there about two or three times a week.",
        ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
      },
    ],
    keywords: [
      "Areumdeuri Park near my house",
      "just five minutes",
      "relaxing and cozy",
      "many trees and beautiful flowers",
      "best place for me",
      "go there about two or three times a week",
    ],
    tip: "[만능 공원 묘사] 아름드리 공원 → 접근성 편함 → 깔끔하고 아늑함 → 나무와 꽃들 → 퇴근 후 혼자 산책 힐링 → 편안함.",
  },
  {
    id: "q_park_02",
    cat: "공원가기",
    type: "일상 루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you usually do when you go to the park? Tell me about your typical routine at the park from beginning to end.",
    q_ko: "공원에 가면 보통 무엇을 하시나요? 공원에서의 일반적인 활동 루틴을 처음부터 끝까지 말씀해 주세요.",
    sentences: [
      {
        en: "Usually, in the evening, I love to walk in the park near my house.",
        ko: "보통 저녁에 저는 집 근처 공원에서 걷는 것을 정말 좋아해요.",
      },
      {
        en: "First, I wear light sneakers and wireless earphones.",
        ko: "먼저 편안한 운동화를 신추고 무선 이어폰을 챙깁니다.",
      },
      {
        en: "When I arrive at the park, I walk slowly along the green trail.",
        ko: "공원에 도착하면 푸른 산책로를 따라 천천히 걸어요.",
      },
      {
        en: "While walking, I enjoy listening to soft ballad music.",
        ko: "걸으면서 잔잔한 발라드 음악을 듣는 것을 즐깁니다.",
      },
      {
        en: "After walking for forty minutes, I do simple stretching on a bench.",
        ko: "40분 동안 걷고 난 뒤 벤치에서 가벼운 스트레칭을 해요.",
      },
      {
        en: "It makes me relaxed, so I do it often.",
        ko: "마음이 편안해져서 저는 자주 이렇게 합니다.",
      },
    ],
    keywords: [
      "walk in the park near my house",
      "light sneakers and earphones",
      "walk slowly along green trail",
      "listening to soft ballad music",
      "stretching on a bench",
      "makes me relaxed",
    ],
    tip: "[초간단 공원 루틴] 저녁 공원 산책 → 운동화 & 무선이어폰 → 푸른 산책로 걷기 → 발라드 음악 청취 → 벤치 스트레칭 → 스트레스 해소.",
  },
  {
    id: "q_park_03",
    cat: "공원가기",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_04",
    q_en: "Tell me about a memorable or unexpected incident that happened to you at a park. What happened, and how did you react?",
    q_ko: "공원에서 있었던 기억에 남거나 뜻밖이었던 사건에 대해 말씀해 주세요. 무슨 일이 있었고 어떻게 반응하셨나요?",
    sentences: [
      {
        en: "I remember a nice surprise when I was walking in the park near my house.",
        ko: "집 근처 공원을 걷던 중 겪었던 기분 좋은 깜짝 일이 하나 기억나요.",
      },
      {
        en: "A few weeks ago, I saw an old colleague from my past company.",
        ko: "몇 주 전, 예전 직장의 옛 동료를 우연히 보았어요.",
      },
      {
        en: "I was very surprised and happy at first.",
        ko: "처음에는 너무 놀라고 반가웠습니다.",
      },
      {
        en: "We smiled, said hello, and found out that we live in the same neighborhood.",
        ko: "우리는 미소를 지으며 인사했고, 같은 동네에 산다는 것을 알게 되었어요.",
      },
      {
        en: "We went to Starbucks across the street, drank iced coffee, and talked a lot.",
        ko: "우리는 건너편 스타벅스에 가서 아이스 커피를 마시며 많은 이야기를 나눴어요.",
      },
      {
        en: "It was a wonderful day, and I will never forget it.",
        ko: "정말 멋진 하루였고, 영원히 잊지 못할 거예요.",
      },
    ],
    keywords: [
      "nice surprise at park",
      "saw an old colleague",
      "very surprised and happy",
      "live in same neighborhood",
      "Starbucks and talked a lot",
      "never forget it",
    ],
    tip: "[초간단 공원 만남] 저녁 산책 중 옛 동료 우연한 만남 → 깜짝 놀람과 반가움 → 같은 동네 주민 확인 → 스타벅스 커피 수다 → 뜻깊은 추억.",
  },
  {
    id: "q_park_05",
    cat: "공원가기",
    type: "시설 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "Please describe the natural scenery and special facilities like lakes, benches, and walking trails at your favorite park.",
    q_ko: "자주 가시는 공원의 자연 풍경과 호수, 벤치, 산책로 등 특별한 시설에 대해 설명해 주세요.",
    sentences: [
      {
        en: "The park near my house has a huge beautiful lake right in the center.",
        ko: "저희 집 근처 공원 한가운데에는 거대하고 아름다운 호수가 있습니다.",
      },
      {
        en: "Around the lake, there is a very long, flat wooden walking trail.",
        ko: "호수 둘레를 따라 매우 길고 평평한 나무 데크 산책로가 조성되어 있어요.",
      },
      {
        en: "There are also tall green trees and plenty of wooden benches to rest on.",
        ko: "키 큰 녹색 나무들과 편히 쉴 수 있는 목재 벤치도 곳곳에 많이 있습니다.",
      },
      {
        en: "At night, soft warm lights illuminate the lake paths, creating a romantic mood.",
        ko: "밤이 되면 은은하고 따뜻한 조명이 호숫가를 밝혀 로맨틱한 분위기를 자아냅니다.",
      },
      {
        en: "Many people enjoy jogging, riding bicycles, or walking their dogs there.",
        ko: "많은 사람들이 그곳에서 조깅을 하거나 자전거를 타고, 반려견을 산책시켜요.",
      },
      {
        en: "It is truly a wonderful green oasis in the middle of our busy city.",
        ko: "그곳은 정말 바쁜 도심 한가운데에 있는 멋진 녹색 오아시스입니다.",
      },
    ],
    keywords: [
      "huge beautiful lake",
      "wooden walking trail",
      "wooden benches",
      "soft warm lights",
      "green oasis",
    ],
    tip: "[공원 풍경/시설 묘사] 중심 호수 → 데크 산책로 → 나무와 벤치 → 야간 조명 → 도심 속 오아시스.",
  },
  {
    id: "q_park_06",
    cat: "공원가기",
    type: "피크닉 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "Tell me about what you do when you have a picnic at the park on a sunny day. What do you prepare, and what is your routine during the picnic?",
    q_ko: "날씨가 좋은 날 공원에서 피크닉을 할 때 보통 무엇을 하시나요? 무엇을 준비하고 피크닉 루틴은 어떠한가요?",
    sentences: [
      {
        en: "When the weather is sunny in spring or fall, I love having a picnic at the park.",
        ko: "봄이나 가을에 날씨가 맑으면 공원에서 피크닉을 즐기는 것을 아주 좋아합니다.",
      },
      {
        en: "First, I pack a picnic mat, some sandwiches, and cold drinks.",
        ko: "먼저 돗자리와 샌드위치, 시원한 음료를 챙깁니다.",
      },
      {
        en: "When I arrive at the park, I find a nice shady spot under a big tree.",
        ko: "공원에 도착하면 큰 나무 아래 시원한 그늘 자리를 찾아요.",
      },
      {
        en: "Then, I spread out the mat, eat food, and chat with my friends.",
        ko: "그런 다음 돗자리를 펴고 음식을 먹으며 친구들과 이야기를 나눕니다.",
      },
      {
        en: "After eating, I lie down on the mat, read a book, and relax.",
        ko: "식사 후에는 돗자리에 누워 책을 읽으며 편안하게 휴식을 취해요.",
      },
      {
        en: "Having a simple picnic outdoors always relieves all my stress.",
        ko: "야외에서 소박한 피크닉을 즐기면 언제나 모든 스트레스가 풀립니다.",
      },
    ],
    keywords: [
      "sunny weather",
      "picnic at the park",
      "shady spot under a tree",
      "chat with my friends",
      "relieves all my stress",
    ],
    tip: "[공원 피크닉 루틴] 봄/가을 피크닉 → 돗자리와 간식 준비 → 그늘 명당 찾기 → 식사 및 하늘 보기 힐링.",
  },
  {
    id: "q_park_04",
    cat: "공원가기",
    type: "계절/변화",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 변화·비교 심화",
    pattern_id: "pat_05",
    q_en: "How does the park change throughout the four seasons? How do people's activities change depending on the season?",
    q_ko: "공원은 사계절에 따라 어떻게 변하나요? 계절에 따라 사람들의 활동은 어떻게 달라지나요?",
    sentences: [
      {
        en: "The park near my house looks very different in each season.",
        ko: "우리 집 근처 공원은 계절마다 모습이 아주 달라요.",
      },
      {
        en: "In spring, the park has pretty cherry blossoms and green leaves.",
        ko: "봄에는 공원에 예쁜 벚꽃과 푸른 잎들이 가득합니다.",
      },
      {
        en: "Many people come out, take pictures, and feel the warm sunshine.",
        ko: "많은 사람들이 나와서 사진을 찍고 따뜻한 햇살을 즐겨요.",
      },
      {
        en: "In winter, the park is very quiet and covered with white snow.",
        ko: "겨울에는 공원이 아주 조용하고 하얀 눈으로 덮입니다.",
      },
      {
        en: "Walking on the snow in a warm jacket feels very peaceful.",
        ko: "따뜻한 패딩을 입고 눈길을 걷는 것은 아주 평화로워요.",
      },
      {
        en: "Both seasons are very charming, and I love walking there alone.",
        ko: "두 계절 모두 아주 매력적이고, 저는 혼자 걷는 것을 정말 좋아해요.",
      },
    ],
    keywords: [
      "park looks different in each season",
      "spring cherry blossoms",
      "take pictures in warm sunshine",
      "winter quiet with white snow",
      "walking in warm jacket",
      "both seasons charming",
    ],
    tip: "[초간단 공원 사계절] 봄 벚꽃 풍경 & 피크닉/사진 ➔ 겨울 조용한 설경 & 따뜻한 패딩 산책 ➔ 사계절 산책의 매력.",
  },
  {
    id: "q_movie_01",
    cat: "영화보기",
    type: "장소/선호",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you like watching movies. What types of movies do you enjoy watching, and why do you like them? Who are your favorite actors?",
    q_ko: "설문에서 영화 보기를 좋아한다고 하셨습니다. 어떤 장르의 영화를 좋아하시고 왜 그 영화들을 좋아하시나요? 좋아하는 배우는 누구인가요?",
    sentences: [
      {
        en: "Whenever I watch movies, my favorite genres are heartwarming comedies and touching dramas.",
        ko: "영화를 볼 때마다, 제가 가장 좋아하는 장르는 유쾌한 코미디와 감동적인 드라마예요.",
      },
      {
        en: "Comedies are great because they make me laugh and feel very happy.",
        ko: "코미디는 저를 웃게 해주고 기분을 아주 행복하게 해줘서 좋아요.",
      },
      {
        en: "Touching dramas are also wonderful because the warm stories make me think deeply.",
        ko: "감동 드라마도 따뜻한 이야기로 깊은 생각을 하게 해줘서 멋집니다.",
      },
      {
        en: "On the other hand, I don't really like scary horror movies or loud action films.",
        ko: "반면에 저는 무서운 공포 영화나 시끄러운 액션 영화는 별로 안 좋아해요.",
      },
      {
        en: "Watching touching stories at home makes me relaxed.",
        ko: "집에서 감동적인 이야기를 보면 마음이 편안해져요.",
      },
      {
        en: "So, watching good movies is my favorite hobby.",
        ko: "그래서 좋은 영화를 보는 것은 제가 가장 좋아하는 취미입니다.",
      },
    ],
    keywords: [
      "comedies and touching dramas",
      "make me laugh and happy",
      "warm stories make me think",
      "dislike scary horror movies",
      "makes me relaxed",
      "favorite hobby",
    ],
    tip: "[초간단 영화 선호] 코미디(웃음/행복) & 감동 드라마(따뜻한 생각) 선호 ➔ 공포/액션 불호 ➔ 집에서 힐링 ➔ 최애 취미.",
  },
  {
    id: "q_movie_03",
    cat: "영화보기",
    type: "일상 루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "When you watch movies at home, what do you normally do before, during, and after watching a movie? Describe your routine in detail.",
    q_ko: "집에서 영화를 볼 때 영화를 보기 전, 보는 중, 보고 난 후에 보통 무엇을 하시는지 루틴을 자세히 말씀해 주세요.",
    sentences: [
      {
        en: "Usually, on weekend nights, I love to watch movies on TV at home.",
        ko: "보통 주말 밤에 저는 집에서 TV로 영화 보는 것을 정말 좋아해요.",
      },
      {
        en: "First, I turn on my big TV and choose a movie on Netflix.",
        ko: "먼저 큰 TV를 켜고 넷플릭스에서 영화를 골라요.",
      },
      {
        en: "Then, I prepare some popcorn and a cold drink in the kitchen.",
        ko: "그 다음 주방에서 팝콘과 시원한 음료를 준비합니다.",
      },
      {
        en: "I sit on my cozy sofa and focus on the story.",
        ko: "아늑한 소파에 앉아서 줄거리에 푹 빠져서 봅니다.",
      },
      {
        en: "Watching movies alone in my quiet room makes me feel very peaceful.",
        ko: "조용한 방에서 혼자 영화를 보면 마음이 아주 평화로워져요.",
      },
      {
        en: "It makes me relaxed, so I do it often.",
        ko: "마음이 편안해져서 저는 자주 이렇게 영화를 봅니다.",
      },
    ],
    keywords: [
      "watch movies on TV at home",
      "choose movie on Netflix",
      "popcorn and cold drink",
      "cozy sofa and focus",
      "quiet room very peaceful",
      "makes me relaxed",
    ],
    tip: "[초간단 영화 루틴] 주말 밤 집 영화 → 넷플릭스 선택 → 팝콘 & 시원한 음료 → 소파 몰입 감상 → 혼자만의 평화로운 힐링.",
  },
  {
    id: "q_movie_02",
    cat: "영화보기",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_03",
    q_en: "Tell me about the most memorable movie you have seen recently. What was the storyline and why was it so memorable to you?",
    q_ko: "최근에 본 가장 기억에 남는 영화에 대해 말씀해 주세요. 줄거리는 무엇이었고 왜 기억에 남았나요?",
    sentences: [
      {
        en: "I remember a movie called The Truman Show that I watched at home.",
        ko: "집에서 보았던 '트루먼 쇼'라는 영화가 기억나요.",
      },
      {
        en: "The story is about a man named Truman.",
        ko: "줄거리는 트루먼이라는 한 남자에 대한 이야기예요.",
      },
      {
        en: "People watch his whole life on TV, but he doesn't know it.",
        ko: "사람들은 그의 일생 전체를 TV로 보는데, 그는 그것을 몰라요.",
      },
      {
        en: "When he finds out the truth, he tries hard to escape to the real world.",
        ko: "진실을 알았을 때, 그는 진짜 세상으로 탈출하려고 열심히 노력해요.",
      },
      {
        en: "The ending scene where he says goodbye made me cry and feel touched.",
        ko: "그가 작별 인사를 건네는 마지막 장면은 눈물이 나고 큰 감동을 주었습니다.",
      },
      {
        en: "It was a wonderful movie, and I will never forget it.",
        ko: "정말 멋진 영화였고, 영원히 잊지 못할 거예요.",
      },
    ],
    keywords: [
      "The Truman Show at home",
      "story about Truman",
      "watch whole life on TV",
      "tries hard to escape",
      "ending scene goodbye made me cry",
      "never forget it",
    ],
    tip: "[초간단 영화 경험] 집에서 '트루먼 쇼' 감상 → TV 생중계 비밀 줄거리 → 진짜 세상 탈출 노력 → 마지막 작별 인사 감동 → 잊지 못할 명작.",
  },
  {
    id: "q_movie_05",
    cat: "영화보기",
    type: "영화관 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "Please describe the movie theater you usually go to. Where is it located, what does it look like, and what kind of seats do you prefer?",
    q_ko: "주로 가시는 영화관에 대해 설명해 주세요. 어디에 위치해 있고 어떻게 생겼으며 어떤 좌석을 선호하시나요?",
    sentences: [
      {
        en: "I usually go to a CGV multiplex located inside a large shopping mall near my home.",
        ko: "저는 주로 집 근처 대형 쇼핑몰 안에 있는 CGV 멀티플렉스에 갑니다.",
      },
      {
        en: "The theater is very modern, spacious, and extremely clean.",
        ko: "그 영화관은 매우 현대적이고 넓으며 아주 청결합니다.",
      },
      {
        en: "It has comfortable reclining leather seats with plenty of legroom.",
        ko: "다리 공간이 넓고 편안한 리클라이너 가죽 좌석이 구비되어 있어요.",
      },
      {
        en: "When booking tickets, I always choose seats in the exact middle rows, like row G or H.",
        ko: "티켓을 예매할 때 저는 항상 G열이나 H열 같은 정중앙 좌석을 선택합니다.",
      },
      {
        en: "The screen and sound system there are top-notch, making movies super immersive.",
        ko: "그곳의 스크린과 음향 시스템은 최고 수준이라 영화 몰입감이 뛰어납니다.",
      },
      {
        en: "It is hands down the best cinema in my neighborhood.",
        ko: "그곳은 의심할 여지 없이 우리 동네 최고의 영화관입니다.",
      },
    ],
    keywords: [
      "CGV multiplex",
      "shopping mall",
      "comfortable leather seats",
      "exact middle rows",
      "top-notch sound",
    ],
    tip: "[영화관 및 좌석 묘사] 쇼핑몰 내 멀티플렉스 → 시설 및 리클라이너 좌석 → 정중앙 G/H열 선호 → 뛰어난 음향.",
  },
  {
    id: "q_movie_06",
    cat: "영화보기",
    type: "관람 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you usually do when you watch a movie at a cinema? Describe your routine from buying tickets and snacks to leaving the theater.",
    q_ko: "극장에서 영화를 볼 때 도착해서 티켓과 스낵을 사고 영화를 보고 나올 때까지의 루틴을 말씀해 주세요.",
    sentences: [
      {
        en: "When I go to the cinema, I follow a simple and fun routine.",
        ko: "영화관에 갈 때 저는 항상 단순하고 즐거운 루틴을 따릅니다.",
      },
      {
        en: "First, I book my movie ticket in advance using an app.",
        ko: "먼저 스마트폰 앱을 사용해 미리 영화 티켓을 예매해 둡니다.",
      },
      {
        en: "I arrive at the theater about twenty minutes early.",
        ko: "영화 시작 약 20분 전에 극장에 도착해요.",
      },
      {
        en: "Then, I buy a sweet popcorn and a cold soda at the kiosk.",
        ko: "그런 다음 키오스크에서 달콤한 팝콘과 시원한 탄산음료를 삽니다.",
      },
      {
        en: "While watching the film, I snack on popcorn and enjoy the story.",
        ko: "영화를 보는 동안에는 팝콘을 먹으며 스토리를 즐겨요.",
      },
      {
        en: "After the movie ends, I talk about favorite scenes with my friend.",
        ko: "영화가 끝난 후에는 친구와 함께 가장 좋았던 장면에 대해 이야기를 나눕니다.",
      },
    ],
    keywords: [
      "book in advance",
      "twenty minutes early",
      "sweet popcorn and soda",
      "enjoy the story",
      "talk with my friend",
    ],
    tip: "[극장 관람 루틴] 앱 사전 예매 → 20분 전 도착 → 팝콘과 제로음료 구매 → 영화 집중 → 크레딧 후 퇴장.",
  },
  {
    id: "q_movie_04",
    cat: "영화보기",
    type: "변화/비교",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 변화·비교 심화",
    pattern_id: "pat_05",
    q_en: "How have movie theaters or movie-watching habits changed compared to when you were a child? Describe the changes in detail.",
    q_ko: "어릴 적과 비교하여 영화관이나 영화 관람 습관이 어떻게 변화했나요? 변화에 대해 자세히 설명해 주세요.",
    sentences: [
      {
        en: "In the past, watching movies was very different from now.",
        ko: "과거에는 영화 보는 것이 지금과 많이 달랐어요.",
      },
      {
        en: "In the past, we had to go to the theater or rent DVDs.",
        ko: "과거에는 극장에 가거나 DVD를 빌려봐야만 했어요.",
      },
      {
        en: "However, now, watching movies is very convenient and easy.",
        ko: "하지만 지금은 영화 보기가 아주 편리하고 쉬워요.",
      },
      {
        en: "For example, we can watch any movie at home on Netflix anytime.",
        ko: "예를 들어 집에서 언제든 넷플릭스로 어떤 영화든 볼 수 있어요.",
      },
      {
        en: "Also, movie theaters now have soft recliner seats and big screens.",
        ko: "또한 영화관도 이제 편안한 리클라이너 좌석과 큰 스크린이 있어요.",
      },
      {
        en: "So, I really like these nice changes.",
        ko: "그래서 저는 이런 좋은 변화들이 정말 마음에 들어요.",
      },
    ],
    keywords: [
      "very different from now",
      "had to rent DVDs",
      "convenient and easy",
      "watch on Netflix anytime",
      "recliner seats and big screens",
      "really like these changes",
    ],
    tip: "[초간단 영화 변화 비교] 과거 극장/DVD 대여 ➔ 현재 넷플릭스 스트리밍 편의성 ➔ 극장의 고급 리클라이너 좌석 ➔ 대만족.",
  },
  {
    id: "q_music_01",
    cat: "음악감상",
    type: "장르/선호",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you like listening to music. What kind of music do you like, and who is your favorite singer or musician? Why do you like them?",
    q_ko: "설문에서 음악 감상을 좋아한다고 하셨습니다. 어떤 음악을 좋아하시고 가장 좋아하는 가수는 누구인가요? 왜 좋아하시나요?",
    sentences: [
      {
        en: "Whenever I listen to music, my favorite genre is K-pop.",
        ko: "음악을 들을 때마다, 제가 가장 좋아하는 장르는 K-pop이에요.",
      },
      {
        en: "My favorite singer is BTS, so I love their music.",
        ko: "제가 가장 좋아하는 가수는 BTS라서, 그들의 음악을 정말 좋아해요.",
      },
      {
        en: "How can I say... it is very exciting, dynamic, and energetic.",
        ko: "뭐라고 말해야 할까... 그 음악은 아주 신나고, 역동적이고, 에너지가 넘쳐요.",
      },
      {
        en: "There are sweet voices and trendy sounds, so it makes me feel so happy and excited.",
        ko: "감미로운 목소리와 세련된 사운드가 있어서, 저를 너무 행복하고 신나게 만들어줘요.",
      },
      {
        en: "When I listen to music, I usually close my eyes, and just relax.",
        ko: "음악을 들을 때, 저는 보통 눈을 감고 그냥 편하게 쉬어요.",
      },
      {
        en: "So, I listen to music almost every day.",
        ko: "그래서 저는 음악을 거의 매일 들어요.",
      },
    ],
    keywords: [
      "favorite genre K-pop",
      "favorite singer BTS",
      "exciting, dynamic, and energetic",
      "sweet voices and trendy sounds",
      "close my eyes and just relax",
      "listen almost every day",
    ],
    tip: "[초간단 음악 선호] K-pop 장르 → BTS 음악 애청 → 신나고 역동적이며 에너지 넘침 → 감미로운 보컬 & 트렌디 사운드 → 눈 감고 힐링 → 거의 매일 감상.",
  },
  {
    id: "q_music_02",
    cat: "음악감상",
    type: "일상 루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "When and where do you usually listen to music? What do you do while listening to music?",
    q_ko: "언제 어디서 주로 음악을 들으시나요? 음악을 들으면서 무엇을 하시나요?",
    sentences: [
      {
        en: "Usually, I listen to music every day on my smartphone.",
        ko: "보통 저는 스마트폰으로 매일 음악을 들어요.",
      },
      {
        en: "First, when I get ready for work in the morning, I play upbeat pop songs.",
        ko: "먼저 아침에 출근 준비를 할 때 신나는 팝송을 틉니다.",
      },
      {
        en: "While riding the subway, I put on wireless earphones and listen to calm music.",
        ko: "지하철을 타고 갈 때는 무선 이어폰을 꽂고 차분한 음악을 들어요.",
      },
      {
        en: "In the evening, I listen to acoustic ballads while resting on my sofa.",
        ko: "저녁에는 소파에서 쉬면서 어쿠스틱 발라드를 듣습니다.",
      },
      {
        en: "Soft melodies help me calm down and feel very peaceful.",
        ko: "부드러운 멜로디는 마음을 차분하게 해주고 아주 평화로운 기분이 들게 해줘요.",
      },
      {
        en: "Listening to music brings me great joy, so I do it every day.",
        ko: "음악을 들으면 큰 기쁨을 얻기 때문에 매일 음악을 듣습니다.",
      },
    ],
    keywords: [
      "listen to music every day",
      "upbeat pop songs in morning",
      "subway with earphones",
      "acoustic ballads on sofa",
      "calm down and peaceful",
      "brings great joy",
    ],
    tip: "[초간단 음악 루틴] 아침 출근 준비(신나는 팝) → 지하철 출퇴근길(차분한 음악) → 저녁 소파 휴식(어쿠스틱) → 마음 평화와 기쁨.",
  },
  {
    id: "q_music_03",
    cat: "음악감상",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_03",
    q_en: "Tell me about a time you heard live music, like at a concert or on the street. What was the atmosphere like, and why was it memorable?",
    q_ko: "콘서트나 거리 등에서 라이브 음악을 들었던 경험에 대해 말씀해 주세요. 분위기는 어땠고 왜 기억에 남나요?",
    sentences: [
      {
        en: "I remember a live concert I went to with my friend last year.",
        ko: "작년에 친구와 함께 갔던 라이브 콘서트가 기억나요.",
      },
      {
        en: "We went to an outdoor music festival on a nice autumn day.",
        ko: "화창한 가을날 야외 음악 축제에 갔어요.",
      },
      {
        en: "The weather was cool, and the stage lights looked very beautiful.",
        ko: "날씨도 시원했고 무대 조명도 아주 아름다웠습니다.",
      },
      {
        en: "When the singer sang my favorite ballad song, everyone sang along together.",
        ko: "가수가 제가 제일 좋아하는 발라드를 부를 때, 다 같이 떼창을 했어요.",
      },
      {
        en: "Hearing the live voice gave me goosebumps and made me very happy.",
        ko: "라이브 목소리를 들으니 소름이 돋고 정말 행복했습니다.",
      },
      {
        en: "It was a great day, and I was so happy.",
        ko: "정말 멋진 하루였고, 저는 너무 행복했어요.",
      },
    ],
    keywords: [
      "live concert with friend",
      "outdoor festival in autumn",
      "cool weather and stage lights",
      "everyone sang along together",
      "goosebumps and happy",
      "never forget it",
    ],
    tip: "[초간단 콘서트 경험] 친구와 가을 야외 콘서트 → 시원한 날씨와 멋진 무대 → 최애곡 떼창 → 감동과 소름 → 잊지 못할 추억.",
  },
  {
    id: "q_music_04",
    cat: "음악감상",
    type: "곡/가수 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "What is your all-time favorite song? Why do you like it so much, and how does it make you feel when you listen to it?",
    q_ko: "가장 즐겨 듣는 인생 노래가 있나요? 왜 그 노래를 좋아하고 들으면 어떤 기분이 드나요?",
    sentences: [
      {
        en: "My all-time favorite song is a calm acoustic ballad with an acoustic guitar.",
        ko: "제가 가장 좋아하는 인생 곡은 어쿠스틱 기타 선율이 돋보이는 잔잔한 발라드입니다.",
      },
      {
        en: "The melody is very gentle, and the lyrics are deeply touching.",
        ko: "멜로디가 매우 부드럽고 가사가 가슴 깊이 와닿아요.",
      },
      {
        en: "Whenever I listen to the singer's warm voice, all my daily worries fade away.",
        ko: "가수의 따뜻한 목소리를 들을 때마다 일상의 모든 걱정이 사라집니다.",
      },
      {
        en: "I especially love listening to this song late at night or on rainy days.",
        ko: "특히 늦은 밤이나 비가 오는 날 이 노래를 듣는 것을 아주 좋아해요.",
      },
      {
        en: "It brings peace to my mind and makes me feel emotionally refreshed.",
        ko: "그 노래는 제 마음에 평온을 가져다주고 정서적으로 재충전되는 기분을 줍니다.",
      },
      {
        en: "I never get tired of listening to this timeless track.",
        ko: "아무리 반복해서 들어도 결코 질리지 않는 명곡이에요.",
      },
    ],
    keywords: [
      "all-time favorite song",
      "acoustic guitar",
      "gentle melody",
      "warm voice",
      "peace to my mind",
    ],
    tip: "[최애 노래 묘사] 어쿠스틱 발라드 곡 소개 → 부드러운 멜로디와 따뜻한 보컬 → 비 오는 날/밤 청취 → 마음에 평화.",
  },
  {
    id: "q_music_05",
    cat: "음악감상",
    type: "청취 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "How do you listen to music when you commute or exercise? Tell me about your music routine on the go.",
    q_ko: "출퇴근길이나 운동할 때 주로 음악을 어떻게 들으시나요? 이동 중 음악 청취 루틴을 말씀해 주세요.",
    sentences: [
      {
        en: "I always listen to music when I commute or exercise.",
        ko: "저는 출퇴근을 하거나 운동을 할 때 항상 음악을 듣습니다.",
      },
      {
        en: "First, I put on my wireless earphones as soon as I leave home.",
        ko: "먼저 집을 나서자마자 무선 이어폰을 귀에 꽂습니다.",
      },
      {
        en: "Then, I open my streaming app and select an upbeat playlist.",
        ko: "그런 다음 스트리밍 앱을 켜고 신나는 플레이리스트를 골라요.",
      },
      {
        en: "While riding the subway, the music blocks out noisy sounds.",
        ko: "지하철을 탈 때 음악이 주변의 시끄러운 소음을 막아 줍니다.",
      },
      {
        en: "During workouts, fast songs keep my energy high and motivate me.",
        ko: "운동 중에는 빠른 노래들이 에너지를 높여주고 큰 힘을 줘요.",
      },
      {
        en: "Listening to music makes my daily travel time fly by so fast.",
        ko: "음악을 들으면 하루 이동 시간이 정말 순식간에 지나갑니다.",
      },
    ],
    keywords: [
      "commute or exercise",
      "wireless earphones",
      "upbeat playlist",
      "blocks out noisy sounds",
      "time fly by",
    ],
    tip: "[이동 중 청취 루틴] 무선 이어폰 착용 → 신나는 플레이리스트 선택 → 소음 차단 및 운동 동기부여.",
  },
  {
    id: "q_music_06",
    cat: "음악감상",
    type: "변화/비교",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 변화·비교 심화",
    pattern_id: "pat_05",
    q_en: "How have music-listening devices and habits changed compared to the past? Please compare CDs or MP3 players with today's streaming apps.",
    q_ko: "과거와 비교하여 음악을 듣는 기기나 습관이 어떻게 변화했나요? 과거 MP3나 CD와 오늘날 스트리밍 앱을 비교해 주세요.",
    sentences: [
      {
        en: "The way we listen to music has changed tremendously compared to the past.",
        ko: "과거와 비교하여 음악을 듣는 방식은 엄청나게 변화했습니다.",
      },
      {
        en: "In the past, people bought CDs or downloaded MP3 files onto portable players.",
        ko: "예전에는 CD를 직접 사거나 휴대용 MP3 플레이어에 파일을 다운로드해야 했어요.",
      },
      {
        en: "Storage space was very limited, so we had to delete old songs frequently.",
        ko: "저장 공간이 매우 제한적이어서 옛날 노래를 자주 지워야 했습니다.",
      },
      {
        en: "However, nowadays, we can stream millions of songs instantly on our smartphones.",
        ko: "하지만 요즘에는 스마트폰으로 수백만 곡을 즉시 스트리밍할 수 있습니다.",
      },
      {
        en: "Algorithms even recommend great new songs based on our personal taste.",
        ko: "알고리즘이 개인 취향에 맞춰 멋진 신곡을 알아서 추천해 주기까지 해요.",
      },
      {
        en: "It has become so much more convenient, affordable, and enjoyable than before.",
        ko: "과거보다 훨씬 더 편리해지고 저렴해졌으며 음악 감상이 즐거워졌습니다.",
      },
    ],
    keywords: [
      "changed tremendously",
      "bought CDs or MP3",
      "storage space limited",
      "stream millions of songs",
      "smart algorithms",
    ],
    tip: "[음악 청취 방식 비교] 과거(CD, MP3 다운로드, 용량 부족) vs 현재(스마트폰 무제한 스트리밍, 추천 알고리즘) 비교.",
  },
  {
    id: "q_exercise_02",
    cat: "운동하기",
    type: "장소 묘사",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you like working out. Please describe the gym or fitness center you go to. What does it look like, and what kind of equipment does it have?",
    q_ko: "설문에서 운동하기를 좋아한다고 하셨습니다. 다니시는 헬스장에 대해 설명해 주세요. 어떤 모습이고 어떤 운동 기구들이 있나요?",
    sentences: [
      {
        en: "Whenever I think of working out, the fitness center is my favorite place.",
        ko: "운동을 생각할 때마다, 피트니스 센터가 제 최애 장소예요.",
      },
      {
        en: "It is located near my house, so it takes about five minutes on foot.",
        ko: "저희 집 근처에 있어서, 걸어서 약 5분 정도 걸려요.",
      },
      {
        en: "Also, the vibe is very clean, modern, and convenient.",
        ko: "또한, 분위기가 아주 깨끗하고, 현대적이고, 편리해요.",
      },
      {
        en: "There are many machines and free weights, so it makes me feel so happy and healthy.",
        ko: "많은 기구들과 프리웨이트가 있어서, 저를 너무 행복하고 건강하게 만들어줘요.",
      },
      {
        en: "When I go there, I usually ride a bike, and just relax.",
        ko: "거기 가면, 저는 보통 자전거를 타고 그냥 편하게 쉬어요.",
      },
      {
        en: "So, I go there almost every day.",
        ko: "그래서 저는 거기를 거의 매일 가요.",
      },
    ],
    keywords: [
      "fitness center near my house",
      "five minutes on foot",
      "clean, modern, and convenient",
      "many machines and free weights",
      "ride a bike and just relax",
      "go there almost every day",
    ],
    tip: "[만능 헬스장 묘사] 집 근처 피트니스 센터 → 도보 5분 → 깨끗하고 현대적이며 편리함 → 머신과 프리웨이트 → 실내 자전거 타며 힐링 → 거의 매일 방문.",
  },
  {
    id: "q_exercise_01",
    cat: "운동하기",
    type: "일상 루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "Please describe your typical workout routine. What exercises do you do from the moment you start until you finish?",
    q_ko: "일반적인 운동 루틴에 대해 말씀해 주세요. 운동을 시작할 때부터 끝마칠 때까지 어떤 운동들을 순서대로 하시나요?",
    sentences: [
      {
        en: "Usually, after work, I love working out at the gym near my house.",
        ko: "보통 퇴근 후에 저는 집 근처 헬스장에서 운동하는 것을 정말 좋아해요.",
      },
      {
        en: "First, I wear workout clothes, take my water bottle, and go to the gym.",
        ko: "먼저 운동복을 입고 물병을 챙겨서 헬스장으로 갑니다.",
      },
      {
        en: "When I arrive, I run on the treadmill for ten minutes to warm up.",
        ko: "도착하면 워밍업으로 러닝머신을 10분 동안 뛰어요.",
      },
      {
        en: "Then, I do simple weight training like chest presses and squats.",
        ko: "그 다음 체스트 프레스나 스쿼트 같은 간단한 웨이트 트레이닝을 합니다.",
      },
      {
        en: "After stretching, I take a warm shower and feel very refreshed.",
        ko: "스트레칭을 마친 후 따뜻한 샤워를 하고 나면 아주 개운해요.",
      },
      {
        en: "It makes me relaxed, so I work out often.",
        ko: "마음이 편안해져서 저는 운동을 자주 합니다.",
      },
    ],
    keywords: [
      "gym near my house",
      "workout clothes and water bottle",
      "treadmill for ten minutes",
      "chest presses and squats",
      "warm shower feels refreshed",
      "makes me relaxed",
    ],
    tip: "[초간단 헬스 루틴] 집 근처 헬스장 도착 → 러닝머신 10분 웜업 → 웨이트(체스트 프레스, 스쿼트) → 스트레칭 & 샤워 → 스트레스 해소.",
  },
  {
    id: "q_exercise_03",
    cat: "운동하기",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_04",
    q_en: "Have you ever experienced an injury or an unexpected problem while exercising? What happened and how did you handle it?",
    q_ko: "운동 중 부상을 입거나 예상치 못한 문제를 겪은 적이 있나요? 무슨 일이 있었고 어떻게 대처하셨나요?",
    sentences: [
      {
        en: "I remember a problem when I was exercising at the gym last year.",
        ko: "작년에 헬스장에서 운동하다가 겪었던 문제가 하나 기억나요.",
      },
      {
        en: "Suddenly, my lower back felt tight and painful while lifting weights.",
        ko: "웨이트 트레이닝을 하던 중 갑자기 허리가 뻐근하고 아팠어요.",
      },
      {
        en: "I was very surprised and worried at first.",
        ko: "처음에는 너무 놀라고 걱정이 되었습니다.",
      },
      {
        en: "However, I stopped right away, sat down, and put ice on my back.",
        ko: "하지만 즉시 멈추고 자리에 앉아 허리에 얼음찜질을 했어요.",
      },
      {
        en: "Fortunately, after resting for two days, my back felt completely fine.",
        ko: "다행히 이틀 동안 푹 쉬고 나니 허리가 완전히 괜찮아졌어요.",
      },
      {
        en: "It was a lesson to always warm up carefully before working out.",
        ko: "운동 전에는 항상 준비운동을 꼼꼼히 해야 한다는 교훈을 얻었습니다.",
      },
    ],
    keywords: [
      "problem while exercising",
      "lower back felt painful",
      "surprised and worried",
      "stopped and put ice",
      "resting for two days fine",
      "warm up carefully lesson",
    ],
    tip: "[초간단 운동 부상 경험] 웨이트 중 허리 통증 발생 → 당황과 걱정 → 즉시 중단 및 얼음찜질 대처 → 이틀 휴식 후 완쾌 → 준비운동의 교훈.",
  },
  {
    id: "q_exercise_04",
    cat: "운동하기",
    type: "장비/복장 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "What do you usually wear and bring when you work out? Please describe your workout gear and athletic clothes in detail.",
    q_ko: "운동할 때 주로 어떤 옷을 입고 어떤 장비를 챙기시나요? 운동 복장과 장비에 대해 자세히 설명해 주세요.",
    sentences: [
      {
        en: "When I go to work out, I always prioritize comfort and safety.",
        ko: "운동하러 갈 때 저는 항상 편안함과 안전을 최우선으로 생각합니다.",
      },
      {
        en: "I wear a breathable black athletic T-shirt and stretchy training shorts.",
        ko: "통기성이 좋은 검은색 기능성 티셔츠와 신축성 있는 트레이닝 반바지를 입어요.",
      },
      {
        en: "I also wear a pair of lightweight running shoes with good cushioning.",
        ko: "또한 쿠션감이 뛰어난 가벼운 러닝화도 착용합니다.",
      },
      {
        en: "In my gym bag, I always pack a stainless steel water bottle and a small sweat towel.",
        ko: "운동 가방에는 항상 스테인리스 물병과 작은 땀 닦는 수건을 챙겨요.",
      },
      {
        en: "Having the right gear helps me stay cool and prevents unnecessary injuries.",
        ko: "알맞은 장비를 갖추면 몸을 시원하게 유지하고 부상을 방지하는 데 큰 도움이 됩니다.",
      },
      {
        en: "Proper workout clothes always get me in the right mood to exercise.",
        ko: "적절한 운동복은 운동에 전념할 수 있는 올바른 마음가짐을 갖게 해줘요.",
      },
    ],
    keywords: [
      "comfort and safety",
      "breathable athletic T-shirt",
      "running shoes",
      "water bottle and towel",
      "prevents injuries",
    ],
    tip: "[운동 복장/장비 묘사] 기능성 티셔츠와 반바지 → 쿠션 러닝화 → 물병과 땀수건 지참 → 안전과 부상 방지.",
  },
  {
    id: "q_exercise_05",
    cat: "운동하기",
    type: "운동 전후 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you do before starting and after finishing your workout? Tell me about your warm-up and post-workout routine.",
    q_ko: "운동을 시작하기 전과 마친 후 보통 무엇을 하시나요? 준비 운동과 마무리 회복 루틴에 대해 말씀해 주세요.",
    sentences: [
      {
        en: "Having a proper warm-up and cool-down routine is essential for my workouts.",
        ko: "제 운동에서 올바른 웜업과 쿨다운 루틴을 지키는 것은 매우 필수적입니다.",
      },
      {
        en: "First, I spend about ten minutes stretching my joints and walking on the treadmill.",
        ko: "먼저 관절을 스트레칭하고 러닝머신을 10분 정도 걸으며 몸을 풀어요.",
      },
      {
        en: "This warms up my muscles and prevents sudden muscle cramps.",
        ko: "이 과정은 근육의 온도를 높여주고 갑작스러운 근육 경련을 예방해 줍니다.",
      },
      {
        en: "After finishing my main weight training, I do some light cool-down stretches.",
        ko: "본 운동인 웨이트 트레이닝을 마친 후에는 가벼운 마무리 스트레칭을 합니다.",
      },
      {
        en: "Then, I take a warm refreshing shower in the locker room and drink a protein shake.",
        ko: "그 후에는 탈의실에서 따뜻하고 개운한 샤워를 하고 프로틴 셰이크를 마셔요.",
      },
      {
        en: "This structured routine helps my body recover much faster every day.",
        ko: "이러한 체계적인 루틴 덕분에 매일 몸이 훨씬 빠르게 회복됩니다.",
      },
    ],
    keywords: [
      "warm-up and cool-down",
      "ten minutes stretching",
      "prevents muscle cramps",
      "warm refreshing shower",
      "protein shake",
    ],
    tip: "[운동 전후 루틴] 10분 관절 스트레칭 및 러닝머신 → 본 운동 → 쿨다운 → 온수 샤워 및 프로틴 섭취.",
  },
  {
    id: "q_exercise_06",
    cat: "운동하기",
    type: "변화/비교",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 변화·비교 심화",
    pattern_id: "pat_05",
    q_en: "What made you start working out in the first place? How has your physical fitness or health changed compared to the past?",
    q_ko: "운동을 처음 시작하게 된 계기는 무엇이었나요? 운동 후 과거와 비교해 체력이나 건강이 어떻게 달라졌나요?",
    sentences: [
      {
        en: "I first started working out two years ago because of severe back and neck pain.",
        ko: "저는 심한 허리와 목 통증 때문에 2년 전 처음 운동을 시작했습니다.",
      },
      {
        en: "In the past, I sat at an office desk all day and got tired very easily.",
        ko: "예전에는 하루 종일 사무실 책상에 앉아 있어서 매우 쉽게 피로해지곤 했어요.",
      },
      {
        en: "However, since I started exercising regularly, my posture has improved dramatically.",
        ko: "하지만 규칙적으로 운동을 시작한 이후 자세가 눈에 띄게 좋아졌습니다.",
      },
      {
        en: "I have built lean muscle and gained a lot more physical stamina.",
        ko: "탄탄한 근육이 붙었고 체력도 훨씬 더 좋아졌어요.",
      },
      {
        en: "Now, I rarely feel fatigued even after working long hours.",
        ko: "이제는 장시간 근무를 해도 거의 피로를 느끼지 않습니다.",
      },
      {
        en: "Starting to work out was definitely one of the best decisions I have ever made.",
        ko: "운동을 시작한 것은 제가 살면서 내린 최고의 결정 중 하나임에 틀림없습니다.",
      },
    ],
    keywords: [
      "severe back pain",
      "sat at desk all day",
      "posture improved",
      "built lean muscle",
      "rarely feel fatigued",
    ],
    tip: "[운동 계기 및 변화] 허리 통증으로 시작 → 과거(쉬운 피로) vs 현재(자세 교정, 근력 증가, 체력 증진) 대비.",
  },
  {
    id: "q_cook_04",
    cat: "요리하기",
    type: "주방/요리 묘사",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you like cooking. Please describe your kitchen at home. What does it look like, and what is your favorite dish that you cook with confidence?",
    q_ko: "설문에서 요리하기를 좋아한다고 하셨습니다. 집의 주방에 대해 설명해 주세요. 어떻게 생겼고 가장 자신 있게 만드는 대표 요리는 무엇인가요?",
    sentences: [
      {
        en: "Well, let me see... You know, Eva, my favorite place is my kitchen.",
        ko: "음, 어디 보자... 있잖아 에바, 내가 제일 좋아하는 곳은 내 주방이에요.",
      },
      {
        en: "It is big, and it has all the cooking tools.",
        ko: "주방이 크고, 모든 요리 도구들이 다 갖춰져 있어요.",
      },
      {
        en: "How can I say... it is very clean, modern, and convenient.",
        ko: "뭐라고 말해야 할까... 거기는 아주 깨끗하고, 현대적이고, 편리해요.",
      },
      {
        en: "There are a refrigerator and a gas range, so it makes me feel so happy and relaxed.",
        ko: "냉장고와 가스레인지가 있어서, 저를 너무 행복하고 편안하게 만들어줘요.",
      },
      {
        en: "When I go there, I usually cook curry and Bulgogi, and just relax.",
        ko: "주방에 가면, 저는 보통 카레와 불고기를 요리하고 그냥 편하게 쉬어요.",
      },
      {
        en: "So, I go there about two or three times a week.",
        ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
      },
    ],
    keywords: [
      "favorite place my kitchen",
      "all the cooking tools",
      "clean, modern, and convenient",
      "refrigerator and gas range",
      "cook curry and Bulgogi",
      "cook two or three times a week",
    ],
    tip: "[주방 및 자신 있는 요리 묘사] 내 주방 소개 → 널찍한 공간 & 도구 완비 → 깨끗하고 현대적임 → 냉장고 & 가스레인지 → 카레와 불고기 요리 → 주 2~3회 조리 힐링.",
  },
  {
    id: "q_cook_01",
    cat: "요리하기",
    type: "일상 루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "Please describe what you usually cook and your cooking routine step by step from prepping ingredients to cleaning up.",
    q_ko: "평소 무엇을 요리하시는지 식재료 준비부터 뒷정리까지 요리 과정을 단계별로 설명해 주세요.",
    sentences: [
      {
        en: "Usually, on weekends, I love to cook simple food at home.",
        ko: "보통 주말에 저는 집에서 간단한 요리를 하는 것을 정말 좋아해요.",
      },
      {
        en: "First, I go to the supermarket and buy fresh eggs, vegetables, and meat.",
        ko: "먼저 마트에 가서 신선한 계란, 야채, 고기를 사옵니다.",
      },
      {
        en: "When I get home, I wash the ingredients and chop them on a cutting board.",
        ko: "집에 오면 재료를 씻어서 도마 위에 썰어요.",
      },
      {
        en: "My favorite food to make is simple tomato pasta or kimchi fried rice.",
        ko: "제가 제일 만들기 좋아하는 음식은 간단한 토마토 파스타나 김치볶음밥이에요.",
      },
      {
        en: "While eating my warm food, I watch YouTube videos in my living room.",
        ko: "따뜻한 음식을 먹으면서 거실에서 유튜브 영상을 봅니다.",
      },
      {
        en: "Cooking for myself makes me relaxed, so I do it often.",
        ko: "나를 위해 요리하면 마음이 편안해져서 자주 요리를 해요.",
      },
    ],
    keywords: [
      "cook simple food at home",
      "buy eggs, vegetables, meat",
      "wash and chop ingredients",
      "tomato pasta or kimchi fried rice",
      "eating food watching YouTube",
      "makes me relaxed",
    ],
    tip: "[초간단 요리 루틴] 마트 장보기(계란/야채/고기) → 재료 손질 → 토마토 파스타 또는 김치볶음밥 조리 → 유튜브 보며 냠냠 → 스트레스 해소.",
  },
  {
    id: "q_cook_02",
    cat: "요리하기",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_03",
    q_en: "Tell me about a memorable meal you cooked for someone special. What dish did you make, and how did they react?",
    q_ko: "특별한 사람을 위해 요리했던 기억에 남는 식사에 대해 말씀해 주세요. 어떤 요리를 만들었고 상대방의 반응은 어땠나요?",
    sentences: [
      {
        en: "I remember a special day when I cooked dinner for my close friend.",
        ko: "친한 친구를 위해 저녁을 만들어 주었던 특별한 하루가 기억나요.",
      },
      {
        en: "Last year, my friend visited my new apartment on the weekend.",
        ko: "작년에, 주말에 친구가 제 새 아파트에 놀러 왔어요.",
      },
      {
        en: "I made beef steak, creamy pasta, and a fresh green salad for dinner.",
        ko: "저는 저녁으로 소고기 스테이크, 크림 파스타, 신선한 샐러드를 만들었어요.",
      },
      {
        en: "My friend tasted the steak and said it was very delicious.",
        ko: "친구가 스테이크를 맛보더니 정말 맛있다고 칭찬해 주었습니다.",
      },
      {
        en: "We ate the warm food, drank cold soda, and talked a lot.",
        ko: "우리는 따뜻한 음식을 먹고 시원한 탄산수를 마시며 많은 이야기를 나눴어요.",
      },
      {
        en: "It was a wonderful evening, and I will never forget it.",
        ko: "정말 멋진 저녁이었고, 영원히 잊지 못할 거예요.",
      },
    ],
    keywords: [
      "cooked dinner for close friend",
      "friend visited my apartment",
      "beef steak and creamy pasta",
      "friend said very delicious",
      "warm food and talked a lot",
      "never forget it",
    ],
    tip: "[초간단 요리 대접] 친구 집들이 방문 → 소고기 스테이크 & 크림 파스타 조리 → 친구의 폭풍 칭찬 → 즐거운 식사와 대화 → 뿌듯한 추억.",
  },
  {
    id: "q_cook_05",
    cat: "요리하기",
    type: "도구/식재료 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "What ingredients do you always keep in your refrigerator, or what kitchen appliance do you find most useful when cooking? Tell me in detail.",
    q_ko: "냉장고에 항상 구비해 두는 식재료나 요리할 때 가장 유용하게 쓰는 주방 가전은 무엇인가요? 자세히 말씀해 주세요.",
    sentences: [
      {
        en: "The most useful kitchen appliance in my home is definitely my air fryer.",
        ko: "저희 집에서 가장 유용한 주방 가전은 단연 에어프라이어입니다.",
      },
      {
        en: "It sits right on my kitchen counter and is super easy to clean.",
        ko: "주방 조리대 위에 바로 놓여 있고 세척하기도 정말 간편해요.",
      },
      {
        en: "In my refrigerator, I always make sure to keep eggs, onions, and garlic.",
        ko: "냉장고에는 계란과 양파, 그리고 다진 마늘을 항상 떨어지지 않게 채워둡니다.",
      },
      {
        en: "With an air fryer, I can cook crispy chicken or roast sweet potatoes in twenty minutes.",
        ko: "에어프라이어만 있으면 20분 만에 바삭한 치킨이나 군고구마를 뚝딱 만들 수 있어요.",
      },
      {
        en: "It saves so much cooking time and requires almost no cooking oil.",
        ko: "조리 시간을 크게 줄여주고 기름도 거의 필요하지 않습니다.",
      },
      {
        en: "I truly cannot imagine my daily cooking life without these essential items.",
        ko: "이 필수 아이템들 없이는 저의 일상 요리 생활을 상상조차 할 수 없어요.",
      },
    ],
    keywords: [
      "air fryer",
      "easy to clean",
      "eggs, onions, garlic",
      "crispy chicken",
      "saves cooking time",
    ],
    tip: "[식재료/주방가전 묘사] 에어프라이어 소개 → 필수 식재료(계란, 양파, 마늘) → 빠른 조리와 기름 절약 장점.",
  },
  {
    id: "q_cook_06",
    cat: "요리하기",
    type: "장보기 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "How do you go grocery shopping and prepare ingredients before cooking? Describe your routine from shopping to cooking.",
    q_ko: "요리하기 전 마트에 가서 장을 보고 식재료를 손질하는 일과에 대해 말씀해 주세요.",
    sentences: [
      {
        en: "I usually go grocery shopping at a supermarket near my home on weekends.",
        ko: "저는 보통 주말에 집 근처 마트에 가서 장을 봅니다.",
      },
      {
        en: "First, I check my refrigerator and write a short shopping list on my phone.",
        ko: "먼저 냉장고를 확인하고 스마트폰에 짧은 장보기 목록을 적어요.",
      },
      {
        en: "At the market, I pick out fresh vegetables and meat.",
        ko: "마트에 도착하면 신선한 채소와 고기를 고릅니다.",
      },
      {
        en: "When I get back home, I wash the vegetables under cold water.",
        ko: "집에 돌아오자마자 채소들을 찬물에 깨끗이 씻습니다.",
      },
      {
        en: "Then, I chop them into small pieces and store them in containers.",
        ko: "그런 다음 알맞게 썰어 용기에 나누어 보관해요.",
      },
      {
        en: "Prepping ingredients in advance makes cooking so much easier.",
        ko: "식재료를 미리 손질해 두면 요리하는 일이 훨씬 수월해집니다.",
      },
    ],
    keywords: [
      "grocery shopping",
      "shopping list on phone",
      "fresh vegetables and meat",
      "wash under cold water",
      "store in containers",
    ],
    tip: "[장보기 및 손질 루틴] 장보기 메모 작성 → 신선 식재료 구매 → 귀가 후 세척 및 소분 보관 → 간편 요리.",
  },
  {
    id: "q_cook_03",
    cat: "요리하기",
    type: "과거 경험",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 돌발 문제해결",
    pattern_id: "pat_04",
    q_en: "Have you ever experienced an unexpected problem or accident while cooking? What was the problem, and how did you resolve it?",
    q_ko: "요리 중에 예상치 못한 문제나 실수를 겪은 적이 있나요? 무슨 일이었고 어떻게 해결하셨나요?",
    sentences: [
      {
        en: "I remember a problem when I was cooking dinner in my kitchen.",
        ko: "주방에서 저녁 요리를 하던 중에 겪었던 문제가 하나 기억나요.",
      },
      {
        en: "Suddenly, there was a lot of smoke while I was cooking steak.",
        ko: "스테이크를 굽던 중 갑자기 연기가 많이 났어요.",
      },
      {
        en: "The smoke alarm rang, so I was very surprised and worried at first.",
        ko: "화재경보기가 울려서 처음에는 너무 놀라고 걱정이 되었습니다.",
      },
      {
        en: "However, I calmed down, turned off the stove, and opened all the windows.",
        ko: "하지만 마음을 가라앉히고, 가스레인지를 끄고 모든 창문을 활짝 열었어요.",
      },
      {
        en: "Fortunately, the smoke went away quickly, and the steak tasted great.",
        ko: "다행히 연기는 금방 빠져나갔고, 스테이크도 맛있었어요.",
      },
      {
        en: "It was surprising, but it became a funny and good memory.",
        ko: "놀라운 일이었지만, 재미있고 좋은 추억이 되었습니다.",
      },
    ],
    keywords: [
      "problem while cooking dinner",
      "smoke while cooking steak",
      "smoke alarm rang surprised",
      "turned off stove opened windows",
      "smoke went away steak tasted great",
      "funny and good memory",
    ],
    tip: "[초간단 요리 돌발상황] 스테이크 연기 발생 → 화재경보기 울림 당황 → 침착하게 불 끄고 창문 환기 대처 → 연기 배출 및 맛있는 식사 → 유쾌한 교훈.",
  },
  {
    id: "q_trip_02",
    cat: "국내여행",
    type: "장소 묘사",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you enjoy traveling in your country. Please describe your favorite travel destination or driving route.",
    q_ko: "설문에서 국내 여행을 좋아한다고 하셨습니다. 가장 좋아하시는 국내 여행지나 드라이브 코스에 대해 설명해 주세요.",
    sentences: [
      {
        en: "Whenever I think of relaxing, the quiet route is my favorite place.",
        ko: "휴식을 생각할 때마다, 한적한 드라이브 코스가 제 최애 장소예요.",
      },
      {
        en: "It is located near my house, so it is just five minutes.",
        ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
      },
      {
        en: "Also, the vibe is very relaxing and cozy.",
        ko: "또한, 분위기가 아주 편안하고 아늑해요.",
      },
      {
        en: "There are scenic views and quiet roads, so I really like it.",
        ko: "멋진 풍경과 한적한 도로가 있어서 정말 마음에 들어요.",
      },
      {
        en: "It is the best place for me.",
        ko: "저한테는 여기가 최고의 장소예요.",
      },
      {
        en: "So, I go there about two or three times a week.",
        ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
      },
    ],
    keywords: [
      "quiet route favorite place",
      "near my house just five minutes",
      "relaxing and cozy",
      "scenic views and quiet roads",
      "best place for me",
      "go there about two or three times a week",
    ],
    tip: "[만능 드라이브 묘사] 집 근처 한적한 길 → 접근성 편리함 → 편안하고 아늑한 분위기 → 멋진 풍경과 도로 → 퇴근 후 드라이브 힐링 → 편안함.",
  },
  {
    id: "q_trip_01",
    cat: "국내여행",
    type: "일상 루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you usually do before going on a trip? How do you prepare and pack your luggage?",
    q_ko: "여행을 떠나기 전 보통 무엇을 하시나요? 여행 계획을 세우고 짐을 싸는 루틴에 대해 말씀해 주세요.",
    sentences: [
      {
        en: "Usually, before going on a trip, I prepare everything step by step.",
        ko: "보통 여행을 가기 전에 차근차근 모든 것을 준비해요.",
      },
      {
        en: "First, I check the weather and make a simple packing list on my smartphone.",
        ko: "먼저 날씨를 확인하고 스마트폰에 간단한 짐 싸기 목록을 적어요.",
      },
      {
        en: "Then, I pack casual clothes, chargers, and toiletries into my backpack.",
        ko: "그 다음 편한 옷, 충전기, 세면도구를 배낭에 챙깁니다.",
      },
      {
        en: "Before leaving home, I make sure the windows are closed and gas is turned off.",
        ko: "집을 나서기 전 창문이 닫혔는지와 가스 밸브를 확인해요.",
      },
      {
        en: "Preparing carefully makes my trip safe and happy.",
        ko: "꼼꼼하게 준비하면 여행이 안전하고 편안해집니다.",
      },
      {
        en: "When everything is ready, I feel very excited to start my trip.",
        ko: "모든 준비가 끝나면 여행을 떠날 생각에 정말 설레요.",
      },
    ],
    keywords: [
      "prepare everything step by step",
      "check weather and packing list",
      "pack clothes and chargers",
      "check windows and gas",
      "safe and happy",
      "excited to start trip",
    ],
    tip: "[초간단 여행 준비] 날씨 확인 및 스마트폰 체크리스트 → 옷/충전기/세면도구 패킹 → 창문/가스 밸브 확인 → 안전하고 설레는 출발.",
  },
  {
    id: "q_trip_03",
    cat: "국내여행",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_03",
    q_en: "Tell me about a memorable domestic trip you took recently. Where did you go, who did you go with, and why was it so memorable?",
    q_ko: "최근에 다녀온 기억에 남는 국내 여행에 대해 말씀해 주세요. 어디로 누구와 가셨고 왜 그렇게 기억에 남나요?",
    sentences: [
      {
        en: "I remember a wonderful trip to Jeju Island last year.",
        ko: "작년에 다녀왔던 멋진 제주도 여행이 기억나요.",
      },
      {
        en: "I went there alone for three days to take a peaceful rest.",
        ko: "평화로운 휴식을 취하기 위해 2박 3일 동안 혼자 그곳에 갔어요.",
      },
      {
        en: "The ocean was very blue, and the fresh air made me feel great.",
        ko: "바다가 아주 파랬고, 상쾌한 공기 덕분에 기분이 정말 좋았어요.",
      },
      {
        en: "I drove along the coast road and ate fresh seafood at a local restaurant.",
        ko: "해안 도로를 따라 드라이브하고 현지 식당에서 신선한 해산물을 먹었습니다.",
      },
      {
        en: "I walked on the beach, looked at the sunset, and took many pictures.",
        ko: "해변을 걷고 노을을 바라보며 사진도 많이 찍었어요.",
      },
      {
        en: "It was a wonderful trip, and I will never forget it.",
        ko: "정말 멋진 여행이었고, 영원히 잊지 못할 거예요.",
      },
    ],
    keywords: [
      "trip to Jeju Island last year",
      "alone for three days",
      "blue ocean and fresh air",
      "drove coast road and seafood",
      "walked on beach and sunset",
      "never forget it",
    ],
    tip: "[초간단 제주도 여행] 나 홀로 2박 3일 제주 힐링 여행 → 푸른 바다와 상쾌한 공기 → 해안도로 드라이브 & 해산물 먹방 → 일몰 감상 및 사진 → 평생 추억.",
  },
  {
    id: "q_trip_04",
    cat: "국내여행",
    type: "숙소 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "Please describe a memorable hotel, resort, or accommodation you stayed at during a trip. What did it look like, and why did you like it?",
    q_ko: "여행을 갔을 때 묵었던 숙소 중 가장 기억에 남는 호텔이나 리조트에 대해 말씀해 주세요. 어떻게 생겼고 왜 좋았나요?",
    sentences: [
      {
        en: "During my last trip to Jeju Island, I stayed at a charming ocean-view resort.",
        ko: "지난번 제주도 여행 때 저는 바다가 한눈에 보이는 매력적인 오션뷰 리조트에 묵었습니다.",
      },
      {
        en: "The room had floor-to-ceiling glass windows overlooking the blue sea.",
        ko: "객실에는 푸른 바다가 내려다보이는 통유리창이 설치되어 있었어요.",
      },
      {
        en: "There was a comfortable king-size bed, a modern bathroom, and a private balcony.",
        ko: "편안한 킹사이즈 침대와 현대적인 욕실, 그리고 전용 발코니가 갖춰져 있었습니다.",
      },
      {
        en: "Every morning, I could watch the breathtaking sunrise right from my bed.",
        ko: "매일 아침 침대에 누운 채로 숨 막히게 아름다운 일출을 감상할 수 있었어요.",
      },
      {
        en: "The sound of gentle ocean waves was so peaceful and soothing.",
        ko: "잔잔한 파도 소리가 매우 평화롭고 마음을 편안하게 해 주었습니다.",
      },
      {
        en: "It was by far the most romantic and memorable accommodation I have ever stayed in.",
        ko: "그곳은 제가 지금까지 묵어본 숙소 중 단연 가장 로맨틱하고 기억에 남는 숙소였습니다.",
      },
    ],
    keywords: [
      "Jeju Island",
      "ocean-view resort",
      "floor-to-ceiling windows",
      "breathtaking sunrise",
      "peaceful and soothing",
    ],
    tip: "[여행 숙소 묘사] 제주도 오션뷰 리조트 → 통유리창과 바다 전망 → 발코니와 침대 → 침대 위 일출 감상과 파도 소리.",
  },
  {
    id: "q_trip_05",
    cat: "국내여행",
    type: "여행 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What is your typical daily schedule during a trip? Describe your routine from morning sightseeing to having dinner and relaxing.",
    q_ko: "여행을 가면 보통 하루를 어떻게 보내시나요? 아침 관광부터 저녁 식사와 휴식까지의 하루 루틴을 말씀해 주세요.",
    sentences: [
      {
        en: "When I travel to a new city, I like to follow a simple and relaxing routine.",
        ko: "새로운 도시로 여행을 가면 여유롭고 즐거운 하루 일과를 보냅니다.",
      },
      {
        en: "First, I wake up early, eat a good breakfast, and plan out my day.",
        ko: "먼저 일찍 일어나 맛있는 조식을 먹고 하루 일정을 점검합니다.",
      },
      {
        en: "Then, I visit famous tourist spots and take plenty of nice photos.",
        ko: "그런 다음 유명 관광 명소들을 방문하고 멋진 사진을 많이 찍어요.",
      },
      {
        en: "In the afternoon, I stop by a cozy cafe to drink coffee and rest.",
        ko: "오후에는 아늑한 카페에 들러 커피를 마시며 편히 쉬어줍니다.",
      },
      {
        en: "For dinner, I search for a good local restaurant and enjoy delicious food.",
        ko: "저녁 식사로는 맛있는 현지 맛집을 찾아 대표 음식을 즐깁니다.",
      },
      {
        en: "At night, I return to my hotel, look through my photos, and fall asleep.",
        ko: "밤에는 숙소로 돌아와 사진들을 둘러본 뒤 기분 좋게 잠자리에 듭니다.",
      },
    ],
    keywords: [
      "good breakfast",
      "famous tourist spots",
      "cozy cafe",
      "local restaurant",
      "look through photos",
    ],
    tip: "[여행 하루 루틴] 이른 기상 및 조식 → 명소 탐방 및 사진 촬영 → 카페 휴식 → 현지 맛집 저녁 → 숙소 사진 정리.",
  },
  {
    id: "q_trip_06",
    cat: "국내여행",
    type: "돌발 해결",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_04",
    q_en: "Have you ever faced an unexpected problem while traveling, such as bad weather or transportation issues? How did you resolve the situation?",
    q_ko: "여행 중 날씨 악화나 교통편 문제로 예상치 못한 어려움을 겪은 적이 있나요? 그 상황을 어떻게 해결하셨나요?",
    sentences: [
      {
        en: "On a trip two years ago, I faced an unexpected heavy rainstorm.",
        ko: "2년 전 여행을 갔을 때, 예상치 못한 폭우를 만났던 적이 있습니다.",
      },
      {
        en: "All outdoor activities were suddenly canceled because of the strong wind.",
        ko: "강풍 때문에 예정되어 있던 모든 야외 일정이 갑자기 취소되었어요.",
      },
      {
        en: "I was quite disappointed at first, but I quickly changed my plan.",
        ko: "처음에는 꽤 아쉬웠지만 빠르게 계획을 변경했습니다.",
      },
      {
        en: "Instead of staying outside, I searched for nice indoor places on my phone.",
        ko: "야외에 있는 대신 스마트폰으로 좋은 실내 명소들을 검색했어요.",
      },
      {
        en: "I found a cozy art museum and a seaside cafe with warm drinks.",
        ko: "아늑한 미술관과 따뜻한 음료를 파는 바닷가 카페를 발견했습니다.",
      },
      {
        en: "Spending the rainy day indoors turned out to be a really wonderful memory.",
        ko: "실내에서 비 내리는 날을 보낸 것은 뜻밖에도 정말 멋진 추억이 되었습니다.",
      },
    ],
    keywords: [
      "heavy rainstorm",
      "activities canceled",
      "changed my plan",
      "searched indoor places",
      "wonderful memory",
    ],
    tip: "[여행 돌발 해결] 동해안 폭우로 야외 일정 취소 → 당황 후 침착하게 실내 대안 검색 → 미술관 및 카페 힐링 전환.",
  },
  {
    id: "q_camp_02",
    cat: "캠핑하기",
    type: "장소 묘사",
    combo_set: 1,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "You indicated in the survey that you like going camping. Please describe your favorite campsite. Where is it located and what does it look like?",
    q_ko: "설문에서 캠핑 가기를 좋아한다고 하셨습니다. 가장 좋아하시는 캠핑장에 대해 설명해 주세요. 어디에 있고 어떻게 생겼나요?",
    sentences: [
      {
        en: "Whenever I think of outdoor trips, a campsite near the lake is my favorite place.",
        ko: "야외 나들이를 생각할 때마다, 호숫가 근처 캠핑장이 제 최애 장소예요.",
      },
      {
        en: "It is about one hour by car from my house, so it is easy to go.",
        ko: "저희 집에서 차로 1시간 정도 걸려서, 가기 편해요.",
      },
      {
        en: "And the vibe is very clean, quiet, and peaceful.",
        ko: "그리고 분위기가 아주 깔끔하고 조용하며 평화로워요.",
      },
      {
        en: "There are tall green trees and a clean lake, so I really like it.",
        ko: "키 큰 푸른 나무들과 깨끗한 호수가 있어서 정말 마음에 들어요.",
      },
      {
        en: "It is the best place for me.",
        ko: "저한테는 여기가 최고의 장소예요.",
      },
      {
        en: "So, I go there about two or three times a week.",
        ko: "그래서 저는 거기를 대략 일주일에 2~3번 정도 가요.",
      },
    ],
    keywords: [
      "campsite near the lake",
      "one hour by car",
      "clean, quiet, and peaceful",
      "tall green trees and clean lake",
      "best place for me",
      "go there about two or three times a week",
    ],
    tip: "[만능 캠핑장 묘사] 호숫가 캠핑장 → 차로 1시간 거리 → 조용하고 평화로운 자연 → 나무와 호수 → 자연 속 힐링 → 편안함.",
  },
  {
    id: "q_camp_01",
    cat: "캠핑하기",
    type: "일상 루틴",
    combo_set: 1,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you usually do when you go camping? Please describe your typical camping routine from the moment you arrive to when you pack up.",
    q_ko: "캠핑을 가면 보통 무엇을 하시나요? 도착했을 때부터 짐을 정리하고 떠날 때까지의 일반적인 캠핑 루틴을 설명해 주세요.",
    sentences: [
      {
        en: "Usually, when I go camping, I have a simple and relaxing routine.",
        ko: "보통 캠핑을 가면 간단하고 편안한 일과를 보냅니다.",
      },
      {
        en: "First, when I arrive at the campsite, I set up my tent and a folding chair.",
        ko: "먼저 캠핑장에 도착하면 텐트와 접이식 의자를 칩니다.",
      },
      {
        en: "Then, I sit down and drink warm coffee while looking at the mountain.",
        ko: "그 다음 산을 바라보며 자리에 앉아 따뜻한 커피를 마셔요.",
      },
      {
        en: "In the evening, I cook delicious meat on a portable stove and listen to music.",
        ko: "저녁에는 휴대용 버너로 맛있는 고기를 구워 먹고 음악을 들어요.",
      },
      {
        en: "Looking at the stars in the night sky makes me feel very peaceful.",
        ko: "밤하늘의 별을 바라보고 있으면 마음이 아주 평화로워집니다.",
      },
      {
        en: "Resting in nature makes me relaxed, so I go camping often.",
        ko: "자연 속에서 쉬면 마음이 편안해져서 자주 캠핑을 가요.",
      },
    ],
    keywords: [
      "simple camping routine",
      "set up tent and chair",
      "drink coffee looking at mountain",
      "cook meat and listen to music",
      "stars in night sky peaceful",
      "makes me relaxed",
    ],
    tip: "[초간단 캠핑 루틴] 텐트 & 의자 설치 → 산 보며 커피 한 잔 → 고기 구이 & 음악 → 밤하늘 별 보기 → 스트레스 해소.",
  },
  {
    id: "q_camp_03",
    cat: "캠핑하기",
    type: "과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "3단계: 과거 기억·경험",
    pattern_id: "pat_04",
    q_en: "Tell me about a memorable or unexpected incident that happened while you were camping. What happened, and how did you deal with it?",
    q_ko: "캠핑 중에 발생했던 기억에 남거나 예상치 못했던 사건에 대해 말씀해 주세요. 무슨 일이 있었고 어떻게 대처하셨나요?",
    sentences: [
      {
        en: "I remember a problem when I was camping near the lake last year.",
        ko: "작년에 호숫가에서 캠핑을 하던 중 겪었던 문제가 하나 기억나요.",
      },
      {
        en: "In the middle of the night, strong wind began shaking my tent.",
        ko: "한밤중에 강한 바람이 불어서 텐트가 흔들리기 시작했어요.",
      },
      {
        en: "The wind noise was loud, so I was very surprised and worried at first.",
        ko: "바람 소리가 너무 커서 처음에는 많이 놀라고 걱정되었어요.",
      },
      {
        en: "However, I took my flashlight, went outside, and fixed the tent ropes.",
        ko: "하지만 손전등을 챙겨 밖으로 나가 텐트 줄을 단단히 고정했어요.",
      },
      {
        en: "Fortunately, my tent became safe, and I slept well until morning.",
        ko: "다행히 텐트가 안전해졌고, 아침까지 잘 잤습니다.",
      },
      {
        en: "It was scary, but it taught me to always prepare carefully.",
        ko: "무서웠지만, 항상 꼼꼼하게 준비해야 한다는 교훈을 얻었어요.",
      },
    ],
    keywords: [
      "problem while camping",
      "strong wind shaking tent",
      "wind noise loud worried",
      "flashlight fixed tent ropes",
      "tent safe slept well",
      "prepare carefully lesson",
    ],
    tip: "[초간단 캠핑 문제해결] 야간 강풍에 텐트 흔들림 → 당황과 걱정 → 손전등 들고 텐트 줄 고정 대처 → 안전 확보 후 숙면 → 사전 대비의 교훈.",
  },
  {
    id: "q_camp_04",
    cat: "캠핑하기",
    type: "장비 묘사",
    combo_set: 2,
    combo_step: 1,
    combo_role: "1단계: 장소·대상 묘사",
    pattern_id: "pat_01",
    q_en: "What is your favorite or most essential piece of camping gear? Please describe it in detail and explain why you need it.",
    q_ko: "캠핑을 갈 때 가장 아끼거나 필수적인 캠핑 장비에 대해 자세히 설명해 주시고 왜 필요한지 말씀해 주세요.",
    sentences: [
      {
        en: "My favorite and most essential camping item is my foldable chair.",
        ko: "제가 가장 아끼고 필수적인 캠핑 장비는 접이식 캠핑 의자입니다.",
      },
      {
        en: "It is very light and easy to carry in my car.",
        ko: "매우 가볍고 차에 싣고 다니기 정말 편리해요.",
      },
      {
        en: "The fabric is waterproof, and it has a convenient cup holder.",
        ko: "원단은 방수 재질이며, 편리한 컵홀더도 달려 있습니다.",
      },
      {
        en: "Whenever I set it up at the campsite, I can sit back and relax.",
        ko: "캠핑장에 펼쳐 놓을 때마다 뒤로 기대앉아 편안하게 휴식을 취할 수 있어요.",
      },
      {
        en: "Sitting on this chair while drinking hot coffee in nature is pure happiness.",
        ko: "자연 속에서 이 의자에 앉아 따뜻한 커피를 마시는 것은 그야말로 순수한 행복입니다.",
      },
      {
        en: "I never go on any camping trip without this comfortable chair.",
        ko: "저는 이 편안한 의자 없이는 결코 캠핑을 떠나지 않아요.",
      },
    ],
    keywords: [
      "foldable camping chair",
      "light and easy to carry",
      "waterproof fabric",
      "cup holder",
      "pure happiness",
    ],
    tip: "[캠핑 장비 묘사] 접이식 캠핑 의자 소개 → 가벼움 및 방수 원단 → 컵홀더 편의성 → 자연 속 커피 휴식.",
  },
  {
    id: "q_camp_05",
    cat: "캠핑하기",
    type: "캠핑 저녁 루틴",
    combo_set: 2,
    combo_step: 2,
    combo_role: "2단계: 일상 루틴·활동",
    pattern_id: "pat_02",
    q_en: "What do you usually do for dinner and relaxation at a campsite? Describe your evening routine around the campfire in detail.",
    q_ko: "캠핑장에서 저녁 식사와 휴식을 취할 때 보통 무엇을 하시나요? 모닥불 주변에서의 저녁 루틴을 자세히 설명해 주세요.",
    sentences: [
      {
        en: "Evenings at a campsite are always the highlight of the entire camping trip.",
        ko: "캠핑장에서의 저녁 시간은 언제나 캠핑 여행 전체의 하이라이트입니다.",
      },
      {
        en: "First, around six in the evening, I light the charcoal grill to make a barbecue.",
        ko: "먼저 저녁 6시쯤 바비큐를 위해 숯불 그릴에 불을 지핍니다.",
      },
      {
        en: "We grill thick pork belly, mushrooms, and sausages, eating them fresh off the grill.",
        ko: "두툼한 삼겹살과 버섯, 소시지를 구워 그릴에서 갓 구운 상태로 맛있게 먹어요.",
      },
      {
        en: "After dinner, I build a small wood campfire using dry firewood logs.",
        ko: "식사 후에는 마른 장작을 이용해 작고 따뜻한 모닥불을 피웁니다.",
      },
      {
        en: "We roast sweet marshmallows on sticks and silently watch the dancing flames.",
        ko: "나무 꼬치에 달콤한 마시멜로를 구워 먹으며 일렁이는 불꽃을 멍하니 바라봐요.",
      },
      {
        en: "This peaceful campfire time warms my heart and melts all my stress away.",
        ko: "이 평화로운 불멍 시간은 마음을 따뜻하게 녹여주고 모든 스트레스를 날려줍니다.",
      },
    ],
    keywords: [
      "highlight of camping",
      "light charcoal grill",
      "thick pork belly",
      "wood campfire",
      "dancing flames",
    ],
    tip: "[캠핑 저녁/불멍 루틴] 숯불 점화 및 삼겹살 바비큐 → 식사 후 장작 모닥불 피우기 → 마시멜로 구이와 불멍 힐링.",
  },
  {
    id: "q_camp_06",
    cat: "캠핑하기",
    type: "변화/비교",
    combo_set: 2,
    combo_step: 3,
    combo_role: "3단계: 변화·비교 심화",
    pattern_id: "pat_05",
    q_en: "Tell me about your very first camping trip. What was it like, and how has camping changed today compared to the past?",
    q_ko: "생애 처음으로 캠핑을 갔던 날의 기억에 대해 말씀해 주세요. 그리고 오늘날의 캠핑은 과거와 어떻게 달라졌나요?",
    sentences: [
      {
        en: "I still remember my very first camping trip with my family five years ago.",
        ko: "저는 5년 전 가족들과 함께 떠났던 생애 첫 캠핑을 여전히 기억합니다.",
      },
      {
        en: "Back then, setting up the tent took over two hours because we were beginners.",
        ko: "그 당시에는 초보자였기 때문에 텐트를 치는 데만 2시간 넘게 걸렸어요.",
      },
      {
        en: "At night, it was very cold, and cooking on a small stove was difficult.",
        ko: "밤에는 매우 추웠고 작은 버너로 요리하는 것도 서툴렀습니다.",
      },
      {
        en: "However, nowadays, camping has become much more convenient with modern gear.",
        ko: "하지만 요즘에는 현대적인 장비 덕분에 캠핑이 훨씬 더 편리해졌습니다.",
      },
      {
        en: "Now we have automatic tents, electric heaters, and clean glamping sites.",
        ko: "요즘은 자동 텐트와 전기 히터, 그리고 깨끗한 글램핑장이 많아요.",
      },
      {
        en: "Compared to the past, camping today feels like a cozy hotel in nature.",
        ko: "과거와 비교할 때 오늘날의 캠핑은 자연 속 아늑한 호텔처럼 느껴집니다.",
      },
    ],
    keywords: [
      "first camping trip",
      "took two hours",
      "cold at night",
      "modern gear",
      "cozy hotel in nature",
    ],
    tip: "[첫 캠핑 기억 및 트렌드 비교] 과거(텐트 치기 고생, 추위) vs 현재(원터치 텐트, 전기 히터, 편리한 캠핑 문화) 대비.",
  },
  {
    id: "q_rp_01",
    cat: "롤플레이",
    type: "정보 문의",
    combo_set: 1,
    combo_step: 1,
    combo_role: "11번: 상황 질문·문의",
    pattern_id: "pat_06",
    q_en: "I'd like to give you a situation and ask you to act it out. You want to buy tickets for a concert or festival with your friend. Call the ticket box office and ask three or four questions about the event.",
    q_ko: "상황을 하나 드릴 테니 연기해 보세요. 친구와 함께 콘서트나 축제에 가려고 티켓을 구매하려 합니다. 매표소에 전화해 행사와 관련된 질문 3~4가지를 해보세요.",
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
    keywords: [
      "ask about festival tickets",
      "where is hall near subway",
      "what time start today",
      "ticket price and discounts",
      "parking free for tickets",
      "thank you have a nice day",
    ],
    tip: "[초간단 롤플레이 정보문의] 전화 목적 ➔ 위치 문의 ➔ 시작 시간 문의 ➔ 가격 & 할인 확인 ➔ 무료 주차 문의 ➔ 감사 인사.",
  },
  {
    id: "q_rp_02",
    cat: "롤플레이",
    type: "문제 해결",
    combo_set: 1,
    combo_step: 2,
    combo_role: "12번: 문제 해결·대안",
    pattern_id: "pat_06",
    q_en: "I'm sorry, but there is a problem you need to resolve. You made an appointment to meet a friend at a cafe, but you are running late. Call your friend, explain the situation, and suggest two or three alternatives.",
    q_ko: "죄송하지만 해결해야 할 문제가 생겼습니다. 친구와 카페에서 만나기로 약속했으나 늦어지고 있습니다. 친구에게 전화해 상황을 설명하고 2~3가지 대안을 제시해 보세요.",
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
    keywords: [
      "calling there is a problem",
      "heavy traffic thirty minutes late",
      "surprised and worried sorry",
      "Starbucks will buy coffee",
      "meet tomorrow instead",
      "get there as fast as I can",
    ],
    tip: "[초간단 롤플레이 지연 대안] 문제 발생 전화 ➔ 30분 지연 사유 ➔ 당황·사과 ➔ 대안 1 (스벅 대기 & 커피 사기) ➔ 대안 2 (내일 만남) ➔ 도착 다짐.",
  },
  {
    id: "q_rp_03",
    cat: "롤플레이",
    type: "유사 과거 경험",
    combo_set: 1,
    combo_step: 3,
    combo_role: "13번: 유사 과거 경험",
    pattern_id: "pat_04",
    q_en: "Have you ever experienced an unexpected problem related to purchasing tickets or making an appointment, similar to the situation before? What happened and how did you resolve it?",
    q_ko: "이전 상황과 유사하게, 티켓을 예매하거나 약속을 잡을 때 예상치 못한 문제를 겪은 적이 있나요? 무슨 일이 있었고 어떻게 해결하셨는지 자세히 말씀해 주세요.",
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
    keywords: [
      "remember a big problem",
      "website suddenly crashed",
      "very surprised and worried",
      "opened smartphone app and fixed it",
      "hard day for me",
      "became a good memory",
    ],
    tip: "[초간단 롤플레이 13번 과거경험] 4번 패턴(문제해결 템플릿) 100% 재활용: Whenever I think of... ➔ Last year... ➔ surprised and worried ➔ fixed it ➔ hard day ➔ good memory.",
  },
  {
    id: "q_rp_04",
    cat: "롤플레이",
    type: "정보 문의",
    combo_set: 2,
    combo_step: 1,
    combo_role: "11번: 상황 질문·문의",
    pattern_id: "pat_06",
    q_en: "I'd like to give you a situation and ask you to act it out. You want to book a room at a hotel for an upcoming trip. Call the hotel front desk and ask three or four questions about the reservation.",
    q_ko: "상황을 하나 드릴 테니 연기해 보세요. 다가오는 여행을 위해 호텔 객실을 예약하려고 합니다. 호텔 프런트에 전화해 예약과 관련된 질문 3~4가지를 해보세요.",
    sentences: [
      {
        en: "Hello, I am calling to inquire about making a room reservation for next weekend.",
        ko: "안녕하세요, 다음 주말 객실 예약에 관해 문의드리려고 전화드렸습니다.",
      },
      {
        en: "Do you have any standard double rooms with an ocean view available for two nights?",
        ko: "혹시 오션뷰 스탠다드 더블룸으로 2박 예약 가능한 방이 남아 있나요?",
      },
      {
        en: "How much is the total rate per night, and does the price include free breakfast?",
        ko: "1박당 총 요금은 얼마이며, 가격에 무료 조식이 포함되어 있나요?",
      },
      {
        en: "Also, could you please tell me what time check-in and check-out are?",
        ko: "또한 체크인과 체크아웃 시간이 몇 시인지 알려주시겠어요?",
      },
      {
        en: "Lastly, is free parking available on-site during our stay?",
        ko: "마지막으로 투숙 기간 동안 호텔 내 무료 주차가 가능한가요?",
      },
      {
        en: "Thank you so much for your kind help. Have a wonderful day!",
        ko: "친절하게 안내해 주셔서 대단히 감사합니다. 좋은 하루 보내세요!",
      },
    ],
    keywords: [
      "room reservation",
      "ocean view double room",
      "free breakfast",
      "check-in check-out time",
      "free parking",
    ],
    tip: "[롤플레이 11번 호텔 예약 질문] 용건(다음 주말 예약) → 오션뷰 더블룸 잔여 여부 → 1박 요금 및 조식 포함 여부 → 체크인/아웃 시간 → 주차 문의.",
  },
  {
    id: "q_rp_05",
    cat: "롤플레이",
    type: "문제 해결",
    combo_set: 2,
    combo_step: 2,
    combo_role: "12번: 문제 해결·대안",
    pattern_id: "pat_06",
    q_en: "I'm sorry, but there is a problem you need to resolve. You arrived at the hotel, but there is a problem with your reservation and your room is not ready. Explain the situation to the front desk clerk and suggest two alternatives.",
    q_ko: "죄송하지만 해결해야 할 문제가 생겼습니다. 호텔에 도착했는데 예약에 문제가 생겨 방이 아직 준비되지 않았습니다. 호텔 직원에게 상황을 설명하고 2가지 대안을 제시해 보세요.",
    sentences: [
      {
        en: "Excuse me, I just checked in, but my room is not ready yet.",
        ko: "실례합니다만, 방금 체크인을 했는데 예약한 방이 아직 준비되지 않았네요.",
      },
      {
        en: "We made this reservation two weeks ago, and my family is very tired.",
        ko: "저희가 2주 전에 예약했는데, 긴 이동으로 가족들이 지금 매우 피곤합니다.",
      },
      {
        en: "Since we cannot check in now, could you please upgrade us to another available room?",
        ko: "지금 당장 입실이 불가능하다면, 혹시 이용 가능한 다른 상위 등급 방으로 업그레이드해 주실 수 있나요?",
      },
      {
        en: "If that is not possible, can we leave our bags here and get free drink coupons?",
        ko: "만약 그것이 어렵다면, 짐을 여기에 보관해 주시고 라운지 무료 음료 쿠폰을 주실 수 있을까요?",
      },
      {
        en: "We really need some rest after a long drive today.",
        ko: "오늘 운전이 길어서 저희는 휴식이 정말 필요합니다.",
      },
      {
        en: "Please check the available options and let me know. Thank you!",
        ko: "가능한 옵션을 확인해 보시고 말씀해 주세요. 감사합니다!",
      },
    ],
    keywords: [
      "room not ready",
      "family very tired",
      "upgrade to another room",
      "leave our bags",
      "free drink coupons",
    ],
    tip: "[롤플레이 12번 호텔 방 문제 대안] 문제 설명(방 미준비, 피곤함) → 대안 1(다른 빈 방 업그레이드) → 대안 2(짐 보관 및 음료 쿠폰 요청) → 신속 해결 부탁.",
  },
  {
    id: "q_rp_06",
    cat: "롤플레이",
    type: "유사 경험",
    combo_set: 2,
    combo_step: 3,
    combo_role: "13번: 유사 과거 경험",
    pattern_id: "pat_04",
    q_en: "Have you ever experienced an unexpected problem with a hotel reservation or room facilities during a trip? What happened and how did you resolve it? Tell me everything from beginning to end.",
    q_ko: "여행 중 호텔 예약이나 객실 시설과 관련하여 예상치 못한 문제를 겪은 적이 있나요? 무슨 일이 있었고 어떻게 해결하셨는지 처음부터 끝까지 말씀해 주세요.",
    sentences: [
      {
        en: "Last summer, I had a problem with the air conditioner at a hotel in Busan.",
        ko: "지난여름, 부산의 한 호텔에서 에어컨 고장으로 문제를 겪었습니다.",
      },
      {
        en: "It was very hot outside, but the air conditioner blew only warm air.",
        ko: "바깥 날씨가 무척 더웠는데 객실 에어컨에서 미지근한 바람만 나왔어요.",
      },
      {
        en: "I was so uncomfortable that I called the front desk right away.",
        ko: "너무 불편해서 즉시 프런트 데스크에 전화를 걸어 도움을 요청했습니다.",
      },
      {
        en: "A staff member came quickly, but he could not fix the issue immediately.",
        ko: "직원이 빠르게 올라왔지만, 냉방 문제를 즉시 고치지는 못했습니다.",
      },
      {
        en: "Fortunately, the manager kindly apologized and moved me to a bigger room.",
        ko: "다행히 지배인님이 친절히 사과하며 더 큰 방으로 교체해 주었습니다.",
      },
      {
        en: "Thanks to their quick help, I was able to enjoy my trip comfortably.",
        ko: "그들의 빠른 대처 덕분에 남은 여행을 편안하게 즐길 수 있었습니다.",
      },
    ],
    keywords: [
      "air conditioner problem",
      "hot outside",
      "called the front desk",
      "moved to a bigger room",
      "enjoy my trip comfortably",
    ],
    tip: "[롤플레이 13번 유사 돌발 경험] 부산 호텔 에어컨 고장 발생 → 프런트 전화 요청 → 즉시 수리 불가 → 상위 룸 교체 해결로 만족.",
  },
  {
    id: "q_rp_07",
    cat: "롤플레이",
    type: "에바 역질문",
    combo_set: 3,
    combo_step: 1,
    combo_role: "15번: 에바에게 역질문",
    pattern_id: "pat_06",
    q_en: "I also enjoy traveling on vacations both in Korea and overseas. Ask me three or four questions to find out more about my favorite travel destinations and travel style.",
    q_ko: "저 역시 휴가 때 국내외로 여행 다니는 것을 좋아합니다. 제가 가장 좋아하는 여행지와 여행 스타일에 대해 3~4가지 질문을 해보세요.",
    sentences: [
      {
        en: "Oh, Eva, you also like traveling? That sounds wonderful!",
        ko: "아, 에바 당신도 여행을 좋아하시나요? 정말 멋지네요!",
      },
      {
        en: "First, where is your favorite place to visit on vacations?",
        ko: "먼저, 휴가 때 방문하기 가장 좋아하는 여행지는 어디인가요?",
      },
      {
        en: "And who do you usually go on trips with?",
        ko: "그리고 보통 누구와 함께 여행을 떠나시나요?",
      },
      {
        en: "Also, what kind of activities do you enjoy during your trip?",
        ko: "또한, 여행 중에 어떤 활동을 즐기시나요?",
      },
      {
        en: "Lastly, what was your most memorable travel destination so far?",
        ko: "마지막으로, 지금까지 가장 기억에 남는 여행지는 어디였나요?",
      },
      {
        en: "Please tell me all about your travel stories next time!",
        ko: "다음에 꼭 당신의 여행 이야기를 들려주세요!",
      },
    ],
    keywords: [
      "also like traveling",
      "favorite place on vacations",
      "who with",
      "activities during trip",
      "memorable destination",
    ],
    tip: "[15번 에바 여행 역질문] 맞장구 공감 ➔ 선호 여행지(Where) ➔ 동행(Who) ➔ 즐기는 활동(What) ➔ 최고 기억(Memorable) ➔ 마무리.",
  },
  {
    id: "q_rp_08",
    cat: "롤플레이",
    type: "에바 역질문",
    combo_set: 3,
    combo_step: 2,
    combo_role: "15번: 에바에게 역질문",
    pattern_id: "pat_06",
    q_en: "I also love listening to music in my free time and attending concerts. Ask me three or four questions about the music genres and singers I like.",
    q_ko: "저도 여가 시간에 음악을 듣고 콘서트 가는 것을 정말 좋아합니다. 제가 좋아하는 음악 장르와 가수에 대해 3~4가지 질문을 해보세요.",
    sentences: [
      {
        en: "Oh, Eva, you love listening to music too? That sounds so exciting!",
        ko: "아, 에바 당신도 음악 듣는 걸 좋아한다고요? 정말 신나네요!",
      },
      {
        en: "First, what kind of music genres do you listen to most?",
        ko: "먼저, 어떤 음악 장르를 가장 많이 들으시나요?",
      },
      {
        en: "And who is your all-time favorite singer or band?",
        ko: "그리고 당신이 가장 좋아하는 가수나 밴드는 누구인가요?",
      },
      {
        en: "Also, when and where do you usually enjoy listening to music?",
        ko: "또한, 주로 언제 어디서 음악을 즐겨 들으시나요?",
      },
      {
        en: "Lastly, have you ever been to a live music concert recently?",
        ko: "마지막으로, 최근에 라이브 콘서트에 가본 적이 있나요?",
      },
      {
        en: "I would really love to hear your favorite playlist sometime!",
        ko: "언제 당신의 추천 플레이리스트를 꼭 들어보고 싶어요!",
      },
    ],
    keywords: [
      "love music too",
      "music genres",
      "favorite singer or band",
      "when and where listen",
      "live music concert",
    ],
    tip: "[15번 에바 음악 역질문] 맞장구 공감 ➔ 선호 장르(What genre) ➔ 최애 가수(Who) ➔ 청취 장소/시간(When/Where) ➔ 콘서트 경험 ➔ 플레이리스트 추천 기대.",
  },
  {
    id: "q_rp_09",
    cat: "롤플레이",
    type: "에바 역질문",
    combo_set: 3,
    combo_step: 3,
    combo_role: "15번: 에바에게 역질문",
    pattern_id: "pat_06",
    q_en: "I also like visiting cafes to drink coffee and relax with friends. Ask me three or four questions about what I do at cafes and what I like to order.",
    q_ko: "저도 친구들과 카페에 방문해 커피를 마시며 쉬는 것을 좋아합니다. 제가 카페에서 무엇을 하고 어떤 메뉴를 시키는지 3~4가지 질문을 해보세요.",
    sentences: [
      {
        en: "Oh, Eva, you like visiting cafes too? That sounds great!",
        ko: "아, 에바 당신도 카페 가는 걸 좋아하시나요? 너무 좋네요!",
      },
      {
        en: "First, what kind of cafe do you usually like to visit?",
        ko: "먼저, 평소에 어떤 스타일의 카페를 주로 찾으시나요?",
      },
      {
        en: "And what is your favorite drink or dessert to order there?",
        ko: "그리고 그곳에서 가장 즐겨 주문하는 음료나 디저트는 무엇인가요?",
      },
      {
        en: "Also, do you prefer going alone, or do you go with friends?",
        ko: "또한, 혼자 가시는 걸 좋아하시나요, 아니면 친구들과 가시나요?",
      },
      {
        en: "Lastly, is there a memorable cafe you would recommend to me?",
        ko: "마지막으로, 저에게 추천해 주고 싶은 기억에 남는 카페가 있나요?",
      },
      {
        en: "Please tell me about your favorite cafe next time!",
        ko: "다음에 당신의 최애 카페에 대해 꼭 알려주세요!",
      },
    ],
    keywords: [
      "like visiting cafes",
      "what kind of cafe",
      "favorite drink or dessert",
      "alone or with friends",
      "recommend memorable cafe",
    ],
    tip: "[15번 에바 카페 역질문] 맞장구 공감 ➔ 카페 분위기(What kind) ➔ 선호 메뉴(Drink/Dessert) ➔ 동행 여부(Alone or friends) ➔ 추천 카페 ➔ 마무리.",
  },
  {
    "id": "q_intro_07",
    "cat": "자기소개",
    "type": "가족/주변인 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Please tell me about your family or the people you live with. What are they like, and what do you do together?",
    "q_ko": "가족이나 함께 사는 사람들에 대해 말씀해 주세요. 어떤 성향이고 주로 함께 무엇을 하시나요?",
    "sentences": [
      {
        "en": "Whenever I think of my family, my parents and my younger brother come to mind first.",
        "ko": "가족을 생각하면, 저희 부모님과 남동생이 가장 먼저 떠올라요."
      },
      {
        "en": "My parents are very kind and warm, and they always support me.",
        "ko": "부모님은 매우 다정하고 따뜻하시며, 항상 저를 응원해 주십니다."
      },
      {
        "en": "My younger brother is funny and cheerful, so we get along very well.",
        "ko": "남동생은 유쾌하고 밝은 성격이라서, 우리는 사이가 아주 좋아요."
      },
      {
        "en": "When we are together, we usually eat delicious home-cooked meals and talk.",
        "ko": "우리가 함께 모이면, 보통 맛있는 집밥을 먹으며 많은 이야기를 나눕니다."
      },
      {
        "en": "They are the most important and precious people in my life.",
        "ko": "그들은 제 인생에서 가장 소중하고 귀한 사람들입니다."
      },
      {
        "en": "So, I really love spending happy time with my family.",
        "ko": "그래서 저는 가족과 함께 행복한 시간을 보내는 것을 정말 사랑해요."
      }
    ],
    "keywords": [
      "think of my family",
      "kind and warm parents",
      "younger brother",
      "home-cooked meals",
      "precious people"
    ],
    "tip": "[가족 소개] 가족 구성원 환기 ➔ 부모님 성향 ➔ 동생 성향 ➔ 함께 하는 활동(식사·대화) ➔ 소중함 강조 ➔ 마무리."
  },
  {
    "id": "q_intro_08",
    "cat": "자기소개",
    "type": "주말 가족 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What do you usually do with your family or friends on weekends? Tell me about your typical routine from morning to evening.",
    "q_ko": "주말에 가족이나 친구들과 보통 무엇을 하시나요? 아침부터 저녁까지의 전형적인 루틴을 말씀해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, when I have free time on weekends, I usually love to spend time with my family.",
        "ko": "음, 있잖아요, 주말에 자유 시간이 나면, 저는 보통 가족과 함께 시간을 보내는 것을 정말 좋아해요."
      },
      {
        "en": "First, I wake up late, take a warm shower, and get ready.",
        "ko": "우선, 늦잠을 자고 일어나서 따뜻한 물로 샤워를 하고 준비를 해요."
      },
      {
        "en": "Then, I usually have a relaxing brunch with my family at home.",
        "ko": "그리고 나서, 저는 보통 집에서 가족과 함께 여유로운 브런치를 먹습니다."
      },
      {
        "en": "In the afternoon, we go for a walk in the nearby park, listening to the birds.",
        "ko": "오후에는, 새소리를 들으면서 근처 공원으로 다 같이 산책을 나가요."
      },
      {
        "en": "After that, we eat a nice dinner together, and watch TV in the living room.",
        "ko": "그 후에는, 함께 맛있는 저녁을 먹고 거실에서 TV를 시청합니다."
      },
      {
        "en": "That is my typical weekend routine with my family.",
        "ko": "이게 바로 저의 전형적인 주말 가족 일과 루틴이에요."
      }
    ],
    "keywords": [
      "spend time with family",
      "wake up late",
      "relaxing brunch",
      "nearby park walk",
      "watch TV together"
    ],
    "tip": "[주말 가족 루틴] 서두 공감 ➔ 늦잠/준비 ➔ 브런치 ➔ 공원 산책 ➔ 저녁 식사 및 TV ➔ 루틴 마무리."
  },
  {
    "id": "q_intro_09",
    "cat": "자기소개",
    "type": "가족 기념일 경험",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 과거 경험",
    "pattern_id": "pat_03",
    "q_en": "Tell me about a memorable day or special celebration you spent with your family. Where did you go and what made it so special?",
    "q_ko": "가족과 함께 보냈던 기억에 남는 특별한 날이나 기념일에 대해 말씀해 주세요. 어디에 갔고 왜 그렇게 특별했나요?",
    "sentences": [
      {
        "en": "Well, let me see... I remember a very special day with my family.",
        "ko": "음, 어디 보자... 가족과 함께했던 아주 특별했던 하루가 기억나요."
      },
      {
        "en": "Last month, we celebrated my mother's birthday at a nice Italian restaurant.",
        "ko": "지난달에, 우리는 근사한 이탈리안 레스토랑에서 어머니의 생신을 축하했어요."
      },
      {
        "en": "Actually, the food was delicious and the atmosphere was very cozy and warm.",
        "ko": "실제로, 음식도 정말 맛있었고 분위기도 무척 아늑하고 따뜻했습니다."
      },
      {
        "en": "We gave her a beautiful flower bouquet and had a great conversation together.",
        "ko": "우리는 어머니께 예쁜 꽃다발을 선물해 드렸고, 다 함께 즐거운 대화를 나눴어요."
      },
      {
        "en": "It was the happiest day for me and my whole family.",
        "ko": "저와 온 가족 모두에게 최고의 행복한 하루였습니다."
      },
      {
        "en": "So, it became an unforgettable memory for all of us.",
        "ko": "그래서, 우리 모두에게 잊을 수 없는 소중한 추억이 되었어요."
      }
    ],
    "keywords": [
      "special day with family",
      "mother's birthday",
      "Italian restaurant",
      "delicious food and cozy vibe",
      "flower bouquet",
      "unforgettable memory"
    ],
    "tip": "[가족 특별 경험] 회상 시작 ➔ 어머니 생신 식사 ➔ 음식/분위기 묘사 ➔ 꽃다발 선물 및 대화 ➔ 행복한 감정 ➔ 평생 추억 마무리."
  },
  {
    "id": "q_home_07",
    "cat": "집/주거",
    "type": "동네/편의시설 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Please describe the neighborhood where you live. What does it look like, and what kind of facilities are around your home?",
    "q_ko": "거주하시는 동네에 대해 설명해 주세요. 어떤 분위기이고 집 주변에 어떤 편의시설들이 있나요?",
    "sentences": [
      {
        "en": "Whenever I think of my neighborhood, the peaceful atmosphere comes to mind first.",
        "ko": "제가 사는 동네를 생각하면, 평화로운 분위기가 가장 먼저 떠올라요."
      },
      {
        "en": "My neighborhood is very quiet, clean, and safe both day and night.",
        "ko": "우리 동네는 밤낮으로 매우 조용하고 깨끗하며 치안이 안전합니다."
      },
      {
        "en": "There is a convenient subway station and a big supermarket just five minutes away.",
        "ko": "걸어서 5분 거리에 편리한 지하철역과 대형 마트가 있어요."
      },
      {
        "en": "When I walk around, I usually see cozy cafes and a green park.",
        "ko": "동네를 둘러보면, 아늑한 카페들과 푸른 공원이 곳곳에 보입니다."
      },
      {
        "en": "The location is really convenient, so living here is so comfortable.",
        "ko": "위치가 정말 편리해서, 여기서 사는 것이 아주 만족스럽고 편안해요."
      },
      {
        "en": "So, I really love my lovely and peaceful neighborhood.",
        "ko": "그래서 저는 제가 사는 사랑스럽고 평화로운 동네를 정말 좋아합니다."
      }
    ],
    "keywords": [
      "peaceful atmosphere",
      "quiet clean and safe",
      "subway station nearby",
      "cozy cafes and park",
      "convenient location"
    ],
    "tip": "[동네 묘사] 동네 연상 ➔ 치안/청결 분위기 ➔ 지하철/마트 편의시설 ➔ 주변 카페/공원 ➔ 편리한 입지 ➔ 만족 마무리."
  },
  {
    "id": "q_home_08",
    "cat": "집/주거",
    "type": "저녁 휴식 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What do you usually do in the evening after getting home from work? Describe your relaxing routine from dinner until bedtime.",
    "q_ko": "퇴근 후 저녁 시간에 집에서 보통 무엇을 하시나요? 저녁 식사부터 잠자리에 들 때까지의 휴식 루틴을 설명해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, when I get home after work, I usually love to relax comfortably.",
        "ko": "음, 있잖아, 퇴근하고 집에 오면, 저는 보통 편안하게 쉬는 것을 정말 좋아해요."
      },
      {
        "en": "First, I change into comfortable clothes and take a refreshing warm shower.",
        "ko": "우선, 편안한 옷으로 갈아입고 개운하게 따뜻한 샤워를 합니다."
      },
      {
        "en": "Then, I usually eat a simple dinner, listening to gentle acoustic music.",
        "ko": "그리고 나서, 잔잔한 어쿠스틱 음악을 들으며 간단한 저녁 식사를 해요."
      },
      {
        "en": "After dinner, I lie on the soft sofa and watch YouTube on my smartphone.",
        "ko": "저녁을 먹은 뒤에는, 푹신한 소파에 누워 스마트폰으로 유튜브를 봅니다."
      },
      {
        "en": "After that, I turn off the lights and go to sleep around midnight.",
        "ko": "그 후에는, 방 불을 끄고 자정 무렵에 잠자리에 들어요."
      },
      {
        "en": "That is my everyday evening routine at home.",
        "ko": "이게 바로 집에서의 저의 매일 저녁 휴식 루틴이에요."
      }
    ],
    "keywords": [
      "relax comfortably",
      "comfortable clothes and shower",
      "simple dinner with music",
      "lie on soft sofa",
      "watch YouTube",
      "sleep around midnight"
    ],
    "tip": "[저녁 루틴] 퇴근 후 귀가 ➔ 샤워/환복 ➔ 저녁 식사 및 음악 ➔ 소파 휴식(유튜브) ➔ 취침 ➔ 마무리."
  },
  {
    "id": "q_home_09",
    "cat": "집/주거",
    "type": "집에서의 특별한 휴식",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 과거 경험",
    "pattern_id": "pat_03",
    "q_en": "Tell me about a memorable weekend or holiday you spent resting comfortably at home. What did you do and why was it so good?",
    "q_ko": "집에서 편안하게 휴식을 취하며 보냈던 기억에 남는 주말이나 휴일에 대해 말씀해 주세요. 무엇을 했고 왜 그렇게 좋았나요?",
    "sentences": [
      {
        "en": "Well, let me see... I remember a very peaceful and special holiday at home.",
        "ko": "음, 어디 보자... 집에서 아주 평화롭고 특별하게 보냈던 휴일이 기억나요."
      },
      {
        "en": "Last month, on a rainy Sunday, I decided to stay home all day alone.",
        "ko": "지난달에, 비가 내리던 일요일에 저는 하루 종일 혼자 집에 있기로 했어요."
      },
      {
        "en": "Actually, the warm bed and cozy blanket were very comfortable and relaxing.",
        "ko": "실제로, 따뜻한 침대와 포근한 이불이 정말 편안하고 힐링이 되었습니다."
      },
      {
        "en": "I read my favorite book, drank hot green tea, and took a deep nap.",
        "ko": "좋아하는 책을 읽고, 따뜻한 녹차를 마시며 깊은 낮잠을 푹 잤어요."
      },
      {
        "en": "It was the best healing day for me after a busy week.",
        "ko": "바쁜 한 주를 보낸 저에게 최고의 힐링 하루였습니다."
      },
      {
        "en": "So, I really want to enjoy that kind of sweet rest at home again.",
        "ko": "그래서, 저는 집에서 그런 달콤한 휴식을 꼭 다시 즐기고 싶어요."
      }
    ],
    "keywords": [
      "peaceful holiday at home",
      "rainy Sunday alone",
      "cozy blanket",
      "read book and hot tea",
      "best healing day",
      "sweet rest"
    ],
    "tip": "[집콕 휴식 경험] 특별한 휴일 환기 ➔ 비 오는 일요일 집콕 ➔ 침대/담요 안락함 ➔ 독서/차/낮잠 ➔ 힐링 소감 ➔ 재충전 마무리."
  },
  {
    "id": "q_work_07",
    "cat": "직장/업무",
    "type": "업무 공간 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Please describe your workspace or desk at your office. How is it organized, and what does it look like?",
    "q_ko": "사무실에 있는 본인의 업무 공간이나 책상에 대해 설명해 주세요. 어떻게 정돈되어 있고 어떤 모습인가요?",
    "sentences": [
      {
        "en": "Whenever I think of my workplace, my office desk comes to mind first.",
        "ko": "직장을 생각하면, 제 사무실 책상이 가장 먼저 떠올라요."
      },
      {
        "en": "My workspace is very clean, neat, and organized.",
        "ko": "제 업무 공간은 매우 깨끗하고 정돈되어 있습니다."
      },
      {
        "en": "On my desk, there is a large dual monitor, a comfortable keyboard, and my laptop.",
        "ko": "책상 위에는 넓은 듀얼 모니터와 편안한 키보드, 제 노트북이 놓여 있어요."
      },
      {
        "en": "When I work there, I usually keep a tumbler with cold water next to me.",
        "ko": "거기서 일할 때, 저는 보통 옆에 시원한 물이 든 텀블러를 둡니다."
      },
      {
        "en": "The ergonomic chair is very comfortable, so I can focus on my tasks easily.",
        "ko": "인체공학 의자가 아주 편안해서, 업무에 쉽게 집중할 수 있어요."
      },
      {
        "en": "So, I really like my productive and tidy workspace.",
        "ko": "그래서 저는 생산적이고 깔끔한 저의 업무 공간을 정말 좋아합니다."
      }
    ],
    "keywords": [
      "office desk",
      "clean neat and organized",
      "dual monitor and laptop",
      "tumbler with cold water",
      "ergonomic chair",
      "productive workspace"
    ],
    "tip": "[업무 공간 묘사] 책상 연상 ➔ 청결·정돈 ➔ 듀얼 모니터/노트북 ➔ 텀블러 배치 ➔ 인체공학 의자 편안함 ➔ 생산성 만족 마무리."
  },
  {
    "id": "q_work_08",
    "cat": "직장/업무",
    "type": "점심시간 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What do you usually do during your lunch break at work? Tell me about your routine with your coworkers from start to finish.",
    "q_ko": "직장에서 점심시간에 보통 무엇을 하시나요? 동료들과 함께하는 점심 루틴을 처음부터 끝까지 말씀해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, when lunchtime comes at twelve o'clock, I usually love to eat with my team.",
        "ko": "음, 있잖아, 12시 점심시간이 되면, 저는 보통 팀원들과 식사하는 것을 정말 좋아해요."
      },
      {
        "en": "First, I save my computer files, wash my hands, and step out of the office.",
        "ko": "우선, 컴퓨터 파일을 저장하고 손을 씻은 뒤 사무실을 나섭니다."
      },
      {
        "en": "Then, I usually go to a nearby restaurant with my kind colleagues.",
        "ko": "그리고 나서, 친절한 동료들과 함께 회사 근처 식당으로 향해요."
      },
      {
        "en": "When we eat, we enjoy delicious meals like kimchi stew and chat happily.",
        "ko": "식사할 때는, 김치찌개 같은 맛있는 음식을 먹으며 즐겁게 담소를 나눕니다."
      },
      {
        "en": "After that, we stop by a cafe, grab an iced Americano, and walk a bit.",
        "ko": "그 후에는, 카페에 들러 아이스 아메리카노를 테이크아웃해서 가볍게 산책해요."
      },
      {
        "en": "That is my enjoyable lunch routine on weekdays.",
        "ko": "이게 바로 평일 직장에서의 저의 즐거운 점심 루틴이에요."
      }
    ],
    "keywords": [
      "lunchtime at twelve",
      "step out of office",
      "nearby restaurant with colleagues",
      "kimchi stew and chat",
      "grab iced Americano",
      "lunch routine"
    ],
    "tip": "[점심시간 루틴] 12시 점심 ➔ 저장/손씻기 ➔ 동료와 식당 이동 ➔ 식사 및 담소 ➔ 테이크아웃 커피 산책 ➔ 루틴 마무리."
  },
  {
    "id": "q_work_09",
    "cat": "직장/업무",
    "type": "성공적인 프로젝트 경험",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 과거 경험",
    "pattern_id": "pat_03",
    "q_en": "Tell me about a memorable project or task you successfully completed at work. What was it, and how did you feel?",
    "q_ko": "직장에서 성공적으로 마쳤던 기억에 남는 프로젝트나 업무에 대해 말씀해 주세요. 어떤 일이었고 기분이 어떠셨나요?",
    "sentences": [
      {
        "en": "Well, let me see... I remember a very rewarding project at work.",
        "ko": "음, 어디 보자... 회사에서 아주 보람찼던 프로젝트가 하나 기억나요."
      },
      {
        "en": "Last quarter, our team launched a new mobile service on a tight deadline.",
        "ko": "지난 분기에, 저희 팀은 촉박한 일정 속에서 새로운 모바일 서비스를 출시했습니다."
      },
      {
        "en": "Actually, the project was quite challenging, but our team teamwork was fantastic.",
        "ko": "실제로, 프로젝트는 꽤 어려웠지만 저희 팀의 팀워크는 환상적이었어요."
      },
      {
        "en": "We supported each other, worked hard, and finished everything without errors.",
        "ko": "우리는 서로를 도우며 열심히 일했고, 오류 없이 모든 작업을 무사히 완수했습니다."
      },
      {
        "en": "It was the most proud and satisfying moment for me.",
        "ko": "저에게 가장 자랑스럽고 성취감이 컸던 순간이었어요."
      },
      {
        "en": "So, that experience gave me great confidence in my career.",
        "ko": "그래서, 그 경험은 저의 직무 커리어에 큰 자신감을 주었습니다."
      }
    ],
    "keywords": [
      "rewarding project",
      "launched mobile service",
      "challenging but fantastic teamwork",
      "finished without errors",
      "proud and satisfying",
      "great confidence"
    ],
    "tip": "[성공 프로젝트 경험] 보람찬 프로젝트 환기 ➔ 모바일 서비스 런칭 ➔ 난이도 및 팀워크 ➔ 에러 없이 완수 ➔ 뿌듯함 ➔ 자신감 마무리."
  },
  {
    "id": "q_cafe_07",
    "cat": "카페가기",
    "type": "동네 조용한 카페 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Please describe your favorite quiet cafe or neighborhood coffee shop in detail. What does the interior look like, and why do you like it?",
    "q_ko": "자주 가시는 동네의 조용한 카페에 대해 자세히 설명해 주세요. 실내 인테리어는 어떻고 왜 그곳을 좋아하시나요?",
    "sentences": [
      {
        "en": "Whenever I think of a quiet cafe, a small coffee shop near my house comes to mind.",
        "ko": "조용한 카페를 생각하면, 집 근처 작은 동네 카페가 가장 먼저 떠올라요."
      },
      {
        "en": "The cafe is very cozy, peaceful, and has warm yellow lighting.",
        "ko": "그 카페는 매우 아늑하고 평화로우며, 따뜻한 노란빛 조명이 비춰요."
      },
      {
        "en": "There are soft wooden tables, comfortable chairs, and plenty of power outlets.",
        "ko": "부드러운 원목 테이블과 편안한 의자, 그리고 콘센트가 넉넉하게 구비되어 있습니다."
      },
      {
        "en": "When I visit there, gentle jazz music is always playing softly.",
        "ko": "거기에 방문하면, 잔잔한 재즈 음악이 항상 부드럽게 흘러나옵니다."
      },
      {
        "en": "The barista is very friendly, and the coffee aroma is wonderful.",
        "ko": "바리스타 분도 매우 친절하시고, 커피 향기도 정말 향긋해요."
      },
      {
        "en": "So, it is my favorite hideout to relax and recharge.",
        "ko": "그래서, 그곳은 제가 휴식하고 에너지를 재충전하는 최애 아지트입니다."
      }
    ],
    "keywords": [
      "small coffee shop",
      "cozy and peaceful",
      "warm yellow lighting",
      "wooden tables and power outlets",
      "gentle jazz music",
      "favorite hideout"
    ],
    "tip": "[조용한 카페 묘사] 동네 아지트 연상 ➔ 조명/분위기 ➔ 원목 가구/콘센트 ➔ 재즈 음악 ➔ 친절한 바리스타 ➔ 충전 장소 마무리."
  },
  {
    "id": "q_cafe_08",
    "cat": "카페가기",
    "type": "노트북 작업 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What do you usually do when you spend time at a cafe with your laptop or a book on weekends? Tell me about your routine.",
    "q_ko": "주말에 노트북이나 책을 가지고 카페에 갈 때 보통 무엇을 하시나요? 카페에서의 일상 루틴을 말씀해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, when I have free time on Saturday, I usually love to work at a cafe.",
        "ko": "음, 있잖아요, 토요일에 자유 시간이 나면, 저는 보통 카페에서 작업하는 걸 아주 좋아해요."
      },
      {
        "en": "First, I pack my laptop, charger, and notebook into my backpack.",
        "ko": "우선, 노트북과 충전기, 공책을 백팩에 챙겨 넣습니다."
      },
      {
        "en": "Then, I usually walk to Starbucks, listening to my favorite playlist.",
        "ko": "그리고 나서, 좋아하는 플레이리스트를 들으며 스타벅스로 걸어가요."
      },
      {
        "en": "When I arrive, I order an iced Americano and find a quiet table near a window.",
        "ko": "도착하면, 아이스 아메리카노를 주문하고 창가 쪽 조용한 자리를 잡습니다."
      },
      {
        "en": "After that, I open my laptop, study coding, or read for two hours.",
        "ko": "그 후에는, 노트북을 켜서 코딩 공부를 하거나 2시간 동안 책을 읽어요."
      },
      {
        "en": "That is my productive weekend routine at a cafe.",
        "ko": "이게 바로 주말 카페에서의 저의 생산적인 루틴이에요."
      }
    ],
    "keywords": [
      "work at cafe on Saturday",
      "pack laptop and charger",
      "walk to Starbucks",
      "iced Americano near window",
      "study coding for two hours",
      "productive routine"
    ],
    "tip": "[카페 작업 루틴] 토요일 카페 ➔ 짐 챙기기 ➔ 음악 들으며 이동 ➔ 주문 및 창가 자리 ➔ 2시간 코딩/독서 ➔ 생산적 루틴 마무리."
  },
  {
    "id": "q_cafe_09",
    "cat": "카페가기",
    "type": "음료 쏟음 돌발 대처",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 돌발 상황",
    "pattern_id": "pat_04",
    "q_en": "Have you ever experienced an unexpected problem or accident at a cafe, such as spilling coffee? What happened, and how did you resolve it?",
    "q_ko": "카페에서 커피를 쏟는 등 예상치 못한 사고나 곤란한 문제를 겪은 적이 있나요? 무슨 일이었고 어떻게 해결하셨나요?",
    "sentences": [
      {
        "en": "Whenever I think of cafes, I remember a big problem I had last month.",
        "ko": "카페를 생각하면, 지난달에 겪었던 큰 낭패가 하나 기억나요."
      },
      {
        "en": "I was carrying my full iced latte to my table, and suddenly I tripped over a chair.",
        "ko": "가득 찬 아이스 라떼를 들고 자리로 가다가, 갑자기 의자에 발이 걸려 넘어졌어요."
      },
      {
        "en": "At first, I was so surprised, embarrassed, and worried about my clothes.",
        "ko": "처음에는, 너무 놀라고 창피했으며 옷을 버릴까 봐 걱정됐습니다."
      },
      {
        "en": "So, I quickly apologized to the staff and cleaned the floor with paper napkins.",
        "ko": "그래서, 즉시 직원에게 사과드리고 종이 냅킨으로 바닥을 깨끗이 닦았어요."
      },
      {
        "en": "Fortunately, the kind barista gave me a new cup of coffee with a warm smile.",
        "ko": "다행히도, 친절한 바리스타 분께서 따뜻한 미소와 함께 새 커피를 다시 만들어 주셨습니다."
      },
      {
        "en": "Anyway, it was solved well, so everything was okay.",
        "ko": "어쨌든, 일이 잘 해결되어서, 다 괜찮았습니다."
      }
    ],
    "keywords": [
      "problem at cafe",
      "tripped over a chair",
      "spilled iced latte",
      "apologized and cleaned with napkins",
      "kind barista gave new coffee",
      "solved well"
    ],
    "tip": "[카페 돌발 대처] 문제 환기 ➔ 발 걸려 라떼 쏟음 ➔ 당황/민망 ➔ 사과 및 냅킨 청소 ➔ 바리스타의 새 음료 배려 ➔ 안도 마무리."
  },
  {
    "id": "q_park_07",
    "cat": "공원가기",
    "type": "산책로/자연 풍경 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Please describe the walking trails and natural scenery at your favorite park. What does it look like, and why do you like walking there?",
    "q_ko": "가장 좋아하시는 공원의 산책로와 자연 풍경에 대해 설명해 주세요. 어떻게 생겼고 왜 그곳을 걷는 것을 좋아하시나요?",
    "sentences": [
      {
        "en": "Whenever I think of my favorite park, the beautiful walking trail comes to mind first.",
        "ko": "가장 좋아하는 공원을 생각하면, 아름다운 산책로가 가장 먼저 떠올라요."
      },
      {
        "en": "The park trail is very wide, smooth, and surrounded by tall green trees.",
        "ko": "공원 산책로는 매우 넓고 평탄하며, 키 큰 푸른 나무들로 둘러싸여 있습니다."
      },
      {
        "en": "Along the path, there is a sparkling lake and many wooden benches to rest.",
        "ko": "길을 따라 반짝이는 호수와 쉴 수 있는 나무 벤치가 많이 놓여 있어요."
      },
      {
        "en": "When I walk there, I can always feel the fresh breeze and smell blooming flowers.",
        "ko": "그곳을 걸을 때면, 언제나 상쾌한 바람을 느끼고 피어난 꽃향기를 맡을 수 있습니다."
      },
      {
        "en": "The natural view is so peaceful, so walking there clears my mind.",
        "ko": "자연 경관이 너무 평화로워서, 그곳을 걸으면 머릿속이 맑아져요."
      },
      {
        "en": "So, I really love spending refreshing time on this park trail.",
        "ko": "그래서 저는 이 공원 산책로에서 상쾌한 시간을 보내는 것을 정말 좋아합니다."
      }
    ],
    "keywords": [
      "beautiful walking trail",
      "tall green trees",
      "sparkling lake and benches",
      "fresh breeze and flowers",
      "clears my mind",
      "refreshing time"
    ],
    "tip": "[공원 산책로 묘사] 산책로 연상 ➔ 넓고 울창한 나무 ➔ 호수와 벤치 ➔ 시원한 바람/꽃향기 ➔ 힐링 효과 ➔ 마무리."
  },
  {
    "id": "q_park_08",
    "cat": "공원가기",
    "type": "저녁 조깅 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What do you usually do when you go for an evening walk or jog at the park? Describe your routine from start to finish.",
    "q_ko": "저녁에 공원으로 산책이나 조깅을 나갈 때 보통 무엇을 하시나요? 처음부터 끝까지의 일과 루틴을 말씀해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, after eating dinner, I usually love to jog at the park.",
        "ko": "음, 있잖아, 저녁을 먹고 나면, 저는 보통 공원에서 조깅하는 것을 정말 좋아해요."
      },
      {
        "en": "First, I put on comfortable running shoes and wear light sportswear.",
        "ko": "우선, 편안한 러닝화를 신은 뒤 가벼운 운동복을 챙겨 입습니다."
      },
      {
        "en": "Then, I usually head to the park, putting my wireless earbuds in my ears.",
        "ko": "그리고 나서, 귀에 무선 이어폰을 꽂고 공원으로 향해요."
      },
      {
        "en": "When I arrive, I stretch my body for five minutes and jog along the lake.",
        "ko": "도착하면, 5분 동안 몸을 풀고 호숫가를 따라 조깅을 합니다."
      },
      {
        "en": "After sweating for forty minutes, I walk slowly to catch my breath and drink water.",
        "ko": "40분 동안 땀을 흘린 뒤에는, 천천히 걸으며 숨을 고르고 물을 마셔요."
      },
      {
        "en": "That is my healthy evening exercise routine at the park.",
        "ko": "이게 바로 공원에서의 저의 건강한 저녁 운동 루틴이에요."
      }
    ],
    "keywords": [
      "jog after dinner",
      "comfortable running shoes",
      "wireless earbuds",
      "stretch and jog along lake",
      "sweat for forty minutes",
      "healthy evening routine"
    ],
    "tip": "[저녁 조깅 루틴] 저녁 후 조깅 ➔ 런닝화/운동복 ➔ 무선 이어폰 착용 ➔ 스트레칭 후 호숫가 조깅 ➔ 쿨다운/수분 섭취 ➔ 루틴 마무리."
  },
  {
    "id": "q_park_09",
    "cat": "공원가기",
    "type": "주말 피크닉 경험",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 과거 경험",
    "pattern_id": "pat_03",
    "q_en": "Tell me about a memorable picnic you had at a park with your friends or family. What did you eat, and what made that day so special?",
    "q_ko": "친구나 가족과 공원에서 돗자리를 펴고 즐겼던 기억에 남는 피크닉에 대해 말씀해 주세요. 무엇을 먹었고 왜 그렇게 특별했나요?",
    "sentences": [
      {
        "en": "Well, let me see... I remember a very wonderful picnic at the park.",
        "ko": "음, 어디 보자... 공원에서 보냈던 아주 멋진 피크닉이 하나 기억나요."
      },
      {
        "en": "Last spring, I went to Hangang Park with my best friends on a sunny Saturday.",
        "ko": "지난봄 화창한 토요일에, 절친들과 함께 한강공원에 갔습니다."
      },
      {
        "en": "Actually, the warm sunshine was amazing, and the river view was spectacular.",
        "ko": "실제로, 따스한 햇살도 정말 좋았고 탁 트인 강변 뷰가 정말 멋졌어요."
      },
      {
        "en": "We spread a picnic mat under a tree, ate crispy fried chicken, and drank cola.",
        "ko": "우리는 나무 그늘 아래 돗자리를 펴고, 바삭한 치킨을 먹으며 콜라를 마셨습니다."
      },
      {
        "en": "It was the happiest and most relaxing day for me.",
        "ko": "저에게는 더없이 행복하고 여유로웠던 최고의 하루였어요."
      },
      {
        "en": "So, it became an unforgettable memory with my friends.",
        "ko": "그래서, 친구들과의 잊을 수 없는 소중한 추억이 되었습니다."
      }
    ],
    "keywords": [
      "wonderful picnic at park",
      "Hangang Park with friends",
      "warm sunshine and river view",
      "picnic mat and fried chicken",
      "relaxing day",
      "unforgettable memory"
    ],
    "tip": "[공원 피크닉 경험] 피크닉 환기 ➔ 한강공원 봄나들이 ➔ 날씨와 강변 풍경 ➔ 돗자리와 치킨 먹방 ➔ 힐링 소감 ➔ 소중한 추억 마무리."
  },
  {
    "id": "q_movie_07",
    "cat": "영화보기",
    "type": "최애 배우/감독 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Who is your favorite actor or movie director? What do you like about them, and what is your favorite movie of theirs?",
    "q_ko": "가장 좋아하는 영화배우나 감독은 누구인가요? 그들의 어떤 점을 좋아하고 가장 좋아하는 작품은 무엇인가요?",
    "sentences": [
      {
        "en": "Whenever I think of movies, my favorite actor, Song Kang-ho, comes to mind first.",
        "ko": "영화를 생각하면, 제가 가장 좋아하는 배우 송강호가 가장 먼저 떠올라요."
      },
      {
        "en": "He is very famous in Korea, and his acting skills are truly incredible.",
        "ko": "그는 한국에서 매우 유명하며, 연기력이 정말 대단합니다."
      },
      {
        "en": "He always looks natural and brings deep emotions to every character he plays.",
        "ko": "그는 언제나 자연스러워 보이며, 맡은 배역마다 깊은 감정을 불어넣어요."
      },
      {
        "en": "When I watch his movies, especially 'Parasite', I get completely absorbed.",
        "ko": "그의 영화, 특히 '기생충'을 볼 때면, 저는 완전히 몰입하게 됩니다."
      },
      {
        "en": "His passion for cinema is very impressive and inspiring to me.",
        "ko": "영화에 대한 그의 열정은 저에게 깊은 인상과 영감을 줍니다."
      },
      {
        "en": "So, I really love watching any movie starring him.",
        "ko": "그래서 저는 그가 출연하는 모든 영화를 보는 것을 정말 좋아해요."
      }
    ],
    "keywords": [
      "favorite actor Song Kang-ho",
      "acting skills are incredible",
      "natural and deep emotions",
      "Parasite movie",
      "passion for cinema",
      "absorbed"
    ],
    "tip": "[좋아하는 배우 묘사] 최애 배우 환기 ➔ 연기력 극찬 ➔ 자연스러운 감정선 ➔ 대표작(기생충) 몰입 ➔ 영화에 대한 열정 ➔ 팬심 마무리."
  },
  {
    "id": "q_movie_08",
    "cat": "영화보기",
    "type": "집에서 OTT 감상 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What do you usually do on weekend nights when you watch movies at home using streaming services? Describe your routine from start to finish.",
    "q_ko": "주말 밤 집에서 넷플릭스 등 OTT로 영화를 볼 때 보통 무엇을 하시나요? 처음부터 끝까지의 일과 루틴을 설명해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, on Friday nights, I usually love to watch movies on Netflix at home.",
        "ko": "음, 있잖아요, 금요일 밤이면, 저는 보통 집에서 넷플릭스로 영화 보는 걸 정말 좋아해요."
      },
      {
        "en": "First, I finish my work, shower, and change into comfy pajamas.",
        "ko": "우선, 일을 마치고 샤워를 한 뒤 편안한 잠옷으로 갈아입습니다."
      },
      {
        "en": "Then, I usually microwave some butter popcorn and prepare a cold soda.",
        "ko": "그리고 나서, 전자레인지에 버터 팝콘을 돌리고 시원한 탄산음료를 준비해요."
      },
      {
        "en": "When I get ready, I turn off the main room lights to create a mini theater vibe.",
        "ko": "준비가 되면, 방 불을 꺼서 마치 작은 영화관 같은 분위기를 만듭니다."
      },
      {
        "en": "After that, I lie on my bed and enjoy an exciting action movie.",
        "ko": "그 후에는, 침대에 편하게 누워서 흥미진진한 액션 영화를 즐겨요."
      },
      {
        "en": "That is my favorite relaxing movie routine at home.",
        "ko": "이게 바로 집에서 영화를 즐기는 저의 최애 휴식 루틴이에요."
      }
    ],
    "keywords": [
      "watch Netflix on Friday night",
      "comfy pajamas",
      "microwave butter popcorn",
      "turn off lights mini theater vibe",
      "exciting action movie",
      "relaxing routine"
    ],
    "tip": "[집콕 OTT 영화 루틴] 금요일 넷플릭스 ➔ 환복 ➔ 버터팝콘/음료 준비 ➔ 불 끄고 소극장 분위기 ➔ 침대에서 관람 ➔ 힐링 루틴 마무리."
  },
  {
    "id": "q_movie_09",
    "cat": "영화보기",
    "type": "영화관 예매 실수 돌발",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 돌발 상황",
    "pattern_id": "pat_04",
    "q_en": "Tell me about a memorable problem you experienced at a movie theater, such as booking the wrong time or arriving late. What did you do to solve it?",
    "q_ko": "영화관에서 예매 시간을 잘못 선택했거나 지각하는 등 곤란했던 문제를 겪은 적이 있나요? 어떻게 대처하여 해결하셨나요?",
    "sentences": [
      {
        "en": "Whenever I think of movie theaters, I remember a big mistake I made last year.",
        "ko": "영화관을 생각하면, 작년에 했던 큰 실수가 하나 기억나요."
      },
      {
        "en": "I arrived at CGV multiplex, and suddenly realized I had booked the ticket for tomorrow.",
        "ko": "CGV 극장에 도착했는데, 갑자기 내일 날짜로 티켓을 예매했다는 걸 깨달았어요."
      },
      {
        "en": "At first, I was so surprised, confused, and worried about missing the movie.",
        "ko": "처음에는 너무 놀라고 당황스러웠으며, 영화를 못 볼까 봐 걱정됐습니다."
      },
      {
        "en": "So, I quickly went to the customer service ticket counter and explained my mistake.",
        "ko": "그래서, 빠르게 고객센터 매표소로 가서 제 실수 상황을 설명드렸어요."
      },
      {
        "en": "Fortunately, the kind staff changed my reservation to today's seat without extra fee.",
        "ko": "다행히도, 친절한 직원분께서 추가 요금 없이 오늘 상영 좌석으로 예매를 바꿔 주셨습니다."
      },
      {
        "en": "Anyway, it was solved well, so I enjoyed the movie with my friend.",
        "ko": "어쨌든, 일이 잘 해결되어서 친구와 영화를 재미있게 봤습니다."
      }
    ],
    "keywords": [
      "mistake at movie theater",
      "booked ticket for tomorrow",
      "surprised and confused",
      "customer service ticket counter",
      "changed reservation without extra fee",
      "solved well"
    ],
    "tip": "[영화 예매 돌발] 실수 환기 ➔ 내일 날짜로 잘못 예매 ➔ 당황 ➔ 티켓 매표소 문의 ➔ 무료 당일 변경 친절 대처 ➔ 안도 마무리."
  },
  {
    "id": "q_music_07",
    "cat": "음악감상",
    "type": "최애 가수/밴드 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Who is your favorite singer, musician, or band? Describe their musical style and tell me why you love listening to them.",
    "q_ko": "가장 좋아하는 가수나 뮤지션, 밴드는 누구인가요? 그들의 음악 스타일을 묘사하고 왜 좋아하는지 말씀해 주세요.",
    "sentences": [
      {
        "en": "Whenever I think of my favorite music, the singer IU comes to mind first.",
        "ko": "가장 좋아하는 음악을 생각하면, 가수 아이유가 가장 먼저 떠올라요."
      },
      {
        "en": "Her voice is very sweet, warm, and beautiful.",
        "ko": "그녀의 목소리는 매우 감미롭고 따뜻하며 아름답습니다."
      },
      {
        "en": "Her acoustic songs have poetic lyrics and gentle guitar melodies.",
        "ko": "그녀의 어쿠스틱 노래들은 시적인 가사와 잔잔한 기타 멜로디를 담고 있어요."
      },
      {
        "en": "When I listen to her music after a hard day, I always feel comforted.",
        "ko": "힘든 하루를 마치고 그녀의 노래를 들으면, 언제나 마음이 위로받는 기분이 듭니다."
      },
      {
        "en": "Her incredible vocal talent always touches my heart deeply.",
        "ko": "그녀의 뛰어난 가창력은 언제나 제 마음을 깊이 울립니다."
      },
      {
        "en": "So, she is my absolute favorite musician of all time.",
        "ko": "그래서, 그녀는 제가 가장 좋아하는 인생 뮤지션이에요."
      }
    ],
    "keywords": [
      "singer IU",
      "sweet warm voice",
      "poetic lyrics and gentle guitar",
      "feel comforted",
      "vocal talent touches heart",
      "favorite musician"
    ],
    "tip": "[좋아하는 가수 묘사] 가수(아이유) 연상 ➔ 음색 특징 ➔ 어쿠스틱/서정적 가사 ➔ 위로와 감동 ➔ 보컬 역량 ➔ 최고 뮤지션 마무리."
  },
  {
    "id": "q_music_08",
    "cat": "음악감상",
    "type": "출퇴근 음악 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "How do you listen to music during your daily commute or while doing housework? Tell me about your routine from start to finish.",
    "q_ko": "출퇴근길이나 집안일을 할 때 주로 음악을 어떻게 들으시나요? 처음부터 끝까지의 일과 루틴을 말씀해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, when I commute to work on weekdays, I usually love to listen to music.",
        "ko": "음, 있잖아요, 평일 출근길이면, 저는 보통 음악 듣는 것을 아주 좋아해요."
      },
      {
        "en": "First, I take out my wireless noise-canceling earbuds from my pocket.",
        "ko": "우선, 주머니에서 노이즈 캔슬링 무선 이어폰을 꺼냅니다."
      },
      {
        "en": "Then, I connect them to my smartphone and turn on Spotify.",
        "ko": "그리고 나서, 스마트폰에 연결하고 스포티파이 앱을 켜요."
      },
      {
        "en": "When I take the crowded subway, I play an energetic pop playlist to wake myself up.",
        "ko": "붐비는 지하철을 탈 때는, 잠을 깨우기 위해 신나는 팝 음악 플레이리스트를 틉니다."
      },
      {
        "en": "After arriving at my station, I put my earbuds back into their charging case.",
        "ko": "도착역에 내린 후에는, 이어폰을 다시 충전 케이스에 넣어요."
      },
      {
        "en": "That is my everyday commuting music routine.",
        "ko": "이게 바로 매일 출퇴근할 때의 저의 음악 루틴이에요."
      }
    ],
    "keywords": [
      "commute to work with music",
      "wireless noise-canceling earbuds",
      "Spotify on smartphone",
      "energetic pop playlist",
      "crowded subway",
      "charging case"
    ],
    "tip": "[출퇴근 음악 루틴] 출근길 음악 ➔ 무선 이어폰 꺼내기 ➔ 스트리밍 앱 연결 ➔ 신나는 팝 음악 ➔ 도착 후 케이스 보관 ➔ 루틴 마무리."
  },
  {
    "id": "q_music_09",
    "cat": "음악감상",
    "type": "이어폰 방전 돌발 대처",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 돌발 상황",
    "pattern_id": "pat_04",
    "q_en": "Tell me about an unexpected problem you experienced while listening to music, such as dead wireless earbuds or connection failure. How did you resolve it?",
    "q_ko": "음악을 듣다가 무선 이어폰 배터리가 방전되거나 연결이 끊기는 등 곤란했던 문제를 겪은 적이 있나요? 어떻게 해결하셨나요?",
    "sentences": [
      {
        "en": "Whenever I think of listening to music, I remember an annoying problem last month.",
        "ko": "음악 듣기를 생각하면, 지난달에 겪었던 난감한 문제가 하나 기억나요."
      },
      {
        "en": "I was getting on the bus for a long ride, and suddenly my wireless earbuds died.",
        "ko": "오랜 시간 버스를 타려고 올라탔는데, 갑자기 무선 이어폰 배터리가 방전되어 꺼졌어요."
      },
      {
        "en": "At first, I was so surprised and frustrated because the bus was very noisy.",
        "ko": "처음에는, 버스 안이 너무 시끄러운데 음악을 못 들어서 몹시 당황스럽고 답답했습니다."
      },
      {
        "en": "So, I quickly took out my portable power bank from my bag and charged the case.",
        "ko": "그래서, 가방에서 휴대용 보조배터리를 재빨리 꺼내 이어폰 케이스를 충전했어요."
      },
      {
        "en": "After ten minutes of fast charging, I was able to enjoy my favorite songs again.",
        "ko": "10분 동안 고속 충전한 뒤, 좋아하는 노래를 다시 즐길 수 있었습니다."
      },
      {
        "en": "Anyway, it was solved well, so I arrived home comfortably.",
        "ko": "어쨌든, 잘 해결되어서 집까지 편안하게 도착할 수 있었어요."
      }
    ],
    "keywords": [
      "problem with music",
      "wireless earbuds died",
      "surprised and frustrated",
      "portable power bank",
      "ten minutes fast charging",
      "solved well"
    ],
    "tip": "[이어폰 방전 돌발] 문제 환기 ➔ 버스에서 배터리 방전 ➔ 답답함/당황 ➔ 보조배터리 고속 충전 대처 ➔ 10분 후 음악 재개 ➔ 안도 마무리."
  },
  {
    "id": "q_exercise_07",
    "cat": "운동하기",
    "type": "헬스 기구/시설 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Please describe the fitness machines and workout facilities you use most often at the gym. What do they look like and how do you use them?",
    "q_ko": "헬스장에서 가장 자주 사용하는 운동 기구와 시설에 대해 설명해 주세요. 어떻게 생겼고 어떻게 사용하시나요?",
    "sentences": [
      {
        "en": "Whenever I think of my fitness center, the modern cardio zone comes to mind first.",
        "ko": "제가 다니는 헬스장을 생각하면, 현대적인 유산소 존이 가장 먼저 떠올라요."
      },
      {
        "en": "The gym is very spacious, well-ventilated, and has rows of advanced treadmills.",
        "ko": "헬스장은 매우 넓고 환기가 잘 되며, 최신 러닝머신들이 줄지어 놓여 있습니다."
      },
      {
        "en": "On each treadmill, there is a large personal TV screen and heart rate sensors.",
        "ko": "러닝머신마다 커다란 개인용 TV 화면과 심박수 측정 센서가 달려 있어요."
      },
      {
        "en": "When I run there, I can watch my favorite YouTube shows while burning calories.",
        "ko": "거기서 뛸 때면, 칼로리를 소모하면서 좋아하는 유튜브 영상을 시청할 수 있습니다."
      },
      {
        "en": "The free weight area next to it is also well-equipped with clean dumbbells.",
        "ko": "그 옆의 프리웨이트 존도 깨끗한 아령들이 아주 잘 갖추어져 있어요."
      },
      {
        "en": "So, I really love working out with these great fitness machines.",
        "ko": "그래서 저는 이렇게 훌륭한 운동 기구들로 운동하는 것을 정말 좋아합니다."
      }
    ],
    "keywords": [
      "modern cardio zone",
      "spacious and well-ventilated",
      "advanced treadmills",
      "personal TV screen",
      "watch YouTube while burning calories",
      "clean dumbbells"
    ],
    "tip": "[헬스 기구 묘사] 유산소 존 연상 ➔ 넓고 쾌적한 시설 ➔ 러닝머신과 TV 스크린 ➔ 유튜브 시청 러닝 ➔ 프리웨이트 아령 ➔ 만족 마무리."
  },
  {
    "id": "q_exercise_08",
    "cat": "운동하기",
    "type": "운동 후 회복 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What is your typical post-workout routine? Describe what you usually do after finishing your exercises from stretching to recovery.",
    "q_ko": "운동을 마친 후 보통 무엇을 하시나요? 스트레칭부터 회복까지의 전형적인 마무리 루틴을 설명해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, after finishing heavy workouts, I usually have a strict recovery routine.",
        "ko": "음, 있잖아요, 강도 높은 운동을 마치고 나면, 저는 보통 철저한 회복 루틴을 지켜요."
      },
      {
        "en": "First, I cool down on the mat and stretch my tight muscles for ten minutes.",
        "ko": "우선, 매트 위에서 쿨다운을 하며 뭉친 근육을 10분 동안 스트레칭합니다."
      },
      {
        "en": "Then, I usually head to the shower room and take a relaxing warm shower.",
        "ko": "그리고 나서, 샤워실로 향해 따뜻한 물로 편안하게 샤워를 해요."
      },
      {
        "en": "When I get dressed, I mix chocolate protein powder with cold water and drink it.",
        "ko": "옷을 갈아입은 뒤에는, 초콜릿 맛 단백질 보충제를 찬물에 타서 마십니다."
      },
      {
        "en": "After that, I come back home and relax on my bed feeling energized.",
        "ko": "그 후에는, 집에 돌아와 활력을 느끼며 침대에서 휴식을 취해요."
      },
      {
        "en": "That is my healthy post-workout recovery routine.",
        "ko": "이게 바로 저의 건강한 운동 후 회복 루틴이에요."
      }
    ],
    "keywords": [
      "strict recovery routine",
      "cool down and stretch",
      "relaxing warm shower",
      "chocolate protein powder",
      "feel energized",
      "healthy routine"
    ],
    "tip": "[운동 후 회복 루틴] 마무리 루틴 서두 ➔ 쿨다운/스트레칭 ➔ 따뜻한 샤워 ➔ 단백질 쉐이크 섭취 ➔ 귀가 후 휴식 ➔ 루틴 마무리."
  },
  {
    "id": "q_exercise_09",
    "cat": "운동하기",
    "type": "운동 목표 달성 경험",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 과거 경험",
    "pattern_id": "pat_03",
    "q_en": "Tell me about a memorable time when you achieved your fitness goal or felt proud of your healthy body. What was the experience like?",
    "q_ko": "운동 목표를 달성했거나 건강해진 몸에 스스로 뿌듯함을 느꼈던 기억에 남는 경험에 대해 말씀해 주세요. 어떤 경험이었나요?",
    "sentences": [
      {
        "en": "Well, let me see... I remember a very proud fitness achievement last year.",
        "ko": "음, 어디 보자... 작년에 운동하면서 정말 뿌듯했던 성취 경험이 기억나요."
      },
      {
        "en": "I exercised four times a week for three months to lose body fat and build stamina.",
        "ko": "체지방을 줄이고 체력을 기르기 위해 3달 동안 매주 4번씩 꾸준히 운동했습니다."
      },
      {
        "en": "Actually, the daily workouts were tough, but my energy level improved tremendously.",
        "ko": "실제로, 매일 운동하는 건 힘들었지만 제 활력과 에너지가 엄청나게 좋아졌어요."
      },
      {
        "en": "When I weighed myself, I lost five kilograms and my clothes fit perfectly.",
        "ko": "몸무게를 재어보니 5kg이 빠져 있었고, 입던 옷들이 완벽하게 잘 맞았습니다."
      },
      {
        "en": "It was the most rewarding and confidence-boosting day for me.",
        "ko": "저에게 가장 보람차고 큰 자신감을 주었던 날이었어요."
      },
      {
        "en": "So, it motivated me to keep exercising regularly every single week.",
        "ko": "그래서, 그 경험은 제가 매주 규칙적으로 운동을 지속할 수 있는 큰 동기가 되었습니다."
      }
    ],
    "keywords": [
      "proud fitness achievement",
      "exercised four times a week",
      "tough workouts",
      "lost five kilograms clothes fit perfectly",
      "rewarding and confidence-boosting",
      "keep exercising"
    ],
    "tip": "[운동 성취 경험] 성취 경험 환기 ➔ 3개월 주4회 운동 ➔ 체력 향상 ➔ 5kg 감량/옷 핏 ➔ 자신감 상승 ➔ 평생 운동 동기부여 마무리."
  },
  {
    "id": "q_cook_07",
    "cat": "요리하기",
    "type": "자신 있는 요리 레시피 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Please describe your signature dish that you can cook best. What ingredients are used, and what does it taste like?",
    "q_ko": "가장 자신 있게 요리할 수 있는 시그니처 요리에 대해 설명해 주세요. 어떤 재료가 들어가고 어떤 맛인가요?",
    "sentences": [
      {
        "en": "Whenever I think of my cooking, my signature dish, kimchi fried rice, comes to mind.",
        "ko": "제가 하는 요리를 생각하면, 저의 시그니처 요리인 김치볶음밥이 가장 먼저 떠올라요."
      },
      {
        "en": "It is very simple to make, but the taste is incredibly delicious and spicy.",
        "ko": "만들기는 아주 간단하지만, 그 맛은 정말 매콤하고 기가 막히게 맛있습니다."
      },
      {
        "en": "The main ingredients are spicy kimchi, white rice, canned tuna, and green onions.",
        "ko": "주요 재료는 매콤한 김치와 밥, 참치캔, 그리고 대파입니다."
      },
      {
        "en": "When I cook it, I always put a sunny-side-up fried egg and sesame oil on top.",
        "ko": "요리할 때, 저는 항상 반숙 계란후라이와 고소한 참기름을 위에 얹어요."
      },
      {
        "en": "The crispy texture and savory aroma always make my mouth water.",
        "ko": "바삭한 밥 식감과 고소한 풍미는 언제나 군침이 돌게 만듭니다."
      },
      {
        "en": "So, it is my absolute favorite comfort food to cook at home.",
        "ko": "그래서, 김치볶음밥은 집에서 제가 가장 사랑하는 소울푸드 요리예요."
      }
    ],
    "keywords": [
      "signature dish kimchi fried rice",
      "delicious and spicy",
      "canned tuna and green onions",
      "fried egg and sesame oil",
      "crispy texture savory aroma",
      "comfort food"
    ],
    "tip": "[자신 있는 요리 묘사] 김치볶음밥 환기 ➔ 맛의 매력 ➔ 핵심 식재료 ➔ 계란후라이/참기름 토핑 ➔ 고소한 향미 ➔ 소울푸드 마무리."
  },
  {
    "id": "q_cook_08",
    "cat": "요리하기",
    "type": "주말 홈쿠킹 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What is your typical cooking routine on weekends when you prepare a homemade meal? Describe the steps from start to finish.",
    "q_ko": "주말에 집에서 직접 요리해 먹을 때 보통 무엇을 하시나요? 처음부터 끝까지의 요리 루틴을 설명해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, when I stay home on Sundays, I usually love to cook lunch for myself.",
        "ko": "음, 있잖아, 일요일에 집에 머무르면, 저는 보통 스스로를 위해 점심 요리하는 걸 정말 좋아해요."
      },
      {
        "en": "First, I check my refrigerator and wash fresh vegetables with cold water.",
        "ko": "우선, 냉장고 재료를 확인하고 신선한 채소를 차가운 물로 씻습니다."
      },
      {
        "en": "Then, I usually chop onions and garlic on the cutting board, listening to the radio.",
        "ko": "그리고 나서, 라디오를 들으며 도마 위에서 양파와 마늘을 썰어요."
      },
      {
        "en": "When the pan is hot, I stir-fry the ingredients and season them with soy sauce.",
        "ko": "팬이 달궈지면, 재료들을 볶고 간장과 소금으로 알맞게 간을 맞춥니다."
      },
      {
        "en": "After eating, I immediately wash the dishes and wipe the kitchen counter clean.",
        "ko": "식사 후에는, 즉시 설거지를 하고 싱크대 상판을 깨끗하게 닦아요."
      },
      {
        "en": "That is my tidy and enjoyable cooking routine at home.",
        "ko": "이게 바로 집에서의 저의 깔끔하고 즐거운 요리 일과 루틴이에요."
      }
    ],
    "keywords": [
      "cook lunch on Sunday",
      "wash fresh vegetables",
      "chop onions on cutting board",
      "stir-fry with soy sauce",
      "wash dishes and wipe counter",
      "enjoyable cooking routine"
    ],
    "tip": "[주말 요리 루틴] 일요일 점심 요리 ➔ 재료 손질/세척 ➔ 도마 칼질/음악 ➔ 볶음 및 양념 ➔ 설거지/뒷정리 ➔ 루틴 마무리."
  },
  {
    "id": "q_cook_09",
    "cat": "요리하기",
    "type": "홈파티 요리 대접 경험",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 과거 경험",
    "pattern_id": "pat_03",
    "q_en": "Tell me about a memorable time when you invited friends or family over to your house and cooked a meal for them. How did they react?",
    "q_ko": "친구나 가족을 집에 초대해 직접 요리를 만들어 대접했던 기억에 남는 경험에 대해 말씀해 주세요. 반응이 어땠나요?",
    "sentences": [
      {
        "en": "Well, let me see... I remember a very memorable dinner party at my home.",
        "ko": "음, 어디 보자... 저희 집에서 열었던 아주 기억에 남는 저녁 모임이 떠올라요."
      },
      {
        "en": "Last month, I invited my close coworkers over for a housewarming dinner.",
        "ko": "지난달에, 저는 친한 직장 동료들을 집들이 저녁 식사에 초대했습니다."
      },
      {
        "en": "Actually, I cooked spicy chicken stew and seafood pancakes for them.",
        "ko": "실제로, 저는 그들을 위해 매콤한 닭볶음탕과 해물파전을 직접 요리했어요."
      },
      {
        "en": "Everyone loved the food, ate everything, and complimented my cooking skills.",
        "ko": "모두가 음식을 너무 좋아했고, 남김없이 다 먹으며 제 요리 솜씨를 칭찬했습니다."
      },
      {
        "en": "It was the most rewarding and joyful evening for me.",
        "ko": "저에게는 더없이 뿌듯하고 큰 기쁨을 주었던 저녁이었어요."
      },
      {
        "en": "So, it became a wonderful memory with my good friends.",
        "ko": "그래서, 좋은 동료들과 함께한 멋진 추억이 되었습니다."
      }
    ],
    "keywords": [
      "memorable dinner party",
      "housewarming dinner",
      "spicy chicken stew and seafood pancake",
      "complimented cooking skills",
      "rewarding and joyful",
      "wonderful memory"
    ],
    "tip": "[요리 대접 경험] 홈파티 환기 ➔ 동료 집들이 초대 ➔ 닭볶음탕과 해물파전 ➔ 폭풍 칭찬 반응 ➔ 보람찬 감정 ➔ 소중한 추억 마무리."
  },
  {
    "id": "q_trip_07",
    "cat": "국내여행",
    "type": "여행지 향토 맛집 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Please describe the most delicious local food or restaurant you discovered during your domestic trip. What was it like?",
    "q_ko": "국내 여행 중 발견했던 가장 맛있는 지역 향토 음식이나 맛집에 대해 설명해 주세요. 어떤 곳이었나요?",
    "sentences": [
      {
        "en": "Whenever I think of domestic travel, a famous seafood restaurant in Busan comes to mind first.",
        "ko": "국내 여행을 생각하면, 부산의 유명한 해산물 맛집이 가장 먼저 떠올라요."
      },
      {
        "en": "The restaurant is located right in front of Haeundae Beach with an open ocean view.",
        "ko": "그 식당은 해운대 해변 바로 앞에 위치해 있어서 탁 트인 바다 전망을 자랑합니다."
      },
      {
        "en": "They serve incredibly fresh raw fish, spicy fish stew, and various side dishes.",
        "ko": "믿을 수 없을 정도로 신선한 활어회와 얼큰한 매운탕, 다양한 밑반찬을 제공해요."
      },
      {
        "en": "When I tasted the grilled clams, the flavor was so rich, savory, and amazing.",
        "ko": "조개구이를 맛보았을 때, 그 풍미는 매우 깊고 고소하며 환상적이었습니다."
      },
      {
        "en": "The owners were very generous and welcoming to travelers.",
        "ko": "식당 사장님들도 여행객들에게 인심이 아주 후하고 친절하셨어요."
      },
      {
        "en": "So, it was the best dining experience of my entire trip.",
        "ko": "그래서, 그곳은 제 여행 통틀어 최고의 미식 경험이었습니다."
      }
    ],
    "keywords": [
      "seafood restaurant in Busan",
      "Haeundae Beach ocean view",
      "fresh raw fish spicy stew",
      "grilled clams flavor",
      "generous owners",
      "best dining experience"
    ],
    "tip": "[여행지 맛집 묘사] 부산 횟집 환기 ➔ 해운대 오션뷰 ➔ 신선한 회와 매운탕 ➔ 조개구이 풍미 ➔ 친절한 인심 ➔ 최고 식도락 마무리."
  },
  {
    "id": "q_trip_08",
    "cat": "국내여행",
    "type": "여행 마지막 날 출발 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What do you usually do on the last day of your trip after checking out of your hotel? Describe your departure routine.",
    "q_ko": "여행 마지막 날 호텔에서 체크아웃한 후 보통 무엇을 하시나요? 집으로 돌아오기까지의 일정 루틴을 설명해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, on the final day of a trip, I usually follow a relaxing departure routine.",
        "ko": "음, 있잖아, 여행의 마지막 날이면, 저는 보통 여유로운 출발 루틴을 따릅니다."
      },
      {
        "en": "First, I pack my suitcase carefully and check out of the hotel around eleven.",
        "ko": "우선, 여행 가방을 꼼꼼히 정리하고 11시쯤 호텔에서 체크아웃을 해요."
      },
      {
        "en": "Then, I usually stop by a local bakery to buy souvenir pastries for my family.",
        "ko": "그리고 나서, 가족들에게 줄 기념 빵을 사기 위해 동네 유명 베이커리에 들릅니다."
      },
      {
        "en": "After buying gifts, I sit at a nice view cafe to drink coffee and look at photos.",
        "ko": "선물을 산 후에는, 전망 좋은 카페에 앉아 커피를 마시며 찍은 사진들을 둘러봐요."
      },
      {
        "en": "After that, I drive to the train station or airport to head back home.",
        "ko": "그 후에는, 집으로 돌아가기 위해 기차역이나 공항으로 향합니다."
      },
      {
        "en": "That is my typical last-day routine on every domestic trip.",
        "ko": "이게 바로 국내 여행 갈 때마다 제가 하는 전형적인 마지막 날 루틴이에요."
      }
    ],
    "keywords": [
      "final day of trip",
      "pack suitcase check out at eleven",
      "local bakery souvenir pastries",
      "cafe to look at photos",
      "head back home",
      "last-day routine"
    ],
    "tip": "[여행 마지막 날 루틴] 마지막 날 서두 ➔ 짐 정리 및 11시 체크아웃 ➔ 지역 특산 빵 구매 ➔ 뷰 카페에서 사진 정리 ➔ 기차역/공항 이동 ➔ 루틴 마무리."
  },
  {
    "id": "q_trip_09",
    "cat": "국내여행",
    "type": "어릴 적 vs 현재 여행 비교",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 과거 vs 현재 변화",
    "pattern_id": "pat_05",
    "q_en": "How has your travel style changed compared to when you were young? Compare family vacations in the past with trips you take nowadays.",
    "q_ko": "어릴 적과 비교하여 본인의 여행 스타일이 어떻게 변했나요? 과거 부모님과의 가족 여행과 요즘의 여행을 비교해 주세요.",
    "sentences": [
      {
        "en": "Compared to the past, my travel style has changed tremendously.",
        "ko": "과거와 비교하여, 저의 여행 스타일은 엄청나게 변했습니다."
      },
      {
        "en": "In the past, when I was young, I just followed my parents without planning anything.",
        "ko": "예전 어릴 적에는, 아무 계획도 직접 세우지 않고 그저 부모님을 따라다니기만 했어요."
      },
      {
        "en": "However, nowadays, I plan my own itinerary, find trendy cafes, and book hotels online.",
        "ko": "하지만 요즘에는, 직접 일정을 계획하고 핫플 카페를 찾으며 온라인으로 숙소를 예약합니다."
      },
      {
        "en": "For example, I can use smartphone travel apps anytime to book tickets and find GPS directions.",
        "ko": "예를 들어, 스마트폰 여행 앱으로 언제든 기차표를 예매하고 GPS 길찾기를 이용할 수 있어요."
      },
      {
        "en": "It gives me much more freedom and makes my trips so much more enjoyable.",
        "ko": "이는 훨씬 더 많은 자유를 주고 제 여행을 몇 배나 더 즐겁게 만들어 줍니다."
      },
      {
        "en": "I am very satisfied with this independent and flexible way of traveling.",
        "ko": "저는 이처럼 독립적이고 유연한 여행 방식에 매우 만족하고 있습니다."
      }
    ],
    "keywords": [
      "travel style changed tremendously",
      "followed parents in the past",
      "plan own itinerary nowadays",
      "smartphone travel apps and GPS",
      "freedom and enjoyable",
      "independent and flexible"
    ],
    "tip": "[여행 스타일 비교] 변화 선언 ➔ 어릴 적 수동적 가족 여행 ➔ 현재 주도적 자유 여행 ➔ 스마트폰 앱/예약 활용 ➔ 자유로움과 재미 ➔ 독립적 만족 마무리."
  },
  {
    "id": "q_camp_07",
    "cat": "캠핑하기",
    "type": "텐트 내부/아늑한 공간 묘사",
    "combo_set": 3,
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사",
    "pattern_id": "pat_01",
    "q_en": "Please describe the inside of your camping tent and resting setup. How do you make your camping space cozy and comfortable?",
    "q_ko": "캠핑 텐트 내부와 휴식 공간에 대해 설명해 주세요. 텐트 안을 어떻게 아늑하고 편안하게 꾸미시나요?",
    "sentences": [
      {
        "en": "Whenever I think of camping, my cozy tent shelter comes to mind first.",
        "ko": "캠핑을 생각하면, 저의 아늑한 텐트 쉼터가 가장 먼저 떠올라요."
      },
      {
        "en": "The inside of my tent is very spacious, warm, and comfortable.",
        "ko": "제 텐트 내부는 매우 널찍하고 따뜻하며 편안합니다."
      },
      {
        "en": "On the floor, I spread a thick air mat, soft sleeping bags, and warm blankets.",
        "ko": "바닥에는 두툼한 에어매트와 푹신한 침낭, 따뜻한 담요를 깔아 두어요."
      },
      {
        "en": "When evening comes, I hang small LED camping lanterns to create a romantic vibe.",
        "ko": "저녁이 되면, 작은 LED 캠핑 감성 조명을 걸어 로맨틱한 분위기를 연출합니다."
      },
      {
        "en": "Lying inside and listening to the sound of wind is so peaceful.",
        "ko": "텐트 안에 누워 바람 소리를 듣고 있으면 마음이 참 평화로워져요."
      },
      {
        "en": "So, it is my favorite private bedroom in the middle of nature.",
        "ko": "그래서, 텐트는 자연 한가운데 있는 저의 가장 소중한 개인 침실입니다."
      }
    ],
    "keywords": [
      "cozy tent shelter",
      "spacious warm and comfortable",
      "thick air mat and sleeping bag",
      "LED camping lanterns",
      "sound of wind",
      "private bedroom in nature"
    ],
    "tip": "[텐트 내부 묘사] 텐트 안 연상 ➔ 공간감과 보온 ➔ 에어매트/침낭 ➔ LED 감성 조명 ➔ 바람 소리 힐링 ➔ 자연 속 침실 마무리."
  },
  {
    "id": "q_camp_08",
    "cat": "캠핑하기",
    "type": "캠핑장 아침 루틴",
    "combo_set": 3,
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동",
    "pattern_id": "pat_02",
    "q_en": "What is your morning routine at a campsite? Describe what you usually do from waking up to cleaning up your gear.",
    "q_ko": "캠핑장에서의 아침 루틴은 어떤가요? 기상해서 장비를 정리할 때까지의 일과를 단계별로 말씀해 주세요.",
    "sentences": [
      {
        "en": "Well, you know, morning at a campsite is always so fresh and quiet.",
        "ko": "음, 있잖아, 캠핑장에서의 아침은 언제나 참 상쾌하고 고요해요."
      },
      {
        "en": "First, I unzip my tent, breathe in the crisp morning air, and stretch.",
        "ko": "우선, 텐트 지퍼를 열고 상쾌한 아침 공기를 마시며 기지개를 켭니다."
      },
      {
        "en": "Then, I usually boil water with my small camping burner and brew drip coffee.",
        "ko": "그리고 나서, 작은 캠핑 버너로 물을 끓여 따뜻한 드립 커피를 내려요."
      },
      {
        "en": "Sitting on my folding chair, I drink hot coffee and eat a simple sandwich.",
        "ko": "캠핑 의자에 앉아, 뜨거운 모닝커피를 마시며 간단한 샌드위치를 먹습니다."
      },
      {
        "en": "After breakfast, I fold my tent, pack my camping gear into the car trunk.",
        "ko": "아침을 먹은 뒤에는, 텐트를 접고 캠핑 장비를 차 트렁크에 정리해 실어요."
      },
      {
        "en": "That is my refreshing morning routine on every camping trip.",
        "ko": "이게 바로 캠핑 갈 때마다 제가 즐기는 상쾌한 아침 루틴이에요."
      }
    ],
    "keywords": [
      "fresh morning at campsite",
      "crisp morning air",
      "boil water brew drip coffee",
      "folding chair hot coffee",
      "fold tent pack camping gear",
      "refreshing routine"
    ],
    "tip": "[캠핑 아침 루틴] 아침 공기 ➔ 기상/스트레칭 ➔ 버너로 드립 커피 끓이기 ➔ 의자에 앉아 모닝커피/샌드위치 ➔ 텐트 철거 및 짐 싣기 ➔ 루틴 마무리."
  },
  {
    "id": "q_camp_09",
    "cat": "캠핑하기",
    "type": "캠핑 장비 분실/돌발 대처",
    "combo_set": 3,
    "combo_step": 3,
    "combo_role": "3단계: 돌발 상황",
    "pattern_id": "pat_04",
    "q_en": "Have you ever experienced an unexpected problem while camping, such as forgetting essential equipment or bad weather? How did you solve it?",
    "q_ko": "캠핑 중 필수 장비를 깜빡했거나 날씨 문제 등 예상치 못한 돌발 상황을 겪은 적이 있나요? 어떻게 해결하셨나요?",
    "sentences": [
      {
        "en": "Whenever I think of camping, I remember a big problem I had last autumn.",
        "ko": "캠핑을 생각하면, 지난가을에 겪었던 큰 곤경이 하나 기억나요."
      },
      {
        "en": "I arrived at the campsite, pitched my tent, and suddenly realized I forgot my camping stove.",
        "ko": "캠핑장에 도착해 텐트를 쳤는데, 갑자기 버너를 집에 두고 왔다는 걸 깨달았어요."
      },
      {
        "en": "At first, I was so surprised, hungry, and worried about cooking dinner.",
        "ko": "처음에는, 너무 놀라고 배도 고팠으며 저녁을 어떻게 해먹을지 막막했습니다."
      },
      {
        "en": "So, I quickly went to the campsite manager's office and asked for help.",
        "ko": "그래서, 재빨리 캠핑장 관리사무소로 가서 도움을 요청드렸어요."
      },
      {
        "en": "Fortunately, the kind manager lent me a portable gas burner with a smile.",
        "ko": "다행히도, 친절한 관리인 분께서 미소와 함께 휴대용 부르스타를 빌려주셨습니다."
      },
      {
        "en": "Anyway, it was solved well, so we grilled delicious barbecue.",
        "ko": "어쨌든, 일이 잘 해결되어서 맛있는 바비큐 고기를 무사히 구워 먹었습니다."
      }
    ],
    "keywords": [
      "problem while camping",
      "forgot camping stove",
      "surprised and hungry",
      "campsite manager's office",
      "lent portable gas burner",
      "solved well grilled barbecue"
    ],
    "tip": "[캠핑 돌발 대처] 문제 환기 ➔ 버너 깜빡함 ➔ 배고픔/당황 ➔ 관리사무소 문의 ➔ 친절한 관리인 버너 대여 ➔ 고기 파티 성공 마무리."
  },
  {
    "id": "q_rp_10",
    "cat": "롤플레이",
    "type": "가게 상품 문의 (11번)",
    "combo_set": 4,
    "combo_step": 1,
    "combo_role": "11번: 질문 3~4가지 (문의)",
    "pattern_id": "pat_06",
    "q_en": "I'd like to give you a situation and ask you to act it out. You want to buy a new winter jacket at a clothing store. Call the store and ask three or four questions about size, colors, price, and business hours.",
    "q_ko": "상황을 하나 드릴 테니 연기해 보세요. 옷가게에서 새 겨울 패딩을 사려고 합니다. 매장에 전화해 사이즈, 색상, 가격, 영업시간 등에 대해 3~4가지 질문을 해보세요.",
    "sentences": [
      {
        "en": "Hi, I'm calling to ask about the new winter jacket on your website.",
        "ko": "안녕하세요, 웹사이트에 올라온 신상 겨울 패딩에 대해 문의하려고 전화드렸어요."
      },
      {
        "en": "First, do you have size large in black available at your store right now?",
        "ko": "먼저, 지금 매장에 블랙 색상 라지 사이즈 재고가 있나요?"
      },
      {
        "en": "And what are your store opening hours today?",
        "ko": "그리고 오늘 매장 마감 및 영업시간은 어떻게 되나요?"
      },
      {
        "en": "Also, how much is the jacket, and do you have any member discounts?",
        "ko": "또한, 패딩 가격은 얼마이고 회원 할인이 적용되나요?"
      },
      {
        "en": "By the way, is parking free for store customers?",
        "ko": "그런데 매장 방문 고객은 주차가 무료인가요?"
      },
      {
        "en": "Thank you so much for your help. Have a nice day!",
        "ko": "도와주셔서 정말 감사합니다. 좋은 하루 보내세요!"
      }
    ],
    "keywords": [
      "winter jacket",
      "size large in black",
      "store opening hours",
      "price and member discounts",
      "parking free for customers"
    ],
    "tip": "[11번 옷가게 문의] 인사/용건 ➔ 재고/사이즈(Size/Black) ➔ 영업시간(Hours) ➔ 가격/할인(Price/Discount) ➔ 무료 주차(Parking) ➔ 감사 마무리."
  },
  {
    "id": "q_rp_11",
    "cat": "롤플레이",
    "type": "하자 제품 교환/환불 (12번)",
    "combo_set": 4,
    "combo_step": 2,
    "combo_role": "12번: 대안 제시 (문제 해결)",
    "pattern_id": "pat_06",
    "q_en": "I'm sorry, but there is a problem you need to resolve. The jacket you bought yesterday has a broken zipper and a stain. Call the store, explain the problem, and suggest two alternatives.",
    "q_ko": "죄송하지만 해결해야 할 문제가 생겼습니다. 어제 매장에서 산 패딩의 지퍼가 고장 나 있고 얼룩이 묻어 있습니다. 매장에 전화해 문제를 설명하고 대안 2가지를 제시해 보세요.",
    "sentences": [
      {
        "en": "Hello, I bought this winter jacket yesterday, but there is a problem.",
        "ko": "안녕하세요, 어제 여기서 이 겨울 패딩을 구매했는데 문제가 좀 있어서요."
      },
      {
        "en": "When I checked it at home, the zipper was broken and there was a big stain on the sleeve.",
        "ko": "집에 와서 확인해 보니 지퍼가 고장 나 있고 소매에 큰 얼룩이 묻어 있더라고요."
      },
      {
        "en": "I was very surprised and upset about this.",
        "ko": "새 상품인데 이런 하자가 있어서 너무 놀라고 속상했습니다."
      },
      {
        "en": "I have the receipt, so can I exchange it for a new jacket in the same size?",
        "ko": "영수증을 가지고 있는데, 동일한 사이즈의 새 제품으로 교환할 수 있을까요?"
      },
      {
        "en": "If that is not in stock, can I get a full refund to my credit card?",
        "ko": "만약 재고가 없다면, 신용카드로 결제했던 금액을 전액 환불받을 수 있을까요?"
      },
      {
        "en": "Thank you so much for your help. Have a nice day!",
        "ko": "도와주셔서 정말 감사합니다. 좋은 하루 보내세요!"
      }
    ],
    "keywords": [
      "bought winter jacket yesterday",
      "zipper broken and stain",
      "surprised and upset",
      "receipt exchange for new one",
      "full refund to credit card"
    ],
    "tip": "[12번 하자 교환/환불 대안] 구매 언급 및 문제 제기 ➔ 하자 구체적 설명(지퍼 고장/얼룩) ➔ 당황/유감 표현 ➔ 대안1: 새 제품 교환 ➔ 대안2: 전액 환불 ➔ 감사 마무리."
  },
  {
    "id": "q_rp_12",
    "cat": "롤플레이",
    "type": "과거 교환/환불 경험 (13번)",
    "combo_set": 4,
    "combo_step": 3,
    "combo_role": "13번: 과거 유사 경험",
    "pattern_id": "pat_04",
    "q_en": "Similar to the situation, have you ever experienced a problem when buying or returning an item at a store? Tell me what happened, what the problem was, and how you resolved it.",
    "q_ko": "이전 상황과 유사하게, 매장에서 물건을 사거나 교환/환불하면서 예상치 못한 문제를 겪은 적이 있나요? 무슨 일이었고 어떻게 해결하셨나요?",
    "sentences": [
      {
        "en": "Whenever I think of shopping, I remember a big problem I had last winter.",
        "ko": "쇼핑을 생각할 때마다, 지난겨울에 겪었던 큰 문제가 하나 기억나요."
      },
      {
        "en": "I bought a pair of running shoes, and when I wore them, the sole came off completely.",
        "ko": "러닝화를 새로 샀는데, 신고 나갔더니 밑창이 완전히 뜯어져 버렸어요."
      },
      {
        "en": "At first, I was so surprised and frustrated because they were brand new.",
        "ko": "처음에는 새로 산 신발인데 밑창이 떨어져 너무 황당하고 답답했습니다."
      },
      {
        "en": "So, I quickly took the shoes and receipt back to the store and explained the defect.",
        "ko": "그래서, 즉시 신발과 영수증을 챙겨 매장으로 돌아가 불량 상태를 설명했어요."
      },
      {
        "en": "Fortunately, the kind store manager apologized and gave me a full refund immediately.",
        "ko": "다행히도, 친절한 매니저님께서 정중히 사과하시며 곧바로 전액 환불을 진행해 주셨습니다."
      },
      {
        "en": "Anyway, it was solved well, so everything was okay.",
        "ko": "어쨌든, 처리가 잘 되어서, 다 괜찮았습니다."
      }
    ],
    "keywords": [
      "problem with shopping",
      "running shoes sole came off",
      "surprised and frustrated",
      "took shoes and receipt back",
      "store manager gave full refund",
      "solved well"
    ],
    "tip": "[13번 과거 교환/환불 경험] 쇼핑 문제 환기 ➔ 신발 밑창 뜯어짐 ➔ 황당/불쾌 ➔ 영수증 지참 매장 방문 설명 ➔ 매니저 사과 및 즉시 전액 환불 ➔ 안도 마무리."
  }
];

// -----------------------------------------------------------------------------
// [단일 진실 공급원 무결성 보장] sentences 배열로부터 answer_en, answer_ko 자동 합성
// -----------------------------------------------------------------------------
window.QUESTIONS_DATA.forEach((q) => {
  if (Array.isArray(q.sentences) && q.sentences.length > 0) {
    q.answer_en = q.sentences.map((s) => s.en).join(" ");
    q.answer_ko = q.sentences.map((s) => s.ko).join(" ");
  }
});
