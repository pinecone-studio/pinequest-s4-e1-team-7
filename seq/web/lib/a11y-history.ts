import type { ChatMessage } from "@/lib/chat-api";
import {
  buildCallLogs,
  callLogByAnchor,
  formatCallDurationShort,
  type CallLogEntry,
} from "@/lib/call-log";
import { playVoice, stopAllVoice } from "@/lib/play-voice";
import { speakMixedText } from "@/lib/speak-mixed";

export type HistoryItem =
  | { type: "message"; msg: ChatMessage }
  | { type: "call"; entry: CallLogEntry };

export function buildHistoryItems(messages: ChatMessage[]): HistoryItem[] {
  const { entries, hiddenIds } = buildCallLogs(messages);
  const callLogMap = callLogByAnchor(entries);
  const items: HistoryItem[] = [];

  for (const m of messages) {
    if (hiddenIds.has(m.id)) continue;
    const log = callLogMap.get(m.id);
    if (log) {
      items.push({ type: "call", entry: log });
      continue;
    }
    if (m.kind === "text" || m.kind === "voice") {
      items.push({ type: "message", msg: m });
    }
  }

  return items;
}

export function historyItemMessageId(item: HistoryItem): number {
  if (item.type === "call") return item.entry.anchorId;
  return item.msg.id;
}

/**
 * Дуудлагын MP3:
 *  - та залгасан (outgoing) → залгасан
 *  - ирсэн аваагүй (incoming missed/declined/ringing) → дуудлага ирсэн
 *  - холбогдсон (completed) → дуудлага хийсэн
 */
export function callLogVoiceKey(entry: CallLogEntry): string | null {
  const outgoing = entry.inviteMsg.mine;

  if (outgoing) return "залгасан";

  if (
    entry.status === "missed" ||
    entry.status === "declined" ||
    entry.status === "ringing"
  ) {
    return "дуудлага ирсэн";
  }

  if (entry.status === "completed") return "дуудлага хийсэн";

  return null;
}

export function callLogSpeakText(entry: CallLogEntry, peerName: string): string {
  const name = entry.callerName || peerName;
  const dur = formatCallDurationShort(entry.durationMs);
  if (entry.outgoing) {
    return dur ? `Та залгасан, ${dur}` : "Та залгасан";
  }
  return dur ? `${name} залгасан, ${dur}` : `${name} залгасан`;
}

let mediaAudio: HTMLAudioElement | null = null;
let ttsAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

/** iOS/Safari-д async TTS-ийн өмнө gesture-ээс дуудна */
export function unlockHistoryAudio() {
  if (typeof window === "undefined") return;
  if (!mediaAudio) mediaAudio = new Audio();
  if (!ttsAudio) ttsAudio = new Audio();
  if (audioUnlocked) return;
  const silent =
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
  mediaAudio.src = silent;
  void mediaAudio
    .play()
    .then(() => {
      mediaAudio?.pause();
      if (mediaAudio) mediaAudio.currentTime = 0;
      audioUnlocked = true;
    })
    .catch(() => {});
}

export function stopHistoryMedia() {
  if (mediaAudio) {
    mediaAudio.pause();
    mediaAudio.removeAttribute("src");
    mediaAudio.load();
  }
}

export function stopChimege() {
  if (ttsAudio) {
    ttsAudio.pause();
    if (ttsAudio.src.startsWith("blob:")) URL.revokeObjectURL(ttsAudio.src);
    ttsAudio.removeAttribute("src");
    ttsAudio.load();
  }
}

export function stopHistoryPlayback() {
  stopAllVoice();
  stopHistoryMedia();
  stopChimege();
}

export async function speakChimege(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !text.trim()) return false;
  return speakMixedText(text, speakChimegePlain);
}

async function speakChimegePlain(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !text.trim()) return false;

  stopChimege();

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, gender: "female" }),
    });
    if (!response.ok) return false;

    const blob = await response.blob();
    if (blob.size < 100) return false;

    if (!ttsAudio) ttsAudio = new Audio();
    const url = URL.createObjectURL(blob);
    ttsAudio.src = url;
    ttsAudio.volume = 1;
    await ttsAudio.play();
    ttsAudio.onended = () => {
      URL.revokeObjectURL(url);
      if (ttsAudio?.src === url) {
        ttsAudio.removeAttribute("src");
        ttsAudio.load();
      }
    };
    return true;
  } catch {
    return false;
  }
}

export async function readHistoryItem(
  item: HistoryItem,
  peerName: string,
): Promise<void> {
  stopHistoryPlayback();

  if (item.type === "call") {
    const key = callLogVoiceKey(item.entry);
    if (key) {
      playVoice(key);
      return;
    }
    await speakChimege(callLogSpeakText(item.entry, peerName));
    return;
  }

  const { msg } = item;
  if (msg.kind === "voice" && msg.voiceUrl) {
    if (!mediaAudio) mediaAudio = new Audio();
    mediaAudio.src = msg.voiceUrl;
    try {
      await mediaAudio.play();
    } catch {
      stopHistoryMedia();
    }
    return;
  }

  const text = msg.body?.trim();
  if (text) await speakChimege(text);
}
