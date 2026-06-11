import { LogoLoader } from "../shared/LogoLoader";

export function VoiceSkeleton() {
  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg)" }}>
      {/* PageHeader skeleton */}
      <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-3 lg:max-w-none lg:px-10 xl:px-16">
        <div className="flex h-14 items-center">
          <div className="h-10 w-10 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
          <div
            className="mx-auto h-5 w-40 animate-pulse rounded-full"
            style={{ background: "var(--surface-2)" }}
          />
          <div className="h-10 w-10" />
        </div>
      </div>

      {/* Mic button placeholder */}
      <div className="flex items-end justify-center gap-5 py-4">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-[100px] w-[100px] animate-pulse rounded-full md:h-[120px] md:w-[120px]"
            style={{ background: "var(--surface-2)" }}
          />
          <div className="h-3 w-24 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
      </div>

      {/* Transcript panel */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-[max(calc(env(safe-area-inset-bottom)+4rem),5.5rem)] md:pb-4 lg:max-w-none lg:px-10 xl:px-16">
        <div
          className="flex h-full flex-col gap-3 overflow-hidden rounded-[22px] p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
        >
          <div className="flex items-center justify-center flex-1">
            <LogoLoader size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
