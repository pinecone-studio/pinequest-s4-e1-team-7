"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeClosed, X } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-dvh flex justify-around">
      {/* LEFT SIDE - Product Showcase */}
      <div 
  className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 flex-col justify-between h-screen"
  style={{
    background: "linear-gradient(135deg, var(--teal) 0%, var(--bg-2) 100%)"
  }}
>
  {/* Decorative elements remain the same */}
  <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 -translate-y-1/2 -translate-x-1/4" style={{ background: "var(--teal-2)" }} />
  <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" style={{ background: "var(--olive)" }} />

  {/* Header (Logo) */}
  <div className="relative z-10">
    <Link href="/" className="lnav-logo flex items-center gap-2">
      <img src="/images/logoShar.png" alt="Sign Bridge" className="h-13 w-13 object-contain" />
      <div className="flex items-baseline gap-1">
        <span style={{ color: "var(--olive)", fontWeight: 900, fontSize: "20px" }}>Sign</span>
        <span style={{ color: "var(--text)", fontWeight: 900, fontSize: "20px" }}>Bridge</span>
      </div>
    </Link>
  </div>

  {/* Centered Content Container */}
  <div className="relative z-10 flex flex-col justify-center flex-grow py-12">
    <h1 className="text-white text-5xl font-bold leading-tight tracking-tight mb-6 font-display">
      Дохионы хэлмэрч таны халаасанд
    </h1>
    <p className="text-white/80 text-lg leading-relaxed mb-8">
      Бүртгүүлэхэд дохио, дуу хоолой, видео дуудлагын бүх хэрэгслийг нэг дороос ашигла.
    </p>

    <div className="space-y-4 flex flex-col gap-3">
      <Feature title="Монгол дохионы хэлийг хөрвүүлж яриа болгоно." description="Дохио хэл - Яриа" index={1} />
      <Feature title="Яриаг бичвэр болгож, дохионы хэлтэн уншина." description="Яриа - Бичвэр" index={2} />
      <Feature title="Видео дуудлага дээр дохионы хэлийг шууд хөрвүүлэн уншина." description="Видео дуудлага" index={3} />
    </div>
  </div>

  {/* Footer */}
  <div className="relative z-10 text-white/60 text-sm">
    <p>Технологи, Шийдэл, Харилцаа</p>
  </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div 
        className="w-full lg:w-1/2 flex flex-col relative"
        style={{ background: "var(--bg)" }}
      >
        {/* Top bar with tabs */}
        <div 
          className="flex items-center justify-between px-8 pt-6 border-b"
          style={{ 
            borderColor: "var(--border-c)"
          }}
        >
          <div className="flex gap-2">
            <Link 
              href="/auth/register"
              className="px-6 py-2 font-medium text-sm transition-colors duration-300"
              style={{ color: "var(--text-2)" }}
            >
              Бүртгүүлэх
            </Link>
            <button 
              className="px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 hover:opacity-90"
              style={{ 
                background: "var(--olive)",
                color: "var(--text)"
              }}
            >
              Нэвтрэх
            </button>
          </div>
          <button 
            className="p-2 rounded-full transition-colors duration-300"
            style={{ color: "var(--text-3)" }}
          >
            <Link 
            className="p-2 rounded-full transition-colors duration-300"
            style={{ color: "var(--text-3)" }} href={"/"}          >
            <X/>
          </Link>
          </button>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-4">
              <h2 
                className="text-3xl font-bold mb-2 tracking-tight font-display"
                style={{ color: "var(--text)" }}
              >
                Нэвтрэх
              </h2>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-3)" }}
              >
                Email эсвэл утасны дугаараар нэвтэрнэ
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-5">
              {/* Login ID Field */}
              <div className="group">
                <label 
                  htmlFor="login" 
                  className="block font-semibold text-sm mb-2.5"
                  style={{ color: "var(--text)" }}
                >
                  Email / Утас
                </label>
                <input
                  id="login"
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="name@email.com эсвэл 99112233"
                  className="w-full px-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-300"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-c)",
                    color: "var(--text)"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--olive)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-c)";
                  }}
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password Field */}
              {/* Password Field */}
<div className="group">
  <label 
    htmlFor="password" 
    className="block font-semibold text-sm mb-2.5"
    style={{ color: "var(--text)" }}
  >
    Нууц үг
  </label>
  <div className="relative">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      className="w-full px-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all duration-300 pr-12"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-c)",
        color: "var(--text)"
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--olive)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border-c)";
      }}
      autoComplete="current-password"
      required
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300 hover:bg-white/10"
      style={{ color: "var(--text-2)" }}
    >
      {showPassword ? (
         <Eye className="size-5"/>
      ) : (
        <EyeClosed className="size-5"/>
       
      )}
    </button>
  </div>
</div>

              {/* Error Message */}
              {error && (
                <div 
                  className="flex items-center gap-3 p-4 rounded-xl border"
                  style={{
                    background: "rgba(220, 53, 69, 0.1)",
                    borderColor: "rgba(220, 53, 69, 0.3)",
                    color: "#c0654a"
                  }}
                >
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-8 font-bold text-base rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group"
                style={{
                  background: loading ? "var(--olive)" : `linear-gradient(135deg, var(--olive), var(--olive-2))`,
                  color: "var(--text)",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.boxShadow = "0 8px 24px rgba(245, 197, 24, 0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Нэвтэрч байна...
                  </>
                ) : (
                  <>
                    Нэвтрэх
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <p className="text-center mt-8 text-sm" style={{ color: "var(--text-3)" }}>
              Бүртгэл байхгүй юу?{" "}
              <Link 
                href="/auth/register" 
                className="font-bold transition-colors duration-300"
                style={{ color: "var(--olive)" }}
              >
                Бүртгүүлэх
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
  description 
}: { 
  index: number; 
  title: string; 
  description: string 
}) {
  return (
    <div 
      className="flex gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer group transform hover:scale-102 hover:bg-white/10" 
      style={{ background: "rgba(255,255,255, 0.05)" }}
    >
      {/* Number Display */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm transition-colors duration-300 group-hover:bg-white/20">
        {index.toString().padStart(2, '0')}
      </div>
      
      <div>
        <h3 className="text-white font-bold text-sm mb-1 group-hover:translate-x-1 transition-transform duration-300">
          {title}
        </h3>
        <p className="text-white/70 text-xs">
          {description}
        </p>
      </div>  
    </div>
  );
}