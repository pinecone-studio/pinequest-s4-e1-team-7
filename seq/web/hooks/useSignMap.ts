"use client";
import { useEffect, useState } from "react";
import type { SignEntry } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useSignMap(): Map<string, string> {
  const [map, setMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/api/signs?category=alphabet`).then((r) =>
        r.ok ? (r.json() as Promise<SignEntry[]>) : [],
      ),
      fetch(`${BASE}/api/signs?category=number`).then((r) =>
        r.ok ? (r.json() as Promise<SignEntry[]>) : [],
      ),
    ])
      .then(([alpha, nums]) => {
        const m = new Map<string, string>();
        [...alpha, ...nums].forEach((s) => m.set(s.label.toUpperCase(), s.url));
        setMap(m);
      })
      .catch(() => {});
  }, []);

  return map;
}
