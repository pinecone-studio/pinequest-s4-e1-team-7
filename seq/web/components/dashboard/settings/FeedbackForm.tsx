"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { getStoredToken } from "@/context/AuthContext";

const STORAGE_KEY = "sb_feedback_submitted";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type FeedbackConfig = {
  q1Title: string;
  q2Title: string;
  features: { id: string; label: string }[];
  q3Title: string;
  improveOptions: string[];
  q4Title: string;
  q5Title: string;
};

const DEFAULT_CONFIG: FeedbackConfig = {
  q1Title: "Та Sign Bridge платформыг хэрхэн үнэлэх вэ?",
  q2Title: "Дараах функцуудыг тус тусад нь үнэлнэ үү",
  features: [
    { id: "translator", label: "Дохионы хэл хөрвүүлэг" },
    { id: "call", label: "Видео дуудлага, чат" },
    { id: "voice", label: "Ярианы хөрвүүлэг" },
    { id: "dict", label: "Дохионы толь бичиг" },
  ],
  q3Title: "Цаашид юуг сайжруулбал зүгээр гэж бодож байна?",
  improveOptions: [
    "Дохио таних нарийвчлалыг нэмэгдүүлэх",
    "Дуудлага хийх үеийн гацалт",
    "Интерфейсийг хялбарчлах",
    "Аппын хурд, гүйцэтгэл",
    "Монгол дохионы тайлбар толийг өргөжүүлэх",
    "Хэрэглэгчийн гарын авлага, сургалт нэмэх",
  ],
  q4Title: "Та энэхүү платформыг найз нөхөд, ойр дотны хүндээ санал болгох уу?",
  q5Title:
    "Та доорх хэсэгт нэмэлтээр сайжруулах зүйлсийн санал хүсэлт болон сэтгэгдлээ хуваалцана уу?",
};

function EditableText({
  value,
  onChange,
  className,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`w-full rounded-lg px-2 py-1 outline-none ${className ?? ""}`}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--olive)",
          color: "var(--text)",
          ...style,
        }}
      />
    );
  }
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setDraft(value);
          setEditing(true);
        }
      }}
      className={`group flex cursor-pointer items-center gap-1.5 text-left hover:opacity-80 ${className ?? ""}`}
      style={style}
    >
      <span>{value}</span>
      <PencilIcon
        className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
        style={{ color: "var(--olive)" }}
      />
    </div>
  );
}

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
        className="mt-2 rounded-xl px-6 py-2.5 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
        style={{ background: "var(--olive)", color: "#0d1e35" }}
      >
        Буцах
      </button>
    </div>
  );
}

export function FeedbackForm() {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";

  const [cfg, setCfg] = useState<FeedbackConfig>(DEFAULT_CONFIG);
  const [cfgSaving, setCfgSaving] = useState(false);
  const [cfgError, setCfgError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [featureRatings, setFeatureRatings] = useState<Record<string, number>>(
    {},
  );
  const [improveSelected, setImproveSelected] = useState<string[]>([]);
  const [recommend, setRecommend] = useState<"yes" | "maybe" | "no" | null>(
    null,
  );
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/feedback/config`)
      .then((r) =>
        r.ok ? (r.json() as Promise<FeedbackConfig>) : Promise.reject(),
      )
      .then((data) => setCfg(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isPreview && localStorage.getItem(STORAGE_KEY)) setSubmitted(true);
  }, [isPreview]);

  const saveConfig = useCallback(async (next: FeedbackConfig) => {
    setCfgSaving(true);
    setCfgError(null);
    const token = getStoredToken();
    try {
      const res = await fetch(`${BASE}/api/feedback/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setCfgError(d.error ?? "Хадгалахад алдаа гарлаа");
      } else {
        setIsEditing(false);
      }
    } catch {
      setCfgError("Сүлжээний алдаа гарлаа");
    } finally {
      setCfgSaving(false);
    }
  }, []);

  const updateCfg = useCallback((next: Partial<FeedbackConfig>) => {
    setCfg((prev) => ({ ...prev, ...next }));
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
      style={{ background: "var(--bg)", fontFamily: "var(--font-sans)" }}
    >
      <div className="mx-auto max-w-lg px-4 pb-[max(calc(env(safe-area-inset-bottom)+1rem),1.5rem)] md:px-6 lg:max-w-2xl lg:px-10 xl:px-16">
        <PageHeader
          title="Санал хүсэлт"
          right={
            isPreview ? (
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl px-3 py-1.5 text-[12px] font-bold transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ background: "var(--olive)", color: "#0d1e35" }}
                  >
                    Засвар
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void saveConfig(cfg)}
                    disabled={cfgSaving}
                    className="rounded-xl px-3 py-1.5 text-[12px] font-bold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                    style={{ background: "var(--olive)", color: "#0d1e35" }}
                  >
                    {cfgSaving ? "Хадгалж…" : "Хадгалах"}
                  </button>
                )}
              </div>
            ) : undefined
          }
        />

        {submitted ? (
          <SuccessCard />
        ) : (
          <div className="flex flex-col gap-4">
            {isPreview && cfgError && (
              <p className="text-center text-[12px] text-[hsl(var(--destructive))]">
                {cfgError}
              </p>
            )}

            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                1 / 5
              </p>
              {isPreview && isEditing ? (
                <EditableText
                  value={cfg.q1Title}
                  onChange={(v) => updateCfg({ q1Title: v })}
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                />
              ) : (
                <p
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {cfg.q1Title}
                </p>
              )}
              <p
                className="mb-4 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                1 - маш муу · 5 - маш сайн
              </p>
              <StarRating value={overallRating} onChange={setOverallRating} />
            </div>

            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                2 / 5
              </p>
              {isPreview && isEditing ? (
                <EditableText
                  value={cfg.q2Title}
                  onChange={(v) => updateCfg({ q2Title: v })}
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                />
              ) : (
                <p
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {cfg.q2Title}
                </p>
              )}
              <p
                className="mb-4 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                Ашиглаагүй функцийг алгасаж болно
              </p>
              <div className="flex flex-col gap-3">
                {cfg.features.map((f, i) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-3"
                  >
                    {isPreview && isEditing ? (
                      <div className="flex flex-1 items-center gap-1">
                        <EditableText
                          value={f.label}
                          onChange={(v) => {
                            const next = cfg.features.map((x, j) =>
                              j === i ? { ...x, label: v } : x,
                            );
                            updateCfg({ features: next });
                          }}
                          className="text-[14px]"
                          style={{ color: "var(--text)" }}
                        />
                        {cfg.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateCfg({
                                features: cfg.features.filter(
                                  (_, j) => j !== i,
                                ),
                              })
                            }
                            className="ml-1 rounded-full p-0.5 hover:opacity-70 transition-opacity"
                          >
                            <TrashIcon
                              className="h-3.5 w-3.5"
                              style={{ color: "hsl(var(--destructive))" }}
                            />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span
                        className="text-[14px]"
                        style={{ color: "var(--text)" }}
                      >
                        {f.label}
                      </span>
                    )}
                    <SmallStarRating
                      value={featureRatings[f.id] ?? 0}
                      onChange={(v) =>
                        setFeatureRatings((prev) => ({ ...prev, [f.id]: v }))
                      }
                    />
                  </div>
                ))}
                {isPreview && isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      updateCfg({
                        features: [
                          ...cfg.features,
                          { id: `f${Date.now()}`, label: "Шинэ функц" },
                        ],
                      })
                    }
                    className="flex items-center gap-1.5 text-[12px] font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "var(--olive)" }}
                  >
                    <PlusIcon className="h-4 w-4" /> Функц нэмэх
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                3 / 5
              </p>
              {isPreview && isEditing ? (
                <EditableText
                  value={cfg.q3Title}
                  onChange={(v) => updateCfg({ q3Title: v })}
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                />
              ) : (
                <p
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {cfg.q3Title}
                </p>
              )}
              <p
                className="mb-4 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                Олон хариулт сонгож болно
              </p>
              <div className="flex flex-col gap-2">
                {cfg.improveOptions.map((opt, i) => {
                  const selected = improveSelected.includes(opt);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => !isPreview && toggleImprove(opt)}
                        className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                        style={!isPreview && selected ? activeBtn : inactiveBtn}
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                          style={{
                            background:
                              selected && !isPreview
                                ? "rgba(0,0,0,0.2)"
                                : "var(--surface)",
                            border:
                              selected && !isPreview
                                ? "none"
                                : "1px solid var(--border-c)",
                          }}
                        >
                          {selected && !isPreview && (
                            <CheckIcon
                              className="h-3.5 w-3.5"
                              style={{ color: "#0d1e35" }}
                            />
                          )}
                        </span>
                        {isPreview && isEditing ? (
                          <EditableText
                            value={opt}
                            onChange={(v) => {
                              const next = cfg.improveOptions.map((x, j) =>
                                j === i ? v : x,
                              );
                              updateCfg({ improveOptions: next });
                            }}
                            className="flex-1 text-[13px] font-medium"
                            style={{ color: "var(--text-2)" }}
                          />
                        ) : (
                          <span className="text-[13px] font-medium">{opt}</span>
                        )}
                      </button>
                      {isPreview && isEditing && (
                        <button
                          type="button"
                          onClick={() =>
                            updateCfg({
                              improveOptions: cfg.improveOptions.filter(
                                (_, j) => j !== i,
                              ),
                            })
                          }
                          className="shrink-0 rounded-full p-1 hover:opacity-70 transition-opacity"
                        >
                          <TrashIcon
                            className="h-4 w-4"
                            style={{ color: "hsl(var(--destructive))" }}
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
                {isPreview && isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      updateCfg({
                        improveOptions: [...cfg.improveOptions, "Шинэ сонголт"],
                      })
                    }
                    className="flex items-center gap-1.5 text-[12px] font-semibold transition-opacity hover:opacity-70 mt-1"
                    style={{ color: "var(--olive)" }}
                  >
                    <PlusIcon className="h-4 w-4" /> Сонголт нэмэх
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                4 / 5
              </p>
              {isPreview && isEditing ? (
                <EditableText
                  value={cfg.q4Title}
                  onChange={(v) => updateCfg({ q4Title: v })}
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                />
              ) : (
                <p
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {cfg.q4Title}
                </p>
              )}
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
                    onClick={() => !isPreview && setRecommend(value)}
                    className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                    style={recommend === value ? activeBtn : inactiveBtn}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                5 / 5
              </p>
              {isPreview && isEditing ? (
                <EditableText
                  value={cfg.q5Title}
                  onChange={(v) => updateCfg({ q5Title: v })}
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                />
              ) : (
                <p
                  className="mb-1 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {cfg.q5Title}
                </p>
              )}
              <p
                className="mb-3 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                Заавал биш — чөлөөтэй бичнэ үү
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={500}
                disabled={isPreview}
                placeholder="Жишээ нь: дохионы таних нарийвчлал сайжирсан, гэхдээ интернэт удаан үед тасалддаг байна…"
                className="w-full resize-none rounded-xl px-3 py-2.5 text-[14px] outline-none disabled:opacity-50"
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

            {error && (
              <p className="text-center text-[13px] font-medium text-[hsl(var(--destructive))]">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={isPreview ? undefined : handleSubmit}
              disabled={isPreview}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-bold transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--olive)", color: "#0d1e35" }}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              {isPreview ? "Засварлах горим идэвхтэй" : "Санал хүсэлт илгээх"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
