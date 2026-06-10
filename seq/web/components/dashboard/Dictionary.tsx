"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Upload, Trash2 } from "lucide-react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
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
  const router = useRouter();
  const { settings, toast } = useApp();
  const { speak } = useTextToSpeech();
  const [signs, setSigns] = useState<SignEntry[]>(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const items = category === "alphabet" ? ALPHABET : NUMBERS;
  const serverCategory: "alphabet" | "number" =
    category === "numbers" ? "number" : "alphabet";

  const signMap = new Map(signs.map((s) => [s.label.toUpperCase(), s]));
  const [activeItem, setActiveItem] = useState<number>(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const [stripHeight, setStripHeight] = useState(600);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setStripHeight(e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      router.refresh();
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
      router.refresh();
    } catch {
      toast("warn", "Устгахад алдаа гарлаа", "alert-triangle");
    }
  };

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg)" }}>

      {/* Header + tabs — constrained width */}
      <div className="mx-auto w-full px-4 md:px-6 lg:px-10 xl:px-16">
        <div className="flex items-center pb-2 pt-5">
          <button
            onClick={() => router.back()}
            aria-label="Буцах"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
          >
            <ChevronLeftIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
          </button>
          <h1 className="flex-1 text-center text-[17px] font-bold md:text-[20px]" style={{ color: "var(--text)" }}>
            Толь бичиг
          </h1>
          <div className="h-10 w-10" />
        </div>

        <div className="flex gap-2 pb-3">
          {DICT_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/dict?cat=${cat.id}`}
              className="rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95"
              style={{
                background: category === cat.id ? "var(--olive)" : "var(--surface-2)",
                color: category === cat.id ? "#0d1e35" : "var(--text-2)",
                border: `1px solid ${category === cat.id ? "var(--olive)" : "var(--border-c)"}`,
              }}
            >
              {cat.label}
            </Link>
          ))}
          <span className="ml-auto self-center text-[12px]" style={{ color: "var(--text-3)" }}>
            {signs.length}/{items.length}
          </span>
        </div>
      </div>

      {/* Skiper expand strip — full width, fills remaining height */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-4 pb-[max(calc(env(safe-area-inset-bottom)+4rem),5.5rem)] md:px-6 md:pb-4 lg:px-10 xl:px-16">
        <div ref={stripRef} className="flex h-full items-stretch gap-2">
            {items.map((item, index) => {
              const sign = signMap.get(item);
              const isActive = activeItem === index;
              const isUploading = uploading === item;

              return (
                <motion.div
                  key={item}
                  className="relative shrink-0 cursor-pointer overflow-hidden rounded-[28px]"
                  animate={{ width: isActive ? stripHeight : "4.5rem" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onClick={() => setActiveItem(index)}
                  onHoverStart={() => setActiveItem(index)}
                  style={{
                    height: "100%",
                    background: sign ? "var(--surface)" : "var(--surface-2)",
                    border: "1px solid var(--border-c)",
                  }}
                >
                  {/* Image — only rendered when active so it fills properly */}
                  <AnimatePresence>
                    {isActive && sign && (
                      <motion.img
                        key="img"
                        src={sign.url}
                        alt={item}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </AnimatePresence>

                  {/* Collapsed: centered letter */}
                  <AnimatePresence>
                    {!isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span
                          className="text-[15px] font-bold tracking-wide"
                          style={{ color: "var(--text-2)" }}
                        >
                          {item}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded overlay */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col justify-between p-4"
                        style={{
                          background: sign
                            ? "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)"
                            : "var(--surface-2)",
                        }}
                      >
                        {/* Top controls */}
                        <div className="flex justify-end gap-1.5">
                          {sign && (
                            <>
                              <button
                                title="Зураг солих"
                                onClick={(e) => { e.stopPropagation(); inputRefs.current[item]?.click(); }}
                                className="flex size-8 items-center justify-center rounded-xl bg-black/50 text-white hover:bg-black/70"
                              >
                                <Upload className="size-3.5" />
                              </button>
                              <button
                                title="Зураг устгах"
                                onClick={(e) => { e.stopPropagation(); handleDelete(sign); }}
                                className="flex size-8 items-center justify-center rounded-xl bg-red-500/70 text-white hover:bg-red-600"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Bottom label + actions */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p
                              className="text-[28px] font-bold leading-none"
                              style={{ color: sign ? "white" : "var(--text)" }}
                            >
                              {item}
                            </p>
                            {sign && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSpeak(sign); }}
                                className="mt-2 rounded-full px-3 py-1 text-[11px] font-semibold"
                                style={{ background: "var(--olive)", color: "#0d1e35" }}
                              >
                                Сонсох
                              </button>
                            )}
                          </div>
                          {!sign && (
                            <label className="cursor-pointer">
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
                              <span
                                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                                style={{ background: "var(--olive)", color: "#0d1e35" }}
                              >
                                {isUploading ? "Хүлээнэ үү…" : <><Upload className="size-3" />Нэмэх</>}
                              </span>
                            </label>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hidden file input for replace */}
                  <input
                    ref={(el) => { inputRefs.current[item] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(item, file);
                      e.target.value = "";
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
    </div>
  );
}
