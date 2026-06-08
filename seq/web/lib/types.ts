export type Theme = "light" | "dark";
export type Gender = "female" | "male";
export type HistoryKind = "sign" | "voice";

export interface User {
  name: string;
  email: string;
}

export type TextScale = 0.9 | 1 | 1.15 | 1.3;

export interface Settings {
  gender: Gender;
  rate: number;
  autoSpeak: boolean;
  textScale: TextScale;
}

export interface HistoryItem {
  kind: HistoryKind;
  text: string;
  time: string;
}

export interface Stats {
  words: number;
  sessions: number;
  history: HistoryItem[];
}

export type ToastKind = "info" | "success" | "warn";
export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  icon: string;
}

export type DashboardSection =
  | "overview"
  | "translator"
  | "voice"
  | "call"
  | "dict"
  | "settings";
