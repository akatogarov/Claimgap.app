import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { metadataBaseUrl } from "@/lib/public-url";

/** Using Node.js runtime for better compatibility across platforms (Cloudflare, Vercel, etc.) */

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClaimGap — Insurance claim gap analysis",
  description:
    "Upload your policy and settlement. We analyze the gap and generate a professional counter-offer letter.",
  metadataBase: metadataBaseUrl(),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a2f45",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <SiteHeader />
        <main className="min-h-[calc(100vh-12rem)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
