import { Hono } from "hono";
import type { Env } from "@/db";

const ENTRIES = [
  { word: "Сайн байна уу", note: "Мэндчилгээ" },
  { word: "Баярлалаа", note: "Талархал" },
  { word: "Тийм", note: "Зөвшөөрөл" },
  { word: "Үгүй", note: "Татгалзал" },
  { word: "Тусламж", note: "Яаралтай" },
  { word: "Уучлаарай", note: "Хүлцэл" },
  { word: "Баяртай", note: "Салах ёс" },
  { word: "Хэрэгтэй", note: "Хүсэлт" },
];

export const dictionaryRoute = new Hono<{ Bindings: Env }>()
  // GET /api/dictionary
  .get("/", (c) => c.json(ENTRIES));
