import { z } from "zod";
import { env } from "@/lib/env";

export type GeneratedTech = { label: string; colorCategory: "green" | "orange" | "red" | "blue" };

export type CaseStudyDraft = {
  title: string;
  subtitle: string;
  description: string;
  whyBuilt: string;
  techStack: GeneratedTech[];
};

export class CaseStudyGenerationError extends Error {}

const draftSchema = z.object({
  title: z.string().trim().min(2).max(160),
  subtitle: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10),
  whyBuilt: z.string().trim().min(10),
  techStack: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        colorCategory: z.enum(["green", "orange", "red", "blue"])
      })
    )
    .max(12)
    .default([])
});

const DEFAULT_MODEL = "mistral-large-latest";
const ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

// The voice: first-person, dry, self-deprecating, anti-marketing. Few-shot examples are
// real case studies so the model matches tone instead of drifting into corporate copy.
const systemPrompt = `You write portfolio case studies for Julius Grimm, a full-stack engineer, in his exact voice.

Voice rules:
- First person, dry, self-deprecating humour. Proud of the work but constantly mocking his own overengineering.
- Anti-marketing. No corporate buzzwords, no "seamless", "cutting-edge", "leverage", "empower", no exclamation marks.
- Developer in-jokes and real frustration. Occasional em-dashes. Lowercase brand jokes are fine.

Field rules:
- title: the product name only (short, no tagline).
- subtitle: ONE short punchy joke-line about the motivation. Examples: "Accounting, but slightly less depressing." / "Messenger encryption paranoia, so I built my own." / "Slightly overengineered customer support."
- description: about two sentences. First says what it factually is (wrapped in personality); second says what it does for the user with a twist.
- whyBuilt: one to two first-person sentences about the frustration that triggered it, ending on a jab.
- techStack: 4-7 tags. FIRST decide what kind of project this is, then pick the realistic stack Julius actually uses:
  - Web app / SaaS / dashboard / platform: Next.js, React, TypeScript, PostgreSQL, Tailwind (all green). Add Docker (orange) if it's self-hosted or containerised.
  - Self-hosted service / infra / internal tool: Next.js + TypeScript + PostgreSQL (green) plus Docker (orange).
  - Mobile app: React Native + TypeScript (green).
  - CLI / script / library: TypeScript or Node.js (green), Docker if relevant (orange).
  - API / backend: Next.js or Node.js, TypeScript, PostgreSQL (green), Docker (orange).
  Anything special or protocol-ish (Matrix, Spotify API, WebAuthn, GSAP, Framer Motion) is blue. OS/hardware/security topics are red. Only include tools that genuinely fit what the project does; do not pad with unrelated tech.
  Never include Coolify. Never include Kubernetes unless the description explicitly mentions Kubernetes.
  colorCategory mapping: green = languages/frameworks/core stack, orange = tooling/devops, red = OS/hardware/security, blue = special/protocol/side-quest. If unsure, use green.

Examples of the voice (subtitle | description | whyBuilt):
- "Slightly overengineered customer support." | "A modern ticketing and client support platform built for handling projects, requests, and the kind of quick changes that are never actually quick." | "Client communication turns chaotic fast when everything lives in email threads and DMs. I built this so support chaos stays structured, searchable, and less painful."
- "Messenger encryption paranoia, so I built my own." | "A self-hosted Matrix onboarding platform built because trusting random messenger stacks felt reckless. Orbitaly turns Matrix client setup into a flow that normal people can finish without rage quitting." | "I was paranoid about messenger encryption and onboarding complexity, so I built Orbitaly to make secure Matrix client onboarding as easy as possible while keeping everything under my own control."

Respond ONLY with a JSON object with keys: title, subtitle, description, whyBuilt, techStack (array of {label, colorCategory}). No markdown, no commentary.`;

export const generateCaseStudy = async (input: string): Promise<CaseStudyDraft> => {
  const prompt = input.trim();
  if (prompt.length < 10) {
    throw new CaseStudyGenerationError("Please describe the case study in a bit more detail first.");
  }

  const apiKey = env.MISTRAL_API_KEY?.trim();
  if (!apiKey) {
    throw new CaseStudyGenerationError("Mistral is not configured. Set MISTRAL_API_KEY to enable generation.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: env.MISTRAL_MODEL?.trim() || DEFAULT_MODEL,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Describe the case study:\n${prompt}` }
        ]
      }),
      signal: controller.signal
    });
  } catch {
    throw new CaseStudyGenerationError("Could not reach Mistral. Check your connection and try again.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new CaseStudyGenerationError(`Mistral request failed (${response.status}). Please retry in a moment.`);
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new CaseStudyGenerationError("Mistral returned an empty response. Please retry.");
  }

  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    throw new CaseStudyGenerationError("Mistral returned malformed content. Please retry.");
  }

  const parsed = draftSchema.safeParse(json);
  if (!parsed.success) {
    throw new CaseStudyGenerationError("Generated draft was incomplete. Please retry.");
  }

  return parsed.data;
};
