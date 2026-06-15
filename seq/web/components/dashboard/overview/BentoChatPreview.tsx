"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PhotoIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

type Msg = { id: string; sender: "me" | "partner"; text: string };

const MSGS: Msg[] = [
  { id: "m0", sender: "partner", text: "Сайн уу. Чи өнөөдөр завтай юу?" },
  { id: "m1", sender: "me",      text: "Сайн уу. Тийм ээ, яасан зав байна?" },
  { id: "m2", sender: "partner", text: "Дохионы хөрвүүлэг дээр тусламж хэрэгтэй байна 🙏" },
  { id: "m3", sender: "me",      text: "Мэдээж! Видео дуудлага хийх үү?" },
  { id: "m4", sender: "partner", text: "Маш их баярлалаа. одоо боломжтой юу 👍" },
  { id: "m5", sender: "me",      text: "Одоо шууд залгаж болохоор байна аа." },
];

const AV_ME  = "/avatar/avatar1.png";
const AV_PTR = "/avatar/avatar2.png";

function Dots() {
  return (
    <span className="flex items-center gap-[3px] px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="block rounded-full"
          style={{ width: 5, height: 5, background: "var(--text-3)" }}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.27, ease: "easeInOut" }} />
      ))}
    </span>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isMe = msg.sender === "me";
  return (
    <motion.div className={`flex items-center gap-1.5${isMe ? " flex-row-reverse" : ""}`}
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
      <div style={{ width: 26, height: 26, flexShrink: 0 }}>
        <img src={isMe ? AV_ME : AV_PTR} alt="" aria-hidden
          style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover",
                   objectPosition: "top", display: "block" }} />
      </div>
      <p style={{
        maxWidth: "70%", padding: "6px 11px", paddingBottom: "calc(6px + 0.15em)",
        borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        background: isMe ? "#f6c945" : "#1c2733",
        color: isMe ? "#0d1b2a" : "rgba(255,255,255,0.9)",
        fontSize: 12, lineHeight: 1.45, fontWeight: 500, wordBreak: "break-word",
      }}>
        {msg.text}
      </p>
    </motion.div>
  );
}

export function BentoChatPreview() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(0);
  const [typing,  setTyping]  = useState(false);
  const [cycle,   setCycle]   = useState(0);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) { setVisible(MSGS.length); return; }

    // Reset first — makes this safe under React Strict Mode double-invoke
    setVisible(0);
    setTyping(false);

    const T: ReturnType<typeof setTimeout>[] = [];
    let t = 500;

    MSGS.forEach((msg, i) => {
      if (msg.sender === "partner") {
        T.push(setTimeout(() => setTyping(true), t));  t += 600;
        T.push(setTimeout(() => { setTyping(false); setVisible(i + 1); }, t));
      } else {
        T.push(setTimeout(() => setVisible(i + 1), t));
      }
      t += 500;
    });

    // Loop: restart after a pause
    T.push(setTimeout(() => setCycle((c) => c + 1), t + 3500));

    return () => T.forEach(clearTimeout);
  }, [cycle, reduce]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visible, typing]);

  const shown = MSGS.slice(0, visible);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "transparent" }} aria-hidden="true">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 px-3 py-2.5"
        style={{ borderBottom: "1px solid var(--border-c)" }}>
        <img src={AV_PTR} alt="" aria-hidden
          style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", objectPosition: "top" }} />
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>SignBridge</p>
          <p style={{ fontSize: 10, color: "var(--text-3)" }}>Онлайн</p>
        </div>
      </div>

      {/* Thread */}
      <div
        ref={threadRef}
        className="flex flex-1 flex-col justify-end gap-1.5 overflow-y-auto px-2.5 py-2
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((msg) => <Bubble key={msg.id} msg={msg} />)}
        </AnimatePresence>
        <AnimatePresence>
          {typing && (
            <motion.div key="typing" className="flex items-end gap-1.5"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.2 }}>
              <div style={{ width: 26, height: 26, flexShrink: 0 }}>
                <img src={AV_PTR} alt="" aria-hidden
                  style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover",
                           objectPosition: "top", display: "block" }} />
              </div>
              <div style={{ borderRadius: "14px 14px 14px 4px", background: "var(--surface-2)" }}>
                <Dots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="flex shrink-0 items-center gap-2 px-2.5 py-2"
        style={{ borderTop: "1px solid var(--border-c)" }}>
        <PhotoIcon style={{ width: 18, height: 18, color: "var(--text-3)", flexShrink: 0 }} />
        <div className="flex-1 rounded-full px-3 py-1.5"
          style={{ background: "var(--surface-2)", fontSize: 11, color: "var(--text-3)" }}>
          Зурвас бичих…
        </div>
        <MicrophoneIcon style={{ width: 18, height: 18, color: "var(--text-3)", flexShrink: 0 }} />
      </div>
    </div>
  );
}
