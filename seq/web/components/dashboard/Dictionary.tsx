"use client";
import { useApp } from "@/context/AppContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { DICTIONARY } from "@/lib/constants";

export function Dictionary() {
  const { settings, toast } = useApp();
  const { speak } = useTextToSpeech();

  const say = (word: string) => {
    speak(word, settings);
    toast("info", `Уншиж байна: ${word}`, "volume-2");
  };

  return (
    <section className="db-section">
      <SectionHeader crumb="Толь бичиг" title="Толь бичиг"
        subtitle="Түгээмэл дохио, хэллэгүүд. Дуугаар сонсохын тулд товшино уу." />
      <div className="dict-grid">
        {DICTIONARY.map((d) => (
          <button className="dict-card" key={d.word} onClick={() => say(d.word)}>
            <span className="ic"><Icon name="hand" size={23} /></span>
            <div className="w">{d.word}</div>
            <div className="p"><Icon name="volume-2" size={14} /> {d.note}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
