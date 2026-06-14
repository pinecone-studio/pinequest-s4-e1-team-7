const Bone = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl ${className}`} style={{ background: "var(--surface-2)" }} />
);

export const AuthSkeleton = () => (
  <div className="flex min-h-screen w-full" style={{ background: "var(--bg)" }}>
    <div className="hidden lg:block lg:w-5/12 xl:w-1/2" style={{ background: "var(--surface-2)", opacity: 0.4 }} />

    <div className="flex w-full flex-col border-l lg:w-7/12 xl:w-1/2" style={{ background: "var(--surface)", borderColor: "var(--border-c)" }}>
      <div className="flex items-center justify-between border-b px-10 pt-10 pb-4" style={{ borderColor: "var(--border-c)" }}>
        <div className="flex items-center gap-2">
          <Bone className="h-10 w-28" />
          <Bone className="h-10 w-20" />
        </div>
        <Bone className="h-10 w-10 rounded-full" />
      </div>

      <div className="flex flex-1 items-center justify-center px-10 py-8">
        <div className="w-full max-w-md space-y-5">
          <div className="space-y-2 mb-8">
            <Bone className="h-9 w-40" />
            <Bone className="h-4 w-72" />
          </div>
          <div className="space-y-1.5">
            <Bone className="h-3 w-24" />
            <Bone className="h-11 w-full" />
          </div>
          <div className="space-y-1.5">
            <Bone className="h-3 w-16" />
            <Bone className="h-11 w-full" />
          </div>
          <Bone className="h-12 w-full mt-2" />
        </div>
      </div>
    </div>
  </div>
);
