/**
 * WebSpeech / TTS — одоо ашиглагдахгүй.
 * playVoice (lib/play-voice.ts) ашиглана.
 * Функцуудыг хэвэр үлдээж, дотроос дуугаа хааж байна.
 */

import { stopAllVoice } from "@/lib/play-voice";

export function a11ySpeak(
  _text: string,
  _opts?: { interrupt?: boolean; rate?: number; dedup?: boolean },
) {
  // TTS хаалттай — playVoice ашиглана
}

export function a11yStopSpeak() {
  stopAllVoice();
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}
