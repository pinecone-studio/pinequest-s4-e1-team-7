"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const LANGS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "mn", label: "Монгол", flag: "🇲🇳" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

export default function TranslateWidget() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: true },
        "gt-hidden",
      );
    };

    if (!document.querySelector("#gt-script")) {
      const script = document.createElement("script");
      script.id = "gt-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    if (!document.querySelector("#gt-override")) {
      const style = document.createElement("style");
      style.id = "gt-override";
      style.innerHTML = `
        .goog-te-banner-frame,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-tooltip,
        .goog-tooltip:hover,
        .goog-text-highlight,
        .goog-te-spinner-pos,
        .skiptranslate iframe { display: none !important; }
        body { top: 0 !important; position: static !important; }
        font[style*="vertical-align"] { vertical-align: inherit !important; }
      `;
      document.head.appendChild(style);
    }


  }, []);


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const translate = (code: string) => {
    const select = document.querySelector(
      ".goog-te-combo",
    ) as HTMLSelectElement;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
    }
    setActive(code);
    setOpen(false);
  };

  const current = LANGS.find((l) => l.code === active)!;

  return (
    <>
      <div id="gt-hidden" className="hidden" />

      <div ref={ref} className="relative" translate="no">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 backdrop-blur transition hover:bg-white/10 hover:text-white"
        >
          <span className="text-sm">{current.flag}</span>
          <span>{current.label}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-35 overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
            <div className="p-1">
              {LANGS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => translate(lang.code)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-xs transition ${
                    active === lang.code
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-white/60 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {active === lang.code && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}