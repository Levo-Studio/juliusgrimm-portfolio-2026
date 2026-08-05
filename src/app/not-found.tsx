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
    <main className="min-h-screen bg-black px-7 py-16 text-white md:px-16 lg:px-24 xl:px-32">
      <p className="font-inria text-sm uppercase tracking-[0.08em] text-white/70">404</p>
      <h1 className="mt-6 font-instrument text-5xl leading-tight md:text-7xl">This page does not exist.</h1>
      <p className="mt-4 font-instrument text-2xl text-[#5BE38B] md:text-3xl">Probably overengineered into another route.</p>
      <Link href="/" className="mt-10 inline-block font-inria text-lg underline underline-offset-4">
        ← BACK HOME
      </Link>
    </main>
  );
}
