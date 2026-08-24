import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: true
  }
};

export default function NotFound(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-bg px-7 py-16 text-fg md:px-16 lg:px-24 xl:px-32">
      <p className="text-sm uppercase tracking-[0.08em] text-fg-muted">404</p>
      <h1 className="mt-6 text-5xl leading-tight md:text-7xl">This page does not exist.</h1>
      <p className="mt-4 text-2xl text-accent md:text-3xl">Probably overengineered into another route.</p>
      <Link href="/" className="mt-10 inline-block text-lg underline underline-offset-4">
        ← BACK HOME
      </Link>
    </main>
  );
}
