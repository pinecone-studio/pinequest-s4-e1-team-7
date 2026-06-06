import Link from "next/link";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => (
  <section
    className="relative overflow-hidden bg-background py-20 md:py-28 px-4 md:px-8"
    id="top"
  >
    <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 -right-16 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />

    <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-16 md:flex-row md:items-center">
      <div className="flex-1 text-center md:text-left">
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Монгол дохионы хэл <br />
          <span className="text-primary">Шууд дуудлага</span>
        </h1>

        <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
          <Button asChild size="lg" className="rounded-full px-7">
            <Link href="/auth/register">Эхлэх</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-7"
          >
            <a href="#how">Ашиглах заавар</a>
          </Button>
        </div>
      </div>

      <div className="flex-shrink-0">
        <div className="lphone w-[220px] sm:w-[260px]">
          <div className="lphone-status">
            <span>9:41</span>
            <span className="tracking-widest">●●●</span>
          </div>
          <div className="lphone-nav">Sign Bridge</div>
          <div className="lphone-cam">
            <div className="lphone-scan" />
            <div className="lphone-cap">
              <div className="cl mb-2">
                <span /> Дохио хэл → Дуудлага
              </div>
              <p className="text-sm font-semibold text-white/90">
                Сайн байна уу?
              </p>
            </div>
          </div>
          <div
            className="flex flex-col gap-2 p-3"
            style={{ background: "var(--surface)" }}
          >
            <button
              className="w-full rounded-2xl py-2.5 text-center text-sm font-bold text-white transition active:scale-95"
              style={{ background: "var(--olive)" }}
            >
              Видео дуудлага эхлүүлэх
            </button>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: "var(--olive-soft)" }}
            >
              <Hand
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--olive)" }}
              />
              <div className="flex-1 space-y-1">
                <div
                  className="h-1.5 w-3/4 rounded-full"
                  style={{ background: "var(--olive-bright)", opacity: 0.5 }}
                />
                <div
                  className="h-1.5 w-1/2 rounded-full"
                  style={{ background: "var(--olive-bright)", opacity: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
