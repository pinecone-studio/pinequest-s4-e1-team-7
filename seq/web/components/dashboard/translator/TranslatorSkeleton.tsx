import { LogoLoader } from "../shared/LogoLoader";

function Bar({ w, h = 5 }: { w: number | string; h?: number }) {
  return (
    <div
      className="animate-pulse rounded-full"
      style={{ width: w, height: h, background: "var(--surface-2)" }}
    />
  );
}

export function TranslatorSkeleton() {
  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg)" }}>
      {/* PageHeader skeleton */}
      <div className="mx-auto w-full max-w-lg px-4 pt-4 pb-3 lg:max-w-none lg:px-10 xl:px-16">
        <div className="flex h-14 items-center">
          <div className="h-10 w-10 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="mx-auto">
            <Bar w={128} h={20} />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
      </div>

      {/* Content: camera + card */}
      <div className="mx-auto flex w-full flex-1 min-h-0 flex-col gap-4 px-4 pb-[max(calc(env(safe-area-inset-bottom)+4rem),5.5rem)] md:pb-0 lg:grid lg:grid-cols-2 lg:grid-rows-[1fr_auto] lg:gap-5 lg:px-10 xl:px-16">
        {/* Camera box */}
        <div
          className="h-[220px] shrink-0 overflow-hidden rounded-[22px] sm:h-[260px] lg:h-auto lg:min-h-[440px] lg:col-start-1 lg:row-start-1"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
        >
          <div className="flex h-full items-center justify-center">
            <LogoLoader size="sm" />
          </div>
        </div>

        {/* Text card */}
        <div
          className="flex min-h-[180px] flex-1 flex-col gap-3 overflow-hidden rounded-[22px] p-5 lg:col-start-2 lg:row-start-1"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
        >
          <Bar w={80} h={12} />
          <div className="flex flex-1 flex-col gap-2 pt-2">
            <Bar w="75%" />
            <Bar w="55%" />
            <Bar w="65%" />
          </div>
        </div>

        {/* Control bar */}
        <div
          className="hidden h-[60px] animate-pulse rounded-[24px] lg:col-span-2 lg:row-start-2 lg:block"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
        />
      </div>
    </div>
  );
}
