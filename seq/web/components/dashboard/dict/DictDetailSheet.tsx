import { SpeakerWaveIcon, XMarkIcon, HandRaisedIcon } from "@heroicons/react/24/outline";
import type { SignItem } from "./SignCard";
import type { DictCategory } from "@/lib/constants";

export function DictDetailSheet({ item, category, onClose, onSpeak }: {
  item: SignItem;
  category: DictCategory;
  onClose: () => void;
  onSpeak: (item: SignItem) => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-[32px] md:left-1/2 md:bottom-auto md:top-1/2 md:w-full md:max-w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]"
        style={{ background: "var(--surface)", boxShadow: "var(--shadow)" }}>
        <div className="mx-auto mt-3 h-1 w-10 rounded-full md:hidden" style={{ background: "var(--border-c)" }} />
        <div className="flex items-center justify-between px-6 pt-4 pb-3" style={{ borderBottom: "1px solid var(--border-c)" }}>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
            {category === "alphabet" ? "Хурууны үсэг" : "Тоон дохио"}
          </span>
          <button onClick={onClose} aria-label="Хаах" className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity active:opacity-60"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}>
            <XMarkIcon className="h-4 w-4" style={{ color: "var(--text)" }} />
          </button>
        </div>
        <div className="px-6 pb-8 pt-5">
          <div className="relative mb-6 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(135deg, var(--olive-soft) 0%, var(--surface-2) 100%)", border: "1px solid var(--border-c)" }}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.label} className="h-full w-full object-contain p-8" />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <span className="select-none font-bold leading-none" style={{ fontSize: "clamp(64px, 18vw, 96px)", color: "var(--olive)" }}>{item.letter}</span>
                <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
                  <HandRaisedIcon className="h-3.5 w-3.5" style={{ color: "var(--text-3)" }} />
                  <span className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>Дохионы зураг удахгүй нэмэгдэнэ</span>
                </div>
              </div>
            )}
          </div>
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-3)" }}>
              {category === "alphabet" ? "Үсэг" : "Тоо"}
            </p>
            <h2 className="text-[52px] font-bold leading-none" style={{ color: "var(--text)" }}>{item.letter}</h2>
            <p className="mt-2 text-[18px] font-semibold" style={{ color: "var(--text-2)" }}>{item.label}</p>
          </div>
          <button onClick={() => onSpeak(item)} className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-[15px] font-bold transition-all duration-150 hover:brightness-110 active:scale-[0.97] active:brightness-95"
            style={{ background: "var(--olive)", color: "#0d1e35" }}>
            <SpeakerWaveIcon className="h-5 w-5" />Дуугаар сонсох
          </button>
        </div>
      </div>
    </>
  );
}
