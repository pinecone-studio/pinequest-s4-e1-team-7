"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatarUrl?: string | null;
};

type AuthValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);
const TOKEN_KEY = "sb_token";
const USER_CACHE_KEY = "sb_user_cache_v1";

function readCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: AuthUser | null) {
  try {
    if (user) sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(USER_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

async function authFetch(path: string, init?: RequestInit, token?: string | null) {
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!API) {
    throw new Error("API хаяг тохируулаагүй (NEXT_PUBLIC_API_URL)");
  }
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...init, headers });
  } catch {
    throw new Error("Server-т холбогдож чадсангүй. wrangler dev ажиллаж байгаа эсэхийг шалгана уу.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : null;
    if (res.status === 404) {
      throw new Error(msg ?? "API олдсонгүй. Server-ийг шинэчлэн deploy хийсэн эсэхээ шалгана уу.");
    }
    throw new Error(msg ?? `Алдаа (${res.status})`);
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((nextToken: string | null, nextUser: AuthUser | null) => {
    setToken(nextToken);
    setUser(nextUser);
    writeCachedUser(nextUser);
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      document.cookie = `sb_token=${nextToken}; path=/; max-age=${60 * 60 * 24 * 14}; SameSite=Lax`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = "sb_token=; path=/; max-age=0";
    }
  }, []);

  const refresh = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      persist(null, null);
      return;
    }
    try {
      const me = await authFetch("/api/auth/me", {}, stored);
      persist(stored, me as AuthUser);
    } catch {
      persist(null, null);
    }
  }, [persist]);

  useEffect(() => {
    const cached = readCachedUser();
    const stored = localStorage.getItem(TOKEN_KEY);
    if (cached && stored) {
      setUser(cached);
      setToken(stored);
      setLoading(false);
    }

    void (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const login = useCallback(
    async (loginId: string, password: string) => {
      const data = await authFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ login: loginId, password }),
      });
      persist(data.token, data.user);
    },
    [persist],
  );

  const register = useCallback(
    async (payload: { name: string; email: string; phone: string; password: string }) => {
      const data = await authFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      persist(data.token, data.user);
    },
    [persist],
  );

  const logout = useCallback(() => persist(null, null), [persist]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refresh }),
    [user, token, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth within AuthProvider");
  return ctx;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
