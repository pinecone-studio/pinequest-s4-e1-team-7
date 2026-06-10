"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  attachMediaStream,
  detachMediaStream,
  releaseMediaStream,
} from "@/lib/video-utils";

type PeerMsg =
  | { kind: "caption"; text: string }
  | { kind: "phrase"; text: string }
  | { kind: "hangup" };

type CaptionHandlers = {
  onCaption: (text: string) => void;
  onPhrase: (text: string) => void;
};
type Role = "host" | "guest";
export type PeerStatus = "idle" | "connecting" | "connected" | "error";

const DIAL_RETRY_MS = 2500;
const DIAL_MAX_ATTEMPTS = 24;

const safeId = (r: string) => r.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 32) || "room";
const hostPeerId = (r: string) => `sbq-${safeId(r)}-host`;
const guestPeerId = (r: string) => `sbq-${safeId(r)}-${Math.random().toString(36).slice(2, 8)}`;

export function useCallPeer(
  roomId: string,
  handlers: CaptionHandlers,
  peerHint = "",
  onRemoteDisconnect?: () => void,
  preferredRole: "host" | "guest" | "auto" = "auto",
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const onRemoteDisconnectRef = useRef(onRemoteDisconnect);
  onRemoteDisconnectRef.current = onRemoteDisconnect;
  const wasInCallRef = useRef(false);
  const disconnectNotifiedRef = useRef(false);
  const sessionEndedRef = useRef(false);

  const notifyRemoteDisconnect = useCallback(() => {
    if (!wasInCallRef.current || disconnectNotifiedRef.current) return;
    disconnectNotifiedRef.current = true;
    wasInCallRef.current = false;
    sessionEndedRef.current = true;
    onRemoteDisconnectRef.current?.();
  }, []);

  const [role, setRole] = useState<Role | null>(null);
  const [myPeerId, setMyPeerId] = useState("");
  const [status, setStatus] = useState<PeerStatus>("idle");
  const [message, setMessage] = useState("");
  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<import("peerjs").Peer | null>(null);
  const connRef = useRef<import("peerjs").DataConnection | null>(null);
  const callRef = useRef<import("peerjs").MediaConnection | null>(null);
  const dialRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const hostId = hostPeerId(roomId);

  const attachConn = useCallback(
    (conn: import("peerjs").DataConnection) => {
      connRef.current = conn;
      setStatus("connecting");
      setMessage("");
      conn.on("open", () => {
        wasInCallRef.current = true;
        disconnectNotifiedRef.current = false;
        setStatus("connected");
        setMessage("");
      });
      conn.on("close", () => {
        notifyRemoteDisconnect();
        setStatus("idle");
        connRef.current = null;
      });
      conn.on("error", () => setStatus("error"));
      conn.on("data", (d) => {
        const m = d as PeerMsg;
        if (m?.kind === "hangup") {
          notifyRemoteDisconnect();
          return;
        }
        if (m?.kind === "caption" && typeof m.text === "string") {
          handlersRef.current.onCaption(m.text);
        } else if (m?.kind === "phrase" && typeof m.text === "string") {
          handlersRef.current.onPhrase(m.text);
        }
      });
    },
    [notifyRemoteDisconnect]
  );

  const attachCall = useCallback((call: import("peerjs").MediaConnection) => {
    callRef.current = call;
    call.on("stream", (s) => {
      if (remoteVideoRef.current) {
        attachMediaStream(remoteVideoRef.current, s);
        setHasRemoteStream(true);
      }
    });
    call.on("close", () => {
      notifyRemoteDisconnect();
      callRef.current = null;
      setHasRemoteStream(false);
      if (remoteVideoRef.current) attachMediaStream(remoteVideoRef.current, null);
    });
    call.on("error", () => setStatus("error"));
  }, [notifyRemoteDisconnect]);

  const stopDial = useCallback(() => {
    if (dialRef.current) {
      clearInterval(dialRef.current);
      dialRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

  const dialOnce = useCallback(
    (target: string) => {
      if (sessionEndedRef.current) return false;
      const peer = peerRef.current;
      const stream = localStreamRef.current;
      if (!peer || !stream || connRef.current?.open) return false;
      setStatus("connecting");
      setMessage(`Холбогдож байна…`);
      try {
        attachConn(peer.connect(target, { reliable: true }));
        attachCall(peer.call(target, stream));
        return true;
      } catch {
        return false;
      }
    },
    [attachCall, attachConn]
  );

  const startDial = useCallback(
    (target: string) => {
      if (sessionEndedRef.current) return;
      if (dialRef.current) return;
      attemptsRef.current = 0;
      const tick = () => {
        if (sessionEndedRef.current) {
          stopDial();
          return;
        }
        if (connRef.current?.open) {
          stopDial();
          return;
        }
        attemptsRef.current += 1;
        if (attemptsRef.current > DIAL_MAX_ATTEMPTS) {
          stopDial();
          setStatus("error");
          setMessage("Холбогдож чадсангүй. Host хуудсаа нээлттэй байлгаад дахин орно уу.");
          return;
        }
        dialOnce(target);
        setMessage(`Host хүлээж байна… (${attemptsRef.current}/${DIAL_MAX_ATTEMPTS})`);
      };
      tick();
      dialRef.current = setInterval(tick, DIAL_RETRY_MS);
    },
    [dialOnce, stopDial]
  );

  useEffect(() => {
    let stopped = false;
    let peer: import("peerjs").Peer | null = null;

    const setupGuest = async () => {
      const { Peer } = await import("peerjs");
      if (stopped) return;
      peer = new Peer(guestPeerId(roomId), { debug: 0 });
      peer.on("open", (id) => {
        if (stopped) return;
        peerRef.current = peer;
        setMyPeerId(id);
        setRole("guest");
        setMessage("Host-той холбогдож байна…");
      });
      peer.on("connection", attachConn);
      peer.on("call", (inc) => {
        const s = localStreamRef.current;
        if (s) {
          inc.answer(s);
          attachCall(inc);
        }
      });
      peer.on("error", (err) => {
        if (stopped) return;
        const t = (err as { type?: string }).type;
        if (t === "peer-unavailable") return;
        if (t === "network" || t === "server-error") {
          setStatus("error");
          setMessage("PeerJS серверт холбогдож чадсангүй. Дахин орно уу.");
        }
      });
    };

    const setupHost = async () => {
      const { Peer } = await import("peerjs");
      if (stopped) return;
      peer = new Peer(hostPeerId(roomId), { debug: 0 });
      peer.on("open", (id) => {
        if (stopped) return;
        peerRef.current = peer;
        setMyPeerId(id);
        setRole("host");
        setStatus("idle");
        setMessage("Холбоосыг хамтрагчдаа илгээнэ үү (энэ табыг нээлттэй үлдээнэ).");
      });
      peer.on("connection", attachConn);
      peer.on("call", (inc) => {
        const s = localStreamRef.current;
        if (!s) {
          const w = setInterval(() => {
            const ns = localStreamRef.current;
            if (ns) {
              clearInterval(w);
              inc.answer(ns);
              attachCall(inc);
            }
          }, 100);
          return;
        }
        inc.answer(s);
        attachCall(inc);
      });
      peer.on("error", (err) => {
        if (stopped) return;
        const t = (err as { type?: string }).type;
        if (t === "unavailable-id") {
          peer?.destroy();
          peer = null;
          void setupGuest();
          return;
        }
        if (t === "peer-unavailable") return;
        setStatus("error");
        setMessage("PeerJS серверт холбогдож чадсангүй. Интернет шалгаад дахин орно уу.");
      });
    };

    const peerTimeout = setTimeout(() => {
      if (stopped || peerRef.current) return;
      setMessage("Peer холболт удаан байна — хуудсыг refresh хийнэ үү.");
    }, 12_000);

    if (preferredRole === "guest") {
      void setupGuest();
    } else if (preferredRole === "host") {
      void setupHost();
    } else {
      void setupHost();
    }

    return () => {
      stopped = true;
      clearTimeout(peerTimeout);
      stopDial();
      connRef.current?.close();
      callRef.current?.close();
      peer?.destroy();
      peerRef.current = null;
    };
  }, [attachCall, attachConn, preferredRole, roomId, stopDial]);

  useEffect(() => {
    if (sessionEndedRef.current) return;
    if (role !== "guest" || !myPeerId || !hasLocalStream) return;
    if (connRef.current?.open || callRef.current) return;
    const target = peerHint || hostId;
    startDial(target);
    return () => stopDial();
  }, [hasLocalStream, hostId, myPeerId, peerHint, role, startDial, stopDial]);

  useEffect(() => {
    if (sessionEndedRef.current) return;
    if (role !== "guest" || !myPeerId) return;
    const target = peerHint || hostId;
    const id = setInterval(() => {
      if (sessionEndedRef.current) return;
      if (localStreamRef.current && !connRef.current?.open && !dialRef.current) {
        startDial(target);
      }
    }, 500);
    return () => clearInterval(id);
  }, [hostId, myPeerId, peerHint, role, startDial]);

  const sendCaption = useCallback((text: string) => {
    if (connRef.current?.open) {
      connRef.current.send({ kind: "caption", text } satisfies PeerMsg);
    }
  }, []);

  const sendPhrase = useCallback((text: string) => {
    const t = text.trim();
    if (!t || !connRef.current?.open) return;
    connRef.current.send({ kind: "phrase", text: t } satisfies PeerMsg);
  }, []);

  const onStreamReady = useCallback((s: MediaStream) => {
    localStreamRef.current = s;
    setHasLocalStream(true);
  }, []);

  const releaseLocalMedia = useCallback(() => {
    releaseMediaStream(localStreamRef.current);
    localStreamRef.current = null;
    detachMediaStream(remoteVideoRef.current);
    setHasLocalStream(false);
    setHasRemoteStream(false);
  }, []);

  useEffect(() => () => detachMediaStream(remoteVideoRef.current), []);

  const hangUp = useCallback(() => {
    sessionEndedRef.current = true;
    wasInCallRef.current = false;
    disconnectNotifiedRef.current = true;
    stopDial();
    const conn = connRef.current;
    if (conn?.open) {
      try {
        conn.send({ kind: "hangup" } satisfies PeerMsg);
      } catch {
        /* peer аль хэдийн хаагдсан */
      }
    }
    conn?.close();
    callRef.current?.close();
    connRef.current = null;
    callRef.current = null;
    peerRef.current?.destroy();
    peerRef.current = null;
    releaseLocalMedia();
  }, [releaseLocalMedia, stopDial]);

  return {
    role,
    status,
    message,
    hasRemoteStream,
    remoteVideoRef,
    connRef,
    callRef,
    sendCaption,
    sendPhrase,
    onStreamReady,
    releaseLocalMedia,
    hangUp,
    toggleCam: useCallback(
      () => localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; }),
      []
    ),
    toggleMic: useCallback(
      () => localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; }),
      []
    ),
  };
}
