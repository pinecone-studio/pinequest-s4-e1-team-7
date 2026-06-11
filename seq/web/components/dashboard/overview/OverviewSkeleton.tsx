import { LogoLoader } from "../shared/LogoLoader";

function Bar({ w, h = 14 }: { w: number | string; h?: number }) {
  return (
    <div
      className="animate-pulse rounded-full"
      style={{ width: w, height: h, background: "var(--surface-2)" }}
    />
  );
}

export function OverviewSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden px-4 md:px-6 lg:px-10 xl:px-16"
      style={{ background: "var(--bg)" }}
    >
      {/* Mobile header skeleton */}
      <div className="flex items-center justify-between pt-4 pb-1 md:hidden">
        <div className="flex items-center gap-2">
          <div className="h-13 w-13 animate-pulse rounded-lg" style={{ background: "var(--surface-2)" }} />
          <div className="flex flex-col gap-1">
            <Bar w={60} h={12} />
            <Bar w={50} h={12} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="h-10 w-10 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
      </div>

      {/* Greeting */}
      <div className="pb-1 pt-2 md:pt-3 space-y-1.5">
        <Bar w={100} h={14} />
        <Bar w={160} h={24} />
      </div>

      {/* Headline */}
      <div className="pb-2 pt-1 space-y-2">
        <Bar w="60%" h={32} />
        <Bar w="45%" h={32} />
      </div>

      {/* Feature cards loader */}
      <div className="flex flex-1 min-h-0 items-center justify-center pb-[max(calc(env(safe-area-inset-bottom)+4rem),5.5rem)] md:pb-5">
        <LogoLoader size="md" />
      </div>
    </div>
  );
}
