/**
 * [whisper-transcriber.js] 브라우저 내장 온디바이스 Whisper AI 음성인식기
 * - 외부 API 키 / 서버 없이 WebAssembly/WebGPU를 통해 브라우저 자체에서 구동
 * - 오디오 녹음본(Blob) -> 16kHz Mono Float32Array 디코딩 -> Whisper 전사
 * - 최초 1회 브라우저 캐시(약 39MB) 다운로드 후 오프라인 영구 보존
 */

import {
  pipeline,
  env,
} from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/+esm";

// 브라우저 캐시 활성화 및 원격 Hugging Face Hub 허용
env.allowLocalModels = false;
env.useBrowserCache = true;

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

  // 이미 16kHz 모노인 경우
  if (
    audioBuffer.sampleRate === targetSampleRate &&
    audioBuffer.numberOfChannels === 1
  ) {
    return audioBuffer.getChannelData(0);
  }

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
