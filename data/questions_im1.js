// OPIc Practice Questions Dataset (Normalized: sentences are single source of truth)
window.QUESTIONS_DATA = [
  {
    "id": "q_intro_01",
    "cat": "자기소개",
    "type": "인물 묘사",
    "q_en": "Let's start the interview now. Please tell me a little bit about yourself.",
    "q_ko": "인터뷰를 시작하겠습니다. 본인에 대해 간단히 소개해 주세요.",
    "sentences": [
      {
        "en": "Hello, Eva! My name is Hyosang Kim, and I am twenty-eight years old.",
        "ko": "안녕하세요, 에바! 제 이름은 김효상이고 28살입니다."
      },
      {
        "en": "I live alone in a cozy apartment near my office.",
        "ko": "저는 회사 근처의 아늑한 아파트에 혼자 살고 있어요."
      },
      {
        "en": "I work at an office from nine to six.",
        "ko": "저는 사무실에서 9시부터 6시까지 일하고 있습니다."
      },
      {
        "en": "In my free time, I really like cooking, coding, and walking.",
        "ko": "여가 시간에는 요리하기, 코딩, 산책하는 것을 정말 좋아해요."
      },
      {
        "en": "I am a very positive, calm, and friendly person.",
        "ko": "제 성격은 매우 긍정적이고 차분하며 친절한 편이에요."
      },
      {
        "en": "I am very happy to take this test today, and I will do my best.",
        "ko": "오늘 이 시험을 보게 되어 기쁘고, 최선을 다하겠습니다."
      }
    ],
    "keywords": [
      "twenty-eight years old",
      "live alone in cozy apartment",
      "work nine to six",
      "cooking and coding",
      "positive and friendly"
    ],
    "tip": "[초간단 자기소개] 이름/나이 → 1인 가구 거주지 → 9 to 6 근무 → 취미(요리, 코딩, 산책) → 긍정적 성격 → 최선 다짐.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_intro_02",
    "cat": "자기소개",
    "type": "일상/취미",
    "q_en": "Could you tell me more about your daily routine and what you usually do on weekends?",
    "q_ko": "평소 하루 일과와 주말에 주로 무엇을 하시는지 더 자세히 말씀해 주시겠어요?",
    "sentences": [
      {
        "en": "On weekdays, I usually work at an office from nine to six.",
        "ko": "평일에는 보통 사무실에서 9시부터 6시까지 일해요."
      },
      {
        "en": "When I get home after work, I take a shower and eat dinner alone.",
        "ko": "퇴근하고 집에 오면 샤워를 하고 혼자 저녁을 먹습니다."
      },
      {
        "en": "On weekends, when I have free time, I love to walk in the park near my house.",
        "ko": "주말에는 여유 시간이 있을 때 집 근처 공원을 걷는 것을 아주 좋아해요."
      },
      {
        "en": "I often go to Starbucks to drink an iced Americano alone.",
        "ko": "종종 스타벅스에 가서 혼자 아이스 아메리카노를 마시곤 합니다."
      },
      {
        "en": "Spending quiet time like this relieves all my stress.",
        "ko": "이렇게 조용한 시간을 보내면 모든 스트레스가 다 풀려요."
      },
      {
        "en": "So, I really like my simple and happy life.",
        "ko": "그래서 저는 저의 단순하고 행복한 삶을 정말 좋아합니다."
      }
    ],
    "keywords": [
      "work nine to six",
      "eat dinner alone",
      "park near my house",
      "Starbucks iced Americano",
      "relieves all my stress",
      "simple and happy life"
    ],
    "tip": "[초간단 루틴] 평일 9 to 6 근무 → 퇴근 후 저녁 → 주말 집 근처 공원 산책 → 스타벅스 커피 → 스트레스 해소 → 행복한 삶.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_home_01",
    "cat": "집/주거",
    "type": "장소 묘사",
    "q_en": "You indicated in the survey that you live in an apartment. Please describe your home to me. What does it look like?",
    "q_ko": "설문에서 아파트에 거주한다고 하셨습니다. 거주하시는 집에 대해 설명해 주세요. 집이 어떻게 생겼나요?",
    "sentences": [
      {
        "en": "Whenever I think of my house, the living room is really my favorite place.",
        "ko": "제 집을 생각할 때마다, 거실이 진짜 제 최애 장소예요."
      },
      {
        "en": "It is located near my office, so it is very easy to commute.",
        "ko": "회사 근처에 있어서, 출퇴근하기가 정말 편해요."
      },
      {
        "en": "Inside the room, the vibe is very clean, quiet, and cozy.",
        "ko": "방 안은 분위기가 아주 깔끔하고 조용하며 아늑해요."
      },
      {
        "en": "There are a soft sofa and a big TV, so I can relax comfortably.",
        "ko": "폭신한 소파와 큰 TV가 있어서 편안하게 쉴 수 있어요."
      },
      {
        "en": "I love this place because watching YouTube relieves all my stress after work.",
        "ko": "퇴근 후 유튜브를 보면 스트레스가 싹 풀려서 여길 너무 좋아해요."
      },
      {
        "en": "So, I always feel happy and relaxed whenever I stay there.",
        "ko": "그래서 집에 머물 때마다 저는 항상 행복하고 편안함을 느껴요."
      }
    ],
    "keywords": [
      "living room favorite place",
      "near my office",
      "clean, quiet, and cozy",
      "soft sofa and big TV",
      "watching YouTube",
      "happy and relaxed"
    ],
    "tip": "[만능 집 묘사] 거실 최애 장소 → 회사 근처 편리함 → 깔끔하고 아늑한 분위기 → 소파와 TV → 유튜브 힐링 → 편안함.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_home_02",
    "cat": "집/주거",
    "type": "일상 루틴",
    "q_en": "What do you normally do at home on weekdays and weekends? Please tell me about your daily routine at home.",
    "q_ko": "평일과 주말에 집에서 보통 무엇을 하시나요? 집에서의 일상 루틴에 대해 말씀해 주세요.",
    "sentences": [
      {
        "en": "Usually, when I get home after work, I have a simple evening routine.",
        "ko": "보통 퇴근 후 집에 오면 간단한 저녁 루틴을 보냅니다."
      },
      {
        "en": "First, I wash my hands and change into comfortable clothes.",
        "ko": "먼저 손을 씻고 편안한 옷으로 갈아입어요."
      },
      {
        "en": "Then, I cook a simple dinner like fried rice and eat alone.",
        "ko": "그 다음 볶음밥처럼 간단한 저녁을 만들어서 혼자 먹습니다."
      },
      {
        "en": "While eating, I watch interesting videos on YouTube.",
        "ko": "밥을 먹으면서 유튜브에서 재미있는 영상을 봅니다."
      },
      {
        "en": "After that, I take a warm shower and lie down on my sofa.",
        "ko": "그 후에 따뜻한 샤워를 하고 소파에 편하게 눕습니다."
      },
      {
        "en": "Doing this routine relieves all my stress, so I do it every day.",
        "ko": "이 루틴을 보내면 모든 스트레스가 풀려서 매일 이렇게 해요."
      }
    ],
    "keywords": [
      "simple evening routine",
      "comfortable clothes",
      "simple dinner alone",
      "watch YouTube videos",
      "warm shower and sofa",
      "relieves all my stress"
    ],
    "tip": "[초간단 집 루틴] 편한 옷 갈아입기 → 간단 요리(볶음밥) 혼밥 → 유튜브 시청 → 따뜻한 샤워 & 소파 휴식 → 스트레스 해소.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_home_03",
    "cat": "집/주거",
    "type": "과거 경험",
    "q_en": "Have you ever experienced a problem at home, such as something broken or an appliance not working? How did you fix it?",
    "q_ko": "물건이 고장 나거나 가전제품이 작동하지 않는 등 집에서 문제를 겪은 적이 있나요? 어떻게 해결하셨나요?",
    "sentences": [
      {
        "en": "I remember a problem when I was resting at home last summer.",
        "ko": "지난여름 집에서 쉬던 중에 겪었던 문제가 하나 기억나요."
      },
      {
        "en": "Suddenly, my air conditioner stopped working on a very hot day.",
        "ko": "갑자기 아주 더운 날에 에어컨 작동이 멈췄어요."
      },
      {
        "en": "I was very surprised and worried at first.",
        "ko": "처음에는 너무 놀라고 걱정이 되었습니다."
      },
      {
        "en": "However, I calmed down and quickly called the repair center.",
        "ko": "하지만 마음을 가라앉히고 빠르게 수리 센터에 전화했어요."
      },
      {
        "en": "Fortunately, a repairman came the next morning and fixed it quickly.",
        "ko": "다행히 수리 기사님이 다음 날 아침에 오셔서 빠르게 고쳐주셨어요."
      },
      {
        "en": "It was hot, but it was a great relief and a good memory.",
        "ko": "더웠지만, 정말 안도했고 좋은 추억이 되었습니다."
      }
    ],
    "keywords": [
      "problem at home last summer",
      "air conditioner stopped working",
      "surprised and worried",
      "called repair center",
      "repairman fixed it quickly",
      "great relief"
    ],
    "tip": "[초간단 집 문제해결] 에어컨 고장 → 놀람과 걱정 → 수리 센터 전화 → 기사님 빠른 수리 → 안도와 좋은 추억.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_home_04",
    "cat": "집/주거",
    "type": "변화/인테리어",
    "q_en": "How has your home changed compared to the past? Did you buy any new furniture or change the interior design?",
    "q_ko": "과거와 비교하여 거주하시는 집이 어떻게 달라졌나요? 새로운 가구를 사거나 인테리어를 바꾸신 적이 있나요?",
    "sentences": [
      {
        "en": "In the past, my house was very different from now.",
        "ko": "과거에는 제 집이 지금과 많이 달랐어요."
      },
      {
        "en": "In the past, my room was small and had old furniture.",
        "ko": "과거에는 방이 좁았고 오래된 가구들만 있었어요."
      },
      {
        "en": "However, now, my new apartment is very clean and modern.",
        "ko": "하지만 지금 제 새 아파트는 아주 깔끔하고 현대적이에요."
      },
      {
        "en": "For example, I bought a comfortable sofa and a warm mood light.",
        "ko": "예를 들어 편안한 소파와 따뜻한 무드등을 샀습니다."
      },
      {
        "en": "So, resting at home after work feels much more healing and fun.",
        "ko": "그래서 퇴근 후 집에서 쉬는 게 훨씬 더 힐링되고 즐거워요."
      },
      {
        "en": "So, I really like my new house and I am very happy.",
        "ko": "그래서 저는 새집이 정말 마음에 들고 아주 행복합니다."
      }
    ],
    "keywords": [
      "very different from now",
      "room was small and old",
      "clean and modern",
      "comfortable sofa and mood light",
      "resting at home after work",
      "very happy"
    ],
    "tip": "[초간단 집 변화 비교] 옛날 작은 집 ➔ 지금 새 아파트 깔끔함 ➔ 소파와 무드등 ➔ 퇴근 후 힐링 ➔ 대만족.",
    "combo_step": 4,
    "combo_role": "4단계: 변화·비교 심화"
  },
  {
    "id": "q_work_01",
    "cat": "직장/업무",
    "type": "장소 묘사",
    "q_en": "You mentioned that you work. Please tell me about your company and your workplace. Where is it located and what does it look like?",
    "q_ko": "직장에 다닌다고 하셨습니다. 다니시는 회사와 근무지에 대해 말씀해 주세요. 어디에 위치해 있고 어떻게 생겼나요?",
    "sentences": [
      {
        "en": "Whenever I think of my workplace, my office is really my favorite place.",
        "ko": "제 직장을 생각할 때마다, 제 사무실이 진짜 가장 정이 가는 곳이에요."
      },
      {
        "en": "My company is located near my house, so it is very easy to commute there.",
        "ko": "저희 회사는 집 근처에 있어서, 출퇴근하기가 정말 편해요."
      },
      {
        "en": "Inside the office, the vibe is very clean, bright, and well-organized.",
        "ko": "사무실 안은 분위기가 아주 깔끔하고 밝으며 잘 정돈되어 있어요."
      },
      {
        "en": "There are comfortable desks and dual-screen computers, so we can work comfortably.",
        "ko": "편안한 책상과 듀얼 모니터 컴퓨터가 있어서 편안하게 일할 수 있어요."
      },
      {
        "en": "I love this place because my colleagues are very kind and friendly.",
        "ko": "동료들이 매우 친절하고 상냥해서 이 직장을 너무 좋아해요."
      },
      {
        "en": "So, I always feel happy and proud whenever I work there.",
        "ko": "그래서 일할 때마다 저는 항상 보람과 자부심을 느껴요."
      }
    ],
    "keywords": [
      "office near my house",
      "easy to commute",
      "clean, bright, and well-organized",
      "comfortable desks and computers",
      "kind and friendly colleagues",
      "happy and proud"
    ],
    "tip": "[초간단 직장 묘사] 집 근처 회사 → 편리한 출퇴근 → 깔끔하고 밝은 사무실 → 책상과 컴퓨터 → 친절한 동료들과 보람.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_work_02",
    "cat": "직장/업무",
    "type": "일상/루틴",
    "q_en": "Please tell me about your daily responsibilities at work. What tasks do you handle on a typical day?",
    "q_ko": "직장에서의 일상적인 업무에 대해 말씀해 주세요. 일반적인 근무 시간 동안 어떤 일들을 처리하시나요?",
    "sentences": [
      {
        "en": "As an office worker, I work from nine to six every day.",
        "ko": "회사원으로서, 저는 매일 9시부터 6시까지 일합니다."
      },
      {
        "en": "First, when I arrive at work, I check my emails and write my to-do list.",
        "ko": "먼저 출근하면 이메일을 확인하고 오늘의 할 일 목록을 적어요."
      },
      {
        "en": "Then, I have a morning meeting with my team to talk about our schedule.",
        "ko": "그 후 팀원들과 아침 미팅을 하며 일정을 이야기해요."
      },
      {
        "en": "In the afternoon, I write business reports and check work data on my computer.",
        "ko": "오후에는 컴퓨터로 업무 보고서를 쓰고 데이터를 확인합니다."
      },
      {
        "en": "Before going home, I clean my desk and review today's work.",
        "ko": "퇴근하기 전에는 책상을 치우고 오늘 한 일들을 검토해요."
      },
      {
        "en": "Finishing my work brings me great joy, so I work hard every day.",
        "ko": "하루 일을 잘 마치면 큰 보람을 느껴서 매일 열심히 일합니다."
      }
    ],
    "keywords": [
      "work nine to six",
      "check emails and to-do list",
      "morning team meeting",
      "write reports and check data",
      "clean desk before going home",
      "great joy"
    ],
    "tip": "[초간단 업무 루틴] 9 to 6 근무 → 출근 후 이메일 & 할 일 체크 → 팀 아침 회의 → 보고서 작성 및 데이터 확인 → 퇴근 전 정돈 및 보람.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_work_03",
    "cat": "직장/업무",
    "type": "과거 경험",
    "q_en": "Tell me about a memorable project or an urgent problem you solved at work. How did you resolve it?",
    "q_ko": "직장에서 수행했던 기억에 남는 프로젝트나 해결했던 긴급한 문제에 대해 말씀해 주세요. 어떻게 해결하셨나요?",
    "sentences": [
      {
        "en": "I remember an urgent problem I had at work a few months ago.",
        "ko": "몇 달 전 회사에서 겪었던 긴급한 문제가 하나 기억나요."
      },
      {
        "en": "Suddenly, my computer showed an error right before an important deadline.",
        "ko": "중요한 마감 직전에 갑자기 컴퓨터에 에러가 떴어요."
      },
      {
        "en": "The screen turned blue, so I was very surprised and worried at first.",
        "ko": "화면이 파랗게 변해서 처음에는 너무 놀라고 걱정되었어요."
      },
      {
        "en": "However, I calmed down and quickly checked the file with my colleague.",
        "ko": "하지만 마음을 가라앉히고 빠르게 동료와 함께 파일을 점검했어요."
      },
      {
        "en": "Fortunately, we fixed the error quickly and sent the report on time.",
        "ko": "다행히 에러를 빠르게 고쳐서 보고서를 제시간에 보냈습니다."
      },
      {
        "en": "It was urgent, but our teamwork made me feel very proud.",
        "ko": "긴급했지만, 우리 팀의 협동심 덕분에 정말 자랑스러웠어요."
      }
    ],
    "keywords": [
      "urgent problem at work",
      "computer error before deadline",
      "surprised and worried",
      "checked file with colleague",
      "fixed error on time",
      "felt very proud"
    ],
    "tip": "[초간단 직장 문제해결] 마감 직전 에러 발생 → 당황과 걱정 → 침착하게 동료와 파일 점검 → 신속 수정 및 제시간 전송 → 보람과 자부심.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_work_04",
    "cat": "직장/업무",
    "type": "과거 경험",
    "q_en": "Tell me about your very first day at your current company. What did you do and how did you feel?",
    "q_ko": "현재 직장에 처음 출근했던 첫날에 대해 말씀해 주세요. 무엇을 하셨고 어떤 기분이 드셨나요?",
    "sentences": [
      {
        "en": "I remember my very first day at my company clearly.",
        "ko": "회사에 처음 출근했던 첫날이 또렷하게 기억나요."
      },
      {
        "en": "When I first walked into the office, everything looked new and exciting.",
        "ko": "사무실에 처음 들어갔을 때, 모든 것이 새롭고 신기했어요."
      },
      {
        "en": "I sat at my new desk, and I felt a little nervous.",
        "ko": "새 책상에 앉았을 때, 조금 긴장도 되었습니다."
      },
      {
        "en": "However, my colleagues smiled warmly and showed me around the office.",
        "ko": "하지만 동료들이 따뜻하게 웃어주며 사무실을 안내해 주었어요."
      },
      {
        "en": "We ate a delicious lunch together, and they were very kind to me.",
        "ko": "우리는 함께 맛있는 점심을 먹었고, 다들 저에게 아주 친절했어요."
      },
      {
        "en": "It was a wonderful day, and I will never forget it.",
        "ko": "정말 멋진 하루였고, 영원히 잊지 못할 거예요."
      }
    ],
    "keywords": [
      "very first day at work",
      "walked into office",
      "felt a little nervous",
      "colleagues smiled warmly",
      "delicious lunch together",
      "never forget it"
    ],
    "tip": "[초간단 첫 출근] 첫 출근의 설렘 → 새 책상과 긴장감 → 동료들의 따뜻한 미소와 사무실 안내 → 맛있는 점심 식사 → 잊지 못할 추억.",
    "combo_step": 4,
    "combo_role": "4단계: 변화·비교 심화"
  },
  {
    "id": "q_cafe_01",
    "cat": "카페가기",
    "type": "장소 묘사",
    "q_en": "You indicated in the survey that you like going to cafes. Please describe your favorite cafe in detail. What does it look like?",
    "q_ko": "설문에서 카페 가기를 좋아한다고 하셨습니다. 가장 좋아하시는 카페에 대해 자세히 설명해 주세요. 어떤 모습인가요?",
    "sentences": [
      {
        "en": "Whenever I think of cafes, Starbucks is really my favorite place.",
        "ko": "카페를 생각할 때마다, 스타벅스가 진짜 제 최애 장소예요."
      },
      {
        "en": "It is located near my house, so it is very easy to get there.",
        "ko": "저희 집 근처에 있어서, 찾아가기가 정말 편해요."
      },
      {
        "en": "Inside the place, the vibe is very clean, quiet, and cozy.",
        "ko": "그곳 안은 분위기가 아주 깔끔하고 조용하며 아늑해요."
      },
      {
        "en": "There are large windows and comfortable seats, so I can relax comfortably.",
        "ko": "큰 창문과 편안한 좌석이 있어서 편안하게 쉴 수 있어요."
      },
      {
        "en": "I love this place because drinking coffee relieves all my stress after work.",
        "ko": "퇴근 후 커피를 마시면 스트레스가 싹 풀려서 여길 너무 좋아해요."
      },
      {
        "en": "So, I always feel happy and relaxed whenever I go there.",
        "ko": "그래서 갈 때마다 저는 항상 행복하고 편안함을 느껴요."
      }
    ],
    "keywords": [
      "Starbucks near my house",
      "easy to get there",
      "clean, quiet, and cozy",
      "large windows and comfortable seats",
      "drinking coffee relieves stress",
      "happy and relaxed"
    ],
    "tip": "[만능 카페 묘사] 스타벅스 최애 장소 → 집 근처 편리함 → 깔끔 조용 아늑한 분위기 → 큰 창문과 편한 좌석 → 퇴근 후 커피 힐링 → 편안함.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_cafe_02",
    "cat": "카페가기",
    "type": "일상 루틴",
    "q_en": "What do you normally do when you go to a cafe? Please tell me about what you do from the moment you enter to the moment you leave.",
    "q_ko": "카페에 가면 보통 무엇을 하시나요? 카페에 들어갈 때부터 나올 때까지의 일과를 말씀해 주세요.",
    "sentences": [
      {
        "en": "Usually, on weekend afternoons, I go to Starbucks near my house.",
        "ko": "보통 주말 오후에 저는 집 근처 스타벅스에 갑니다."
      },
      {
        "en": "First, I enter the cafe and order an iced Americano with the mobile app.",
        "ko": "먼저 카페에 들어가서 모바일 앱으로 아이스 아메리카노를 주문해요."
      },
      {
        "en": "While waiting for my drink, I find a quiet table near the window.",
        "ko": "음료를 기다리는 동안 창가 근처의 조용한 자리를 잡습니다."
      },
      {
        "en": "While drinking my coffee, I enjoy reading news or listening to music.",
        "ko": "커피를 마시면서 뉴스를 읽거나 음악 듣는 것을 즐겨요."
      },
      {
        "en": "After one or two hours, I feel very happy and refreshed.",
        "ko": "1~2시간 뒤면 정말 행복하고 재충전된 기분이 들어요."
      },
      {
        "en": "It relieves all my stress, so I go there often.",
        "ko": "스트레스가 다 풀려서 저는 그곳에 자주 갑니다."
      }
    ],
    "keywords": [
      "Starbucks near my house",
      "order with mobile app",
      "table near the window",
      "reading news or listening to music",
      "one or two hours",
      "relieves all my stress"
    ],
    "tip": "[초간단 카페 루틴] 주말 오후 스타벅스 → 모바일 앱 주문 → 창가 조용한 자리 → 커피 마시며 뉴스/음악 → 재충전 및 스트레스 해소.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_cafe_03",
    "cat": "카페가기",
    "type": "과거 경험",
    "q_en": "Tell me about a memorable or special experience you had at a cafe recently. What happened and why was it memorable?",
    "q_ko": "최근 카페에서 겪었던 기억에 남거나 특별했던 경험에 대해 말씀해 주세요. 무슨 일이 있었고 왜 기억에 남나요?",
    "sentences": [
      {
        "en": "I remember a very sweet memory at a cafe a few months ago.",
        "ko": "몇 달 전 카페에서 있었던 아주 달콤한 기억이 하나 있어요."
      },
      {
        "en": "On my birthday, I went to a pretty dessert cafe near my house alone.",
        "ko": "제 생일에 혼자 집 근처 예쁜 디저트 카페에 갔어요."
      },
      {
        "en": "The cafe was decorated with flowers, and soft ballad music was playing.",
        "ko": "카페는 꽃들로 꾸며져 있었고, 잔잔한 발라드 음악이 나오고 있었어요."
      },
      {
        "en": "I ordered warm coffee and a slice of delicious strawberry cake.",
        "ko": "따뜻한 커피와 맛있는 딸기 케이크 한 조각을 주문했습니다."
      },
      {
        "en": "I listened to music and took a quiet rest for myself.",
        "ko": "음악을 듣고 저 자신을 위해 조용한 휴식을 취했어요."
      },
      {
        "en": "It was a wonderful memory, and I will never forget it.",
        "ko": "정말 멋진 추억이었고, 영원히 잊지 못할 거예요."
      }
    ],
    "keywords": [
      "sweet memory at cafe",
      "pretty dessert cafe near my house",
      "flowers and soft music",
      "warm coffee and strawberry cake",
      "quiet rest for myself",
      "never forget it"
    ],
    "tip": "[초간단 카페 경험] 생일날 집 근처 디저트 카페 → 꽃과 잔잔한 음악 → 따뜻한 커피 & 딸기 케이크 → 혼자만의 조용한 힐링 휴식 → 평생 추억.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_cafe_04",
    "cat": "카페가기",
    "type": "변화/비교",
    "q_en": "How have cafes changed compared to the past? Please describe how cafes were before and how they are different today.",
    "q_ko": "과거와 비교하여 카페가 어떻게 변화했나요? 예전의 카페 모습과 오늘날 어떻게 달라졌는지 설명해 주세요.",
    "sentences": [
      {
        "en": "In the past, cafes in Korea were very different from now.",
        "ko": "과거에는 한국의 카페가 지금과 많이 달랐어요."
      },
      {
        "en": "In the past, cafes were simple and choices were limited.",
        "ko": "과거에는 카페가 단순했고 메뉴 선택이 별로 없었어요."
      },
      {
        "en": "However, now, cafes are very convenient and modern.",
        "ko": "하지만 지금은 카페가 아주 편리하고 현대적이에요."
      },
      {
        "en": "For example, we can use mobile order apps easily without waiting in line.",
        "ko": "예를 들어 우리는 줄을 서지 않고 모바일 주문 앱을 쉽게 써요."
      },
      {
        "en": "Also, we can enjoy delicious bakeries and premium desserts.",
        "ko": "또한 맛있는 빵과 고급 디저트를 즐길 수 있습니다."
      },
      {
        "en": "So, I really like these nice changes.",
        "ko": "그래서 저는 이런 좋은 변화들이 정말 마음에 들어요."
      }
    ],
    "keywords": [
      "very different from now",
      "simple and choices limited",
      "convenient and modern",
      "mobile order apps without line",
      "delicious bakeries and desserts",
      "really like these changes"
    ],
    "tip": "[초간단 카페 변화 비교] 과거 단순한 메뉴 ➔ 현재 모던하고 편리함 ➔ 줄 서지 않는 모바일 주문 ➔ 맛있는 베이커리 ➔ 대만족.",
    "combo_step": 4,
    "combo_role": "4단계: 변화·비교 심화"
  },
  {
    "id": "q_park_01",
    "cat": "공원가기",
    "type": "장소 묘사",
    "q_en": "You indicated in the survey that you like going to parks. Please describe a park you often visit. Where is it located and what does it look like?",
    "q_ko": "설문에서 공원 가기를 좋아한다고 하셨습니다. 자주 가시는 공원에 대해 설명해 주세요. 어디에 있고 어떻게 생겼나요?",
    "sentences": [
      {
        "en": "Whenever I think of parks, the park is really my favorite place.",
        "ko": "공원을 생각할 때마다, 공원이 진짜 제 최애 장소예요."
      },
      {
        "en": "It is located near my house, so it is very easy to get there.",
        "ko": "저희 집 근처에 있어서, 찾아가기가 정말 편해요."
      },
      {
        "en": "Inside the place, the vibe is very clean, quiet, and cozy.",
        "ko": "그곳 안은 분위기가 아주 깔끔하고 조용하며 아늑해요."
      },
      {
        "en": "There are green trees and comfortable benches, so I can relax comfortably.",
        "ko": "푸른 나무들과 편안한 벤치가 있어서 편안하게 쉴 수 있어요."
      },
      {
        "en": "I love this place because walking alone relieves all my stress after work.",
        "ko": "퇴근 후 혼자 걸으면 스트레스가 싹 풀려서 여길 너무 좋아해요."
      },
      {
        "en": "So, I always feel happy and relaxed whenever I go there.",
        "ko": "그래서 갈 때마다 저는 항상 행복하고 편안함을 느껴요."
      }
    ],
    "keywords": [
      "park near my house",
      "easy to get there",
      "clean, quiet, and cozy",
      "green trees and comfortable benches",
      "walking alone relieves stress",
      "happy and relaxed"
    ],
    "tip": "[만능 공원 묘사] 집 근처 공원 → 접근성 편함 → 깔끔하고 아늑함 → 푸른 나무와 벤치 → 퇴근 후 혼자 산책 힐링 → 편안함.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_park_02",
    "cat": "공원가기",
    "type": "일상 루틴",
    "q_en": "What do you usually do when you go to the park? Please tell me about your typical routine at the park from beginning to end.",
    "q_ko": "공원에 가면 보통 무엇을 하시나요? 공원에서의 일반적인 활동 루틴을 처음부터 끝까지 말씀해 주세요.",
    "sentences": [
      {
        "en": "Usually, in the evening, I love to walk in the park near my house.",
        "ko": "보통 저녁에 저는 집 근처 공원에서 걷는 것을 정말 좋아해요."
      },
      {
        "en": "First, I wear comfortable sneakers and wireless earphones.",
        "ko": "먼저 편안한 운동화를 신추고 무선 이어폰을 챙깁니다."
      },
      {
        "en": "When I arrive at the park, I walk slowly along the green trail.",
        "ko": "공원에 도착하면 푸른 산책로를 따라 천천히 걸어요."
      },
      {
        "en": "While walking, I enjoy listening to soft ballad music.",
        "ko": "걸으면서 잔잔한 발라드 음악을 듣는 것을 즐깁니다."
      },
      {
        "en": "After walking for forty minutes, I do simple stretching on a bench.",
        "ko": "40분 동안 걷고 난 뒤 벤치에서 가벼운 스트레칭을 해요."
      },
      {
        "en": "It relieves all my stress after work, so I do it often.",
        "ko": "퇴근 후 스트레스가 다 풀려서 저는 자주 이렇게 합니다."
      }
    ],
    "keywords": [
      "walk in the park near my house",
      "comfortable sneakers and earphones",
      "walk slowly along green trail",
      "listening to soft ballad music",
      "stretching on a bench",
      "relieves all my stress"
    ],
    "tip": "[초간단 공원 루틴] 저녁 공원 산책 → 운동화 & 무선이어폰 → 푸른 산책로 걷기 → 발라드 음악 청취 → 벤치 스트레칭 → 스트레스 해소.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_park_03",
    "cat": "공원가기",
    "type": "과거 경험",
    "q_en": "Tell me about a memorable or unexpected incident that happened to you at a park. What happened and how did you react?",
    "q_ko": "공원에서 있었던 기억에 남거나 뜻밖이었던 일에 대해 말씀해 주세요. 무슨 일이 있었고 어떻게 반응하셨나요?",
    "sentences": [
      {
        "en": "I remember a nice surprise when I was walking in the park near my house.",
        "ko": "집 근처 공원을 걷던 중 겪었던 기분 좋은 깜짝 일이 하나 기억나요."
      },
      {
        "en": "A few weeks ago, I saw an old colleague from my past company.",
        "ko": "몇 주 전, 예전 직장의 옛 동료를 우연히 보았어요."
      },
      {
        "en": "I was very surprised and happy at first.",
        "ko": "처음에는 너무 놀라고 반가웠습니다."
      },
      {
        "en": "We smiled, said hello, and found out that we live in the same neighborhood.",
        "ko": "우리는 미소를 지으며 인사했고, 같은 동네에 산다는 것을 알게 되었어요."
      },
      {
        "en": "We went to Starbucks across the street, drank iced coffee, and talked a lot.",
        "ko": "우리는 건너편 스타벅스에 가서 아이스 커피를 마시며 많은 이야기를 나눴어요."
      },
      {
        "en": "It was a wonderful day, and I will never forget it.",
        "ko": "정말 멋진 하루였고, 영원히 잊지 못할 거예요."
      }
    ],
    "keywords": [
      "nice surprise at park",
      "saw an old colleague",
      "very surprised and happy",
      "live in same neighborhood",
      "Starbucks and talked a lot",
      "never forget it"
    ],
    "tip": "[초간단 공원 만남] 저녁 산책 중 옛 동료 우연한 만남 → 깜짝 놀람과 반가움 → 같은 동네 주민 확인 → 스타벅스 커피 수다 → 뜻깊은 추억.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_park_04",
    "cat": "공원가기",
    "type": "계절/변화",
    "q_en": "How does the park change throughout the four seasons? How do people's activities change depending on the season?",
    "q_ko": "공원은 사계절에 따라 어떻게 변하나요? 계절에 따라 사람들의 활동은 어떻게 달라지나요?",
    "sentences": [
      {
        "en": "The park near my house looks very different in each season.",
        "ko": "우리 집 근처 공원은 계절마다 모습이 아주 달라요."
      },
      {
        "en": "In spring, the park has pretty cherry blossoms and green leaves.",
        "ko": "봄에는 공원에 예쁜 벚꽃과 푸른 잎들이 가득합니다."
      },
      {
        "en": "Many people come out, take pictures, and feel the warm sunshine.",
        "ko": "많은 사람들이 나와서 사진을 찍고 따뜻한 햇살을 즐겨요."
      },
      {
        "en": "In winter, the park is very quiet and covered with white snow.",
        "ko": "겨울에는 공원이 아주 조용하고 하얀 눈으로 덮입니다."
      },
      {
        "en": "Walking on the snow in a warm jacket feels very peaceful.",
        "ko": "따뜻한 패딩을 입고 눈길을 걷는 것은 아주 평화로워요."
      },
      {
        "en": "Both seasons are very charming, and I love walking there alone.",
        "ko": "두 계절 모두 아주 매력적이고, 저는 혼자 걷는 것을 정말 좋아해요."
      }
    ],
    "keywords": [
      "park looks different in each season",
      "spring cherry blossoms",
      "take pictures in warm sunshine",
      "winter quiet with white snow",
      "walking in warm jacket",
      "both seasons charming"
    ],
    "tip": "[초간단 공원 사계절] 봄 벚꽃 풍경 & 피크닉/사진 ➔ 겨울 조용한 설경 & 따뜻한 패딩 산책 ➔ 사계절 산책의 매력.",
    "combo_step": 4,
    "combo_role": "4단계: 변화·비교 심화"
  },
  {
    "id": "q_movie_01",
    "cat": "영화보기",
    "type": "장소/선호",
    "q_en": "You indicated in the survey that you like watching movies. What types of movies do you like, and why do you like them?",
    "q_ko": "설문에서 영화 보기를 좋아한다고 하셨습니다. 어떤 장르의 영화를 좋아하시고, 왜 그 영화들을 좋아하시나요?",
    "sentences": [
      {
        "en": "Whenever I watch movies, my favorite genres are heartwarming comedies and touching dramas.",
        "ko": "영화를 볼 때마다, 제가 가장 좋아하는 장르는 유쾌한 코미디와 감동적인 드라마예요."
      },
      {
        "en": "Comedies are great because they make me laugh and feel very happy.",
        "ko": "코미디는 저를 웃게 해주고 기분을 아주 행복하게 해줘서 좋아요."
      },
      {
        "en": "Touching dramas are also wonderful because the warm stories make me think deeply.",
        "ko": "감동 드라마도 따뜻한 이야기로 깊은 생각을 하게 해줘서 멋집니다."
      },
      {
        "en": "On the other hand, I don't really like scary horror movies or loud action films.",
        "ko": "반면에 저는 무서운 공포 영화나 시끄러운 액션 영화는 별로 안 좋아해요."
      },
      {
        "en": "Watching touching stories at home relieves all my stress after work.",
        "ko": "퇴근 후 집에서 감동적인 이야기를 보면 스트레스가 다 풀려요."
      },
      {
        "en": "So, watching good movies is my favorite hobby.",
        "ko": "그래서 좋은 영화를 보는 것은 제가 가장 좋아하는 취미입니다."
      }
    ],
    "keywords": [
      "comedies and touching dramas",
      "make me laugh and happy",
      "warm stories make me think",
      "dislike scary horror movies",
      "relieves all my stress",
      "favorite hobby"
    ],
    "tip": "[초간단 영화 선호] 코미디(웃음/행복) & 감동 드라마(따뜻한 생각) 선호 ➔ 공포/액션 불호 ➔ 집에서 힐링 ➔ 최애 취미.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_movie_03",
    "cat": "영화보기",
    "type": "일상 루틴",
    "q_en": "Please tell me about what you normally do before, during, and after watching a movie at home.",
    "q_ko": "집에서 영화를 볼 때 영화를 보기 전, 보는 중, 보고 난 후에 보통 무엇을 하시는지 말씀해 주세요.",
    "sentences": [
      {
        "en": "Usually, on weekend nights, I love to watch movies on TV at home.",
        "ko": "보통 주말 밤에 저는 집에서 TV로 영화 보는 것을 정말 좋아해요."
      },
      {
        "en": "First, I turn on my big TV and choose a movie on Netflix.",
        "ko": "먼저 큰 TV를 켜고 넷플릭스에서 영화를 골라요."
      },
      {
        "en": "Then, I prepare some popcorn and a cold drink in the kitchen.",
        "ko": "그 다음 주방에서 팝콘과 시원한 음료를 준비합니다."
      },
      {
        "en": "I sit on my comfortable sofa and focus on the story.",
        "ko": "편안한 소파에 앉아서 줄거리에 푹 빠져서 봅니다."
      },
      {
        "en": "Watching movies alone in my quiet room makes me feel very peaceful.",
        "ko": "조용한 방에서 혼자 영화를 보면 마음이 아주 평화로워져요."
      },
      {
        "en": "It relieves all my stress, so I do it often.",
        "ko": "스트레스가 다 풀려서 저는 자주 이렇게 영화를 봅니다."
      }
    ],
    "keywords": [
      "watch movies on TV at home",
      "choose movie on Netflix",
      "popcorn and cold drink",
      "comfortable sofa and focus",
      "quiet room very peaceful",
      "relieves all my stress"
    ],
    "tip": "[초간단 영화 루틴] 주말 밤 집 영화 → 넷플릭스 선택 → 팝콘 & 시원한 음료 → 소파 몰입 감상 → 혼자만의 평화로운 힐링.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_movie_02",
    "cat": "영화보기",
    "type": "과거 경험",
    "q_en": "Tell me about the most memorable movie you have seen recently. What was the storyline and why was it memorable?",
    "q_ko": "최근에 본 가장 기억에 남는 영화에 대해 말씀해 주세요. 줄거리는 무엇이었고 왜 기억에 남았나요?",
    "sentences": [
      {
        "en": "I remember a movie called The Truman Show that I watched at home.",
        "ko": "집에서 보았던 '트루먼 쇼'라는 영화가 기억나요."
      },
      {
        "en": "The story is about a man named Truman.",
        "ko": "줄거리는 트루먼이라는 한 남자에 대한 이야기예요."
      },
      {
        "en": "People watch his whole life on TV, but he doesn't know it.",
        "ko": "사람들은 그의 일생 전체를 TV로 보는데, 그는 그것을 몰라요."
      },
      {
        "en": "When he finds out the truth, he tries hard to escape to the real world.",
        "ko": "진실을 알았을 때, 그는 진짜 세상으로 탈출하려고 열심히 노력해요."
      },
      {
        "en": "The ending scene where he says goodbye made me cry and feel touched.",
        "ko": "그가 작별 인사를 건네는 마지막 장면은 눈물이 나고 큰 감동을 주었습니다."
      },
      {
        "en": "It was a wonderful movie, and I will never forget it.",
        "ko": "정말 멋진 영화였고, 영원히 잊지 못할 거예요."
      }
    ],
    "keywords": [
      "The Truman Show at home",
      "story about Truman",
      "watch whole life on TV",
      "tries hard to escape",
      "ending scene goodbye made me cry",
      "never forget it"
    ],
    "tip": "[초간단 영화 경험] 집에서 '트루먼 쇼' 감상 → TV 생중계 비밀 줄거리 → 진짜 세상 탈출 노력 → 마지막 작별 인사 감동 → 잊지 못할 명작.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_movie_04",
    "cat": "영화보기",
    "type": "변화/비교",
    "q_en": "How have movie theaters or movie watching habits changed compared to when you were a child?",
    "q_ko": "어릴 적과 비교하여 영화관이나 영화 관람 습관이 어떻게 변화했나요?",
    "sentences": [
      {
        "en": "In the past, watching movies was very different from now.",
        "ko": "과거에는 영화 보는 것이 지금과 많이 달랐어요."
      },
      {
        "en": "In the past, we had to go to the theater or rent DVDs.",
        "ko": "과거에는 극장에 가거나 DVD를 빌려봐야만 했어요."
      },
      {
        "en": "However, now, watching movies is very convenient and easy.",
        "ko": "하지만 지금은 영화 보기가 아주 편리하고 쉬워요."
      },
      {
        "en": "For example, we can watch any movie at home on Netflix anytime.",
        "ko": "예를 들어 집에서 언제든 넷플릭스로 어떤 영화든 볼 수 있어요."
      },
      {
        "en": "Also, movie theaters now have comfortable recliner seats and big screens.",
        "ko": "또한 영화관도 이제 편안한 리클라이너 좌석과 큰 스크린이 있어요."
      },
      {
        "en": "So, I really like these nice changes.",
        "ko": "그래서 저는 이런 좋은 변화들이 정말 마음에 들어요."
      }
    ],
    "keywords": [
      "very different from now",
      "had to rent DVDs",
      "convenient and easy",
      "watch on Netflix anytime",
      "recliner seats and big screens",
      "really like these changes"
    ],
    "tip": "[초간단 영화 변화 비교] 과거 극장/DVD 대여 ➔ 현재 넷플릭스 스트리밍 편의성 ➔ 극장의 고급 리클라이너 좌석 ➔ 대만족.",
    "combo_step": 4,
    "combo_role": "4단계: 변화·비교 심화"
  },
  {
    "id": "q_music_01",
    "cat": "음악감상",
    "type": "장르/선호",
    "q_en": "You indicated in the survey that you like listening to music. What kind of music do you like, and who is your favorite singer?",
    "q_ko": "설문에서 음악 감상을 좋아한다고 하셨습니다. 어떤 음악을 좋아하시고, 가장 좋아하는 가수는 누구인가요?",
    "sentences": [
      {
        "en": "Whenever I listen to music, my favorite genres are soft ballads and acoustic pop.",
        "ko": "음악을 들을 때마다, 제가 가장 좋아하는 장르는 잔잔한 발라드와 어쿠스틱 팝이에요."
      },
      {
        "en": "My favorite singers are Roy Kim and The Beatles.",
        "ko": "제가 가장 좋아하는 가수는 로이킴과 비틀즈입니다."
      },
      {
        "en": "I love Roy Kim's sweet voice and The Beatles' famous songs.",
        "ko": "로이킴의 감미로운 목소리와 비틀즈의 유명한 노래들을 정말 좋아해요."
      },
      {
        "en": "I usually listen to music with wireless earphones while walking in the park near my house.",
        "ko": "저는 보통 집 근처 공원을 걸으면서 무선 이어폰으로 음악을 들어요."
      },
      {
        "en": "Listening to soft music relieves all my stress after work.",
        "ko": "퇴근 후 잔잔한 음악을 들으면 스트레스가 싹 풀려요."
      },
      {
        "en": "So, music is an important part of my daily life, and it always makes me happy.",
        "ko": "그래서 음악은 제 일상의 중요한 부분이고, 항상 저를 행복하게 해줍니다."
      }
    ],
    "keywords": [
      "soft ballads and acoustic pop",
      "Roy Kim and The Beatles",
      "sweet voice and famous songs",
      "earphones in park near house",
      "relieves all my stress",
      "always makes me happy"
    ],
    "tip": "[초간단 음악 선호] 감성 발라드/어쿠스틱 팝 → 로이킴 & 비틀즈 → 집 근처 공원 산책 중 감상 → 퇴근 후 힐링 → 필수 일상.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_music_02",
    "cat": "음악감상",
    "type": "일상 루틴",
    "q_en": "When and where do you usually listen to music? What do you do while listening to music?",
    "q_ko": "언제 어디서 주로 음악을 들으시나요? 음악을 들으면서 무엇을 하시나요?",
    "sentences": [
      {
        "en": "Usually, I listen to music every day on my smartphone.",
        "ko": "보통 저는 스마트폰으로 매일 음악을 들어요."
      },
      {
        "en": "First, when I get ready for work in the morning, I play upbeat pop songs.",
        "ko": "먼저 아침에 출근 준비를 할 때 신나는 팝송을 틉니다."
      },
      {
        "en": "While riding the subway, I put on wireless earphones and listen to calm music.",
        "ko": "지하철을 타고 갈 때는 무선 이어폰을 꽂고 차분한 음악을 들어요."
      },
      {
        "en": "In the evening, I listen to acoustic ballads while resting on my sofa.",
        "ko": "저녁에는 소파에서 쉬면서 어쿠스틱 발라드를 듣습니다."
      },
      {
        "en": "Soft melodies help me calm down and feel very peaceful.",
        "ko": "부드러운 멜로디는 마음을 차분하게 해주고 아주 평화로운 기분이 들게 해줘요."
      },
      {
        "en": "Listening to music brings me great joy, so I do it every day.",
        "ko": "음악을 들으면 큰 기쁨을 얻기 때문에 매일 음악을 듣습니다."
      }
    ],
    "keywords": [
      "listen to music every day",
      "upbeat pop songs in morning",
      "subway with earphones",
      "acoustic ballads on sofa",
      "calm down and peaceful",
      "brings great joy"
    ],
    "tip": "[초간단 음악 루틴] 아침 출근 준비(신나는 팝) → 지하철 출퇴근길(차분한 음악) → 저녁 소파 휴식(어쿠스틱) → 마음 평화와 기쁨.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_music_03",
    "cat": "음악감상",
    "type": "과거 경험",
    "q_en": "Tell me about a time you heard live music, like at a concert or on the street. What was the experience like?",
    "q_ko": "콘서트나 거리 등에서 라이브 음악을 들었던 경험에 대해 말씀해 주세요. 어떤 경험이었나요?",
    "sentences": [
      {
        "en": "I remember a live concert I went to with my friend last year.",
        "ko": "작년에 친구와 함께 갔던 라이브 콘서트가 기억나요."
      },
      {
        "en": "We went to an outdoor music festival on a nice autumn day.",
        "ko": "화창한 가을날 야외 음악 축제에 갔어요."
      },
      {
        "en": "The weather was cool, and the stage lights looked very beautiful.",
        "ko": "날씨도 시원했고 무대 조명도 아주 아름다웠습니다."
      },
      {
        "en": "When the singer sang my favorite ballad song, everyone sang along together.",
        "ko": "가수가 제가 제일 좋아하는 발라드를 부를 때, 다 같이 떼창을 했어요."
      },
      {
        "en": "Hearing the live voice gave me goosebumps and made me very happy.",
        "ko": "라이브 목소리를 들으니 소름이 돋고 정말 행복했습니다."
      },
      {
        "en": "It was a wonderful memory, and I will never forget it.",
        "ko": "정말 멋진 추억이었고, 영원히 잊지 못할 거예요."
      }
    ],
    "keywords": [
      "live concert with friend",
      "outdoor festival in autumn",
      "cool weather and stage lights",
      "everyone sang along together",
      "goosebumps and happy",
      "never forget it"
    ],
    "tip": "[초간단 콘서트 경험] 친구와 가을 야외 콘서트 → 시원한 날씨와 멋진 무대 → 최애곡 떼창 → 감동과 소름 → 잊지 못할 추억.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_exercise_02",
    "cat": "운동하기",
    "type": "장소 묘사",
    "q_en": "You indicated in the survey that you like working out. Please describe the gym or fitness center you go to. What does it look like?",
    "q_ko": "설문에서 운동하기를 좋아한다고 하셨습니다. 다니시는 헬스장에 대해 설명해 주세요. 어떤 모습인가요?",
    "sentences": [
      {
        "en": "Whenever I think of working out, my gym is really my favorite place.",
        "ko": "운동을 생각할 때마다, 헬스장이 진짜 제 최애 장소예요."
      },
      {
        "en": "It is located near my house, so it is very easy to get there.",
        "ko": "저희 집 근처에 있어서, 찾아가기가 정말 편해요."
      },
      {
        "en": "Inside the place, the vibe is very clean, quiet, and cozy.",
        "ko": "그곳 안은 분위기가 아주 깔끔하고 조용하며 아늑해요."
      },
      {
        "en": "There are clean machines and free weights, so I can relax comfortably.",
        "ko": "깨끗한 머신들과 프리웨이트가 있어서 편안하게 쉴 수 있어요."
      },
      {
        "en": "I love this place because exercising alone relieves all my stress after work.",
        "ko": "퇴근 후 혼자 운동하면 스트레스가 싹 풀려서 여길 너무 좋아해요."
      },
      {
        "en": "So, I always feel happy and relaxed whenever I go there.",
        "ko": "그래서 갈 때마다 저는 항상 행복하고 편안함을 느껴요."
      }
    ],
    "keywords": [
      "gym near my house",
      "easy to get there",
      "clean, quiet, and cozy",
      "clean machines and free weights",
      "exercising alone relieves stress",
      "happy and relaxed"
    ],
    "tip": "[만능 헬스장 묘사] 집 근처 헬스장 → 접근성 편함 → 깔끔 조용 아늑한 분위기 → 머신과 프리웨이트 → 퇴근 후 운동 힐링 → 편안함.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_exercise_01",
    "cat": "운동하기",
    "type": "일상 루틴",
    "q_en": "Please describe your typical workout routine. What exercises do you do from start to finish?",
    "q_ko": "일반적인 운동 루틴에 대해 말씀해 주세요. 처음부터 끝까지 어떤 운동을 하시나요?",
    "sentences": [
      {
        "en": "Usually, after work, I love working out at the gym near my house.",
        "ko": "보통 퇴근 후에 저는 집 근처 헬스장에서 운동하는 것을 정말 좋아해요."
      },
      {
        "en": "First, I wear workout clothes, take my water bottle, and go to the gym.",
        "ko": "먼저 운동복을 입고 물병을 챙겨서 헬스장으로 갑니다."
      },
      {
        "en": "When I arrive, I run on the treadmill for ten minutes to warm up.",
        "ko": "도착하면 워밍업으로 러닝머신을 10분 동안 뛰어요."
      },
      {
        "en": "Then, I do simple weight training like chest presses and squats.",
        "ko": "그 다음 체스트 프레스나 스쿼트 같은 간단한 웨이트 트레이닝을 합니다."
      },
      {
        "en": "After stretching, I take a warm shower and feel very refreshed.",
        "ko": "스트레칭을 마친 후 따뜻한 샤워를 하고 나면 아주 개운해요."
      },
      {
        "en": "It relieves all my stress after work, so I work out often.",
        "ko": "퇴근 후 스트레스가 다 풀려서 저는 운동을 자주 합니다."
      }
    ],
    "keywords": [
      "gym near my house",
      "workout clothes and water bottle",
      "treadmill for ten minutes",
      "chest presses and squats",
      "warm shower feels refreshed",
      "relieves all my stress"
    ],
    "tip": "[초간단 헬스 루틴] 집 근처 헬스장 도착 → 러닝머신 10분 웜업 → 웨이트(체스트 프레스, 스쿼트) → 스트레칭 & 샤워 → 스트레스 해소.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_exercise_03",
    "cat": "운동하기",
    "type": "과거 경험",
    "q_en": "Have you ever experienced an injury or an unexpected problem while exercising? What happened and how did you handle it?",
    "q_ko": "운동 중 부상을 입거나 예상치 못한 문제를 겪은 적이 있나요? 무슨 일이 있었고 어떻게 대처하셨나요?",
    "sentences": [
      {
        "en": "I remember a problem when I was exercising at the gym a few months ago.",
        "ko": "몇 달 전 헬스장에서 운동하다가 겪었던 문제가 하나 기억나요."
      },
      {
        "en": "Suddenly, my lower back felt tight and painful while lifting weights.",
        "ko": "웨이트 트레이닝을 하던 중 갑자기 허리가 뻐근하고 아팠어요."
      },
      {
        "en": "I was very surprised and worried at first.",
        "ko": "처음에는 너무 놀라고 걱정이 되었습니다."
      },
      {
        "en": "However, I stopped right away, sat down, and put ice on my back.",
        "ko": "하지만 즉시 멈추고 자리에 앉아 허리에 얼음찜질을 했어요."
      },
      {
        "en": "Fortunately, after resting for two days, my back felt completely fine.",
        "ko": "다행히 이틀 동안 푹 쉬고 나니 허리가 완전히 괜찮아졌어요."
      },
      {
        "en": "It was a lesson to always warm up carefully before working out.",
        "ko": "운동 전에는 항상 준비운동을 꼼꼼히 해야 한다는 교훈을 얻었습니다."
      }
    ],
    "keywords": [
      "problem while exercising",
      "lower back felt painful",
      "surprised and worried",
      "stopped and put ice",
      "resting for two days fine",
      "warm up carefully lesson"
    ],
    "tip": "[초간단 운동 부상 경험] 웨이트 중 허리 통증 발생 → 당황과 걱정 → 즉시 중단 및 얼음찜질 대처 → 이틀 휴식 후 완쾌 → 준비운동의 교훈.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_cook_01",
    "cat": "요리하기",
    "type": "일상 루틴",
    "q_en": "You indicated in the survey that you like cooking. Please describe what you usually cook and your cooking routine step by step.",
    "q_ko": "설문에서 요리하기를 좋아한다고 하셨습니다. 평소 무엇을 요리하시는지 요리 과정을 단계별로 설명해 주세요.",
    "sentences": [
      {
        "en": "Usually, on weekends, I love to cook simple food at home.",
        "ko": "보통 주말에 저는 집에서 간단한 요리를 하는 것을 정말 좋아해요."
      },
      {
        "en": "First, I go to the supermarket and buy fresh eggs, vegetables, and meat.",
        "ko": "먼저 마트에 가서 신선한 계란, 야채, 고기를 사옵니다."
      },
      {
        "en": "When I get home, I wash the ingredients and chop them on a cutting board.",
        "ko": "집에 오면 재료를 씻어서 도마 위에 썰어요."
      },
      {
        "en": "My favorite food to make is simple tomato pasta or kimchi fried rice.",
        "ko": "제가 제일 만들기 좋아하는 음식은 간단한 토마토 파스타나 김치볶음밥이에요."
      },
      {
        "en": "While eating my warm food, I watch YouTube videos in my living room.",
        "ko": "따뜻한 음식을 먹으면서 거실에서 유튜브 영상을 봅니다."
      },
      {
        "en": "Cooking for myself relieves all my stress, so I do it often.",
        "ko": "나를 위해 요리하면 스트레스가 다 풀려서 자주 요리를 해요."
      }
    ],
    "keywords": [
      "cook simple food at home",
      "buy eggs, vegetables, meat",
      "wash and chop ingredients",
      "tomato pasta or kimchi fried rice",
      "eating food watching YouTube",
      "relieves all my stress"
    ],
    "tip": "[초간단 요리 루틴] 마트 장보기(계란/야채/고기) → 재료 손질 → 토마토 파스타 또는 김치볶음밥 조리 → 유튜브 보며 냠냠 → 스트레스 해소.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_cook_02",
    "cat": "요리하기",
    "type": "과거 경험",
    "q_en": "Tell me about a memorable meal you cooked for someone special. What dish did you make, and how did they react?",
    "q_ko": "특별한 사람을 위해 요리했던 기억에 남는 식사에 대해 말씀해 주세요. 어떤 요리를 만들었고 상대방의 반응은 어땠나요?",
    "sentences": [
      {
        "en": "I remember a special day when I cooked dinner for my close friend.",
        "ko": "친한 친구를 위해 저녁을 만들어 주었던 특별한 하루가 기억나요."
      },
      {
        "en": "A few months ago, my friend visited my new apartment on the weekend.",
        "ko": "몇 달 전, 주말에 친구가 제 새 아파트에 놀러 왔어요."
      },
      {
        "en": "I made beef steak, creamy pasta, and a fresh green salad for dinner.",
        "ko": "저는 저녁으로 소고기 스테이크, 크림 파스타, 신선한 샐러드를 만들었어요."
      },
      {
        "en": "My friend tasted the steak and said it was very delicious.",
        "ko": "친구가 스테이크를 맛보더니 정말 맛있다고 칭찬해 주었습니다."
      },
      {
        "en": "We ate the warm food, drank cold soda, and talked a lot.",
        "ko": "우리는 따뜻한 음식을 먹고 시원한 탄산수를 마시며 많은 이야기를 나눴어요."
      },
      {
        "en": "It was a wonderful evening, and I will never forget it.",
        "ko": "정말 멋진 저녁이었고, 영원히 잊지 못할 거예요."
      }
    ],
    "keywords": [
      "cooked dinner for close friend",
      "friend visited my apartment",
      "beef steak and creamy pasta",
      "friend said very delicious",
      "warm food and talked a lot",
      "never forget it"
    ],
    "tip": "[초간단 요리 대접] 친구 집들이 방문 → 소고기 스테이크 & 크림 파스타 조리 → 친구의 폭풍 칭찬 → 즐거운 식사와 대화 → 뿌듯한 추억.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_cook_03",
    "cat": "요리하기",
    "type": "과거 경험",
    "q_en": "Have you ever experienced an unexpected problem or accident while cooking? What happened and how did you resolve it?",
    "q_ko": "요리 중에 예상치 못한 문제나 실수를 겪은 적이 있나요? 무슨 일이 있었고 어떻게 해결하셨나요?",
    "sentences": [
      {
        "en": "I remember a problem when I was cooking dinner in my kitchen.",
        "ko": "주방에서 저녁 요리를 하던 중에 겪었던 문제가 하나 기억나요."
      },
      {
        "en": "Suddenly, there was a lot of smoke while I was cooking steak.",
        "ko": "스테이크를 굽던 중 갑자기 연기가 많이 났어요."
      },
      {
        "en": "The smoke alarm rang, so I was very surprised and worried at first.",
        "ko": "화재경보기가 울려서 처음에는 너무 놀라고 걱정이 되었습니다."
      },
      {
        "en": "However, I calmed down, turned off the stove, and opened all the windows.",
        "ko": "하지만 마음을 가라앉히고, 가스레인지를 끄고 모든 창문을 활짝 열었어요."
      },
      {
        "en": "Fortunately, the smoke went away quickly, and the steak tasted great.",
        "ko": "다행히 연기는 금방 빠져나갔고, 스테이크도 맛있었어요."
      },
      {
        "en": "It was surprising, but it became a funny and good memory.",
        "ko": "놀라운 일이었지만, 재미있고 좋은 추억이 되었습니다."
      }
    ],
    "keywords": [
      "problem while cooking dinner",
      "smoke while cooking steak",
      "smoke alarm rang surprised",
      "turned off stove opened windows",
      "smoke went away steak tasted great",
      "funny and good memory"
    ],
    "tip": "[초간단 요리 돌발상황] 스테이크 연기 발생 → 화재경보기 울림 당황 → 침착하게 불 끄고 창문 환기 대처 → 연기 배출 및 맛있는 식사 → 유쾌한 교훈.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_trip_02",
    "cat": "국내여행",
    "type": "장소 묘사",
    "q_en": "You indicated in the survey that you enjoy traveling in your country. Please describe your favorite travel destination or driving route.",
    "q_ko": "설문에서 국내 여행을 좋아한다고 하셨습니다. 가장 좋아하시는 여행지나 드라이브 코스에 대해 설명해 주세요.",
    "sentences": [
      {
        "en": "Whenever I think of relaxing, the quiet route is really my favorite place.",
        "ko": "휴식을 생각할 때마다, 한적한 드라이브 코스가 진짜 제 최애 장소예요."
      },
      {
        "en": "It is located near my house, so it is very easy to get there.",
        "ko": "저희 집 근처에 있어서, 찾아가기가 정말 편해요."
      },
      {
        "en": "Inside the place, the vibe is very clean, quiet, and cozy.",
        "ko": "그곳 안은 분위기가 아주 깔끔하고 조용하며 아늑해요."
      },
      {
        "en": "There are scenic views and quiet roads, so I can relax comfortably.",
        "ko": "멋진 풍경과 한적한 도로가 있어서 편안하게 쉴 수 있어요."
      },
      {
        "en": "I love this place because driving alone relieves all my stress after work.",
        "ko": "퇴근 후 혼자 드라이브를 하면 스트레스가 싹 풀려서 여길 너무 좋아해요."
      },
      {
        "en": "So, I always feel happy and relaxed whenever I go there.",
        "ko": "그래서 갈 때마다 저는 항상 행복하고 편안함을 느껴요."
      }
    ],
    "keywords": [
      "quiet route favorite place",
      "near my house easy to get there",
      "clean, quiet, and cozy",
      "scenic views and quiet roads",
      "driving alone relieves stress",
      "happy and relaxed"
    ],
    "tip": "[만능 드라이브 묘사] 집 근처 한적한 길 → 접근성 편리함 → 조용하고 아늑함 → 멋진 풍경과 도로 → 퇴근 후 드라이브 힐링 → 편안함.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_trip_03",
    "cat": "국내여행",
    "type": "과거 경험",
    "q_en": "Tell me about a memorable domestic trip you took recently. Where did you go and why was it so memorable?",
    "q_ko": "최근에 다녀온 기억에 남는 국내 여행에 대해 말씀해 주세요. 어디로 가셨고 왜 기억에 남나요?",
    "sentences": [
      {
        "en": "I remember a wonderful trip to Jeju Island last year.",
        "ko": "작년에 다녀왔던 멋진 제주도 여행이 기억나요."
      },
      {
        "en": "I went there alone for three days to take a peaceful rest.",
        "ko": "평화로운 휴식을 취하기 위해 2박 3일 동안 혼자 그곳에 갔어요."
      },
      {
        "en": "The ocean was very blue, and the fresh air made me feel great.",
        "ko": "바다가 아주 파랬고, 상쾌한 공기 덕분에 기분이 정말 좋았어요."
      },
      {
        "en": "I drove along the coast road and ate fresh seafood at a local restaurant.",
        "ko": "해안 도로를 따라 드라이브하고 현지 식당에서 신선한 해산물을 먹었습니다."
      },
      {
        "en": "I walked on the beach, looked at the sunset, and took many pictures.",
        "ko": "해변을 걷고 노을을 바라보며 사진도 많이 찍었어요."
      },
      {
        "en": "It was a wonderful trip, and I will never forget it.",
        "ko": "정말 멋진 여행이었고, 영원히 잊지 못할 거예요."
      }
    ],
    "keywords": [
      "trip to Jeju Island last year",
      "alone for three days",
      "blue ocean and fresh air",
      "drove coast road and seafood",
      "walked on beach and sunset",
      "never forget it"
    ],
    "tip": "[초간단 제주도 여행] 나 홀로 2박 3일 제주 힐링 여행 → 푸른 바다와 상쾌한 공기 → 해안도로 드라이브 & 해산물 먹방 → 일몰 감상 및 사진 → 평생 추억.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_trip_01",
    "cat": "국내여행",
    "type": "일상 루틴",
    "q_en": "What do you usually do before going on a trip? How do you prepare and pack your luggage?",
    "q_ko": "여행을 떠나기 전 보통 무엇을 하시나요? 여행 준비와 짐 싸기는 어떻게 하시나요?",
    "sentences": [
      {
        "en": "Usually, before going on a trip, I prepare everything step by step.",
        "ko": "보통 여행을 가기 전에 차근차근 모든 것을 준비해요."
      },
      {
        "en": "First, I check the weather and make a simple packing list on my smartphone.",
        "ko": "먼저 날씨를 확인하고 스마트폰에 간단한 짐 싸기 목록을 적어요."
      },
      {
        "en": "Then, I pack comfortable clothes, chargers, and toiletries into my backpack.",
        "ko": "그 다음 편안한 옷, 충전기, 세면도구를 배낭에 챙깁니다."
      },
      {
        "en": "Before leaving home, I make sure the windows are closed and gas is turned off.",
        "ko": "집을 나서기 전 창문이 닫혔는지와 가스 밸브를 확인해요."
      },
      {
        "en": "Preparing carefully makes my trip safe and comfortable.",
        "ko": "꼼꼼하게 준비하면 여행이 안전하고 편안해집니다."
      },
      {
        "en": "When everything is ready, I feel very excited to start my trip.",
        "ko": "모든 준비가 끝나면 여행을 떠날 생각에 정말 설레요."
      }
    ],
    "keywords": [
      "prepare everything step by step",
      "check weather and packing list",
      "pack clothes and chargers",
      "check windows and gas",
      "safe and comfortable",
      "excited to start trip"
    ],
    "tip": "[초간단 여행 준비] 날씨 확인 및 스마트폰 체크리스트 → 옷/충전기/세면도구 패킹 → 창문/가스 밸브 확인 → 안전하고 설레는 출발.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_camp_02",
    "cat": "캠핑하기",
    "type": "장소 묘사",
    "q_en": "You indicated in the survey that you like going camping. Please describe your favorite campsite. Where is it and what does it look like?",
    "q_ko": "설문에서 캠핑 가기를 좋아한다고 하셨습니다. 가장 좋아하시는 캠핑장에 대해 설명해 주세요. 어디에 있고 어떻게 생겼나요?",
    "sentences": [
      {
        "en": "Whenever I think of outdoor trips, a campsite near the lake is my favorite place.",
        "ko": "야외 나들이를 생각할 때마다, 호숫가 근처 캠핑장이 제 최애 장소예요."
      },
      {
        "en": "It is about one hour by car from my house, so it is very easy to get there.",
        "ko": "저희 집에서 차로 1시간 정도 걸려서, 찾아가기가 정말 편해요."
      },
      {
        "en": "Inside the campsite, the vibe is very clean, quiet, and peaceful.",
        "ko": "캠핑장 안은 분위기가 아주 깔끔하고 조용하며 평화로워요."
      },
      {
        "en": "There are tall green trees and a clean lake, so I can relax comfortably.",
        "ko": "키 큰 푸른 나무들과 깨끗한 호수가 있어서 편안하게 쉴 수 있어요."
      },
      {
        "en": "I love this place because resting in nature relieves all my stress after work.",
        "ko": "자연 속에서 쉬면 퇴근 후 스트레스가 싹 풀려서 여길 너무 좋아해요."
      },
      {
        "en": "So, I always feel happy and relaxed whenever I go there.",
        "ko": "그래서 갈 때마다 저는 항상 행복하고 편안함을 느껴요."
      }
    ],
    "keywords": [
      "campsite near the lake",
      "one hour by car",
      "clean, quiet, and peaceful",
      "tall green trees and clean lake",
      "nature relieves stress",
      "happy and relaxed"
    ],
    "tip": "[만능 캠핑장 묘사] 호숫가 캠핑장 → 차로 1시간 거리 → 조용하고 평화로운 자연 → 나무와 호수 → 자연 속 힐링 → 편안함.",
    "combo_step": 1,
    "combo_role": "1단계: 장소·대상 묘사"
  },
  {
    "id": "q_camp_01",
    "cat": "캠핑하기",
    "type": "일상 루틴",
    "q_en": "What do you usually do when you go camping? Please describe your typical camping routine from the moment you arrive to when you pack up.",
    "q_ko": "캠핑을 가면 보통 무엇을 하시나요? 도착했을 때부터 짐을 정리할 때까지의 일반적인 캠핑 일과를 설명해 주세요.",
    "sentences": [
      {
        "en": "Usually, when I go camping, I have a simple and relaxing routine.",
        "ko": "보통 캠핑을 가면 간단하고 편안한 일과를 보냅니다."
      },
      {
        "en": "First, when I arrive at the campsite, I set up my tent and a folding chair.",
        "ko": "먼저 캠핑장에 도착하면 텐트와 접이식 의자를 칩니다."
      },
      {
        "en": "Then, I sit down and drink warm coffee while looking at the mountain.",
        "ko": "그 다음 산을 바라보며 자리에 앉아 따뜻한 커피를 마셔요."
      },
      {
        "en": "In the evening, I cook delicious meat on a portable stove and listen to music.",
        "ko": "저녁에는 휴대용 버너로 맛있는 고기를 구워 먹고 음악을 들어요."
      },
      {
        "en": "Looking at the stars in the night sky makes me feel very peaceful.",
        "ko": "밤하늘의 별을 바라보고 있으면 마음이 아주 평화로워집니다."
      },
      {
        "en": "Resting in nature relieves all my stress, so I go camping often.",
        "ko": "자연 속에서 쉬면 모든 스트레스가 풀려서 자주 캠핑을 가요."
      }
    ],
    "keywords": [
      "simple camping routine",
      "set up tent and chair",
      "drink coffee looking at mountain",
      "cook meat and listen to music",
      "stars in night sky peaceful",
      "relieves all my stress"
    ],
    "tip": "[초간단 캠핑 루틴] 텐트 & 의자 설치 → 산 보며 커피 한 잔 → 고기 구이 & 음악 → 밤하늘 별 보기 → 스트레스 해소.",
    "combo_step": 2,
    "combo_role": "2단계: 일상 루틴·활동"
  },
  {
    "id": "q_camp_03",
    "cat": "캠핑하기",
    "type": "과거 경험",
    "q_en": "Tell me about a memorable or unexpected incident that happened while you were camping. How did you deal with it?",
    "q_ko": "캠핑 중에 발생했던 기억에 남거나 예상치 못했던 사건에 대해 말씀해 주세요. 어떻게 대처하셨나요?",
    "sentences": [
      {
        "en": "I remember a problem when I was camping near the lake a few months ago.",
        "ko": "몇 달 전 호숫가에서 캠핑을 하던 중 겪었던 문제가 하나 기억나요."
      },
      {
        "en": "In the middle of the night, strong wind began shaking my tent.",
        "ko": "한밤중에 강한 바람이 불어서 텐트가 흔들리기 시작했어요."
      },
      {
        "en": "The wind noise was loud, so I was very surprised and worried at first.",
        "ko": "바람 소리가 너무 커서 처음에는 많이 놀라고 걱정되었어요."
      },
      {
        "en": "However, I took my flashlight, went outside, and fixed the tent ropes.",
        "ko": "하지만 손전등을 챙겨 밖으로 나가 텐트 줄을 단단히 고정했어요."
      },
      {
        "en": "Fortunately, my tent became safe, and I slept well until morning.",
        "ko": "다행히 텐트가 안전해졌고, 아침까지 잘 잤습니다."
      },
      {
        "en": "It was scary, but it taught me to always prepare carefully.",
        "ko": "무서웠지만, 항상 꼼꼼하게 준비해야 한다는 교훈을 얻었어요."
      }
    ],
    "keywords": [
      "problem while camping",
      "strong wind shaking tent",
      "wind noise loud worried",
      "flashlight fixed tent ropes",
      "tent safe slept well",
      "prepare carefully lesson"
    ],
    "tip": "[초간단 캠핑 문제해결] 야간 강풍에 텐트 흔들림 → 당황과 걱정 → 손전등 들고 텐트 줄 고정 대처 → 안전 확보 후 숙면 → 사전 대비의 교훈.",
    "combo_step": 3,
    "combo_role": "3단계: 과거 기억·경험"
  },
  {
    "id": "q_rp_01",
    "cat": "롤플레이",
    "type": "정보 문의",
    "q_en": "You want to buy tickets for a concert or festival with your friend. Call the ticket box office and ask three or four questions about the event.",
    "q_ko": "친구와 함께 콘서트나 축제에 가려고 티켓을 구매하려 합니다. 매표소에 전화해 행사와 관련된 질문 3~4가지를 해보세요.",
    "sentences": [
      {
        "en": "Hello, I have a few questions about the festival tickets.",
        "ko": "안녕하세요, 축제 티켓에 대해 몇 가지 질문이 있어요."
      },
      {
        "en": "First, what dates and seats do you have right now?",
        "ko": "먼저, 지금 어떤 날짜와 좌석이 있나요?"
      },
      {
        "en": "Also, what is the ticket price, and do you have any discounts?",
        "ko": "그리고 티켓 가격은 얼마이고, 혹시 할인이 있나요?"
      },
      {
        "en": "By the way, is parking free for ticket holders?",
        "ko": "그런데 티켓이 있으면 주차는 무료인가요?"
      },
      {
        "en": "I would like to book two good seats right now.",
        "ko": "지금 좋은 자리로 2장 예약하고 싶어요."
      },
      {
        "en": "Thank you so much for your help. Have a nice day!",
        "ko": "도와주셔서 정말 감사합니다. 좋은 하루 보내세요!"
      }
    ],
    "keywords": [
      "questions about tickets",
      "dates and seats right now",
      "ticket price and discounts",
      "parking free for tickets",
      "book two good seats",
      "have a nice day"
    ],
    "tip": "[초간단 롤플레이 정보문의] 전화 인사 & 목적 ➔ 날짜/좌석 문의 ➔ 가격 및 할인 확인 ➔ 무료 주차 문의 ➔ 2장 즉시 예약 ➔ 감사 인사.",
    "combo_step": 1,
    "combo_role": "11번: 상황 질문·문의"
  },
  {
    "id": "q_rp_02",
    "cat": "롤플레이",
    "type": "문제 해결",
    "q_en": "You made an appointment to meet a friend at a cafe, but you are running late. Call your friend, explain the situation, and suggest two alternatives.",
    "q_ko": "친구와 카페에서 만나기로 약속했으나 늦어지고 있습니다. 친구에게 전화해 상황을 설명하고 2가지 대안을 제시해 보세요.",
    "sentences": [
      {
        "en": "Hi Minsoo, it's Hyosang! I'm really sorry, but I have urgent work at the office.",
        "ko": "안녕 민수야, 효상이야! 정말 미안한데 회사에 급한 일이 생겼어."
      },
      {
        "en": "Because of heavy traffic, I think I will be thirty minutes late.",
        "ko": "차도 너무 막혀서 30분 정도 늦을 것 같아."
      },
      {
        "en": "Can we meet thirty minutes later so you don't wait outside?",
        "ko": "밖에서 안 기다리게 30분만 늦게 만나도 될까?"
      },
      {
        "en": "Please go into Starbucks near my house first. I will buy you coffee and cake!",
        "ko": "우리 집 근처 스타벅스에 먼저 들어가 있어. 내가 커피랑 케이크 살게!"
      },
      {
        "en": "If you are tired today, we can meet tomorrow instead.",
        "ko": "만약 오늘 피곤하면 대신 내일 만나도 괜찮아."
      },
      {
        "en": "I am really sorry, and I will get there as fast as I can!",
        "ko": "정말 미안하고, 최대한 빨리 갈게!"
      }
    ],
    "keywords": [
      "urgent work at office",
      "heavy traffic thirty minutes late",
      "meet thirty minutes later",
      "Starbucks will buy coffee",
      "meet tomorrow instead",
      "get there as fast as I can"
    ],
    "tip": "[초간단 롤플레이 지연 대안] 급한 일 & 차 막힘 사과 ➔ 대안 1 (30분 미루기) ➔ 집 근처 스벅 대기 (내가 살게!) ➔ 대안 2 (내일 만남) ➔ 안전 도착 다짐.",
    "combo_step": 2,
    "combo_role": "12번: 문제 해결·대안"
  },
  {
    "id": "q_rp_03",
    "cat": "롤플레이",
    "type": "유사 과거 경험",
    "q_en": "Have you ever experienced an unexpected problem related to purchasing tickets or making a reservation, similar to the situation before? What happened and how did you resolve it?",
    "q_ko": "이전 상황과 유사하게, 공연 티켓을 예매하거나 약속/예약을 할 때 예상치 못한 문제를 겪은 적이 있나요? 무슨 일이 있었고 어떻게 해결하셨는지 자세히 말씀해 주세요.",
    "sentences": [
      {
        "en": "Yes, I remember a problem when I tried to book concert tickets with my friend last year.",
        "ko": "네, 작년에 친구와 콘서트 티켓을 예매하려다 겪었던 문제가 하나 기억나요."
      },
      {
        "en": "When the website opened, the server suddenly crashed because of too many people.",
        "ko": "웹사이트가 열렸을 때, 사람이 너무 많아서 서버가 갑자기 다운되었어요."
      },
      {
        "en": "I was very worried, but I quickly opened my smartphone app and called customer service.",
        "ko": "매우 걱정스러웠지만, 재빨리 스마트폰 앱을 켜고 고객센터에 전화를 걸었어요."
      },
      {
        "en": "Fortunately, a kind worker helped me get two great seats.",
        "ko": "다행히도 친절한 직원분이 좋은 자리 2석을 예매하도록 도와주셨어요."
      },
      {
        "en": "In the end, my friend and I enjoyed the concert without any problem.",
        "ko": "결국 친구와 저는 아무 문제 없이 콘서트를 잘 즐겼습니다."
      },
      {
        "en": "Through that day, I learned that it is important to stay calm when problems happen.",
        "ko": "그 일을 통해 문제가 생겼을 때 침착한 것이 중요하다는 것을 배웠습니다."
      }
    ],
    "keywords": [
      "problem booking concert tickets",
      "server crashed too many people",
      "smartphone app and customer service",
      "kind worker helped get seats",
      "enjoyed concert without problem",
      "important to stay calm"
    ],
    "tip": "[초간단 롤플레이 과거경험] 티켓 예매 시도 ➔ 접속 폭주 서버 다운 당황 ➔ 스마트폰 앱 전환 & 고객센터 문의 대안 ➔ 2석 예매 성공 ➔ 침착함의 교훈.",
    "combo_step": 3,
    "combo_role": "13번: 유사 과거 경험"
  }
];

// Auto-synthesize full answer strings from sentences for zero-maintenance consistency
window.QUESTIONS_DATA.forEach(q => {
  if (Array.isArray(q.sentences)) {
    q.answer_en = q.sentences.map(s => s.en).join(" ");
    q.answer_ko = q.sentences.map(s => s.ko).join(" ");
  }
});
