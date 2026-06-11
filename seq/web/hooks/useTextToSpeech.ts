"use client";
import { useCallback, useRef, useState } from "react";
import type { Gender } from "@/lib/types";

interface SpeakOptions {
  rate: number;
  gender: Gender;
  volume?: number;
}

export const useTextToSpeech = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastRef = useRef("");
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(async (text: string, { volume, gender }: SpeakOptions): Promise<boolean> => {
    if (!text.trim()) return false;
    lastRef.current = text;

    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, gender }),
      });

      if (!response.ok) {
        console.error("[TTS] API error:", response.status, await response.text().catch(() => ""));
        return false;
      }

      const blob = await response.blob();
      if (blob.size < 100) {
        console.error("[TTS] Empty audio response from Chimege");
        return false;
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = volume ?? 1;
      audioRef.current = audio;

      setSpeaking(true);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setSpeaking(false);
      };
      audio.onerror = (e) => {
        console.error("[TTS] Audio playback error:", e);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setSpeaking(false);
      };

      await audio.play();
      return true;
    } catch (err) {
      console.error("[TTS] speak() error:", err);
      setSpeaking(false);
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, supported: true, last: lastRef };
};
