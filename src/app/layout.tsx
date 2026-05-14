import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Starfield } from "@/components/Starfield";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liquid Wallet — iOS 26",
  description:
    "Spatial multi-chain crypto wallet for Telegram Mini Apps. Glass, liquid, viral.",
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-dvh antialiased">
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <div className="mesh-bg" aria-hidden />
        <Starfield />
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
