import type { Metadata } from "next";
import "./globals.css";
import { Geist, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import { IncomingCallProvider } from "@/context/IncomingCallContext";
import { ChatRealtimeProvider } from "@/context/ChatRealtimeContext";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sign Bridge — Realtime",
  description: "Монгол дохионы хэлнээс шууд хөрвүүлэгч",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="mn" suppressHydrationWarning>
    <head>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('dohio-theme');if(!t){t=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);})();`,
        }}
      />
    </head>
    <body className={cn(geist.variable, montserrat.variable)}>
      <AuthProvider>
        <IncomingCallProvider>
          <ChatRealtimeProvider>
            <AppProvider>
              {children}
              <Toaster />
              <SpeedInsights />
            </AppProvider>
          </ChatRealtimeProvider>
        </IncomingCallProvider>
      </AuthProvider>
    </body>
  </html>
);

export default RootLayout;
