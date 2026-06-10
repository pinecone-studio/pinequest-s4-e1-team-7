"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SignIn, SignUp } from "@clerk/nextjs";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
    formButtonPrimary:
      "!bg-[#0d1e35] !text-white !font-bold hover:!bg-[#1a304d] !rounded-2xl !h-[52px]",
    formFieldInput:
      "!border-[rgba(0,0,0,0.10)] !bg-[#f4f6f9] !text-[#0d1e35] !rounded-2xl focus:!border-[#f5c518]",
    socialButtonsBlockButton:
      "!border-[rgba(0,0,0,0.10)] !bg-white !text-[#0d1e35] !font-semibold !rounded-2xl hover:!bg-[#f4f6f9] !h-[52px]",
    dividerLine: "!bg-[rgba(0,0,0,0.08)]",
    dividerText: "!text-[#9ab0c4] !text-[13px]",
    footerActionLink: "!text-[#f5c518] !font-bold",
    footerActionText: "!text-[#3a5a7a]",
    badge: "!hidden",
    identityPreviewEditButton: "!text-[#f5c518]",
  },
} as const;

const clerkReset = `
  .ck .cl-card {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    padding: 1 !important;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mode) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mode]);

  if (!mounted || (mode !== "login" && mode !== "register")) return null;

  const form =
    mode === "login" ? (
      <SignIn
        routing="hash"
        forceRedirectUrl="/dashboard"
        signUpUrl="/?auth=register"
        appearance={appearance}
      />
    ) : (
      <SignUp
        routing="hash"
        forceRedirectUrl="/dashboard"
        signInUrl="/?auth=login"
        appearance={appearance}
      />
    );

  return createPortal(
    <>
      <style dangerouslySetInnerHTML={{ __html: clerkReset }} />

      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9998,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(12px)",
        }}
        onClick={close}
      />

      {/* Desktop: flex centering */}
      <div
        className="max-md:!hidden"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={close}
      >
        <div
          style={{
            maxWidth: "470px",
            borderRadius: "28px",
            background: "#fff",
            overflow: "hidden",
            boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={close}
            className="absolute right-2 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/50 shadow-sm hover:bg-[#f4f6f9] transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-[#3a5a7a]" />
          </button>
          <div className="ck overflow-y-auto p-8" style={{ maxHeight: "85vh" }}>
            {form}
          </div>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          borderRadius: "32px 32px 0 0",
          background: "#fff",
          boxShadow: "0 -12px 48px rgba(0,0,0,0.18)",
          overflow: "hidden",
          animation: "sheet-up 0.38s var(--ease) both",
        }}
      >
        <div
          className="ck overflow-hidden px-12 pb-[max(env(safe-area-inset-bottom),24px)] pt-4"
          style={{ maxHeight: "85dvh" }}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#dde3ea]" />
          {form}
        </div>
      </div>
    </>,
    document.body,
  );
}
