import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bank = localFont({
  src: [
    { path: "./fonts/BankGothic-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/BankGothic-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/BankGothic-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-bank",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arengcon.com"),
  title: {
    default: "Arengcon",
    template: "%s — Arengcon",
  },
  description:
    "An architecture, interior design, and construction practice working across civic, infrastructural, and residential scales.",
  openGraph: {
    title: "Arengcon",
    description:
      "An architecture, interior design, and construction practice.",
    url: "https://arengcon.com",
    siteName: "Arengcon",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bank.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
