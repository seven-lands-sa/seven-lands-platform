import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { COPYRIGHT_YEAR } from "@/content/site";
import type { AppLocale } from "@/i18n/routing";
import { getFooter, getSiteIdentity, withWhatsAppMessage } from "@/lib/content";
import { PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/Button";

export async function Footer({ locale }: { locale: AppLocale }) {
  const [t, footer, identity] = await Promise.all([
    getTranslations(),
    getFooter(locale),
    getSiteIdentity(locale),
  ]);

  /*
    Two groups, in order: the site menu, then the seven capability territories. They come from the
    Footer global, so renaming a territory is an admin edit. The capability rows keep their `01`–`07`
    markers from the CMS; a row without a marker renders without one.
  */
  const [menuGroup, capabilitiesGroup] = footer.groups;
  const legal = footer.legal;

  return (
    <footer className="on-dark surface-dark">
      <div className="container-x">
        {/* Path motif: a thin directional rule that echoes the logo's orbit. */}
        <div aria-hidden="true" className="pt-14 lg:pt-20">
          <svg viewBox="0 0 1200 24" className="h-6 w-full" preserveAspectRatio="none" fill="none">
            <path
              d="M0 18 C 300 18, 420 4, 720 4 C 980 4, 1080 16, 1200 16"
              stroke="currentColor"
              className="text-offwhite/20"
              strokeWidth="1"
            />
            <circle cx="720" cy="4" r="3" className="fill-ice-400" />
          </svg>
        </div>

        <div className="grid gap-12 py-14 md:grid-cols-12 md:gap-8 lg:py-16">
          <div className="md:col-span-5 lg:col-span-4">
            {/* Full official lockup is used here, where it has room to read. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={identity.assets.logoLight ?? "/brand/seven-lands-logo-light.png"}
              alt={`${identity.brand.nameEn} — ${identity.brand.nameAr}`}
              width={413}
              height={454}
              className="h-[5.5rem] w-auto"
              loading="lazy"
              decoding="async"
            />
            <p className="lede measure mt-6 text-[0.9375rem] text-offwhite/75">
              {footer.statement ?? t("footer.statement")}
            </p>
          </div>

          {menuGroup ? (
            <nav aria-label={t("footer.navHeading")} className="md:col-span-3 lg:col-span-2">
              <h2 className="eyebrow mb-4 text-offwhite/65">{menuGroup.heading}</h2>
              <ul className="flex flex-col gap-2.5">
                {menuGroup.items.map((item) => (
                  <li key={item.id}>
                    {item.link.kind === "external" ? (
                      <a
                        href={item.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.9375rem] text-offwhite/75 transition-colors duration-200 hover:text-white"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.link.path}
                        className="text-[0.9375rem] text-offwhite/75 transition-colors duration-200 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {capabilitiesGroup ? (
            <nav aria-label={t("footer.landsHeading")} className="md:col-span-4 lg:col-span-3">
              <h2 className="eyebrow mb-4 text-offwhite/65">{capabilitiesGroup.heading}</h2>
              <ul className="flex flex-col gap-2.5">
                {capabilitiesGroup.items.map((item) => (
                  <li key={item.id}>
                    {item.link.kind === "external" ? (
                      <a
                        href={item.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-baseline gap-2 text-[0.9375rem] text-offwhite/75 transition-colors duration-200 hover:text-white"
                      >
                        {item.marker ? <span className="num text-[0.6875rem] text-ice-400">{item.marker}</span> : null}
                        <span>{item.label}</span>
                      </a>
                    ) : (
                      <Link
                        href={item.link.path}
                        className="flex items-baseline gap-2 text-[0.9375rem] text-offwhite/75 transition-colors duration-200 hover:text-white"
                      >
                        {item.marker ? <span className="num text-[0.6875rem] text-ice-400">{item.marker}</span> : null}
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className="md:col-span-12 lg:col-span-3">
            <h2 className="eyebrow mb-4 text-offwhite/65">{t("footer.contactHeading")}</h2>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={withWhatsAppMessage(identity.whatsapp.href, t("wa.generic"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp_click"
                  data-analytics-location="footer"
                  className="inline-flex items-center gap-2.5 text-[0.9375rem] text-offwhite/80 transition-colors duration-200 hover:text-white"
                >
                  <WhatsAppIcon className="text-ice-400" />
                  <span className="num" dir="ltr">
                    {identity.whatsapp.display}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={identity.phone.href}
                  data-analytics="phone_click"
                  data-analytics-location="footer"
                  className="inline-flex items-center gap-2.5 text-[0.9375rem] text-offwhite/80 transition-colors duration-200 hover:text-white"
                >
                  <PhoneIcon className="text-ice-400" />
                  <span>{t("cta.call")}</span>
                </a>
              </li>
              <li>
                <a
                  href={identity.location.mapsUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="maps_click"
                  data-analytics-location="footer"
                  className="inline-flex items-start gap-2.5 text-[0.9375rem] text-offwhite/80 transition-colors duration-200 hover:text-white"
                >
                  <PinIcon className="mt-1 text-ice-400" />
                  <span>{identity.location.display ?? t("footer.contactHeading")}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-7 text-[0.8125rem] text-offwhite/65 md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-2">
            <span className="latin" dir="ltr">
              © {COPYRIGHT_YEAR} {identity.brand.nameEn}.
            </span>
            <span>{footer.rightsText ?? t("footer.rights")}.</span>
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legal.map((item) => (
              <li key={item.id}>
                {item.link.kind === "external" ? (
                  <a
                    href={item.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.link.path} className="transition-colors duration-200 hover:text-white">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
