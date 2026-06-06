"use client";
import { useApp } from "@/context/AppContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Hand, Volume2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { MN_ALPHABET, MN_NUMBERS, DICT_CATEGORIES } from "@/lib/constants";
import type { DictCategory } from "@/lib/constants";

interface Props {
  category?: DictCategory;
}

export function Dictionary({ category = "alphabet" }: Props) {
  const { settings, toast } = useApp();
  const { speak } = useTextToSpeech();

  const catInfo = DICT_CATEGORIES.find((c) => c.id === category)!;
  const items = category === "alphabet" ? MN_ALPHABET : MN_NUMBERS;

  const getLabel = (item: string) =>
    category === "alphabet" ? `${item} үсэг` : `${item} тоо`;

  const say = (item: string) => {
    speak(getLabel(item), settings);
    toast("info", `Уншиж байна: ${getLabel(item)}`, "volume-2");
  };

  return (
    <section className="db-section">
      <SectionHeader
        crumb={`Толь бичиг › ${catInfo.label}`}
        title={catInfo.label}
        subtitle={
          category === "alphabet"
            ? "Дохионы хэлний монгол цагаан толгой. Үсгийг товшиход дуугаар сонсоно."
            : "0-аас 9 хүртэл тоон дохио. Тоог товшиход дуугаар сонсоно."
        }
      />

      <p className="mb-5 text-sm" style={{ color: "var(--text-3)" }}>
        Нийт {items.length} {category === "alphabet" ? "үсэг" : "тоо"}
      </p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => say(item)}
            className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:shadow-md active:scale-95"
          >
            <div
              className="relative flex aspect-square items-center justify-center"
              style={{ background: "var(--olive-soft)" }}
            >
              <span
                className="text-5xl font-bold transition-transform group-hover:scale-110"
                style={{ color: "var(--olive)" }}
              >
                {item}
              </span>
              <span
                className="absolute right-2 top-2"
                style={{ color: "var(--olive)", opacity: 0.4 }}
              >
                <Hand className="size-3.5" />
              </span>
            </div>
            <div className="p-2.5">
              <div
                className="text-sm font-semibold leading-tight"
                style={{ color: "var(--text)" }}
              >
                {getLabel(item)}
              </div>
              <div
                className="mt-1 flex items-center gap-1 text-xs"
                style={{ color: "var(--olive)" }}
              >
                <Volume2 className="size-3" />
                {category === "alphabet" ? "Үсэг" : "Тоо"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
