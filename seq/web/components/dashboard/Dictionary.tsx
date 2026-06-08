"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Upload, Trash2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { DICT_CATEGORIES } from "@/lib/constants";
import type { DictCategory } from "@/lib/constants";
import type { SignEntry } from "@/lib/api";
import { uploadSign, deleteSign } from "@/lib/api";

const ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ".split("");
const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

interface Props {
  category?: DictCategory;
  signs?: SignEntry[];
}

export function Dictionary({
  category = "alphabet",
  signs: initial = [],
}: Props) {
  const { settings, toast } = useApp();
  const { speak } = useTextToSpeech();
  const [signs, setSigns] = useState<SignEntry[]>(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const catInfo = DICT_CATEGORIES.find((c) => c.id === category)!;
  const items = category === "alphabet" ? ALPHABET : NUMBERS;
  const serverCategory: "alphabet" | "number" =
    category === "numbers" ? "number" : "alphabet";

  const signMap = new Map(signs.map((s) => [s.label.toUpperCase(), s]));
  const allFilled = items.every((item) => signMap.has(item));

  const handleSpeak = (item: SignEntry) => {
    speak(item.label, settings);
    toast("info", `Уншиж байна: ${item.label}`, "volume-2");
  };

  const handleUpload = async (label: string, file: File) => {
    setUploading(label);
    try {
      const entry = await uploadSign(file, label, serverCategory);
      setSigns((prev) => {
        const filtered = prev.filter((s) => s.label.toUpperCase() !== label);
        return [...filtered, entry];
      });
      toast("success", `${label} зураг амжилттай нэмэгдлээ`, "check");
    } catch {
      toast("warn", `${label} upload хийхэд алдаа гарлаа`, "alert-triangle");
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (sign: SignEntry) => {
    try {
      await deleteSign(sign.id);
      setSigns((prev) => prev.filter((s) => s.id !== sign.id));
      toast("info", `${sign.label} зураг устгалаа`, "trash");
    } catch {
      toast("warn", "Устгахад алдаа гарлаа", "alert-triangle");
    }
  };

  return (
    <section className="db-section">
      <SectionHeader
        crumb={`Толь бичиг › ${catInfo.label}`}
        title={catInfo.label}
        subtitle={
          category === "alphabet"
            ? "Дохионы хэлний монгол цагаан толгой."
            : "0-аас 9 хүртэл тоон дохио."
        }
      />

      <p className="mb-5 text-sm" style={{ color: "var(--text-3)" }}>
        Нийт {items.length} {category === "alphabet" ? "үсэг" : "тоо"}
        {signs.length > 0 && (
          <span className="ml-2" style={{ color: "var(--olive)" }}>
            · {signs.length} / {items.length}
          </span>
        )}
      </p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
        {items.map((item) => {
          const sign = signMap.get(item);
          const isUploading = uploading === item;

          if (sign) {
            return (
              <div
                key={item}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  onClick={() => handleSpeak(sign)}
                  className="w-full text-left"
                >
                  <div className="overflow-hidden rounded-t-2xl bg-[#e8ede9]">
                    <Image
                      src={sign.url}
                      alt={item}
                      width={400}
                      height={500}
                      unoptimized
                      className="w-full h-auto scale-[1.2] transition-transform group-hover:scale-[1.2]"
                    />
                  </div>
                  <div className="p-2.5">
                    <div
                      className="text-sm font-semibold leading-tight"
                      style={{ color: "var(--text)" }}
                    >
                      {item}
                    </div>
                  </div>
                </button>

                <div className="absolute right-1 top-1 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    title="Зураг солих"
                    onClick={() => inputRefs.current[item]?.click()}
                    className="flex size-7 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80"
                  >
                    <Upload className="size-3.5" />
                  </button>
                  <button
                    title="Зураг устгах"
                    onClick={() => handleDelete(sign)}
                    className="flex size-7 items-center justify-center rounded-lg bg-red-500/80 text-white hover:bg-red-600"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <input
                  ref={(el) => {
                    inputRefs.current[item] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(item, file);
                    e.target.value = "";
                  }}
                />
              </div>
            );
          }

          if (allFilled) return null;

          return (
            <label
              key={item}
              className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(item, file);
                  e.target.value = "";
                }}
              />
              <div
                className="relative flex aspect-square flex-col items-center justify-center gap-1"
                style={{
                  background: isUploading ? "var(--olive-soft)" : undefined,
                }}
              >
                {isUploading ? (
                  <span
                    className="text-xs animate-pulse"
                    style={{ color: "var(--olive)" }}
                  >
                    Хүлээнэ үү…
                  </span>
                ) : (
                  <>
                    <Upload
                      className="size-5 transition-transform group-hover:scale-110"
                      style={{ color: "var(--olive)", opacity: 0.5 }}
                    />
                    <span
                      className="text-3xl font-bold"
                      style={{ color: "var(--olive)", opacity: 0.4 }}
                    >
                      {item}
                    </span>
                  </>
                )}
              </div>
              <div className="p-2.5">
                <div
                  className="text-sm font-semibold leading-tight"
                  style={{ color: "var(--text)" }}
                >
                  {item}
                </div>
                <div
                  className="mt-1 flex items-center gap-1 text-xs"
                  style={{ color: "var(--olive)", opacity: 0.6 }}
                >
                  <Upload className="size-3" />
                  Зураг нэмэх
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
