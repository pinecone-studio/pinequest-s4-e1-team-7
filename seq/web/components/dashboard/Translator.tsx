"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useCamera } from "@/hooks/useCamera";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useInterval } from "@/hooks/useInterval";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { SIGN_PHRASES } from "@/lib/constants";
import { cx, pick } from "@/lib/utils";

export function Translator() {
  const { settings, pushHistory } = useApp();
  const { videoRef, on, start, stop } = useCamera();
  const { speak } = useTextToSpeech();
  const [running, setRunning] = useState(false);
  const [voice, setVoice] = useState(true);
  const [detected, setDetected] = useState("");
  const [seq, setSeq] = useState<string[]>([]);

  useInterval(() => {
    const phrase = pick(SIGN_PHRASES);
    setDetected(phrase);
    setSeq((s) => [phrase, ...s].slice(0, 6));
    if (voice && settings.autoSpeak) speak(phrase, settings);
    pushHistory("sign", phrase);
  }, running ? 3600 : null);

  const toggle = async () => {
    if (!on) await start();
    setRunning((r) => !r);
  };
  const clear = () => { setDetected(""); setSeq([]); };

  return (
    <section className="db-section">
      <SectionHeader crumb="Орчуулагч" title="Шууд орчуулагч"
        subtitle="Дохионы хэлийг бодит цагт танин, монгол дуу хоолой болгоно." />
      <div className="lt-grid">
        <Card className="lt-cam-card">
          <div className="lt-stage">
            <video ref={videoRef} autoPlay playsInline muted />
            {running && <div className="lt-scan on" />}
            {!on && (
              <div className="lt-camoff">
                <Icon name="camera-off" size={46} />
                <p>Камер унтраалттай байна</p>
                <button className="on" onClick={start}><Icon name="camera" size={18} /> Асаах</button>
              </div>
            )}
          </div>
          <div className="lt-cam-btns">
            <button className={cx("lt-btn go", running && "stop")} onClick={toggle}>
              <Icon name={running ? "square" : "play"} size={18} /> {running ? "Зогсоох" : "Орчуулж эхлэх"}
            </button>
            <button className="lt-btn ghost" onClick={() => { stop(); setRunning(false); clear(); }}>
              <Icon name="eraser" size={18} /> Цэвэрлэх
            </button>
          </div>
        </Card>
        <div className="lt-side">
          <Card title="Шууд илрүүлэлт">
            <div className="lt-detect">{detected ? <span className="word">{detected}</span> : <span className="ph">Дохио хүлээж байна…</span>}</div>
          </Card>
          <Card>
            <div className="lt-out-h">
              <div className="db-card-h">Монгол гаралт</div>
              <button className={cx("lt-voice", !voice && "off")} onClick={() => setVoice((v) => !v)}>
                <Icon name={voice ? "volume-2" : "volume-x"} size={15} /> {voice ? "Дуу хоолой асаалттай" : "Унтраалттай"}
              </button>
            </div>
            <div className={cx("lt-out-text", !detected && "ph")}>{detected || "Орчуулсан өгүүлбэр энд гарч ирнэ…"}</div>
            <div className="lt-seq-l">Илрүүлсэн дараалал:</div>
            <div className="lt-seq">
              {seq.length ? seq.map((s, i) => <span className="chip" key={i}>{s}</span>) : <span className="none">Одоогоор дохио илрээгүй байна.</span>}
            </div>
          </Card>
        </div>
      </div>
      <div className="lt-foot"><span className="g" /> 100% төхөөрөмж дээр аюулгүй боловсруулна</div>
    </section>
  );
}
