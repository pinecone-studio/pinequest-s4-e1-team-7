export function DashboardSkeleton() {
  return (
    <div className="flex h-dvh flex-col" style={{ background: "var(--bg)" }}>
      <div
        className="hidden h-[72px] shrink-0 md:block"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border-c)" }}
      />
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="h-8 w-8 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
      </div>
    </div>
  );
}
