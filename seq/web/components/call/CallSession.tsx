"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraView } from "@/components/CameraView";
import { CallControls } from "./CallControls";
import { CallWaiting } from "./CallWaiting";
import { CallSubtitles } from "./CallSubtitles";
import { CallTopBar } from "./CallTopBar";
import { useCallPeer } from "@/hooks/useCallPeer";
import { useSignDetection } from "@/hooks/useSignDetection";
import { VideoCameraSlashIcon } from "@heroicons/react/24/solid";

const fmtDur = (s: number) => {
  const m = Math.floor(s / 60);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(m)}:${p(s % 60)}`;
};

const appendWord = (prev: string, w: string) => {
  const t = prev.trim();
  if (!t) return w;
  if (t.split(/\s+/).pop() === w) return prev;
  return `${t} ${w}`;
};

const STATUS_LABEL: Record<string, string> = {
  connected: "Холбогдсон",
  connecting: "Холбогдож байна…",
  error: "Алдаа",
  idle: "Хүлээж байна",
};

export function CallSession({ roomId }: { roomId: string }) {
  const router = useRouter();
  const peerHint = useSearchParams().get("peer") ?? "";
  const [theirCaption, setTheirCaption] = useState("");
  const [myCaption, setMyCaption] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [camMuted, setCamMuted] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const connectedAtRef = useRef<number | null>(null);

  const {
    role,
    status,
    message,
    hasRemoteStream,
    remoteVideoRef,
    connRef,
    callRef,
    sendCaption,
    toggleCam,
    toggleMic,
    onStreamReady,
  } = useCallPeer(roomId, setTheirCaption, peerHint);

  const connected = status === "connected";

  useEffect(() => {
    if (connected && !connectedAtRef.current) connectedAtRef.current = Date.now();
    else if (!connected) {
      connectedAtRef.current = null;
      setElapsed(0);
    }
  }, [connected]);

  useEffect(() => {
    if (!connected) return;
    const id = setInterval(() => {
      if (connectedAtRef.current) {
        setElapsed(Math.floor((Date.now() - connectedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [connected]);

  const onWord = useCallback(
    (word: string) => {
      setMyCaption((prev) => {
        const next = appendWord(prev, word);
        sendCaption(next);
        return next;
      });
    },
    [sendCaption]
  );

  const { modelReady, modelError, modelLoading, startLoad, handleLandmarks } =
    useSignDetection(onWord);

  const shareLink = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/call/${encodeURIComponent(roomId)}`
        : "",
    [roomId]
  );

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  }, [shareLink]);

  const endCall = useCallback(() => {
    connRef.current?.close();
    callRef.current?.close();
    router.back();
  }, [connRef, callRef, router]);

  const handleCamToggle = () => {
    toggleCam();
    setCamMuted((m) => !m);
  };
  const handleMicToggle = () => {
    toggleMic();
    setMicMuted((m) => !m);
  };

  const statusDot =
    status === "connected"
      ? "connected"
      : status === "connecting"
        ? "connecting"
        : status === "error"
          ? "error"
          : "idle";

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-black">
      {/* Үндсэн камер — preview + detect хоёуланд ижил flip (сургалттай нийцнэ) */}
      <div className="absolute inset-0 z-0">
        <CameraView
          fullscreen
          showPreview
          mirrorPreview
          mirrorDetect
          onLandmarks={handleLandmarks}
          onStreamReady={onStreamReady}
          onMediaPipeReady={startLoad}
          inferenceActive={modelReady}
        />
        {camMuted && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
            <VideoCameraSlashIcon className="h-12 w-12 text-zinc-500" />
          </div>
        )}
      </div>

      {/* Хамтрагч — PiP, mirror ГҮЙ */}
      <div
        className={`absolute left-4 top-[calc(env(safe-area-inset-top)+3.5rem)] z-20 h-[120px] w-[90px] overflow-hidden rounded-2xl border border-white/20 bg-black shadow-lg transition-opacity ${
          connected && hasRemoteStream ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <video ref={remoteVideoRef} playsInline className="h-full w-full object-cover" />
      </div>

      <CallWaiting
        role={role}
        status={status}
        message={message}
        shareLink={shareLink}
        onCopyLink={copyLink}
        linkCopied={linkCopied}
      />

      <CallTopBar
        statusLabel={STATUS_LABEL[status] ?? "…"}
        statusDot={statusDot}
        timer={connected ? fmtDur(elapsed) : undefined}
        onBack={() => router.back()}
      />

      {(modelError || modelLoading) && !connected && (
        <p className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 text-center text-xs text-white/50">
          {modelError ?? "Дохионы загвар ачаалж байна…"}
        </p>
      )}

      <CallSubtitles myText={myCaption} theirText={theirCaption} />

      <div className="absolute inset-x-0 bottom-0 z-40 px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-4">
        <CallControls
          camMuted={camMuted}
          micMuted={micMuted}
          onCamToggle={handleCamToggle}
          onMicToggle={handleMicToggle}
          onEnd={endCall}
          onVolumeChange={(v) => {
            if (remoteVideoRef.current) remoteVideoRef.current.volume = v;
          }}
        />
      </div>
    </div>
  );
}
