type JsonLdProps = {
  data: Record<string, unknown>;
};

const UNSAFE_IN_SCRIPT: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};

/**
 * JSON for an inline <script>: characters that could end the element ("</script>"), open
 * a comment ("<!--") or end a line in older JS parsers are written as JSON unicode escapes,
 * so admin-entered text cannot break out while the parsed value stays identical.
 */
export const serializeJsonLd = (data: Record<string, unknown>): string =>
  JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (char) => UNSAFE_IN_SCRIPT[char]);

export const JsonLd = ({ data }: JsonLdProps): React.JSX.Element => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
);
