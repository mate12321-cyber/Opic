/**
 * [utils.js] OPIc 학습 웹 앱 공통 유틸리티 함수 모음
 * - GitHub Pages 호환 순수 바닐라 JS 유틸리티
 * - HTML 특수문자 이스케이프 (통합)
 * - 클립보드 복사 & 시각 피드백
 * - 보조 AI 검색용 사이드 팝업
 * - 텍스트에어리어 높이 자동 조절
 */

// HTML 특수문자 이스케이프 유틸 (XSS 방어 및 안전한 텍스트 렌더링)
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 클립보드 텍스트 복사 및 버튼 피드백 토글
function copyText(text, btn) {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (btn) {
          const original = btn.innerHTML;
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>복사됨 ✓</span>`;
          btn.classList.add("copied");
          setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove("copied");
          }, 1500);
        }
      })
      .catch(() => fallbackCopy(text, btn));
  } else {
    fallbackCopy(text, btn);
  }
}

// 클립보드 API 미지원/비보안 환경용 대체 복사 함수
function fallbackCopy(text, btn) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.top = "0";
  ta.style.left = "0";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>복사됨 ✓</span>`;
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove("copied");
      }, 1500);
    }
  } catch (err) {
    alert("복사하지 못했어요: " + text);
  }
  document.body.removeChild(ta);
}

// PC/맥북 화면 우측에 고정 너비로 Google AI 사이드 팝업창 띄우기
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

// 텍스트 길이에 따라 textarea 높이를 실시간 자동 확장 (스크롤바 없이 한눈에 보기)
function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = "auto";
  const isOpic = el.id === "opicUserInput";
  const minHeight = isOpic ? 110 : 84;
  // 스크롤이 생기기 전 6px 여유 공간을 미리 확보하여 부드럽게 확장
  const newHeight = Math.max(minHeight, el.scrollHeight + 6);
  el.style.height = `${newHeight}px`;
}

// 전역 바인딩
window.escapeHtml = escapeHtml;
window.safeEscapeHtml = escapeHtml; // 하위 호환성 유지
window.copyText = copyText;
window.fallbackCopy = fallbackCopy;
window.openSidePopup = openSidePopup;
window.autoResizeTextarea = autoResizeTextarea;
