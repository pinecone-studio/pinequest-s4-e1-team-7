import { Header } from "@/components/landingpage/Header";
import { Footer } from "@/components/landingpage/Footer";
import { FeatureSignToVoice } from "./FeatureSignToVoice";
import { FeatureVideoCall } from "./FeatureVideoCall";
import { FeatureVoiceToText } from "./FeatureVoiceToText";
import { HandyTranslator } from "./HandyTranslator";
import { ThreeModes } from "./ThreeModes";
import { ThreeSteps } from "./ThreeSteps";

export const LandingPage = () => {
  return (
    <main>
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <ThreeModes />
      <FeatureSignToVoice />
      <FeatureVoiceToText />
      <FeatureVideoCall />
      <ThreeSteps />
      <HandyTranslator />
      <Footer />
    </main>
  );
};