"use client";
import { useCallback, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { cx } from "@/lib/utils";

export function VoiceToText() {
  const { pushHistory, toast } = useApp();
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");

  const handle = useCallback((t: string, final: boolean) => {
    if (final) {
      setText((prev) => prev + t + " ");
      setInterim("");
      pushHistory("voice", t);
    } else setInterim(t);
  }, [pushHistory]);

  const { listening, start, stop, supported } = useSpeechRecognition(handle);

  const toggle = () => {
    if (listening) return stop();
    if (!start()) toast("warn", "Хөтөч монгол яриаг дэмжихгүй байна", "captions");
  };

  return (
    <section className="db-section">
      <SectionHeader crumb="Бичвэр" title="Дуу хоолой → Бичвэр"
        subtitle="Монгол яриаг шууд том, уншихад хялбар бичвэр болгоно." />
      <div className="vt-grid">
        <div className="vt-mic-card">
          <button className={cx("vt-orb", listening && "on")} onClick={toggle} disabled={!supported}>
            <Icon name="mic" size={48} />
          </button>
          <div className={cx("vt-state", listening && "on")}>
            {listening ? "Сонсож байна…" : "Эхлэхэд товшино уу"}
          </div>
        </div>
        <div className="vt-text-card">
          {text || interim ? (
            <div className="vt-text">{text}<span className="dim">{interim}</span><span className="vt-cur" /></div>
          ) : (
            <div className="vt-empty"><Icon name="captions" size={42} /><p>Энд бичвэр шууд гарч ирнэ</p></div>
          )}
        </div>
      </div>
    </section>
  );
}
