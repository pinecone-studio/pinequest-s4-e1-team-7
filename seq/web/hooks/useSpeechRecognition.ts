"use client";
import { useCallback, useRef, useState } from "react";

const TARGET_SR = 16000;
const ROUND_MS = 4000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySR = any;

const getWebSR = (): AnySR | null => {
  if (typeof window === "undefined") return null;
  return (
    (window as AnySR).SpeechRecognition ??
    (window as AnySR).webkitSpeechRecognition ??
    null
  );
};

const resample = (data: Float32Array, fromSR: number, toSR: number): Float32Array => {
  if (fromSR === toSR) return data;
  const ratio = fromSR / toSR;
  const output = new Float32Array(Math.ceil(data.length / ratio));
  for (let i = 0; i < output.length; i++) output[i] = data[Math.round(i * ratio)];
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
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
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
  if (/^[\d\s.,!?;:—–\-]+$/.test(t)) return true;
  return t.replace(/[\s\d.,!?;:—–\-]/g, "").length < 4;
};

// Module-level flag: once Chimege fails permanently, don't retry for the session
let chimegeDown = false;

export const useSpeechRecognition = (
  onResult: (text: string, final: boolean) => void,
) => {
  const [listening, setListening] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(false);
  const webSRRef = useRef<AnySR>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // ── Web Speech API fallback ────────────────────────────────────────────────

  const startWebSpeech = useCallback(() => {
    const SR = getWebSR();
    if (!SR) {
      setListening(false);
      return;
    }
    const recognition: AnySR = new SR();
    recognition.lang = "mn-MN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: AnySR) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript: string = result[0].transcript.trim();
        if (!transcript) continue;
        onResultRef.current(transcript, result.isFinal as boolean);
      }
    };

    recognition.onerror = (event: AnySR) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      activeRef.current = false;
      webSRRef.current = null;
      setListening(false);
    };

    // Web Speech stops after silence — restart to stay continuous
    recognition.onend = () => {
      if (!activeRef.current) return;
      try {
        webSRRef.current?.start();
      } catch {
        activeRef.current = false;
        webSRRef.current = null;
        setListening(false);
      }
    };

    webSRRef.current = recognition;
    recognition.start();
  }, []);

  // ── Chimege pipeline ───────────────────────────────────────────────────────

  const transcribe = useCallback(
    async (blob: Blob) => {
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

        if (!response.ok) {
          // Permanent server/auth error → fall back to Web Speech API
          if (response.status >= 500 || response.status === 403) {
            chimegeDown = true;
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
            startWebSpeech();
          }
          return;
        }

        const { text } = await response.json();
        if (text?.trim() && !isNoise(text)) onResultRef.current(text.trim(), true);
      } catch {
        // Network error → also fall back
        chimegeDown = true;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        startWebSpeech();
      }
    },
    [startWebSpeech],
  );

  const recordRound = useCallback(
    (stream: MediaStream) => {
      if (!activeRef.current) return;

      const mimeType =
        ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"].find((m) =>
          MediaRecorder.isTypeSupported(m),
        ) ?? "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        await transcribe(blob);
        // Only continue Chimege loop if not fallen back yet
        if (activeRef.current && !chimegeDown) recordRound(stream);
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, ROUND_MS);
    },
    [transcribe],
  );

  // ── Public API ─────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    activeRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    webSRRef.current?.stop();
    webSRRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    // If Chimege already known to be down, go straight to Web Speech
    if (chimegeDown) {
      const SR = getWebSR();
      if (!SR) return false;
      try {
        activeRef.current = true;
        setListening(true);
        startWebSpeech();
        return true;
      } catch {
        return false;
      }
    }

    // Try Chimege first
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
  }, [recordRound, startWebSpeech]);

  return { listening, start, stop, supported: true };
};
