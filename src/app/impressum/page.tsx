import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/shared/section-shell";
import { SiteHeader } from "@/components/sections/site-header";
import { Reveal } from "@/components/sections/reveal";

const title = "Legal notice";
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
    <main className="min-h-screen bg-bg text-fg">
      <Reveal />
      <SiteHeader back={{ label: "← Home", href: "/" }} />

      <div className="grid grid-cols-1 gap-x-10 gap-y-4 px-[22px] pt-10 pb-8 md:grid-cols-[120px_minmax(0,640px)] md:px-14 md:pt-16 md:pb-12">
        <p className="font-mono text-[10px] font-medium uppercase leading-[1.6] tracking-[0.16em] text-fg-muted md:pt-[7px]">
          Legal notice
        </p>
        <div>
          <h1 className="m-0 text-[30px] font-light leading-[1.16] tracking-[-0.022em] md:text-[42px] md:leading-[1.14] md:tracking-[-0.024em]">
            Legal stuff.
          </h1>
          <p className="m-0 mt-2.5 text-[15px] leading-[1.55] text-fg-muted md:mt-3 md:text-[17px] md:leading-[1.6]">
            Unfortunately required by German law.
          </p>
        </div>
      </div>

      {/* Wording is left exactly as it stands — only its presentation changes. */}
      <div className="flex flex-col gap-7 px-[22px] pb-10 md:gap-[34px] md:px-14 md:pb-16 [&>section]:md:grid-cols-[120px_minmax(0,640px)]">
        <SectionShell label="Info">
          <div className="flex flex-col gap-[18px] text-[15px] leading-[1.68] text-fg-body md:text-[16px]">
            <p className="m-0">Angaben gemäß § 5 DDG</p>
            <p className="m-0">
              Julius Grimm
              <br />
              Europaplatz 2/1
              <br />
              72074 Tübingen
              <br />
              Deutschland
            </p>
            <p className="m-0">
              Kontakt:
              <br />
              Telefon: +49 176 61028522
              <br />
              E-Mail: me@juliusgrimm.dev
            </p>
          </div>
        </SectionShell>

        <SectionShell label="Responsible">
          <p className="m-0 text-[15px] leading-[1.68] text-fg-body md:text-[16px]">
            Julius Grimm
            <br />
            Europaplatz 2/1
            <br />
            72074 Tübingen
            <br />
            Deutschland
          </p>
        </SectionShell>

        <SectionShell label="Disclaimer">
          <p className="m-0 text-[15px] leading-[1.68] text-fg-body text-pretty md:text-[16px]">
            Haftung für Inhalte: Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
          </p>
        </SectionShell>

        <SectionShell label="Links">
          <p className="m-0 text-[15px] leading-[1.68] text-fg-body text-pretty md:text-[16px]">
            Haftung für Links: Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte kein Einfluss besteht. Deshalb kann für diese fremden Inhalte keine Gewähr übernommen werden.
          </p>
        </SectionShell>

        <SectionShell label="Copyright">
          <p className="m-0 text-[15px] leading-[1.68] text-fg-body text-pretty md:text-[16px]">
            Urheberrecht: Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung.
          </p>
        </SectionShell>

        <SectionShell label="EU ODR">
          <p className="m-0 text-[15px] leading-[1.68] text-fg-body text-pretty md:text-[16px]">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <Link href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" className="text-accent">
              https://ec.europa.eu/consumers/odr/
            </Link>
          </p>
        </SectionShell>

        <SectionShell label="VSBG">
          <p className="m-0 text-[15px] leading-[1.68] text-fg-body text-pretty md:text-[16px]">
            Hinweis gemäß § 36 VSBG: Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </SectionShell>

        <SectionShell label="" reveal={false}>
          <p className="m-0 text-[13px] leading-[1.6] text-fg-muted md:text-[14px]">
            This page exists because German bureaucracy also discovered the internet.
          </p>
        </SectionShell>
      </div>

      <footer className="border-t border-line px-[22px] py-[18px] font-mono text-[10px] leading-[1.7] text-fg-faint md:px-14 md:py-[22px] md:text-[11px] md:leading-[1.6]">
        © {new Date().getFullYear()} Julius Grimm · Made with ❤️ and 47 open tabs.
      </footer>
    </main>
  );
}
