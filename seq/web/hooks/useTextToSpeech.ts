"use client";
import { useCallback, useRef } from "react";
import type { Gender } from "@/lib/types";

interface SpeakOptions {
  rate: number;
  gender: Gender;
}

const pickVoice = (gender: Gender): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const mn = voices.find((v) => /mn(-|_)?/i.test(v.lang));
  if (mn) return mn;
  const hint = gender === "female" ? /female|samantha|zira|aria/i : /male|daniel|david/i;
  return voices.find((v) => hint.test(v.name)) ?? voices[0] ?? null;
};

export function useTextToSpeech() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const lastRef = useRef("");

  const speak = useCallback(
    (text: string, { rate, gender }: SpeakOptions) => {
      lastRef.current = text;
      if (!supported) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "mn-MN";
      u.rate = rate;
      u.pitch = gender === "female" ? 1.08 : 0.9;
      const v = pickVoice(gender);
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    },
    [supported],
  );

  const stop = useCallback(() => window.speechSynthesis?.cancel(), []);

  return { speak, stop, supported, last: lastRef };
}
