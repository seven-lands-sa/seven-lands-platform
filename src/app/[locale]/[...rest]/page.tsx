import { connection } from "next/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";

/**
 * Catch-all for unknown paths inside a locale (e.g. /ar/unknown-page).
 *
 * `connection()` opts the route out of the prerendered shell *before* anything is
 * flushed, so the response carries a real 404 status instead of a 200 with a
 * not-found body streamed into it (soft 404s are bad for search engines).
 */
export const instant = false;

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: AppLocale; rest: string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await connection();
  notFound();
}
