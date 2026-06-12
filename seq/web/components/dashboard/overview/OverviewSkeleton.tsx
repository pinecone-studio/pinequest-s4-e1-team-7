function Bar({ w, h = 14 }: { w: number | string; h?: number }) {
  return (
    <div
      className="animate-pulse rounded-full"
      style={{ width: w, height: h, background: "var(--surface-2)" }}
    />
  );
}

function CardPulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-[28px] ${className ?? ""}`}
      style={{ background: "var(--surface-2)", ...style }}
    />
  );
}

export function OverviewSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden px-4 md:px-6 lg:px-10 xl:px-16"
      style={{ background: "var(--bg)" }}
    >
      {/* Mobile header */}
      <div className="flex items-center justify-between pt-4 pb-1 md:hidden">
        <div className="flex items-center gap-2">
          <div className="h-13 w-13 animate-pulse rounded-lg" style={{ background: "var(--surface-2)" }} />
          <div className="flex flex-col gap-1">
            <Bar w={36} h={10} />
            <Bar w={60} h={14} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="h-10 w-10 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
      </div>

      {/* Greeting */}
      <div className="space-y-1.5 pb-1 pt-2 md:pt-3">
        <Bar w={100} h={14} />
        <Bar w={160} h={24} />
      </div>

      {/* Headline */}
      <div className="space-y-2 pb-2 pt-1">
        <Bar w="60%" h={32} />
        <Bar w="45%" h={32} />
      </div>

      {/* Mobile: carousel card placeholders */}
      <div className="md:hidden -mx-4 overflow-hidden pb-3">
        <div className="flex gap-3 pl-4" style={{ paddingRight: "16px" }}>
          <CardPulse
            style={{
              width: "78vw",
              maxWidth: "370px",
              height: "clamp(240px,44dvh,360px)",
              flexShrink: 0,
            }}
          />
          <CardPulse
            style={{
              width: "78vw",
              maxWidth: "370px",
              height: "clamp(240px,44dvh,360px)",
              flexShrink: 0,
              opacity: 0.45,
            }}
          />
        </div>
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-full"
              style={{
                height: "7px",
                width: i === 0 ? "28px" : "7px",
                background: i === 0 ? "var(--olive)" : "var(--border-c)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Desktop: 6-col grid card placeholders */}
      <div className="hidden flex-1 min-h-0 pb-5 md:grid md:grid-cols-6 md:grid-rows-[1fr_1fr] md:gap-5">
        <CardPulse className="col-span-2 row-span-2" />
        <CardPulse style={{ gridColumn: "3 / span 2", gridRow: "1 / span 1" }} />
        <CardPulse style={{ gridColumn: "5 / span 2", gridRow: "1 / span 2" }} />
        <CardPulse style={{ gridColumn: "3 / span 2", gridRow: "2 / span 1" }} />
      </div>
    </div>
  );
}
