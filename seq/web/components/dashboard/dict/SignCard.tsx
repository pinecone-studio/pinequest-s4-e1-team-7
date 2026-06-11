import { HandRaisedIcon } from "@heroicons/react/24/outline";

export type SignItem = { id: string; letter: string; label: string; imageUrl?: string; videoUrl?: string };

export function SignCard({ item, onClick }: { item: SignItem; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={`${item.label} харах`}
      className="group overflow-hidden rounded-2xl text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-[0.97]"
      style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--olive-soft) 0%, var(--surface-2) 100%)" }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.label} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <>
            <span className="select-none font-bold leading-none transition-transform duration-300 group-hover:scale-110"
              style={{ fontSize: "clamp(32px, 7vw, 52px)", color: "var(--olive)" }}>{item.letter}</span>
            <HandRaisedIcon className="absolute left-2 top-2 h-4 w-4 opacity-25" style={{ color: "var(--olive)" }} />
            <div className="absolute bottom-2 right-2 rounded-full px-2 py-0.5"
              style={{ background: "var(--surface)", border: "1px solid var(--border-c)", fontSize: "8px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-3)", textTransform: "uppercase" }}>
              зураг
            </div>
          </>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-bold leading-tight" style={{ color: "var(--text)" }}>{item.label}</p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Дарж харах</p>
      </div>
    </button>
  );
}
