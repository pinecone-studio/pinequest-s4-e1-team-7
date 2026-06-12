function ConvRow({ nameW, msgW }: { nameW: string; msgW: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] px-3 py-2.5">
      <div
        className="h-11 w-11 shrink-0 animate-pulse rounded-full"
        style={{ background: "var(--surface-2)" }}
      />
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <div
          className="animate-pulse rounded-full"
          style={{ height: 12, width: nameW, background: "var(--surface-2)" }}
        />
        <div
          className="animate-pulse rounded-full"
          style={{ height: 11, width: msgW, background: "var(--surface-2)", opacity: 0.6 }}
        />
      </div>
      <div
        className="shrink-0 animate-pulse rounded-full"
        style={{ height: 10, width: 32, background: "var(--surface-2)", opacity: 0.5 }}
      />
    </div>
  );
}

const ROWS: { nameW: string; msgW: string }[] = [
  { nameW: "45%", msgW: "70%" },
  { nameW: "60%", msgW: "55%" },
  { nameW: "35%", msgW: "80%" },
  { nameW: "50%", msgW: "65%" },
  { nameW: "40%", msgW: "72%" },
  { nameW: "55%", msgW: "50%" },
];

export function MessagesSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: "var(--bg)" }}>
      {/* Mobile page header */}
      <div className="shrink-0 px-4 md:hidden">
        <div className="flex items-center pb-2 pt-5">
          <div
            className="h-10 w-10 animate-pulse rounded-full"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
          />
          <div
            className="mx-auto animate-pulse rounded-full"
            style={{ height: 17, width: 48, background: "var(--surface-2)" }}
          />
          <div
            className="h-10 w-10 animate-pulse rounded-full"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="flex min-h-0 flex-1 gap-4 px-4 pb-3 pt-0 md:gap-3 md:p-4 lg:px-10 lg:pb-4 xl:px-16">
        {/* Sidebar card */}
        <div
          className="flex min-h-0 w-full flex-col overflow-hidden rounded-[18px] md:w-[min(340px,36vw)]"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
        >
          {/* Search bar */}
          <div className="px-3 py-3">
            <div
              className="h-10 animate-pulse rounded-xl"
              style={{ background: "var(--surface-2)" }}
            />
          </div>
          {/* Conversation rows */}
          <div className="flex flex-col px-2">
            {ROWS.map((r, i) => (
              <ConvRow key={i} nameW={r.nameW} msgW={r.msgW} />
            ))}
          </div>
        </div>

        {/* Main section — desktop only */}
        <section
          className="hidden min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-[18px] md:flex"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
        >
          <div
            className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
          />
          <div
            className="animate-pulse rounded-full"
            style={{ height: 14, width: 140, background: "var(--surface-2)" }}
          />
          <div
            className="animate-pulse rounded-full"
            style={{ height: 12, width: 220, background: "var(--surface-2)", opacity: 0.6 }}
          />
        </section>
      </div>
    </div>
  );
}
