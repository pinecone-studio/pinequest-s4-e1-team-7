"use client";
import { useCallback, useRef, useState } from "react";

type Recognition = typeof window extends { SpeechRecognition: infer T } ? T : any;

const getCtor = (): any =>
  typeof window !== "undefined" &&
  ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export function useSpeechRecognition(onResult: (text: string, final: boolean) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const stop = useCallback(() => {
    setListening(false);
    recRef.current?.stop?.();
    recRef.current = null;
  }, []);

  const start = useCallback((): boolean => {
    const Ctor = getCtor();
    if (!Ctor) return false;
    const rec = new Ctor();
    rec.lang = "mn-MN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        onResult(r[0].transcript, r.isFinal);
      }
    };
    rec.onend = () => recRef.current && rec.start();
    recRef.current = rec;
    rec.start();
    setListening(true);
    return true;
  }, [onResult]);

  return { listening, start, stop, supported: !!getCtor() };
}
