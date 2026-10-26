// [input, accepted, output] cases for URL fields (admin forms and env vars) under zod 4
// `z.url()`. `output` is the parsed value; when omitted it is `input.trim()`.
//
// zod 3.23.8 `z.string().url()` accepted exactly what `new URL(input)` accepts and returned
// the input unchanged. zod 4 `z.url()` differs in two ways, marked "zod 4:" below:
// - it runs String.prototype.trim() before parsing, so Unicode whitespace at either end
//   (U+00A0, U+3000, U+2028, ...) is now accepted and removed; zod 3 rejected it because the
//   URL parser only strips ASCII whitespace and C0 controls;
// - it removes ASCII tab, LF and CR anywhere in the returned value (the URL parser ignores
//   them anyway); zod 3 accepted such input but returned it with those characters in it.
// All other rows are accepted or rejected exactly as with zod 3.
export const URL_CASES: Array<[input: string, accepted: boolean, output?: string]> = [
  ["https://example.com", true],
  ["http://localhost:3000/x?y=1#z", true],
  [" https://example.com ", true],
  ["https://exa mple.com", false],
  ["example.com", false],
  ["//example.com", false],
  ["mailto:me@example.com", true],
  ["javascript:alert(1)", true],
  ["ftp://files.example.com", true],
  ["https://", false],
  ["http://[::1]:3000", true],
  ["https://例え.jp/パス", true],
  ["postgresql://build:build@localhost:5432/build", true],
  ["postgres://u@127.0.0.1:5433/db?sslmode=require", true],
  ["https://example.com:99999", false],
  ["http://a", true],
  ["foo:bar", true],
  ["https://user:pa ss@example.com", true],
  ["https://example.com/a b", true],
  ["\thttps://example.com\n", true],
  // zod 4: tab/newline inside the URL are stripped from the value (zod 3 kept them).
  ["https://exa\tmple.com", true, "https://example.com"],
  ["https://example.com/a\nb", true, "https://example.com/ab"],
  ["https://example.com/a\r\nb", true, "https://example.com/ab"],
  // zod 4: Unicode whitespace at the ends is trimmed and accepted (zod 3 rejected these).
  ["\u00a0https://example.com", true, "https://example.com"],
  ["https://example.com\u00a0", true, "https://example.com"],
  ["\u3000https://example.com\u3000", true, "https://example.com"],
  ["\u2028https://example.com\u2028", true, "https://example.com"]
];
