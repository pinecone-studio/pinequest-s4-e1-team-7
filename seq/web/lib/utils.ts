import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const cx = (...classes: (string | false | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
export const initial = (name: string): string =>
  (name.trim()[0] || "Х").toUpperCase();

export const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;
