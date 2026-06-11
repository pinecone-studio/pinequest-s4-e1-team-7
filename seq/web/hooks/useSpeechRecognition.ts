"use client";
import { useCallback, useRef, useState } from "react";

const TARGET_SR = 16000;
const ROUND_MS = 4000;

const resample = (data: Float32Array, fromSR: number, toSR: number): Float32Array => {
  if (fromSR === toSR) return data;
  const ratio = fromSR / toSR;
  const output = new Float32Array(Math.ceil(data.length / ratio));
  for (let i = 0; i < output.length; i++) {
    output[i] = data[Math.round(i * ratio)];
  }
  return output;
};

const encodeWav = (samples: Float32Array, sampleRate: number): Blob => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);  // PCM
  view.setUint16(22, 1, true);  // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
};

const isNoise = (text: string): boolean => {
  const t = text.trim();
  // Digits, spaces, and punctuation only — classic silence artifact from Chimege
  if (/^[\d\s.,!?;:—–\-]+$/.test(t)) return true;
  // Strip digits, spaces, and punctuation; if fewer than 4 real characters remain it's noise
  const meaningful = t.replace(/[\s\d.,!?;:—–\-]/g, "");
  return meaningful.length < 4;
};

export const useSpeechRecognition = (onResult: (text: string, final: boolean) => void) => {
  const [listening, setListening] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const transcribe = useCallback(async (blob: Blob) => {
    if (blob.size < 1000) return;
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioCtx = new AudioContext();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      await audioCtx.close();

      const pcm = resample(decoded.getChannelData(0), decoded.sampleRate, TARGET_SR);
      const wav = encodeWav(pcm, TARGET_SR);

      const response = await fetch("/api/stt", {
        method: "POST",
        headers: { "Content-Type": "audio/wav" },
        body: wav,
      });
      if (!response.ok) return;

      const { text } = await response.json();
      if (text?.trim() && !isNoise(text)) onResultRef.current(text.trim(), true);
    } catch {
      // silent fail — network error or unsupported audio format
    }
  }, []);

  const recordRound = useCallback((stream: MediaStream) => {
    if (!activeRef.current) return;

    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"].find(
      (m) => MediaRecorder.isTypeSupported(m),
    ) ?? "";

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      await transcribe(blob);
      recordRound(stream);
    };

    recorder.start();
    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, ROUND_MS);
  }, [transcribe]);

  const stop = useCallback(() => {
    activeRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      activeRef.current = true;
      setListening(true);
      recordRound(stream);
      return true;
    } catch {
      return false;
    }
  }, [recordRound]);

  return { listening, start, stop, supported: true };
};
