"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MicrophoneIcon } from "@heroicons/react/24/outline";
const MicIcon = MicrophoneIcon;

type Msg = { id: string; sender: "me" | "partner"; text: string };

const MSGS: Msg[] = [
  { id:"m0", sender:"partner", text:"Сайн уу. Чи өнөөдөр завтай юу?" },
  { id:"m1", sender:"me",      text:"Сайн уу. Тийм ээ, яасан зав байна?" },
  { id:"m2", sender:"partner", text:"Дохионы хөрвүүлэг дээр тусламж хэрэгтэй байна 🙏" },
  { id:"m3", sender:"me",      text:"Мэдээж! Видео дуудлага хийх үү?" },
  { id:"m4", sender:"partner", text:"Маш их баярлалаа. одоо боломжтой юу 👍" },
  { id:"m5", sender:"me",      text:"Одоо шууд залгаж болохоор байна аа." },
];

const AV_ME  = "/avatar/avatar1.png";
const AV_PTR = "/avatar/avatar2.png";

function Dots() {
  return (
    <span className="flex items-center gap-[3px] px-3.5 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="block rounded-full"
          style={{ width: 6, height: 6, background: "rgba(255,255,255,0.5)" }}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.27, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isMe = msg.sender === "me";
  return (
    <motion.div className={`flex items-center gap-2${isMe ? " flex-row-reverse" : ""}`}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
  
      <div style={{ width: 32, height: 32, flexShrink: 0 }}>
        <img src={isMe ? AV_ME : AV_PTR} alt="" aria-hidden
          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover",
                   objectPosition: "top", display: "block" }} />
      </div>

      <p style={{
        maxWidth: "68%", padding: "8px 14px", paddingBottom: "calc(8px + 0.15em)",
        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isMe ? "#f6c945" : "#1c2733",
        color: isMe ? "#0d1b2a" : "rgba(255,255,255,0.92)",
        fontSize: 13, lineHeight: 1.45, fontWeight: 500, wordBreak: "break-word",
      }}>
        {msg.text}
      </p>
    </motion.div>
  );
}

export function HeroChat({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(0);
  const [typing, setTyping]   = useState(false);
  const started   = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    if (reduce) { setVisible(MSGS.length); return; }

    const T: ReturnType<typeof setTimeout>[] = [];
    let t = 0;
    MSGS.forEach((msg, i) => {
      if (msg.sender === "partner") {
        T.push(setTimeout(() => setTyping(true), t));  t += 650;
        T.push(setTimeout(() => { setTyping(false); setVisible(i + 1); }, t));
      } else {
        T.push(setTimeout(() => setVisible(i + 1), t));
      }
      t += 520;
    });
    T.push(setTimeout(() => setTyping(true), t));
    return () => T.forEach(clearTimeout);
  }, [active, reduce]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visible, typing]);

  const shown = MSGS.slice(0, visible);

  return (
    /* Outer container: fully transparent — parent image/bg shows through */
    <div className="absolute inset-0 flex items-center justify-center"
      aria-hidden="true">

      {/* Floating phone frame */}
      <div className="relative flex h-[90%] w-[68%] flex-col overflow-hidden"
        style={{
          borderRadius: 24,
          background: "rgba(9, 14, 20, 0.55)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1.5px solid rgba(255,255,255,0.13)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.05), 0 28px 72px rgba(0,0,0,0.6)",
        }}>

        {/* Header */}
        <div className="flex shrink-0 items-center gap-2.5 px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <img src={AV_PTR} alt="" aria-hidden
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", objectPosition: "top" }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>SignBridge</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.42)" }}>Онлайн</p>
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-y-auto px-3 py-3
                        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {shown.map((msg) => <Bubble key={msg.id} msg={msg} />)}
          <AnimatePresence>
            {typing && (
              <motion.div key="typing" className="flex items-end gap-2"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.22 }}>
                <div style={{ width: 32, height: 32, flexShrink: 0 }}>
                  <img src={AV_PTR} alt="" aria-hidden
                    style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover",
                             objectPosition: "top", display: "block" }} />
                </div>
                <div style={{ borderRadius: "18px 18px 18px 4px", background: "#1c2733" }}>
                  <Dots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex shrink-0 items-center gap-2.5 px-3 py-2.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <MicIcon style={{ width: 22, height: 22, color: "rgba(255,255,255,0.38)", flexShrink: 0 }} />
          <div className="flex-1 rounded-full px-3.5 py-2"
            style={{ background: "rgba(255,255,255,0.07)", fontSize: 13, color: "rgba(255,255,255,0.28)" }}>
            Мессеж…
          </div>
          <MicrophoneIcon style={{ width: 22, height: 22, color: "rgba(255,255,255,0.38)", flexShrink: 0 }} />
        </div>

      </div>
    </div>
  );
}
