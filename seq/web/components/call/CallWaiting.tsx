import { VideoCameraIcon, LinkIcon, CheckIcon } from "@heroicons/react/24/solid";
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
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6" style={{ background: "var(--bg)" }}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "var(--olive-soft)" }}>
        <VideoCameraIcon className="h-10 w-10" style={{ color: "var(--olive)" }} />
      </div>
      <div className="text-center">
        <p className="text-[18px] font-bold" style={{ color: "var(--text)" }}>
          {status === "error" ? "Алдаа гарлаа" : status === "connecting" ? "Холбогдож байна…" : "Хүлээж байна"}
        </p>
        {message && <p className="mt-1 text-[13px]" style={{ color: "var(--text-3)" }}>{message}</p>}
      </div>
      {role === "host" && shareLink && (
        <button onClick={onCopyLink}
          className="flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-opacity active:opacity-70"
          style={{ background: "var(--olive)", color: "black" }}>
          {linkCopied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
          {linkCopied ? "Хуулагдлаа!" : "Холбоос хуулах"}
        </button>
      )}
    </div>
  );
}
