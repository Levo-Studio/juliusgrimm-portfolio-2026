import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const startAuthentication = vi.fn();

vi.mock("@simplewebauthn/browser", () => ({
  startAuthentication: (...args: unknown[]) => startAuthentication(...args)
}));
vi.mock("@/app/admin/actions", () => ({ loginAdmin: vi.fn() }));

describe("AdminLoginForm passkey sign-in", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("passes the server options to startAuthentication as optionsJSON", async () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const options = { challenge: "Y2hhbGxlbmdl", rpId: "localhost", allowCredentials: [], userVerification: "preferred" };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(options), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "stop here" }), { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);
    startAuthentication.mockResolvedValue({ id: "credential" });
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { AdminLoginForm } = await import("@/app/admin/admin-login-form");
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<AdminLoginForm />));

    const button = Array.from(container.querySelectorAll("button")).find((item) => item.textContent?.includes("passkey"));
    expect(button).toBeDefined();
    await act(async () => button?.click());

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/passkeys/login/options", { method: "POST" });
    expect(startAuthentication).toHaveBeenCalledWith({ optionsJSON: options });
    await act(async () => root.unmount());
  });
});
