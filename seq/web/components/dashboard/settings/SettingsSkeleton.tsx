import { LogoLoader } from "../shared/LogoLoader";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4 overflow-hidden rounded-[22px] p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
    >
      {children}
    </div>
  );
}

function Bar({ w, h = 14 }: { w: number | string; h?: number }) {
  return (
    <div
      className="animate-pulse rounded-full"
      style={{ width: w, height: h, background: "var(--surface-2)" }}
    />
  );
}

export function SettingsSkeleton() {
  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-lg px-4 pt-5 md:px-6 pb-[max(calc(env(safe-area-inset-bottom)+1rem),1.5rem)] lg:max-w-2xl lg:px-10 xl:px-16">

        {/* Logo centered at top */}
        <div className="flex justify-center pb-6 pt-2">
          <LogoLoader size="sm" />
        </div>

        {/* Profile card */}
        <Card>
          <Bar w={64} h={10} />
          <div className="mt-4 flex items-start gap-4">
            <div className="h-[72px] w-[72px] animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
            <div className="flex-1 space-y-3">
              <Bar w="100%" h={40} />
              <Bar w="100%" h={40} />
              <Bar w="100%" h={40} />
            </div>
          </div>
        </Card>

        {/* Theme card */}
        <Card>
          <Bar w={64} h={10} />
          <div className="mt-4 flex items-center justify-between">
            <Bar w="55%" h={18} />
            <div className="h-6 w-11 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
          </div>
        </Card>

        {/* Voice card */}
        <Card>
          <Bar w={80} h={10} />
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Bar w="50%" h={18} />
              <div className="h-6 w-11 animate-pulse rounded-full" style={{ background: "var(--surface-2)" }} />
            </div>
            <div className="flex gap-2 pt-1">
              <Bar w="48%" h={36} />
              <Bar w="48%" h={36} />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => <Bar key={i} w="32%" h={36} />)}
            </div>
          </div>
        </Card>

        {/* Logout button */}
        <div className="h-[56px] animate-pulse rounded-[22px]" style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }} />
      </div>
    </div>
  );
}
