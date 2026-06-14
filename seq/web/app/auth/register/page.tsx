"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Eye,
  EyeClosed,
  X,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";
import { AuthLeftPanel } from "../_components/AuthLeftPanel";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard/translator");
  }, [user, router]);

  if (user) return <DashboardSkeleton />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({ name, email, phone, password });
      router.replace("/dashboard/translator");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа үүслээ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ background: "var(--bg)" }}
    >
      <AuthLeftPanel mode="register" />

      <div
        className="relative z-10 flex w-full flex-col border-l lg:w-7/12 xl:w-1/2"
        style={{ background: "var(--surface)", borderColor: "var(--border-c)" }}
      >
        <div
          className="flex items-center justify-between border-b px-12 pt-12 pb-5"
          style={{ borderColor: "var(--border-c)" }}
        >
          <div className="flex items-center gap-1">
            <button
              className="rounded-full px-5 py-2 text-sm font-bold transition-all"
              style={{ background: "var(--olive)", color: "#0d1e35" }}
            >
              Бүртгүүлэх
            </button>
            <Link
              href="/auth/login"
              className="rounded-full px-5 py-2 text-sm font-medium transition-colors"
              style={{ color: "var(--text-2)" }}
            >
              Нэвтрэх
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-full p-2 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              style={{ color: "var(--text-3)" }}
            >
              <X size={20} />
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-y-auto px-12 py-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2
                className="text-3xl font-black tracking-tight"
                style={{ color: "var(--text)" }}
              >
                Бүртгэл үүсгэх
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>
                Мессеж болон дуудлагад ашиглагдах мэдээллээ оруулна уу.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {[
                {
                  id: "name",
                  label: "Нэр",
                  type: "text",
                  value: name,
                  set: setName,
                  Icon: User,
                  placeholder: "Бат-Эрдэнэ",
                },
                {
                  id: "email",
                  label: "И-мэйл хаяг",
                  type: "email",
                  value: email,
                  set: setEmail,
                  Icon: Mail,
                  placeholder: "example@domain.com",
                },
                {
                  id: "phone",
                  label: "Утасны дугаар",
                  type: "text",
                  value: phone,
                  set: setPhone,
                  Icon: Phone,
                  placeholder: "99112233",
                },
              ].map(({ id, label, type, value, set, Icon, placeholder }) => (
                <div key={id}>
                  <label
                    htmlFor={id}
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-2)" }}
                  >
                    {label}
                  </label>
                  <div className="relative">
                    <Icon
                      className="absolute left-4 top-1/2 -translate-y-1/2 size-4"
                      style={{ color: "var(--text-3)" }}
                    />
                    <input
                      id={id}
                      type={type}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      required
                      className="w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm outline-none transition-all"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border-c)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                </div>
              ))}

              {[
                {
                  id: "password",
                  label: "Нууц үг",
                  value: password,
                  set: setPassword,
                  show: showPassword,
                  toggle: () => setShowPassword((v) => !v),
                },
                {
                  id: "confirm",
                  label: "Нууц үг баталгаажуулах",
                  value: confirmPassword,
                  set: setConfirmPassword,
                  show: showConfirm,
                  toggle: () => setShowConfirm((v) => !v),
                },
              ].map(({ id, label, value, set, show, toggle }) => (
                <div key={id}>
                  <label
                    htmlFor={id}
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-2)" }}
                  >
                    {label}
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 size-4"
                      style={{ color: "var(--text-3)" }}
                    />
                    <input
                      id={id}
                      type={show ? "text" : "password"}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-2xl border py-3.5 pl-11 pr-12 text-sm outline-none transition-all"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border-c)",
                        color: "var(--text)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5"
                      style={{ color: "var(--text-3)" }}
                    >
                      {show ? <Eye size={16} /> : <EyeClosed size={16} />}
                    </button>
                  </div>
                  {id === "confirm" &&
                    confirmPassword &&
                    password !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">
                        Нууц үг таарахгүй байна.
                      </p>
                    )}
                </div>
              ))}

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
                style={{ background: "var(--olive)", color: "#0d1e35" }}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0d1e35] border-t-transparent" />
                    Ачааллаж байна...
                  </>
                ) : (
                  <>Эхлэх</>
                )}
              </button>
            </form>

            <p
              className="mt-6 text-center text-sm"
              style={{ color: "var(--text-3)" }}
            >
              Бүртгэлтэй бол{" "}
              <Link
                href="/auth/login"
                className="font-bold hover:underline"
                style={{ color: "var(--olive)" }}
              >
                Нэвтрэх
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
