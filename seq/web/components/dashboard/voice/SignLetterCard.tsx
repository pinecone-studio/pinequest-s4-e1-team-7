type Props = {
  letter: string;
  url?: string;
  size?: number;
  onClick?: () => void;
};

export function SignLetterCard({ letter, url, size = 68, onClick }: Props) {
  const imgSize = size - 14;
  const clickable = Boolean(onClick && url);

  const inner = (
    <>
      <div
        className="overflow-hidden rounded-xl"
        style={{ width: imgSize, height: imgSize, background: "white" }}
      >
        {url ? (
          <img
            src={url}
            alt={letter}
            className="h-full w-full object-cover [mix-blend-mode:multiply] dark:[mix-blend-mode:normal]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "var(--surface)" }}
          >
            <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
              —
            </span>
          </div>
        )}
      </div>
      <span
        className="text-[11px] font-bold leading-none"
        style={{ color: url ? "var(--text)" : "var(--text-3)" }}
      >
        {letter === " " ? "␣" : letter}
      </span>
    </>
  );

  const baseClass = "flex shrink-0 flex-col items-center gap-1 rounded-2xl p-1.5";
  const style = {
    width: size,
    background: "var(--surface-2)",
    border: "1px solid var(--border-c)",
  } as const;

  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${letter} үсгийн дохиог томруулж харах`}
        className={`${baseClass} cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]`}
        style={style}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={baseClass} style={style}>
      {inner}
    </div>
  );
}
