"use client";
import { m, AnimatePresence } from "framer-motion";
import { EASE } from "../motion";

export const GlobeStatsPanel = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <m.div
        key="global-stats"
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 28, transition: { duration: 0.2 } }}
        transition={{ duration: 0.45, ease: EASE }}
        className="absolute hidden lg:flex flex-col"
        style={{ right: "3%", top: "50%", transform: "translateY(-50%)", width: "clamp(220px,21vw,290px)" }}
      >
        <p className="mb-5 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          SignBridge нь Монгол дохионы хэлээр ярьдаг иргэдэд зориулсан дохионы хэлнийнээс яриа болгон хөрвүүлэгч платформ юм.
        </p>
        <div className="mb-5 h-px" style={{ background: "rgba(255,255,255,0.16)" }} />
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.35)" }}>Ажилгүйдэлтэй иргэд</p>
        <p className="font-black leading-[0.9]" style={{ color: "#F5C518", fontSize: "clamp(52px,6vw,80px)", letterSpacing: "-2px" }}>2,400+</p>
        <div className="my-5 h-px" style={{ background: "rgba(255,255,255,0.16)" }} />
        <p className="mb-1 text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Сонсголын бэрхшээлтэй иргэд</p>
        <p className="font-black leading-none" style={{ color: "#F5C518", fontSize: "clamp(26px,2.8vw,38px)" }}>25,000+</p>
        <div className="my-5 h-px" style={{ background: "rgba(255,255,255,0.16)" }} />
        <div className="grid grid-cols-2 gap-x-4">
          {[{ label: "Хэрэглэгчдийн хүлээлт", value: "98%" }, { label: "Хөрвүүлэх тусламж", value: "24/7" }].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] leading-snug mb-2" style={{ color: "rgba(255,255,255,0.32)" }}>{label}</p>
              <p className="font-black" style={{ color: "#F5C518", fontSize: "clamp(22px,2.4vw,32px)" }}>{value}</p>
            </div>
          ))}
        </div>
      </m.div>
    )}
  </AnimatePresence>
);
