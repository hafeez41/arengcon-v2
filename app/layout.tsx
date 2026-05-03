import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  description: "Architecture, interior design, and construction.",
  openGraph: {
    title: "Arengcon",
    description: "Architecture, interior design, and construction.",
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
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bank.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
