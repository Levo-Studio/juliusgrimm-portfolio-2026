import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AboutText } from "@/components/sections/about-text";

describe("AboutText highlighting", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("highlights single *words* and *multi-word phrases* without the asterisks", async () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("matchMedia", () => ({ matches: true }));

    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () =>
      root.render(<AboutText>{"I am a *professional overthinker* who *ships* things."}</AboutText>)
    );

    const words = Array.from(container.querySelectorAll("[data-word]")).map((node) => [
      node.textContent,
      node.classList.contains("text-accent")
    ]);
    expect(words).toEqual([
      ["I", false],
      ["am", false],
      ["a", false],
      ["professional", true],
      ["overthinker", true],
      ["who", false],
      ["ships", true],
      ["things.", false]
    ]);
    await act(async () => root.unmount());
  });
});
