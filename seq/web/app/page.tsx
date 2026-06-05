import { Header } from "@/components/landingpage/Header";
import { Footer } from "@/components/landingpage/Footer";
import { ThreeModes } from "@/components/landingpage/ThreeModes";
import { FeatureSignToVoice } from "@/components/landingpage/FeatureSignToVoice";
import { FeatureVoiceToText } from "@/components/landingpage/FeatureVoiceToText";
import { FeatureVideoCall } from "@/components/landingpage/FeatureVideoCall";
import { ThreeSteps } from "@/components/landingpage/ThreeSteps";
import { HandyTranslator } from "@/components/landingpage/HandyTranslator";

export default function HomePage() {
  return (
    <main>
      <Header />

      <ThreeModes />
      <FeatureSignToVoice />
      <FeatureVoiceToText />
      <FeatureVideoCall />
      <ThreeSteps />
      <HandyTranslator />
      <Footer />
    </main>
  );
}
