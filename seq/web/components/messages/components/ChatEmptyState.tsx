export function ChatEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full text-4xl shadow-sm"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
      >
        💬
      </div>
      <p className="text-[17px] font-bold" style={{ color: "var(--text)" }}>
        Чат эхлүүлэх
      </p>
    </div>
  );
}
