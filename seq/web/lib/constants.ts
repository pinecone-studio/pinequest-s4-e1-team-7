import type { DashboardSection } from "./types";

export const SIGN_PHRASES = [
  "Сайн байна уу",
  "Баярлалаа",
  "Таны нэр хэн бэ?",
  "Би тусламж хэрэгтэй байна",
  "Уулзахад таатай байна",
  "Тийм, зөв байна",
  "Ариун цэврийн өрөө хаана байна вэ?",
  "Намайг сонсож байна уу?",
];

export const CALL_PHRASES = [
  "Сайн байна уу, та яаж байна?",
  "Өнөөдөр уулзсандаа их баяртай байна.",
  "Энэ төслийн талаар ярилцъя.",
  "Танд маш их баярлалаа.",
  "Дараа дахин холбогдъё, баяртай.",
];

export const DICTIONARY = [
  { word: "Сайн байна уу", note: "Мэндчилгээ" },
  { word: "Баярлалаа", note: "Талархал" },
  { word: "Тийм", note: "Зөвшөөрөл" },
  { word: "Үгүй", note: "Татгалзал" },
  { word: "Тусламж", note: "Яаралтай" },
  { word: "Уучлаарай", note: "Хүлцэл" },
  { word: "Баяртай", note: "Салах ёс" },
  { word: "Хэрэгтэй", note: "Хүсэлт" },
];

export const NAV_ITEMS: { id: DashboardSection; label: string; icon: string }[] = [
  { id: "overview", label: "Хяналтын самбар", icon: "layout-dashboard" },
  { id: "translator", label: "Дохио → Дуу", icon: "hand" },
  { id: "voice", label: "Дуу → Бичвэр", icon: "captions" },
  { id: "call", label: "Видео", icon: "video" },
  { id: "dict", label: "Толь бичиг", icon: "book-open" },
];
