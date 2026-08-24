import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/shared/section-shell";
import { ImpressumAnimations } from "@/components/sections/impressum-animations";

const title = "Impressum";
const description = "Legal notice (Impressum) and contact details for juliusgrimm.dev, provided in accordance with German law (§ 5 DDG).";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/impressum"
  },
  openGraph: {
    title: `${title} | Julius Grimm`,
    description,
    url: "/impressum",
    siteName: "Julius Grimm",
    type: "website",
    locale: "en_US",
    images: [{ url: "/jg_badge.png", width: 1200, height: 630, alt: "Julius Grimm Portfolio Badge" }]
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Julius Grimm`,
    description,
    images: ["/jg_badge.png"]
  }
};

export default function ImpressumPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-bg px-7 pb-24 pt-12 text-fg md:px-16 md:pt-16 lg:px-[64px]">
      <ImpressumAnimations />
      <div className="mx-auto max-w-[1320px]">
      <div className="mb-20">
        <h1 data-imp-title className="text-[44px] leading-[0.95] md:text-[78px]">Legal stuff.</h1>
        <p data-imp-subtitle className="mt-4 text-[23px] text-accent md:text-[36px]">Unfortunately required by German law.</p>
        <Link data-imp-back href="/" className="mt-7 inline-block text-[18px] underline underline-offset-4 md:text-[20px]">
          ← BACK
        </Link>
      </div>

      <div className="space-y-16">
        <SectionShell label="INFO">
          <div className="max-w-[980px] space-y-8 text-[24px] leading-[1.24] md:text-[30px]">
            <p>Angaben gemäß § 5 DDG</p>
            <p>
              Julius Grimm
              <br />
              Europaplatz 2/1
              <br />
              72074 Tübingen
              <br />
              Deutschland
            </p>
            <p>
              Kontakt:
              <br />
              Telefon: +49 176 61028522
              <br />
              E-Mail: me@juliusgrimm.dev
            </p>
          </div>
        </SectionShell>

        <SectionShell label="RESPONSIBLE">
          <p className="max-w-[980px] text-[22px] leading-[1.24] md:text-[26px]">
            Julius Grimm
            <br />
            Europaplatz 2/1
            <br />
            72074 Tübingen
            <br />
            Deutschland
          </p>
        </SectionShell>

        <SectionShell label="DISCLAIMER">
          <p className="max-w-[980px] text-[20px] leading-[1.3] md:text-[26px]">
            Haftung für Inhalte: Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
          </p>
        </SectionShell>

        <SectionShell label="LINKS">
          <p className="max-w-[980px] text-[20px] leading-[1.3] md:text-[26px]">
            Haftung für Links: Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte kein Einfluss besteht. Deshalb kann für diese fremden Inhalte keine Gewähr übernommen werden.
          </p>
        </SectionShell>

        <SectionShell label="COPYRIGHT">
          <p className="max-w-[980px] text-[20px] leading-[1.3] md:text-[26px]">
            Urheberrecht: Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung.
          </p>
        </SectionShell>

        <SectionShell label="EU ODR">
          <p className="max-w-[980px] text-[20px] leading-[1.3] md:text-[26px]">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/.
          </p>
        </SectionShell>

        <SectionShell label="VSBG">
          <p className="max-w-[980px] text-[20px] leading-[1.3] md:text-[26px]">
            Hinweis gemäß § 36 VSBG: Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </SectionShell>

        <p className="text-[20px] text-accent md:text-[26px]">This page exists because German bureaucracy also discovered the internet.</p>
      </div>
      </div>
    </main>
  );
}
