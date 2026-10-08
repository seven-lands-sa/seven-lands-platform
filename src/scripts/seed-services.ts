/**
 * DETERMINISTIC SEED — the seven capabilities (§10–§12, §42/§44).
 *
 * What it does, exactly once: takes the shipped `src/content/services.ts` content — the copy that is
 * ALREADY public — and writes it into the `services` collection as DRAFTS, one document per
 * immutable `landKey`, in both languages.
 *
 * What it deliberately does NOT do:
 *   · it never publishes anything (that is the editor's deliberate act through the gated endpoint);
 *   · it never invents a word: every string comes from the shipped file, so an equivalence test can
 *     compare the two byte for byte;
 *   · it is idempotent — running it again updates the same seven documents and creates nothing new;
 *   · it refuses to run against a database that already holds capability documents unless
 *     `FORCE_SERVICE_SEED=true` is set explicitly, so it can never overwrite live editorial work.
 *
 * Usage:
 *   npx payload run src/scripts/seed-services.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

import { lands, scopeNote } from "@/content/services";
import type { ServiceLocale } from "@/lib/services/model";

const LOCALES: ServiceLocale[] = ["ar", "en"];

/** One locale's worth of document data, straight from the shipped content. */
function localeData(index: number, locale: ServiceLocale) {
  const land = lands[index];
  const copy = land.copy[locale];
  return {
    title: copy.title,
    short: copy.short,
    promise: copy.promise,
    intro: copy.intro,
    wa: copy.wa,
    capabilities: copy.capabilities.map((item) => ({ item })),
    problems: copy.problems.map((row) => ({ question: row.question, answer: row.answer })),
    faqs: copy.faqs.map((row) => ({ q: row.q, a: row.a })),
    scopeNote: scopeNote[locale],
    seo: { title: copy.title, description: copy.promise, noindex: false },
  };
}

async function main() {
  const payload = await getPayload({ config });

  const existing = await payload.count({ collection: "services", overrideAccess: true });
  const force = process.env.FORCE_SERVICE_SEED === "true";
  if (existing.totalDocs > 0 && !force) {
    payload.logger.info(
      `[seed-services] ${existing.totalDocs} capability document(s) already exist — nothing to do. ` +
        "Set FORCE_SERVICE_SEED=true to re-align them with the shipped content.",
    );
    return;
  }

  const created: string[] = [];
  const updated: string[] = [];

  for (let index = 0; index < lands.length; index += 1) {
    const land = lands[index];
    const number = land.number;

    /* Base (locale-independent) data — identity, order and the approved glyph. */
    const base = {
      landKey: land.slug,
      number,
      order: index + 1,
      enabled: true,
      glyph: land.glyph,
      localeState: {
        ar: { state: "draft" as const, at: null },
        en: { state: "draft" as const, at: null },
      },
    };

    const found = await payload.find({
      collection: "services",
      where: { landKey: { equals: land.slug } },
      limit: 1,
      pagination: false,
      depth: 0,
      draft: true,
      locale: "all",
      overrideAccess: true,
    });

    if (found.docs.length === 0) {
      /* Create in the default locale first so the document exists with a stable identity. */
      const doc = await payload.create({
        collection: "services",
        locale: LOCALES[0],
        draft: true,
        data: { ...base, ...localeData(index, LOCALES[0]) } as never,
        context: { serviceAudit: true },
        overrideAccess: true,
      });
      for (const locale of LOCALES.slice(1)) {
        await payload.update({
          collection: "services",
          id: doc.id,
          locale,
          draft: true,
          data: localeData(index, locale) as never,
          context: { serviceAudit: true },
          overrideAccess: true,
        } as never);
      }
      created.push(`${land.slug} (#${doc.id})`);
    } else {
      const doc = found.docs[0] as { id: string | number };
      for (const locale of LOCALES) {
        await payload.update({
          collection: "services",
          id: doc.id,
          locale,
          draft: true,
          data: { ...(locale === LOCALES[0] ? base : {}), ...localeData(index, locale) } as never,
          context: { serviceAudit: true },
          overrideAccess: true,
        } as never);
      }
      updated.push(`${land.slug} (#${doc.id})`);
    }
  }

  payload.logger.info(`[seed-services] created: ${created.length ? created.join(", ") : "none"}`);
  payload.logger.info(`[seed-services] updated: ${updated.length ? updated.join(", ") : "none"}`);
  payload.logger.info("[seed-services] all documents remain DRAFTS — publish is a deliberate editor action.");

  /* Read-back proof straight from the database: every row is a draft in both locales. */
  const check = await payload.find({
    collection: "services",
    limit: 20,
    pagination: false,
    depth: 0,
    draft: true,
    locale: "all",
    overrideAccess: true,
  });
  for (const doc of check.docs as unknown as { landKey?: string; localeState?: Record<string, { state?: string } | undefined> }[]) {
    const states = LOCALES.map((locale) => `${locale}:${doc.localeState?.[locale]?.state ?? "draft"}`).join(" ");
    payload.logger.info(`[seed-services] read-back ${doc.landKey} → ${states}`);
  }
}

await main();
process.exit(0);
