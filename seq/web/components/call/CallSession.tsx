"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CameraView } from "@/components/CameraView";
import { TypewriterCaption } from "@/components/TypewriterCaption";
import type { AllLandmarks } from "@/lib/mediapipe";
import type { SequenceEmitter, SequenceRecognizer } from "@/lib/sequence-runtime";

const DIAL_RETRY_MS = 2500;
const DIAL_MAX_ATTEMPTS = 24;

type CaptionMsg = { kind: "caption"; text: string };
type Role = "host" | "guest";
type PeerStatus = "idle" | "connecting" | "connected" | "error";

type Props = { roomId: string };

function safeRoomId(roomId: string): string {
  return roomId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 32) || "room";
}
function hostPeerId(roomId: string): string {
  return `sbq-${safeRoomId(roomId)}-host`;
}
function guestPeerId(roomId: string): string {
  return `sbq-${safeRoomId(roomId)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CallSession({ roomId }: Props) {
  const search = useSearchParams();
  const legacyPeerHint = search.get("peer") ?? "";

  const [role, setRole] = useState<Role | null>(null);
  const [myPeerId, setMyPeerId] = useState("");
  const [peerStatus, setPeerStatus] = useState<PeerStatus>("idle");
  const [peerMessage, setPeerMessage] = useState("");
  const [theirCaption, setTheirCaption] = useState("");
  const [myCaption, setMyCaption] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState("");
  const [modelLoading, setModelLoading] = useState(false);
  const [livePred, setLivePred] = useState<{
    label: string;
    confidence: number;
    candidateShare: number;
    locked: boolean;
  } | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<import("peerjs").Peer | null>(null);
  const connRef = useRef<import("peerjs").DataConnection | null>(null);
  const callRef = useRef<import("peerjs").MediaConnection | null>(null);
  const dialTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dialAttemptsRef = useRef(0);

  const recognizerRef = useRef<SequenceRecognizer | null>(null);
  const emitterRef = useRef<SequenceEmitter | null>(null);
  const livePredRef = useRef<{
    label: string;
    confidence: number;
    candidateShare: number;
    locked: boolean;
  } | null>(null);
  const lastLiveUiAtRef = useRef(0);
  const modelLoadStartedRef = useRef(false);
  const runtimeRef = useRef<typeof import("@/lib/sequence-runtime") | null>(
    null
  );

  const hostId = hostPeerId(roomId);

  const startModelLoad = useCallback(() => {
    if (modelLoadStartedRef.current) return;
    modelLoadStartedRef.current = true;
    setModelLoading(true);

    let cancelled = false;
    const loadTimeout = setTimeout(() => {
      if (cancelled) return;
      setModelError(
        "Загвар ачаалах удаан байна. Хуудсыг refresh хийж, browser console (F12) шалгана уу."
      );
      setModelLoading(false);
    }, 45_000);

    void (async () => {
      await new Promise((r) => setTimeout(r, 100));
      const runtime = await import("@/lib/sequence-runtime");
      runtimeRef.current = runtime;
      const result = await runtime.loadSequenceModelWithReason();
      if (cancelled) return;
      clearTimeout(loadTimeout);
      setModelLoading(false);
      if (!result.ok) {
        if (result.reason === "missing_files") {
          setModelError(
            "Загварын файл олдсонгүй. seq/training дотор: python3 train.py && python3 export_model.py"
          );
        } else if (result.reason === "feature_mismatch") {
          setModelError(
            "Feature тоо зөрсөн. landmarks.ts ба training/config.py-г тааруулна уу."
          );
        } else {
          setModelError(
            "Загвар ачаалахад алдаа. cd seq/training && python3 export_model.py"
          );
          if (result.detail) console.error(result.detail);
        }
        return;
      }
      recognizerRef.current = new runtime.SequenceRecognizer(
        result.model,
        result.meta
      );
      emitterRef.current = new runtime.SequenceEmitter(
        runtime.emitterOptionsFromMeta(result.meta)
      );
      console.info("[seq] model ready → detect эхэлж байна");
      setModelReady(true);
      const warmup = () => recognizerRef.current?.warmup();
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(warmup, { timeout: 3000 });
      } else {
        setTimeout(warmup, 800);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(loadTimeout);
    };
  }, []);

  const handleMediaPipeReady = useCallback(() => {
    startModelLoad();
  }, [startModelLoad]);

  const attachConn = useCallback((conn: import("peerjs").DataConnection) => {
    connRef.current = conn;
    setPeerStatus("connecting");
    setPeerMessage("");
    conn.on("open", () => {
      setPeerStatus("connected");
      setPeerMessage("");
    });
    conn.on("close", () => {
      setPeerStatus("idle");
      connRef.current = null;
    });
    conn.on("error", () => setPeerStatus("error"));
    conn.on("data", (data) => {
      const m = data as CaptionMsg;
      if (m?.kind === "caption" && typeof m.text === "string") {
        setTheirCaption(m.text);
      }
    });
  }, []);

  const attachCall = useCallback((call: import("peerjs").MediaConnection) => {
    callRef.current = call;
    call.on("stream", (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      }
    });
    call.on("close", () => {
      callRef.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });
    call.on("error", () => setPeerStatus("error"));
  }, []);

  const stopDialRetry = useCallback(() => {
    if (dialTimerRef.current) {
      clearInterval(dialTimerRef.current);
      dialTimerRef.current = null;
    }
    dialAttemptsRef.current = 0;
  }, []);

  const dialOnce = useCallback(
    (targetId: string) => {
      const peer = peerRef.current;
      const stream = localStreamRef.current;
      if (!peer || !stream || connRef.current?.open) return false;
      setPeerStatus("connecting");
      setPeerMessage(`Холбогдож байна (${targetId})…`);
      try {
        attachConn(peer.connect(targetId, { reliable: true }));
        attachCall(peer.call(targetId, stream));
        return true;
      } catch {
        return false;
      }
    },
    [attachCall, attachConn]
  );

  const startDialRetry = useCallback(
    (targetId: string) => {
      if (dialTimerRef.current) return;
      dialAttemptsRef.current = 0;
      const tick = () => {
        if (connRef.current?.open) {
          stopDialRetry();
          return;
        }
        dialAttemptsRef.current += 1;
        if (dialAttemptsRef.current > DIAL_MAX_ATTEMPTS) {
          stopDialRetry();
          setPeerStatus("error");
          setPeerMessage(
            "Холбогдож чадсангүй. Host хуудсаа нээлттэй байлгаад дахин орно уу."
          );
          return;
        }
        dialOnce(targetId);
        setPeerMessage(
          `Host хүлээж байна… (${dialAttemptsRef.current}/${DIAL_MAX_ATTEMPTS})`
        );
      };
      tick();
      dialTimerRef.current = setInterval(tick, DIAL_RETRY_MS);
    },
    [dialOnce, stopDialRetry]
  );

  useEffect(() => {
    let stopped = false;
    let peer: import("peerjs").Peer | null = null;

    const setupGuest = async () => {
      const { Peer } = await import("peerjs");
      if (stopped) return;
      peer = new Peer(guestPeerId(roomId), { debug: 0 });
      peer.on("open", (openedId) => {
        if (stopped) return;
        peerRef.current = peer;
        setMyPeerId(openedId);
        setRole("guest");
        setPeerMessage("Host-той холбогдож байна…");
      });
      peer.on("connection", attachConn);
      peer.on("call", (incoming) => {
        const stream = localStreamRef.current;
        if (stream) {
          incoming.answer(stream);
          attachCall(incoming);
        }
      });
      peer.on("error", (err) => {
        if (stopped) return;
        const type = (err as { type?: string }).type;
        if (type === "peer-unavailable") return;
        if (type === "network" || type === "server-error") {
          setPeerStatus("error");
          setPeerMessage("PeerJS серверт холбогдож чадсангүй. Дахин орно уу.");
        }
      });
    };

    const setupHost = async () => {
      const { Peer } = await import("peerjs");
      if (stopped) return;
      peer = new Peer(hostPeerId(roomId), { debug: 0 });
      peer.on("open", (openedId) => {
        if (stopped) return;
        peerRef.current = peer;
        setMyPeerId(openedId);
        setRole("host");
        setPeerStatus("idle");
        setPeerMessage("Холбоосыг хамтрагчдаа илгээнэ үү (энэ табыг нээлттэй үлдээнэ).");
      });
      peer.on("connection", attachConn);
      peer.on("call", (incoming) => {
        const stream = localStreamRef.current;
        if (!stream) {
          const waitId = setInterval(() => {
            const s = localStreamRef.current;
            if (s) {
              clearInterval(waitId);
              incoming.answer(s);
              attachCall(incoming);
            }
          }, 100);
          return;
        }
        incoming.answer(stream);
        attachCall(incoming);
      });
      peer.on("error", (err) => {
        if (stopped) return;
        const type = (err as { type?: string }).type;
        if (type === "unavailable-id") {
          peer?.destroy();
          peer = null;
          void setupGuest();
          return;
        }
        if (type === "peer-unavailable") return;
        setPeerStatus("error");
        setPeerMessage("PeerJS серверт холбогдож чадсангүй. Интернет шалгаад дахин орно уу.");
      });
    };

    const peerTimeout = setTimeout(() => {
      if (stopped || peerRef.current) return;
      setPeerMessage("Peer холболт удаан байна — хуудсыг refresh хийнэ үү.");
    }, 12_000);

    void setupHost();

    return () => {
      stopped = true;
      clearTimeout(peerTimeout);
      stopDialRetry();
      connRef.current?.close();
      callRef.current?.close();
      peer?.destroy();
      peerRef.current = null;
    };
  }, [attachCall, attachConn, roomId, stopDialRetry]);

  useEffect(() => {
    if (role !== "guest" || !myPeerId || !localStreamRef.current) return;
    if (connRef.current?.open || callRef.current) return;
    startDialRetry(legacyPeerHint || hostId);
    return () => stopDialRetry();
  }, [hostId, legacyPeerHint, myPeerId, role, startDialRetry, stopDialRetry]);

  useEffect(() => {
    if (role !== "guest" || !myPeerId) return;
    const id = setInterval(() => {
      if (
        localStreamRef.current &&
        !connRef.current?.open &&
        !dialTimerRef.current
      ) {
        startDialRetry(legacyPeerHint || hostId);
      }
    }, 500);
    return () => clearInterval(id);
  }, [hostId, legacyPeerHint, myPeerId, role, startDialRetry]);

  const onStreamReady = useCallback((stream: MediaStream) => {
    localStreamRef.current = stream;
  }, []);

  const sendCaption = useCallback((text: string) => {
    if (connRef.current?.open) {
      connRef.current.send({ kind: "caption", text } satisfies CaptionMsg);
    }
  }, []);

  const handleLandmarks = useCallback(
    (lm: AllLandmarks) => {
      const rec = recognizerRef.current;
      const emitter = emitterRef.current;
      const runtime = runtimeRef.current;
      if (!rec || !emitter || !runtime) return;
      const pred = rec.push(lm);
      const word = pred ? emitter.push(pred) : null;

      const now = performance.now();
      if (
        pred &&
        runtime.isPredictionVisible(pred) &&
        now - lastLiveUiAtRef.current >= 350
      ) {
        const st = emitter.getStatus(now);
        const next = {
          label: pred.label,
          confidence: pred.confidence,
          candidateShare: st.candidateShare,
          locked: st.locked,
        };
        const prev = livePredRef.current;
        if (
          !prev ||
          prev.label !== next.label ||
          Math.abs(prev.confidence - next.confidence) > 0.04 ||
          prev.locked !== next.locked
        ) {
          lastLiveUiAtRef.current = now;
          livePredRef.current = next;
          setLivePred(next);
        }
      }

      if (!word) return;
      if (runtime.isStaticSign(word)) {
        rec.resetAfterStaticEmit();
      } else {
        rec.resetAfterWordEmit();
      }
      setMyCaption((prev) => {
        const next = appendWord(prev, word);
        sendCaption(next);
        return next;
      });
    },
    [sendCaption]
  );

  const clearCaption = useCallback(() => {
    setMyCaption("");
    setLivePred(null);
    sendCaption("");
    emitterRef.current?.reset();
    recognizerRef.current?.resetWithNeutral();
  }, [sendCaption]);

  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/call/${encodeURIComponent(roomId)}`;
  }, [roomId]);

  const copyShareLink = useCallback(async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  }, [shareLink]);

  return (
    <>
      {modelError && (
        <div className="mb-4 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          {modelError}
        </div>
      )}
      {!modelReady && !modelError && modelLoading && (
        <div className="mb-4 rounded-xl border border-zinc-700 bg-zinc-900/60 p-3 text-sm text-zinc-400">
          Temporal загвар ачаалж байна… (10–20 сек)
        </div>
      )}

      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-xs text-zinc-400">
        {role === "host" ? (
          <>
            <span className="text-violet-300">Host</span> — холбоосыг илгээж{" "}
            <strong className="text-zinc-300">энэ табыг хаахгүй</strong> үлдээнэ.
          </>
        ) : role === "guest" ? (
          <>
            <span className="text-emerald-300">Guest</span> — host-той холбогдож
            байна…
          </>
        ) : (
          <>Peer бэлдэж байна…</>
        )}
        {peerMessage && <p className="mt-1 text-zinc-500">{peerMessage}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400">Та (дохио → текст)</h2>
          <CameraView
            onLandmarks={handleLandmarks}
            onStreamReady={onStreamReady}
            onMediaPipeReady={handleMediaPipeReady}
            inferenceActive={modelReady}
            manualStart
            drawSkeleton={false}
            width={480}
            height={360}
            mirror
          />
          <p className="text-xs text-zinc-500">
            Дохио хий → автоматаар таних. 3 дараалсан таамаглал нэг дохио байвал
            caption-д нэмнэ. Итгэлтэй (≥88%) бол шууд нэмнэ.
          </p>
          {modelReady && livePred && (
            <p className="font-mono text-xs text-zinc-400">
              Одоо: {livePred.label}{" "}
              <span className="text-zinc-500">
                ({(livePred.confidence * 100).toFixed(0)}%)
              </span>
              {livePred.confidence < 0.8 && (
                <span className="text-amber-500/90"> — 80%-аас доош</span>
              )}
              {livePred.candidateShare > 0 && (
                <span className={livePred.candidateShare >= 0.68 ? "text-emerald-400/90" : "text-amber-500/90"}>
                  {" "}— санал {Math.round(livePred.candidateShare * 100)}%
                </span>
              )}
              {livePred.locked && (
                <span className="text-zinc-500"> — дараагийн дохио хүлээнэ</span>
              )}
            </p>
          )}
          {modelReady && !livePred && (
            <p className="text-xs text-zinc-500">
              Цонх дүүрч байна эсвэл бие харагдахгүй байна…
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearCaption}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700"
            >
              Цэвэрлэх
            </button>
          </div>
          <TypewriterCaption text={myCaption} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400">Хамтрагч</h2>
          <div className="relative overflow-hidden rounded-2xl bg-black">
            <video ref={remoteVideoRef} playsInline autoPlay className="w-full" />
            {peerStatus !== "connected" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center">
                {role === "host" ? (
                  <>
                    <p className="text-sm text-zinc-300">
                      Ижил холбоосыг нөгөө хүн нээнэ:
                    </p>
                    <div className="flex w-full max-w-md gap-2">
                      <input
                        readOnly
                        value={shareLink}
                        className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={copyShareLink}
                        className="rounded-lg bg-violet-500 px-4 py-2 text-sm hover:bg-violet-400"
                      >
                        {linkCopied ? "✓" : "Хуулах"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-zinc-300">
                    Host холбогдохыг хүлээж байна…
                    <br />
                    <span className="text-xs text-zinc-500">
                      Host эхлээд /call/{roomId} нээсэн байх ёстой.
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
          <TypewriterCaption text={theirCaption} />
        </section>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
        <StatusDot status={peerStatus} />
        <span>
          {peerStatus === "connected"
            ? "Холбогдсон"
            : peerStatus === "connecting"
              ? "Холбогдож байна…"
              : peerStatus === "error"
                ? "Алдаа"
                : role === "host"
                  ? "Хүлээж байна"
                  : "…"}
        </span>
        {myPeerId && (
          <span className="font-mono text-[10px] text-zinc-600">{myPeerId}</span>
        )}
      </div>
    </>
  );
}

function StatusDot({ status }: { status: PeerStatus }) {
  const colors = {
    idle: "bg-zinc-500",
    connecting: "bg-amber-400 animate-pulse",
    connected: "bg-emerald-400",
    error: "bg-red-500",
  } as const;
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status]}`} />
  );
}

function appendWord(prev: string, word: string): string {
  const trimmed = prev.trim();
  if (!trimmed) return word;
  const last = trimmed.split(/\s+/).pop();
  if (last === word) return prev;
  return `${trimmed} ${word}`;
}
