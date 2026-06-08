import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function WelcomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-between px-6 py-12"
      style={{ background: "var(--bg)" }}
    >
      {/* Logo */}
      <div className="flex w-full items-center justify-center pt-4">
        <img
          src="/images/logo.png"
          alt="Sign Bridge"
          className="h-14 w-14 rounded-2xl object-cover"
        />
      </div>

      {/* Hero illustration */}
      <div className="flex flex-1 items-center justify-center py-8">
        <img
          src="/images/greeting.png"
          alt=""
          className="max-h-72 w-auto select-none"
          draggable={false}
        />
      </div>

      {/* Copy + CTA */}
      <div className="w-full max-w-sm space-y-8 pb-6">
        <div className="space-y-2 text-center">
          <h1
            className="text-[32px] font-extrabold leading-tight tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Дохионы хэлийг<br />хүн бүрт ойртуул
          </h1>
          <p className="text-[15px]" style={{ color: "var(--text-3)" }}>
            Бодит цагийн орчуулга — хэлний саад тотгорыг арилга.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <SignUpButton mode="redirect" fallbackRedirectUrl="/dashboard">
            <button
              className="w-full rounded-2xl py-4 text-[16px] font-bold transition-opacity active:opacity-80"
              style={{ background: "var(--olive)", color: "var(--text)" }}
            >
              Бүртгүүлэх
            </button>
          </SignUpButton>

          <SignInButton mode="redirect" fallbackRedirectUrl="/dashboard">
            <button
              className="w-full rounded-2xl py-4 text-[16px] font-semibold transition-opacity active:opacity-80"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border-c)",
              }}
            >
              Нэвтрэх
            </button>
          </SignInButton>
        </div>
      </div>
    </main>
  );
}
