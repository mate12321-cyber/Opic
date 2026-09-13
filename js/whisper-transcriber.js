/**
 * @file whisper-transcriber.js
 * @description 브라우저 온디바이스(On-device) Whisper AI 음성인식 전사 엔진 (@xenova/transformers)
 * - 외부 유료 API 키나 백엔드 서버 없이 WebAssembly/WebGPU를 활용하여 클라이언트에서 직접 실행
 * - 사용자 음성 녹음 Blob(WebM/WAV) → 16kHz Mono Float32Array 오디오 버퍼 변환 → Whisper Tiny 모델 전사
 * - 최초 1회 브라우저 Cache API(약 39MB) 다운로드 후 오프라인 환경에서도 영구 동작 지원
 *
 * @author Kim Hyo-sang
 * @version 2.2.5
 */

let transformersModule = null;

/**
 * Transformers 라이브러리 동적 지연 로드 (Lazy Loading)
 * - 초기 페이지 로드 시 불필요한 네트워크 트래픽 및 지연 방지
 * - esm.sh를 사용하여 jsdelivr의 root-relative(/npm/...) Preload 404 에러 방지
 */
async function loadTransformers() {
  if (transformersModule) return transformersModule;

  try {
    transformersModule =
      await import("https://esm.sh/@xenova/transformers@2.17.2");
  } catch (err) {
    console.warn("[Whisper] esm.sh 로드 실패, 대체 CDN 시도:", err);
    transformersModule =
      await import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2");
  }

  const env = transformersModule.env;
  if (env) {
    env.allowLocalModels = false;
    env.useBrowserCache = true;
  }

  return transformersModule;
}

let whisperPipelineInstance = null;
let isWhisperLoading = false;
let whisperLoadPromise = null;

/**
 * Whisper 파이프라인 싱글톤 로드
 * @param {Function} progressCallback - 모델 다운로드 진행률 콜백 ({ status, progress, file })
 */
export async function getWhisperPipeline(progressCallback = null) {
  if (whisperPipelineInstance) return whisperPipelineInstance;
  if (isWhisperLoading) return whisperLoadPromise;

  isWhisperLoading = true;
  whisperLoadPromise = (async () => {
    try {
      if (typeof progressCallback === "function") {
        progressCallback({
          status: "init",
          progress: 0,
          file: "transformers.js",
        });
      }
      console.log("[Whisper] Loading Transformers library...");
      const { pipeline } = await loadTransformers();

      console.log("[Whisper] Loading Xenova/whisper-tiny.en model...");
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny.en",
        {
          quantized: true,
          progress_callback: (progressInfo) => {
            if (typeof progressCallback === "function") {
              progressCallback(progressInfo);
            }
          },
        },
      );
      whisperPipelineInstance = transcriber;
      console.log("[Whisper] Model loaded successfully!");
      return transcriber;
    } catch (err) {
      console.error("[Whisper] Model load failed:", err);
      whisperPipelineInstance = null;
      throw err;
    } finally {
      isWhisperLoading = false;
    }
  })();

  return whisperLoadPromise;
}

/**
 * 오디오 Blob을 Whisper 입력 규격인 16kHz Mono Float32Array로 디코딩 및 리샘플링
 * @param {Blob} audioBlob
 * @returns {Promise<Float32Array>}
 */
export async function audioBlobTo16kHzMono(audioBlob) {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) {
    throw new Error("브라우저에서 Web Audio API를 지원하지 않습니다.");
  }

  // [브라우저 리소스 한도 방어]:
  // 크롬/사파리는 탭당 활성화 가능한 AudioContext 인스턴스 개수(통상 6개)를 엄격히 제한합니다.
  // decodeAudioData 완료 직후 반드시 .close()를 호출하여 컨텍스트를 즉시 폐기해야
  // 여러 번 연속 녹음하더라도 브라우저 오디오 시스템 먹통(AudioContext limit exceeded)을 방지할 수 있습니다.
  const audioCtx = new AudioCtxClass();
  let audioBuffer = null;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    try {
      await audioCtx.close();
    } catch (e) {}
  }

  if (!audioBuffer) {
    throw new Error("오디오 데이터를 디코딩하지 못했습니다.");
  }

  const targetSampleRate = 16000;
  const numChannels = 1;
  const length = Math.ceil(audioBuffer.duration * targetSampleRate);

  // [입력 최적화] 이미 마이크 하드웨어가 16kHz 모노로 녹음된 경우 불필요한 리샘플링 생략
  if (
    audioBuffer.sampleRate === targetSampleRate &&
    audioBuffer.numberOfChannels === 1
  ) {
    return audioBuffer.getChannelData(0);
  }

  // [Whisper 모델 규격 준수]:
  // OpenAI Whisper ONNX/Wasm 모델은 반드시 16,000Hz 모노 Float32Array PCM 규격만을 입력으로 수락합니다.
  // 마이크 기본 규격(44.1kHz 또는 48kHz 스테레오)을 OfflineAudioContext 하드웨어 가속을 통해 16kHz 모노로 고속 리샘플링합니다.
  const offlineCtx = new OfflineAudioContext(
    numChannels,
    length,
    targetSampleRate,
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  return renderedBuffer.getChannelData(0);
}

/**
 * 녹음된 오디오 Blob을 영어 텍스트로 변환 (ASR)
 * @param {Blob} audioBlob - MediaRecorder에서 생성된 WebM/MP4/WAV Blob
 * @param {Function} statusCallback - 진행 상태 텍스트 안내 콜백
 * @returns {Promise<string>} 전사된 텍스트
 */
export async function transcribeAudioBlob(audioBlob, statusCallback = null) {
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error("녹음된 오디오 파일이 비어 있습니다.");
  }

  if (statusCallback) statusCallback("🤖 AI 모델 로드 중...");

  const transcriber = await getWhisperPipeline((p) => {
    if (
      statusCallback &&
      p.status === "progress" &&
      typeof p.progress === "number"
    ) {
      const pct = Math.round(p.progress);
      statusCallback(`📥 AI 모델 다운로드 중 (${pct}%)...`);
    } else if (statusCallback && p.status === "done") {
      statusCallback("🤖 AI 음성 분석 준비 완료...");
    }
  });

  if (statusCallback) statusCallback("🎙️ 음성 데이터를 분석하고 있습니다...");
  const audioData = await audioBlobTo16kHzMono(audioBlob);

  if (statusCallback) statusCallback("⚡ 영어 텍스트로 자동 변환 중...");
  const result = await transcriber(audioData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    language: "english",
    task: "transcribe",
  });

  const text = (result && result.text ? result.text : "").trim();
  console.log("[Whisper] Transcription result:", text);
  return text;
}

// 전역 window 객체 노출 (일반 스크립트와의 호환성 보장)
window.getWhisperPipeline = getWhisperPipeline;
window.transcribeAudioBlob = transcribeAudioBlob;
