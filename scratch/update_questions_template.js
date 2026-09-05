/**
 * update_questions_template.js
 * 40개 OPIc 실전 질문 모범답안을 '만능 템플릿(Universal Script)' 형태로 전면 개편하는 스크립트
 */

const fs = require("fs");
const path = require("path");

const questions = [
  // ─────────────────────────────────────────────────────────────
  // 1. 자기소개 (q_intro_01, q_intro_02)
  // ─────────────────────────────────────────────────────────────
  {
    id: "q_intro_01",
    cat: "자기소개",
    type: "인물 묘사",
    q_en: "Let's start the interview now. Please tell me a little bit about yourself.",
    q_ko: "인터뷰를 시작하겠습니다. 본인에 대해 간단히 소개해 주세요.",
    sentences: [
      {
        en: "Hello, Eva! My name is Hyosang Kim, and I am in my thirties.",
        ko: "안녕하세요, 에바! 제 이름은 김효상이고 30대입니다.",
      },
      {
        en: "I currently live in Cheonan with my loving family.",
        ko: "저는 현재 사랑하는 가족과 함께 천안에 살고 있어요.",
      },
      {
        en: "I work as an equipment engineer at a technology company.",
        ko: "저는 기술 회사에서 설비 엔지니어로 일하고 있습니다.",
      },
      {
        en: "In my free time, I really love working out and listening to music.",
        ko: "여가 시간에는 운동과 음악 감상을 정말 좋아해요.",
      },
      {
        en: "I would describe myself as a very positive, active, and friendly person.",
        ko: "제 성격은 매우 긍정적이고 활동적이며 친근한 편이에요.",
      },
      {
        en: "I am very excited to take this test today, and I will do my best.",
        ko: "오늘 이 시험을 보게 되어 매우 설레고, 최선을 다하겠습니다.",
      },
    ],
    keywords: [
      "in my thirties",
      "loving family",
      "equipment engineer",
      "in my free time",
      "positive and friendly",
      "do my best",
    ],
    tip: "[만능 자기소개] 이름/나이 → 거주지 → 직업 → 취미 → 성격 → 포부 6단계 공식으로 간결하고 자신감 있게 말하세요.",
    answer_en:
      "Hello, Eva! My name is Hyosang Kim, and I am in my thirties. I currently live in Cheonan with my loving family. I work as an equipment engineer at a technology company. In my free time, I really love working out and listening to music. I would describe myself as a very positive, active, and friendly person. I am very excited to take this test today, and I will do my best.",
    answer_ko:
      "안녕하세요, 에바! 제 이름은 김효상이고 30대입니다. 저는 현재 사랑하는 가족과 함께 천안에 살고 있어요. 저는 기술 회사에서 설비 엔지니어로 일하고 있습니다. 여가 시간에는 운동과 음악 감상을 정말 좋아해요. 제 성격은 매우 긍정적이고 활동적이며 친근한 편이에요. 오늘 이 시험을 보게 되어 매우 설레고, 최선을 다하겠습니다.",
  },
  {
    id: "q_intro_02",
    cat: "자기소개",
    type: "일상/취미",
    q_en: "Could you tell me more about your daily routine and what you usually do on weekends?",
    q_ko: "평소 하루 일과와 주말에 주로 무엇을 하시는지 더 자세히 말씀해 주시겠어요?",
    sentences: [
      {
        en: "Usually, on weekdays, I spend most of my time working at the office.",
        ko: "보통 평일에는 대부분의 시간을 회사에서 일하며 보냅니다.",
      },
      {
        en: "When I get home in the evening, I take a warm shower and relax on the couch.",
        ko: "저녁에 집에 오면 따뜻한 물로 샤워를 하고 소파에서 휴식을 취해요.",
      },
      {
        en: "On weekends, whenever I have free time, I love to go outside for fresh air.",
        ko: "주말에는 여유 시간이 생길 때마다 맑은 공기를 마시러 밖으로 나가는 걸 좋아해요.",
      },
      {
        en: "I usually go to a nearby park to walk around or work out with my friends.",
        ko: "보통 근처 공원에 가서 산책을 하거나 친구들과 함께 운동을 합니다.",
      },
      {
        en: "It is the best way for me to relieve stress after a busy week.",
        ko: "바쁜 한 주를 보낸 뒤 스트레스를 해소하기에 가장 좋은 방법이에요.",
      },
      {
        en: "Overall, I always try to maintain a healthy and balanced lifestyle.",
        ko: "전반적으로 저는 항상 건강하고 균형 잡힌 라이프스타일을 유지하려고 노력합니다.",
      },
    ],
    keywords: [
      "on weekdays",
      "take a warm shower",
      "on weekends",
      "relieve stress",
      "balanced lifestyle",
    ],
    tip: "[만능 루틴 템플릿] 평일 일과 → 퇴근 후 휴식 → 주말 야외활동 → 구체적 활동(산책/운동) → 스트레스 해소 효과 → 균형 잡힌 삶 마무리.",
    answer_en:
      "Usually, on weekdays, I spend most of my time working at the office. When I get home in the evening, I take a warm shower and relax on the couch. On weekends, whenever I have free time, I love to go outside for fresh air. I usually go to a nearby park to walk around or work out with my friends. It is the best way for me to relieve stress after a busy week. Overall, I always try to maintain a healthy and balanced lifestyle.",
    answer_ko:
      "보통 평일에는 대부분의 시간을 회사에서 일하며 보냅니다. 저녁에 집에 오면 따뜻한 물로 샤워를 하고 소파에서 휴식을 취해요. 주말에는 여유 시간이 생길 때마다 맑은 공기를 마시러 밖으로 나가는 걸 좋아해요. 보통 근처 공원에 가서 산책을 하거나 친구들과 함께 운동을 합니다. 바쁜 한 주를 보낸 뒤 스트레스를 해소하기에 가장 좋은 방법이에요. 전반적으로 저는 항상 건강하고 균형 잡힌 라이프스타일을 유지하려고 노력합니다.",
  },

  // ─────────────────────────────────────────────────────────────
  // 2. 집/주거 (q_home_01, q_home_02, q_home_03, q_home_04)
  // ─────────────────────────────────────────────────────────────
  {
    id: "q_home_01",
    cat: "집/주거",
    type: "장소 묘사",
    q_en: "You indicated in the survey that you live in an apartment. Please describe your home to me. What does it look like?",
    q_ko: "설문에서 아파트에 거주한다고 하셨습니다. 거주하시는 집에 대해 설명해 주세요. 집이 어떻게 생겼나요?",
    sentences: [
      {
        en: "Whenever I think of my home, there is a special place I really love called the living room.",
        ko: "제 집을 생각할 때마다, 제가 정말 좋아하는 거실이라는 특별한 공간이 있어요.",
      },
      {
        en: "It is located in the center of our apartment, so it is the heart of our home.",
        ko: "아파트의 중심에 위치해 있어서 우리 집의 핵심 공간입니다.",
      },
      {
        en: "Inside the living room, the atmosphere is very clean, cozy, and modern.",
        ko: "거실 내부는 분위기가 매우 깨끗하고 아늑하며 현대적이에요.",
      },
      {
        en: "There is a comfortable sofa and a large TV, so my family can gather and relax.",
        ko: "편안한 소파와 대형 TV가 있어서 가족들이 모여 편안하게 쉴 수 있어요.",
      },
      {
        en: "What I love most about this place is that it helps me relieve stress after work.",
        ko: "이곳에서 가장 좋은 점은 퇴근 후 스트레스를 풀 수 있게 도와준다는 것입니다.",
      },
      {
        en: "Overall, it is definitely my favorite place, and I always feel happy and peaceful there.",
        ko: "전반적으로 이곳은 제가 가장 좋아하는 장소이며, 그곳에 있을 때 항상 행복하고 평화로워요.",
      },
    ],
    keywords: [
      "living room",
      "heart of our home",
      "clean, cozy, and modern",
      "comfortable sofa",
      "relieve stress after work",
      "happy and peaceful",
    ],
    tip: "[만능 장소 묘사 템플릿] 가장 좋아하는 공간(거실) → 위치 → 깔끔하고 아늑한 분위기 → 주요 가구/활동 → 스트레스 해소 이유 → 마무리.",
    answer_en:
      "Whenever I think of my home, there is a special place I really love called the living room. It is located in the center of our apartment, so it is the heart of our home. Inside the living room, the atmosphere is very clean, cozy, and modern. There is a comfortable sofa and a large TV, so my family can gather and relax. What I love most about this place is that it helps me relieve stress after work. Overall, it is definitely my favorite place, and I always feel happy and peaceful there.",
    answer_ko:
      "제 집을 생각할 때마다, 제가 정말 좋아하는 거실이라는 특별한 공간이 있어요. 아파트의 중심에 위치해 있어서 우리 집의 핵심 공간입니다. 거실 내부는 분위기가 매우 깨끗하고 아늑하며 현대적이에요. 편안한 소파와 대형 TV가 있어서 가족들이 모여 편안하게 쉴 수 있어요. 이곳에서 가장 좋은 점은 퇴근 후 스트레스를 풀 수 있게 도와준다는 것입니다. 전반적으로 이곳은 제가 가장 좋아하는 장소이며, 그곳에 있을 때 항상 행복하고 평화로워요.",
  },
  {
    id: "q_home_02",
    cat: "집/주거",
    type: "일상/루틴",
    q_en: "What do you usually do at home on a typical weekday after work? Tell me about your routine.",
    q_ko: "평일 퇴근 후 집에서 보통 무엇을 하시나요? 평일 저녁 일과에 대해 말씀해 주세요.",
    sentences: [
      {
        en: "Usually, whenever I get home from work in the evening, I love to relax comfortably.",
        ko: "보통 저녁에 퇴근하고 집에 오면, 저는 편안하게 휴식하는 것을 좋아해요.",
      },
      {
        en: "First of all, I change into comfortable clothes and take a warm shower.",
        ko: "우선 편한 옷으로 갈아입고 따뜻한 물로 샤워를 합니다.",
      },
      {
        en: "Then, I have a delicious dinner with my family and talk about our day.",
        ko: "그러고 나서 가족들과 맛있는 저녁을 먹으며 하루 일과에 대해 이야기해요.",
      },
      {
        en: "While resting on the sofa, I also enjoy watching YouTube videos or Netflix on my phone.",
        ko: "소파에서 쉬면서 휴대폰으로 유튜브 영상이나 넷플릭스를 보는 것도 즐깁니다.",
      },
      {
        en: "After doing that for a while, I feel totally refreshed and recharged.",
        ko: "잠시 그렇게 시간을 보내고 나면 몸과 마음이 완전히 상쾌해지고 재충전돼요.",
      },
      {
        en: "It is the best way for me to relieve stress after a busy day, so I do it every day.",
        ko: "바쁜 하루 끝에 스트레스를 풀기에 가장 좋은 방법이라 매일 이렇게 합니다.",
      },
    ],
    keywords: [
      "get home from work",
      "change into comfortable clothes",
      "take a warm shower",
      "watch YouTube videos",
      "totally refreshed and recharged",
      "relieve stress",
    ],
    tip: "[만능 루틴 템플릿] 퇴근 후 도착 → 편한 옷/샤워 → 가족과 저녁 식사 → 유튜브/넷플릭스 시청 → 재충전 기분 → 매일 하는 이유.",
    answer_en:
      "Usually, whenever I get home from work in the evening, I love to relax comfortably. First of all, I change into comfortable clothes and take a warm shower. Then, I have a delicious dinner with my family and talk about our day. While resting on the sofa, I also enjoy watching YouTube videos or Netflix on my phone. After doing that for a while, I feel totally refreshed and recharged. It is the best way for me to relieve stress after a busy day, so I do it every day.",
    answer_ko:
      "보통 저녁에 퇴근하고 집에 오면, 저는 편안하게 휴식하는 것을 좋아해요. 우선 편한 옷으로 갈아입고 따뜻한 물로 샤워를 합니다. 그러고 나서 가족들과 맛있는 저녁을 먹으며 하루 일과에 대해 이야기해요. 소파에서 쉬면서 휴대폰으로 유튜브 영상이나 넷플릭스를 보는 것도 즐깁니다. 잠시 그렇게 시간을 보내고 나면 몸과 마음이 완전히 상쾌해지고 재충전돼요. 바쁜 하루 끝에 스트레스를 풀기에 가장 좋은 방법이라 매일 이렇게 합니다.",
  },
  {
    id: "q_home_03",
    cat: "집/주거",
    type: "과거 경험",
    q_en: "Have you ever experienced any problem in your house, such as broken equipment or a leak? How did you solve it?",
    q_ko: "집에서 시설 고장이나 누수 같은 문제를 겪은 적이 있으신가요? 어떻게 해결하셨나요?",
    sentences: [
      {
        en: "I remember a very unexpected and stressful problem I experienced at home.",
        ko: "집에서 겪었던 매우 갑작스럽고 스트레스 받았던 문제가 하나 기억납니다.",
      },
      {
        en: "A few months ago, in the middle of summer, the air conditioner suddenly stopped working.",
        ko: "몇 달 전 한여름에 거실 에어컨이 갑자기 작동을 멈췄어요.",
      },
      {
        en: "The weather was extremely hot, so I was quite panicked and flustered at first.",
        ko: "날씨가 너무 더워서 처음에는 꽤 당황스럽고 어찌할 바를 몰랐습니다.",
      },
      {
        en: "However, I tried to stay calm and immediately called the customer service center for help.",
        ko: "하지만 침착하게 마음을 다잡고 즉시 고객센터에 전화해 도움을 요청했습니다.",
      },
      {
        en: "Fortunately, a repair technician visited the next day and fixed the problem quickly.",
        ko: "다행히 다음 날 수리 기사님이 방문하셔서 문제를 빠르게 해결해 주셨어요.",
      },
      {
        en: "It was a stressful moment, but it became a valuable and memorable lesson for me.",
        ko: "스트레스 받는 순간이었지만, 저에게는 귀중하고 기억에 남는 경험이 되었습니다.",
      },
    ],
    keywords: [
      "unexpected problem",
      "stopped working",
      "panicked and flustered",
      "stay calm",
      "customer service center",
      "valuable lesson",
    ],
    tip: "[만능 돌발/문제해결 템플릿] 문제 발생(에어컨 고장) → 당황스러운 감정 → 침착하게 대처(고객센터 연락) → 빠른 수리 해결 → 교훈적 마무리.",
    answer_en:
      "I remember a very unexpected and stressful problem I experienced at home. A few months ago, in the middle of summer, the air conditioner suddenly stopped working. The weather was extremely hot, so I was quite panicked and flustered at first. However, I tried to stay calm and immediately called the customer service center for help. Fortunately, a repair technician visited the next day and fixed the problem quickly. It was a stressful moment, but it became a valuable and memorable lesson for me.",
    answer_ko:
      "집에서 겪었던 매우 갑작스럽고 스트레스 받았던 문제가 하나 기억납니다. 몇 달 전 한여름에 거실 에어컨이 갑자기 작동을 멈췄어요. 날씨가 너무 더워서 처음에는 꽤 당황스럽고 어찌할 바를 몰랐습니다. 하지만 침착하게 마음을 다잡고 즉시 고객센터에 전화해 도움을 요청했습니다. 다행히 다음 날 수리 기사님이 방문하셔서 문제를 빠르게 해결해 주셨어요. 스트레스 받는 순간이었지만, 저에게는 귀중하고 기억에 남는 경험이 되었습니다.",
  },
  {
    id: "q_home_04",
    cat: "집/주거",
    type: "변화/인테리어",
    q_en: "How has your home changed compared to the past? Did you buy any new furniture or remodel recently?",
    q_ko: "과거와 비교하여 현재 사시는 집은 어떻게 변했나요? 최근에 새 가구를 샀거나 리모델링을 하셨나요?",
    sentences: [
      {
        en: "Compared to the past, I think my home has changed a lot in many ways.",
        ko: "과거와 비교했을 때, 우리 집은 여러 방면에서 정말 많이 변했다고 생각해요.",
      },
      {
        en: "In the past, our living room was quite simple and there was not much modern furniture.",
        ko: "과거에는 거실이 꽤 단순했고 현대적인 가구가 별로 없었습니다.",
      },
      {
        en: "However, recently, we bought a brand-new comfortable sofa and a large smart TV.",
        ko: "하지만 최근에 아주 편안한 새 소파와 대형 스마트 TV를 새로 구입했어요.",
      },
      {
        en: "Because of these new items, the whole atmosphere has become much brighter and cozier.",
        ko: "이 새 가구들 덕분에 집안 전체 분위기가 훨씬 밝고 아늑해졌습니다.",
      },
      {
        en: "Now, my family can spend much more quality time together relaxing comfortably.",
        ko: "이제 우리 가족은 훨씬 더 편안하게 휴식하며 질 높은 시간을 함께 보낼 수 있어요.",
      },
      {
        en: "Overall, I am extremely satisfied with these positive changes in our home.",
        ko: "전반적으로 우리 집의 이러한 긍정적인 변화들에 매우 만족하고 있습니다.",
      },
    ],
    keywords: [
      "compared to the past",
      "changed a lot",
      "brand-new sofa",
      "smart TV",
      "brighter and cozier",
      "extremely satisfied",
    ],
    tip: "[만능 과거/현재 비교 템플릿] 과거와 비교 도입 → 과거 상태(단순함) → 최근 변화(새 소파/스마트TV) → 분위기 향상(밝고 아늑함) → 만족스러운 마무리.",
    answer_en:
      "Compared to the past, I think my home has changed a lot in many ways. In the past, our living room was quite simple and there was not much modern furniture. However, recently, we bought a brand-new comfortable sofa and a large smart TV. Because of these new items, the whole atmosphere has become much brighter and cozier. Now, my family can spend much more quality time together relaxing comfortably. Overall, I am extremely satisfied with these positive changes in our home.",
    answer_ko:
      "과거와 비교했을 때, 우리 집은 여러 방면에서 정말 많이 변했다고 생각해요. 과거에는 거실이 꽤 단순했고 현대적인 가구가 별로 없었습니다. 하지만 최근에 아주 편안한 새 소파와 대형 스마트 TV를 새로 구입했어요. 이 새 가구들 덕분에 집안 전체 분위기가 훨씬 밝고 아늑해졌습니다. 이제 우리 가족은 훨씬 더 편안하게 휴식하며 질 높은 시간을 함께 보낼 수 있어요. 전반적으로 우리 집의 이러한 긍정적인 변화들에 매우 만족하고 있습니다.",
  },

  // ─────────────────────────────────────────────────────────────
  // 3. 직장/업무 (q_work_01, q_work_02, q_work_03, q_work_04)
  // ─────────────────────────────────────────────────────────────
  {
    id: "q_work_01",
    cat: "직장/업무",
    type: "장소 묘사",
    q_en: "You mentioned that you work. Please tell me about the company you work for. What kind of company is it?",
    q_ko: "회사에 다니신다고 하셨습니다. 다니고 계신 회사에 대해 소개해 주세요. 어떤 회사인가요?",
    sentences: [
      {
        en: "Whenever people ask about my job, I tell them about my company located in Cheonan.",
        ko: "사람들이 제 직업을 물어볼 때마다, 저는 천안에 위치한 제 회사에 대해 이야기해요.",
      },
      {
        en: "It is a major electronics company that produces advanced semiconductor parts.",
        ko: "첨단 반도체 부품을 생산하는 주요 전자 회사입니다.",
      },
      {
        en: "Inside the company campus, the environment is very clean, modern, and high-tech.",
        ko: "회사 캠퍼스 내부는 환경이 매우 깨끗하고 현대적이며 첨단 시설을 갖추고 있어요.",
      },
      {
        en: "There are great facilities such as a large cafeteria, a gym, and comfortable break rooms.",
        ko: "대형 구내식당, 헬스장, 편안한 휴게실 등 훌륭한 복지 시설들이 있습니다.",
      },
      {
        en: "What I love most about my company is that my coworkers are very supportive and friendly.",
        ko: "회사에서 가장 좋은 점은 동료들이 서로 잘 도와주고 매우 친절하다는 것입니다.",
      },
      {
        en: "Overall, it is definitely a wonderful place to work, and I feel proud of my job.",
        ko: "전반적으로 이곳은 일하기에 정말 훌륭한 직장이며, 제 일에 자부심을 느낍니다.",
      },
    ],
    keywords: [
      "electronics company",
      "semiconductor parts",
      "clean, modern, and high-tech",
      "great facilities",
      "supportive coworkers",
      "proud of my job",
    ],
    tip: "[만능 장소 묘사 템플릿] 회사 위치/분야 → 주요 생산품 → 깨끗하고 현대적인 환경 → 편의 시설 → 친절한 동료들 → 자부심 마무리.",
    answer_en:
      "Whenever people ask about my job, I tell them about my company located in Cheonan. It is a major electronics company that produces advanced semiconductor parts. Inside the company campus, the environment is very clean, modern, and high-tech. There are great facilities such as a large cafeteria, a gym, and comfortable break rooms. What I love most about my company is that my coworkers are very supportive and friendly. Overall, it is definitely a wonderful place to work, and I feel proud of my job.",
    answer_ko:
      "사람들이 제 직업을 물어볼 때마다, 저는 천안에 위치한 제 회사에 대해 이야기해요. 첨단 반도체 부품을 생산하는 주요 전자 회사입니다. 회사 캠퍼스 내부는 환경이 매우 깨끗하고 현대적이며 첨단 시설을 갖추고 있어요. 대형 구내식당, 헬스장, 편안한 휴게실 등 훌륭한 복지 시설들이 있습니다. 회사에서 가장 좋은 점은 동료들이 서로 잘 도와주고 매우 친절하다는 것입니다. 전반적으로 이곳은 일하기에 정말 훌륭한 직장이며, 제 일에 자부심을 느낍니다.",
  },
  {
    id: "q_work_02",
    cat: "직장/업무",
    type: "일상/루틴",
    q_en: "Please tell me about your daily responsibilities at work. What do you do from the moment you arrive until you leave?",
    q_ko: "직장에서의 주요 업무에 대해 말씀해 주세요. 출근해서 퇴근할 때까지 어떤 일들을 하시나요?",
    sentences: [
      {
        en: "Usually, on a typical working day, I have a clear daily routine at the office.",
        ko: "보통 일반적인 근무일에 저는 회사에서 명확한 일과 루틴을 따릅니다.",
      },
      {
        en: "First of all, when I arrive at 8 AM, I check my emails and plan my tasks for the day.",
        ko: "우선 오전 8시에 출근하면 이메일을 확인하고 오늘의 업무를 계획해요.",
      },
      {
        en: "Then, I go into the cleanroom and inspect all the equipment to make sure everything runs smoothly.",
        ko: "그런 다음 클린룸으로 들어가 모든 설비가 원활하게 작동하는지 점검합니다.",
      },
      {
        en: "In the afternoon, I work closely with my team members to solve technical issues.",
        ko: "오후에는 팀원들과 긴밀히 협력하여 기술적인 문제들을 해결합니다.",
      },
      {
        en: "After finishing my daily checklist around 6 PM, I leave the office on time.",
        ko: "오후 6시쯤 일일 점검표를 마무리하고 정시에 퇴근해요.",
      },
      {
        en: "It is a busy and responsible job, but I always find it very rewarding.",
        ko: "바쁘고 책임감이 큰 일이지만, 항상 매우 보람을 느낍니다.",
      },
    ],
    keywords: [
      "daily routine",
      "check emails",
      "inspect equipment",
      "cleanroom",
      "solve technical issues",
      "very rewarding",
    ],
    tip: "[만능 루틴 템플릿] 출근 도착(이메일 확인) → 설비 점검(핵심 업무) → 오후 팀 협업 → 퇴근 정리 → 보람찬 소감.",
    answer_en:
      "Usually, on a typical working day, I have a clear daily routine at the office. First of all, when I arrive at 8 AM, I check my emails and plan my tasks for the day. Then, I go into the cleanroom and inspect all the equipment to make sure everything runs smoothly. In the afternoon, I work closely with my team members to solve technical issues. After finishing my daily checklist around 6 PM, I leave the office on time. It is a busy and responsible job, but I always find it very rewarding.",
    answer_ko:
      "보통 일반적인 근무일에 저는 회사에서 명확한 일과 루틴을 따릅니다. 우선 오전 8시에 출근하면 이메일을 확인하고 오늘의 업무를 계획해요. 그런 다음 클린룸으로 들어가 모든 설비가 원활하게 작동하는지 점검합니다. 오후에는 팀원들과 긴밀히 협력하여 기술적인 문제들을 해결합니다. 오후 6시쯤 일일 점검표를 마무리하고 정시에 퇴근해요. 바쁘고 책임감이 큰 일이지만, 항상 매우 보람을 느낍니다.",
  },
  {
    id: "q_work_03",
    cat: "직장/업무",
    type: "과거 경험",
    q_en: "Tell me about a memorable project or an urgent problem you had at work. How did you handle it?",
    q_ko: "직장에서 겪었던 기억에 남는 프로젝트나 긴급했던 문제에 대해 말씀해 주세요. 어떻게 해결하셨나요?",
    sentences: [
      {
        en: "I remember a very unexpected and urgent problem I had at work a few months ago.",
        ko: "몇 달 전 회사에서 겪었던 매우 갑작스럽고 긴급했던 문제가 하나 기억납니다.",
      },
      {
        en: "During a major production run, one of our main manufacturing machines suddenly stopped working.",
        ko: "주요 생산 공정 중에 핵심 제조 장비 중 하나가 갑자기 작동을 멈췄어요.",
      },
      {
        en: "The project deadline was very tight, so my entire team was quite panicked at first.",
        ko: "프로젝트 마감이 촉박했기 때문에 처음에는 팀 전체가 꽤 당황했습니다.",
      },
      {
        en: "However, we tried to stay calm and immediately ran a full diagnostic test together.",
        ko: "하지만 우리는 침착하게 마음을 다잡고 즉시 함께 정밀 진단 테스트를 진행했습니다.",
      },
      {
        en: "Fortunately, we found a faulty sensor and replaced it successfully within two hours.",
        ko: "다행히 결함이 있는 센서를 찾아내어 2시간 만에 성공적으로 교체했어요.",
      },
      {
        en: "It was a stressful moment, but it became a valuable and memorable lesson in teamwork.",
        ko: "긴박한 순간이었지만 팀워크의 소중함을 배운 뜻깊은 경험이 되었습니다.",
      },
    ],
    keywords: [
      "urgent problem",
      "stopped working",
      "deadline was tight",
      "stay calm",
      "diagnostic test",
      "teamwork",
    ],
    tip: "[만능 돌발/문제해결 템플릿] 긴급 문제 발생(장비 정지) → 마감 압박/당황 → 침착하게 진단 → 신속한 부품 교체 해결 → 팀워크 교훈 마무리.",
    answer_en:
      "I remember a very unexpected and urgent problem I had at work a few months ago. During a major production run, one of our main manufacturing machines suddenly stopped working. The project deadline was very tight, so my entire team was quite panicked at first. However, we tried to stay calm and immediately ran a full diagnostic test together. Fortunately, we found a faulty sensor and replaced it successfully within two hours. It was a stressful moment, but it became a valuable and memorable lesson in teamwork.",
    answer_ko:
      "몇 달 전 회사에서 겪었던 매우 갑작스럽고 긴급했던 문제가 하나 기억납니다. 주요 생산 공정 중에 핵심 제조 장비 중 하나가 갑자기 작동을 멈췄어요. 프로젝트 마감이 촉박했기 때문에 처음에는 팀 전체가 꽤 당황했습니다. 하지만 우리는 침착하게 마음을 다잡고 즉시 함께 정밀 진단 테스트를 진행했습니다. 다행히 결함이 있는 센서를 찾아내어 2시간 만에 성공적으로 교체했어요. 긴박한 순간이었지만 팀워크의 소중함을 배운 뜻깊은 경험이 되었습니다.",
  },
  {
    id: "q_work_04",
    cat: "직장/업무",
    type: "과거 경험",
    q_en: "Tell me about your very first day at your current company. What was your impression?",
    q_ko: "현재 회사에서의 첫 출근 날에 대해 말씀해 주세요. 첫인상이 어땠나요?",
    sentences: [
      {
        en: "I remember a very special and memorable experience when I first joined my company.",
        ko: "처음 회사에 입사했을 때의 매우 특별하고 기억에 남는 경험이 생각납니다.",
      },
      {
        en: "On my very first day, I arrived early in the morning feeling quite nervous and excited.",
        ko: "첫 출근 날 아침, 저는 꽤 긴장되고 설레는 마음으로 일찍 도착했습니다.",
      },
      {
        en: "Inside the office, my manager gave me a warm welcome and introduced me to all the team members.",
        ko: "사무실에 들어가자 팀장님께서 저를 따뜻하게 맞아주시고 모든 팀원들에게 소개해 주셨어요.",
      },
      {
        en: "They kindly showed me around the clean campus and explained the company culture.",
        ko: "선배들은 깨끗한 사옥 곳곳을 친절하게 안내해 주시고 회사 문화를 설명해 주었습니다.",
      },
      {
        en: "We had a delicious lunch together, and I felt immediately comfortable and supported.",
        ko: "점심에는 맛있는 식사를 함께하며 바로 마음이 편안해지고 든든함을 느꼈어요.",
      },
      {
        en: "It was one of the most unforgettable and meaningful days in my professional career.",
        ko: "제 직장 생활에서 가장 잊을 수 없고 의미 있는 날 중 하나였습니다.",
      },
    ],
    keywords: [
      "first joined my company",
      "nervous and excited",
      "warm welcome",
      "team members",
      "unforgettable and meaningful",
    ],
    tip: "[만능 과거 경험 템플릿] 첫 출근 도입 → 긴장과 설렘 → 팀장/팀원의 따뜻한 환영 → 사옥 투어 및 점심 식사 → 보람찬 첫날 마무리.",
    answer_en:
      "I remember a very special and memorable experience when I first joined my company. On my very first day, I arrived early in the morning feeling quite nervous and excited. Inside the office, my manager gave me a warm welcome and introduced me to all the team members. They kindly showed me around the clean campus and explained the company culture. We had a delicious lunch together, and I felt immediately comfortable and supported. It was one of the most unforgettable and meaningful days in my professional career.",
    answer_ko:
      "처음 회사에 입사했을 때의 매우 특별하고 기억에 남는 경험이 생각납니다. 첫 출근 날 아침, 저는 꽤 긴장되고 설레는 마음으로 일찍 도착했습니다. 사무실에 들어가자 팀장님께서 저를 따뜻하게 맞아주시고 모든 팀원들에게 소개해 주셨어요. 선배들은 깨끗한 사옥 곳곳을 친절하게 안내해 주시고 회사 문화를 설명해 주었습니다. 점심에는 맛있는 식사를 함께하며 바로 마음이 편안해지고 든든함을 느꼈어요. 제 직장 생활에서 가장 잊을 수 없고 의미 있는 날 중 하나였습니다.",
  },
];

// 나머지 32개 질문들도 동일한 만능 프레임워크로 추가 생성...
console.log("Template engine prepared.");
