"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { cx } from "@/lib/utils";

export function Settings() {
  const { user, setUser, settings, updateSettings } = useApp();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  return (
    <section className="db-section">
      <SectionHeader crumb="Тохиргоо" title="Тохиргоо"
        subtitle="Дуу хоолой, харагдац, бүртгэлээ тохируулна." />
      <div className="set-grid">
        <Card title="Дуу хоолой">
          <div className="dbset-row"><span className="ic"><Icon name="user-round" size={19} /></span>
            <div className="tx"><div className="t">Хоолойн төрөл</div><div className="s">Орчуулга уншигч</div></div></div>
          <div className="dbseg">
            {(["female", "male"] as const).map((g) => (
              <button key={g} className={cx("o", settings.gender === g && "active")} onClick={() => updateSettings({ gender: g })}>
                {g === "female" ? "Эмэгтэй" : "Эрэгтэй"}
              </button>
            ))}
          </div>
          <div className="dbset-row"><span className="ic"><Icon name="gauge" size={19} /></span>
            <div className="tx"><div className="t">Унших хурд</div><div className="s">{settings.rate.toFixed(1)}×</div></div></div>
          <input type="range" min={0.6} max={1.6} step={0.1} value={settings.rate}
            onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })} style={{ width: "100%" }} />
        </Card>
        <Card title="Харагдац ба бүртгэл">
          <div className="dbset-row"><span className="ic"><Icon name="moon" size={19} /></span>
            <div className="tx"><div className="t">Бараан горим</div><div className="s">Гэрэл / бараан</div></div>
            <Toggle on={theme === "dark"} onChange={toggle} /></div>
          <div className="dbset-row"><span className="ic"><Icon name="volume-2" size={19} /></span>
            <div className="tx"><div className="t">Автоматаар унших</div><div className="s">Дохиог дуугаар уншина</div></div>
            <Toggle on={settings.autoSpeak} onChange={() => updateSettings({ autoSpeak: !settings.autoSpeak })} /></div>
          <div className="dbset-row"><span className="ic"><Icon name="mail" size={19} /></span>
            <div className="tx"><div className="t">{user?.email}</div><div className="s">Нэвтэрсэн бүртгэл</div></div></div>
          <button className="db-logout" onClick={() => { setUser(null); router.push("/"); }}>
            <Icon name="log-out" size={18} /> Гарах
          </button>
        </Card>
      </div>
    </section>
  );
}
