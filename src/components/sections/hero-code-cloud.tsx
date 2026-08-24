/**
 * The ASCII drift behind the hero. Purely decorative: masked to fade into the
 * background, unselectable, and hidden from assistive tech.
 *
 * Mobile uses the first six rows clipped to 25 columns — the same figure, cropped
 * rather than rescaled, so the character grid stays aligned at the smaller size.
 */
const ROWS = [
  ".`,': ;.`,':].|-I]i}|-(I<vvvuvvu",
  ".`,': ;.`,':+i}`(+]i}|-(Ivuuvvvu",
  ".`,': ;.`,':;].|-1+]i}|-(vuvvuuv",
  ".`,': ;.`,':1+i}`{1+]i}|-uvvvuvv",
  ".`,': ;.`,':{;].|~{1+]i}|vvuuvvv",
  ".`,': ;.`,':~1+i}[~{1+]i}vvuvvuu",
  ".`,': ;.`,': {;].>[~{1+]iuuvvvuv",
  ".`,': ;.`,':[~1+il>[~{1+]uvvuuvv",
  ".`,': ;.`,':> {;])l>[~{1+vvvuvvu",
  ".`,': ;.`,'::[~1+_)l>[~{1vuuvvvu",
  ".`,': ;.`,':l> {;!_)l>[~{vuvvuuv",
  ".`,': ;.`,'):[~1<!_)l>[~uvvvuvv"
];

const MASK = "linear-gradient(200deg, #000, transparent 76%)";

export const HeroCodeCloud = (): React.JSX.Element => (
  <>
    <pre
      aria-hidden
      className="pointer-events-none absolute -top-2 right-[38px] m-0 hidden select-none font-mono text-[10px] font-normal leading-[1.15] text-accent opacity-[0.13] md:block"
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      {ROWS.join("\n")}
    </pre>
    <pre
      aria-hidden
      className="pointer-events-none absolute top-0 -right-[10px] m-0 select-none font-mono text-[8px] font-normal leading-[1.15] text-accent opacity-[0.12] md:hidden"
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      {ROWS.slice(0, 6).map((row) => row.slice(0, 25)).join("\n")}
    </pre>
  </>
);
