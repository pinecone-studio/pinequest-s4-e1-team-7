import { Suspense } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { Unbounded } from "next/font/google";
import { LenisProvider } from "@/components/landingpage/LenisProvider";
import { AuthOverlay } from "@/components/landingpage/AuthOverlay";
import { Header } from "@/components/landingpage/Header";
import { Hero } from "@/components/landingpage/hero/Hero";
import { GlobeSection } from "@/components/landingpage/globe/GlobeSection";
import { FeaturesSection } from "@/components/landingpage/features/FeaturesSection";
import { Footer } from "@/components/landingpage/Footer";
import { MobileSection } from "@/components/landingpage/MobileSection";
import { PageNav } from "@/components/landingpage/PageNav";
import { HeroWordmark } from "@/components/landingpage/HeroWordmark";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["900"],
  variable: "--font-landing",
  display: "swap",
});

const HomePage = () => (
  <LenisProvider>
    <LazyMotion features={domAnimation} strict>
      <>
        <HeroWordmark />
        <main className={`${unbounded.variable} lp relative z-10 bg-black`}>
          <Header landing />
          <Hero />
          <GlobeSection />
          <FeaturesSection />
          <MobileSection />
          <Footer />
          <PageNav />
        </main>
        <Suspense>
          <AuthOverlay />
        </Suspense>
      </>
    </LazyMotion>
  </LenisProvider>
);

export default HomePage;
