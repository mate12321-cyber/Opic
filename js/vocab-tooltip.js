/**
 * [vocab-tooltip.js] 영어 문장 단어/표현 드래그 & 더블클릭 인라인 번역 툴팁 시스템
 * - 초고속 점진적 렌더링 (한국어 뜻 즉시 렌더링 + 영영사전/발음기호 병렬 수신)
 * - 인메모리 L1 캐시 + LocalStorage L2 캐시 (재조회 시 0ms 즉각 표시)
 * - Google Translate & MyMemory & Free Dictionary API 완전 병렬 처리
 * - Web Speech API 연동 발음 재생 및 내 단어장 저장/북마크 지원
 */

(function () {
  const VOCAB_CACHE_KEY = "ko-en-opic-vocab-cache";
  const SAVED_WORDS_KEY = "ko-en-opic-saved-words";
  const memCache = new Map(); // L1 초고속 인메모리 캐시

  let tooltipEl = null;
  let currentTargetWord = "";
  let currentWordData = null;
  let isMouseInsideTooltip = false;
  let selectionDebounceTimer = null;

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
        phonetic: wordData.phonetic || "",
        partOfSpeech: wordData.partOfSpeech || "",
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

    // 이벤트 리스너 바인딩
    tooltipEl.addEventListener("mouseenter", () => {
      isMouseInsideTooltip = true;
    });
    tooltipEl.addEventListener("mouseleave", () => {
      isMouseInsideTooltip = false;
    });

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

    const tooltipWidth = Math.min(320, window.innerWidth - 24);
    tooltipEl.style.width = `${tooltipWidth}px`;

    const targetCenterX = rect.left + rect.width / 2;
    let left = targetCenterX - tooltipWidth / 2;

    // 좌우 화면 경계 여백 보정 (최소 12px)
    if (left < 12) left = 12;
    if (left + tooltipWidth > window.innerWidth - 12) {
      left = window.innerWidth - tooltipWidth - 12;
    }

    const arrowEl = document.getElementById("vocabTooltipArrow");
    const arrowLeft = Math.max(16, Math.min(tooltipWidth - 16, targetCenterX - left));

    if (arrowEl) {
      arrowEl.style.left = `${arrowLeft - 5}px`;
    }

    const approxHeight = 170;
    let top = rect.top - approxHeight - 10;
    let placement = "top";

    // 상단 공간이 부족하면 하단으로 전환
    if (top < 10) {
      top = rect.bottom + 10;
      placement = "bottom";
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

  // 빠른 타임아웃 지원 fetch 유틸
  async function fetchWithTimeout(url, timeoutMs = 2500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  }

  // 한국어 번역 가져오기 (Google -> MyMemory Fallback)
  async function fetchKoreanMeaning(queryText) {
    // 1. Google Translate (초고속 ~100-200ms)
    try {
      const url =
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=" +
        encodeURIComponent(queryText);
      const res = await fetchWithTimeout(url, 2000);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const text = data[0].map((chunk) => chunk[0]).join("").trim();
          if (text) return text;
        }
      }
    } catch (e) {}

    // 2. MyMemory Fallback
    try {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(queryText)}&langpair=en|ko`;
      const res = await fetchWithTimeout(myMemoryUrl, 2500);
      if (res.ok) {
        const data = await res.json();
        if (data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText.trim();
        }
      }
    } catch (e) {}

    return "";
  }

  // 영영사전 상세 정보 가져오기 (Free Dictionary API)
  async function fetchEnglishDictionary(singleWord) {
    try {
      const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(singleWord.toLowerCase())}`;
      const res = await fetchWithTimeout(dictUrl, 2500);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          const phonetic =
            entry.phonetic ||
            (entry.phonetics && entry.phonetics.find((p) => p.text)?.text) ||
            "";

          let partOfSpeech = "";
          let definition = "";
          let example = "";

          if (entry.meanings && entry.meanings.length > 0) {
            const m = entry.meanings[0];
            partOfSpeech = m.partOfSpeech || "";
            if (m.definitions && m.definitions.length > 0) {
              definition = m.definitions[0].definition || "";
              example = m.definitions[0].example || "";
            }
          }

          return { phonetic, partOfSpeech, definition, example };
        }
      }
    } catch (e) {}
    return { phonetic: "", partOfSpeech: "", definition: "", example: "" };
  }

  // 툴팁 렌더링 헬퍼 (점진적 업데이트)
  function renderBodyContent(data) {
    const bodyEl = document.getElementById("vocabBody");
    const phoneticEl = document.getElementById("vocabPhoneticText");
    if (!bodyEl) return;

    if (data.phonetic && phoneticEl) {
      phoneticEl.textContent = data.phonetic;
    }

    let html = `
      <div class="vocab-meaning-main">
        ${data.partOfSpeech ? `<span class="vocab-tag">${escapeHtml(data.partOfSpeech)}</span>` : ""}
        ${escapeHtml(data.meaning || "번역 중...")}
      </div>
    `;

    if (data.definition) {
      html += `
        <div class="vocab-dict-def">
          <strong>영영:</strong> ${escapeHtml(data.definition)}
          ${data.example ? `<div class="vocab-example">"${escapeHtml(data.example)}"</div>` : ""}
        </div>
      `;
    }

    bodyEl.innerHTML = html;
  }

  // 툴팁 노출 메인 함수 (점진적 초고속 스트리밍 방식)
  async function showVocabTooltip(selectedText, rect) {
    createTooltipDOM();
    currentTargetWord = selectedText;
    const cacheKey = selectedText.toLowerCase();

    const wordEl = document.getElementById("vocabWordText");
    const phoneticEl = document.getElementById("vocabPhoneticText");
    const bodyEl = document.getElementById("vocabBody");
    const googleLink = document.getElementById("vocabGoogleLink");
    const naverLink = document.getElementById("vocabNaverLink");

    wordEl.textContent = selectedText;
    phoneticEl.textContent = "";

    // 외부 링크 설정
    googleLink.href = `https://translate.google.com/?sl=en&tl=ko&text=${encodeURIComponent(selectedText)}&op=translate`;
    naverLink.href = `https://en.dict.naver.com/#/search?query=${encodeURIComponent(selectedText)}`;

    updateStarBtnUI(isWordSaved(selectedText));

    // ⚡ L1/L2 캐시에 이미 존재하면 즉시 0ms 렌더링!
    if (memCache.has(cacheKey)) {
      const cached = memCache.get(cacheKey);
      currentWordData = cached;
      renderBodyContent(cached);
      positionTooltip(rect);
      return;
    }

    // 캐시가 없으면 스피너 표시 후 즉시 포지셔닝
    bodyEl.innerHTML = `
      <div class="vocab-loading">
        <div class="vocab-spinner"></div>
        <span>뜻 검색 중...</span>
      </div>
    `;
    positionTooltip(rect);

    const isSingleWord = /^[a-zA-Z'-]+$/.test(selectedText);
    const wordData = {
      word: selectedText,
      meaning: "",
      phonetic: "",
      partOfSpeech: "",
      definition: "",
      example: "",
    };

    // ⚡ 병렬 실행: 한국어 번역과 영영사전을 동시에 호출
    const koreanPromise = fetchKoreanMeaning(selectedText);
    const dictPromise = isSingleWord
      ? fetchEnglishDictionary(selectedText)
      : Promise.resolve({ phonetic: "", partOfSpeech: "", definition: "", example: "" });

    // 1단계: 한국어 번역이 도착하는 즉시 1차 UI 렌더링 (체감 속도 ~150ms)
    koreanPromise.then((meaning) => {
      if (currentTargetWord !== selectedText) return;
      wordData.meaning = meaning || "한국어 뜻을 찾지 못했습니다.";
      currentWordData = wordData;
      renderBodyContent(wordData);
      positionTooltip(rect);
    });

    // 2단계: 사전 상세 정보(발음기호/영영) 도착 시 2차 UI 보강 & 캐시 저장
    Promise.allSettled([koreanPromise, dictPromise]).then(([kRes, dRes]) => {
      if (currentTargetWord !== selectedText) return;

      const meaning = kRes.status === "fulfilled" && kRes.value ? kRes.value : wordData.meaning;
      const dict = dRes.status === "fulfilled" && dRes.value ? dRes.value : {};

      wordData.meaning = meaning || "한국어 뜻을 찾지 못했습니다.";
      wordData.phonetic = dict.phonetic || "";
      wordData.partOfSpeech = dict.partOfSpeech || "";
      wordData.definition = dict.definition || "";
      wordData.example = dict.example || "";

      currentWordData = wordData;
      renderBodyContent(wordData);
      positionTooltip(rect);

      // 캐시 저장 (메모리 + LocalStorage)
      saveVocabCache(cacheKey, wordData);
    });
  }

  // 텍스트 선택 핸들러
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

    // 2. 일반 DOM 텍스트 선택 확인 (window.getSelection)
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

    // 마우스 업 (드래그 완료)
    document.addEventListener("mouseup", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      triggerSelectionDebounced(20);
    });

    // 더블클릭 (단어 빠른 선택)
    document.addEventListener("dblclick", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      triggerSelectionDebounced(10);
    });

    // 모바일 터치 선택
    document.addEventListener("touchend", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      triggerSelectionDebounced(100);
    });

    // ESC 키 누를 때 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        hideTooltip();
      }
    });

    // 툴팁 외부 클릭 시 닫기
    document.addEventListener("mousedown", (e) => {
      if (tooltipEl && !tooltipEl.contains(e.target)) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          hideTooltip();
        }
      }
    });
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
