import { TypewriterCaption } from "@/components/TypewriterCaption";

type Props = { myCaption: string; theirCaption: string; onClearMine: () => void };

export function CaptionOverlay({ myCaption, theirCaption, onClearMine }: Props) {
  if (!myCaption && !theirCaption) return null;
  return (
    <div className="absolute inset-x-4 bottom-[120px] z-20 space-y-2">
      {theirCaption && (
        <div className="rounded-[14px] px-4 py-2.5"
          style={{ background: "var(--glass)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--teal-2)" }}>Хамтрагч</p>
          <TypewriterCaption instant text={theirCaption} />
        </div>
      )}
      {myCaption && (
        <div className="flex items-start gap-2">
          <div className="flex-1 rounded-[14px] px-4 py-2.5"
            style={{ background: "var(--glass)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--olive)" }}>Та</p>
            <TypewriterCaption instant text={myCaption} />
          </div>
          <button onClick={onClearMine}
            className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-opacity active:opacity-60"
            style={{ background: "var(--glass-btn)", color: "var(--text-3)", border: "1px solid var(--glass-border)" }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
