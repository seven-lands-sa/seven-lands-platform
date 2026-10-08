/**
 * Business hours — validation and the "open now" derivation.
 *
 * Everything here is pure: no request, no database, no `new Date()` at module scope. The public
 * site passes a clock in, which is what makes the behaviour testable (§57) and what keeps
 * cacheComponents happy — the derived state is computed inside a request, never during prerender.
 *
 * TIMEZONE (§8/§13): "open now" is only ever computed from the company timezone, using
 * `Intl.DateTimeFormat` with an explicit `timeZone`. The server's own timezone is irrelevant and
 * is never consulted.
 */

import type {
  BusinessHoursExceptionView,
  BusinessHoursView,
  DayScheduleView,
  TimePeriod,
  Weekday,
} from "./views";

export const WEEKDAYS: readonly Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const WEEKDAY_LABELS: Record<Weekday, { ar: string; en: string }> = {
  sunday: { ar: "الأحد", en: "Sunday" },
  monday: { ar: "الاثنين", en: "Monday" },
  tuesday: { ar: "الثلاثاء", en: "Tuesday" },
  wednesday: { ar: "الأربعاء", en: "Wednesday" },
  thursday: { ar: "الخميس", en: "Thursday" },
  friday: { ar: "الجمعة", en: "Friday" },
  saturday: { ar: "السبت", en: "Saturday" },
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(value: unknown): value is string {
  return typeof value === "string" && TIME_PATTERN.test(value.trim());
}

export function minutesOf(time: string): number {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m);
}

/**
 * V1 has no overnight periods: a shift that ends after midnight is represented as two periods, or
 * as a special date. Rejecting `end <= start` keeps "open now" honest instead of silently
 * mis-reading 22:00–02:00 as a negative interval (§44).
 */
export function periodProblem(
  period: { from?: string | null; to?: string | null } | null | undefined,
): string | null {
  const from = period?.from?.trim() ?? "";
  const to = period?.to?.trim() ?? "";
  if (!from || !to) return "الفترة تحتاج وقت بداية ووقت نهاية.";
  if (!isValidTime(from) || !isValidTime(to)) return "الوقت يجب أن يكون بصيغة 24 ساعة مثل 09:00.";
  if (minutesOf(to) <= minutesOf(from)) {
    return "وقت النهاية يجب أن يكون بعد وقت البداية. الفترات التي تمتد بعد منتصف الليل تُسجَّل كفترتين أو كتاريخ استثنائي.";
  }
  return null;
}

/** Returns the index pair of the first overlapping pair, or null when the day is clean. */
export function overlappingPeriods(periods: TimePeriod[]): [number, number] | null {
  const sorted = periods
    .map((period, index) => ({ index, from: minutesOf(period.from), to: minutesOf(period.to) }))
    .sort((a, b) => a.from - b.from);

  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].from < sorted[i - 1].to) return [sorted[i - 1].index, sorted[i].index];
  }
  return null;
}

export function duplicateDays(days: (string | null | undefined)[]): boolean {
  const seen = new Set<string>();
  for (const day of days) {
    if (!day) continue;
    if (seen.has(day)) return true;
    seen.add(day);
  }
  return false;
}

type ZonedNow = { weekday: Weekday; minutes: number; date: string };

/**
 * The current weekday, minute-of-day and calendar date **in the business timezone**.
 * `en-US` is used only as a stable formatting locale for the numeric parts.
 */
export function zonedNow(timezone: string, at: Date = new Date()): ZonedNow | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(at);

    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    const weekday = get("weekday").toLowerCase() as Weekday;
    if (!WEEKDAYS.includes(weekday)) return null;

    const hour = Number(get("hour")) % 24; // Intl can render midnight as "24"
    const minute = Number(get("minute"));

    return {
      weekday,
      minutes: hour * 60 + minute,
      date: `${get("year")}-${get("month")}-${get("day")}`,
    };
  } catch {
    // An invalid timezone must never take the site down — the caller shows no state instead.
    return null;
  }
}

export type OpenState =
  | { state: "open"; until: string | null; basis: "schedule" | "exception" }
  | { state: "closed"; opensAt: string | null; basis: "schedule" | "exception" }
  | { state: "unknown" };

const activePeriod = (periods: TimePeriod[], minutes: number): TimePeriod | null =>
  periods.find((period) => {
    const from = minutesOf(period.from);
    const to = minutesOf(period.to);
    return minutes >= from && minutes < to;
  }) ?? null;

const nextPeriodOf = (periods: TimePeriod[], minutes: number): TimePeriod | null => {
  const upcoming = periods
    .filter((period) => minutesOf(period.from) > minutes)
    .sort((a, b) => minutesOf(a.from) - minutesOf(b.from));
  return upcoming[0] ?? null;
};

/**
 * Derives مفتوح الآن / مغلق الآن from the structure only.
 *
 * Returns `unknown` when there is nothing trustworthy to say: no schedule configured, an
 * unrecognisable timezone, an empty day list. The UI renders no badge in that case rather than an
 * inaccurate one (§13/§46).
 */
export function getOpenState(
  hours: Pick<BusinessHoursView, "timezone" | "configured" | "week" | "exceptions">,
  at: Date = new Date(),
): OpenState {
  if (!hours.configured || hours.week.length === 0) return { state: "unknown" };

  const now = zonedNow(hours.timezone, at);
  if (!now) return { state: "unknown" };

  const exception: BusinessHoursExceptionView | undefined = hours.exceptions.find(
    (entry) => entry.date === now.date,
  );

  if (exception) {
    if (exception.closed || exception.periods.length === 0) {
      return { state: "closed", opensAt: null, basis: "exception" };
    }
    const period = activePeriod(exception.periods, now.minutes);
    if (period) return { state: "open", until: period.to, basis: "exception" };
    return {
      state: "closed",
      opensAt: nextPeriodOf(exception.periods, now.minutes)?.from ?? null,
      basis: "exception",
    };
  }

  const today: DayScheduleView | undefined = hours.week.find((entry) => entry.day === now.weekday);
  if (!today || today.closed) return { state: "closed", opensAt: null, basis: "schedule" };
  if (today.allDay) return { state: "open", until: null, basis: "schedule" };
  if (today.periods.length === 0) return { state: "closed", opensAt: null, basis: "schedule" };

  const period = activePeriod(today.periods, now.minutes);
  if (period) return { state: "open", until: period.to, basis: "schedule" };

  return {
    state: "closed",
    opensAt: nextPeriodOf(today.periods, now.minutes)?.from ?? null,
    basis: "schedule",
  };
}

/** Formats a period for display: 09:00 – 13:00 */
export function formatPeriod(period: TimePeriod): string {
  return `${period.from} – ${period.to}`;
}
