import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/sections/LegalPage";
import { CONTENT_UPDATED_AT } from "@/content/site";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdentity } from "@/lib/content";
import { PageBlocks } from "@/components/blocks/PageBlocks";
import { getPublishedSystemPage } from "@/lib/pages/adapter";
import { resolvePublicMedia } from "@/lib/content/media";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.terms" });
  const identity = await getSiteIdentity(locale);
  /* §37 — once this locale is published in the CMS its SEO contract wins. `noindex` defaults to
     TRUE here: the shipped legal copy is a placeholder pending legal review, and publishing a page
     through the CMS must never flip that decision by accident. */
  const page = await getPublishedSystemPage("terms", locale);
  const shareImage = page ? resolvePublicMedia(page.seo.ogImage as never, { locale }) : null;
  return buildMetadata({
    identity,
    locale,
    title: page?.seo.title ?? t("title"),
    description: page?.seo.description ?? t("description"),
    path: "/terms",
    noIndex: page?.seo.noindex ?? true,
    ogImagePath: shareImage?.url ?? null,
  });
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  const tMeta = await getTranslations({ locale, namespace: "meta.terms" });
  const sections = t.raw("terms.sections") as { title: string; body: string }[];

  /* §44 — CMS content serves this locale only once it is published for this locale; until then the
     shipped page below renders exactly as before. */
  const cms = await getPublishedSystemPage("terms", locale);
  if (cms) return <PageBlocks page={cms} locale={locale} />;

  return (
    <LegalPage
      title={tMeta("title")}
      intro={t("terms.intro")}
      sections={sections}
      updatedAt={CONTENT_UPDATED_AT}
      draftNotice={t("draftNotice")}
      lastUpdatedLabel={t("lastUpdated")}
    />
  );
}
