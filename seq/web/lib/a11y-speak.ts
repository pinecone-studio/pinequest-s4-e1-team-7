/**
 * WebSpeech / TTS — одоо ашиглагдахгүй.
 * playVoice (lib/play-voice.ts) ашиглана.
 * Функцуудыг хэвэр үлдээж, дотроос дуугаа хааж байна.
 */

export function a11ySpeak(
  _text: string,
  _opts?: { interrupt?: boolean; rate?: number; dedup?: boolean },
) {
  // TTS хаалттай — playVoice ашиглана
}

export function a11yStopSpeak() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}
