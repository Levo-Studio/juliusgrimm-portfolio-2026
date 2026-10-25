import { describe, expect, it } from "vitest";
import {
  adminEmailSchema,
  deletePasskeySchema,
  deleteProjectSchema,
  generateCaseStudySchema,
  projectCreateSchema,
  projectLinkSchema,
  projectSchema,
  sessionSchema,
  toggleSchema
} from "@/app/admin/schemas";
import { URL_CASES } from "@/tests/url-cases";

// The accepted input sets below were recorded with zod 3.23.8 and pin the behaviour of the
// admin forms across the zod 4 migration. Two deliberate differences under zod 4:
// - z.url() returns the input trimmed (zod 3 kept surrounding whitespace, which the URL
//   parser ignores anyway); the accepted set is unchanged.
// - z.uuid() only accepts RFC 9562 UUIDs. Every id the forms submit comes from Postgres
//   gen_random_uuid() (version 4), so only ids that can never exist are newly rejected.

const EMAIL_CASES: Array<[string, boolean]> = [
  ["me@juliusgrimm.dev", true],
  ["a.b+c@sub.example.co", true],
  ["a'b@x.de", true],
  ["A@X.DE", true],
  ["a_b-c@x-y.museum", true],
  ["no-at", false],
  ["a@b", false],
  ["a@b.c", false],
  ["a..b@x.de", false],
  [".a@x.de", false],
  ["a.@x.de", false],
  ["a@-x.de", false],
  ["üser@x.de", false],
  ["a@x.de ", false],
  ['"q"@x.de', false],
  ["a@x_y.de", false],
  ["a@[127.0.0.1]", false],
  ["a@x.d3", false],
  ["", false]
];

const UUID_CASES: Array<[string, boolean]> = [
  ["8b3afaca-7d36-46a4-bc69-989ff1e1638f", true],
  ["8B3AFACA-7D36-46A4-BC69-989FF1E1638F", true],
  ["00000000-0000-0000-0000-000000000000", true],
  ["ffffffff-ffff-ffff-ffff-ffffffffffff", true],
  ["12345678-1234-1234-1234-123456789abc", false], // variant nibble 1: not RFC 9562
  ["12345678-1234-0234-8234-123456789abc", false], // version nibble 0: not RFC 9562
  ["8b3afaca7d3646a4bc69989ff1e1638f", false],
  ["fallback-0", false],
  ["{8b3afaca-7d36-46a4-bc69-989ff1e1638f}", false],
  ["", false]
];

const validProject = {
  slug: "",
  title: "Orbitaly",
  subtitle: "Messenger paranoia",
  description: "A self-hosted Matrix onboarding platform.",
  whyBuilt: "Because trusting random stacks felt reckless.",
  createdAt: "",
  visible: "true"
};

describe("adminEmailSchema", () => {
  it.each(EMAIL_CASES)("%j -> %s", (input, accepted) => {
    expect(adminEmailSchema.safeParse(input).success).toBe(accepted);
  });
});

describe("project link url", () => {
  it.each(URL_CASES)("%j -> %s", (url, accepted) => {
    const result = projectLinkSchema.safeParse({ label: "Site", url, visible: true, sortOrder: 1 });
    expect(result.success).toBe(accepted);
    if (result.success) expect(result.data.url).toBe(url.trim());
  });

  it("rejects an empty url", () => {
    expect(projectLinkSchema.safeParse({ label: "Site", url: "", visible: true, sortOrder: 1 }).success).toBe(false);
  });
});

describe("project imageUrl", () => {
  it.each(URL_CASES)("%j -> %s", (imageUrl, accepted) => {
    for (const schema of [projectSchema, projectCreateSchema]) {
      const result = schema.safeParse({ ...validProject, imageUrl });
      expect(result.success).toBe(accepted);
      if (result.success) expect(result.data.imageUrl).toBe(imageUrl.trim());
    }
  });

  it("accepts an empty or missing imageUrl", () => {
    for (const schema of [projectSchema, projectCreateSchema]) {
      expect(schema.safeParse({ ...validProject, imageUrl: "" }).success).toBe(true);
      expect(schema.safeParse(validProject).success).toBe(true);
    }
  });
});

describe("uuid fields", () => {
  it.each(UUID_CASES)("%j -> %s", (id, accepted) => {
    expect(projectSchema.safeParse({ ...validProject, id }).success).toBe(accepted);
    expect(deleteProjectSchema.safeParse({ id }).success).toBe(accepted);
    expect(toggleSchema.safeParse({ id, visible: "false" }).success).toBe(accepted);
    expect(sessionSchema.safeParse({ sessionId: id }).success).toBe(accepted);
    expect(deletePasskeySchema.safeParse({ authenticatorId: id }).success).toBe(accepted);
  });

  it("keeps id optional when editing a project", () => {
    expect(projectSchema.safeParse(validProject).success).toBe(true);
  });
});

describe("project defaults and trimming", () => {
  it("fills slug/createdAt defaults and trims create input", () => {
    const result = projectCreateSchema.safeParse({ ...validProject, slug: undefined, createdAt: undefined, title: "  Orbitaly  " });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.slug).toBe("");
    expect(result.data.createdAt).toBe("");
    expect(result.data.title).toBe("Orbitaly");
  });

  it("rejects an unknown visibility value", () => {
    expect(projectSchema.safeParse({ ...validProject, visible: "yes" }).success).toBe(false);
  });
});

describe("generateCaseStudySchema", () => {
  it("returns the custom message for prompts that are too short", () => {
    const result = generateCaseStudySchema.safeParse({ prompt: "  short  " });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe("Please describe the case study in a bit more detail first.");
  });

  it("trims accepted prompts", () => {
    const result = generateCaseStudySchema.safeParse({ prompt: "  a long enough prompt  " });
    expect(result.success && result.data.prompt).toBe("a long enough prompt");
  });
});
