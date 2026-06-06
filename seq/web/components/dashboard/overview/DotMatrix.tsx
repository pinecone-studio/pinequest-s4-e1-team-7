const COLS = 22;
const ROWS = 6;

const colorFor = (ratio: number) =>
  ratio > 0.6 ? "var(--olive)" : ratio > 0.3 ? "var(--teal-2)" : "var(--teal)";

const peaks = Array.from({ length: COLS }, (_, c) =>
  Math.round(ROWS * (0.3 + 0.6 * Math.abs(Math.sin(c * 0.6)))),
);

export function DotMatrix() {
  return (
    <div className="ov-dots">
      {peaks.map((peak, c) => (
        <div className="ov-dotcol" key={c}>
          {Array.from({ length: ROWS }, (_, r) => (
            <span
              key={r}
              className="ov-dot"
              style={{ background: r < peak ? colorFor(r / ROWS) : "var(--surface-2)" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
