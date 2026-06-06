const items = [
  { icon: "✋", title: "Эмнэлэгт хэлмэрчилсэн", meta: "Дохио → Дуу · 42 өгүүлбэр", when: "2 цаг" },
  { icon: "🎙️", title: "Хичээлийн тэмдэглэл", meta: "Дуу → Бичвэр · 8 мин", when: "Өчигдөр" },
  { icon: "📹", title: "Гэр бүлтэй видео дуудлага", meta: "Видео · 15 мин", when: "2 хоног" },
];

export function RecentList() {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.title} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-lg">{it.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{it.title}</p>
            <p className="truncate text-xs text-muted-foreground">{it.meta}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{it.when}</span>
        </li>
      ))}
    </ul>
  );
}
