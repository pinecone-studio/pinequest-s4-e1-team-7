import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResponsiveDesign } from "./ResponsiveDesign";

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

      <ResponsiveDesign />
    </div>
  </section>
);
