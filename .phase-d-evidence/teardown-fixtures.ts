/**
 * Phase D teardown: unlink the fixture OG image from Site Settings, then remove every media fixture.
 * Order matters — clearing the reference first is what keeps the global from pointing at a deleted
 * asset (and it exercises the same rule the delete hook enforces for an editor).
 */
import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });
const settings = (await payload.findGlobal({ slug: "site-settings", locale: "ar", depth: 0, overrideAccess: true })) as Record<string, never>;
const brand = (settings.brand ?? {}) as Record<string, unknown>;
if (brand.defaultOgImage) {
  await payload.updateGlobal({
    slug: "site-settings",
    locale: "ar",
    overrideAccess: true,
    data: { ...(settings as never), brand: { ...brand, defaultOgImage: null } } as never,
  });
  console.log(`unlinked defaultOgImage (was #${brand.defaultOgImage})`);
}

const { docs } = await payload.find({ collection: "media", limit: 200, overrideAccess: true });
for (const doc of docs) {
  try {
    await payload.delete({ collection: "media", id: doc.id, overrideAccess: true });
    console.log(`deleted #${doc.id} ${doc.filename}`);
  } catch (error) {
    console.log(`KEPT #${doc.id} ${doc.filename} — ${String(error).split("\n")[0]}`);
  }
}
const after = await payload.find({ collection: "media", limit: 1, overrideAccess: true });
console.log(`media rows remaining: ${after.totalDocs}`);
await payload.destroy();
