import { Header } from "@/components/landingpage/Header";
import { Hero } from "@/components/landingpage/Hero";
import { ThreeModes } from "@/components/landingpage/ThreeModes";
import { FeatureSignToVoice } from "@/components/landingpage/FeatureSignToVoice";
import { FeatureVoiceToText } from "@/components/landingpage/FeatureVoiceToText";
import { FeatureVideoCall } from "@/components/landingpage/FeatureVideoCall";
import { ThreeSteps } from "@/components/landingpage/ThreeSteps";
import { Footer } from "@/components/landingpage/Footer";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <ThreeModes />
      <FeatureSignToVoice />
      <FeatureVoiceToText />
      <FeatureVideoCall />
      <ThreeSteps />
      <Footer />
    </main>
  );
}
