import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Compound Calculator",
  description: "Make it all back in 100 trades",
  openGraph: {
    title: "Trading Compound Calculator",
    description: "Make it all back in 100 trades",
    type: "website",
    locale: "en_US",
    url: "https://trading-compound-calculator.vercel.app",
    images: [
      {
        url: "https://uponly-viz.vercel.app/preview.png",
        width: 1200,
        height: 630,
        alt: "Trading Compound Calculator",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA?.toString() || ""} />
    </html>
  );
}
