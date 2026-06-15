"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppMode } from "@/context/AppModeContext";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { UserAvatar } from "../shared/UserAvatar";
import { updateProfile, uploadAvatar } from "@/lib/auth-api";
import { AVATAR_PRESET_KEY } from "../shared/ProfileAvatarButton";
import { CameraIcon, MoonIcon, SunIcon, SpeakerWaveIcon, ArrowRightEndOnRectangleIcon, EyeIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/ui/PageHeader";

const SPEEDS = [{ label: "Удаан", value: 0.7 }, { label: "Хэвийн", value: 1.0 }, { label: "Хурдан", value: 1.5 }] as const;
const GENDERS = [{ label: "Эмэгтэй", value: "female" }, { label: "Эрэгтэй", value: "male" }] as const;

const PRESETS = Array.from({ length: 14 }, (_, i) => `/avatar/avatar${i + 1}.png`);

const inputStyle = {
  background: "var(--surface-2)",
  border: "1px solid var(--border-c)",
  color: "var(--text)",
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} className="h-6 w-11 cursor-pointer rounded-full p-0.5 transition-colors duration-200"
      style={{ background: on ? "var(--olive)" : "var(--surface-2)", border: "1px solid var(--border-c)" }}>
      <div className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200" style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </div>
  );
}

export function Settings() {
  const { settings, updateSettings } = useApp();
  const { theme, toggle } = useTheme();
  const { user, logout, refresh } = useAuth();
  const { mode, setMode } = useAppMode();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showModePicker, setShowModePicker] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [presetAvatar, setPresetAvatar] = useState<string | null>(null);

  const displayName = user?.name ?? user?.email ?? "Хэрэглэгч";
  const email = user?.email ?? "";

  useEffect(() => {
    setEditName(user?.name ?? "");
    setEditPhone(user?.phone ?? "");
  }, [user?.name, user?.phone]);

  useEffect(() => {
    setPresetAvatar(localStorage.getItem(AVATAR_PRESET_KEY));
  }, []);

  const selectPreset = (path: string) => {
    const next = presetAvatar === path ? null : path;
    if (next) {
      localStorage.setItem(AVATAR_PRESET_KEY, next);
    } else {
      localStorage.removeItem(AVATAR_PRESET_KEY);
    }
    setPresetAvatar(next);
    // notify ProfileAvatarButton in the same tab
    window.dispatchEvent(new CustomEvent("sb-preset-avatar", { detail: next }));
  };

  const handleAvatarPick = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadAvatar(file);
      await refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSavingProfile(true);
    setProfileError(null);
    try {
      await updateProfile({ name: editName.trim(), phone: editPhone.trim() });
      await refresh();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setSavingProfile(false);
    }
  };

  const profileDirty =
    editName.trim() !== (user?.name ?? "").trim() ||
    editPhone.trim() !== (user?.phone ?? "").trim();

  const effectiveAvatar = presetAvatar ?? user?.avatarUrl;

  const activeBtn = { background: "var(--olive)", color: "#0d1e35" };
  const inactiveBtn = { background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border-c)" };
  const card = { background: "var(--surface)", border: "1px solid var(--border-c)" };

  return (
    <div className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ background: "var(--bg)" }}>
    <div className="mx-auto max-w-lg px-4 md:px-6 pb-[max(calc(env(safe-area-inset-bottom)+1rem),1.5rem)] lg:max-w-2xl lg:px-10 xl:px-16">
      <PageHeader title="Тохиргоо" />

      {/* ── Profile card ── */}
      <div className="mb-4 rounded-[22px] p-5" style={card}>
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
          Профайл
        </p>
        <div className="flex items-start gap-4">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="relative shrink-0 transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
            aria-label="Профайл зураг солих"
          >
            <UserAvatar name={displayName} avatarUrl={effectiveAvatar} size={72} />
            <span
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: "var(--olive)", color: "#0d1e35", border: "2px solid var(--surface)" }}
            >
              <CameraIcon className="h-4 w-4" />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void handleAvatarPick(e.target.files?.[0] ?? null)}
          />
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>
                Нэр
              </label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-[15px] outline-none"
                style={inputStyle}
                placeholder="Нэр"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>
                Утас
              </label>
              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                inputMode="tel"
                className="w-full rounded-xl px-3 py-2.5 text-[15px] outline-none"
                style={inputStyle}
                placeholder="Утасны дугаар"
              />
            </div>
            {email && (
              <div>
                <label className="mb-1 block text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>
                  Email
                </label>
                <input
                  value={email}
                  readOnly
                  className="w-full rounded-xl px-3 py-2.5 text-[15px] opacity-70 outline-none"
                  style={inputStyle}
                />
              </div>
            )}
            <button
              type="button"
              disabled={!profileDirty || !editName.trim() || savingProfile}
              onClick={() => void handleSaveProfile()}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:hover:brightness-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
              style={{ background: "var(--olive)", color: "#0d1e35" }}
            >
              {savingProfile ? "Хадгалж байна…" : "Хадгалах"}
            </button>
            {uploadError && (
              <p className="text-[12px] font-medium text-[hsl(var(--destructive))]">{uploadError}</p>
            )}
            {profileError && (
              <p className="text-[12px] font-medium text-[hsl(var(--destructive))]">{profileError}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Avatar preset picker ── */}
      <div className="mb-4 rounded-[22px] p-5" style={card}>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
          Аватар сонгох
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRESETS.map((src) => {
            const selected = presetAvatar === src;
            return (
              <button
                key={src}
                type="button"
                onClick={() => selectPreset(src)}
                aria-label={`Аватар сонгох: ${src}`}
                aria-pressed={selected}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full transition-all duration-150 hover:scale-110 hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
                style={{
                  border: selected
                    ? "2.5px solid var(--olive)"
                    : "2px solid var(--border-c)",
                  boxShadow: selected
                    ? "0 0 0 2px var(--olive)"
                    : "none",
                }}
              >
                <img
                  src={src}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-cover"
                />
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full"
                    style={{ background: "rgba(246,201,69,0.28)" }}>
                    <CheckIcon className="h-4 w-4" style={{ color: "var(--olive)" }} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {presetAvatar && (
          <button
            type="button"
            onClick={() => selectPreset(presetAvatar)}
            className="mt-3 w-full rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
            style={inactiveBtn}
          >
            Аватар арилгах
          </button>
        )}
      </div>

      {/* ── Dark / light mode ── */}
      <div className="mb-4 rounded-[22px] p-5" style={card}>
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Харагдац</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark"
              ? <MoonIcon className="h-5 w-5" style={{ color: "var(--text-2)" }} />
              : <SunIcon className="h-5 w-5" style={{ color: "var(--text-2)" }} />}
            <div>
              <p className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>Бараан горим</p>
              <p className="text-[12px]" style={{ color: "var(--text-3)" }}>{theme === "dark" ? "Идэвхтэй" : "Идэвхгүй"}</p>
            </div>
          </div>
          <Toggle on={theme === "dark"} onChange={toggle} />
        </div>
      </div>

      {/* ── Accessibility ── */}
      <div className="mb-4 rounded-[22px] p-5" style={card}>
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
          Хүртээмж
        </p>
        <div className="flex w-full items-center gap-3 px-1 py-2">
          <EyeIcon className="h-5 w-5 shrink-0" style={{ color: mode === "accessible" ? "#ffbf00" : "var(--text-2)" }} />
          <div>
            <p className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>
              {mode === "accessible" ? "Харааны бэрхшээлтэй горим" : "Энгийн горим"}
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
              {mode === "accessible" ? "Брайль бичих, дуу уншуулах, зөвхөн чат" : "Дохио, дуудлага, толь, бүх функц"}
            </p>
          </div>
        </div>
        {!showModePicker ? (
          <button
            type="button"
            onClick={() => setShowModePicker(true)}
            className="mt-2 w-full rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
            style={inactiveBtn}
          >
            Горим дахин сонгох
          </button>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {([
              { mode: "standard" as const, title: "Энгийн горим", desc: "Дохио, дуудлага, толь, бүх функц" },
              { mode: "accessible" as const, title: "Харааны бэрхшээлтэй горим", desc: "Брайль бичих, дуу уншуулах, зөвхөн чат" },
            ]).map((opt) => (
              <button
                key={opt.mode}
                type="button"
                onClick={() => { setMode(opt.mode); setShowModePicker(false); router.push(opt.mode === "accessible" ? "/accessible/chat" : "/dashboard/overview"); }}
                className="w-full rounded-xl px-4 py-3 text-left transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
                style={mode === opt.mode ? activeBtn : inactiveBtn}
              >
                <span className="block text-[14px] font-bold">{opt.title}</span>
                <span className="mt-0.5 block text-[12px] opacity-70">{opt.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Voice ── */}
      <div className="mb-4 rounded-[22px] p-5" style={card}>
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Дуу хоолой</p>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SpeakerWaveIcon className="h-5 w-5" style={{ color: "var(--text-2)" }} />
            <p className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>Автоматаар унших</p>
          </div>
          <Toggle on={settings.autoSpeak} onChange={() => updateSettings({ autoSpeak: !settings.autoSpeak })} />
        </div>
        <p className="mb-2 text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>Хоолойн төрөл</p>
        <div className="mb-4 flex gap-2">
          {GENDERS.map(({ label, value }) => (
            <button key={value} onClick={() => updateSettings({ gender: value })} className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
              style={settings.gender === value ? activeBtn : inactiveBtn}>{label}</button>
          ))}
        </div>
        <p className="mb-2 text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>Унших хурд</p>
        <div className="flex gap-2">
          {SPEEDS.map(({ label, value }) => (
            <button key={value} onClick={() => updateSettings({ rate: value })} className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
              style={settings.rate === value ? activeBtn : inactiveBtn}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── Logout ── */}
      <button onClick={() => { logout(); router.push("/"); }}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all duration-150 hover:bg-[hsl(var(--destructive)/0.08)] hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--destructive))]"
        style={{ ...card, color: "hsl(var(--destructive))" }}>
        <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
        Гарах
      </button>
    </div>
    </div>
  );
}
