/** Монгол крилл брайль — 6 цэг (1–6) → үсэг */

export type BrailleDots = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Стандарт Брайль байрлал:
 *   Зүүн багана → цэг 1 (дээд), 2 (дунд), 3 (доод)
 *   Баруун багана → цэг 4 (дээд), 5 (дунд), 6 (доод)
 */
const patterns: Record<string, BrailleDots[]> = {
  А: [1],
  Б: [1, 2],
  В: [2, 4, 5, 6],
  Г: [1, 2, 4, 5],
  Д: [1, 4, 5],
  Е: [1, 5],
  Ё: [1, 6],
  Ж: [2, 4, 5],
  З: [1, 3, 5, 6],
  И: [2, 4],
  Й: [1, 2, 3, 4, 6],
  К: [1, 3],
  Л: [1, 2, 3],
  М: [1, 3, 4],
  Н: [1, 3, 4, 5],
  О: [1, 3, 5],
  Ө: [1, 2, 3, 6],
  П: [1, 2, 3, 4],
  Р: [1, 2, 3, 5],
  С: [2, 3, 4],
  Т: [2, 3, 4, 5],
  У: [1, 3, 6],
  Ү: [1, 4, 5, 6],
  Ф: [1, 2, 4],
  Х: [1, 2, 5],
  Ц: [1, 4],
  Ч: [1, 2, 3, 4, 5],
  Ш: [1, 5, 6],
  Щ: [1, 3, 4, 6],
  Ь: [2, 3, 4, 5, 6],
  Ъ: [1, 2, 3, 5, 6],
  Ы: [2, 3, 4, 6],
  Э: [2, 4, 6],
  Ю: [1, 2, 5, 6],
  Я: [1, 2, 4, 6],
  ",": [2],
  ".": [2, 5, 6],
  "?": [2, 6],
  "!": [2, 3, 5],
  " ": [],
};

function dotsToMask(dots: BrailleDots[]): number {
  return dots.reduce((m, d) => m | (1 << (d - 1)), 0);
}

const maskToChar = new Map<number, string>();
for (const [ch, dots] of Object.entries(patterns)) {
  maskToChar.set(dotsToMask(dots), ch);
}

export function maskFromSet(active: Set<BrailleDots>): number {
  let m = 0;
  for (const d of active) m |= 1 << (d - 1);
  return m;
}

export function charFromMask(mask: number): string | null {
  if (mask === 0) return " ";
  return maskToChar.get(mask) ?? null;
}

export function allBrailleLetters(): string[] {
  return Object.keys(patterns).filter((k) => k !== " ");
}

/**
 * Дэлгэцийн 6 бүс.
 * Стандарт байрлал: зүүн багана = 1,2,3 / баруун багана = 4,5,6
 *
 *   [ Бүс 1 (цэг 1) ] [ Бүс 4 (цэг 4) ]
 *   [ Бүс 2 (цэг 2) ] [ Бүс 5 (цэг 5) ]
 *   [ Бүс 3 (цэг 3) ] [ Бүс 6 (цэг 6) ]
 */
export const BRAILLE_ZONES: {
  dot: BrailleDots;
  label: string;
  gridArea: string;
}[] = [
  { dot: 1, label: "1", gridArea: "z1" },
  { dot: 4, label: "4", gridArea: "z4" },
  { dot: 2, label: "2", gridArea: "z2" },
  { dot: 5, label: "5", gridArea: "z5" },
  { dot: 3, label: "3", gridArea: "z3" },
  { dot: 6, label: "6", gridArea: "z6" },
];
