import { Toaster as Sonner } from "sonner";

export const Toaster = () => (
  <Sonner
    position="top-center"
    toastOptions={{
      classNames: {
        toast:
          "!rounded-2xl !border !border-border !bg-card !text-foreground !font-sans",
        title: "!font-medium",
      },
    }}
  />
);
