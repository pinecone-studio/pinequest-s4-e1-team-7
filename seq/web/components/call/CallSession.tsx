"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { CameraView } from "@/components/CameraView";
import { VoiceWave } from "@/components/ui/voice-wave";
import { CallControls } from "./CallControls";
import { CallWaiting } from "./CallWaiting";
import { CaptionOverlay } from "./CaptionOverlay";
import { useCallPeer } from "@/hooks/useCallPeer";
import { useSignDetection } from "@/hooks/useSignDetection";
import { VideoCameraSlashIcon } from "@heroicons/react/24/solid";

const fmtDur = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${p(h)}:${p(m)}:${p(s % 60)}` : `${p(m)}:${p(s % 60)}`;
};
const appendWord = (prev: string, w: string) => {
  const t = prev.trim();
  if (!t) return w;
  if (t.split(/\s+/).pop() === w) return prev;
  return `${t} ${w}`;
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

  const { role, status, message, remoteVideoRef, connRef, callRef, sendCaption, toggleCam, toggleMic, onStreamReady } =
    useCallPeer(roomId, setTheirCaption, peerHint);
  const connected = status === "connected";

  useEffect(() => {
    if (connected && !connectedAtRef.current) connectedAtRef.current = Date.now();
    else if (!connected) { connectedAtRef.current = null; setElapsed(0); }
  }, [connected]);

  useEffect(() => {
    if (!connected) return;
    const id = setInterval(() => {
      if (connectedAtRef.current) setElapsed(Math.floor((Date.now() - connectedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [connected]);

  const onWord = useCallback(
    (word: string) => { setMyCaption((prev) => { const next = appendWord(prev, word); sendCaption(next); return next; }); },
    [sendCaption],
  );
  const { modelReady, startLoad, handleLandmarks, reset } = useSignDetection(onWord);
  const clearCaption = useCallback(() => { setMyCaption(""); sendCaption(""); reset(); }, [sendCaption, reset]);

  const shareLink = useMemo(
    () => typeof window !== "undefined" ? `${window.location.origin}/call/${encodeURIComponent(roomId)}` : "",
    [roomId],
  );
  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  }, [shareLink]);
  const endCall = useCallback(() => { connRef.current?.close(); callRef.current?.close(); router.back(); }, [connRef, callRef, router]);

  const handleCamToggle = () => { toggleCam(); setCamMuted((m) => !m); };
  const handleMicToggle = () => { toggleMic(); setMicMuted((m) => !m); };

  return (
    <div className="fixed inset-0 z-[60] bg-black md:relative md:inset-auto md:z-auto md:h-[calc(100dvh-56px)] md:overflow-hidden md:rounded-2xl">
      <video ref={remoteVideoRef} playsInline autoPlay className="absolute inset-0 h-full w-full object-cover" />

      <CallWaiting role={role} status={status} message={message} shareLink={shareLink} onCopyLink={copyLink} linkCopied={linkCopied} />

      <div className="absolute inset-x-4 top-0 z-20 mt-[max(env(safe-area-inset-top),16px)]">
        <div className="rounded-[24px] p-4" style={{ background: "var(--glass)", backdropFilter: "blur(24px)", border: "1px solid var(--glass-border)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold" style={{ color: "var(--text)" }}>Видео дуудлага</p>
            <div className="flex h-4 items-end gap-[2px]">
              {[6, 12, 8, 14, 10].map((h, i) => (
                <span key={i} className="w-[3px] rounded-full"
                  style={{ height: connected ? undefined : "3px", background: connected ? "var(--olive)" : "var(--border-c)", "--wh": `${h}px`, animation: connected ? `wave ${0.5 + i * 0.12}s ease-in-out infinite` : "none", animationDelay: `${i * 0.1}s` } as CSSProperties} />
              ))}
            </div>
            <p className="font-mono text-[14px] font-semibold" style={{ color: connected ? "#e53535" : "var(--text-3)" }}>
              {connected ? fmtDur(elapsed) : "--:--"}
            </p>
          </div>
          <div className="my-3"><VoiceWave active={connected} color="var(--teal-2)" /></div>
          <CallControls camMuted={camMuted} micMuted={micMuted} onCamToggle={handleCamToggle} onMicToggle={handleMicToggle} onEnd={endCall}
            onVolumeChange={(v) => { if (remoteVideoRef.current) remoteVideoRef.current.volume = v; }} />
        </div>
      </div>

      {connected && (
        <div className="absolute bottom-20 right-4 z-20 w-[108px] overflow-hidden rounded-[18px] shadow-xl"
          style={{ border: "2px solid var(--glass-border)", aspectRatio: "3/4" }}>
          <div className="relative h-full w-full bg-black">
            <CameraView onLandmarks={handleLandmarks} onStreamReady={onStreamReady} onMediaPipeReady={startLoad}
              inferenceActive={modelReady} mirror width={280} height={380} fullscreen />
            {camMuted && <div className="absolute inset-0 flex items-center justify-center bg-zinc-900"><VideoCameraSlashIcon className="h-8 w-8 text-zinc-500" /></div>}
          </div>
        </div>
      )}

      <CaptionOverlay myCaption={myCaption} theirCaption={theirCaption} onClearMine={clearCaption} />
    </div>
  );
}
