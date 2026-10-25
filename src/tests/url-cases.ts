// [input, accepted] pairs for URL fields (admin forms and env vars), recorded with
// zod 3.23.8 `z.string().url()`, which accepts anything the WHATWG URL parser accepts.
// zod 4 `z.url()` accepts exactly the same set (it trims the returned value).
export const URL_CASES: Array<[string, boolean]> = [
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
  ["https://user:pa ss@example.com", true]
];
