# 🎯 OPIc 난이도 4-4 완벽 대비: 프로젝트 72개 실전 질문 및 3단 콤보 총정리 매핑

본 문서는 프로젝트 내의 **12개 핵심 주제, 72개 실전 질문 데이터(`data/questions_im1.js`)**를 **실제 OPIc 시험 출제 공식(3단 콤보 Set A / Set B)**과 **6대 만능 뼈대 템플릿(`data/patterns_im1.js`)**에 1:1로 정밀 매핑한 최신 종합 레퍼런스입니다.

> **💡 핵심 원칙**: 모든 12개 주제는 실제 시험과 동일하게 **정확히 6문항(Set A 3문항 + Set B 3문항)**으로 통일되어 있으며, 각각 **1단계(묘사) ➔ 2단계(루틴) ➔ 3단계(경험/돌발/변화)**의 완벽한 3단 콤보 구조를 갖추고 있습니다.

---

## 📊 1. OPIc 난이도 4-4 출제 구조 & 전략 개요

### 📌 15문항 시험 출제 공식 (4-4 Flow)

| 문항 번호 | 문항 성격 | 문제 유형 | 콤보 구성 | 적용 뼈대 구조 (Pattern ID) |
| :---: | :---: | :---: | :---: | :---: |
| **Q1** | 공통 워밍업 | **자기소개** | 단일 문항 | `pat_01` (인물/성격 맞춤 변형) |
| **Q2** | 세트 1 (서베이/돌발) | **1단계: 장소/대상 묘사** | 3단 콤보 ① | `pat_01` (장소 & 선호 묘사) |
| **Q3** | 세트 1 (서베이/돌발) | **2단계: 일상 루틴·활동** | 3단 콤보 ② | `pat_02` (일상 & 활동 루틴) |
| **Q4** | 세트 1 (서베이/돌발) | **3단계: 과거 기억·경험** | 3단 콤보 ③ | `pat_03` (과거 경험) / `pat_04` (돌발 해결) |
| **Q5** | 세트 2 (서베이/돌발) | **1단계: 장소/대상 묘사** | 3단 콤보 ① | `pat_01` (장소 & 선호 묘사) |
| **Q6** | 세트 2 (서베이/돌발) | **2단계: 일상 루틴·활동** | 3단 콤보 ② | `pat_02` (일상 & 활동 루틴) |
| **Q7** | 세트 2 (서베이/돌발) | **3단계: 과거 기억·경험** | 3단 콤보 ③ | `pat_03` (과거 경험) / `pat_04` (돌발 해결) |
| — | **[난이도 중간 점검]** | _"비슷한 질문"_ 선택 (4-4 유지) | — | — |
| **Q8** | 세트 3 (돌발/서베이) | **1단계: 장소/대상 묘사** | 3단 콤보 ① | `pat_01` (장소 & 선호 묘사) |
| **Q9** | 세트 3 (돌발/서베이) | **2단계: 일상 루틴·활동** | 3단 콤보 ② | `pat_02` (일상 & 활동 루틴) |
| **Q10** | 세트 3 (돌발/서베이) | **3단계: 과거 기억·경험** | 3단 콤보 ③ | `pat_03` (과거 경험) / `pat_04` (돌발 해결) |
| **Q11** | 세트 4 (롤플레이) | **상황 질문·정보 문의 (3~4개)** | 롤플레이 ① | `pat_06` (롤플레이 질문 공식) |
| **Q12** | 세트 4 (롤플레이) | **문제 발생 설명 & 대안 제시 (2개)** | 롤플레이 ② | `pat_06` (롤플레이 대안 공식) |
| **Q13** | 세트 4 (롤플레이) | **유사한 과거 경험/문제 해결** | 롤플레이 ③ | `pat_04` (돌발 문제) + `pat_03` (과거 경험) |
| **Q14** | 세트 5 (고득점 2단) | **과거 vs 현재 변화·비교** | 심화 2단 ① | `pat_05` (과거 vs 현재 변화/비교) |
| **Q15** | 세트 5 (고득점 2단) | **계절별 변화 / 트렌드 / 이슈** | 심화 2단 ② | `pat_05` (변화/비교) / `pat_02` (심화) |

---

## 🧩 2. 프로젝트 6대 만능 뼈대 구조 (Skeleton Overview)

1. **`pat_01` (장소 & 선호 묘사 템플릿)**: 1단계 콤보 전용 (최애 장소/인물 선언 ➔ 접근성/분위기 ➔ 구체 특징 2가지 ➔ 힐링 공간/장점 강조)
2. **`pat_02` (일상 & 활동 루틴 템플릿)**: 2단계 콤보 전용 (시간대/주기 ➔ 첫 활동(First) ➔ 메인 활동(Then) ➔ 추가 활동(While/Next) ➔ 마무리(After that))
3. **`pat_03` (과거 경험 & 기억 템플릿)**: 3단계 콤보 전용 (경험 시점/동행 ➔ 핵심 사건 전개 ➔ 인상 깊었던 점 ➔ 감정 및 교훈 ➔ 잊지 못할 추억)
4. **`pat_04` (문제 해결 & 돌발 상황 템플릿)**: 3단계 돌발 전용 (평화로운 배경 ➔ 갑작스러운 문제 발생(Suddenly) ➔ 당황/걱정 ➔ 침착한 대응 조치 ➔ 안도와 결과)
5. **`pat_05` (과거 vs 현재 변화 & 비교 템플릿)**: 3단계 심화 전용 (과거 상태/불편함 ➔ 현대적 변화/신기술/앱 ➔ 구체적 개선점 ➔ 삶의 만족도 및 편리함)
6. **`pat_06` (롤플레이 만능 공식)**: 롤플레이 11-12번 전용 (질문형: 용건 ➔ 질문 3~4가지 / 대안형: 사과 및 비상 상황 설명 ➔ 대안 2가지 제시)

---

## 📋 3. 12개 전 주제 72문항 3단 콤보(Set A / Set B) 완벽 매핑 표

### 1) 자기소개 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_intro_01` | Set A | **1단계** | 인물 묘사 | `pat_01` | **인터뷰를 시작하겠습니다. 본인에 대해 간단히 소개해 주세요.**<br>`Let's start the interview now. Please tell me a little bit about yourself.` |
| `q_intro_02` | Set A | **2단계** | 일상/취미 | `pat_02` | **본인에 대해 더 자세히 말씀해 주세요. 평일 하루 일과는 어떻고 주말에는 주로 무엇을 하시나요?**<br>`Tell me more about yourself. What is your daily routine like on weekdays, and what do you usually do on weekends?` |
| `q_intro_03` | Set A | **3단계** | 과거 기억 | `pat_03` | **언제 왜 처음 영어를 배우기 시작했는지 말씀해 주세요. 처음 외국인과 대화했던 때를 기억하시나요? 그 경험에 대해 자세히 말씀해 주세요.**<br>`Tell me about when and why you first started learning English. Do you remember the first time you spoke to a foreigner? Tell me about that experience in detail.` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_intro_04` | Set B | **1단계** | 성격 묘사 | `pat_01` | **본인의 성격에 대해 어떻게 설명하시겠습니까? 어떤 성격이고 주변 친구나 동료들은 당신을 어떻게 평가하나요? 자세히 말씀해 주세요.**<br>`How would you describe your personality? What kind of person are you, and how do your friends or coworkers describe you? Tell me in detail.` |
| `q_intro_05` | Set B | **2단계** | 일상 루틴 | `pat_02` | **퇴근 후 여가 시간이나 주말에 주로 무엇을 하시나요? 취미를 즐기는 전형적인 일과 루틴에 대해 말씀해 주세요.**<br>`What do you normally do in your free time after work or on weekends? Tell me about your typical routine when you enjoy your hobbies.` |
| `q_intro_06` | Set B | **3단계** | 변화/비교 | `pat_05` | **과거 어릴 적과 비교하여 당신의 일상 라이프스타일이나 성격이 어떻게 변화했나요? 그때와 지금의 차이점에 대해 말씀해 주세요.**<br>`How has your daily lifestyle or personality changed compared to when you were younger? What are the differences between then and now?` |

---

### 2) 집/주거 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_home_01` | Set A | **1단계** | 장소 묘사 | `pat_01` | **설문에서 아파트에 거주한다고 하셨습니다. 거주하시는 집에 대해 설명해 주세요. 집이 어떻게 생겼고 어떤 방들이 있나요? 가능한 한 자세히 설명해 주세요.**<br>`You indicated in the survey that you live in an apartment. Please describe your home to me. What does it look like, and what rooms do you have? Tell me about your home in as much detail as possible.` |
| `q_home_02` | Set A | **2단계** | 일상 루틴 | `pat_02` | **평일과 주말에 집에서 보통 무엇을 하시나요? 아침부터 잠자리에 들 때까지 집에서의 일반적인 일상 루틴을 말씀해 주세요.**<br>`What do you usually do at home on weekdays and weekends? Tell me about your typical daily routine at home from morning until you go to bed.` |
| `q_home_03` | Set A | **3단계** | 과거 경험 | `pat_04` | **물건이 고장 나거나 가전제품이 작동하지 않는 등 집에서 예상치 못한 문제를 겪은 적이 있나요? 무슨 문제였고 어떻게 해결하셨나요?**<br>`Have you ever experienced an unexpected problem at home, such as something broken or an appliance not working? What was the problem, and how did you resolve it?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_home_05` | Set B | **1단계** | 공간 묘사 | `pat_01` | **집에서 가장 좋아하는 방에 대해 말씀해 주세요. 어떻게 생겼고 어떤 가구들이 있으며 왜 그곳에서 시간 보내는 것을 좋아하시나요?**<br>`Please tell me about your favorite room in your home. What does it look like, what kinds of furniture are in that room, and why do you like spending time there?` |
| `q_home_06` | Set B | **2단계** | 정리 루틴 | `pat_02` | **집을 깨끗하게 유지하기 위해 보통 무엇을 하시나요? 청소 루틴을 처음부터 끝까지 설명해 주세요.**<br>`What do you usually do to keep your house clean? Please describe your cleaning routine from the beginning to the end.` |
| `q_home_04` | Set B | **3단계** | 변화/인테리어 | `pat_05` | **어릴 적 살던 집과 비교하여 현재 살고 있는 집은 어떻게 달라졌나요? 새 가구를 사거나 인테리어를 바꾸는 등 어떤 변화가 있었나요?**<br>`How has your current home changed compared to the home you lived in when you were a child? What changes have been made, such as new furniture or interior renovations?` |

---

### 3) 직장/업무 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_work_01` | Set A | **1단계** | 장소 묘사 | `pat_01` | **설문에서 직장에 다닌다고 하셨습니다. 다니시는 회사에 대해 설명해 주세요. 어디에 위치해 있고 회사 건물과 사무실은 어떻게 생겼나요?**<br>`You indicated in the survey that you work. Please describe the company you work for. Where is it located, and what does the building and your office look like?` |
| `q_work_02` | Set A | **2단계** | 일상/루틴 | `pat_02` | **직장에서의 일상적인 업무에 대해 말씀해 주세요. 일반적인 근무 시간 동안 출근해서 퇴근할 때까지 어떤 일들을 처리하시나요?**<br>`Tell me about your daily responsibilities at work. What tasks do you handle on a typical workday from start to finish?` |
| `q_work_03` | Set A | **3단계** | 과거 경험 | `pat_04` | **직장에서 수행했던 기억에 남는 프로젝트나 해결했던 긴급한 문제에 대해 말씀해 주세요. 어떤 상황이었고 어떻게 해결하셨나요?**<br>`Tell me about a memorable project you worked on or an unexpected problem you solved at work. What was the situation, and how did you resolve it?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_work_05` | Set B | **1단계** | 인물 묘사 | `pat_01` | **직장에서 가장 가깝게 일하는 동료나 상사에 대해 말씀해 주세요. 그분은 어떤 성향이고 어떤 업무를 함께 하시나요?**<br>`Tell me about a coworker or supervisor you work closely with. What is this person like, and what kind of work do you do together?` |
| `q_work_06` | Set B | **2단계** | 업무 루틴 | `pat_02` | **직장에서 동료들과 회의를 하거나 협업할 때 주로 어떻게 진행하시나요? 일반적인 회의에서 시작부터 끝까지 어떤 일이 일어나는지 말씀해 주세요.**<br>`How do you usually conduct meetings or collaborate with your colleagues at work? Tell me about what happens during a typical meeting from start to finish.` |
| `q_work_04` | Set B | **3단계** | 과거 경험 | `pat_03` | **현재 직장에 처음 출근했던 첫날에 대해 말씀해 주세요. 회사의 첫인상은 어땠고, 무엇을 하셨으며 어떤 기분이 드셨나요?**<br>`Tell me about your very first day at work. What was your first impression of the company, what did you do, and how did you feel?` |

---

### 4) 카페가기 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_cafe_01` | Set A | **1단계** | 장소 묘사 | `pat_01` | **설문에서 카페 가기를 좋아한다고 하셨습니다. 가장 좋아하시는 카페에 대해 자세히 설명해 주세요. 어디에 위치해 있고 분위기는 어떤가요?**<br>`You indicated in the survey that you like going to cafes. Please describe your favorite cafe in detail. Where is it located, and what kind of atmosphere does it have?` |
| `q_cafe_02` | Set A | **2단계** | 일상 루틴 | `pat_02` | **카페에 가면 보통 무엇을 하시나요? 카페에 들어설 때부터 나올 때까지의 일반적인 일과 루틴을 말씀해 주세요.**<br>`What do you normally do when you go to a cafe? Please tell me about your routine from the moment you enter until you leave.` |
| `q_cafe_03` | Set A | **3단계** | 과거 경험 | `pat_03` | **최근 카페에서 겪었던 기억에 남거나 특별했던 경험에 대해 말씀해 주세요. 누구와 있었고 무슨 일이 있었으며 왜 기억에 남나요?**<br>`Tell me about a memorable or special experience you had at a cafe recently. Who were you with, what happened, and why was it so memorable?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_cafe_05` | Set B | **1단계** | 메뉴 선호 | `pat_01` | **카페에 가면 주로 어떤 커피나 음료, 디저트를 주문하시나요? 왜 그것을 가장 좋아하시나요?**<br>`What kind of coffee, drink, or dessert do you usually order when you go to a cafe? Why is it your favorite?` |
| `q_cafe_06` | Set B | **2단계** | 만남 루틴 | `pat_02` | **친구를 만나거나 혼자 공부하기 위해 카페에 갈 때 보통 무엇을 하시나요? 단계별 루틴을 말씀해 주세요.**<br>`When you visit a cafe to meet friends or study alone, what do you usually do? Tell me about your routine step by step.` |
| `q_cafe_04` | Set B | **3단계** | 변화/비교 | `pat_05` | **과거와 비교하여 카페가 어떻게 변화했나요? 예전의 카페 모습과 오늘날의 카페는 어떻게 다른지 설명해 주세요.**<br>`How have cafes changed compared to the past? Please describe what cafes were like before and how they are different today.` |

---

### 5) 공원가기 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_park_01` | Set A | **1단계** | 장소 묘사 | `pat_01` | **설문에서 공원 가기를 좋아한다고 하셨습니다. 자주 가시는 공원에 대해 설명해 주세요. 어디에 있고 어떻게 생겼나요?**<br>`You indicated in the survey that you like going to parks. Please describe a park you frequently visit. Where is it located and what does it look like?` |
| `q_park_02` | Set A | **2단계** | 일상 루틴 | `pat_02` | **공원에 가면 보통 무엇을 하시나요? 공원에서의 일반적인 활동 루틴을 처음부터 끝까지 말씀해 주세요.**<br>`What do you usually do when you go to the park? Tell me about your typical routine at the park from beginning to end.` |
| `q_park_03` | Set A | **3단계** | 과거 경험 | `pat_04` | **공원에서 있었던 기억에 남거나 뜻밖이었던 사건에 대해 말씀해 주세요. 무슨 일이 있었고 어떻게 반응하셨나요?**<br>`Tell me about a memorable or unexpected incident that happened to you at a park. What happened, and how did you react?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_park_05` | Set B | **1단계** | 시설 묘사 | `pat_01` | **자주 가시는 공원의 자연 풍경과 호수, 벤치, 산책로 등 특별한 시설에 대해 설명해 주세요.**<br>`Please describe the natural scenery and special facilities like lakes, benches, and walking trails at your favorite park.` |
| `q_park_06` | Set B | **2단계** | 피크닉 루틴 | `pat_02` | **날씨가 좋은 날 공원에서 피크닉을 할 때 보통 무엇을 하시나요? 무엇을 준비하고 피크닉 루틴은 어떠한가요?**<br>`Tell me about what you do when you have a picnic at the park on a sunny day. What do you prepare, and what is your routine during the picnic?` |
| `q_park_04` | Set B | **3단계** | 계절/변화 | `pat_05` | **공원은 사계절에 따라 어떻게 변하나요? 계절에 따라 사람들의 활동은 어떻게 달라지나요?**<br>`How does the park change throughout the four seasons? How do people's activities change depending on the season?` |

---

### 6) 영화보기 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_movie_01` | Set A | **1단계** | 장소/선호 | `pat_01` | **설문에서 영화 보기를 좋아한다고 하셨습니다. 어떤 장르의 영화를 좋아하시고 왜 그 영화들을 좋아하시나요? 좋아하는 배우는 누구인가요?**<br>`You indicated in the survey that you like watching movies. What types of movies do you enjoy watching, and why do you like them? Who are your favorite actors?` |
| `q_movie_03` | Set A | **2단계** | 일상 루틴 | `pat_02` | **집에서 영화를 볼 때 영화를 보기 전, 보는 중, 보고 난 후에 보통 무엇을 하시는지 루틴을 자세히 말씀해 주세요.**<br>`When you watch movies at home, what do you normally do before, during, and after watching a movie? Describe your routine in detail.` |
| `q_movie_02` | Set A | **3단계** | 과거 경험 | `pat_03` | **최근에 본 가장 기억에 남는 영화에 대해 말씀해 주세요. 줄거리는 무엇이었고 왜 기억에 남았나요?**<br>`Tell me about the most memorable movie you have seen recently. What was the storyline and why was it so memorable to you?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_movie_05` | Set B | **1단계** | 영화관 묘사 | `pat_01` | **주로 가시는 영화관에 대해 설명해 주세요. 어디에 위치해 있고 어떻게 생겼으며 어떤 좌석을 선호하시나요?**<br>`Please describe the movie theater you usually go to. Where is it located, what does it look like, and what kind of seats do you prefer?` |
| `q_movie_06` | Set B | **2단계** | 관람 루틴 | `pat_02` | **극장에서 영화를 볼 때 도착해서 티켓과 스낵을 사고 영화를 보고 나올 때까지의 루틴을 말씀해 주세요.**<br>`What do you usually do when you watch a movie at a cinema? Describe your routine from buying tickets and snacks to leaving the theater.` |
| `q_movie_04` | Set B | **3단계** | 변화/비교 | `pat_05` | **어릴 적과 비교하여 영화관이나 영화 관람 습관이 어떻게 변화했나요? 변화에 대해 자세히 설명해 주세요.**<br>`How have movie theaters or movie-watching habits changed compared to when you were a child? Describe the changes in detail.` |

---

### 7) 음악감상 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_music_01` | Set A | **1단계** | 장르/선호 | `pat_01` | **설문에서 음악 감상을 좋아한다고 하셨습니다. 어떤 음악을 좋아하시고 가장 좋아하는 가수는 누구인가요? 왜 좋아하시나요?**<br>`You indicated in the survey that you like listening to music. What kind of music do you like, and who is your favorite singer or musician? Why do you like them?` |
| `q_music_02` | Set A | **2단계** | 일상 루틴 | `pat_02` | **언제 어디서 주로 음악을 들으시나요? 음악을 들으면서 무엇을 하시나요?**<br>`When and where do you usually listen to music? What do you do while listening to music?` |
| `q_music_03` | Set A | **3단계** | 과거 경험 | `pat_03` | **콘서트나 거리 등에서 라이브 음악을 들었던 경험에 대해 말씀해 주세요. 분위기는 어땠고 왜 기억에 남나요?**<br>`Tell me about a time you heard live music, like at a concert or on the street. What was the atmosphere like, and why was it memorable?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_music_04` | Set B | **1단계** | 곡/가수 묘사 | `pat_01` | **가장 즐겨 듣는 인생 노래가 있나요? 왜 그 노래를 좋아하고 들으면 어떤 기분이 드나요?**<br>`What is your all-time favorite song? Why do you like it so much, and how does it make you feel when you listen to it?` |
| `q_music_05` | Set B | **2단계** | 청취 루틴 | `pat_02` | **출퇴근길이나 운동할 때 주로 음악을 어떻게 들으시나요? 이동 중 음악 청취 루틴을 말씀해 주세요.**<br>`How do you listen to music when you commute or exercise? Tell me about your music routine on the go.` |
| `q_music_06` | Set B | **3단계** | 변화/비교 | `pat_05` | **과거와 비교하여 음악을 듣는 기기나 습관이 어떻게 변화했나요? 과거 MP3나 CD와 오늘날 스트리밍 앱을 비교해 주세요.**<br>`How have music-listening devices and habits changed compared to the past? Please compare CDs or MP3 players with today's streaming apps.` |

---

### 8) 운동하기 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_exercise_02` | Set A | **1단계** | 장소 묘사 | `pat_01` | **설문에서 운동하기를 좋아한다고 하셨습니다. 다니시는 헬스장에 대해 설명해 주세요. 어떤 모습이고 어떤 운동 기구들이 있나요?**<br>`You indicated in the survey that you like working out. Please describe the gym or fitness center you go to. What does it look like, and what kind of equipment does it have?` |
| `q_exercise_01` | Set A | **2단계** | 일상 루틴 | `pat_02` | **일반적인 운동 루틴에 대해 말씀해 주세요. 운동을 시작할 때부터 끝마칠 때까지 어떤 운동들을 순서대로 하시나요?**<br>`Please describe your typical workout routine. What exercises do you do from the moment you start until you finish?` |
| `q_exercise_03` | Set A | **3단계** | 과거 경험 | `pat_04` | **운동 중 부상을 입거나 예상치 못한 문제를 겪은 적이 있나요? 무슨 일이 있었고 어떻게 대처하셨나요?**<br>`Have you ever experienced an injury or an unexpected problem while exercising? What happened and how did you handle it?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_exercise_04` | Set B | **1단계** | 장비/복장 묘사 | `pat_01` | **운동할 때 주로 어떤 옷을 입고 어떤 장비를 챙기시나요? 운동 복장과 장비에 대해 자세히 설명해 주세요.**<br>`What do you usually wear and bring when you work out? Please describe your workout gear and athletic clothes in detail.` |
| `q_exercise_05` | Set B | **2단계** | 운동 전후 루틴 | `pat_02` | **운동을 시작하기 전과 마친 후 보통 무엇을 하시나요? 준비 운동과 마무리 회복 루틴에 대해 말씀해 주세요.**<br>`What do you do before starting and after finishing your workout? Tell me about your warm-up and post-workout routine.` |
| `q_exercise_06` | Set B | **3단계** | 변화/비교 | `pat_05` | **운동을 처음 시작하게 된 계기는 무엇이었나요? 운동 후 과거와 비교해 체력이나 건강이 어떻게 달라졌나요?**<br>`What made you start working out in the first place? How has your physical fitness or health changed compared to the past?` |

---

### 9) 요리하기 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_cook_04` | Set A | **1단계** | 주방/요리 묘사 | `pat_01` | **설문에서 요리하기를 좋아한다고 하셨습니다. 집의 주방에 대해 설명해 주세요. 어떻게 생겼고 가장 자신 있게 만드는 대표 요리는 무엇인가요?**<br>`You indicated in the survey that you like cooking. Please describe your kitchen at home. What does it look like, and what is your favorite dish that you cook with confidence?` |
| `q_cook_01` | Set A | **2단계** | 일상 루틴 | `pat_02` | **평소 무엇을 요리하시는지 식재료 준비부터 뒷정리까지 요리 과정을 단계별로 설명해 주세요.**<br>`Please describe what you usually cook and your cooking routine step by step from prepping ingredients to cleaning up.` |
| `q_cook_02` | Set A | **3단계** | 과거 경험 | `pat_03` | **특별한 사람을 위해 요리했던 기억에 남는 식사에 대해 말씀해 주세요. 어떤 요리를 만들었고 상대방의 반응은 어땠나요?**<br>`Tell me about a memorable meal you cooked for someone special. What dish did you make, and how did they react?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_cook_05` | Set B | **1단계** | 도구/식재료 묘사 | `pat_01` | **냉장고에 항상 구비해 두는 식재료나 요리할 때 가장 유용하게 쓰는 주방 가전은 무엇인가요? 자세히 말씀해 주세요.**<br>`What ingredients do you always keep in your refrigerator, or what kitchen appliance do you find most useful when cooking? Tell me in detail.` |
| `q_cook_06` | Set B | **2단계** | 장보기 루틴 | `pat_02` | **요리하기 전 마트에 가서 장을 보고 식재료를 손질하는 일과에 대해 말씀해 주세요.**<br>`How do you go grocery shopping and prepare ingredients before cooking? Describe your routine from shopping to cooking.` |
| `q_cook_03` | Set B | **3단계** | 과거 경험 | `pat_04` | **요리 중에 예상치 못한 문제나 실수를 겪은 적이 있나요? 무슨 일이었고 어떻게 해결하셨나요?**<br>`Have you ever experienced an unexpected problem or accident while cooking? What was the problem, and how did you resolve it?` |

---

### 10) 국내여행 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_trip_02` | Set A | **1단계** | 장소 묘사 | `pat_01` | **설문에서 국내 여행을 좋아한다고 하셨습니다. 가장 좋아하시는 국내 여행지나 드라이브 코스에 대해 설명해 주세요.**<br>`You indicated in the survey that you enjoy traveling in your country. Please describe your favorite travel destination or driving route.` |
| `q_trip_01` | Set A | **2단계** | 일상 루틴 | `pat_02` | **여행을 떠나기 전 보통 무엇을 하시나요? 여행 계획을 세우고 짐을 싸는 루틴에 대해 말씀해 주세요.**<br>`What do you usually do before going on a trip? How do you prepare and pack your luggage?` |
| `q_trip_03` | Set A | **3단계** | 과거 경험 | `pat_03` | **최근에 다녀온 기억에 남는 국내 여행에 대해 말씀해 주세요. 어디로 누구와 가셨고 왜 그렇게 기억에 남나요?**<br>`Tell me about a memorable domestic trip you took recently. Where did you go, who did you go with, and why was it so memorable?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_trip_04` | Set B | **1단계** | 숙소 묘사 | `pat_01` | **여행을 갔을 때 묵었던 숙소 중 가장 기억에 남는 호텔이나 리조트에 대해 말씀해 주세요. 어떻게 생겼고 왜 좋았나요?**<br>`Please describe a memorable hotel, resort, or accommodation you stayed at during a trip. What did it look like, and why did you like it?` |
| `q_trip_05` | Set B | **2단계** | 여행 루틴 | `pat_02` | **여행을 가면 보통 하루를 어떻게 보내시나요? 아침 관광부터 저녁 식사와 휴식까지의 하루 루틴을 말씀해 주세요.**<br>`What is your typical daily schedule during a trip? Describe your routine from morning sightseeing to having dinner and relaxing.` |
| `q_trip_06` | Set B | **3단계** | 돌발 해결 | `pat_04` | **여행 중 날씨 악화나 교통편 문제로 예상치 못한 어려움을 겪은 적이 있나요? 그 상황을 어떻게 해결하셨나요?**<br>`Have you ever faced an unexpected problem while traveling, such as bad weather or transportation issues? How did you resolve the situation?` |

---

### 11) 캠핑하기 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_camp_02` | Set A | **1단계** | 장소 묘사 | `pat_01` | **설문에서 캠핑 가기를 좋아한다고 하셨습니다. 가장 좋아하시는 캠핑장에 대해 설명해 주세요. 어디에 있고 어떻게 생겼나요?**<br>`You indicated in the survey that you like going camping. Please describe your favorite campsite. Where is it located and what does it look like?` |
| `q_camp_01` | Set A | **2단계** | 일상 루틴 | `pat_02` | **캠핑을 가면 보통 무엇을 하시나요? 도착했을 때부터 짐을 정리하고 떠날 때까지의 일반적인 캠핑 루틴을 설명해 주세요.**<br>`What do you usually do when you go camping? Please describe your typical camping routine from the moment you arrive to when you pack up.` |
| `q_camp_03` | Set A | **3단계** | 과거 경험 | `pat_04` | **캠핑 중에 발생했던 기억에 남거나 예상치 못했던 사건에 대해 말씀해 주세요. 무슨 일이 있었고 어떻게 대처하셨나요?**<br>`Tell me about a memorable or unexpected incident that happened while you were camping. What happened, and how did you deal with it?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_camp_04` | Set B | **1단계** | 장비 묘사 | `pat_01` | **캠핑을 갈 때 가장 아끼거나 필수적인 캠핑 장비에 대해 자세히 설명해 주시고 왜 필요한지 말씀해 주세요.**<br>`What is your favorite or most essential piece of camping gear? Please describe it in detail and explain why you need it.` |
| `q_camp_05` | Set B | **2단계** | 캠핑 저녁 루틴 | `pat_02` | **캠핑장에서 저녁 식사와 휴식을 취할 때 보통 무엇을 하시나요? 모닥불 주변에서의 저녁 루틴을 자세히 설명해 주세요.**<br>`What do you usually do for dinner and relaxation at a campsite? Describe your evening routine around the campfire in detail.` |
| `q_camp_06` | Set B | **3단계** | 변화/비교 | `pat_05` | **생애 처음으로 캠핑을 갔던 날의 기억에 대해 말씀해 주세요. 그리고 오늘날의 캠핑은 과거와 어떻게 달라졌나요?**<br>`Tell me about your very first camping trip. What was it like, and how has camping changed today compared to the past?` |

---

### 12) 롤플레이 (총 6문항: Set A 3문항 + Set B 3문항)

#### 🅰️ Set A (3단 콤보 1세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_rp_01` | Set A | **1단계** | 정보 문의 | `pat_06` | **상황을 하나 드릴 테니 연기해 보세요. 친구와 함께 콘서트나 축제에 가려고 티켓을 구매하려 합니다. 매표소에 전화해 행사와 관련된 질문 3~4가지를 해보세요.**<br>`I'd like to give you a situation and ask you to act it out. You want to buy tickets for a concert or festival with your friend. Call the ticket box office and ask three or four questions about the event.` |
| `q_rp_02` | Set A | **2단계** | 문제 해결 | `pat_06` | **죄송하지만 해결해야 할 문제가 생겼습니다. 친구와 카페에서 만나기로 약속했으나 늦어지고 있습니다. 친구에게 전화해 상황을 설명하고 2~3가지 대안을 제시해 보세요.**<br>`I'm sorry, but there is a problem you need to resolve. You made an appointment to meet a friend at a cafe, but you are running late. Call your friend, explain the situation, and suggest two or three alternatives.` |
| `q_rp_03` | Set A | **3단계** | 유사 과거 경험 | `pat_04` | **이전 상황과 유사하게, 티켓을 예매하거나 약속을 잡을 때 예상치 못한 문제를 겪은 적이 있나요? 무슨 일이 있었고 어떻게 해결하셨는지 자세히 말씀해 주세요.**<br>`Have you ever experienced an unexpected problem related to purchasing tickets or making an appointment, similar to the situation before? What happened and how did you resolve it?` |

#### 🅱️ Set B (3단 콤보 2세트)
| ID | 세트 | 단계 | 유형 | 추천 뼈대 | 질문 내용 (한국어 & 영어) |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `q_rp_04` | Set B | **1단계** | 정보 문의 | `pat_06` | **상황을 하나 드릴 테니 연기해 보세요. 다가오는 여행을 위해 호텔 객실을 예약하려고 합니다. 호텔 프런트에 전화해 예약과 관련된 질문 3~4가지를 해보세요.**<br>`I'd like to give you a situation and ask you to act it out. You want to book a room at a hotel for an upcoming trip. Call the hotel front desk and ask three or four questions about the reservation.` |
| `q_rp_05` | Set B | **2단계** | 문제 해결 | `pat_06` | **죄송하지만 해결해야 할 문제가 생겼습니다. 호텔에 도착했는데 예약에 문제가 생겨 방이 아직 준비되지 않았습니다. 호텔 직원에게 상황을 설명하고 2가지 대안을 제시해 보세요.**<br>`I'm sorry, but there is a problem you need to resolve. You arrived at the hotel, but there is a problem with your reservation and your room is not ready. Explain the situation to the front desk clerk and suggest two alternatives.` |
| `q_rp_06` | Set B | **3단계** | 유사 경험 | `pat_04` | **여행 중 호텔 예약이나 객실 시설과 관련하여 예상치 못한 문제를 겪은 적이 있나요? 무슨 일이 있었고 어떻게 해결하셨는지 처음부터 끝까지 말씀해 주세요.**<br>`Have you ever experienced an unexpected problem with a hotel reservation or room facilities during a trip? What happened and how did you resolve it? Tell me everything from beginning to end.` |

---

