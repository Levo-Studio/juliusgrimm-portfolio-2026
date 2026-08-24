import { describe, expect, it } from "vitest";
import { declaredIconHref, publicHttpUrl } from "@/lib/favicon-parse";

describe("declaredIconHref", () => {
  it("finds a plain rel=icon", () => {
    expect(declaredIconHref('<link rel="icon" href="/icon-32.png">')).toBe("/icon-32.png");
  });

  it("handles the legacy 'shortcut icon' token list", () => {
    expect(declaredIconHref('<link rel="shortcut icon" href="/fav.ico">')).toBe("/fav.ico");
  });

  it("prefers the largest declared size", () => {
    const html = `
      <link rel="icon" sizes="16x16" href="/small.png">
      <link rel="icon" sizes="192x192" href="/large.png">
      <link rel="icon" sizes="32x32" href="/medium.png">`;
    expect(declaredIconHref(html)).toBe("/large.png");
  });

  it("treats sizes=any (an SVG) as the best source", () => {
    const html = `
      <link rel="icon" sizes="512x512" href="/big.png">
      <link rel="icon" sizes="any" href="/icon.svg">`;
    expect(declaredIconHref(html)).toBe("/icon.svg");
  });

  it("prefers rel=icon over apple-touch-icon even when apple's is larger", () => {
    const html = `
      <link rel="apple-touch-icon" sizes="180x180" href="/apple.png">
      <link rel="icon" sizes="32x32" href="/icon.png">`;
    expect(declaredIconHref(html)).toBe("/icon.png");
  });

  it("falls back to apple-touch-icon when nothing else is declared", () => {
    expect(declaredIconHref('<link rel="apple-touch-icon" href="/apple.png">')).toBe("/apple.png");
  });

  it("copes with single quotes, extra attributes and uppercase tags", () => {
    expect(declaredIconHref("<LINK REL='ICON' TYPE='image/png' HREF='/up.png' >")).toBe("/up.png");
  });

  it("ignores unrelated link tags", () => {
    const html = '<link rel="stylesheet" href="/a.css"><link rel="preconnect" href="https://x.dev">';
    expect(declaredIconHref(html)).toBeNull();
  });

  it("returns null when a link has no href", () => {
    expect(declaredIconHref('<link rel="icon">')).toBeNull();
  });

  it("accepts absolute hrefs on another host", () => {
    expect(declaredIconHref('<link rel="icon" href="https://cdn.example.com/i.png">'))
      .toBe("https://cdn.example.com/i.png");
  });
});

describe("publicHttpUrl", () => {
  it("accepts ordinary https sites", () => {
    expect(publicHttpUrl("https://orbitaly.de")?.hostname).toBe("orbitaly.de");
  });

  it.each([
    ["localhost", "http://localhost:3000"],
    ["loopback ip", "http://127.0.0.1/"],
    ["cloud metadata", "http://169.254.169.254/latest/meta-data/"],
    ["private range", "http://192.168.1.1/"],
    ["ipv6 loopback", "http://[::1]/"],
    [".internal suffix", "http://db.internal/"],
    [".local suffix", "http://nas.local/"],
    ["bare hostname", "http://router/"],
    ["file protocol", "file:///etc/passwd"],
    ["non-url", "not a url"]
  ])("refuses %s", (_label, url) => {
    expect(publicHttpUrl(url)).toBeNull();
  });
});
