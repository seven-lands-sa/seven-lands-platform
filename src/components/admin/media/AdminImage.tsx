"use client";

/**
 * Admin-only preview image.
 *
 * Deliberately a plain `<img>`: media files are served by `/api/media/file/...` and that route
 * enforces byte-level visibility per request (private assets answer 403 to anyone without
 * `media.read`). The Next image optimizer cannot authenticate as the logged-in editor, so routing
 * previews through it would 403 every private asset — the exact class of asset this library is for.
 */
export function AdminImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see the note above
    <img src={src} alt={alt} className={className} style={style} loading="lazy" decoding="async" />
  );
}

export default AdminImage;
