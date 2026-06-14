"use client";

import Link from "next/link";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { useAppMode } from "@/context/AppModeContext";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { m, useScroll, useTransform, AnimatePresence } from "framer-motion";

const MODE_OPTIONS = [
  {
    mode: "standard" as const,
    title: "Энгийн горим",
    desc: "Дохио, дуудлага, толь, бүх функц",
    path: "/dashboard/translator",
  },
  {
    mode: "accessible" as const,
    title: "Харааны бэрхшээлтэй",
    desc: "Чат, брайль, яриа бичих",
    path: "/accessible/chat",
  },
];

export const Header = ({ landing }: { landing?: boolean } = {}) => {
  const { user } = useAuth();
  const { setMode } = useAppMode();
  const { theme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [thresh, setThresh] = useState(300);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const wmarkOp = useTransform(scrollY, [thresh * 0.6, thresh], [0, 1]);

  useEffect(() => {
    setMounted(true);
    setThresh(window.innerHeight * 0.55);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (!mounted) return null;

  const isDark = theme === "dark";
  const logoSrc = isDark ? "/images/logoShar.png" : "/images/logoBlue.png";

  const pick = (opt: (typeof MODE_OPTIONS)[number]) => {
    setOpen(false);
    setMode(opt.mode);
    router.push(opt.path);
  };

  return (
    <nav className="lnav overflow-visible">
      <m.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-center bg-white/15"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 2.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      <Link href="/" className="lnav-logo overflow-visible">
        <img
          src={logoSrc}
          alt="Sign Bridge"
          className="h-13 w-13 object-contain"
        />
        <m.div
          style={{ opacity: wmarkOp }}
          className="flex items-baseline gap-1"
        >
          <span
            style={{ color: "var(--olive)", fontWeight: 900, fontSize: "20px" }}
          >
            Sign
          </span>
          <span
            style={{ color: "var(--text)", fontWeight: 900, fontSize: "20px" }}
          >
            Bridge
          </span>
        </m.div>
      </Link>

      <div className="lnav-right">
        {!landing && <ThemeToggle />}
        {!user ? (
          <>
            <Link
              href="/auth/login"
              className="db-pillbtn hidden sm:inline-flex"
            >
              Нэвтрэх
            </Link>
            <Link href="/auth/register" className="db-pillbtn green">
              <UserPlusIcon className="h-4 w-4" /> Бүртгүүлэх
            </Link>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="db-pillbtn green"
            >
              Эхлэх
            </button>
            <AnimatePresence>
              {open && (
                <m.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 z-50 min-w-[260px] rounded-2xl overflow-hidden shadow-xl"
                  style={{
                    background: "var(--surface, #fff)",
                    border: "1px solid var(--border-c, #e5e7eb)",
                  }}
                >
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => pick(opt)}
                      className="w-full text-left px-5 py-4 transition-colors hover:bg-black/5 active:bg-black/10"
                    >
                      <span
                        className="block text-[15px] font-bold"
                        style={{
                          color:
                            opt.mode === "accessible"
                              ? "#ffbf00"
                              : "var(--text)",
                        }}
                      >
                        {opt.title}
                      </span>
                      <span
                        className="mt-1 block text-[13px]"
                        style={{ color: "var(--text-3)" }}
                      >
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </m.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
};
