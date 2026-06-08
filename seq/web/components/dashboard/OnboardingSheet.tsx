import { useState, useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import { ChevronLeftIcon, ArrowRightIcon, LightBulbIcon, HandRaisedIcon, VideoCameraIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
type Step = { Icon: HeroIcon; iconBg: string; iconColor: string; title: string; desc: string; tip: string };

const STEPS: Step[] = [
  { Icon: VideoCameraIcon, iconBg: "linear-gradient(135deg, var(--teal) 0%, var(--teal-2) 100%)", iconColor: "#eaf0f8", title: "Камерт зөвшөөрөл", desc: "Дохиог таних тул камерыг нэрхэнэ. Зургийг хадгалдаггүй — зөвхөн гарын байрлалыг бодит цагт анализ хийнэ.", tip: "Нэг удаа зөвшөөрвөл дахин асуухгүй." },
  { Icon: HandRaisedIcon, iconBg: "var(--olive)", iconColor: "#0d1e35", title: "Гараа тодорхой үзүүлнэ", desc: "Камерын өмнө цайвар дэвсгэрт гараа тодорхой байрлуулна. Доорх шар товчийг дарснаар AI шууд таниж эхэлнэ.", tip: "Гэрэл сайтай газар дохио илүү сайн танигдана." },
  { Icon: SpeakerWaveIcon, iconBg: "linear-gradient(135deg, var(--teal) 0%, var(--teal-2) 100%)", iconColor: "#eaf0f8", title: "Яриа болж сонсогдоно", desc: "Таниулсан дохио монгол хэлээр шууд ярих болно. Тохиргоогоос дуу хоолой болон хурдыг өөрчилж болно.", tip: "Толь бичгээс дохионуудыг урьдчилан сурах боломжтой." },
];

export function OnboardingSheet({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  const touchX = useRef<number | null>(null);
  const total = STEPS.length;
  const isLast = step === total - 1;
  const cur = STEPS[step];

  const goNext = () => (isLast ? onDismiss() : setStep((s) => s + 1));
  const goPrev = () => { if (step > 0) setStep((s) => s - 1); };

  return (
    <>
      <div
        className="fixed inset-0 z-[70]"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onDismiss}
      />
      <div
        className="fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom),16px)] z-[71] mx-auto max-w-lg select-none overflow-hidden rounded-[28px]"
        style={{ background: "var(--surface)", boxShadow: "0 -8px 40px rgba(0,0,0,0.28)", animation: "sheet-up 0.32s var(--ease) both" }}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - (touchX.current ?? 0); if (dx < -48) goNext(); else if (dx > 48) goPrev(); touchX.current = null; }}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full" style={{ background: "var(--border-c)" }} />
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)} className="rounded-full transition-all duration-300"
                style={{ height: "5px", width: i === step ? "18px" : "5px", background: i === step ? "var(--olive)" : "var(--border-c)" }} />
            ))}
          </div>
          <button onClick={onDismiss} className="rounded-full px-3 py-1 text-[12px] font-semibold transition-opacity active:opacity-60"
            style={{ background: "var(--surface-2)", color: "var(--text-3)" }}>Алгасах</button>
        </div>
        <div key={step} className="flex items-start gap-4 px-5 pt-4 pb-3" style={{ animation: "dbfade 0.22s var(--ease)" }}>
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: cur.iconBg, boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }}>
            <cur.Icon className="h-7 w-7" style={{ color: cur.iconColor }} />
            {step === 1 && <div className="absolute inset-0 rounded-2xl" style={{ border: "2px solid var(--olive)", animation: "ripple 1.8s ease-out infinite" }} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>{step + 1} / {total}</p>
            <h3 className="text-[16px] font-bold leading-snug mb-1" style={{ color: "var(--text)" }}>{cur.title}</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-2)" }}>{cur.desc}</p>
          </div>
        </div>
        <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "var(--olive-soft)", border: "1px solid var(--border-2)" }}>
          <LightBulbIcon className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--olive)" }} />
          <span className="text-[12px] font-semibold" style={{ color: "var(--text-2)" }}>{cur.tip}</span>
        </div>
        <div className="flex gap-2.5 px-5 pb-5">
          {step > 0 && (
            <button onClick={goPrev} aria-label="Өмнөх" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-90"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}>
              <ChevronLeftIcon className="h-4 w-4" style={{ color: "var(--text-2)" }} />
            </button>
          )}
          <button onClick={goNext} className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[14px] font-bold transition-all hover:brightness-110 active:scale-[0.97]"
            style={{ background: "var(--olive)", color: "#0d1e35" }}>
            {isLast ? "Эхлэх!" : "Дараах"}<ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
