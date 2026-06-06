import Link from "next/link";
import { Sparkles, Video } from "lucide-react";

export function HeroCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-lg">
      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
        <Sparkles className="h-3.5 w-3.5" /> Шинэ
      </span>
      <h2 className="mt-3 max-w-[80%] text-2xl font-bold leading-tight">
        Видео дуудлага дээр шууд хэлмэрчилнэ
      </h2>
      <p className="mt-2 max-w-[90%] text-sm text-white/85">
        Нөгөө талын дохиог монгол дуу хоолой болгож шууд уншина.
      </p>
      <Link
        href="/video-call"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-900 transition active:scale-95"
      >
        <Video className="h-4 w-4" /> Дуудлага эхлүүлэх
      </Link>
    </div>
  );
}
