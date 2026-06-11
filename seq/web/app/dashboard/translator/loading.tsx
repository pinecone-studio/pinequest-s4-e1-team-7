export default function TranslatorLoading() {
  return (
    <div className="flex h-full flex-col animate-pulse" style={{ background: "var(--bg)" }}>
      <div className="mx-auto w-full max-w-lg px-4 pt-5 lg:max-w-none lg:px-10 xl:px-16">
        {/* header */}
        <div className="flex items-center pb-2">
          <div className="h-10 w-10 rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="mx-auto h-5 w-32 rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="h-10 w-10 rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
      </div>

      <div className="mx-auto flex w-full flex-1 min-h-0 flex-col gap-4 px-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:px-10 xl:px-16">
        {/* camera box */}
        <div className="h-[220px] overflow-hidden rounded-[22px] sm:h-[260px] lg:h-auto lg:min-h-[440px]"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }} />
        {/* text area */}
        <div className="flex-1 rounded-[22px] lg:flex-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }} />
      </div>
    </div>
  );
}
