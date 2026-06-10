"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginId, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div
        className="w-full max-w-md rounded-[28px] p-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border-c)", boxShadow: "var(--shadow)" }}
      >
        <h1 className="mb-1 text-[26px] font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Нэвтрэх
        </h1>
        <p className="mb-6 text-[14px]" style={{ color: "var(--text-3)" }}>
          Email эсвэл утасны дугаараар нэвтэрнэ
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="login">Email / Утас</Label>
            <input
              id="login"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="mt-1.5 w-full rounded-2xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[var(--olive)]"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)", color: "var(--text)" }}
              autoComplete="username"
            />
          </div>
          <div>
            <Label htmlFor="password">Нууц үг</Label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-2xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[var(--olive)]"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)", color: "var(--text)" }}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-[13px] font-medium text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl text-[15px] font-bold">
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[14px]" style={{ color: "var(--text-3)" }}>
          Бүртгэл байхгүй юу?{" "}
          <Link href="/auth/register" className="font-bold" style={{ color: "var(--olive)" }}>
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </div>
  );
}
