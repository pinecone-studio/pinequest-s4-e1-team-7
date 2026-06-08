"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { SignIn, SignUp } from "@clerk/nextjs";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";

const appearance = {
  layout: { unsafe_disableDevelopmentModeWarnings: true },
  variables: {
    colorPrimary: "#f5c518",
    colorBackground: "#ffffff",
    colorText: "#0d1e35",
    colorTextSecondary: "#3a5a7a",
    colorInputBackground: "#f4f6f9",
    colorInputText: "#0d1e35",
    colorAlphaShade: "#0d1e35",
    borderRadius: "14px",
    fontFamily: '"Montserrat", sans-serif',
    fontSize: "15px",
  },
  elements: {
    rootBox: "w-full",
    headerTitle: "!text-[22px] !font-bold !tracking-tight !text-[#0d1e35]",
    headerSubtitle: "!text-[#3a5a7a] !text-[14px]",
    formButtonPrimary: "!bg-[#0d1e35] !text-white !font-bold hover:!bg-[#1a304d] !rounded-2xl !h-[52px]",
    formFieldInput: "!border-[rgba(0,0,0,0.10)] !bg-[#f4f6f9] !text-[#0d1e35] !rounded-2xl focus:!border-[#f5c518]",
    socialButtonsBlockButton: "!border-[rgba(0,0,0,0.10)] !bg-white !text-[#0d1e35] !font-semibold !rounded-2xl hover:!bg-[#f4f6f9] !h-[52px]",
    dividerLine: "!bg-[rgba(0,0,0,0.08)]",
    dividerText: "!text-[#9ab0c4] !text-[13px]",
    footerActionLink: "!text-[#f5c518] !font-bold",
    footerActionText: "!text-[#3a5a7a]",
    badge: "!hidden",
    identityPreviewEditButton: "!text-[#f5c518]",
  },
} as const;

// Injected <style> wins over Clerk's inline styles — Tailwind [&_] selectors don't
const clerkReset = `
  .ck .cl-card {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
  .ck .cl-footer {
    background: #fff !important;
    border-top: none !important;
  }
`;

export function AuthOverlay() {
  const router = useRouter();
  const mode = useSearchParams().get("auth");
  const close = () => router.replace("/", { scroll: false });

  useEffect(() => {
    if (mode) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [mode]);

  if (mode !== "login" && mode !== "register") return null;

  const form = mode === "login"
    ? <SignIn routing="hash" forceRedirectUrl="/dashboard" signUpUrl="/?auth=register" appearance={appearance} />
    : <SignUp routing="hash" forceRedirectUrl="/dashboard" signInUrl="/?auth=login" appearance={appearance} />;

  return (
    <div className="fixed inset-0 z-50">
 
      <style dangerouslySetInnerHTML={{ __html: clerkReset }} />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={close} />

    
      <div className="absolute inset-0 hidden items-center justify-center p-6 md:flex">
        <div className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/20">
          <button onClick={close}
            className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-[#f4f6f9] transition-colors">
            <XMarkIcon className="h-4 w-4 text-[#3a5a7a]" />
          </button>
          <div className="ck max-h-[85vh] overflow-hidden  p-8 ">{form}</div>
        </div>
      </div>

     
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-[32px] bg-white shadow-[0_-12px_48px_rgba(0,0,0,0.18)] md:hidden"
        style={{ animation: "sheet-up 0.38s var(--ease) both" }}
      >
        <div className="ck max-h-[85dvh] overflow-hidden px-12 pb-[max(env(safe-area-inset-bottom),24px)] pt-4">
          <div className="mx-auto  mb-4 h-1 w-10 rounded-full bg-[#dde3ea]" />
          {form}
        </div>
      </div>
    </div>
  );
}
