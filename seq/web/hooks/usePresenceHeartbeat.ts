"use client";
import { useEffect } from "react";
import { pingPresence } from "@/lib/chat-api";

const INTERVAL_MS = 60_000; // ping every 60 seconds

export function usePresenceHeartbeat() {
  useEffect(() => {
    pingPresence();
    const id = setInterval(pingPresence, INTERVAL_MS);
    const onFocus = () => pingPresence();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
}
