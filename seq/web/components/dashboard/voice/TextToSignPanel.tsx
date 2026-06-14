import { SignStrip } from "./SignStrip";

type Props = {
  text: string;
  signMap: Map<string, string>;
};

export function TextToSignPanel({ text, signMap }: Props) {
  const trimmed = text.trim();

  return (
    <div
      className="mb-1 shrink-0 rounded-[22px] p-4 md:rounded-[24px] md:p-6 lg:mb-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: "var(--olive)" }}
        />
        <p
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--text-3)" }}
        >
          Дохионы хэлний үсгэн хөрвүүлэг
        </p>
      </div>

      {trimmed ? (
        <SignStrip text={trimmed} signMap={signMap} />
      ) : (
        <p className="italic text-[14px]" style={{ color: "var(--text-3)" }}>
          Хөрвүүлэг энд харагдана...
        </p>
      )}
    </div>
  );
}
