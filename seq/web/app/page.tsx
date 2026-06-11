import { Suspense } from "react";
import { AuthOverlay } from "@/components/landingpage/AuthOverlay";
import { Header } from "@/components/landingpage/Header";
import { Hero } from "@/components/landingpage/Hero";
import { GlobeSection } from "@/components/landingpage/GlobeSection";
import { ThreeSteps } from "@/components/landingpage/ThreeSteps";
import { Footer } from "@/components/landingpage/Footer";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <GlobeSection />
      <ThreeSteps />
      <Footer />
      <Suspense>
        <AuthOverlay />
      </Suspense>
    </main>
  );
}
