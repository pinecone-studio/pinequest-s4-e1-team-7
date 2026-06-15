import { playVoiceAsync, stopVoice } from "@/lib/play-voice";

/** Model label — Chimege гадаад үсгийг зөв уншихгүй */
export const PINECONE_SIGN_LABEL = "pinecone -ний";
const PINECONE_VOICE_KEY = "pinecone-ии";

/**
 * Текст доторх "pinecone -ний"-д MP3, үлдсэн хэсгийг Chimege (speakPart)-ээр дарааллаар уншуулна.
 */
export async function speakMixedText(
  text: string,
  speakPart: (part: string) => Promise<boolean>,
): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (!trimmed.includes(PINECONE_SIGN_LABEL)) {
    return speakPart(trimmed);
  }

  const parts = trimmed.split(PINECONE_SIGN_LABEL);
  let ok = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!.trim();
    if (part) {
      stopVoice();
      ok = (await speakPart(part)) || ok;
    }
    if (i < parts.length - 1) {
      await playVoiceAsync(PINECONE_VOICE_KEY);
      ok = true;
    }
  }

  return ok;
}
