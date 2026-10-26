import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { ThemeScript } from "@/components/shared/theme-script";
import { ANALYTICS_SCRIPT_SRC, ANALYTICS_WEBSITE_ID } from "@/lib/analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://juliusgrimm.dev"),
  title: {
    default: "Julius Grimm - Engineer by Design",
    template: "%s | Julius Grimm"
  },
  description: "Portfolio of Julius Grimm, founder and full-stack engineer building polished web apps, internal tools, and self-hosted product systems.",
  applicationName: "Julius Grimm",
  authors: [{ name: "Julius Grimm", url: "https://juliusgrimm.dev" }],
  creator: "Julius Grimm",
  publisher: "Julius Grimm",
  alternates: {
    canonical: "/"
  },
  keywords: [
    "Julius Grimm",
    "Julius Grimm Portfolio",
    "Levo Studio",
    "full-stack developer",
    "Next.js developer",
    "UI UX designer",
    "web app developer",
    "portfolio 2026"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png" }
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png" }]
  },
  openGraph: {
    title: "Julius Grimm - Engineer by Design",
    description: "Full-stack engineering, product systems, and case studies by Julius Grimm.",
    url: "https://juliusgrimm.dev",
    siteName: "Julius Grimm",
    images: [{ url: "/jg_badge.png", width: 1200, height: 630, alt: "Julius Grimm Portfolio Badge" }],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Julius Grimm - Engineer by Design",
    description: "Full-stack engineering, product systems, and case studies by Julius Grimm.",
    images: ["/jg_badge.png"]
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  // Set per request by src/proxy.ts; the CSP only lets scripts carrying it run.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript nonce={nonce} />
      </head>
      <body>
        {children}
        <Script
          src={ANALYTICS_SCRIPT_SRC}
          data-website-id={ANALYTICS_WEBSITE_ID}
          strategy="afterInteractive"
          nonce={nonce}
        />
      </body>
    </html>
  );
}
