import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const cx = (...classes: (string | false | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
export const initial = (name: string): string =>
  (name.trim()[0] || "Х").toUpperCase();

export const greeting = (name: string): string => {
  const h = new Date().getHours();
  const part =
    h < 6
      ? "Шөнийн мэнд 🌙"
      : h < 12
        ? "Өглөөний мэнд 👋"
        : h < 18
          ? "Өдрийн мэнд ☀️"
          : "Оройн мэнд 🌆";
  return `${part}, ${name.split(" ")[0]}`;
};

export const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const pick = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
