"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeClosed, X, Mail, Lock } from "lucide-react";
import { AuthLeftPanel } from "../_components/AuthLeftPanel";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [loginId, setLoginId]           = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard/translator");
  }, [user, router]);

  if (user) return <DashboardSkeleton />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(loginId, password);
      const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      router.replace(next ?? "/dashboard/translator");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа үүслээ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full" style={{ background: "var(--bg)" }}>
      <AuthLeftPanel mode="login" />

      <div className="relative z-10 flex w-full flex-col border-l lg:w-7/12 xl:w-1/2" style={{ background: "var(--surface)", borderColor: "var(--border-c)" }}>
        <div className="flex items-center justify-between border-b px-12 pt-12 pb-5" style={{ borderColor: "var(--border-c)" }}>
          <div className="flex items-center gap-1">
            <Link href="/auth/register" className="rounded-full px-5 py-2 text-sm font-medium transition-colors"
              style={{ color: "var(--text-2)" }}>
              Бүртгүүлэх
            </Link>
            <button className="rounded-full px-5 py-2 text-sm font-bold transition-all"
              style={{ background: "var(--olive)", color: "#0d1e35" }}>
              Нэвтрэх
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="rounded-full p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              style={{ color: "var(--text-3)" }}>
              <X size={20} />
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-y-auto px-12 py-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>Нэвтрэх</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>Бүртгэлтэй и-мэйл хаяг эсвэл утасны дугаараа оруулна уу.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="login" className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>И-мэйл эсвэл Утас</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4" style={{ color: "var(--text-3)" }} />
                  <input id="login" type="text" value={loginId} onChange={e => setLoginId(e.target.value)}
                    placeholder="name@email.com эсвэл 99112233" autoComplete="username" required
                    className="w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm outline-none transition-all"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border-c)", color: "var(--text)" }} />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Нууц үг</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4" style={{ color: "var(--text-3)" }} />
                  <input id="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required
                    className="w-full rounded-2xl border py-3.5 pl-11 pr-12 text-sm outline-none transition-all"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border-c)", color: "var(--text)" }} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5" style={{ color: "var(--text-3)" }}>
                    {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
                  </button>
                </div>
              </div>

              {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>}

              <button type="submit" disabled={loading}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
                style={{ background: "var(--olive)", color: "#0d1e35" }}>
                {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0d1e35] border-t-transparent" />Ачааллаж байна...</>
                         : <>Эхлэх</>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: "var(--text-3)" }}>
              Шинэ хэрэглэгчээр {" "}
              <Link href="/auth/register" className="font-bold hover:underline" style={{ color: "var(--olive)" }}>Бүртгүүлэх</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
