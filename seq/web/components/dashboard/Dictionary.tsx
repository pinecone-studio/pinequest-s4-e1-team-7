"use client";
import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { SectionHeader } from "./SectionHeader";
import { SignCard } from "./SignCard";
import { DictDetailSheet } from "./DictDetailSheet";
import { MN_ALPHABET, MN_NUMBERS, DICT_CATEGORIES } from "@/lib/constants";
import type { DictCategory } from "@/lib/constants";
import type { SignItem } from "./SignCard";

function buildItems(category: DictCategory): SignItem[] {
  const letters = category === "alphabet" ? MN_ALPHABET : MN_NUMBERS;
  return letters.map((letter) => ({
    id: letter, letter, label: category === "alphabet" ? `${letter} үсэг` : `${letter} тоо`,
  }));
}

export function Dictionary({ category = "alphabet" }: { category?: DictCategory }) {
  const { settings, toast } = useApp();
  const { speak } = useTextToSpeech();
  const [selected, setSelected] = useState<SignItem | null>(null);
  const catInfo = DICT_CATEGORIES.find((c) => c.id === category)!;
  const items = buildItems(category);

  const handleSpeak = (item: SignItem) => {
    speak(item.label, settings);
    toast("info", `Уншиж байна: ${item.label}`, "volume-2");
  };

  return (
    <section className="db-section">
      <SectionHeader crumb={`Толь бичиг › ${catInfo.label}`} title="Толь бичиг"
        subtitle="Монгол дохионы хэлний цагаан толгой. Картыг дарж дэлгэрэнгүй харна уу." />
      <div className="mb-6 flex flex-wrap gap-2">
        {DICT_CATEGORIES.map((cat) => {
          const active = cat.id === category;
          return (
            <Link key={cat.id} href={`/dashboard/dict?cat=${cat.id}`}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200"
              style={active ? { background: "var(--olive)", color: "#0d1e35" } : { background: "var(--surface)", border: "1px solid var(--border-c)", color: "var(--text-2)" }}>
              {cat.label}
              <span className="rounded-full px-1.5 py-0.5 text-[11px] font-bold"
                style={active ? { background: "rgba(0,0,0,0.14)", color: "#0d1e35" } : { background: "var(--surface-2)", color: "var(--text-3)" }}>
                {cat.sub}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => <SignCard key={item.id} item={item} onClick={() => setSelected(item)} />)}
      </div>
      {selected && <DictDetailSheet item={selected} category={category} onClose={() => setSelected(null)} onSpeak={handleSpeak} />}
    </section>
  );
}
