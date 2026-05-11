import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { inriaSans, instrumentSerif } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Julius Grimm Portfolio 2026",
  description: "Founder on accident. Engineer by design.",
  metadataBase: new URL("https://juliusgrimm.dev"),
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png" }
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png" }]
  },
  openGraph: {
    title: "Julius Grimm Portfolio 2026",
    description: "Founder on accident. Engineer by design.",
    images: [{ url: "/jg_badge.png", width: 1200, height: 630, alt: "Julius Grimm Portfolio Badge" }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Julius Grimm Portfolio 2026",
    description: "Founder on accident. Engineer by design.",
    images: ["/jg_badge.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" className={`${inriaSans.variable} ${instrumentSerif.variable}`}>
      <body>
        {children}
        <Script
          src="https://analytics.levo-studio.com/script.js"
          data-website-id="8b3afaca-7d36-46a4-bc69-989ff1e1638f"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
