import Link from "next/link";
import { ResponsiveDesign } from "./ResponsiveDesign";

export const Hero = () => (
  <section
    className="relative overflow-hidden px-4 py-20 md:px-8 md:py-28"
    style={{ background: "var(--bg)" }}
    id="top"
  >
    <div
      className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full blur-3xl"
      style={{ background: "var(--olive-soft)" }}
    />
    <div
      className="pointer-events-none absolute -bottom-32 -right-16 h-[400px] w-[400px] rounded-full blur-3xl"
      style={{ background: "var(--olive-faint)" }}
    />

    <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-16 md:flex-row md:items-center">
      <div className="flex-1 text-center md:text-left">
        <h1
          className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: "var(--text)" }}
        >
          Монгол дохионы хэл <br />
          <span style={{ color: "var(--olive)" }}>Шууд дуудлага</span>
        </h1>

        <div className="lhero-cta mt-8">
          <Link href="/?auth=register" className="db-pillbtn green lg">Эхлэх</Link>
          <a href="#how" className="db-pillbtn lg">Ашиглах заавар</a>
        </div>
      </div>

      <ResponsiveDesign />
    </div>
  </section>
);
