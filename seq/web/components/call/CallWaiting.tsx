import type { PeerStatus } from "@/hooks/useCallPeer";

type Props = {
  status: PeerStatus;
  message: string;
};

export function CallWaiting({ status, message }: Props) {
  if (status !== "error") return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 px-6 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl p-6 text-center backdrop-blur-md"
        style={{
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "hsl(var(--destructive)/0.18)", border: "1px solid hsl(var(--destructive)/0.4)" }}
        >
          <span style={{ color: "hsl(var(--destructive))", fontSize: 22 }}>✕</span>
        </div>
        <p
          className="text-[17px] font-bold text-white"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Холбогдож чадсангүй
        </p>
        {message && (
          <p
            className="mt-2 text-[14px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-sans)" }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
