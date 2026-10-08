/**
 * Does Payload accept a whole-document write (`locale: "all"`) with per-locale values — the shape its
 * own admin panel uses? If yes, seeds and publish writes produce ONE version that holds both
 * languages, and no later locale write can hide the other language from the draft.
 */
import { getPayload } from "payload";
import config from "@payload-config";
const payload = await getPayload({ config });

const all = await payload.findByID({ collection: "pages", id: 2, locale: "all", draft: true, depth: 0, overrideAccess: true }) as unknown;
const sections = all.sections as unknown[];
const hero = sections.find((b) => b.blockType === "hero");
console.log("hero.title1 (locale:all) =", JSON.stringify(hero?.title1));

const why = sections.find((b) => b.blockType === "why");
console.log("why.items[0] =", JSON.stringify(why?.items?.[0]).slice(0, 160));

try {
  await payload.update({
    collection: "pages",
    id: 2,
    locale: "all" as never,
    draft: true,
    data: { title: all.title, sections } as never,
    overrideAccess: true,
  });
  console.log("write with locale:'all' → OK");

  for (const locale of ["ar", "en"] as const) {
    const doc = await payload.findByID({ collection: "pages", id: 2, locale, draft: true, depth: 0, overrideAccess: true }) as unknown;
    const w = (doc.sections ?? []).find((b: Record<string, unknown>) => b.blockType === "why");
    console.log(`  read ${locale}: title=${JSON.stringify(doc.title)} why.items=${w?.items?.length} first=${JSON.stringify(w?.items?.[0]?.title)}`);
  }
} catch (error) {
  console.log("write with locale:'all' → FAILED:", error instanceof Error ? error.message : String(error));
}
await payload.destroy();
