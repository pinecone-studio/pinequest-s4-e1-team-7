"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { sendCallEnded, fetchMessages } from "@/lib/chat-api";
import { useChatRealtime } from "@/context/ChatRealtimeContext";
import { CALL_DECLINE_POLL_MS, createAdaptivePoller } from "@/lib/poll-schedule";
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
  const searchParams = useSearchParams();
  const asRole = searchParams.get("as") === "guest" ? "guest" : "host";
  const returnTo = searchParams.get("returnTo") ?? "/dashboard/call";
  const peerHint = searchParams.get("peer") ?? "";
  const [hostNotice, setHostNotice] = useState<string | null>(null);
  const callStartedAtRef = useRef(Date.now());
  const { connected: realtimeConnected, subscribe } = useChatRealtime();
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
  const elapsedRef = useRef(0);
  const leavingRef = useRef(false);
  const leaveSessionRef = useRef<(reportEnd?: boolean) => void>(() => {});

  const {
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
    roomId,
    { onCaption: onTheirCaption, onPhrase: onTheirPhrase },
    peerHint,
    () => leaveSessionRef.current(false),
    asRole,
  );

  const connected = status === "connected";

  const onWord = useCallback(
    (word: string) => {
      const next = onMyWord(word);
      sendCaption(next);
    },
    [onMyWord, sendCaption],
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
    [onMyVoiceFinal, onMyVoiceInterim, sendPhrase],
  );

  const { listening, start, stop, supported } = useSpeechRecognition(handleSpeech);

  const { modelReady, modelError, modelLoading, startLoad, handleLandmarks, reset } =
    useSignDetection(onWord);

  useEffect(() => {
    if (!connected) {
      reset();
      return;
    }
    startLoad();
  }, [connected, reset, startLoad]);

  const leaveSession = useCallback(
    async (reportEnd = false) => {
      if (leavingRef.current) return;
      leavingRef.current = true;

      const connectedMs = connectedAtRef.current ? Date.now() - connectedAtRef.current : 0;
      const durationMs = connectedMs > 0 ? connectedMs : elapsedRef.current * 1000;

      stop();
      hangUp();
      releaseAllCameras();

      if (reportEnd && roomId.startsWith("c_") && durationMs >= 1000) {
        try {
          await sendCallEnded(roomId, durationMs);
        } catch {
          /* navigation may still proceed */
        }
      }

      router.replace(returnTo);
    },
    [hangUp, returnTo, roomId, router, stop],
  );

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    leaveSessionRef.current = (reportEnd) => {
      void leaveSession(reportEnd);
    };
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

  // Host: exit waiting room when callee declines (incremental poll only)
  useEffect(() => {
    if (asRole !== "host" || connected || !roomId.startsWith("c_") || leavingRef.current) return;

    let afterId = 0;

    const handleDecline = (rows: Awaited<ReturnType<typeof fetchMessages>>) => {
      const since = callStartedAtRef.current - 3000;
      const declined = rows.find(
        (m) =>
          m.kind === "call_declined" &&
          !m.mine &&
          new Date(m.createdAt).getTime() >= since,
      );
      if (declined && !leavingRef.current) {
        setHostNotice(`${declined.senderName} дуудлага татгалзлаа`);
        window.setTimeout(() => void leaveSession(false), 1800);
      }
    };

    const tick = async () => {
      try {
        const rows = await fetchMessages(roomId, afterId);
        if (rows.length) afterId = rows[rows.length - 1]!.id;
        handleDecline(rows);
      } catch {
        /* ignore */
      }
    };

    const poller = createAdaptivePoller(tick, () =>
      realtimeConnected ? null : CALL_DECLINE_POLL_MS,
    );
    poller.start();
    document.addEventListener("visibilitychange", poller.onVisibility);

    const unsub = subscribe((event) => {
      if (event.conversationId !== roomId || event.kind !== "call_declined") return;
      void fetchMessages(roomId, afterId).then((rows) => {
        if (rows.length) afterId = rows[rows.length - 1]!.id;
        handleDecline(rows);
      });
    });

    return () => {
      unsub();
      document.removeEventListener("visibilitychange", poller.onVisibility);
      poller.stop();
    };
  }, [asRole, connected, leaveSession, realtimeConnected, roomId, subscribe]);

  const handleCamToggle = () => {
    toggleCam();
    setCamMuted((m) => !m);
  };

  const handleVoiceToggle = async () => {
    if (!connected) return;
    if (listening) stop();
    else await start();
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
      <CallWaiting status={status} message={message} />

      <CallTopBar
        statusLabel={hostNotice ?? STATUS_LABEL[status] ?? "…"}
        statusDot={statusDot}
        timer={connected ? fmtDur(elapsed) : undefined}
        onBack={() => void leaveSession(true)}
      />

      {(modelError || modelLoading) && connected && (
        <p className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 text-center text-xs text-white/50">
          {modelError ?? "Ачааллаж байна…"}
        </p>
      )}

      <div className="relative z-0 aspect-[4/3] w-full max-h-[min(42dvh,72vw)] min-h-[200px] shrink-0 bg-black md:absolute md:inset-0 md:aspect-auto md:max-h-none">
        <CameraView
          fullscreen
          showPreview
          mirrorPreview
          mirrorDetect
          previewFit={previewFit}
          onLandmarks={connected ? handleLandmarks : undefined}
          onStreamReady={onStreamReady}
          inferenceActive={connected && modelReady}
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
          onEnd={() => void leaveSession(true)}
        />
      </div>
    </div>
  );
}
