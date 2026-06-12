import type React from "react";
import { Toaster as Sonner } from "sonner";

export const Toaster = () => (
  <Sonner
    position="top-center"
    toastOptions={{
      classNames: {
        toast: "!rounded-2xl !border !border-border !bg-card !text-foreground !font-sans",
        title: "!font-semibold !text-[14px]",
        description: "!text-[13px] !opacity-70",
        actionButton: "!rounded-xl !px-3 !py-1.5 !text-[12px] !font-bold",
      },
      style: {
        "--toast-btn-bg": "var(--olive)",
        "--toast-btn-color": "#0d1e35",
      } as React.CSSProperties,
    }}
  />
);
