import { LogoLoader } from "../shared/LogoLoader";

export function DictSkeleton() {
  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg)" }}>
      {/* Header + tabs */}
      <div className="mx-auto w-full px-4 md:px-6 lg:px-10 xl:px-16">
        <div className="flex items-center pb-2 pt-5">
          <div className="h-10 w-10 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="mx-auto h-5 w-28 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="h-10 w-10 opacity-0" />
        </div>
        <div className="flex gap-2 pb-3">
          {[80, 64, 96].map((w) => (
            <div
              key={w}
              className="h-9 animate-pulse rounded-full"
              style={{ width: w, background: "var(--surface-2)" }}
            />
          ))}
        </div>
      </div>

      {/* Strip skeleton */}
      <div className="flex flex-1 min-h-0 items-center justify-center px-6 md:px-8 lg:px-12">
        <div className="relative flex h-[55vh] w-full gap-1 md:h-full md:gap-2">
          {/* Collapsed cards */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-8 animate-pulse rounded-[28px] md:w-16"
              style={{ background: "var(--surface-2)" }}
            />
          ))}
          {/* Active (wide) card with logo */}
          <div
            className="flex flex-1 items-center justify-center animate-pulse rounded-[28px]"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
          >
            <LogoLoader size="sm" />
          </div>
          {/* More collapsed cards */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i + 6}
              className="w-8 animate-pulse rounded-[28px] md:w-16"
              style={{ background: "var(--surface-2)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
