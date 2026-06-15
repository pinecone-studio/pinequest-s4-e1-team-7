import type { Metadata } from "next";
import "./globals.css";
import { Geist, Montserrat, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import { IncomingCallProvider } from "@/context/IncomingCallContext";
import { ChatRealtimeProvider } from "@/context/ChatRealtimeContext";
import { AppProvider } from "@/context/AppContext";
import { AppModeProvider } from "@/context/AppModeContext";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sign Bridge",
  description: "Монгол дохионы хэлнээс шууд хөрвүүлэгч",
  icons: {
    icon: "/images/metalogo.png",
    shortcut: "/images/metalogo.png",
    apple: "/images/metalogo.png",
  },
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
    <body className={cn(geist.variable, montserrat.variable, inter.variable)}>
      <AuthProvider>
        <ChatRealtimeProvider>
          <IncomingCallProvider>
            <AppProvider>
              <AppModeProvider>
                {children}
                <Toaster />
                <SpeedInsights />
              </AppModeProvider>
            </AppProvider>
          </IncomingCallProvider>
        </ChatRealtimeProvider>
      </AuthProvider>
    </body>
  </html>
);

export default RootLayout;
