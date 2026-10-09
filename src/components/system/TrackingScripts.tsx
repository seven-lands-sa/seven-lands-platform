"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import type { TrackingSettingsView } from "@/lib/content/views";
import { getConsentSnapshot, getServerConsentSnapshot, subscribeConsent } from "@/lib/consent";

interface TrackingScriptsProps {
  settings: TrackingSettingsView;
  env: string;
}

export function TrackingScripts({ settings, env }: TrackingScriptsProps) {
  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);

  // Verify environment eligibility
  const isEnvAllowed = settings.environments.includes(env as "production" | "preview" | "development");
  if (!isEnvAllowed) {
    return null;
  }

  const analyticsAllowed = consent?.analytics === true;
  const marketingAllowed = consent?.marketing === true;

  return (
    <>
      {/* ── Google Consent Mode v2 Default Initialization ── */}
      <Script
        id="google-consent-mode"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': '${analyticsAllowed ? "granted" : "denied"}',
              'ad_storage': '${marketingAllowed ? "granted" : "denied"}',
              'ad_user_data': '${marketingAllowed ? "granted" : "denied"}',
              'ad_personalization': '${marketingAllowed ? "granted" : "denied"}',
              'wait_for_update': 500
            });
          `,
        }}
      />

      {/* ── Google Analytics 4 (Direct) ── */}
      {analyticsAllowed && settings.googleAnalytics.enabled && settings.googleAnalytics.id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalytics.id}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.googleAnalytics.id}', {
                  anonymize_ip: true,
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}

      {/* ── Google Tag Manager ── */}
      {analyticsAllowed && settings.gtm.enabled && settings.gtm.containerId && (
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${settings.gtm.containerId}');
            `,
          }}
        />
      )}

      {/* ── Microsoft Clarity ── */}
      {analyticsAllowed && settings.clarity.enabled && settings.clarity.projectId && (
        <Script
          id="clarity-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${settings.clarity.projectId}");
            `,
          }}
        />
      )}

      {/* ── Meta Pixel ── */}
      {marketingAllowed && settings.metaPixel.enabled && settings.metaPixel.id && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${settings.metaPixel.id}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* ── Snapchat Pixel ── */}
      {marketingAllowed && settings.snapPixel.enabled && settings.snapPixel.id && (
        <Script
          id="snap-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
              {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
              a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;
              r.src=n;var u=t.getElementsByTagName(s)[0];
              u.parentNode.insertBefore(r,u);})(window,document,
              'https://sc-static.net/scevent.min.js');
              snaptr('init', '${settings.snapPixel.id}');
              snaptr('track', 'PAGE_VIEW');
            `,
          }}
        />
      )}

      {/* ── TikTok Pixel ── */}
      {marketingAllowed && settings.tiktokPixel.enabled && settings.tiktokPixel.id && (
        <Script
          id="tiktok-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${settings.tiktokPixel.id}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {/* ── LinkedIn Insight Tag ── */}
      {marketingAllowed && settings.linkedin.enabled && settings.linkedin.partnerId && (
        <Script
          id="linkedin-insight-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              _linkedin_partner_id = "${settings.linkedin.partnerId}";
              window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);
              (function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);
              })(window.lintrk);
            `,
          }}
        />
      )}
    </>
  );
}
