/**
 * Link safety and the contact-channel helpers shared by the CMS layer and the public components.
 *
 * `isSafeExternalUrl` is the only place that decides whether a URL may reach an `href`. Anything
 * that is not absolute `http(s)` — `javascript:`, `data:`, protocol-relative or relative strings —
 * is rejected before it can be stored or rendered (§20/§43).
 */

import type { ContactChannelType, ContactChannelView, LinkTarget } from "./views";
import { routePath } from "./route-registry";

export function isSafeExternalUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Raw link fields as stored in Payload (flat, so the admin form stays simple). */
export type RawLink = {
  linkType?: string | null;
  route?: string | null;
  url?: string | null;
  newTab?: boolean | null;
};

export function toLinkTarget(raw: RawLink | null | undefined): LinkTarget | null {
  if (!raw) return null;
  if (raw.linkType === "external") {
    if (!isSafeExternalUrl(raw.url)) return null;
    return { kind: "external", url: raw.url!.trim(), newTab: raw.newTab !== false };
  }
  const path = routePath(raw.route);
  if (!path) return null;
  return { kind: "internal", path };
}

/** WhatsApp deep links may carry a prefilled message; the number itself lives in the CMS. */
export function withWhatsAppMessage(href: string, message?: string | null): string {
  if (!message) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}text=${encodeURIComponent(message)}`;
}

export function channelOfType(
  channels: readonly ContactChannelView[],
  type: ContactChannelType,
): ContactChannelView | null {
  return channels.find((channel) => channel.type === type) ?? null;
}

/** WhatsApp first, then any phone — the site's primary human contact gesture. */
export function primaryContact(channels: readonly ContactChannelView[]): ContactChannelView | null {
  return (
    channels.find((channel) => channel.primary) ??
    channelOfType(channels, "whatsapp") ??
    channelOfType(channels, "phone") ??
    channels[0] ??
    null
  );
}
