type Props = {
  size: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (n: number) => void;
};

export function FontSizeControl({ size, min = 14, max = 48, step = 4, onChange }: Props) {
  const pct = ((size - min) / (max - min)) * 100;
  const cls =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold transition-all active:scale-90";
  const style = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-c)",
    color: "var(--text-3)",
  };
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, size - step))}
        className={`${cls} text-[13px]`}
        style={style}
        aria-label="Фонт багасгах"
      >
        A
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={size}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-line flex-1 cursor-pointer"
        aria-label="Фонтын хэмжээ"
        style={{
          background: `linear-gradient(to right, var(--olive) ${pct}%, var(--border-c) ${pct}%)`,
        }}
      />
      <button
        onClick={() => onChange(Math.min(max, size + step))}
        className={`${cls} text-[18px]`}
        style={style}
        aria-label="Фонт томруулах"
      >
        A
      </button>
    </div>
  );
}
