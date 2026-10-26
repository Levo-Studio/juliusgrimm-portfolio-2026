import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JsonLd, serializeJsonLd } from "@/components/shared/json-ld";

const hostile = {
  "@context": "https://schema.org",
  name: "Case study</script><script>alert(1)</script>",
  description: "<!-- comment --> & <b>bold</b> &amp; </SCRIPT >",
  separators: "line\u2028paragraph\u2029end",
  nested: { list: ["a<b", "c>d", "e&f"] }
};

describe("JsonLd", () => {
  it("cannot be broken out of by text inside the data", () => {
    const html = `<!doctype html><html><head></head><body>${renderToStaticMarkup(<JsonLd data={hostile} />)}</body></html>`;
    const document = new DOMParser().parseFromString(html, "text/html");

    const scripts = document.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(scripts[0].type).toBe("application/ld+json");
    expect(document.body.children).toHaveLength(1);
    expect(JSON.parse(scripts[0].textContent ?? "")).toEqual(hostile);
  });

  it("escapes <, >, &, U+2028 and U+2029 as JSON unicode escapes and nothing else", () => {
    const serialized = serializeJsonLd(hostile);
    expect(serialized).not.toMatch(/[<>&\u2028\u2029]/);
    expect(serialized).toContain("Case study\\u003c/script\\u003e");
    expect(serialized).toContain("line\\u2028paragraph\\u2029end");
    expect(JSON.parse(serialized)).toEqual(hostile);
  });

  it("leaves ordinary data byte-identical to JSON.stringify", () => {
    const plain = { "@type": "Person", name: "Julius Grimm", url: "https://juliusgrimm.dev", sameAs: ["https://github.com/x"] };
    expect(serializeJsonLd(plain)).toBe(JSON.stringify(plain));
  });
});
