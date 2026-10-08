/** Remove media fixtures left behind by ad-hoc probes (dev only). */
import { getPayload } from "payload";
import config from "@payload-config";
const payload = await getPayload({ config });
const { docs } = await payload.find({ collection: "media", limit: 100, overrideAccess: true });
for (const doc of docs) {
  try {
    await payload.delete({ collection: "media", id: doc.id, overrideAccess: true });
    console.log("deleted", doc.id, doc.filename);
  } catch (error) {
    console.log("kept", doc.id, doc.filename, String(error).slice(0, 80));
  }
}
await payload.destroy();
