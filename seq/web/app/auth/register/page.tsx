import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { HandRaisedIcon, MicrophoneIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

const FEATS = [
  { Icon: HandRaisedIcon, text: "Монгол дохионы хэлийг бодит цагт хөрвүүлэх" },
  { Icon: MicrophoneIcon, text: "Ярианаас бичвэр болгох технологи" },
  { Icon: VideoCameraIcon, text: "Дохионы хэлтнүүдтэй шууд видео дуудлага" },
];

const clerkAppearance = {
  variables: {
    colorPrimary: "#f5c518",
    colorBackground: "transparent",
    colorText: "#0d1e35",
    colorTextSecondary: "#3a5a7a",
    colorInputBackground: "#edf5fc",
    colorInputText: "#0d1e35",
    colorAlphaShade: "#0d1e35",
    borderRadius: "14px",
    fontFamily: '"Montserrat", sans-serif',
    fontSize: "15px",
  },
  elements: {
    card: "!shadow-xl !border !border-[rgba(30,80,150,0.10)] !bg-white !rounded-3xl !p-6 md:!p-8",
    rootBox: "w-full",
    headerTitle: "!font-bold !tracking-tight",
    headerSubtitle: "!text-[#3a5a7a]",
    formButtonPrimary:
      "!bg-[#f5c518] !text-[#0d1e35] !font-bold hover:!bg-[#e8b612] !rounded-2xl !h-[52px]",
    formFieldInput:
      "!border-[rgba(30,80,150,0.15)] !bg-[#edf5fc] !text-[#0d1e35] !rounded-2xl focus:!border-[#f5c518] focus:!ring-2 focus:!ring-[rgba(245,197,24,0.2)]",
    socialButtonsBlockButton:
      "!border-[rgba(30,80,150,0.15)] !bg-white !text-[#0d1e35] !rounded-2xl hover:!bg-[#f0f7fe]",
    dividerLine: "!bg-[rgba(30,80,150,0.12)]",
    dividerText: "!text-[#7a9ab8]",
    footerActionLink: "!text-[#f5c518] !font-semibold",
    footerActionText: "!text-[#3a5a7a]",
    footer: "!bg-transparent !border-t-0 !shadow-none",
    badge: "!hidden",
  },
} as const;

export default function RegisterPage() {
  return (
    <div className="fixed inset-0 flex overflow-auto" style={{ background: "var(--bg)" }}>

      {/* ── Brand panel (desktop only) ── */}
      <div
        className="hidden md:flex md:w-[46%] md:shrink-0 md:flex-col md:items-center md:justify-center"
        style={{
          background: "linear-gradient(150deg, var(--teal) 0%, #1a304d 100%)",
          padding: "56px",
          color: "#eaf0f8",
          position: "relative",
          overflow: "hidden",
          gap: "40px",
        }}
      >
        {/* Decorative glows */}
        <div style={{
          position: "absolute", right: "-100px", bottom: "-100px",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,222,240,0.20), transparent 65%)",
        }} />
        <div style={{
          position: "absolute", left: "-80px", top: "-80px",
          width: "320px", height: "320px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,197,24,0.10), transparent 65%)",
        }} />

        {/* Logo — big, centered, no background wrapper */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <img
            src="/images/logo.png"
            alt="Sign Bridge"
            style={{ width: "96px", height: "96px", objectFit: "contain" }}
          />
        </div>

        {/* Divider */}
        <div style={{
          width: "48px", height: "2px", borderRadius: "2px",
          background: "rgba(245,197,24,0.55)", position: "relative", zIndex: 1,
        }} />

        {/* Headline + description */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: "340px" }}>
          <h2 style={{
            fontWeight: 700,
            fontSize: "clamp(22px, 2.2vw, 30px)",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
            marginBottom: "12px",
          }}>
            Монгол дохионы хэлний дижитал гүүр
          </h2>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(234,240,248,0.75)" }}>
            Хэдхэн секундын дотор бүртгүүлж, шууд ашиглаж эхлээрэй.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1, width: "100%", maxWidth: "340px" }}>
          {FEATS.map(({ Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", fontWeight: 600 }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "rgba(255,255,255,0.10)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon style={{ width: "17px", height: "17px", color: "var(--olive-bright)" }} />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex justify-center md:hidden">
            <img src="/images/logo.png" alt="Sign Bridge" className="h-20 w-20 object-contain" />
          </Link>

          <SignUp
            routing="hash"
            fallbackRedirectUrl="/dashboard"
            appearance={clerkAppearance}
          />
        </div>
      </div>
    </div>
  );
}
