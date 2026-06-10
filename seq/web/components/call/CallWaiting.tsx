import type { PeerStatus } from "@/hooks/useCallPeer";

type Props = {
  status: PeerStatus;
  message: string;
};

/** Зөвхөн холболтын алдаа гарсан үед харуулна. Chat-аар залгах тул хүлээх modal байхгүй. */
export function CallWaiting({ status, message }: Props) {
  if (status !== "error") return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55 px-6 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-2xl bg-black/50 p-5 text-center backdrop-blur-md">
        <p className="text-lg font-semibold text-white">Холбогдож чадсангүй</p>
        {message && <p className="mt-2 text-sm leading-relaxed text-white/60">{message}</p>}
      </div>
    </div>
  );
}
