"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { lands } from "@/content/services";
import { withWhatsAppMessage } from "@/lib/content/links";
import type { AppLocale } from "@/i18n/routing";
import { briefSchema, briefToPlainText, stepSchemas, type BriefData } from "@/features/brief/schema";
import { campaignContext, track } from "@/lib/analytics";
import { ArrowRight, Button, WhatsAppIcon } from "@/components/ui/Button";

/**
 * Progressive project brief.
 *
 * Brief mode: need → goal → timing → contact (each step validated on its own).
 * Quick mode: one screen, used on the contact page.
 *
 * Every step is reachable by keyboard, errors are announced, and the success
 * state offers a WhatsApp handoff containing the same information so the lead is
 * never trapped in an endpoint the owner has not configured yet.
 */

type Props = {
  mode?: "brief" | "quick";
  className?: string;
  /**
   * Contact links come from the server, which resolves them from the Contact settings global.
   * A client component must not read the CMS itself (it would ship the whole data layer) and must
   * not hard-code a number the owner can change in the admin.
   */
  whatsappBase: string;
  phoneDisplay: string;
};

const inputClass =
  "w-full rounded-[12px] border border-ink-950/20 bg-white px-4 py-3 text-[0.9375rem] text-ink-950 outline-none transition-colors duration-200 placeholder:text-muted focus:border-ink-950/60 focus-visible:outline-2 focus-visible:outline-navy-800/40";

const labelClass = "block text-[0.875rem] font-semibold text-ink-950";

export function ProjectBriefForm({ mode = "brief", className, whatsappBase, phoneDisplay }: Props) {
  const t = useTranslations("start");
  const tLegal = useTranslations("meta.privacy");
  const locale = useLocale() as AppLocale;
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  /**
   * Step-level validation messages are held here rather than in react-hook-form's
   * error map: manual `setError` calls on a checkbox-group field interfere with the
   * resolver and can leave the step stuck. The full contract still runs through
   * zodResolver on submit.
   */
  const [stepIssue, setStepIssue] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<BriefData | null>(null);
  const startedRef = useRef(false);

  const steps = mode === "brief" ? [0, 1, 2, 3] : [0];
  const total = steps.length;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BriefData>({
    resolver: zodResolver(briefSchema),
    mode: "onTouched",
    defaultValues: {
      mode,
      lands: [],
      goal: "",
      timeline: "now",
      name: "",
      company: "",
      phone: "",
      email: "",
      channel: "whatsapp",
      notes: "",
      consent: false,
      website: "",
    },
  });

  const selectedLands = watch("lands");

  // Preselect a capability when arriving from a service page (?land=slug).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const land = params.get("land");
    if (land && lands.some((item) => item.slug === land)) {
      setValue("lands", [land]);
      if (mode === "brief") setStep(1);
    }
  }, [mode, setValue]);

  const onFirstInteraction = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("brief_form_start", { mode });
  };

  const next = async () => {
    const stepSchema =
      mode === "quick"
        ? null
        : step === 0
          ? stepSchemas.lands
          : step === 1
            ? stepSchemas.goal
            : step === 2
              ? stepSchemas.timeline
              : stepSchemas.contact;

    const messages: Record<string, string> = {
      lands_required: t("errors.lands"),
      goal_too_short: t("errors.goal"),
      timeline_required: t("errors.timeline"),
      name_required: t("errors.name"),
      invalid_phone: t("errors.phone"),
      consent_required: t("errors.consent"),
    };

    if (stepSchema) {
      const parsed = stepSchema.safeParse(getValues());
      if (!parsed.success) {
        const issue = parsed.error.issues[0]?.message ?? "generic";
        setStepIssue(messages[issue] ?? t("errors.generic"));
        track("brief_form_error", { mode, step });
        return;
      }
    }

    setStepIssue(null);
    track("brief_form_step", { mode, step: step + 1 });
    setStep((current) => Math.min(current + 1, total - 1));
  };

  const onSubmit = async (data: BriefData) => {
    setStatus("submitting");
    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, locale, campaign: campaignContext() }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setSubmitted(data);
      setStatus("success");
      track("brief_form_submit", { mode, lands: data.lands.length });
    } catch {
      setStatus("error");
      track("brief_form_error", { mode, step: "submit" });
    }
  };

  const whatsappHandoff = useMemo(() => {
    if (!submitted) return whatsappBase;
    const labels = {
      lands: Object.fromEntries(lands.map((land) => [land.slug, land.copy[locale].title])),
      timeline: {
        now: t("fields.timelineOptions.now"),
        quarter: t("fields.timelineOptions.quarter"),
        later: t("fields.timelineOptions.later"),
        unsure: t("fields.timelineOptions.unsure"),
      },
      channel: {
        whatsapp: t("fields.channelOptions.whatsapp"),
        call: t("fields.channelOptions.call"),
      },
      headings: {
        lands: t("fields.lands"),
        goal: t("fields.goal"),
        timeline: t("fields.timeline"),
        contact: t("fields.name"),
        notes: t("fields.notes"),
      },
    };
    const header = locale === "ar" ? "طلب مشروع — سفن لاند" : "Project request — Seven Lands";
    return withWhatsAppMessage(whatsappBase, `${header}\n${briefToPlainText(submitted, labels)}`);
  }, [locale, submitted, t, whatsappBase]);

  if (status === "success") {
    return (
      <div className={clsx("rounded-[1.25rem] border border-ink-950/12 bg-white p-7 md:p-9", className)}>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink-950 text-offwhite">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 10.5 8 14.5 16 5.5" />
          </svg>
        </span>
        <h2 className="display-3 mt-6">{t("success.title")}</h2>
        <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-[1.9] text-steel-600">
          {t("success.body")}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={whatsappHandoff}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp_click"
            data-analytics-location="form_success"
            className="inline-flex h-11 items-center gap-2.5 rounded-[12px] bg-ink-950 px-5 text-[0.9375rem] font-semibold text-offwhite transition-colors duration-200 hover:bg-navy-800"
          >
            <WhatsAppIcon />
            <span>{t("success.whatsapp")}</span>
          </a>
          <Button
            variant="secondary"
            onClick={() => {
              setStatus("idle");
              setStep(0);
              setSubmitted(null);
            }}
          >
            {t("success.again")}
          </Button>
        </div>
      </div>
    );
  }

  const currentStepNumber = mode === "brief" ? step + 1 : 1;
  const stepTitles = ["need", "goal", "timing", "contact"] as const;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onFocusCapture={onFirstInteraction}
      className={clsx("rounded-[1.25rem] border border-ink-950/12 bg-white p-6 md:p-8", className)}
      noValidate
    >
      {/* Progress */}
      <div className="mb-7">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">
            {total > 1 ? t("stepIndicator", { current: currentStepNumber, total }) : t("steps.contact.title")}
          </p>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: total }).map((_, index) => (
              <span
                key={index}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  index <= step ? "w-6 bg-ink-950" : "w-3 bg-ink-950/20",
                )}
              />
            ))}
          </div>
        </div>

        <h2 className="display-3 mt-5">
          {mode === "brief" ? t(`steps.${stepTitles[step]}.title`) : t("steps.goal.title")}
        </h2>
        <p className="mt-3 max-w-[54ch] text-[0.875rem] leading-[1.8] text-steel-600">
          {mode === "brief" ? t(`steps.${stepTitles[step]}.help`) : t("steps.goal.help")}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* STEP — capability */}
        {mode === "brief" && step === 0 ? (
          <fieldset>
            <legend className={labelClass}>{t("fields.lands")}</legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {lands.map((land) => {
                const isChecked = selectedLands.includes(land.slug);
                return (
                  <label
                    key={land.slug}
                    className={clsx(
                      "flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3 text-[0.9375rem] transition-colors duration-200",
                      isChecked
                        ? "border-ink-950 bg-ink-950/[0.04]"
                        : "border-ink-950/18 hover:border-ink-950/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      value={land.slug}
                      {...register("lands")}
                      className="h-4 w-4 accent-[var(--color-ink-950)]"
                    />
                    <span className="num text-[0.75rem] text-muted">{land.number}</span>
                    <span className="font-medium">{land.copy[locale].short}</span>
                  </label>
                );
              })}
            </div>
            {stepIssue ? (
              <p role="alert" className="mt-3 text-[0.8125rem] font-medium text-[#a2312a]">
                {stepIssue}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {/* STEP — goal */}
        {(step === 1 || mode === "quick") ? (
          <div>
            <label htmlFor="goal" className={labelClass}>
              {t("fields.goal")}
            </label>
            <textarea
              id="goal"
              rows={5}
              placeholder={t("fields.goalPlaceholder")}
              aria-invalid={Boolean(errors.goal)}
              aria-describedby={errors.goal ? "goal-error" : undefined}
              {...register("goal")}
              className={clsx(inputClass, "mt-3 resize-y")}
            />
            {stepIssue ? (
              <p id="goal-error" role="alert" className="mt-2 text-[0.8125rem] font-medium text-[#a2312a]">
                {stepIssue}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* STEP — timing */}
        {mode === "brief" && step === 2 ? (
          <fieldset>
            <legend className={labelClass}>{t("fields.timeline")}</legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(["now", "quarter", "later", "unsure"] as const).map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-ink-950/18 px-4 py-3 text-[0.9375rem] transition-colors duration-200 has-[:checked]:border-ink-950 has-[:checked]:bg-ink-950/[0.04]"
                >
                  <input
                    type="radio"
                    value={option}
                    {...register("timeline")}
                    className="h-4 w-4 accent-[var(--color-ink-950)]"
                  />
                  <span className="font-medium">{t(`fields.timelineOptions.${option}`)}</span>
                </label>
              ))}
            </div>
            {stepIssue && step === 2 ? (
              <p role="alert" className="mt-3 text-[0.8125rem] font-medium text-[#a2312a]">
                {stepIssue}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {/* STEP — contact */}
        {((mode === "brief" && step === 3) || mode === "quick") ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  {t("fields.name")}
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                  className={clsx(inputClass, "mt-3")}
                />
                {errors.name ? (
                  <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-[#a2312a]">
                    {t("errors.name")}
                  </p>
                ) : null}
                {stepIssue && step === 3 && !errors.name ? null : null}
              </div>

              <div>
                <label htmlFor="company" className={labelClass}>
                  {t("fields.company")}{" "}
                  <span className="font-normal text-muted">({t("fields.companyOptional")})</span>
                </label>
                <input id="company" autoComplete="organization" {...register("company")} className={clsx(inputClass, "mt-3")} />
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  {t("fields.phone")}
                </label>
                <input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0507776891"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby="phone-hint"
                  {...register("phone")}
                  className={clsx(inputClass, "num mt-3 text-start")}
                />
                <p id="phone-hint" className="mt-2 text-[0.75rem] text-muted">
                  {t("fields.phoneHint")}
                </p>
                {errors.phone ? (
                  <p role="alert" className="mt-1 text-[0.8125rem] font-medium text-[#a2312a]">
                    {t("errors.phone")}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  {t("fields.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                  className={clsx(inputClass, "num mt-3 text-start")}
                />
                {errors.email ? (
                  <p role="alert" className="mt-1 text-[0.8125rem] font-medium text-[#a2312a]">
                    {t("errors.email")}
                  </p>
                ) : null}
              </div>
            </div>

            <fieldset>
              <legend className={labelClass}>{t("fields.channel")}</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {(["whatsapp", "call"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-ink-950/18 px-4 py-3 text-[0.9375rem] transition-colors duration-200 has-[:checked]:border-ink-950 has-[:checked]:bg-ink-950/[0.04]"
                  >
                    <input type="radio" value={option} {...register("channel")} className="h-4 w-4 accent-[var(--color-ink-950)]" />
                    <span className="font-medium">{t(`fields.channelOptions.${option}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="notes" className={labelClass}>
                {t("fields.notes")}{" "}
                <span className="font-normal text-muted">({t("fields.companyOptional")})</span>
              </label>
              <textarea id="notes" rows={3} {...register("notes")} className={clsx(inputClass, "mt-3 resize-y")} />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-[0.875rem] leading-relaxed text-steel-600">
                <input type="checkbox" {...register("consent")} className="mt-1 h-4 w-4 accent-[var(--color-ink-950)]" />
                <span>
                  {t("fields.consent")}{" "}
                  <a href={`/${locale}/privacy`} className="underline underline-offset-4 hover:text-ink-950">
                    {tLegal("title")}
                  </a>
                </span>
              </label>
              {errors.consent ? (
                <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-[#a2312a]">
                  {t("errors.consent")}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      {/* Honeypot — visually hidden, never announced. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {/* Step-level message for the contact step, where fields use the resolver. */}
      {stepIssue && step === 3 && mode === "brief" ? (
        <p role="alert" className="mt-6 text-[0.8125rem] font-medium text-[#a2312a]">
          {stepIssue}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink-950/10 pt-6">
        {step > 0 ? (
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              setStepIssue(null);
              setStep((current) => Math.max(0, current - 1));
            }}
          >
            {t("buttons.back")}
          </Button>
        ) : null}

        {step < total - 1 ? (
          <Button type="button" onClick={next} size="lg">
            <span>{t("buttons.next")}</span>
            <ArrowRight />
          </Button>
        ) : (
          <Button type="submit" size="lg" disabled={status === "submitting"}>
            <span>{status === "submitting" ? t("buttons.submitting") : t("buttons.submit")}</span>
            {status === "submitting" ? null : <ArrowRight />}
          </Button>
        )}

        <span className="text-[0.75rem] text-muted">{phoneDisplay}</span>
      </div>

      {status === "error" ? (
        <p role="alert" className="mt-4 rounded-[12px] border border-[#a2312a]/30 bg-[#a2312a]/[0.06] px-4 py-3 text-[0.875rem] text-[#7d1f19]">
          {t("errors.generic")}{" "}
          <a href={whatsappBase} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            {t("fields.channelOptions.whatsapp")}
          </a>
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {status === "submitting" ? t("buttons.submitting") : ""}
      </p>
      <p className="sr-only">{getValues("mode")}</p>
    </form>
  );
}
