/**
 * @file template-loader.js
 * @description OPIc 학습 웹 애플리케이션 비동기 템플릿 컴포넌트 로더
 * - templates/*.html 모듈형 화면 조각을 병렬(Promise.all) 다운로드하여 DOM 슬롯에 치환
 * - templates/components/voice-input.html 재사용 공통 컴포넌트 확장 및 유니크 ID 바인딩
 * - DOM 트리 빌드 완료 후 종속 스크립트를 정해진 순서대로 동적 주입 및 애플리케이션 부팅
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 */

(function () {
  "use strict";

  /** @const {string} 캐시 버스팅용 빌드 버전 태그 */
  const BUILD_VERSION = "2.2.23";

  /**
   * @typedef {Object} ScreenConfig
   * @property {string} id - DOM 슬롯 엘리먼트 ID
   * @property {string} file - 로드할 템플릿 파일 경로
   */

  /** @type {ScreenConfig[]} 동적 주입 대상 화면 슬롯 정의 목록 */
  const SCREENS = [
    { id: "homeSlot", file: "templates/home.html" },
    { id: "practiceSlot", file: "templates/practice.html" },
    { id: "grammarSlot", file: "templates/grammar.html" },
    { id: "opicSlot", file: "templates/opic.html" },
    { id: "patternSlot", file: "templates/pattern.html" },
    { id: "fillerSlot", file: "templates/filler.html" },
    { id: "speechSlot", file: "templates/speech.html" },
  ];

  /** @const {string} 공통 모달 템플릿 파일 경로 */
  const MODALS_FILE = "templates/modals.html";

  /** @const {string} 공통 음성 입력 컨트롤러 컴포넌트 경로 */
  const VOICE_INPUT_COMPONENT_FILE = "templates/components/voice-input.html";

  /**
   * @typedef {Object} ScriptItem
   * @property {string} src - 스크립트 소스 경로 (로컬 또는 CDN)
   * @property {string} [type] - 스크립트 모듈 타입 (예: "module")
   */

  /** @type {ScriptItem[]} 실행 의존성 순서가 보장되어야 하는 스크립트 목록 */
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
   * 단일 HTML 템플릿 파일을 비동기 요청하여 텍스트로 반환합니다.
   * 브라우저 캐시 방지를 위해 쿼리스트링에 빌드 버전을 자동으로 추가합니다.
   *
   * @async
   * @param {string} url - 요청할 HTML 파일 경로
   * @returns {Promise<string>} 로드된 HTML 템플릿 문자열
   * @throws {Error} HTTP 응답 코드가 200번대가 아닐 경우 예외 발생
   */
  async function fetchHtml(url) {
    const res = await fetch(`${url}?v=${BUILD_VERSION}`);
    if (!res.ok) {
      throw new Error(`템플릿 로드 실패: ${url} (HTTP ${res.status})`);
    }
    return await res.text();
  }

  /**
   * `data-component="voice-input"` 요소를 검색하여 공통 음성 입력창 컴포넌트로 치환 및 확장합니다.
   * 프리픽스 속성을 기준으로 모드별 고유 ID와 접근성 라벨을 바인딩합니다.
   *
   * @param {HTMLElement} container - 컴포넌트 검색 대상 상위 엘리먼트
   * @param {string} rawComponentHtml - 컴포넌트 HTML 원본 템플릿
   * @returns {void}
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

  /**
   * 단일 스크립트 엘리먼트를 동적으로 생성하여 문서에 순차 주입합니다.
   * 로컬 스크립트의 경우 브라우저 캐시 무효화를 위해 빌드 버전 파라미터를 부착합니다.
   *
   * @param {ScriptItem} item - 로드할 스크립트 정보 객체
   * @returns {Promise<void>} 스크립트 로드 및 파싱 완료 시 resolve
   * @throws {Error} 스크립트 네트워크 다운로드 또는 실행 실패 시 reject
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
   * 전체 템플릿 컴포넌트를 병렬 다운로드하고 DOM 슬롯에 치환한 후 앱을 구동합니다.
   *
   * [부트스트랩 시퀀스]:
   * 1. 템플릿 조각(HTML) 및 공통 컴포넌트 병렬 비동기 요청
   * 2. 화면 슬롯(`#*Slot`)을 실제 마크업으로 완전 치환
   * 3. `voice-input` 커스텀 컴포넌트 재귀 확장
   * 4. 초기 로딩 스켈레톤 화면 은닉
   * 5. 애플리케이션 핵심 비즈니스 로직 스크립트 순차 실행
   *
   * @async
   * @returns {Promise<void>}
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
