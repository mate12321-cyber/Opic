window.PATTERNS_DATA = [
  {
    id: "pat_01",
    name: "장소 & 선호 묘사 만능 템플릿",
    category: "내 방, 카페, 공원, 영화관, 헬스장, 마트, 드라이브, 캠핑 등",
    icon: "🏠",
    desc: "어떤 장소나 좋아하는 곳을 말할 때, 6개 쉬운 문장으로 1~2단어만 바꿔서 바로 끝내는 만능 공식입니다.",
    skeleton: [
      {
        en: "1. Whenever I think of [주제], [장소명] is my favorite place.",
        ko: "1. [주제]를 생각할 때마다, [장소명]이 제 최애 장소예요.",
      },
      {
        en: "2. It is located near my house, so it is just five minutes.",
        ko: "2. 저희 집 근처에 있어서, 딱 5분 거리예요.",
      },
      {
        en: "3. And the vibe is very clean, quiet, and cozy.",
        ko: "3. 그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
      },
      {
        en: "4. There are [특징 1] and [특징 2], so I really like it.",
        ko: "4. [특징 1]과 [특징 2]가 있어서 정말 마음에 들어요.",
      },
      {
        en: "5. It is the best place for me.",
        ko: "5. 저한테는 여기가 최고의 장소예요.",
      },
      {
        en: "6. So, I go there all the time.",
        ko: "6. 그래서 저는 거기를 맨날(자주) 가요.",
      },
    ],
    variations: [
      {
        topic: "🏠 내 방 (집)",
        keyword: "my room in my apartment",
        sentences: [
          {
            en: "Whenever I think of my home, my room is my favorite place.",
            ko: "집을 생각할 때마다, 제 방이 제 최애 장소예요.",
          },
          {
            en: "It is located near my office, so it is just five minutes.",
            ko: "회사 근처에 있어서, 딱 5분 거리예요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "There are a soft bed and a nice desk, so I really like it.",
            ko: "푹신한 침대와 좋은 책상이 있어서 정말 마음에 들어요.",
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
      },
      {
        topic: "☕ 카페",
        keyword: "Starbucks near my house",
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
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "There are large windows and nice seats, so I really like it.",
            ko: "큰 창문과 편안한 좌석이 있어서 정말 마음에 들어요.",
          },
          {
            en: "It is the best place for me.",
            ko: "저한테는 여기가 최고의 장소예요.",
          },
          {
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
      {
        topic: "🌳 공원",
        keyword: "the park near my house",
        sentences: [
          {
            en: "Whenever I think of parks, the park is my favorite place.",
            ko: "공원을 생각할 때마다, 공원이 제 최애 장소예요.",
          },
          {
            en: "It is located near my house, so it is just five minutes.",
            ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "There are green trees and nice benches, so I really like it.",
            ko: "푸른 나무들과 편안한 벤치가 있어서 정말 마음에 들어요.",
          },
          {
            en: "It is the best place for me.",
            ko: "저한테는 여기가 최고의 장소예요.",
          },
          {
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
      {
        topic: "🎬 영화관",
        keyword: "Megabox near my house",
        sentences: [
          {
            en: "Whenever I think of movies, Megabox is my favorite place.",
            ko: "영화를 생각할 때마다, 메가박스가 제 최애 장소예요.",
          },
          {
            en: "It is located near my house, so it is just five minutes.",
            ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "There are large screens and nice seats, so I really like it.",
            ko: "큰 스크린과 편안한 좌석이 있어서 정말 마음에 들어요.",
          },
          {
            en: "It is the best place for me.",
            ko: "저한테는 여기가 최고의 장소예요.",
          },
          {
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
      {
        topic: "🏋️ 헬스장",
        keyword: "the gym near my house",
        sentences: [
          {
            en: "Whenever I think of working out, my gym is my favorite place.",
            ko: "운동을 생각할 때마다, 헬스장이 제 최애 장소예요.",
          },
          {
            en: "It is located near my house, so it is just five minutes.",
            ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "There are clean machines and free weights, so I really like it.",
            ko: "깨끗한 머신들과 프리웨이트가 있어서 정말 마음에 들어요.",
          },
          {
            en: "It is the best place for me.",
            ko: "저한테는 여기가 최고의 장소예요.",
          },
          {
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
      {
        topic: "🛒 대형마트",
        keyword: "E-Mart near my house",
        sentences: [
          {
            en: "Whenever I think of shopping, E-Mart is my favorite place.",
            ko: "쇼핑을 생각할 때마다, 이마트가 제 최애 장소예요.",
          },
          {
            en: "It is located near my house, so it is just five minutes.",
            ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "There are fresh food and nice snacks, so I really like it.",
            ko: "신선한 음식과 맛있는 간식이 있어서 정말 마음에 들어요.",
          },
          {
            en: "It is the best place for me.",
            ko: "저한테는 여기가 최고의 장소예요.",
          },
          {
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
      {
        topic: "🚗 드라이브",
        keyword: "the quiet countryside route",
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
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
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
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
      {
        topic: "🏕️ 캠핑장",
        keyword: "the campsite near the lake",
        sentences: [
          {
            en: "Whenever I think of camping, the campsite is my favorite place.",
            ko: "캠핑을 생각할 때마다, 캠핑장이 제 최애 장소예요.",
          },
          {
            en: "It is located near my house, so it is just five minutes.",
            ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
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
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
    ],
  },
  {
    id: "pat_02",
    name: "일상 & 활동 루틴 만능 템플릿",
    category: "카페 일과, 공원 산책, 헬스장 운동, 주말 요리, 취미 코딩 등",
    icon: "⏰",
    desc: "주말이나 평소 일과를 묻는 질문에 장소 템플릿과 똑같은 6문장으로 쉽고 자연스럽게 답하는 만능 공식입니다.",
    skeleton: [
      {
        en: "1. Whenever I have free time, I love to [활동/장소].",
        ko: "1. 여유 시간이 있을 때마다, 저는 [활동/장소]하는 것을 좋아해요.",
      },
      {
        en: "2. It is located near my house, so it is just five minutes.",
        ko: "2. 저희 집 근처에 있어서, 딱 5분 거리예요.",
      },
      {
        en: "3. And the vibe is very clean, quiet, and cozy.",
        ko: "3. 그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
      },
      {
        en: "4. I usually [행동 1] and [행동 2], so I really like it.",
        ko: "4. 저는 보통 [행동 1]과 [행동 2]를 하는데, 정말 마음에 들어요.",
      },
      {
        en: "5. It is the best time for me.",
        ko: "5. 저한테는 최고의 힐링 시간이에요.",
      },
      {
        en: "6. So, I go there all the time.",
        ko: "6. 그래서 저는 거기를 맨날(자주) 가요.",
      },
    ],
    variations: [
      {
        topic: "☕ 카페",
        keyword: "visit Starbucks alone",
        sentences: [
          {
            en: "Whenever I have free time, I love to go to Starbucks.",
            ko: "여유 시간이 있을 때마다, 저는 스타벅스에 가는 것을 좋아해요.",
          },
          {
            en: "It is located near my house, so it is just five minutes.",
            ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "I usually drink iced coffee and read news, so I really like it.",
            ko: "저는 보통 아이스 커피를 마시고 뉴스를 보는데, 정말 마음에 들어요.",
          },
          {
            en: "It is the best time for me.",
            ko: "저한테는 최고의 힐링 시간이에요.",
          },
          {
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
      {
        topic: "🚶 공원 산책",
        keyword: "walk in the park",
        sentences: [
          {
            en: "Whenever I have free time, I love to walk in the park.",
            ko: "여유 시간이 있을 때마다, 저는 공원에서 산책하는 것을 좋아해요.",
          },
          {
            en: "It is located near my house, so it is just five minutes.",
            ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "I usually walk slowly and listen to music, so I really like it.",
            ko: "저는 보통 천천히 걸으며 음악을 듣는데, 정말 마음에 들어요.",
          },
          {
            en: "It is the best time for me.",
            ko: "저한테는 최고의 힐링 시간이에요.",
          },
          {
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
      {
        topic: "🏋️ 헬스장 운동",
        keyword: "work out at the gym",
        sentences: [
          {
            en: "Whenever I have free time, I love to work out at the gym.",
            ko: "여유 시간이 있을 때마다, 저는 헬스장에서 운동하는 것을 좋아해요.",
          },
          {
            en: "It is located near my house, so it is just five minutes.",
            ko: "저희 집 근처에 있어서, 딱 5분 거리예요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "I usually run on the treadmill and lift weights, so I really like it.",
            ko: "저는 보통 러닝머신을 뛰고 웨이트를 하는데, 정말 마음에 들어요.",
          },
          {
            en: "It is the best time for me.",
            ko: "저한테는 최고의 힐링 시간이에요.",
          },
          {
            en: "So, I go there all the time.",
            ko: "그래서 저는 거기를 맨날(자주) 가요.",
          },
        ],
      },
      {
        topic: "🍳 요리",
        keyword: "cook delicious food at home",
        sentences: [
          {
            en: "Whenever I have free time, I love to cook delicious food.",
            ko: "여유 시간이 있을 때마다, 저는 맛있는 요리를 하는 것을 좋아해요.",
          },
          {
            en: "My kitchen is very clean, so it is just comfortable.",
            ko: "저희 주방이 아주 깔끔해서, 요리하기 정말 편해요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "I usually make simple pasta and eat nicely, so I really like it.",
            ko: "저는 보통 간단한 파스타를 만들어 맛있게 먹는데, 정말 마음에 들어요.",
          },
          {
            en: "It is the best time for me.",
            ko: "저한테는 최고의 힐링 시간이에요.",
          },
          {
            en: "So, I do it all the time.",
            ko: "그래서 저는 이걸 맨날(자주) 해요.",
          },
        ],
      },
      {
        topic: "💻 취미 코딩",
        keyword: "study coding at desk",
        sentences: [
          {
            en: "Whenever I have free time, I love to study coding.",
            ko: "여유 시간이 있을 때마다, 저는 코딩 공부하는 것을 좋아해요.",
          },
          {
            en: "My room has a nice desk, so it is just comfortable.",
            ko: "제 방에 좋은 책상이 있어서, 공부하기 정말 편해요.",
          },
          {
            en: "And the vibe is very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑해요.",
          },
          {
            en: "I usually turn on my computer and make web tools, so I really like it.",
            ko: "저는 보통 컴퓨터를 켜고 웹 도구를 만드는데, 정말 마음에 들어요.",
          },
          {
            en: "It is the best time for me.",
            ko: "저한테는 최고의 힐링 시간이에요.",
          },
          {
            en: "So, I do it all the time.",
            ko: "그래서 저는 이걸 맨날(자주) 해요.",
          },
        ],
      },
    ],
  },
  {
    id: "pat_03",
    name: "과거 경험 & 기억에 남는 일 템플릿",
    category: "영화 감상, 지역 축제 방문, 새 아파트 이사, 캠핑, 카페 등",
    icon: "✨",
    desc: "어떤 주제든 과거에 있었던 기억에 남는 일을 물을 때, 장소 템플릿과 똑같은 쉬운 6문장으로 완주하는 만능 공식입니다.",
    skeleton: [
      {
        en: "1. Whenever I think of [주제], I remember a special day.",
        ko: "1. [주제]를 생각할 때마다, 특별했던 하루가 기억나요.",
      },
      {
        en: "2. Last year, I [과거 행동] with my friends.",
        ko: "2. 작년에, 저는 친구들과 함께 [과거 행동]을 했어요.",
      },
      {
        en: "3. And the vibe was very clean, quiet, and cozy.",
        ko: "3. 그리고 분위기가 아주 깔끔하고 조용하며 아늑했어요.",
      },
      {
        en: "4. There were [특징 1] and [특징 2], so I really liked it.",
        ko: "4. [특징 1]과 [특징 2]가 있어서 정말 마음에 들었어요.",
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
        keyword: "watching a movie at home",
        sentences: [
          {
            en: "Whenever I think of movies, I remember a special day.",
            ko: "영화를 생각할 때마다, 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I watched a movie at home alone.",
            ko: "작년에, 저는 집에서 혼자 영화를 보았어요.",
          },
          {
            en: "And the vibe was very quiet and cozy.",
            ko: "그리고 분위기가 아주 조용하고 아늑했어요.",
          },
          {
            en: "There were a soft sofa and delicious popcorn, so I really liked it.",
            ko: "푹신한 소파와 맛있는 팝콘이 있어서 정말 마음에 들었어요.",
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
            en: "Whenever I think of festivals, I remember a special day.",
            ko: "축제를 생각할 때마다, 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I went to a festival with my friends.",
            ko: "작년에, 저는 친구들과 함께 축제에 갔어요.",
          },
          {
            en: "And the vibe was very fun and exciting.",
            ko: "그리고 분위기가 아주 재미있고 신났어요.",
          },
          {
            en: "There were exciting music and tasty food, so I really liked it.",
            ko: "신나는 음악과 맛있는 음식이 있어서 정말 마음에 들었어요.",
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
            en: "Whenever I think of my home, I remember a special day.",
            ko: "제 집을 생각할 때마다, 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I moved into my new apartment alone.",
            ko: "작년에, 저는 혼자 새 아파트로 이사했어요.",
          },
          {
            en: "And the vibe was very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑했어요.",
          },
          {
            en: "There were a soft bed and a big TV, so I really liked it.",
            ko: "푹신한 침대와 큰 TV가 있어서 정말 마음에 들었어요.",
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
        keyword: "camping near the lake",
        sentences: [
          {
            en: "Whenever I think of camping, I remember a special day.",
            ko: "캠핑을 생각할 때마다, 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I went camping near the lake with my friend.",
            ko: "작년에, 저는 친구와 함께 호숫가 근처로 캠핑을 갔어요.",
          },
          {
            en: "And the vibe was very clean, quiet, and peaceful.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 평화로웠어요.",
          },
          {
            en: "There were tall green trees and delicious meat, so I really liked it.",
            ko: "키 큰 푸른 나무들과 맛있는 고기가 있어서 정말 마음에 들었어요.",
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
        keyword: "meeting a friend at Starbucks",
        sentences: [
          {
            en: "Whenever I think of cafes, I remember a special day.",
            ko: "카페를 생각할 때마다, 특별했던 하루가 기억나요.",
          },
          {
            en: "Last year, I met an old friend at Starbucks.",
            ko: "작년에, 저는 스타벅스에서 오랜 친구를 만났어요.",
          },
          {
            en: "And the vibe was very clean, quiet, and cozy.",
            ko: "그리고 분위기가 아주 깔끔하고 조용하며 아늑했어요.",
          },
          {
            en: "There were large windows and sweet desserts, so I really liked it.",
            ko: "큰 창문과 달콤한 디저트가 있어서 정말 마음에 들었어요.",
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
    name: "문제 해결 & 돌발 상황 만능 템플릿",
    category: "에어컨 고장 수리, 스마트폰 방전, 요리 연기 대처, 갑작스런 비, 친구 약속 지연 등",
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
    name: "과거 vs 현재 변화 & 비교 템플릿",
    category: "카페의 변화, 영화 감상의 변화, 아파트 주거의 변화 등",
    icon: "🔄",
    desc: "과거와 현재의 차이를 묻는 질문에 쉬운 단문으로 깔끔하게 비교하는 공식입니다.",
    skeleton: [
      {
        en: "1. In the past, [주제] was very different from now.",
        ko: "1. 과거에는 [주제]가 지금과 많이 달랐어요.",
      },
      {
        en: "2. In the past, [주제] was simple and choices were limited.",
        ko: "2. 과거에는 [주제]가 단순했고 선택할 것이 별로 없었어요.",
      },
      {
        en: "3. However, now, everything is very convenient and modern.",
        ko: "3. 하지만 지금은 모든 것이 아주 편리하고 현대적이에요.",
      },
      {
        en: "4. For example, we can use smart phone apps easily.",
        ko: "4. 예를 들어 우리는 스마트폰 앱을 아주 쉽게 써요.",
      },
      {
        en: "5. So, people can live much more easily.",
        ko: "5. 그래서 사람들은 훨씬 더 편안하게 살 수 있어요.",
      },
      {
        en: "6. So, I really like these nice changes.",
        ko: "6. 그래서 저는 이런 좋은 변화들이 정말 마음에 들어요.",
      },
    ],
    variations: [
      {
        topic: "☕ 카페의 변화",
        keyword: "order apps and bakeries",
        sentences: [
          {
            en: "In the past, cafes in Korea were very different from now.",
            ko: "과거에는 한국의 카페가 지금과 많이 달랐어요.",
          },
          {
            en: "In the past, cafes were simple and choices were limited.",
            ko: "과거에는 카페가 단순했고 선택할 것이 별로 없었어요.",
          },
          {
            en: "However, now, cafes are very convenient and modern.",
            ko: "하지만 지금은 카페가 아주 편리하고 현대적이에요.",
          },
          {
            en: "For example, we can use mobile order apps easily.",
            ko: "예를 들어 우리는 모바일 주문 앱을 아주 쉽게 써요.",
          },
          {
            en: "So, people can enjoy good coffee and delicious bread.",
            ko: "그래서 사람들은 맛있는 커피와 빵을 즐길 수 있어요.",
          },
          {
            en: "So, I really like these nice changes.",
            ko: "그래서 저는 이런 좋은 변화들이 정말 마음에 들어요.",
          },
        ],
      },
      {
        topic: "🎬 영화의 변화",
        keyword: "streaming apps and big TVs",
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
            en: "For example, we can watch movies on Netflix with our big TV.",
            ko: "예를 들어 대형 TV로 넷플릭스 영화를 볼 수 있어요.",
          },
          {
            en: "So, people can enjoy great movies at home anytime.",
            ko: "그래서 사람들은 집에서 언제든 멋진 영화를 즐길 수 있어요.",
          },
          {
            en: "So, I really like these nice changes.",
            ko: "그래서 저는 이런 좋은 변화들이 정말 마음에 들어요.",
          },
        ],
      },
      {
        topic: "🏡 주거의 변화",
        keyword: "smart apartments and gyms",
        sentences: [
          {
            en: "In the past, apartments were very different from now.",
            ko: "과거에는 아파트가 지금과 많이 달랐어요.",
          },
          {
            en: "In the past, apartments were simple and had few facilities.",
            ko: "과거에는 아파트가 단순했고 편의 시설이 거의 없었어요.",
          },
          {
            en: "However, now, apartments are very convenient and smart.",
            ko: "하지만 지금은 아파트가 아주 편리하고 스마트해요.",
          },
          {
            en: "For example, we can use smart phone apps to control lights.",
            ko: "예를 들어 스마트폰 앱으로 조명을 조절할 수 있어요.",
          },
          {
            en: "Also, there is a clean gym inside the apartment.",
            ko: "또한 아파트 안에 깨끗한 헬스장도 있어요.",
          },
          {
            en: "So, I really like these nice changes.",
            ko: "그래서 저는 이런 좋은 변화들이 정말 마음에 들어요.",
          },
        ],
      },
    ],
  },
  {
    id: "pat_06",
    name: "롤플레이 (Role-play) 만능 공식",
    category: "티켓 문의, 약속 지연 대안 제안, 물건 교환 및 환불",
    icon: "🎭",
    desc: "롤플레이 3대 상황(문의, 지연, 교환)을 중학교 영어 수준의 쉬운 6문장으로 완벽 해결하는 공식입니다.",
    skeleton: [
      {
        en: "1) [정보 문의] 1. 전화 목적 ➔ 2. 날짜/좌석 ➔ 3. 가격/할인 ➔ 4. 무료 주차 ➔ 5. 2장 예약 ➔ 6. 감사 인사",
        ko: "1) [정보 문의] 1. 전화 목적 ➔ 2. 날짜/좌석 ➔ 3. 가격/할인 ➔ 4. 무료 주차 ➔ 5. 2장 예약 ➔ 6. 감사 인사",
      },
      {
        en: "2) [약속 지연] 1. 사과 & 급한 일 ➔ 2. 30분 지연 ➔ 3. 시간 미루기 ➔ 4. 스타벅스 대기 (내가 살게) ➔ 5. 내일 대안 ➔ 6. 감사/사과",
        ko: "2) [약속 지연] 1. 사과 & 급한 일 ➔ 2. 30분 지연 ➔ 3. 시간 미루기 ➔ 4. 스타벅스 대기 (내가 살게) ➔ 5. 내일 대안 ➔ 6. 감사/사과",
      },
      {
        en: "3) [교환/환불] 1. 구매 제품 언급 ➔ 2. 흠집/문제 ➔ 3. 영수증 지참 ➔ 4. 새 제품 교환 ➔ 5. 전액 환불 ➔ 6. 감사 인사",
        ko: "3) [교환/환불] 1. 구매 제품 언급 ➔ 2. 흠집/문제 ➔ 3. 영수증 지참 ➔ 4. 새 제품 교환 ➔ 5. 전액 환불 ➔ 6. 감사 인사",
      },
    ],
    variations: [
      {
        topic: "🎫 티켓 문의",
        keyword: "dates, prices, parking, booking",
        sentences: [
          {
            en: "Hello, I have a few questions about the festival tickets.",
            ko: "안녕하세요, 축제 티켓에 대해 몇 가지 질문이 있어요.",
          },
          {
            en: "First, what dates and seats do you have right now?",
            ko: "먼저, 지금 어떤 날짜와 좌석이 있나요?",
          },
          {
            en: "Also, what is the ticket price, and do you have any discounts?",
            ko: "그리고 티켓 가격은 얼마이고, 혹시 할인이 있나요?",
          },
          {
            en: "By the way, is parking free for ticket holders?",
            ko: "그런데 티켓이 있으면 주차는 무료인가요?",
          },
          {
            en: "I would like to book two good seats right now.",
            ko: "지금 좋은 자리로 2장 예약하고 싶어요.",
          },
          {
            en: "Thank you so much for your help. Have a nice day!",
            ko: "도와주셔서 정말 감사합니다. 좋은 하루 보내세요!",
          },
        ],
      },
      {
        topic: "🚗 약속 지연",
        keyword: "heavy traffic & buy coffee",
        sentences: [
          {
            en: "Hi Minsoo, it's Hyosang! I'm really sorry, but I have urgent work at the office.",
            ko: "안녕 민수야, 효상이야! 정말 미안한데 회사에 급한 일이 생겼어.",
          },
          {
            en: "Because of heavy traffic, I think I will be thirty minutes late.",
            ko: "차도 너무 막혀서 30분 정도 늦을 것 같아.",
          },
          {
            en: "Can we meet thirty minutes later so you don't wait outside?",
            ko: "밖에서 안 기다리게 30분만 늦게 만나도 될까?",
          },
          {
            en: "Please go into Starbucks near my house first. I will buy you coffee and cake!",
            ko: "우리 집 근처 스타벅스에 먼저 들어가 있어. 내가 커피랑 케이크 살게!",
          },
          {
            en: "If you are tired today, we can meet tomorrow instead.",
            ko: "만약 오늘 피곤하면 대신 내일 만나도 괜찮아.",
          },
          {
            en: "I am really sorry, and I will get there as fast as I can!",
            ko: "정말 미안하고, 최대한 빨리 갈게!",
          },
        ],
      },
      {
        topic: "🛍️ 교환/환불",
        keyword: "scratch found & ask for a new one",
        sentences: [
          {
            en: "Hello, I bought this product at your store this week.",
            ko: "안녕하세요, 이번 주에 여기서 이 물건을 샀는데요.",
          },
          {
            en: "When I opened the box, there was a big scratch on it.",
            ko: "상자를 열어보니 큰 흠집이 있었어요.",
          },
          {
            en: "I have the receipt with me right now.",
            ko: "지금 영수증을 가지고 있습니다.",
          },
          {
            en: "Can I exchange it for a new one?",
            ko: "새 제품으로 교환할 수 있을까요?",
          },
          {
            en: "If that is not possible, can I get a full refund?",
            ko: "만약 어렵다면, 전액 환불받을 수 있을까요?",
          },
          {
            en: "Thank you so much for your quick help.",
            ko: "빠른 도움에 정말 감사드립니다.",
          },
        ],
      },
    ],
  },
];
