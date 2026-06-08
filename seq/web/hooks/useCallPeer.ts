"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type CaptionMsg = { kind: "caption"; text: string };
type Role = "host" | "guest";
export type PeerStatus = "idle" | "connecting" | "connected" | "error";

const DIAL_RETRY_MS = 2500;
const DIAL_MAX_ATTEMPTS = 24;
const safeId = (r: string) => r.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 32) || "room";
const hostPeerId = (r: string) => `sbq-${safeId(r)}-host`;
const guestPeerId = (r: string) => `sbq-${safeId(r)}-${Math.random().toString(36).slice(2, 8)}`;

export function useCallPeer(roomId: string, onCaption: (text: string) => void, peerHint = "") {
  const [role, setRole] = useState<Role | null>(null);
  const [myPeerId, setMyPeerId] = useState("");
  const [status, setStatus] = useState<PeerStatus>("idle");
  const [message, setMessage] = useState("");
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<import("peerjs").Peer | null>(null);
  const connRef = useRef<import("peerjs").DataConnection | null>(null);
  const callRef = useRef<import("peerjs").MediaConnection | null>(null);
  const dialRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const attachConn = useCallback((conn: import("peerjs").DataConnection) => {
    connRef.current = conn; setStatus("connecting");
    conn.on("open", () => { setStatus("connected"); setMessage(""); });
    conn.on("close", () => { setStatus("idle"); connRef.current = null; });
    conn.on("error", () => setStatus("error"));
    conn.on("data", (d) => { const m = d as CaptionMsg; if (m?.kind === "caption") onCaption(m.text); });
  }, [onCaption]);

  const attachCall = useCallback((call: import("peerjs").MediaConnection) => {
    callRef.current = call;
    call.on("stream", (s) => { if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = s; remoteVideoRef.current.play().catch(() => {}); } });
    call.on("close", () => { callRef.current = null; if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null; });
    call.on("error", () => setStatus("error"));
  }, []);

  const stopDial = useCallback(() => { if (dialRef.current) { clearInterval(dialRef.current); dialRef.current = null; } attemptsRef.current = 0; }, []);

  const dialOnce = useCallback((target: string) => {
    const peer = peerRef.current; const stream = localStreamRef.current;
    if (!peer || !stream || connRef.current?.open) return;
    setStatus("connecting");
    try { attachConn(peer.connect(target, { reliable: true })); attachCall(peer.call(target, stream)); } catch { /* noop */ }
  }, [attachConn, attachCall]);

  const startDial = useCallback((target: string) => {
    if (dialRef.current) return;
    attemptsRef.current = 0;
    const tick = () => {
      if (connRef.current?.open) { stopDial(); return; }
      if (++attemptsRef.current > DIAL_MAX_ATTEMPTS) { stopDial(); setStatus("error"); setMessage("Холбогдож чадсангүй. Host хуудсаа нээлттэй байлгаад дахин орно уу."); return; }
      dialOnce(target); setMessage(`Host хүлээж байна… (${attemptsRef.current}/${DIAL_MAX_ATTEMPTS})`);
    };
    tick(); dialRef.current = setInterval(tick, DIAL_RETRY_MS);
  }, [dialOnce, stopDial]);

  useEffect(() => {
    let stopped = false; let peer: import("peerjs").Peer | null = null;
    const setupGuest = async () => {
      const { Peer } = await import("peerjs"); if (stopped) return;
      peer = new Peer(guestPeerId(roomId), { debug: 0 });
      peer.on("open", (id) => { if (stopped) return; peerRef.current = peer; setMyPeerId(id); setRole("guest"); });
      peer.on("connection", attachConn);
      peer.on("call", (inc) => { const s = localStreamRef.current; if (s) { inc.answer(s); attachCall(inc); } });
      peer.on("error", (err) => { if (!stopped && (err as { type?: string }).type !== "peer-unavailable") { setStatus("error"); setMessage("PeerJS серверт холбогдож чадсангүй."); } });
    };
    const setupHost = async () => {
      const { Peer } = await import("peerjs"); if (stopped) return;
      peer = new Peer(hostPeerId(roomId), { debug: 0 });
      peer.on("open", (id) => { if (stopped) return; peerRef.current = peer; setMyPeerId(id); setRole("host"); setStatus("idle"); setMessage("Холбоосыг хамтрагчдаа илгээнэ үү."); });
      peer.on("connection", attachConn);
      peer.on("call", (inc) => {
        const s = localStreamRef.current;
        if (!s) { const w = setInterval(() => { const ns = localStreamRef.current; if (ns) { clearInterval(w); inc.answer(ns); attachCall(inc); } }, 100); return; }
        inc.answer(s); attachCall(inc);
      });
      peer.on("error", (err) => {
        if (stopped) return;
        const t = (err as { type?: string }).type;
        if (t === "unavailable-id") { peer?.destroy(); void setupGuest(); return; }
        if (t !== "peer-unavailable") { setStatus("error"); setMessage("PeerJS серверт холбогдож чадсангүй."); }
      });
    };
    void setupHost();
    return () => { stopped = true; stopDial(); connRef.current?.close(); callRef.current?.close(); peer?.destroy(); peerRef.current = null; };
  }, [attachCall, attachConn, roomId, stopDial]);

  useEffect(() => {
    if (role !== "guest" || !myPeerId) return;
    const target = peerHint || hostPeerId(roomId);
    if (!localStreamRef.current || !connRef.current?.open || !callRef.current) startDial(target);
    const id = setInterval(() => { if (localStreamRef.current && !connRef.current?.open && !dialRef.current) startDial(target); }, 500);
    return () => { stopDial(); clearInterval(id); };
  }, [myPeerId, peerHint, role, roomId, startDial, stopDial]);

  const sendCaption = useCallback((text: string) => { if (connRef.current?.open) connRef.current.send({ kind: "caption", text } satisfies CaptionMsg); }, []);

  return {
    role, status, message, remoteVideoRef, connRef, callRef,
    sendCaption,
    onStreamReady: useCallback((s: MediaStream) => { localStreamRef.current = s; }, []),
    toggleCam: useCallback(() => localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; }), []),
    toggleMic: useCallback(() => localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; }), []),
  };
}
