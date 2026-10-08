import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { lands } from "@/content/services";
import type { AppLocale } from "@/i18n/routing";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { PathArt } from "@/components/brand/PathArt";

/**
 * Not-found page. Two entry points share this UI:
 *  1. `not-found.tsx` — thrown by notFound() inside a page.
 *  2. this route — the proxy rewrites unknown paths here so the response can
 *     carry a real 404 status (see src/proxy.ts).
 * It is never linked and always noindexed.
 */

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

export default async function NotFoundRoute({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "notFound" });
  const tCta = await getTranslations({ locale, namespace: "cta" });

  return (
    <div className="bg-offwhite">
      <div className="container-x grid items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <p className="eyebrow num">404</p>
          <h1 className="display-1 mt-6 max-w-[24ch]">{t("heading")}</h1>
          <p className="lede measure mt-6">{t("body")}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/" size="lg">
              <span>{tCta("backHome")}</span>
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/services" size="lg" variant="secondary">
              <span>{tCta("exploreServices")}</span>
            </ButtonLink>
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <div className="on-dark rounded-[1.25rem] bg-ink-950 p-6">
            <PathArt variant="dark" animate={false} className="max-h-56" />
          </div>
        </div>
      </div>

      <div className="container-x pb-20">
        <h2 className="eyebrow mb-6">{t("landsHeading")}</h2>
        <ul className="grid gap-px overflow-hidden rounded-[1.25rem] border border-ink-950/10 bg-ink-950/10 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {lands.map((land) => (
            <li key={land.slug} className="bg-white">
              <Link
                href={`/services/${land.slug}`}
                className="flex h-full items-center gap-4 p-5 transition-colors duration-200 hover:bg-offwhite"
              >
                <span className="num text-[0.75rem] font-semibold text-muted">{land.number}</span>
                <span className="text-[0.9375rem] font-semibold">{land.copy[locale].short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
