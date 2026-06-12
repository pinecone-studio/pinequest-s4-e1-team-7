"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeClosed, X, ArrowRight, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginId, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа үүслээ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--bg)] selection:bg-[var(--olive)] selection:text-slate-900">
      
      {/* ─── LEFT SIDE (BRAND PANEL) ────────────────────────────────────────── */}
<div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden p-16 flex-col justify-between bg-gradient-to-br from-[var(--teal)] via-[var(--teal-2)] to-[var(--bg)]">
  {/* Dynamic Glow Meshes */}
  <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[120px] opacity-30 bg-[var(--olive)] animate-pulse" />
  <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-[120px] opacity-20 bg-[var(--teal)]" />

  {/* Brand Header - Kept Left-Aligned */}
  <div className="relative z-10">
    <Link href="/" className="inline-flex items-center gap-3 group">
      <img
        src="/images/logoShar.png"
        alt="Sign Bridge"
        className="h-13 w-13 object-contain"
      />
      <div className="flex flex-col">
        <div className="flex items-baseline gap-0.5">
          <span className="text-[var(--olive)] font-black text-xl tracking-tight">Sign</span>
          <span className="text-white font-black text-xl tracking-tight">Bridge</span>
        </div>
        <span className="text-white/50 text-[10px] tracking-widest uppercase font-semibold">Interpreter System</span>
      </div>
    </Link>
  </div>

  {/* Value Prop Content - Horizontally and Vertically Centered */}
  <div className="relative z-10 max-w-lg w-full mx-auto my-auto py-12">
    <h1 className="text-white text-4xl xl:text-5xl font-black leading-[1.15] tracking-tight mb-6 font-display drop-shadow-sm">
      Дохионы хэлмэрч <br />
      <span className="text-[var(--olive)]">таны халаасанд</span>
    </h1>
    <p className="text-white/75 text-base xl:text-lg leading-relaxed mb-10 font-medium">
      Бүртгүүлээд дохионы хэлний шууд хөрвүүлэгч, видео дуудлага болон ухаалаг чатын цогц шийдлийг ашиглаж эхэлнэ үү.
    </p>

    {/* Feature Bento Stack */}
    <div className="space-y-3.5">
      <Feature
        title="Дохио - Яриа"
        description="Монгол дохионы хэлийг хөрвүүлж яриа болгоно."
        index={1}
      />
      <Feature
        title="Яриа - Бичвэр"
        description="Яриаг бичвэр болгож, дохионы хэлтэн уншина."
        index={2}
      />
      <Feature
        title="Видео дуудлага"
        description="Видео дуудлага дээр дохионы хэлийг шууд хөрвүүлэн уншина."
        index={3}
      />
    </div>
  </div>

  {/* Brand Footer - Kept Left-Aligned */}
  <div className="relative z-10 flex items-center gap-6 text-white/40 text-xs font-semibold tracking-wider uppercase">
    <span>Технологи</span>
    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
    <span>Шийдэл</span>
    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
    <span>Харилцаа</span>
  </div>
</div>

      {/* ─── RIGHT SIDE (FORM PANEL) ───────────────────────────────────────── */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col bg-[var(--surface)] border-l border-[var(--border-c)]/30 shadow-2xl relative z-10">
        
        {/* Navigation Header */}
         <div

          className="flex items-center justify-between px-8 pt-12 border-b pb-4"

          style={{ borderColor: "rgba(255,255,255,0.08)" }}

        >

          <div className="flex gap-2">

            

            <Link

              href="/auth/register"

              className="px-6 py-2 font-medium text-sm transition-colors duration-300"

              style={{ color: "var(--text)" }}

            >

              Бүртгүүлэх

            </Link>
            <button

              className="px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 hover:opacity-90"

              style={{

                background: "var(--olive)",

                color: "var(--text)",

              }}

            >
Нэвтрэх
              

            </button>

          </div>

          <Link

            className="p-2 rounded-full transition-colors duration-300 hover:bg-white/10"

            style={{ color: "rgba(255,255,255,0.4)" }}

            href="/"

          >

            <X />

          </Link>

        </div>

        {/* Content Body Layout */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12 overflow-y-auto">
          <div className="w-full max-w-md space-y-8">
            
            {/* Title Block */}
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[var(--text)] font-display">
                Нэвтрэх
              </h2>
              <p className="text-sm text-[var(--text-3)] mt-2 font-medium">
                Бүртгэлтэй имэйл хаяг эсвэл утасны дугаараа оруулна уу.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={submit} className="space-y-5">
              
              {/* Login ID Input */}
              <div className="space-y-2">
                <label htmlFor="login" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                  И-мэйл эсвэл Утас
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-[var(--text-3)] group-focus-within:text-[var(--olive)] transition-colors" />
                  <input
                    id="login"
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="name@email.com эсвэл 99112233"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium bg-[var(--surface-2)] border border-[var(--border-c)] text-[var(--text)] placeholder:text-[var(--text-3)]/60 focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/10 outline-none transition-all"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
                    Нууц үг
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-[var(--text-3)] group-focus-within:text-[var(--olive)] transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-medium bg-[var(--surface-2)] border border-[var(--border-c)] text-[var(--text)] placeholder:text-[var(--text-3)]/60 focus:border-[var(--olive)] focus:ring-2 focus:ring-[var(--olive)]/10 outline-none transition-all"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all"
                  >
                    {showPassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert Display */}
              {error && (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-4 font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg bg-gradient-to-r from-[var(--olive)] to-[var(--olive-2)] text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[var(--olive)]/10 hover:shadow-xl hover:brightness-105 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Түр хүлээнэ үү...
                  </>
                ) : (
                  <>
                    Нэвтрэх
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Secondary Option Link */}
            <p className="text-center text-sm text-[var(--text-3)] font-medium">
              Бүртгэл байхгүй юу?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-[var(--olive)] hover:underline underline-offset-4 transition-all"
              >
                Шинээр бүртгүүлэх
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-xl transition-all duration-300 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.02] hover:border-white/[0.08] backdrop-blur-sm group">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--olive)] font-black text-sm transition-colors duration-300 group-hover:bg-white/10 group-hover:border-white/20">
        {index.toString().padStart(2, "0")}
      </div>
      <div className="space-y-0.5">
        <h3 className="text-white font-bold text-sm tracking-wide">
          {title}
        </h3>
        <p className="text-white/60 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}