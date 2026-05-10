import Link from "next/link";
import { SectionShell } from "@/components/shared/section-shell";
import { ImpressumAnimations } from "@/components/sections/impressum-animations";

export default function ImpressumPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-black px-7 pb-24 pt-12 text-white md:px-16 md:pt-16 lg:px-[64px]">
      <ImpressumAnimations />
      <div className="mx-auto max-w-[1320px]">
      <div className="mb-20">
        <h1 data-imp-title className="font-instrument text-[44px] leading-[0.95] md:text-[78px]">Legal stuff.</h1>
        <p data-imp-subtitle className="mt-4 font-instrument text-[25px] text-[#5BE38B] md:text-[42px]">Unfortunately required by German law.</p>
        <Link data-imp-back href="/" className="mt-7 inline-block font-inria text-[18px] underline underline-offset-4 md:text-[20px]">
          ← BACK
        </Link>
      </div>

      <div className="space-y-16">
        <SectionShell label="INFO">
          <div className="max-w-[980px] space-y-8 font-instrument text-[26px] leading-[1.2] md:text-[34px]">
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
          <p className="max-w-[980px] font-instrument text-[26px] leading-[1.2] md:text-[34px]">
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
          <p className="max-w-[980px] font-instrument text-[20px] leading-[1.3] md:text-[26px]">
            Haftung für Inhalte: Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
          </p>
        </SectionShell>

        <SectionShell label="LINKS">
          <p className="max-w-[980px] font-instrument text-[20px] leading-[1.3] md:text-[26px]">
            Haftung für Links: Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte kein Einfluss besteht. Deshalb kann für diese fremden Inhalte keine Gewähr übernommen werden.
          </p>
        </SectionShell>

        <SectionShell label="COPYRIGHT">
          <p className="max-w-[980px] font-instrument text-[20px] leading-[1.3] md:text-[26px]">
            Urheberrecht: Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung.
          </p>
        </SectionShell>

        <SectionShell label="EU ODR">
          <p className="max-w-[980px] font-instrument text-[20px] leading-[1.3] md:text-[26px]">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/.
          </p>
        </SectionShell>

        <SectionShell label="VSBG">
          <p className="max-w-[980px] font-instrument text-[20px] leading-[1.3] md:text-[26px]">
            Hinweis gemäß § 36 VSBG: Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </SectionShell>

        <p className="font-instrument text-[20px] text-[#5BE38B] md:text-[26px]">This page exists because German bureaucracy also discovered the internet.</p>
      </div>
      </div>
    </main>
  );
}
