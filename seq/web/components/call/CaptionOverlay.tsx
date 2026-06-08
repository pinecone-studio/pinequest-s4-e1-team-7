import { TypewriterCaption } from "@/components/TypewriterCaption";

type Props = { myCaption: string; theirCaption: string; onClearMine: () => void };

export function CaptionOverlay({ myCaption, theirCaption, onClearMine }: Props) {
  if (!myCaption && !theirCaption) return null;

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-30 max-h-[38vh] space-y-2 overflow-y-auto">
      {theirCaption && (
        <div className="pointer-events-auto rounded-2xl bg-black/55 px-4 py-3 backdrop-blur-md">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-teal-300/80">
            Хамтрагч
          </p>
          <div className="[&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>div]:text-base [&>div]:leading-snug [&>div]:text-white [&>div]:shadow-none">
            <TypewriterCaption text={theirCaption} charMs={16} />
          </div>
        </div>
      )}
      {myCaption && (
        <div className="pointer-events-auto flex items-start gap-2">
          <div className="flex-1 rounded-2xl bg-black/55 px-4 py-3 backdrop-blur-md">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--olive)]">
              Та
            </p>
            <div className="[&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>div]:text-base [&>div]:leading-snug [&>div]:text-white [&>div]:shadow-none">
              <TypewriterCaption text={myCaption} charMs={16} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClearMine}
            aria-label="Цэвэрлэх"
            className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm text-white/70 backdrop-blur-md transition active:scale-90"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
