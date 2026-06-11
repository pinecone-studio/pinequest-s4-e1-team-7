export default function DictLoading() {
  return (
    <div className="flex h-full flex-col animate-pulse" style={{ background: "var(--bg)" }}>
      {/* header + tabs */}
      <div className="mx-auto w-full px-4 md:px-6 lg:px-10 xl:px-16">
        <div className="flex items-center pb-2 pt-5">
          <div className="h-10 w-10 rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="mx-auto h-5 w-28 rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="h-10 w-10 rounded-full opacity-0" />
        </div>
        <div className="flex gap-2 pb-3">
          {[80, 64, 96].map((w) => (
            <div key={w} className="h-9 rounded-full" style={{ width: w, background: "var(--surface-2)" }} />
          ))}
        </div>
      </div>

      {/* strip skeleton */}
      <div className="flex flex-1 min-h-0 items-center justify-center px-6 md:px-8 lg:px-12">
        <div className="flex h-[55vh] w-full gap-1 md:h-full md:gap-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex-1 rounded-[28px]" style={{ background: "var(--surface-2)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
