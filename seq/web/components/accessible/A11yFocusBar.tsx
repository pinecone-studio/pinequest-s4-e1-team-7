"use client";

import { PhoneIcon, MicrophoneIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useA11yNav, type ThreadAction } from "@/lib/a11y-nav-context";
import { useA11yChatBridge } from "@/lib/a11y-chat-bridge";

const THREAD_TABS: { id: ThreadAction; label: string; Icon: typeof PhoneIcon }[] = [
  { id: "call",   label: "Дуудлага", Icon: PhoneIcon },
  { id: "voice",  label: "Дуу",      Icon: MicrophoneIcon },
  { id: "typing", label: "Бичих",    Icon: PencilSquareIcon },
];

/**
 * Дэлгэцийн доод хэсэгт идэвхтэй байгаа хэсгийг харуулна.
 * Gesture overlay-ийн дээгүүр харагдана (pointer-events-none).
 */
export function A11yFocusBar() {
  return null;
}
