/**
 * [template-loader.js] OPIc 학습 웹 앱 - 비동기 템플릿 컴포넌트 로더
 *
 * 1. templates/*.html 화면 조각들을 병렬로 fetch하여 DOM에 삽입
 * 2. 공통 컴포넌트(templates/components/voice-input.html) 자동 확장 및 ID 바인딩
 * 3. 모든 DOM 준비 완료 후 애플리케이션 스크립트 순차 로드 및 부팅
 */

(function () {
  "use strict";

  // 화면 슬롯 정의
  const SCREENS = [
    { id: "homeSlot", file: "templates/home.html" },
    { id: "practiceSlot", file: "templates/practice.html" },
    { id: "grammarSlot", file: "templates/grammar.html" },
    { id: "opicSlot", file: "templates/opic.html" },
    { id: "patternSlot", file: "templates/pattern.html" },
    { id: "fillerSlot", file: "templates/filler.html" },
    { id: "speechSlot", file: "templates/speech.html" },
  ];

  const MODALS_FILE = "templates/modals.html";
  const VOICE_INPUT_COMPONENT_FILE = "templates/components/voice-input.html";

  // 로드할 스크립트 목록 (의존성 순서 유지)
  const SCRIPTS_TO_LOAD = [
    {
      src: "https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@latest/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle.js",
    },
    { src: "js/utils.js" },
    { src: "js/theme.js" },
    { src: "js/audio-cache.js" },
    { src: "js/eval-dict.js" },
    { src: "data/sentences_im1.js" },
    { src: "data/grammar_im1.js" },
    { src: "data/questions_im1.js" },
    { src: "data/patterns_im1.js" },
    { src: "data/fillers_im1.js" },
    { src: "js/storage.js" },
    { src: "js/speech.js" },
    { src: "js/dashboard.js" },
    { src: "js/practice.js" },
    { src: "js/grammar.js" },
    { src: "js/opic.js" },
    { src: "js/pattern.js" },
    { src: "js/filler.js" },
    { src: "js/whisper-transcriber.js", type: "module" },
    { src: "js/speech-practice.js" },
    { src: "js/shortcuts.js" },
    { src: "js/vocab-tooltip.js" },
    { src: "app.js" },
  ];

  /**
   * 단일 HTML 파일 비동기 요청
   */
  async function fetchHtml(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`템플릿 로드 실패: ${url} (HTTP ${res.status})`);
    }
    return await res.text();
  }

  /**
   * 음성 입력창 공통 컴포넌트 확장
   * data-component="voice-input" 요소를 찾아서 템플릿 치환 후 삽입
   */
  function expandVoiceInputComponents(container, rawComponentHtml) {
    const targets = container.querySelectorAll(
      '[data-component="voice-input"]',
    );
    targets.forEach((elem) => {
      const prefix = elem.getAttribute("data-prefix") || "";
      const placeholder = elem.getAttribute("data-placeholder") || "";
      const copyText = elem.getAttribute("data-copy-text") || "내 답변 복사";
      const copyTitle = elem.getAttribute("data-copy-title") || copyText;

      let id = "";
      let micId = "";
      let micErrorId = "";
      let translateId = "";
      let translateTextId = "";
      let copyId = "";

      if (prefix === "sentence") {
        id = "userInput";
        micId = "micBtn";
        micErrorId = "micError";
        translateId = "liveTranslate";
        translateTextId = "liveTranslateText";
        copyId = "copyInput";
      } else if (prefix === "opic") {
        id = "opicUserInput";
        micId = "opicMicBtn";
        micErrorId = "opicMicError";
        translateId = "opicLiveTranslate";
        translateTextId = "opicLiveTranslateText";
        copyId = "copyOpicInput";
      } else if (prefix === "pattern") {
        id = "patternUserInput";
        micId = "patternMicBtn";
        micErrorId = "patternMicError";
        translateId = "patternLiveTranslate";
        translateTextId = "patternLiveTranslateText";
        copyId = "copyPatternInput";
      } else {
        id = `${prefix}UserInput`;
        micId = `${prefix}MicBtn`;
        micErrorId = `${prefix}MicError`;
        translateId = `${prefix}LiveTranslate`;
        translateTextId = `${prefix}LiveTranslateText`;
        copyId = `${prefix}CopyInput`;
      }

      let rendered = rawComponentHtml
        .replaceAll("{{id}}", id)
        .replaceAll("{{placeholder}}", placeholder)
        .replaceAll("{{micId}}", micId)
        .replaceAll("{{micErrorId}}", micErrorId)
        .replaceAll("{{translateId}}", translateId)
        .replaceAll("{{translateTextId}}", translateTextId)
        .replaceAll("{{copyId}}", copyId)
        .replaceAll("{{copyText}}", copyText)
        .replaceAll("{{copyTitle}}", copyTitle);

      elem.insertAdjacentHTML("beforebegin", rendered);
      elem.remove();
    });
  }

  const BUILD_VERSION = "2.2.4";

  /**
   * 단일 스크립트 순차 로더 프로미스 (로컬 스크립트 자동 캐시 버스팅)
   */
  function loadScript(item) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      if (item.type) s.type = item.type;
      const isExternal = item.src.startsWith("http");
      s.src = isExternal ? item.src : `${item.src}?v=${BUILD_VERSION}`;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`스크립트 로드 실패: ${item.src}`));
      document.body.appendChild(s);
    });
  }

  /**
   * 전체 템플릿 로딩 및 애플리케이션 시작 메인 함수
   */
  async function bootApplication() {
    try {
      // 1. 공통 컴포넌트 및 모달, 각 화면 템플릿 병렬 다운로드
      const [voiceInputHtml, modalsHtml, ...screenHtmlList] = await Promise.all(
        [
          fetchHtml(VOICE_INPUT_COMPONENT_FILE),
          fetchHtml(MODALS_FILE),
          ...SCREENS.map((s) => fetchHtml(s.file)),
        ],
      );

      // 2. 화면 슬롯을 템플릿 HTML로 완전 치환 (다중 형제 노드 보존)
      SCREENS.forEach((screenConfig, index) => {
        const slotElem = document.getElementById(screenConfig.id);
        if (slotElem) {
          slotElem.insertAdjacentHTML("beforebegin", screenHtmlList[index]);
          slotElem.remove();
        }
      });

      // 3. 공통 voice-input 컴포넌트 확장 치환
      const wrapElem = document.querySelector(".wrap");
      if (wrapElem) {
        expandVoiceInputComponents(wrapElem, voiceInputHtml);
      }

      // 4. 모달 슬롯 완전 치환 (다중 모달 보존)
      const modalSlot = document.getElementById("modalsSlot");
      if (modalSlot) {
        modalSlot.insertAdjacentHTML("beforebegin", modalsHtml);
        modalSlot.remove();
      }

      // 4. 로딩 안내창(스켈레톤) 숨기기
      const initialLoading = document.getElementById("appInitialLoading");
      if (initialLoading) {
        initialLoading.style.display = "none";
      }

      // 5. 모든 DOM 노드가 주입되었으므로 애플리케이션 스크립트 순차 실행
      for (const scriptItem of SCRIPTS_TO_LOAD) {
        await loadScript(scriptItem);
      }

      console.log(
        "🚀 [TemplateLoader] 8대 템플릿 및 컴포넌트 로드 완료, 앱이 성공적으로 시작되었습니다.",
      );
    } catch (err) {
      console.error("❌ [TemplateLoader] 초기화 오류:", err);
      const loadingBox = document.getElementById("appInitialLoading");
      if (loadingBox) {
        const isFileProtocol = window.location.protocol === "file:";
        loadingBox.innerHTML = `
          <div style="padding: 24px; text-align: center; color: #ef4444; line-height: 1.6;">
            <h3 style="margin-bottom: 8px;">앱 초기화 중 문제가 발생했습니다</h3>
            <p style="font-size: 13px; color: #64748b;">${err.message}</p>
            ${
              isFileProtocol
                ? `<div style="margin-top: 14px; padding: 12px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; font-size: 12px; color: #991b1b; text-align: left;">
                    <strong>💡 로컬 파일 직접 실행 안내 (CORS):</strong><br>
                    브라우저 보안상 <code>file:///</code> 경로에서는 템플릿 파일을 읽을 수 없습니다.<br>
                    VS Code의 <strong>Live Server</strong>를 사용하시거나, 터미널에서 <code>python3 -m http.server</code>로 열어주세요.<br>
                    (GitHub Pages에 배포 시에는 정상 동작합니다.)
                  </div>`
                : ""
            }
          </div>
        `;
      }
    }
  }

  // DOMContentLoaded 시점에 즉시 부팅 시작
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootApplication);
  } else {
    bootApplication();
  }
})();
