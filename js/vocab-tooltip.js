/**
 * [vocab-tooltip.js] 영어 문장 단어/표현 드래그 & 더블클릭/모바일 터치 인라인 번역 툴팁 시스템
 * - Android / iOS 모바일 최적화:
 *   1. 더블 탭: 브라우저 줌 방지(touch-action) 및 즉각 단어 팝업 (Caret Range)
 *   2. 롱프레스(380ms): OS 기본 메뉴(복사/검색)와 충돌 없는 커스텀 롱프레스 + 햅틱 피드백
 *   3. 핀치 줌(Pinch-to-zoom) 및 스크롤(Pan) 100% 정상 작동 보존
 * - Google Translate 정밀 번역 & 사전 엔진 (한글 뜻 + 품사별 상세 뜻 목록)
 * - L1 메모리 캐시 + L2 LocalStorage 캐시 (0ms 초고속)
 * - Web Speech API 연동 발음 재생 및 내 단어장 저장 지원
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

  // 모바일 터치 제스처 관리 변수
  let longPressTimer = null;
  let touchStartPos = null;
  let isLongPressTriggered = false;
  let lastTouchEndTime = 0;
  let lastTouchPoint = null;

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

    // 이벤트 리스너 바인딩 (PC & 모바일 터치 대응)
    tooltipEl.addEventListener("mouseenter", () => {
      isMouseInsideTooltip = true;
    });
    tooltipEl.addEventListener("mouseleave", () => {
      isMouseInsideTooltip = false;
    });
    tooltipEl.addEventListener("touchstart", (e) => {
      e.stopPropagation();
      isMouseInsideTooltip = true;
    }, { passive: true });
    tooltipEl.addEventListener("touchend", () => {
      setTimeout(() => { isMouseInsideTooltip = false; }, 300);
    }, { passive: true });

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

    const isMobile = window.innerWidth <= 600;
    const tooltipWidth = Math.min(290, window.innerWidth - 20);
    tooltipEl.style.width = `${tooltipWidth}px`;

    const targetCenterX = rect.left + rect.width / 2;
    let left = targetCenterX - tooltipWidth / 2;

    // 좌우 화면 경계 여백 보정 (최소 10px)
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    const arrowEl = document.getElementById("vocabTooltipArrow");
    const arrowLeft = Math.max(16, Math.min(tooltipWidth - 16, targetCenterX - left));

    if (arrowEl) {
      arrowEl.style.left = `${arrowLeft - 5}px`;
    }

    const approxHeight = 160;
    let top = rect.top - approxHeight - 12;
    let placement = "top";

    // 상단 공간이 부족하면 하단으로 전환 (모바일 상단바 고려)
    if (top < (isMobile ? 30 : 10)) {
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

  // 번역 및 품사 사전 데이터 조회 (Google Translate 단일 고속 엔드포인트)
  async function fetchWordDetails(queryText) {
    let mainMeaning = "";
    let posList = [];

    // 1. Google Translate API 호출 (한글 뜻 + 품사별 사전 목록 동시 수신)
    try {
      const url =
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&hl=ko&dt=t&dt=bd&q=" +
        encodeURIComponent(queryText);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          mainMeaning = data[0].map((chunk) => chunk[0]).join("").trim();
        }
        if (data && data[1] && Array.isArray(data[1])) {
          posList = data[1].slice(0, 3).map((item) => ({
            pos: item[0] || "",
            meanings: (item[1] || []).slice(0, 4),
          }));
        }
      }
    } catch (e) {}

    // 2. 번역 실패 시 MyMemory API로 fallback
    if (!mainMeaning) {
      try {
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(queryText)}&langpair=en|ko`;
        const res = await fetch(myMemoryUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.responseData && data.responseData.translatedText) {
            mainMeaning = data.responseData.translatedText.trim();
          }
        }
      } catch (e) {}
    }

    return {
      word: queryText,
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
        ${escapeHtml(data.meaning || "뜻 검색 중...")}
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

    googleLink.href = `https://translate.google.com/?sl=en&tl=ko&text=${encodeURIComponent(selectedText)}&op=translate`;
    naverLink.href = `https://en.dict.naver.com/#/search?query=${encodeURIComponent(selectedText)}`;

    updateStarBtnUI(isWordSaved(selectedText));

    // ⚡ L1/L2 캐시 즉시 표시
    if (memCache.has(cacheKey)) {
      const cached = memCache.get(cacheKey);
      currentWordData = cached;
      renderBodyContent(cached);
      positionTooltip(rect);
      return;
    }

    bodyEl.innerHTML = `
      <div class="vocab-loading">
        <div class="vocab-spinner"></div>
        <span>뜻 검색 중...</span>
      </div>
    `;
    positionTooltip(rect);

    try {
      const result = await fetchWordDetails(selectedText);
      if (currentTargetWord !== selectedText) return;

      currentWordData = result;
      renderBodyContent(result);
      positionTooltip(rect);

      saveVocabCache(cacheKey, result);
    } catch (err) {
      if (currentTargetWord === selectedText) {
        bodyEl.innerHTML = `<div style="color:var(--danger, #ef4444); font-size:0.85rem;">번역을 불러오는 중 오류가 발생했습니다.</div>`;
      }
    }
  }

  // 터치/클릭 좌표(x, y) 아래의 단어 자동 인식 (Caret Range)
  function getWordAtPoint(x, y) {
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

    if (!range || !range.startContainer) return null;
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;

    const text = node.textContent;
    const offset = range.startOffset;
    if (!text || offset < 0 || offset > text.length) return null;

    // offset 위치 기준으로 앞뒤 영단어 경계 탐색
    let start = offset;
    while (start > 0 && /[a-zA-Z'-]/.test(text[start - 1])) {
      start--;
    }
    let end = offset;
    while (end < text.length && /[a-zA-Z'-]/.test(text[end])) {
      end++;
    }

    const word = text.substring(start, end).trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
    if (!word || word.length < 2 || !/[a-zA-Z]/.test(word)) return null;

    try {
      const wordRange = document.createRange();
      wordRange.setStart(node, start);
      wordRange.setEnd(node, end);
      const rect = wordRange.getBoundingClientRect();
      if (rect && (rect.width > 0 || rect.height > 0)) {
        return { word, rect };
      }
    } catch (e) {}

    return null;
  }

  // 텍스트 선택 핸들러 (PC selection + 모바일 selectionchange 공용)
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

    // 2. 일반 DOM 텍스트 선택 확인 (window.getSelection - 롱프레스 & PC 드래그)
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
              } else if (range.getClientRects().length > 0) {
                rect = range.getClientRects()[0];
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

    // 1. PC 마우스 업 & 더블클릭
    document.addEventListener("mouseup", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      triggerSelectionDebounced(20);
    });

    document.addEventListener("dblclick", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      triggerSelectionDebounced(10);
    });

    // 2. iOS Safari & Android Chrome 롱프레스 / 텍스트 선택 이벤트 (selectionchange)
    document.addEventListener("selectionchange", () => {
      triggerSelectionDebounced(150);
    });

    // 3. 모바일 전용 롱프레스(380ms) 및 더블탭 제스처 리스너
    document.addEventListener("touchstart", (e) => {
      if (tooltipEl && tooltipEl.contains(e.target)) return;

      // 두 손가락 이상(핀치 줌)일 경우 롱프레스 취소
      if (e.touches.length !== 1) {
        if (longPressTimer) clearTimeout(longPressTimer);
        return;
      }

      const touch = e.touches[0];
      touchStartPos = { x: touch.clientX, y: touch.clientY };
      isLongPressTriggered = false;

      // 380ms 동안 손가락을 대고 있으면 커스텀 롱프레스 발동
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        if (!touchStartPos) return;
        const detected = getWordAtPoint(touchStartPos.x, touchStartPos.y);
        if (detected) {
          isLongPressTriggered = true;
          if (navigator.vibrate) {
            try { navigator.vibrate(20); } catch (v) {}
          }
          showVocabTooltip(detected.word, detected.rect);
        }
      }, 380);
    }, { passive: true });

    // 터치 이동 시 (스크롤 동작): 롱프레스 취소 (스크롤/핀치 줌 방해 금지)
    document.addEventListener("touchmove", (e) => {
      if (touchStartPos && e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const dist = Math.hypot(touch.clientX - touchStartPos.x, touch.clientY - touchStartPos.y);
        if (dist > 10) {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        }
      }
    }, { passive: true });

    // 터치 종료 (touchend): 더블탭 감지 & 롱프레스 타이머 정리
    document.addEventListener("touchend", (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (tooltipEl && tooltipEl.contains(e.target)) return;
      if (isLongPressTriggered) return;

      const now = Date.now();
      const touch = e.changedTouches && e.changedTouches[0];

      // 더블 탭 감지 (300ms 이내 동일 지점 연속 탭)
      if (touch && now - lastTouchEndTime < 320 && lastTouchPoint) {
        const dist = Math.hypot(touch.clientX - lastTouchPoint.x, touch.clientY - lastTouchPoint.y);
        if (dist < 25) {
          const detected = getWordAtPoint(touch.clientX, touch.clientY);
          if (detected) {
            showVocabTooltip(detected.word, detected.rect);
            lastTouchEndTime = 0;
            return;
          }
        }
      }

      if (touch) {
        lastTouchPoint = { x: touch.clientX, y: touch.clientY };
      }
      lastTouchEndTime = now;

      triggerSelectionDebounced(100);
    }, { passive: true });

    // 4. 안드로이드 contextmenu 방어 (롱프레스로 툴팁이 떴을 때 OS 메뉴와 겹침 방지)
    document.addEventListener("contextmenu", (e) => {
      if (isLongPressTriggered) {
        e.preventDefault(); // 롱프레스 시 OS 기본 메뉴(복사/검색) 억제
      }
    });

    // 5. 키보드 ESC 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        hideTooltip();
      }
    });

    // 6. 툴팁 외부 클릭/터치 시 닫기
    document.addEventListener("mousedown", (e) => {
      if (tooltipEl && !tooltipEl.contains(e.target)) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          hideTooltip();
        }
      }
    });

    document.addEventListener("touchstart", (e) => {
      if (tooltipEl && !tooltipEl.contains(e.target)) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          hideTooltip();
        }
      }
    }, { passive: true });
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
