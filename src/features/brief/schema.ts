import { z } from "zod";
import { lands } from "@/content/services";
import { normalizeSaudiPhone } from "@/lib/utils";

export const landSlugs = lands.map((land) => land.slug) as [string, ...string[]];

export const timelineValues = ["now", "quarter", "later", "unsure"] as const;
export const channelValues = ["whatsapp", "call"] as const;

/**
 * Shared by the client form and the API route — one contract, validated twice.
 * No `.default()` is used so input and output types stay identical, which keeps
 * react-hook-form's generics honest; defaults live in the form's `defaultValues`.
 * `website` is a honeypot: real users never fill it.
 */
export const briefSchema = z
  .object({
    mode: z.enum(["brief", "quick"]),
    lands: z.array(z.enum(landSlugs)),
    goal: z.string().trim().min(10).max(2000),
    timeline: z.enum(timelineValues).optional(),
    name: z.string().trim().min(2).max(120),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(24)
      .refine((value) => normalizeSaudiPhone(value) !== null, { message: "invalid_phone" }),
    email: z.union([z.email(), z.literal("")]).optional(),
    channel: z.enum(channelValues),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
    consent: z.boolean(),
    /*
     * Honeypot. It must ACCEPT a filled value rather than refuse it: a field-level rejection both
     * tells the bot which field tripped it and leaves the route's "silently accept and drop" branch
     * unreachable (measured — a filled trap answered 422 validation_failed). Bounded so it cannot
     * carry a payload; the route discards it and returns the same success a real visitor sees.
     */
    website: z.string().max(200).optional().or(z.literal("")),
    /** Attribution captured client-side; stored with the lead, never shown to the user. */
    campaign: z.record(z.string(), z.string().max(120)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "brief" && data.lands.length === 0) {
      ctx.addIssue({ code: "custom", path: ["lands"], message: "lands_required" });
    }
    if (!data.consent) {
      ctx.addIssue({ code: "custom", path: ["consent"], message: "consent_required" });
    }
  });

export type BriefData = z.output<typeof briefSchema>;

/** Human-readable summary, reused for the WhatsApp handoff after submitting. */
export function briefToPlainText(
  data: BriefData,
  labels: {
    lands: Record<string, string>;
    timeline: Record<string, string>;
    channel: Record<string, string>;
    headings: { lands: string; goal: string; timeline: string; contact: string; notes: string };
  },
) {
  const lines: string[] = [];
  if (data.lands.length) {
    lines.push(
      `${labels.headings.lands}: ${data.lands.map((slug) => labels.lands[slug] ?? slug).join(" · ")}`,
    );
  }
  lines.push(`${labels.headings.goal}: ${data.goal}`);
  if (data.timeline) lines.push(`${labels.headings.timeline}: ${labels.timeline[data.timeline]}`);
  lines.push(
    `${labels.headings.contact}: ${data.name}${data.company ? ` — ${data.company}` : ""} — ${data.phone}${
      data.email ? ` — ${data.email}` : ""
    } (${labels.channel[data.channel]})`,
  );
  if (data.notes) lines.push(`${labels.headings.notes}: ${data.notes}`);
  return lines.join("\n");
}

/**
 * Per-step schemas.
 *
 * react-hook-form's `trigger(fields)` runs the whole resolver, so a multi-step form
 * would report errors from steps the visitor has not reached yet. Each step is
 * therefore parsed against its own small schema, and the full contract still checks
 * everything once on submit.
 */
export const stepSchemas = {
  lands: z.object({ lands: z.array(z.enum(landSlugs)).min(1, "lands_required") }),
  goal: z.object({ goal: z.string().trim().min(10, "goal_too_short").max(2000) }),
  timeline: z.object({ timeline: z.enum(timelineValues) }),
  contact: z.object({
    name: z.string().trim().min(2, "name_required").max(120),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(24)
      .refine((value) => normalizeSaudiPhone(value) !== null, { message: "invalid_phone" }),
    email: z.union([z.email(), z.literal("")]).optional(),
    consent: z.literal(true, { message: "consent_required" }),
  }),
} as const;

export type StepKey = keyof typeof stepSchemas;
