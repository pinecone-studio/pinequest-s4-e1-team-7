import Link from "next/link";
import { randomBytes } from "crypto";
import { LandingPage } from "@/components/landingpage/LandingPage";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const roomId = randomBytes(2).toString("hex");

  return ( 
  // <div> <LandingPage/></div>
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-10 px-6 py-12">
      <header className="text-center">
        <h1 className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-5xl font-bold text-transparent">
          Sign Bridge
        </h1>
        <p className="mt-3 text-zinc-400">
          Temporal загвар · хөдөлгөөн таних · realtime call
        </p>
      </header>

      <Link
        href={`/call/${roomId}`}
        className="group w-full max-w-md rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center transition hover:border-emerald-400 hover:bg-emerald-500/20"
      >
        <div className="text-3xl">📞</div>
        <h2 className="mt-4 text-2xl font-semibold text-emerald-200">
          Видео дуудлага эхлүүлэх
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Дохио → текст бодит цагт
        </p>
      </Link>

      <section className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-400">
        <p className="font-medium text-zinc-200">Сургалт (Python)</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs leading-relaxed text-zinc-300">
{`cd ../training
pip install -r requirements.txt
python3 download_models.py
python3 record.py      # дохио бүрийг 15-30 clip болгон бич
python3 train.py       # сургаад TFJS руу export`}
        </pre>
        <ul className="mt-3 space-y-1 text-xs text-zinc-500">
          <li>Шинэ дохио: <code className="text-zinc-400">training/labels.txt</code> дээр нэр нэм</li>
          <li>train.py дуусахад загвар <code className="text-zinc-400">public/models/seq</code> руу автоматаар орно</li>
          <li>Дараа нь энэ хуудсыг refresh хий</li>
        </ul>
      </section>
    </main>
  );
}
