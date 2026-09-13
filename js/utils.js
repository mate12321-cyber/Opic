/**
 * @file utils.js
 * @description OPIc 학습 웹 애플리케이션 공통 유틸리티 함수 모음
 *
 * =============================================================================
 * [주요 유틸리티 구성]
 * =============================================================================
 * 1. HTML 특수문자 이스케이프 (XSS 인젝션 방지 및 안전한 텍스트 렌더링)
 * 2. 멀티 브라우저 클립보드 복사 엔진 (Async Clipboard API ↔ fallback execCommand)
 * 3. AI 검색 보조 사이드 팝업창 컨트롤러 (화면 우측 고정 배치)
 * 4. 가변형 텍스트에어리어 높이 자동 조절 (Auto-resize Textarea)
 *
 * @author Kim Hyo-sang
 * @version 2.2.0
 */

// =============================================================================
// 1. 보안 및 문자열 정제 유틸리티
// =============================================================================

/**
 * HTML 특수문자 이스케이프 (XSS 공격 방어 및 브라우저 안전 출력 보장)
 * @param {string|null|undefined} str - 원본 문자열
 * @returns {string} HTML 엔티티로 치환된 안전 문자열
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =============================================================================
// 2. 클립보드 복사 및 UI 피드백 유틸리티
// =============================================================================

/**
 * 지정된 텍스트를 시스템 클립보드에 복사하고 버튼 UI에 시각적 피드백 제공
 * - 최신 HTTPS 환경: navigator.clipboard.writeText 비동기 처리
 * - HTTP 또는 레거시 환경: fallbackCopy로 자동 폴백
 * @param {string} text - 복사할 문자열
 * @param {HTMLElement|null} [btn=null] - 복사 상태를 시각화할 버튼 엘리먼트
 */
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

/**
 * Clipboard API 미지원 환경용 임시 가상 textarea 기반 대체 복사 함수
 * @param {string} text - 복사할 문자열
 * @param {HTMLElement|null} [btn=null] - 버튼 엘리먼트
 */
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

// =============================================================================
// 3. 브라우저 창 및 UI 크기 조정 유틸리티
// =============================================================================

/**
 * 사용자의 메인 학습 화면을 방해하지 않도록 화면 우측에 고정된 크기로 AI 검색 팝업창 오픈
 * @param {string} url - 팝업창에서 로드할 URL 주소
 * @param {string} [title="GoogleAI_Popup"] - 팝업 윈도우 이름
 * @returns {Window|null} 열린 윈도우 객체 참조
 */
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

/**
 * 텍스트 길이에 따라 Textarea 높이를 스크롤바 없이 한눈에 볼 수 있도록 자동 확장
 * [모드별 최소 높이 정책]
 * - 발화 연습: 240px (긴 문단 작성을 위한 넉넉한 공간)
 * - OPIc 실전: 110px
 * - 일반 문장: 84px
 * @param {HTMLTextAreaElement} el - 대상 textarea 엘리먼트
 */
function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = "auto";
  const isOpic = el.id === "opicUserInput";
  const isSpeechPractice = el.id === "speechPracticeInput";
  const minHeight = isSpeechPractice ? 240 : isOpic ? 110 : 84;
  // 스크롤이 생기기 전 6px 여유 공간을 미리 확보하여 부드럽게 확장
  const newHeight = Math.max(minHeight, el.scrollHeight + 6);
  el.style.height = `${newHeight}px`;
}

// =============================================================================
// 4. 전역(Global Window) 바인딩 및 하위 호환성 내보내기
// =============================================================================
window.escapeHtml = escapeHtml;
window.safeEscapeHtml = escapeHtml; // 레거시 호출 호환성 유지
window.copyText = copyText;
window.fallbackCopy = fallbackCopy;
window.openSidePopup = openSidePopup;
window.autoResizeTextarea = autoResizeTextarea;
