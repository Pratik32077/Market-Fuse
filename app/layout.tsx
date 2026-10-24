import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Load Geist Sans locally (placeholder – add actual .woff2 files in public/fonts)
const geistSans = localFont({
  src: [
    { path: "/fonts/Geist-Regular.woff2", weight: "400", style: "normal" },
    { path: "/fonts/Geist-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-geist-sans",
});

// Load Geist Mono locally (placeholder)
const geistMono = localFont({
  src: [
    { path: "/fonts/GeistMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "/fonts/GeistMono-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "MarketFuse Custom Orders",
  description: "Order intake and fulfillment for made‑to‑order sellers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
