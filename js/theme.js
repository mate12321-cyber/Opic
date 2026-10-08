/**
 * @file theme.js
 * @description OPIc 학습 웹 애플리케이션 다크/라이트 테마 관리 시스템
 *
 * =============================================================================
 * [테마 정책 및 동작 메커니즘]
 * =============================================================================
 * 1. 시스템 설정 자동 감지: 사용자의 OS 환경(`prefers-color-scheme: dark`)을 기본값으로 채택
 * 2. 사용자 설정 영구 보존: LocalStorage에 `dark` 또는 `light` 키로 영구 저장
 * 3. 원클릭 전환 및 UI 동기화: 토글 버튼 아이콘(☀️/🌙) 및 툴팁 실시간 변경
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 */

// =============================================================================
// 1. 상수 및 테마 스토리지 키
// =============================================================================

/** @const {string} 로컬 스토리지 테마 저장 키 */
const THEME_STORAGE_KEY = "ko-en-opic-theme";

// =============================================================================
// 2. 테마 초기화 및 적용 함수
// =============================================================================

/**
 * 앱 구동 시 사용자의 이전 테마 선택값 또는 시스템 OS 다크모드 설정을 조회하여 즉시 반영합니다.
 * @returns {void}
 */
function initTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    applyTheme(isDark);
  } catch (e) {
    applyTheme(false);
  }
}

/**
 * 전달받은 불리언 값에 따라 <body> 클래스 및 헤더 토글 버튼 UI를 갱신합니다.
 * @param {boolean} isDark - 다크 모드 활성화 여부
 * @returns {void}
 */
function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = isDark ? "☀️" : "🌙";
    btn.title = isDark ? "라이트 모드로 전환" : "다크 모드로 전환";
  }
}

/**
 * 사용자가 헤더의 테마 전환 버튼을 클릭했을 때 호출되는 다크/라이트 토글러입니다.
 * @returns {void}
 */
function toggleTheme() {
  const isDark = document.body.classList.contains("dark-theme");
  const nextState = !isDark;
  applyTheme(nextState);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextState ? "dark" : "light");
  } catch (e) {}
}

// =============================================================================
// 3. 화면 및 글자 크기 (Font Scale & Zoom) 관리 시스템
// =============================================================================

/** @const {string} 로컬 스토리지 글자 크기 설정 키 */
const FONT_SCALE_STORAGE_KEY = "ko-en-opic-font-scale";

/**
 * 화면 및 글자 크기 설정값을 적용하고 LocalStorage에 영구 저장합니다.
 * @param {string} scale - 'auto' | 'large' | 'xlarge'
 */
function setFontScale(scale) {
  const validScale = ["auto", "large", "xlarge"].includes(scale)
    ? scale
    : "auto";

  if (validScale === "auto") {
    if (document.body) document.body.removeAttribute("data-font-scale");
    document.documentElement.removeAttribute("data-font-scale");
  } else {
    if (document.body)
      document.body.setAttribute("data-font-scale", validScale);
    document.documentElement.setAttribute("data-font-scale", validScale);
  }

  try {
    localStorage.setItem(FONT_SCALE_STORAGE_KEY, validScale);
  } catch (e) {}

  updateFontScaleUI(validScale);
}

/**
 * 앱 구동 시 저장된 글자 크기 설정값을 불러와 즉시 적용합니다.
 */
function initFontScale() {
  try {
    const saved = localStorage.getItem(FONT_SCALE_STORAGE_KEY) || "auto";
    setFontScale(saved);
  } catch (e) {
    setFontScale("auto");
  }
}

/**
 * 설정 모달 내 글자 크기 버튼 상태 및 뱃지 라벨을 갱신합니다.
 * @param {string} [currentScale]
 */
function updateFontScaleUI(currentScale) {
  const scale =
    currentScale ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem(FONT_SCALE_STORAGE_KEY)
      : "auto") ||
    "auto";

  const chips = document.querySelectorAll(".font-scale-chip");
  chips.forEach((chip) => {
    if (chip.getAttribute("data-scale") === scale) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });

  const badge = document.getElementById("fontScaleDisplayBadge");
  if (badge) {
    const labels = {
      auto: "기본 (자동 최적화)",
      large: "크게 (+15%~25%)",
      xlarge: "아주 크게 (+28%~38%)",
    };
    badge.textContent = labels[scale] || "기본 (자동 최적화)";
  }
}

// 문서 전체 이벤트 위임: .font-scale-chip 클릭 시 즉시 글자 크기 전환
document.addEventListener("click", function (e) {
  const chip = e.target.closest && e.target.closest(".font-scale-chip");
  if (chip) {
    e.preventDefault();
    const scale = chip.getAttribute("data-scale");
    if (scale) {
      setFontScale(scale);
    }
  }
});

// 스크립트 로드 시 즉시 글자 크기 적용
initFontScale();

// =============================================================================
// 4. 전역(Global Window) 바인딩
// =============================================================================
window.initTheme = initTheme;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
window.initFontScale = initFontScale;
window.setFontScale = setFontScale;
window.updateFontScaleUI = updateFontScaleUI;
