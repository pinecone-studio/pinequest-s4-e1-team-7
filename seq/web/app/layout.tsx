import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import { IncomingCallProvider } from "@/context/IncomingCallContext";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Sign Bridge — Realtime",
  description: "Дохионы хэл ↔ текст бодит цагийн орчуулга",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="mn" suppressHydrationWarning>
    <head>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('dohio-theme');if(!t){t=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);})();`,
        }}
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </head>
    <body className={cn(geist.variable)}>
      <AuthProvider>
        <AppProvider>
          <IncomingCallProvider>
            {children}
            <Toaster />
          </IncomingCallProvider>
        </AppProvider>
      </AuthProvider>
    </body>
  </html>
);

export default RootLayout;
