/**
 * [theme.js] 다크 모드(Dark Theme) 관리 시스템
 * - 시스템 OS 설정(prefers-color-scheme) 자동 감지
 * - 로컬 스토리지에 사용자 테마 설정 영구 보존
 * - 테마 전환 버튼 UI 동기화
 */

const THEME_STORAGE_KEY = "ko-en-opic-theme";

// 테마 초기화 (페이지 로드 시 실행)
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

// 테마 적용 및 UI 반영
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

// 다크/라이트 모드 토글
function toggleTheme() {
  const isDark = document.body.classList.contains("dark-theme");
  const nextState = !isDark;
  applyTheme(nextState);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextState ? "dark" : "light");
  } catch (e) {}
}

window.initTheme = initTheme;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
