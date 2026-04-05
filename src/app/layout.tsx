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
  title: {
    default: "ClaimGap — Is Your Insurance Claim Underpaid?",
    template: "%s | ClaimGap",
  },
  description:
    "Find out if your insurance company underpaid your claim. Upload your policy and settlement letter — ClaimGap's AI spots the gap in 90 seconds and writes your dispute letter.",
  metadataBase: metadataBaseUrl(),
  keywords: [
    "insurance claim underpaid",
    "insurance settlement dispute",
    "how to dispute insurance claim",
    "insurance claim gap analysis",
    "insurance counter-offer letter",
    "insurance claim appeal",
    "insurance lowball offer",
    "home insurance claim dispute",
    "auto insurance claim dispute",
    "health insurance claim appeal",
    "insurance policy analysis",
    "insurance underpayment",
  ],
  authors: [{ name: "ClaimGap" }],
  creator: "ClaimGap",
  publisher: "ClaimGap",
  category: "Insurance Tools",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ClaimGap",
    title: "ClaimGap — Is Your Insurance Claim Underpaid?",
    description:
      "Most insurers' first offers are too low. ClaimGap compares your policy against their offer, shows the gap in dollars, and generates a ready-to-send dispute letter — in 90 seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClaimGap — Is Your Insurance Claim Underpaid?",
    description:
      "Upload your policy and settlement letter. Get a clause-by-clause gap analysis, dollar breakdown, and dispute letter in 90 seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
