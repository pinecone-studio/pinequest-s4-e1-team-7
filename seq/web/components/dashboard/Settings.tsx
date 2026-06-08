"use client";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { MoonIcon, SunIcon, SpeakerWaveIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { initial } from "@/lib/utils";

const SPEEDS = [{ label: "Удаан", value: 0.7 }, { label: "Хэвийн", value: 1.0 }, { label: "Хурдан", value: 1.5 }] as const;
const GENDERS = [{ label: "Эмэгтэй", value: "female" }, { label: "Эрэгтэй", value: "male" }] as const;

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
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const name = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "Хэрэглэгч";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const avatar = user?.imageUrl;
  const activeBtn = { background: "var(--olive)", color: "black" };
  const inactiveBtn = { background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border-c)" };
  const card = { background: "var(--surface)", border: "1px solid var(--border-c)" };

  return (
    <div className="min-h-[calc(100dvh-56px)] p-5" style={{ background: "var(--bg)" }}>

      <div className="mb-4 rounded-[22px] p-5" style={card}>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full" style={{ border: "2px solid var(--border-c)" }}>
            {avatar
              ? <img src={avatar} alt={name} className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center text-[20px] font-bold"
                  style={{ background: "linear-gradient(150deg, var(--olive-bright), var(--olive-deep))", color: "#0d1e35" }}>{initial(name)}</div>}
          </div>
          <div>
            <p className="text-[17px] font-bold" style={{ color: "var(--text)" }}>{name}</p>
            {email && <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-3)" }}>{email}</p>}
          </div>
        </div>
      </div>

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
            <button key={value} onClick={() => updateSettings({ gender: value })} className="flex-1 rounded-full py-2 text-[13px] font-semibold transition-all duration-150 hover:brightness-105 active:scale-95"
              style={settings.gender === value ? activeBtn : inactiveBtn}>{label}</button>
          ))}
        </div>
        <p className="mb-2 text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>Унших хурд</p>
        <div className="flex gap-2">
          {SPEEDS.map(({ label, value }) => (
            <button key={value} onClick={() => updateSettings({ rate: value })} className="flex-1 rounded-full py-2 text-[13px] font-semibold transition-all duration-150 hover:brightness-105 active:scale-95"
              style={settings.rate === value ? activeBtn : inactiveBtn}>{label}</button>
          ))}
        </div>
      </div>

      <button onClick={() => signOut(() => router.push("/"))}
        className="flex w-full items-center justify-center gap-2 rounded-[22px] px-5 py-4 text-[15px] font-semibold transition-all duration-150 hover:bg-[rgba(229,53,53,0.06)] active:scale-[0.98] active:opacity-80"
        style={{ ...card, color: "#e53535" }}>
        <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
        Гарах
      </button>
    </div>
  );
}
