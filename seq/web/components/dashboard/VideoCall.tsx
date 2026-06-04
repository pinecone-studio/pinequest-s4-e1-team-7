"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useCamera } from "@/hooks/useCamera";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useInterval } from "@/hooks/useInterval";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { CALL_PHRASES } from "@/lib/constants";
import { cx, pick } from "@/lib/utils";

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function VideoCall() {
  const { settings, pushHistory } = useApp();
  const { videoRef, on, start, stop } = useCamera();
  const { speak, stop: hush } = useTextToSpeech();
  const [active, setActive] = useState(false);
  const [secs, setSecs] = useState(0);
  const [caption, setCaption] = useState("Холбогдож байна…");

  useInterval(() => setSecs((s) => s + 1), active ? 1000 : null);
  useInterval(() => {
    const p = pick(CALL_PHRASES);
    setCaption(p);
    speak(p, settings);
    pushHistory("sign", p);
  }, active && secs > 1 ? 4200 : null);

  const begin = async () => { await start(); setActive(true); setSecs(0); };
  const end = () => { setActive(false); hush(); stop(); setSecs(0); setCaption("Холбогдож байна…"); };

  return (
    <section className="db-section">
      <SectionHeader crumb="Видео дуудлага" title="Видео дуудлага"
        subtitle="Нөгөө талын дохиог шууд монгол дуу хоолой болгож хэлмэрчилнэ." />
      <div className="vc-stage">
        {active ? (
          <>
            <div className="vc-timer"><span className="g" /> {fmt(secs)}</div>
            <div className="vc-self"><video ref={videoRef} autoPlay playsInline muted />{!on && <div className="ph"><Icon name="user" size={26} /></div>}</div>
            <div className="vc-signer">
              <div className={cx("vc-ring", secs > 1 && "on")}><Icon name="hand" size={58} /></div>
              <div className="vc-name">Бат-Эрдэнэ</div>
              <div className="vc-status">{secs > 1 ? "Дохиолж байна…" : "Холбогдож байна…"}</div>
            </div>
            <div className="vc-cap show"><div className="card">
              <div className="l"><Icon name="audio-lines" size={13} /> Шууд хэлмэрчилж байна</div>
              <div className="t">{caption}</div>
            </div></div>
            <div className="vc-ctrl">
              <button className="vc-cbtn" onClick={hush}><Icon name="mic" size={22} /></button>
              <button className="vc-cbtn on"><Icon name="languages" size={22} /></button>
              <button className="vc-cbtn end" onClick={end}><Icon name="phone-off" size={22} /></button>
              <button className="vc-cbtn"><Icon name="volume-2" size={22} /></button>
            </div>
          </>
        ) : (
          <div className="vc-startwrap">
            <button className="vc-start" onClick={begin}><Icon name="video" size={20} /> Дуудлага эхлүүлэх</button>
          </div>
        )}
      </div>
    </section>
  );
}
