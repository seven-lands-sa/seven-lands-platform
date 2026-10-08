import { getPayload } from "payload";
import config from "@payload-config";
const payload = await getPayload({ config });
const { docs } = await payload.find({ collection: "media", limit: 200, overrideAccess: true });
for (const doc of docs) {
  if (String(doc.filename).startsWith("rbac-")) {
    await payload.delete({ collection: "media", id: doc.id, overrideAccess: true });
    console.log("deleted leftover", doc.id, doc.filename);
  }
}
await payload.destroy();
