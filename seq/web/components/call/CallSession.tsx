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
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useIsDesktop } from "@/hooks/useBreakpoint";
import { useSignDetection } from "@/hooks/useSignDetection";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { sendCallEnded, fetchMessages } from "@/lib/chat-api";
import { useChatRealtime } from "@/context/ChatRealtimeContext";
import { CALL_DECLINE_POLL_MS, createAdaptivePoller } from "@/lib/poll-schedule";
import { releaseAllCameras } from "@/lib/camera-registry";
import { playVoiceLoop, stopAllVoice, stopVoiceLoop } from "@/lib/play-voice";
import { releaseMediaStream } from "@/lib/video-utils";
import { VideoCameraSlashIcon, PhoneIcon } from "@heroicons/react/24/solid";

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
  const audioOnly = searchParams.get("mode") === "audio";
  const [hostNotice, setHostNotice] = useState<string | null>(null);
  const callStartedAtRef = useRef(Date.now());
  const { connected: realtimeConnected, subscribe } = useChatRealtime();
  const { speak: ttsSpeak } = useTextToSpeech();

  const {
    active,
    history,
    onMyWord,
    onTheirCaption,
    onMyVoiceInterim,
    onMyVoiceFinal,
    onTheirPhrase,
  } = useCallCaptions();

  const ignoreCaption = useCallback(() => {}, []);

  // Debounce refs for remote sign-language TTS
  const theirCaptionPrevRef = useRef("");
  const theirSignAccRef = useRef("");
  const theirSignTsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [camMuted, setCamMuted] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const connectedAtRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const leavingRef = useRef(false);
  const leaveSessionRef = useRef<(reportEnd?: boolean) => void>(() => {});

  const ttsEnabledRef = useRef(ttsEnabled);
  ttsEnabledRef.current = ttsEnabled;

  const handleTheirCaption = useCallback(
    (full: string) => {
      const prev = theirCaptionPrevRef.current;
      const delta = full.startsWith(prev) ? full.slice(prev.length).trim() : full.trim();
      theirCaptionPrevRef.current = full;
      onTheirCaption(full);
      if (!delta) return;
      theirSignAccRef.current = theirSignAccRef.current
        ? `${theirSignAccRef.current} ${delta}`
        : delta;
      if (theirSignTsTimerRef.current) clearTimeout(theirSignTsTimerRef.current);
      theirSignTsTimerRef.current = setTimeout(() => {
        const text = theirSignAccRef.current;
        theirSignAccRef.current = "";
        if (ttsEnabledRef.current && text.trim()) void ttsSpeak(text, { rate: 1, gender: "female" });
      }, 1000);
    },
    [onTheirCaption, ttsSpeak],
  );

  const handleTheirPhrase = useCallback(
    (text: string) => {
      onTheirPhrase(text);
      if (ttsEnabledRef.current && text.trim()) void ttsSpeak(text, { rate: 1, gender: "female" });
    },
    [onTheirPhrase, ttsSpeak],
  );

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
    audioOnly
      ? { onCaption: ignoreCaption, onPhrase: ignoreCaption }
      : { onCaption: handleTheirCaption, onPhrase: handleTheirPhrase },
    peerHint,
    () => leaveSessionRef.current(false),
    asRole,
  );

  const connected = status === "connected";

  const onWord = useCallback(
    (word: string) => {
      if (audioOnly) return;
      const next = onMyWord(word);
      sendCaption(next);
    },
    [audioOnly, onMyWord, sendCaption],
  );

  const handleSpeech = useCallback(
    (text: string, final: boolean) => {
      if (audioOnly) return;
      if (final) {
        const phrase = onMyVoiceFinal(text);
        if (phrase) sendPhrase(phrase);
      } else {
        onMyVoiceInterim(text);
      }
    },
    [audioOnly, onMyVoiceFinal, onMyVoiceInterim, sendPhrase],
  );

  const { listening, start, stop, supported } = useSpeechRecognition(handleSpeech);

  const { modelReady, modelError, modelLoading, startLoad, handleLandmarks, reset } =
    useSignDetection(onWord);

  useEffect(() => {
    if (!audioOnly) return;
    let stream: MediaStream | null = null;
    let cancelled = false;

    void navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((s) => {
        if (cancelled) {
          releaseMediaStream(s);
          return;
        }
        stream = s;
        onStreamReady(s);
      })
      .catch(() => {
        /* mic permission denied */
      });

    return () => {
      cancelled = true;
      if (stream) releaseMediaStream(stream);
    };
  }, [audioOnly, onStreamReady]);

  useEffect(() => {
    if (audioOnly || !connected) {
      if (audioOnly) reset();
      return;
    }
    startLoad();
  }, [audioOnly, connected, reset, startLoad]);

  const leaveSession = useCallback(
    async (reportEnd = false) => {
      if (leavingRef.current) return;
      leavingRef.current = true;

      const connectedMs = connectedAtRef.current ? Date.now() - connectedAtRef.current : 0;
      const durationMs = connectedMs > 0 ? connectedMs : elapsedRef.current * 1000;

      stop();
      stopAllVoice();
      hangUp();
      if (!audioOnly) releaseAllCameras();

      if (reportEnd && roomId.startsWith("c_") && durationMs >= 1000) {
        try {
          await sendCallEnded(roomId, durationMs);
        } catch {
          /* navigation may still proceed */
        }
      }

      router.replace(returnTo);
    },
    [audioOnly, hangUp, returnTo, roomId, router, stop],
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
  useEffect(() => () => {
    if (!audioOnly) releaseAllCameras();
    stopAllVoice();
  }, [audioOnly]);

  // Host: хариулт ирэх хүртэл calling.mp3 loop
  useEffect(() => {
    const ringing =
      asRole === "host" &&
      !connected &&
      !hostNotice &&
      !leavingRef.current &&
      (status === "idle" || status === "connecting");

    if (ringing) {
      playVoiceLoop("calling");
    } else {
      stopVoiceLoop();
    }

    return () => stopVoiceLoop();
  }, [asRole, connected, hostNotice, status]);

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
      if (event.type !== "chat") return;
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
    if (audioOnly || !connected) return;
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


  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden md:bg-black" style={{ background: "var(--bg)" }}>

      {/* ── Camera / audio ── */}
      <div
        className={`relative bg-black ${
          audioOnly
            ? "flex min-h-0 flex-1 flex-col"
            : "relative shrink-0 [height:48dvh] [min-height:260px] md:absolute md:inset-0 md:z-0 md:[height:unset] md:[min-height:unset]"
        }`}
      >
        {audioOnly ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full"
              style={{ background: "color-mix(in srgb, var(--olive) 35%, #000)" }}
            >
              <PhoneIcon className="h-12 w-12" style={{ color: "var(--olive)" }} />
            </div>
            <p className="text-center text-[15px] font-semibold text-white/90">
              Аудио дуудлага
            </p>
            <video ref={remoteVideoRef} playsInline className="sr-only" aria-hidden />
          </div>
        ) : (
          <>
            <CameraView
              fullscreen
              showPreview
              mirrorPreview
              mirrorDetect
              previewFit={isDesktop ? "cover" : "contain"}
              onLandmarks={connected ? handleLandmarks : undefined}
              onStreamReady={onStreamReady}
              inferenceActive={connected && modelReady}
            />
            {camMuted && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
                <VideoCameraSlashIcon className="h-12 w-12 text-zinc-500" />
              </div>
            )}

            {/* Remote video PiP */}
            <div
              className={`absolute left-3 top-[calc(env(safe-area-inset-top)+3.5rem)] z-20 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-lg transition-opacity h-[100px] w-[75px] md:h-[240px] md:w-[180px] md:left-4 ${
                connected && hasRemoteStream ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <video ref={remoteVideoRef} playsInline className="h-full w-full object-cover" />
            </div>
          </>
        )}

        {!audioOnly && (
          <>
            {/* Mobile subtitles inside camera area */}
            <div className="md:hidden">
              <CallSubtitles layout="mobile" speaker={active?.speaker ?? null} text={active?.text ?? ""} />
            </div>
          </>
        )}
      </div>

      {/* ── Mobile: caption history (video call only) ── */}
      {!audioOnly && (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
        <CallCaptionHistory
          entries={history}
          variant="mobile"
          open={chatOpen}
          onToggle={() => setChatOpen((o) => !o)}
        />
      </div>
      )}

      {/* ── Shared overlays (work on both layouts) ── */}
      <CallWaiting status={status} message={message} />

      <CallTopBar
        statusLabel={hostNotice ?? STATUS_LABEL[status] ?? "…"}
        statusDot={statusDot}
        timer={connected ? fmtDur(elapsed) : undefined}
        onBack={() => void leaveSession(true)}
        ttsEnabled={ttsEnabled}
        onTtsToggle={() => setTtsEnabled((v) => !v)}
      />

      {(modelError || modelLoading) && connected && !audioOnly && (
        <p className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 text-center text-xs" style={{ color: "var(--text-3)" }}>
          {modelError ?? "Ачааллаж байна…"}
        </p>
      )}

      {/* ── Desktop: caption sidebar + subtitles (video call only) ── */}
      {!audioOnly && (
        <>
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
        </>
      )}

      {/* ── Controls ── */}
      <div className="shrink-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 [background:var(--surface)] [border-top:1px_solid_var(--border-c)] md:absolute md:inset-x-0 md:bottom-0 md:px-6 md:pt-4 md:[background:transparent] md:[border-top:none]">
        <CallControls
          camMuted={camMuted}
          voiceListening={listening}
          voiceSupported={supported}
          hideCamera={audioOnly}
          hideVoice={audioOnly}
          onCamToggle={handleCamToggle}
          onVoiceToggle={handleVoiceToggle}
          onEnd={() => void leaveSession(true)}
        />
      </div>
    </div>
  );
}
