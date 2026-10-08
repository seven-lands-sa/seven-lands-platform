/**
 * Normalizes a URL path for redirect matching and creation.
 * Rules:
 * - Strips query strings and hash anchors for route matching
 * - Trims whitespace
 * - Prepends leading slash if relative
 * - Removes trailing slash (except root '/')
 * - Lowercases the path segment
 */
export function normalizeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let path = raw.trim();
  if (!path) return "";

  // If full URL, parse path
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      path = url.pathname;
    } catch {
      return "";
    }
  }

  // Remove queries/hashes
  path = path.split("?")[0]!.split("#")[0]!;

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  // Normalize multiple slashes to single
  path = path.replace(/\/+/g, "/");

  // Remove trailing slash if longer than 1 character
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path.toLowerCase();
}

/**
 * Validates the destination target.
 * Destination can be an internal path (starting with /) or an absolute https:// URL.
 * Dangerous protocols (javascript:, data:, etc.) are strictly forbidden.
 */
export function validateRedirectDestination(to: unknown, from: string): string | null {
  if (typeof to !== "string" || !to.trim()) {
    return "الوجهة مطلوبة.";
  }
  const dest = to.trim();

  // Guard against unsafe protocols
  if (/^\s*(javascript|data|vbscript|file|blob):/i.test(dest)) {
    return "بروتوكول الوجهة غير آمن ومرفوض تمامًا.";
  }

  if (dest.startsWith("/")) {
    const normTo = normalizeRedirectPath(dest);
    const normFrom = normalizeRedirectPath(from);
    if (normTo === normFrom) {
      return "لا يمكن تحويل المسار إلى نفسه (حلقة توجيه دائرية).";
    }
    return null;
  }

  // External URL must be http/https
  try {
    const url = new URL(dest);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return "الروابط الخارجية يجب أن تبدأ بـ https://.";
    }
  } catch {
    return "صيغة الرابط غير صحيحة.";
  }

  return null;
}
