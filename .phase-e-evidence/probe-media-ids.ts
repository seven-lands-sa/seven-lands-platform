import { collectPageMediaIds } from "@/lib/pages/publish";
const hero = (m: unknown, mm: unknown = null, id = 1) => ({ blockType: "hero", id: String(id), enabled: true, eyebrow: "ع", title1: "س", support: "د", primary: { label: "أ", routeKey: "start-a-project" }, media: m, mobileMedia: mm });
const out = collectPageMediaIds({ sections: [hero(3, 9), hero(12, null, 2)] } as never);
console.log("ids:", JSON.stringify(out));
