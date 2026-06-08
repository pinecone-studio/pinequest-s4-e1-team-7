import { LinkIcon, CheckIcon } from "@heroicons/react/24/solid";
import type { PeerStatus } from "@/hooks/useCallPeer";

type Props = {
  role: "host" | "guest" | null;
  status: PeerStatus;
  message: string;
  shareLink: string;
  onCopyLink: () => void;
  linkCopied: boolean;
};

export function CallWaiting({ role, status, message, shareLink, onCopyLink, linkCopied }: Props) {
  if (status === "connected") return null;

  const title =
    status === "error"
      ? "Холбогдож чадсангүй"
      : status === "connecting"
        ? "Холбогдож байна…"
        : role === "host"
          ? "Хамтрагч хүлээж байна"
          : "Дуудлага эхэлнэ";

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55 px-6 pb-[calc(5rem+env(safe-area-inset-bottom))] backdrop-blur-[2px]">
      <div className="w-full max-w-sm -translate-y-10 rounded-2xl bg-black/50 p-5 text-center backdrop-blur-md">
        <p className="text-lg font-semibold text-white">{title}</p>
        {message && <p className="mt-2 text-sm leading-relaxed text-white/60">{message}</p>}

        {role === "host" && shareLink && status !== "error" && (
          <button
            type="button"
            onClick={onCopyLink}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--olive)] px-5 py-3.5 text-[15px] font-semibold text-black transition active:scale-[0.98]"
          >
            {linkCopied ? <CheckIcon className="h-5 w-5" /> : <LinkIcon className="h-5 w-5" />}
            {linkCopied ? "Хуулагдлаа!" : "Холбоос хуулах"}
          </button>
        )}

        {role === "guest" && status !== "error" && (
          <p className="mt-4 text-xs text-white/40">
            Host эхлээд дуудлага нээсэн байх ёстой
          </p>
        )}
      </div>
    </div>
  );
}
