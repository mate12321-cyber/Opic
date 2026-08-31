// Storage shim: mimics the window.storage API (Claude artifact sandbox)
// using the browser's localStorage, so this app works standalone on any
// static host (e.g. GitHub Pages) without that sandbox-only API.
const storage = {
  async get(key, shared) {
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error("key not found: " + key);
    return { key, value: raw, shared: !!shared };
  },
  async set(key, value, shared) {
    localStorage.setItem(key, value);
    return { key, value, shared: !!shared };
  },
  async delete(key, shared) {
    const existed = localStorage.getItem(key) !== null;
    localStorage.removeItem(key);
    return { key, deleted: existed, shared: !!shared };
  },
  async list(prefix, shared) {
    const keys = Object.keys(localStorage).filter(
      (k) => !prefix || k.startsWith(prefix),
    );
    return { keys, prefix, shared: !!shared };
  },
};

let SENTENCES = [];
let CATEGORIES = [];

const GROUPS = {
  일상: ["자기소개", "집/주거", "직장/업무", "일상", "날씨/계절"],
  "취미 & 여가": [
    "취미",
    "여가/주말",
    "카페가기",
    "영화보기",
    "음악감상",
    "공연보기",
    "콘서트 보기",
  ],
  "운동 & 야외활동": [
    "운동하기",
    "조깅하기",
    "걷기",
    "공원가기",
    "캠핑하기",
    "해변가기",
  ],
  생활: ["음식", "요리하기", "쇼핑", "반려동물"],
  여행: ["여행", "국내여행"],
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let selectedCats = new Set();
let order = [];
let cur = 0;
let results = {}; // idx -> 'good' | 'bad'
let revealed = false;

const STORAGE_KEY = "ko-en-opic-progress";

let WORD_ITEMS = [];

const els = {
  koText: document.getElementById("koText"),
  enText: document.getElementById("enText"),
  tipText: document.getElementById("tipText"),
  catLabel: document.getElementById("catLabel"),
  idxLabel: document.getElementById("idxLabel"),
  answerBox: document.getElementById("answerBox"),
  revealRow: document.getElementById("revealRow"),
  rateRow: document.getElementById("rateRow"),
  retrySameLink: document.getElementById("retrySameLink"),
  userInput: document.getElementById("userInput"),
  progressDots: document.getElementById("progressDots"),
  practiceCard: document.getElementById("practiceCard"),
  doneScreen: document.getElementById("doneScreen"),
  doneSummary: document.getElementById("doneSummary"),
  retryWrongBtn: document.getElementById("retryWrongBtn"),
  topicScreen: document.getElementById("topicScreen"),
  topicChips: document.getElementById("topicChips"),
  topicCount: document.getElementById("topicCount"),
  changeTopicBtn: document.getElementById("changeTopicBtn"),
  startBtn: document.getElementById("startBtn"),
  copyKo: document.getElementById("copyKo"),
  copyEn: document.getElementById("copyEn"),
  copyInput: document.getElementById("copyInput"),
  ttsKoBtn: document.getElementById("ttsKoBtn"),
  ttsEnBtn: document.getElementById("ttsEnBtn"),
  speechEvalBox: document.getElementById("speechEvalBox"),
  evalScoreBadge: document.getElementById("evalScoreBadge"),
  evalDiff: document.getElementById("evalDiff"),
  evalFeedback: document.getElementById("evalFeedback"),
  ttsUserInputBtn: document.getElementById("ttsUserInputBtn"),
  autoPlayTts: document.getElementById("autoPlayTts"),
  audioControls: document.getElementById("audioControls"),
  liveTranslate: document.getElementById("liveTranslate"),
  liveTranslateText: document.getElementById("liveTranslateText"),
  grammarBox: document.getElementById("grammarBox"),
  grammarContent: document.getElementById("grammarContent"),
  googleAskLink: document.getElementById("googleAskLink"),
  googleAskCopy: document.getElementById("googleAskCopy"),
  micBtn: document.getElementById("micBtn"),
  micError: document.getElementById("micError"),
  toWordModeLink: document.getElementById("toWordModeLink"),
  toSentenceModeLink: document.getElementById("toSentenceModeLink"),
  wordTopicScreen: document.getElementById("wordTopicScreen"),
  wordTopicChips: document.getElementById("wordTopicChips"),
  wordTopicCount: document.getElementById("wordTopicCount"),
  allTopicToggleBtn: document.getElementById("allTopicToggleBtn"),
  allWordTopicToggleBtn: document.getElementById("allWordTopicToggleBtn"),
  wordStartBtn: document.getElementById("wordStartBtn"),
  wordCard: document.getElementById("wordCard"),
  wordCatLabel: document.getElementById("wordCatLabel"),
  wordIdxLabel: document.getElementById("wordIdxLabel"),
  wordSentence: document.getElementById("wordSentence"),
  ttsWordBtn: document.getElementById("ttsWordBtn"),
  wordOptions: document.getElementById("wordOptions"),
  wordExplain: document.getElementById("wordExplain"),
  wordGoogleAskRow: document.getElementById("wordGoogleAskRow"),
  wordGoogleAskLink: document.getElementById("wordGoogleAskLink"),
  wordGoogleAskCopy: document.getElementById("wordGoogleAskCopy"),
  wordNextRow: document.getElementById("wordNextRow"),
  wordNextBtn: document.getElementById("wordNextBtn"),
  wordProgressDots: document.getElementById("wordProgressDots"),
  wordChangeTopicBtn: document.getElementById("wordChangeTopicBtn"),
  wordDoneScreen: document.getElementById("wordDoneScreen"),
  wordDoneSummary: document.getElementById("wordDoneSummary"),
  wordRetryWrongBtn: document.getElementById("wordRetryWrongBtn"),
  wordRestartBtn: document.getElementById("wordRestartBtn"),
  wordChangeTopicBtn2: document.getElementById("wordChangeTopicBtn2"),
  homeScreen: document.getElementById("homeScreen"),
  homeDate: document.getElementById("homeDate"),
  statToday: document.getElementById("statToday"),
  statWeek: document.getElementById("statWeek"),
  statStreak: document.getElementById("statStreak"),
  homeChart: document.getElementById("homeChart"),
  navSentence: document.getElementById("navSentence"),
  navSentenceSub: document.getElementById("navSentenceSub"),
  navWord: document.getElementById("navWord"),
  navWordSub: document.getElementById("navWordSub"),
  homeFromTopic: document.getElementById("homeFromTopic"),
  homeFromWordTopic: document.getElementById("homeFromWordTopic"),
  homeFromPractice: document.getElementById("homeFromPractice"),
  homeFromDone: document.getElementById("homeFromDone"),
  homeFromWordCard: document.getElementById("homeFromWordCard"),
  homeFromWordDone: document.getElementById("homeFromWordDone"),
};

function renderChips() {
  els.topicChips.innerHTML = "";

  const isAllSelected = selectedCats.size === CATEGORIES.length && CATEGORIES.length > 0;
  if (els.allTopicToggleBtn) {
    els.allTopicToggleBtn.textContent = isAllSelected ? "전체 해제" : "전체 선택";
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

function showTopicScreen() {
  hideAllScreens();
  els.topicScreen.style.display = "block";
  renderChips();
}

function startPractice() {
  if (selectedCats.size === 0) return;
  order = shuffle(
    SENTENCES.map((_, i) => i).filter((i) =>
      selectedCats.has(SENTENCES[i].cat),
    ),
  );
  cur = 0;
  els.topicScreen.style.display = "none";
  els.practiceCard.style.display = "block";
  saveProgress();
  renderCard();
}

function copyText(text, btn) {
  if (!text) return;
  const done = () => {
    const original = btn.textContent;
    btn.textContent = "복사됨!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("copied");
    }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(done)
      .catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch (e) {
    /* ignore */
  }
  document.body.removeChild(ta);
  cb();
}

let translateTimer = null;
let translateSeq = 0;

async function runLiveTranslate(text) {
  const seq = ++translateSeq;
  if (!text.trim()) {
    els.liveTranslate.classList.remove("show");
    return;
  }
  els.liveTranslate.classList.add("show");
  els.liveTranslateText.textContent = "번역 중...";
  els.liveTranslateText.classList.add("loading");
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ko`,
    );
    const data = await res.json();
    if (seq !== translateSeq) return; // stale response, a newer request superseded this one
    const translated =
      data && data.responseData && data.responseData.translatedText;
    els.liveTranslateText.textContent =
      translated || "번역을 불러올 수 없어요.";
  } catch (e) {
    if (seq !== translateSeq) return;
    els.liveTranslateText.textContent = "번역을 불러올 수 없어요.";
  } finally {
    if (seq === translateSeq) els.liveTranslateText.classList.remove("loading");
  }
}

els.userInput.addEventListener("input", () => {
  clearTimeout(translateTimer);
  const text = els.userInput.value;
  if (!text.trim()) {
    els.liveTranslate.classList.remove("show");
    return;
  }
  translateTimer = setTimeout(() => runLiveTranslate(text), 700);
});

function openSidePopup(url, title = "GoogleAI_Popup") {
  const width = 640;
  const height = 750;
  const screenWidth = window.screen.availWidth || window.innerWidth;
  const screenHeight = window.screen.availHeight || window.innerHeight;
  const left = Math.max(0, screenWidth - width - 30);
  const top = Math.max(0, Math.floor((screenHeight - height) / 2));
  const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no`;
  const popup = window.open(url, title, features);
  if (popup && popup.focus) {
    popup.focus();
  }
  return popup;
}

function buildGoogleQuery() {
  const answer = els.userInput.value.trim();
  const ko = els.koText.textContent.trim();
  return `"${ko}"를 영어로 "${answer}"라고 썼는데 이 영어 문장 문법 분석해줘`;
}

els.googleAskLink.addEventListener("click", (e) => {
  e.preventDefault();
  const text = els.userInput.value.trim();
  if (!text) return;
  const url =
    "https://www.google.com/search?udm=50&q=" +
    encodeURIComponent(buildGoogleQuery());
  openSidePopup(url, "GoogleAI_Sentence");
});

els.googleAskCopy.addEventListener("click", () => {
  copyText(buildGoogleQuery(), els.googleAskCopy);
});

let recognition = null;
let listening = false;
let micStartTimer = null;
let micStarted = false;
let finalTranscript = "";

const MIC_ERROR_MESSAGES = {
  "not-allowed":
    "마이크 권한이 필요해요. 브라우저 주소창의 🔒 아이콘 → 마이크 → 허용으로 설정해주세요.",
  "permission-denied":
    "마이크 권한이 필요해요. 브라우저 주소창의 🔒 아이콘 → 마이크 → 허용으로 설정해주세요.",
  "service-not-allowed":
    "이 브라우저는 음성 인식 서비스를 지원하지 않아요. Chrome 브라우저에서 시도해보세요.",
  "audio-capture":
    "마이크를 찾을 수 없어요. 기기의 마이크 연결을 확인해주세요.",
  network: "네트워크 문제로 음성 인식에 실패했어요.",
};

function showMicError(msg) {
  els.micError.textContent = msg;
  els.micError.classList.add("show");
}

function clearMicError() {
  els.micError.classList.remove("show");
  els.micError.textContent = "";
}

function stopListeningUI() {
  listening = false;
  micStarted = false;
  clearTimeout(micStartTimer);
  els.micBtn.classList.remove("listening");
  els.micBtn.textContent = "🎤";
}

function armStartupWatchdog() {
  // Some browsers (e.g. Samsung Internet) accept .start() without error
  // but never actually begin listening. If onstart hasn't fired shortly
  // after, treat it as unsupported rather than leaving the UI stuck.
  micStartTimer = setTimeout(() => {
    if (listening && !micStarted) {
      try {
        recognition.stop();
      } catch (err) {
        /* ignore */
      }
      stopListeningUI();
      showMicError(
        "이 브라우저에서는 음성 인식이 지원되지 않아요. Chrome 브라우저에서 시도해보세요.",
      );
    }
  }, 2500);
}

function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    els.micBtn.style.display = "none";
    return;
  }
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = () => {
    micStarted = true;
    clearTimeout(micStartTimer);
  };
  recognition.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal)
        finalTranscript += e.results[i][0].transcript + " ";
      else interim += e.results[i][0].transcript;
    }
    els.userInput.value = (finalTranscript + interim).trim();
    els.userInput.dispatchEvent(new Event("input"));
  };
  recognition.onend = () => {
    // Continuous mode can still end early (e.g. after a pause). If the
    // user hasn't pressed stop, seamlessly restart instead of dropping
    // the session — mirrors the retry behavior from the previous OPIc app.
    if (listening) {
      try {
        recognition.start();
        return;
      } catch (e) {
        /* fall through to stopping the UI below */
      }
    }
    stopListeningUI();
  };
  recognition.onerror = (e) => {
    // Transient hiccups — ignore and let continuous mode keep going.
    if (e.error === "no-speech" || e.error === "aborted") return;

    if (e.error === "network" && listening) {
      // Rebuild the engine and retry shortly, rather than giving up —
      // network blips during continuous listening are usually temporary.
      recognition.onend = null;
      try {
        recognition.stop();
      } catch (err) {
        /* ignore */
      }
      initSpeechRecognition();
      setTimeout(() => {
        if (!listening) return;
        try {
          recognition.start();
          armStartupWatchdog();
        } catch (err) {
          stopListeningUI();
          showMicError(MIC_ERROR_MESSAGES.network);
        }
      }, 800);
      return;
    }

    stopListeningUI();
    showMicError(
      MIC_ERROR_MESSAGES[e.error] ||
        "이 브라우저에서는 음성 인식이 지원되지 않아요. Chrome 브라우저에서 시도해보세요.",
    );
  };
}

els.micBtn.addEventListener("click", async () => {
  if (!recognition) return;
  if (listening) {
    recognition.onend = null; // don't auto-restart when the user explicitly stops
    recognition.stop();
    initSpeechRecognition(); // rebind handlers on a fresh instance for next time
    stopListeningUI();
    return;
  }
  clearMicError();

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      showMicError(
        "마이크 권한이 꺼져 있어요. 브라우저 설정에서 마이크 권한을 허용해주세요.",
      );
      return;
    }
  }

  finalTranscript = els.userInput.value ? els.userInput.value + " " : "";
  try {
    recognition.start();
    listening = true;
    els.micBtn.classList.add("listening");
    els.micBtn.textContent = "⏹";
    armStartupWatchdog();
  } catch (e) {
    stopListeningUI();
    showMicError(
      "이 브라우저에서는 음성 인식이 지원되지 않아요. Chrome 브라우저에서 시도해보세요.",
    );
  }
});

initSpeechRecognition();

// ── TEXT-TO-SPEECH (TTS) MANAGER ────────────────────────────────
const TTS_RATE_KEY = "ko-en-opic-tts-rate";
const TTS_AUTOPLAY_KEY = "ko-en-opic-tts-autoplay";

let ttsVoices = [];
let currentTtsRate = 1.0;
let autoPlayTtsEnabled = false;
let currentUtterance = null;
let activeTtsBtn = null;

function loadTtsSettings() {
  try {
    const savedRate = localStorage.getItem(TTS_RATE_KEY);
    if (savedRate) currentTtsRate = parseFloat(savedRate) || 1.0;
    const savedAutoPlay = localStorage.getItem(TTS_AUTOPLAY_KEY);
    if (savedAutoPlay !== null) autoPlayTtsEnabled = savedAutoPlay === "true";
  } catch (e) {}
  updateTtsSettingsUI();
}

function saveTtsSettings() {
  try {
    localStorage.setItem(TTS_RATE_KEY, String(currentTtsRate));
    localStorage.setItem(TTS_AUTOPLAY_KEY, String(autoPlayTtsEnabled));
  } catch (e) {}
}

function updateTtsSettingsUI() {
  if (els.autoPlayTts) els.autoPlayTts.checked = autoPlayTtsEnabled;
  document.querySelectorAll(".speed-chip").forEach((btn) => {
    const speed = parseFloat(btn.dataset.speed);
    btn.classList.toggle("active", Math.abs(speed - currentTtsRate) < 0.05);
  });
}

function initTTS() {
  if (!("speechSynthesis" in window)) return;
  const updateVoices = () => {
    ttsVoices = window.speechSynthesis.getVoices() || [];
  };
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

function getBestVoice(lang = "en-US") {
  if (!ttsVoices.length) ttsVoices = window.speechSynthesis.getVoices() || [];
  if (lang.startsWith("en")) {
    const enVoices = ttsVoices.filter((v) => v.lang && v.lang.startsWith("en"));
    const preferred =
      enVoices.find(
        (v) =>
          /Google US English|Samantha|Karen|Daniel|Alex|Natural/i.test(
            v.name,
          ) && v.lang === "en-US",
      ) ||
      enVoices.find((v) => v.lang === "en-US") ||
      enVoices.find((v) => v.lang.startsWith("en"));
    return preferred || null;
  } else if (lang.startsWith("ko")) {
    const koVoices = ttsVoices.filter((v) => v.lang && v.lang.startsWith("ko"));
    const preferred =
      koVoices.find((v) => /Google|Yuna/i.test(v.name)) || koVoices[0];
    return preferred || null;
  }
  return null;
}

function stopTTS() {
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {}
  if (activeTtsBtn) {
    activeTtsBtn.classList.remove("playing");
    if (activeTtsBtn.dataset.originalText) {
      activeTtsBtn.textContent = activeTtsBtn.dataset.originalText;
    }
    activeTtsBtn = null;
  }
  currentUtterance = null;
}

function speakText(text, lang = "en-US", btn = null) {
  if (!("speechSynthesis" in window) || !text) return;

  if (btn && activeTtsBtn === btn && window.speechSynthesis.speaking) {
    stopTTS();
    return;
  }

  stopTTS();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = currentTtsRate;
  utterance.pitch = 1.0;

  const voice = getBestVoice(lang);
  if (voice) utterance.voice = voice;

  if (btn) {
    activeTtsBtn = btn;
    if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
    btn.classList.add("playing");
    btn.textContent = "⏹ 정지";
  }

  utterance.onend = () => {
    if (btn && activeTtsBtn === btn) {
      btn.classList.remove("playing");
      if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
      activeTtsBtn = null;
    }
    currentUtterance = null;
  };

  utterance.onerror = () => {
    if (btn && activeTtsBtn === btn) {
      btn.classList.remove("playing");
      if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
      activeTtsBtn = null;
    }
    currentUtterance = null;
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

// Audio controls & Speed selector
document.querySelectorAll(".speed-chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentTtsRate = parseFloat(btn.dataset.speed) || 1.0;
    saveTtsSettings();
    updateTtsSettingsUI();
  });
});

if (els.autoPlayTts) {
  els.autoPlayTts.addEventListener("change", () => {
    autoPlayTtsEnabled = els.autoPlayTts.checked;
    saveTtsSettings();
  });
}

// ── SPEAKING & SIMILARITY EVALUATION ─────────────────────────────
function normalizeForEval(text) {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function evaluateSpeech(userInput, modelAnswer) {
  const cleanInput = normalizeForEval(userInput);
  const cleanModel = normalizeForEval(modelAnswer);
  if (!cleanInput) return null;

  const inputWords = cleanInput.split(" ").filter(Boolean);
  const modelWords = cleanModel.split(" ").filter(Boolean);

  if (!modelWords.length) return null;

  const modelMatched = new Array(modelWords.length).fill(false);
  const inputMatched = new Array(inputWords.length).fill(false);
  let matchCount = 0;

  modelWords.forEach((mWord, mIdx) => {
    inputWords.forEach((iWord, iIdx) => {
      if (!modelMatched[mIdx] && !inputMatched[iIdx] && mWord === iWord) {
        modelMatched[mIdx] = true;
        inputMatched[iIdx] = true;
        matchCount++;
      }
    });
  });

  const recall = matchCount / modelWords.length;
  const precision = inputWords.length ? matchCount / inputWords.length : 0;
  const score = Math.round(
    ((2 * precision * recall) / (precision + recall || 1)) * 100,
  );

  const diffTokens = modelWords.map((word, idx) => ({
    word: word,
    matched: modelMatched[idx],
  }));

  const extraWords = inputWords.filter((_, idx) => !inputMatched[idx]);

  return {
    score: isNaN(score) ? 0 : score,
    diffTokens,
    extraWords,
    inputWordsCount: inputWords.length,
    modelWordsCount: modelWords.length,
    matchCount,
  };
}

function renderSpeechEvaluation(evalData) {
  if (!evalData || !els.speechEvalBox) {
    if (els.speechEvalBox) els.speechEvalBox.classList.remove("show");
    return;
  }

  els.speechEvalBox.classList.add("show");

  els.evalScoreBadge.textContent = `${evalData.score}% 일치`;
  els.evalScoreBadge.className =
    "eval-score-badge " +
    (evalData.score >= 85 ? "high" : evalData.score >= 60 ? "mid" : "low");

  const diffHtml = evalData.diffTokens
    .map((t) => {
      if (t.matched) {
        return `<span class="eval-word match">✓ ${escapeHtml(t.word)}</span>`;
      } else {
        return `<span class="eval-word miss">${escapeHtml(t.word)}</span>`;
      }
    })
    .join(" ");

  let extraHtml = "";
  if (evalData.extraWords.length) {
    extraHtml = `<div style="margin-top:6px; font-size:12px; color:var(--ink-soft);"><span style="font-family:'IBM Plex Mono'; font-size:10px; color:var(--gold);">[추가/변경된 단어]:</span> ${evalData.extraWords.map((w) => `<span class="eval-word actual">${escapeHtml(w)}</span>`).join(" ")}</div>`;
  }

  els.evalDiff.innerHTML = diffHtml + extraHtml;

  let feedback = "";
  if (evalData.score >= 90) {
    feedback =
      "🎯 거의 완벽한 발음과 문장 일치도예요! OPIc 시험에서도 이렇게 자연스럽게 발화해 보세요.";
  } else if (evalData.score >= 70) {
    feedback =
      "👏 의미 전달이 매우 훌륭해요! 누락된 단어(빨간색 취소선)를 유의하며 한 번 더 발음해 보세요.";
  } else if (evalData.score >= 40) {
    feedback =
      "💪 핵심 단어들이 잘 포착되었어요. 모범 답안 발음을 듣고 전체 문장을 다시 소리내어 말해보세요.";
  } else {
    feedback =
      "💡 소리내어 말하기 연습을 위해 🔊 발음 듣기 버튼으로 원어민 발음을 듣고 따라 해보세요.";
  }
  els.evalFeedback.textContent = feedback;
}

els.copyKo.addEventListener("click", () =>
  copyText(els.koText.textContent, els.copyKo),
);
els.copyEn.addEventListener("click", () =>
  copyText(els.enText.textContent, els.copyEn),
);
els.copyInput.addEventListener("click", () =>
  copyText(els.userInput.value, els.copyInput),
);

if (els.ttsKoBtn) {
  els.ttsKoBtn.addEventListener("click", () =>
    speakText(els.koText.textContent, "ko-KR", els.ttsKoBtn),
  );
}
if (els.ttsEnBtn) {
  els.ttsEnBtn.addEventListener("click", () =>
    speakText(els.enText.textContent, "en-US", els.ttsEnBtn),
  );
}
if (els.ttsUserInputBtn) {
  els.ttsUserInputBtn.addEventListener("click", () =>
    speakText(els.userInput.value.trim(), "en-US", els.ttsUserInputBtn),
  );
}

els.changeTopicBtn.addEventListener("click", showTopicScreen);
document
  .getElementById("changeTopicBtn2")
  .addEventListener("click", showTopicScreen);
document.getElementById("startBtn").addEventListener("click", startPractice);

function buildDots() {
  els.progressDots.innerHTML = "";
  order.forEach((idx, i) => {
    const d = document.createElement("div");
    d.className =
      "dot" +
      (results[idx] === "good"
        ? " done"
        : results[idx] === "bad"
          ? " miss"
          : "") +
      (i === cur ? " cur" : "");
    els.progressDots.appendChild(d);
  });
}

function renderCard() {
  stopTTS();
  if (cur >= order.length) {
    els.practiceCard.style.display = "none";
    els.doneScreen.classList.add("show");
    const good = order.filter((idx) => results[idx] === "good").length;
    const wrongIndices = order.filter((idx) => results[idx] === "bad");
    els.doneSummary.textContent =
      `총 ${order.length}문장 중 ${good}문장을 잘했어요.` +
      (wrongIndices.length
        ? ` 틀린 문장 ${wrongIndices.length}개는 아래에서 다시 연습해보세요.`
        : "");
    if (wrongIndices.length) {
      els.retryWrongBtn.style.display = "block";
      els.retryWrongBtn.textContent = `틀린 문제만 다시 풀기 (${wrongIndices.length}개)`;
      els.retryWrongBtn.onclick = () => {
        order = shuffle(wrongIndices);
        cur = 0;
        els.doneScreen.classList.remove("show");
        els.practiceCard.style.display = "block";
        saveProgress();
        renderCard();
      };
    } else {
      els.retryWrongBtn.style.display = "none";
    }
    return;
  }
  els.practiceCard.style.display = "block";
  els.doneScreen.classList.remove("show");
  const item = SENTENCES[order[cur]];
  els.koText.textContent = item.ko;
  els.enText.textContent = item.en;
  els.tipText.textContent = item.tip;
  els.catLabel.textContent = item.cat;
  els.idxLabel.textContent = `${String(cur + 1).padStart(2, "0")} / ${String(order.length).padStart(2, "0")}`;
  els.userInput.value = "";
  if (listening && recognition) {
    recognition.onend = null;
    recognition.stop();
    initSpeechRecognition();
    stopListeningUI();
  }
  clearMicError();
  els.liveTranslate.classList.remove("show");
  els.grammarBox.classList.remove("show");
  els.grammarContent.innerHTML = "";
  if (els.speechEvalBox) els.speechEvalBox.classList.remove("show");
  translateSeq++;
  clearTimeout(translateTimer);
  revealed = false;
  els.answerBox.classList.remove("show");
  els.revealRow.style.display = "flex";
  els.rateRow.style.display = "none";
  els.retrySameLink.style.display = "none";
  buildDots();
}

function reveal() {
  stopTTS();
  revealed = true;
  els.answerBox.classList.add("show");
  els.revealRow.style.display = "none";
  els.rateRow.style.display = "flex";
  els.retrySameLink.style.display = "block";
  const text = els.userInput.value.trim();
  const item = SENTENCES[order[cur]];
  if (text) {
    checkGrammar(text);
    const evalData = evaluateSpeech(text, item.en);
    renderSpeechEvaluation(evalData);
  } else {
    els.grammarBox.classList.remove("show");
    renderSpeechEvaluation(null);
  }
  if (autoPlayTtsEnabled && item) {
    speakText(item.en, "en-US", els.ttsEnBtn);
  }
}

function retrySameQuestion() {
  stopTTS();
  els.userInput.value = "";
  if (listening && recognition) {
    recognition.onend = null;
    recognition.stop();
    initSpeechRecognition();
    stopListeningUI();
  }
  clearMicError();
  els.liveTranslate.classList.remove("show");
  els.grammarBox.classList.remove("show");
  els.grammarContent.innerHTML = "";
  if (els.speechEvalBox) els.speechEvalBox.classList.remove("show");
  translateSeq++;
  clearTimeout(translateTimer);
  revealed = false;
  els.answerBox.classList.remove("show");
  els.revealRow.style.display = "flex";
  els.rateRow.style.display = "none";
  els.retrySameLink.style.display = "none";
  els.userInput.focus();
}

els.retrySameLink.addEventListener("click", retrySameQuestion);

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function checkGrammar(text) {
  els.grammarBox.classList.add("show");
  els.grammarContent.innerHTML =
    '<div class="g-note">문법을 분석하고 있어요...</div>';
  try {
    const res = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `text=${encodeURIComponent(text)}&language=en-US&level=picky`,
    });
    const data = await res.json();
    await renderGrammarResults(data.matches || [], text);
  } catch (e) {
    els.grammarContent.innerHTML =
      '<div class="g-note">문법 분석을 불러올 수 없어요. 잠시 후 다시 시도해보세요.</div>';
  }
}

async function translateToKorean(text) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ko`,
    );
    const data = await res.json();
    return (
      (data && data.responseData && data.responseData.translatedText) || text
    );
  } catch (e) {
    return text;
  }
}

async function renderGrammarResults(matches, text) {
  if (!matches.length) {
    els.grammarContent.innerHTML =
      '<div class="g-good">문법 오류를 찾지 못했어요! 잘하셨어요 👍</div>';
    return;
  }
  const top = matches.slice(0, 5);
  const translatedMsgs = await Promise.all(
    top.map((m) => translateToKorean(m.message)),
  );
  const html = top
    .map((m, i) => {
      const start = Math.max(0, m.offset - 15);
      const end = Math.min(text.length, m.offset + m.length + 15);
      const before = escapeHtml(text.slice(start, m.offset));
      const flagged = escapeHtml(text.slice(m.offset, m.offset + m.length));
      const after = escapeHtml(text.slice(m.offset + m.length, end));
      const suggestion =
        m.replacements && m.replacements.length ? m.replacements[0].value : "";
      return `<div class="g-item">
      <div class="g-excerpt">${before}<u>${flagged}</u>${after}</div>
      <div class="g-msg">${escapeHtml(translatedMsgs[i])}</div>
      ${suggestion ? `<div class="g-fix">→ ${escapeHtml(suggestion)}</div>` : ""}
    </div>`;
    })
    .join("");
  els.grammarContent.innerHTML = html;
}

function rate(val) {
  results[order[cur]] = val;
  saveProgress();
  logPracticeEvent();
  cur++;
  renderCard();
}

function skip() {
  cur++;
  saveProgress();
  renderCard();
}

async function saveProgress() {
  try {
    await storage.set(
      STORAGE_KEY,
      JSON.stringify({ results, cur, order, cats: [...selectedCats] }),
      false,
    );
  } catch (e) {
    /* best effort */
  }
}

async function loadProgress() {
  try {
    const res = await storage.get(STORAGE_KEY, false);
    if (res && res.value) {
      const data = JSON.parse(res.value);
      results = data.results || {};
      if (Array.isArray(data.cats) && data.cats.length) {
        selectedCats = new Set(data.cats.filter((c) => CATEGORIES.includes(c)));
      }
      if (
        Array.isArray(data.order) &&
        data.order.length &&
        data.order.every((i) => i >= 0 && i < SENTENCES.length)
      ) {
        order = data.order;
        cur = data.cur || 0;
      }
    }
  } catch (e) {
    /* no saved progress */
  }
}

document.getElementById("revealBtn").addEventListener("click", reveal);
document.getElementById("skipBtn").addEventListener("click", skip);
document
  .getElementById("goodBtn")
  .addEventListener("click", () => rate("good"));
document.getElementById("badBtn").addEventListener("click", () => rate("bad"));
document.getElementById("restartBtn").addEventListener("click", () => {
  startPractice();
});
document.addEventListener("keydown", (e) => {
  const isInputFocused = document.activeElement === els.userInput;

  // Global Esc to stop audio / recognition
  if (e.key === "Escape") {
    stopTTS();
    if (listening && recognition) {
      recognition.stop();
      stopListeningUI();
    }
    return;
  }

  // 1. Sentence Practice Card
  if (
    els.practiceCard.style.display !== "none" &&
    !els.doneScreen.classList.contains("show")
  ) {
    const item = SENTENCES[order[cur]];
    if (!revealed) {
      if (e.key === "Enter" && (!isInputFocused || !e.shiftKey)) {
        e.preventDefault();
        reveal();
      }
    } else {
      // Once revealed:
      if (
        e.key === "1" ||
        e.key === "g" ||
        e.key === "G" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        rate("good");
      } else if (
        e.key === "2" ||
        e.key === "b" ||
        e.key === "B" ||
        e.key === "ArrowLeft"
      ) {
        e.preventDefault();
        rate("bad");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        retrySameQuestion();
      } else if (e.code === "Space" && !isInputFocused) {
        e.preventDefault();
        if (item) speakText(item.en, "en-US", els.ttsEnBtn);
      } else if (e.key === "Enter" && !isInputFocused) {
        e.preventDefault();
        rate("good");
      }
    }
  }

  // 2. Grammar / Word Practice Card
  if (
    els.wordCard.style.display !== "none" &&
    !els.wordDoneScreen.classList.contains("show")
  ) {
    const item = WORD_ITEMS[wordOrder[wordCur]];
    if (!wordAnswered) {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const optBtns = els.wordOptions.querySelectorAll(".word-opt");
        if (optBtns[idx] && item && item.options[idx]) {
          e.preventDefault();
          selectWordOption(item.options[idx], optBtns[idx], item);
        }
      }
    } else {
      if (e.key === "Enter") {
        e.preventDefault();
        wordCur++;
        saveWordProgress();
        renderWordCard();
      } else if (e.code === "Space") {
        e.preventDefault();
        if (item) {
          const match = item.tip && item.tip.match(/예\)\s*([^.]+)/);
          const speechText = match ? match[1].trim() : item.answer;
          speakText(speechText, "en-US", els.ttsWordBtn);
        }
      }
    }
  }

  // 3. Done Screens
  if (els.doneScreen.classList.contains("show")) {
    if (e.key === "Enter") {
      e.preventDefault();
      startPractice();
    }
  }
  if (els.wordDoneScreen.classList.contains("show")) {
    if (e.key === "Enter") {
      e.preventDefault();
      startWordPractice();
    }
  }
});

// ── GRAMMAR POINT PRACTICE MODE (전치사·접속사·관사·시제·비교급·대명사 등) ──
let WORD_CATEGORIES = [];
const WORD_STORAGE_KEY = "ko-en-opic-word-progress";

let wordSelectedCats = new Set();
let wordOrder = [];
let wordCur = 0;
let wordResults = {}; // idx -> 'good' | 'bad'
let wordAnswered = false;

function hideAllScreens() {
  stopTTS();
  if (listening && recognition) {
    recognition.onend = null;
    recognition.stop();
    initSpeechRecognition();
    stopListeningUI();
  }
  els.homeScreen.style.display = "none";
  els.topicScreen.style.display = "none";
  els.practiceCard.style.display = "none";
  els.doneScreen.classList.remove("show");
  els.wordTopicScreen.style.display = "none";
  els.wordCard.style.display = "none";
  els.wordDoneScreen.classList.remove("show");
}

els.toWordModeLink.addEventListener("click", () => {
  hideAllScreens();
  els.wordTopicScreen.style.display = "block";
  renderWordChips();
});

els.toSentenceModeLink.addEventListener("click", () => {
  showTopicScreen();
});

function renderWordChips() {
  els.wordTopicChips.innerHTML = "";

  const isAllSelected =
    wordSelectedCats.size === WORD_CATEGORIES.length &&
    WORD_CATEGORIES.length > 0;
  if (els.allWordTopicToggleBtn) {
    els.allWordTopicToggleBtn.textContent = isAllSelected
      ? "전체 해제"
      : "전체 선택";
    els.allWordTopicToggleBtn.onclick = () => {
      wordSelectedCats = isAllSelected ? new Set() : new Set(WORD_CATEGORIES);
      renderWordChips();
    };
  }

  WORD_CATEGORIES.forEach((cat) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (wordSelectedCats.has(cat) ? " active" : "");
    chip.textContent = cat;
    chip.onclick = () => {
      if (wordSelectedCats.has(cat)) wordSelectedCats.delete(cat);
      else wordSelectedCats.add(cat);
      renderWordChips();
    };
    els.wordTopicChips.appendChild(chip);
  });

  const count = WORD_ITEMS.filter((w) => wordSelectedCats.has(w.cat)).length;
  els.wordTopicCount.textContent = wordSelectedCats.size
    ? `(${count}문제 · ${wordSelectedCats.size}개 유형)`
    : "(유형을 선택하세요)";
  els.wordStartBtn.disabled = wordSelectedCats.size === 0;
  els.wordStartBtn.style.opacity = wordSelectedCats.size === 0 ? ".45" : "1";
  els.wordStartBtn.style.cursor =
    wordSelectedCats.size === 0 ? "not-allowed" : "pointer";
}

function startWordPractice() {
  if (wordSelectedCats.size === 0) return;
  wordOrder = shuffle(
    WORD_ITEMS.map((_, i) => i).filter((i) =>
      wordSelectedCats.has(WORD_ITEMS[i].cat),
    ),
  );
  wordCur = 0;
  hideAllScreens();
  els.wordCard.style.display = "block";
  saveWordProgress();
  renderWordCard();
}

els.wordStartBtn.addEventListener("click", startWordPractice);
els.wordChangeTopicBtn.addEventListener("click", () => {
  hideAllScreens();
  els.wordTopicScreen.style.display = "block";
  renderWordChips();
});
els.wordChangeTopicBtn2.addEventListener("click", () => {
  hideAllScreens();
  els.wordTopicScreen.style.display = "block";
  renderWordChips();
});

function buildWordDots() {
  els.wordProgressDots.innerHTML = "";
  wordOrder.forEach((idx, i) => {
    const d = document.createElement("div");
    d.className =
      "dot" +
      (wordResults[idx] === "good"
        ? " done"
        : wordResults[idx] === "bad"
          ? " miss"
          : "") +
      (i === wordCur ? " cur" : "");
    els.wordProgressDots.appendChild(d);
  });
}

function renderWordCard() {
  stopTTS();
  if (wordCur >= wordOrder.length) {
    els.wordCard.style.display = "none";
    els.wordDoneScreen.classList.add("show");
    const good = wordOrder.filter((idx) => wordResults[idx] === "good").length;
    const wrongIndices = wordOrder.filter((idx) => wordResults[idx] === "bad");
    els.wordDoneSummary.textContent =
      `총 ${wordOrder.length}문제 중 ${good}문제를 맞혔어요.` +
      (wrongIndices.length
        ? ` 틀린 문제 ${wrongIndices.length}개는 아래에서 다시 연습해보세요.`
        : "");
    if (wrongIndices.length) {
      els.wordRetryWrongBtn.style.display = "block";
      els.wordRetryWrongBtn.textContent = `틀린 문제만 다시 풀기 (${wrongIndices.length}개)`;
      els.wordRetryWrongBtn.onclick = () => {
        wordOrder = shuffle(wrongIndices);
        wordCur = 0;
        els.wordDoneScreen.classList.remove("show");
        els.wordCard.style.display = "block";
        saveWordProgress();
        renderWordCard();
      };
    } else {
      els.wordRetryWrongBtn.style.display = "none";
    }
    return;
  }

  els.wordCard.style.display = "block";
  els.wordDoneScreen.classList.remove("show");
  const item = WORD_ITEMS[wordOrder[wordCur]];
  els.wordCatLabel.textContent = item.cat;
  els.wordIdxLabel.textContent = `${String(wordCur + 1).padStart(2, "0")} / ${String(wordOrder.length).padStart(2, "0")}`;
  els.wordSentence.textContent = item.prompt;
  els.wordExplain.classList.remove("show");
  els.wordExplain.textContent = "";
  els.wordGoogleAskRow.style.display = "none";
  els.wordNextRow.style.display = "none";
  wordAnswered = false;

  els.wordOptions.innerHTML = "";
  item.options.forEach((opt, optIdx) => {
    const btn = document.createElement("button");
    btn.className = "word-opt";
    btn.dataset.option = opt;
    btn.innerHTML = `<span class="opt-num-badge">${optIdx + 1}</span> <span>${escapeHtml(opt)}</span>`;
    btn.onclick = () => selectWordOption(opt, btn, item);
    els.wordOptions.appendChild(btn);
  });

  buildWordDots();
}

function selectWordOption(opt, btn, item) {
  if (wordAnswered) return;
  wordAnswered = true;
  const isCorrect = opt === item.answer;
  wordResults[wordOrder[wordCur]] = isCorrect ? "good" : "bad";
  saveWordProgress();
  logPracticeEvent();

  Array.from(els.wordOptions.children).forEach((b) => {
    b.classList.add("disabled");
    if (b.dataset.option === item.answer) b.classList.add("correct");
    else if (b === btn) b.classList.add("wrong");
  });

  els.wordExplain.textContent = item.tip;
  els.wordExplain.classList.add("show");
  els.wordGoogleAskRow.style.display = "flex";
  els.wordNextRow.style.display = "flex";
  buildWordDots();

  if (autoPlayTtsEnabled) {
    const match = item.tip && item.tip.match(/예\)\s*([^.]+)/);
    const speechText = match ? match[1].trim() : item.answer;
    speakText(speechText, "en-US", els.ttsWordBtn);
  }
}

if (els.ttsWordBtn) {
  els.ttsWordBtn.addEventListener("click", () => {
    const item = WORD_ITEMS[wordOrder[wordCur]];
    if (!item) return;
    if (wordAnswered) {
      const match = item.tip && item.tip.match(/예\)\s*([^.]+)/);
      const speechText = match ? match[1].trim() : item.answer;
      speakText(speechText, "en-US", els.ttsWordBtn);
    } else {
      const isKo = /[\u3131-\uD79D]/.test(item.prompt);
      speakText(item.prompt, isKo ? "ko-KR" : "en-US", els.ttsWordBtn);
    }
  });
}

function buildWordGoogleQuery(item) {
  return `'${item.answer}' 표현은 언제 사용해?`;
}

els.wordGoogleAskLink.addEventListener("click", (e) => {
  e.preventDefault();
  const item = WORD_ITEMS[wordOrder[wordCur]];
  if (!item) return;
  const url =
    "https://www.google.com/search?udm=50&q=" +
    encodeURIComponent(buildWordGoogleQuery(item));
  openSidePopup(url, "GoogleAI_Word");
});

els.wordGoogleAskCopy.addEventListener("click", () => {
  const item = WORD_ITEMS[wordOrder[wordCur]];
  if (!item) return;
  copyText(buildWordGoogleQuery(item), els.wordGoogleAskCopy);
});

els.wordNextBtn.addEventListener("click", () => {
  wordCur++;
  saveWordProgress();
  renderWordCard();
});

els.wordRestartBtn.addEventListener("click", () => {
  startWordPractice();
});

async function saveWordProgress() {
  try {
    await storage.set(
      WORD_STORAGE_KEY,
      JSON.stringify({
        results: wordResults,
        cur: wordCur,
        order: wordOrder,
        cats: [...wordSelectedCats],
      }),
      false,
    );
  } catch (e) {
    /* best effort */
  }
}

async function loadWordProgress() {
  try {
    const res = await storage.get(WORD_STORAGE_KEY, false);
    if (res && res.value) {
      const data = JSON.parse(res.value);
      wordResults = data.results || {};
      if (Array.isArray(data.cats) && data.cats.length) {
        wordSelectedCats = new Set(
          data.cats.filter((c) => WORD_CATEGORIES.includes(c)),
        );
      }
    }
  } catch (e) {
    /* no saved progress */
  }
}

// ── HOME DASHBOARD ───────────────────────────────────────────────
const DAILY_LOG_KEY = "ko-en-opic-daily-log";
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
let dailyLog = {};

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function loadDailyLog() {
  try {
    const res = await storage.get(DAILY_LOG_KEY, false);
    if (res && res.value) dailyLog = JSON.parse(res.value) || {};
  } catch (e) {
    dailyLog = {};
  }
}

async function saveDailyLog() {
  try {
    await storage.set(DAILY_LOG_KEY, JSON.stringify(dailyLog), false);
  } catch (e) {
    /* best effort */
  }
}

function logPracticeEvent() {
  const key = todayKey();
  dailyLog[key] = (dailyLog[key] || 0) + 1;
  saveDailyLog();
}

function computeStreak() {
  let streak = 0;
  const d = new Date();
  if (!dailyLog[todayKey(d)]) d.setDate(d.getDate() - 1);
  while (dailyLog[todayKey(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function last7Days() {
  const days = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    days.push({
      key: todayKey(dd),
      label: DAY_LABELS[dd.getDay()],
      isToday: i === 0,
    });
  }
  return days;
}

function renderHomeDashboard() {
  const days = last7Days();
  const today = dailyLog[days[days.length - 1].key] || 0;
  const week = days.reduce((sum, d) => sum + (dailyLog[d.key] || 0), 0);

  els.homeDate.textContent = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  els.statToday.textContent = today;
  els.statWeek.textContent = week;
  els.statStreak.textContent = computeStreak();

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

  const sentenceResumable = order.length > 0 && cur < order.length;
  els.navSentenceSub.textContent = sentenceResumable
    ? `이어하기 · ${cur}/${order.length}문제 진행 중`
    : `${SENTENCES.length}문장 · ${CATEGORIES.length}개 주제`;

  const wordResumable = wordOrder.length > 0 && wordCur < wordOrder.length;
  els.navWordSub.textContent = wordResumable
    ? `이어하기 · ${wordCur}/${wordOrder.length}문제 진행 중`
    : `${WORD_ITEMS.length}문제 · ${WORD_CATEGORIES.length}개 유형`;
}

function showHomeScreen() {
  hideAllScreens();
  els.homeScreen.style.display = "flex";
  renderHomeDashboard();
}

els.navSentence.addEventListener("click", () => {
  hideAllScreens();
  if (order.length > 0 && cur < order.length) {
    els.practiceCard.style.display = "block";
    renderCard();
  } else {
    els.topicScreen.style.display = "block";
    renderChips();
  }
});

els.navWord.addEventListener("click", () => {
  hideAllScreens();
  if (wordOrder.length > 0 && wordCur < wordOrder.length) {
    els.wordCard.style.display = "block";
    renderWordCard();
  } else {
    els.wordTopicScreen.style.display = "block";
    renderWordChips();
  }
});

[
  els.homeFromTopic,
  els.homeFromWordTopic,
  els.homeFromPractice,
  els.homeFromDone,
  els.homeFromWordCard,
  els.homeFromWordDone,
].forEach((el) => el && el.addEventListener("click", showHomeScreen));

async function loadData() {
  try {
    const [sentencesRes, grammarRes] = await Promise.all([
      fetch("data/sentences_im1.json"),
      fetch("data/grammar_im1.json"),
    ]);
    SENTENCES = await sentencesRes.json();
    CATEGORIES = [...new Set(SENTENCES.map((s) => s.cat))];
    WORD_ITEMS = await grammarRes.json();
    WORD_CATEGORIES = [...new Set(WORD_ITEMS.map((w) => w.cat))];
  } catch (e) {
    console.error("데이터 로드 실패:", e);
  }
}

async function initDashboard() {
  await loadData();
  initTTS();
  loadTtsSettings();
  await loadDailyLog();
  await loadWordProgress();
  await loadProgress();
  renderHomeDashboard();
}

initDashboard();
