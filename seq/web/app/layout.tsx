import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sign Bridge — Realtime",
  description: "Дохионы хэл ↔ текст бодит цагийн орчуулга (temporal model)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
