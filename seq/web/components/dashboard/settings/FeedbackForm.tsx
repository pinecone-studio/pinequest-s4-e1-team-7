"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { getStoredToken } from "@/context/AuthContext";

const STORAGE_KEY = "sb_feedback_submitted";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const FEATURES = [
  { id: "translator", label: "Дохионы хэл хөрвүүлэг" },
  { id: "call", label: "Видео дуудлага, чат" },
  { id: "voice", label: "Ярианы хөрвүүлэг" },
  { id: "dict", label: "Дохионы толь бичиг" },
] as const;

type FeatureId = (typeof FEATURES)[number]["id"];

const IMPROVE_OPTIONS = [
  "Дохио таних нарийвчлалыг нэмэгдүүлэх",
  "Дуудлага хийх үеийн гацалт",
  "Интерфейсийг хялбарчлах",
  "Аппын хурд, гүйцэтгэл",
  "Монгол дохионы тайлбар толийг өргөжүүлэх",
  "Хэрэглэгчийн гарын авлага, сургалт нэмэх",
];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} одоор үнэлэх`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="transition-transform active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
          >
            {filled ? (
              <StarSolid
                className="h-8 w-8"
                style={{ color: "var(--olive)" }}
              />
            ) : (
              <StarOutline
                className="h-8 w-8"
                style={{ color: "var(--border-c)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function SmallStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} одоор үнэлэх`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="transition-transform active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
          >
            {filled ? (
              <StarSolid
                className="h-5 w-5"
                style={{ color: "var(--olive)" }}
              />
            ) : (
              <StarOutline
                className="h-5 w-5"
                style={{ color: "var(--border-c)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function SuccessCard() {
  const router = useRouter();
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-[22px] px-6 py-10 text-center"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
      }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "var(--olive)" }}
      >
        <CheckIcon className="h-9 w-9" style={{ color: "#0d1e35" }} />
      </div>
      <div>
        <p className="text-[18px] font-bold" style={{ color: "var(--text)" }}>
          Баярлалаа!
        </p>
        <p className="mt-1 text-[14px]" style={{ color: "var(--text-3)" }}>
          Таны санал хүсэлтийг амжилттай хүлээн авлаа.{"\n"}
          Sign Bridge-ийг сайжруулахад чухал хувь нэмэр болно.
        </p>
      </div>
      <button
        type="button"
        onClick={() => router.back()}
        className="mt-2 rounded-xl px-6 py-2.5 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
        style={{ background: "var(--olive)", color: "#0d1e35" }}
      >
        Буцах
      </button>
    </div>
  );
}

export function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [featureRatings, setFeatureRatings] = useState<
    Record<FeatureId, number>
  >({
    translator: 0,
    call: 0,
    voice: 0,
    dict: 0,
  });
  const [improveSelected, setImproveSelected] = useState<string[]>([]);
  const [recommend, setRecommend] = useState<"yes" | "maybe" | "no" | null>(
    null,
  );
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) setSubmitted(true);
  }, []);

  const toggleImprove = (opt: string) =>
    setImproveSelected((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt],
    );

  const handleSubmit = async () => {
    if (overallRating === 0) {
      setError("Та эхний асуултад үнэлгээгээ өгнө үү.");
      return;
    }
    if (!recommend) {
      setError("Та платформыг санал болгох эсэх асуултын хэсгийг сонгоно уу.");
      return;
    }
    setError(null);
    const token = getStoredToken();
    try {
      const res = await fetch(`${BASE}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          overallRating,
          featureRatings,
          improveSelected,
          recommend,
          comment,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Алдаа гарлаа, та дахин оролдоно уу.");
        return;
      }
      localStorage.setItem(STORAGE_KEY, "1");
      setSubmitted(true);
    } catch {
      setError("Сүлжээний алдаа гарлаа, та дахин оролдоно уу.");
    }
  };

  const card = {
    background: "var(--surface)",
    border: "1px solid var(--border-c)",
  };
  const activeBtn = { background: "var(--olive)", color: "#0d1e35" };
  const inactiveBtn = {
    background: "var(--surface-2)",
    color: "var(--text-2)",
    border: "1px solid var(--border-c)",
  };

  return (
    <div
      className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto max-w-lg px-4 pb-[max(calc(env(safe-area-inset-bottom)+1rem),1.5rem)] md:px-6 lg:max-w-2xl lg:px-10 xl:px-16">
        <PageHeader title="Санал хүсэлт" />

        {submitted ? (
          <SuccessCard />
        ) : (
          <div className="flex flex-col gap-4">
            {/* ── Q1: Нийт үнэлгээ ── */}
            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                1 / 5
              </p>
              <p
                className="mb-1 text-[15px] font-semibold"
                style={{ color: "var(--text)" }}
              >
                Та Sign Bridge платформыг хэрхэн үнэлэх вэ?
              </p>
              <p
                className="mb-4 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                1 — маш муу &nbsp;·&nbsp; 5 — маш сайн
              </p>
              <StarRating value={overallRating} onChange={setOverallRating} />
            </div>

            {/* ── Q2: Функцуудын үнэлгээ ── */}
            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                2 / 5
              </p>
              <p
                className="mb-1 text-[15px] font-semibold"
                style={{ color: "var(--text)" }}
              >
                Та дараах функцуудыг тус тусад нь үнэлнэ үү!
              </p>
              <p
                className="mb-4 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                Та ашиглаагүй функцийг алгасаж болно.
              </p>
              <div className="flex flex-col gap-3">
                {FEATURES.map(({ id, label }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-3"
                  >
                    <span
                      className="text-[14px]"
                      style={{ color: "var(--text)" }}
                    >
                      {label}
                    </span>
                    <SmallStarRating
                      value={featureRatings[id]}
                      onChange={(v) =>
                        setFeatureRatings((prev) => ({ ...prev, [id]: v }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Q3: Сайжруулах зүйлс ── */}
            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                3 / 5
              </p>
              <p
                className="mb-1 text-[15px] font-semibold"
                style={{ color: "var(--text)" }}
              >
                Та цаашид биднийг юуг сайжруулбал зүгээр гэж бодож байна?
              </p>
              <p
                className="mb-4 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                Олон хариулт сонгож болно.
              </p>
              <div className="flex flex-col gap-2">
                {IMPROVE_OPTIONS.map((opt) => {
                  const selected = improveSelected.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleImprove(opt)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
                      style={selected ? activeBtn : inactiveBtn}
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                        style={{
                          background: selected
                            ? "rgba(0,0,0,0.2)"
                            : "var(--surface)",
                          border: selected
                            ? "none"
                            : "1px solid var(--border-c)",
                        }}
                      >
                        {selected && (
                          <CheckIcon
                            className="h-3.5 w-3.5"
                            style={{ color: "#0d1e35" }}
                          />
                        )}
                      </span>
                      <span className="text-[13px] font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Q4: Санал болгох эсэх ── */}
            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                4 / 5
              </p>
              <p
                className="mb-1 text-[15px] font-semibold"
                style={{ color: "var(--text)" }}
              >
                Та энэхүү платформыг найз нөхөд, ойр дотны хүндээ санал болгох
                уу?
              </p>
              <p
                className="mb-4 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                Дохионы хэл ашиглах эсвэл сонирхдог хүмүүст
              </p>
              <div className="flex gap-2">
                {(
                  [
                    { value: "yes", label: "Тийм, заавал" },
                    { value: "maybe", label: "Магадгүй" },
                    { value: "no", label: "Үгүй" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRecommend(value)}
                    className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
                    style={recommend === value ? activeBtn : inactiveBtn}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Q5: Нэмэлт сэтгэгдэл ── */}
            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                5 / 5
              </p>
              <p
                className="mb-1 text-[15px] font-semibold"
                style={{ color: "var(--text)" }}
              >
                Та доорх хэсэгт нэмэлтээр сайжруулах зүйлсийн санал хүсэлт болон
                сэтгэгдлээ хуваалцана уу?
              </p>
              <p
                className="mb-3 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                Заавал биш - чөлөөтэй бичнэ үү
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Жишээ нь: дохионы таних нарийвчлал сайжирсан, гэхдээ интернэт удаан үед тасалддаг байна…"
                className="w-full resize-none rounded-xl px-3 py-2.5 text-[14px] outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-c)",
                  color: "var(--text)",
                }}
              />
              <p
                className="mt-1 text-right text-[11px]"
                style={{ color: "var(--text-3)" }}
              >
                {comment.length} / 500
              </p>
            </div>

            {/* ── Error & Submit ── */}
            {error && (
              <p className="text-center text-[13px] font-medium text-[hsl(var(--destructive))]">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-bold transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
              style={{ background: "var(--olive)", color: "#0d1e35" }}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              Санал хүсэлт илгээх
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
