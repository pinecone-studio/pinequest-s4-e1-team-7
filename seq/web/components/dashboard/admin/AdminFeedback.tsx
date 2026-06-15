"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getStoredToken } from "@/context/AuthContext";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import {
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type FeedbackRow = {
  id: number;
  userName: string | null;
  userEmail: string | null;
  overallRating: number;
  ratingTranslator: number | null;
  ratingCall: number | null;
  ratingVoice: number | null;
  ratingDict: number | null;
  improveSelected: string[];
  recommend: "yes" | "maybe" | "no";
  comment: string | null;
  createdAt: string;
};

type Stats = {
  total: number;
  avgOverall: string;
  avgTranslator: string;
  avgCall: string;
  avgVoice: string;
  avgDict: string;
  countYes: number;
  countMaybe: number;
  countNo: number;
};

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) =>
        i < Math.round(value) ? (
          <StarSolid
            key={i}
            className="h-4 w-4"
            style={{ color: "var(--olive)" }}
          />
        ) : (
          <StarOutline
            key={i}
            className="h-4 w-4"
            style={{ color: "var(--border-c)" }}
          />
        ),
      )}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-[18px] p-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
      }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-widest"
        style={{ color: "var(--text-3)" }}
      >
        {label}
      </p>
      <p className="text-[24px] font-bold" style={{ color: "var(--text)" }}>
        {value}
      </p>
      {sub && (
        <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function RecommendBar({
  yes,
  maybe,
  no,
}: {
  yes: number;
  maybe: number;
  no: number;
}) {
  const total = yes + maybe + no || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  return (
    <div className="flex flex-col gap-2">
      {(
        [
          { label: "Тийм, заавал", val: yes, color: "var(--olive)" },
          { label: "Магадгүй", val: maybe, color: "#f59e0b" },
          { label: "Үгүй", val: no, color: "hsl(var(--destructive))" },
        ] as const
      ).map(({ label, val, color }) => (
        <div key={label} className="flex items-center gap-3">
          <span
            className="w-28 shrink-0 text-[12px]"
            style={{ color: "var(--text-3)" }}
          >
            {label}
          </span>
          <div
            className="relative h-3 flex-1 overflow-hidden rounded-full"
            style={{ background: "var(--surface-2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct(val)}%`, background: color }}
            />
          </div>
          <span
            className="w-8 text-right text-[12px] font-semibold"
            style={{ color: "var(--text)" }}
          >
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}

function FeedbackItem({ row }: { row: FeedbackRow }) {
  const [open, setOpen] = useState(false);
  const recommendLabel = { yes: "Тийм", maybe: "Магадгүй", no: "Үгүй" }[
    row.recommend
  ];
  const recommendColor = {
    yes: "var(--olive)",
    maybe: "#f59e0b",
    no: "hsl(var(--destructive))",
  }[row.recommend];
  const date = new Date(row.createdAt).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="rounded-[18px] overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:brightness-105 active:scale-[0.99] transition-all duration-150"
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] font-semibold truncate"
            style={{ color: "var(--text)" }}
          >
            {row.userName ?? row.userEmail ?? "Нэргүй"}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
            {date}
          </p>
        </div>
        <Stars value={row.overallRating} />
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: `${recommendColor}22`, color: recommendColor }}
        >
          {recommendLabel}
        </span>
        {open ? (
          <ChevronUpIcon
            className="h-4 w-4 shrink-0"
            style={{ color: "var(--text-3)" }}
          />
        ) : (
          <ChevronDownIcon
            className="h-4 w-4 shrink-0"
            style={{ color: "var(--text-3)" }}
          />
        )}
      </button>

      {open && (
        <div
          className="px-4 pb-4 flex flex-col gap-3"
          style={{ borderTop: "1px solid var(--border-c)" }}
        >
          <div className="pt-3 grid grid-cols-2 gap-2">
            {(
              [
                { label: "Дохионы хэл хөрвүүлэг", val: row.ratingTranslator },
                { label: "Видео/дуудлага чат", val: row.ratingCall },
                { label: "Ярианы хөрвүүлэг", val: row.ratingVoice },
                { label: "Дохионы толь бичиг", val: row.ratingDict },
              ] as const
            ).map(({ label, val }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span
                  className="text-[11px]"
                  style={{ color: "var(--text-3)" }}
                >
                  {label}
                </span>
                {val ? (
                  <Stars value={val} />
                ) : (
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--text-3)" }}
                  >
                    —
                  </span>
                )}
              </div>
            ))}
          </div>

          {row.improveSelected.length > 0 && (
            <div>
              <p
                className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-3)" }}
              >
                Сайжруулах зүйлс
              </p>
              <div className="flex flex-wrap gap-1.5">
                {row.improveSelected.map((item) => (
                  <span
                    key={item}
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--text-2)",
                      border: "1px solid var(--border-c)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {row.comment && (
            <div
              className="rounded-xl px-3 py-2.5"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-c)",
              }}
            >
              <p
                className="text-[13px] italic"
                style={{ color: "var(--text-2)" }}
              >
                "{row.comment}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminFeedback() {
  const router = useRouter();
  const [data, setData] = useState<{
    stats: Stats;
    rows: FeedbackRow[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredToken();
      const res = await fetch(`${BASE}/api/feedback`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 403) {
        setError("Энэ хуудас руу хандах эрх байхгүй байна.");
        return;
      }
      if (!res.ok) {
        setError("Мэдээлэл ачааллахад алдаа гарлаа.");
        return;
      }
      setData((await res.json()) as { stats: Stats; rows: FeedbackRow[] });
    } catch {
      setError("Сүлжээний алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const card = {
    background: "var(--surface)",
    border: "1px solid var(--border-c)",
  };

  return (
    <div
      className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ background: "var(--bg)", fontFamily: "var(--font-sans)" }}
    >
      <div className="mx-auto max-w-lg px-4 pb-[max(calc(env(safe-area-inset-bottom)+1rem),1.5rem)] md:px-6 lg:max-w-2xl lg:px-10 xl:px-16">
        <PageHeader
          title="Санал хүсэлтийн үр дүн"
          right={
            <button
              type="button"
              onClick={() => void load()}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:brightness-110 active:scale-90"
              style={card}
              aria-label="Дахин ачаалах"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                style={{ color: "var(--text-2)" }}
              />
            </button>
          }
        />

        <button
          type="button"
          onClick={() => router.push("/dashboard/feedback?preview=1")}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
          style={card}
        >
          <ClipboardDocumentListIcon
            className="h-4 w-4"
            style={{ color: "var(--olive)" }}
          />
          <span style={{ color: "var(--text)" }}>Асуулт хэсэг</span>
          <ChevronRightIcon
            className="h-4 w-4"
            style={{ color: "var(--text-3)" }}
          />
        </button>

        {!data && !loading && !error && (
          <div
            className="flex flex-col items-center gap-4 rounded-[22px] py-12 text-center"
            style={card}
          >
            <p
              className="text-[15px] font-semibold"
              style={{ color: "var(--text)" }}
            >
              Үр дүн
            </p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
              Зөвхөн бүртгэлтэй админ мэдээллийг харах боломжтой.
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-xl px-6 py-2.5 text-[13px] font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: "var(--olive)", color: "#0d1e35" }}
            >
              Мэдээллийг ачаалах
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <ArrowPathIcon
              className="h-8 w-8 animate-spin"
              style={{ color: "var(--olive)" }}
            />
          </div>
        )}

        {error && (
          <div className="rounded-[18px] px-5 py-4 text-center" style={card}>
            <p className="text-[14px] font-medium text-[hsl(var(--destructive))]">
              {error}
            </p>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Нийт санал өгсөн" value={data.stats.total} />
              <StatCard
                label="Дундаж үнэлгээ"
                value={`${data.stats.avgOverall} / 5`}
                sub={`★`.repeat(Math.round(Number(data.stats.avgOverall)))}
              />
              <StatCard
                label="Санал болгох"
                value={`${data.stats.countYes}`}
                sub={`${Math.round((data.stats.countYes / (data.stats.total || 1)) * 100)}% - Тийм`}
              />
            </div>

            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-4 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                Функцуудын дундаж үнэлгээ
              </p>
              <div className="flex flex-col gap-3">
                {(
                  [
                    {
                      label: "Дохионы хэлний хөрвүүлэг",
                      val: data.stats.avgTranslator,
                    },
                    { label: "Видео/дуудлага, чат", val: data.stats.avgCall },
                    { label: "Ярианы хөрвүүлэг", val: data.stats.avgVoice },
                    { label: "Дохионы толь бичиг", val: data.stats.avgDict },
                  ] as const
                ).map(({ label, val }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3"
                  >
                    <span
                      className="text-[13px]"
                      style={{ color: "var(--text)" }}
                    >
                      {label}
                    </span>
                    <div className="flex items-center gap-2">
                      <Stars value={Number(val)} />
                      <span
                        className="text-[12px] font-semibold w-8 text-right"
                        style={{ color: "var(--text-3)" }}
                      >
                        {Number(val) > 0 ? val : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] p-5" style={card}>
              <p
                className="mb-4 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                Бусад хүмүүст санал болгох эсэх
              </p>
              <RecommendBar
                yes={Number(data.stats.countYes)}
                maybe={Number(data.stats.countMaybe)}
                no={Number(data.stats.countNo)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <p
                className="px-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                Нийт санал өгсөн хэрэглэгч ({data.rows.length})
              </p>
              {data.rows.length === 0 ? (
                <div
                  className="rounded-[18px] px-5 py-8 text-center"
                  style={card}
                >
                  <p className="text-[14px]" style={{ color: "var(--text-3)" }}>
                    Одоогоор санал ирээгүй байна.
                  </p>
                </div>
              ) : (
                data.rows.map((row) => <FeedbackItem key={row.id} row={row} />)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
