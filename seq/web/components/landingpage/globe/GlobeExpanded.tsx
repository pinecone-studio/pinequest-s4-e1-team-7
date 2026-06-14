"use client";
import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { EASE } from "../motion";
import { GlobeExpandedMobile } from "./GlobeExpandedMobile";
import { GlobeExpandedDesktop } from "./GlobeExpandedDesktop";

export const GlobeExpanded = ({ onBack }: { onBack: () => void }) => {
  const [filter, setFilter] = useState("overview");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onBack(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  return (
    <m.div className="fixed inset-0 z-[110] bg-black"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}>
      <GlobeExpandedMobile filter={filter} onFilter={setFilter} onBack={onBack} />
      <GlobeExpandedDesktop filter={filter} onFilter={setFilter} onBack={onBack} />
    </m.div>
  );
};
