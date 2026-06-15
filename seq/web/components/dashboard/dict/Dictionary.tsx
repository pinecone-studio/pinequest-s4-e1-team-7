"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Upload } from "lucide-react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { DICT_CATEGORIES } from "@/lib/constants";
import type { DictCategory } from "@/lib/constants";
import type { SignEntry } from "@/lib/api";
import { uploadSign } from "@/lib/api";

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
  const { toast } = useApp();
  const [signs, setSigns] = useState<SignEntry[]>(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const items = category === "alphabet" ? ALPHABET : NUMBERS;
  const serverCategory: "alphabet" | "number" =
    category === "numbers" ? "number" : "alphabet";

  const signMap = new Map(signs.map((s) => [s.label.toUpperCase(), s]));
  const filteredItems = search.trim()
    ? items.filter((i) => i.toLowerCase().includes(search.trim().toLowerCase()))
    : items;
  const [activeItem, setActiveItem] = useState<number>(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeItemRef = useRef(0);
  const programmaticScrollRef = useRef(false);
  const touchRef = useRef({ x: 0, y: 0, axis: null as "x" | "y" | null });

  const [stripHeight, setStripHeight] = useState(560);
  const [sidePad, setSidePad] = useState(0);

  const [winWidth, setWinWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const [winHeight, setWinHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );

  useEffect(() => {
    setSigns(initial);
    setActiveItem(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    activeItemRef.current = activeItem;
  }, [activeItem]);

  useEffect(() => {
    const el = stripRef.current;
    if (!el || winWidth < 768) return;
    const ro = new ResizeObserver(([entry]) =>
      setStripHeight(entry.contentRect.height),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [winWidth]);

  useEffect(() => {
    const onResize = () => {
      setWinWidth(window.innerWidth);
      setWinHeight(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = winWidth < 768;
  const mobileCardSize = Math.min(winWidth - 16, winHeight - 168);
  const cardSize = isMobile ? mobileCardSize : stripHeight;

  const onMobileTouchStart = (e: React.TouchEvent) => {
    touchRef.current = {
      x: e.touches[0]?.clientX ?? 0,
      y: e.touches[0]?.clientY ?? 0,
      axis: null,
    };
  };

  const onMobileTouchMove = (e: React.TouchEvent) => {
    const t = touchRef.current;
    if (t.axis) return;
    const dx = Math.abs((e.touches[0]?.clientX ?? 0) - t.x);
    const dy = Math.abs((e.touches[0]?.clientY ?? 0) - t.y);
    if (dx > 10 || dy > 10) t.axis = dx > dy ? "x" : "y";
  };

  const onMobileTouchEnd = (e: React.TouchEvent) => {
    const t = touchRef.current;
    if (t.axis === "x") {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - t.x;
      if (dx < -36) goToItem(activeItemRef.current + 1);
      else if (dx > 36) goToItem(activeItemRef.current - 1);
    }
    touchRef.current = { x: 0, y: 0, axis: null };
  };

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const scroller = scrollRef.current;
      const card = cardRefs.current[index];
      if (!scroller || !card) return;

      const targetLeft =
        card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2;
      const maxLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      const left = Math.max(0, Math.min(targetLeft, maxLeft));

      programmaticScrollRef.current = true;
      scroller.scrollTo({ left, behavior });
      if (behavior === "auto") {
        programmaticScrollRef.current = false;
      }
    },
    [],
  );

  const syncActiveFromScroll = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller || isMobile) return;
    if (filteredItems.length === 0) return;

    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    let closest = 0;

    if (scroller.scrollLeft <= 8) {
      closest = 0;
    } else if (scroller.scrollLeft >= maxScroll - 8) {
      closest = filteredItems.length - 1;
    } else {
      const center = scroller.scrollLeft + scroller.clientWidth / 2;
      let minDist = Infinity;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const cardCenter = el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(center - cardCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
    }

    if (closest !== activeItemRef.current) {
      activeItemRef.current = closest;
      setActiveItem(closest);
    }
  }, [filteredItems.length, isMobile]);

  useLayoutEffect(() => {
    if (isMobile) return;
    const scroller = scrollRef.current;
    if (!scroller) return;

    const updateSidePad = () => {
      setSidePad(Math.max(0, (scroller.clientWidth - cardSize) / 2));
    };
    updateSidePad();

    const ro = new ResizeObserver(updateSidePad);
    ro.observe(scroller);

    return () => ro.disconnect();
  }, [isMobile, cardSize]);

  useLayoutEffect(() => {
    if (isMobile) return;
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onScroll = () => {
      if (programmaticScrollRef.current) return;
      syncActiveFromScroll();
    };

    const onScrollEnd = () => {
      programmaticScrollRef.current = false;
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("scrollend", onScrollEnd, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("scrollend", onScrollEnd);
    };
  }, [isMobile, filteredItems.length, syncActiveFromScroll]);

  useEffect(() => {
    if (isMobile) return;
    requestAnimationFrame(() => scrollToIndex(activeItemRef.current, "auto"));
  }, [sidePad, cardSize, isMobile, scrollToIndex]);

  useEffect(() => {
    setActiveItem(0);
    activeItemRef.current = 0;
    if (isMobile) return;
    requestAnimationFrame(() => scrollToIndex(0, "auto"));
  }, [search, category, isMobile, scrollToIndex]);

  const goToItem = useCallback(
    (index: number) => {
      if (index < 0 || index >= filteredItems.length) return;
      activeItemRef.current = index;
      setActiveItem(index);
      if (isMobile) return;
      scrollToIndex(index);
    },
    [filteredItems.length, scrollToIndex, isMobile],
  );

  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "ArrowLeft") goToItem(activeItemRef.current - 1);
      if (e.key === "ArrowRight") goToItem(activeItemRef.current + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, goToItem]);

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


  const navBtnClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-150 hover:scale-105 hover:brightness-110 active:scale-90 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)] md:h-11 md:w-11";

  const desktopNavBtnClass = `${navBtnClass} absolute top-1/2 z-30 -translate-y-1/2`;

  const mobileNavBtnClass = `${navBtnClass} absolute top-1/2 z-20 -translate-y-1/2`;

  const navBtnStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border-c)",
  };

  const renderCard = (
    item: string,
    index: number,
    isActive: boolean,
    isUploading: boolean,
    sign: SignEntry | undefined,
    ref?: (el: HTMLDivElement | null) => void,
  ) => (
    <motion.div
      key={`${item}-${index}`}
      ref={ref}
      className="relative shrink-0 cursor-pointer snap-center overflow-hidden rounded-[24px] md:rounded-[28px]"
      animate={{
        scale: isMobile || isActive ? 1 : 0.88,
        opacity: isMobile || isActive ? 1 : 0.5,
      }}
      transition={{ duration: 0.32, ease: "easeInOut" }}
      onClick={() => {
        if (!isMobile) goToItem(index);
      }}
      style={{
        width: cardSize,
        height: cardSize,
        background: sign ? "var(--surface)" : "var(--surface-2)",
        border: "1px solid var(--border-c)",
      }}
    >
      {sign && (
        <img
          src={sign.url}
          alt={item}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${
            !isMobile && !isActive ? "scale-105 blur-[3px] brightness-75" : ""
          }`}
          draggable={false}
        />
      )}

      {(isMobile || isActive) && (
        <div
          className="absolute inset-0 flex flex-col justify-between p-3 md:p-4"
          style={{
            background: sign
              ? "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)"
              : "var(--surface-2)",
          }}
        >
          <div className="flex items-end justify-between">
            <p
              className="text-[22px] font-bold leading-none md:text-[28px]"
              style={{ color: sign ? "white" : "var(--text)" }}
            >
              {item}
            </p>
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
                  {isUploading ? (
                    "Хүлээнэ үү…"
                  ) : (
                    <>
                      <Upload className="size-3" />
                      Нэмэх
                    </>
                  )}
                </span>
              </label>
            )}
          </div>
        </div>
      )}

      {!isMobile && !isActive && !sign && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-[22px] font-bold md:text-[26px]"
            style={{ color: "var(--text-2)" }}
          >
            {item}
          </span>
        </div>
      )}

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
    </motion.div>
  );

  const activeLabel = filteredItems[activeItem];
  const activeSign = activeLabel ? signMap.get(activeLabel) : undefined;

  return (
    <div
      className="flex h-full flex-col overflow-y-auto overscroll-y-contain md:overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Header + tabs — constrained width */}
      <div className="mx-auto w-full shrink-0 px-3 md:px-6 lg:px-10 xl:px-16">
        <div className="flex items-center pb-4 pt-3 md:pb-6 md:pt-5">
          <button
            onClick={() => router.back()}
            aria-label="Буцах"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 hover:brightness-110 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-c)",
            }}
          >
            <ChevronLeftIcon
              className="h-5 w-5"
              style={{ color: "var(--text)" }}
            />
          </button>
          <h1
            className="flex-1 text-center text-[17px] font-bold md:text-[20px]"
            style={{ color: "var(--text)" }}
          >
            Толь бичиг
          </h1>
          <div className="h-10 w-10" />
        </div>

        <div className="flex flex-col gap-2 pb-2 min-[375px]:flex-row min-[375px]:items-center md:pb-3">
          <div className="flex shrink-0 items-center gap-2">
            {DICT_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/dashboard/dict?cat=${cat.id}`}
                className="rounded-full px-3 py-2 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)] md:px-4"
                style={{
                  background:
                    category === cat.id ? "var(--olive)" : "var(--surface-2)",
                  color: category === cat.id ? "#0d1e35" : "var(--text-2)",
                  border: `1px solid ${category === cat.id ? "var(--olive)" : "var(--border-c)"}`,
                }}
              >
                {cat.label}
              </Link>
            ))}
          </div>
          <div className="flex min-w-0 items-center gap-2 min-[375px]:ml-auto">
            <div
              className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-c)",
              }}
            >
              <MagnifyingGlassIcon
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: "var(--text-3)" }}
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveItem(0);
                }}
                placeholder="Хайх…"
                className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:opacity-50 min-[375px]:w-16 md:w-28"
                style={{ color: "var(--text)" }}
              />
            </div>
            <span
              className="shrink-0 text-[12px]"
              style={{ color: "var(--text-3)" }}
            >
              {signs.length}/{items.length}
            </span>
          </div>
        </div>
      </div>

      {/* Card strip */}
      <div className="flex min-h-0 flex-1 flex-col justify-center pt-6 pb-[max(calc(env(safe-area-inset-bottom)+4.25rem),5rem)] md:justify-center md:pb-4 md:pt-0">
        {isMobile ? (
          <div
            className="relative mx-auto touch-pan-y"
            style={{ width: cardSize, height: cardSize }}
            onTouchStart={onMobileTouchStart}
            onTouchMove={onMobileTouchMove}
            onTouchEnd={onMobileTouchEnd}
          >
            <button
              type="button"
              aria-label="Өмнөх үсэг"
              disabled={activeItem <= 0}
              className={mobileNavBtnClass}
              style={{ ...navBtnStyle, left: 6 }}
              onClick={() => goToItem(activeItem - 1)}
            >
              <ChevronLeftIcon
                className="h-5 w-5"
                style={{ color: "var(--text-2)" }}
              />
            </button>

            {activeLabel ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLabel}
                  className="h-full w-full"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -50 || info.velocity.x < -400) {
                      goToItem(activeItem + 1);
                    } else if (info.offset.x > 50 || info.velocity.x > 400) {
                      goToItem(activeItem - 1);
                    }
                  }}
                >
                  {renderCard(
                    activeLabel,
                    activeItem,
                    true,
                    uploading === activeLabel,
                    activeSign,
                  )}
                </motion.div>
              </AnimatePresence>
            ) : null}

            <button
              type="button"
              aria-label="Дараагийн үсэг"
              disabled={activeItem >= filteredItems.length - 1}
              className={mobileNavBtnClass}
              style={{ ...navBtnStyle, right: 6 }}
              onClick={() => goToItem(activeItem + 1)}
            >
              <ChevronRightIcon
                className="h-5 w-5"
                style={{ color: "var(--text-2)" }}
              />
            </button>
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <button
              type="button"
              aria-label="Өмнөх үсэг"
              disabled={activeItem <= 0}
              className={desktopNavBtnClass}
              style={{ ...navBtnStyle, left: "max(1rem, env(safe-area-inset-left))" }}
              onClick={() => goToItem(activeItem - 1)}
            >
              <ChevronLeftIcon
                className="h-5 w-5"
                style={{ color: "var(--text-2)" }}
              />
            </button>

            <button
              type="button"
              aria-label="Дараагийн үсэг"
              disabled={activeItem >= filteredItems.length - 1}
              className={desktopNavBtnClass}
              style={{ ...navBtnStyle, right: "max(1rem, env(safe-area-inset-right))" }}
              onClick={() => goToItem(activeItem + 1)}
            >
              <ChevronRightIcon
                className="h-5 w-5"
                style={{ color: "var(--text-2)" }}
              />
            </button>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden scroll-smooth touch-pan-x snap-x snap-mandatory py-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              <div
                ref={stripRef}
                className="flex h-full min-h-[min(600px,calc(100vh-220px))] items-center gap-5 py-4 md:gap-6"
                style={{
                  paddingLeft: sidePad,
                  paddingRight: sidePad,
                }}
              >
                {filteredItems.map((item, index) =>
                  renderCard(
                    item,
                    index,
                    activeItem === index,
                    uploading === item,
                    signMap.get(item),
                    (el) => {
                      cardRefs.current[index] = el;
                    },
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
