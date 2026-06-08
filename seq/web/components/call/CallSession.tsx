"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraView } from "@/components/CameraView";
import { CallControls } from "./CallControls";
import { CallWaiting } from "./CallWaiting";
import { CallCaptionHistory } from "./CallCaptionHistory";
import { CallSubtitles } from "./CallSubtitles";
import { CallTopBar } from "./CallTopBar";
import { useCallCaptions } from "@/hooks/useCallCaptions";
import { useCallPeer } from "@/hooks/useCallPeer";
import { useIsDesktop } from "@/hooks/useBreakpoint";
import { useSignDetection } from "@/hooks/useSignDetection";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { DEMO_CALL_ROOM } from "@/lib/call-constants";
import { releaseAllCameras } from "@/lib/camera-registry";
import { VideoCameraSlashIcon } from "@heroicons/react/24/solid";

const fmtDur = (s: number) => {
  const m = Math.floor(s / 60);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(m)}:${p(s % 60)}`;
};

const STATUS_LABEL: Record<string, string> = {
  connected: "Холбогдсон",
  connecting: "Холбогдож байна...",
  error: "Алдаа",
  idle: "Холболтыг хүлээж байна...",
};

export function CallSession({ roomId }: { roomId: string }) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const effectiveRoomId = DEMO_CALL_ROOM;
  const peerHint = useSearchParams().get("peer") ?? "";
  const [linkCopied, setLinkCopied] = useState(false);
  const {
    active,
    history,
    onMyWord,
    onTheirCaption,
    onMyVoiceInterim,
    onMyVoiceFinal,
    onTheirPhrase,
  } = useCallCaptions();
  const [camMuted, setCamMuted] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const connectedAtRef = useRef<number | null>(null);
  const leavingRef = useRef(false);
  const leaveSessionRef = useRef<() => void>(() => {});

  const {
    role,
    status,
    message,
    hasRemoteStream,
    remoteVideoRef,
    sendCaption,
    sendPhrase,
    toggleCam,
    onStreamReady,
    hangUp,
  } = useCallPeer(
    effectiveRoomId,
    { onCaption: onTheirCaption, onPhrase: onTheirPhrase },
    peerHint,
    () => leaveSessionRef.current()
  );

  const connected = status === "connected";

  const onWord = useCallback(
    (word: string) => {
      const next = onMyWord(word);
      sendCaption(next);
    },
    [onMyWord, sendCaption]
  );

  const handleSpeech = useCallback(
    (text: string, final: boolean) => {
      if (final) {
        const phrase = onMyVoiceFinal(text);
        if (phrase) sendPhrase(phrase);
      } else {
        onMyVoiceInterim(text);
      }
    },
    [onMyVoiceFinal, onMyVoiceInterim, sendPhrase]
  );

  const { listening, start, stop, supported } = useSpeechRecognition(handleSpeech);

  const { modelReady, modelError, modelLoading, startLoad, handleLandmarks } =
    useSignDetection(onWord);

  const leaveSession = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    stop();
    hangUp();
    releaseAllCameras();
    router.replace("/dashboard/call");
  }, [hangUp, router, stop]);

  useEffect(() => {
    leaveSessionRef.current = leaveSession;
  }, [leaveSession]);

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

  useEffect(() => () => stop(), [stop]);

  useEffect(() => () => releaseAllCameras(), []);

  useEffect(() => {
    if (roomId !== effectiveRoomId) {
      router.replace(`/call/${effectiveRoomId}`);
    }
  }, [effectiveRoomId, roomId, router]);

  const shareLink = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/call/${encodeURIComponent(effectiveRoomId)}`
        : "",
    [effectiveRoomId]
  );

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  }, [shareLink]);

  const handleCamToggle = () => {
    toggleCam();
    setCamMuted((m) => !m);
  };

  const handleVoiceToggle = () => {
    if (listening) stop();
    else start();
  };

  const statusDot =
    status === "connected"
      ? "connected"
      : status === "connecting"
        ? "connecting"
        : status === "error"
          ? "error"
          : "idle";

  const previewFit = isDesktop ? "cover" : "contain";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-black">
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
        onBack={leaveSession}
      />

      {(modelError || modelLoading) && !connected && (
        <p className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 text-center text-xs text-white/50">
          {modelError ?? "Ачааллаж байна…"}
        </p>
      )}

      {/* Камер — mobile: дээд талд contain, md+: бүтэн дэлгэц cover */}
      <div className="relative z-0 aspect-[4/3] w-full max-h-[min(42dvh,72vw)] min-h-[200px] shrink-0 bg-black md:absolute md:inset-0 md:aspect-auto md:max-h-none">
        <CameraView
          fullscreen
          showPreview
          mirrorPreview
          mirrorDetect
          previewFit={previewFit}
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

        <div
          className={`absolute left-3 top-3 z-20 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-lg transition-opacity max-md:h-[140px] max-md:w-[105px] md:left-4 md:top-[calc(env(safe-area-inset-top)+3.5rem)] md:h-[240px] md:w-[180px] ${
            connected && hasRemoteStream ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <video ref={remoteVideoRef} playsInline className="h-full w-full object-cover" />
        </div>

        <div className="md:hidden">
          <CallSubtitles
            layout="mobile"
            speaker={active?.speaker ?? null}
            text={active?.text ?? ""}
          />
        </div>
      </div>

      {/* Mobile — chat доор, scroll */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
        <CallCaptionHistory
          entries={history}
          variant="mobile"
          open={chatOpen}
          onToggle={() => setChatOpen((o) => !o)}
        />
      </div>

      <CallCaptionHistory
        entries={history}
        variant="desktop"
        open={chatOpen}
        onToggle={() => setChatOpen((o) => !o)}
      />
      <CallSubtitles
        layout="desktop"
        speaker={active?.speaker ?? null}
        text={active?.text ?? ""}
        chatOpen={chatOpen}
      />

      <div className="z-40 shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 md:absolute md:inset-x-0 md:bottom-0 md:px-6 md:pt-4">
        <CallControls
          camMuted={camMuted}
          voiceListening={listening}
          voiceSupported={supported}
          onCamToggle={handleCamToggle}
          onVoiceToggle={handleVoiceToggle}
          onEnd={leaveSession}
        />
      </div>
    </div>
  );
}
