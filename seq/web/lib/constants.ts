import { LayoutDashboard, Hand, Mic, Video, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardSection } from "./types";

export type DictCategory = "alphabet" | "numbers";

export const DICT_CATEGORIES: { id: DictCategory; label: string; sub: string }[] = [
  { id: "alphabet", label: "Хурууны үсэг", sub: "Цагаан толгойн 35 үсэг" },
  { id: "numbers",  label: "Тоо",          sub: "0 – 9 тооны дохио" },
];

export const MN_ALPHABET: string[] = [
  "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И",
  "Й", "К", "Л", "М", "Н", "О", "Ö", "П", "Р", "С",
  "Т", "У", "Ü", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ",
  "Ы", "Ь", "Э", "Ю", "Я",
];

export const MN_NUMBERS: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

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

export const NAV_ITEMS: { id: DashboardSection; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Хяналтын самбар", icon: LayoutDashboard },
  { id: "translator", label: "Дохио → Дуу", icon: Hand },
  { id: "voice", label: "Дуу → Бичвэр", icon: Mic },
  { id: "call", label: "Видео", icon: Video },
  { id: "dict", label: "Толь бичиг", icon: BookOpen },
];
