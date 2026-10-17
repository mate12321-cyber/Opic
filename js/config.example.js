/**
 * @file config.example.js
 * @description 개발 환경용 로컬 환경설정 템플릿
 *
 * [사용 방법]
 * 1. 이 파일을 복사하여 같은 위치에 `config.js`를 생성합니다.
 * 2. 아래 AZURE_SPEECH_KEY에 발급받은 Azure Speech API 키를 입력합니다.
 * 3. 필요에 따라 AZURE_SPEECH_REGION을 수정합니다. (예: "koreacentral" 또는 "eastus")
 * 4. `config.js`는 .gitignore에 등록되어 있으므로 Git에 커밋되지 않습니다.
 */
window.ENV = {
  AZURE_SPEECH_KEY: "",
  AZURE_SPEECH_REGION: "eastus",
  AZURE_SPEECH_VOICE: "en-US-AvaNeural",
};

