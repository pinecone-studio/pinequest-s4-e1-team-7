"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { pingPresence } from "@/lib/chat-api";

const INTERVAL_MS = 60_000;

export function usePresenceHeartbeat() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    pingPresence();
    const id = setInterval(pingPresence, INTERVAL_MS);
    const onFocus = () => pingPresence();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [token]);
}
