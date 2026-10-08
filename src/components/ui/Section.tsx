import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Section({
  children,
  className,
  id,
  as: Tag = "section",
  tone = "light",
  size = "default",
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "footer" | "header";
  tone?: "light" | "white" | "dark";
  size?: "default" | "compact";
  labelledBy?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={clsx(
        size === "compact" ? "section-y-sm" : "section-y",
        tone === "dark" && "on-dark surface-dark",
        tone === "white" && "bg-white",
        tone === "light" && "bg-offwhite",
        className,
      )}
    >
      <div className="container-x">{children}</div>
    </Tag>
  );
}

export function Eyebrow({
  children,
  className,
  tone = "muted",
}: {
  children: ReactNode;
  className?: string;
  tone?: "muted" | "ice";
}) {
  return (
    <p className={clsx("eyebrow", tone === "ice" && "text-ice-400", className)}>{children}</p>
  );
}

/** Editorial section header: eyebrow + title + optional lede, aligned to a 12-col grid. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
  align = "start",
  className,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
  align?: "start" | "center";
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "grid gap-x-10 gap-y-5 md:grid-cols-12",
        align === "center" && "text-center",
        className,
      )}
    >
      <div className={clsx("md:col-span-5", align === "center" && "md:col-span-12")}>
        {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
        <h2 id={id} className="display-2 max-w-[22ch] text-balance">
          {title}
        </h2>
      </div>
      {(lede || actions) && (
        <div className={clsx("md:col-span-6 md:col-start-7", align === "center" && "md:col-span-12")}>
          {lede ? <p className="lede measure">{lede}</p> : null}
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      )}
    </div>
  );
}

/** Numbered editorial marker, e.g. 01 / المجال */
export function IndexMark({ value, label }: { value: string; label?: string }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="num text-[0.8125rem] font-semibold text-muted">{value}</span>
      {label ? <span className="text-[0.8125rem] text-muted">{label}</span> : null}
    </span>
  );
}
