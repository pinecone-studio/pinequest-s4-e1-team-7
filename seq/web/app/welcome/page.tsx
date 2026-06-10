import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4" style={{ background: "var(--bg)" }}>
      <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Sign Bridge</h1>
      <p className="text-center text-[15px]" style={{ color: "var(--text-3)" }}>
        Монгол дохионы хэл ↔ текст бодит цагийн орчуулга
      </p>
      <div className="flex gap-3">
        <Link href="/auth/login" className="rounded-2xl px-6 py-3 font-bold" style={{ background: "var(--surface-2)", color: "var(--text)" }}>
          Нэвтрэх
        </Link>
        <Link href="/auth/register" className="rounded-2xl px-6 py-3 font-bold" style={{ background: "var(--olive)", color: "#0d1e35" }}>
          Бүртгүүлэх
        </Link>
      </div>
    </div>
  );
}
