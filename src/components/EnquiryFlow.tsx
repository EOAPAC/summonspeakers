import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button, ButtonLink } from "./Button";
import { speakers, topics } from "@/data/speakers";
import { submitEnquiry } from "@/lib/enquiries.functions";

type Values = {
  event_date: string;
  audience_size: string;
  topic_or_speaker: string;
  full_name: string;
  work_email: string;
  budget_range: string;
  city: string;
  notes: string;
};

const empty: Values = {
  event_date: "",
  audience_size: "",
  topic_or_speaker: "",
  full_name: "",
  work_email: "",
  budget_range: "",
  city: "",
  notes: "",
};

const audienceSizes = ["Under 100", "100 – 300", "300 – 800", "800 – 2,000", "2,000+"];
const budgets = ["Under $10k", "$10k – $20k", "$20k – $35k", "$35k+", "Not sure yet"];

const fieldBase =
  "min-h-[56px] w-full rounded-[var(--radius-sm)] border border-[var(--line-2)] bg-surface px-4 text-base";

function Field({
  id,
  label,
  error,
  children,
  optional,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-mono mb-3 block text-[var(--ink-3)]">
        {label}
        {optional ? " (optional)" : ""}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-[var(--color-warning)]">
          Error: {error}
        </p>
      )}
    </div>
  );
}

export function EnquiryFlow({ speakerSlug }: { speakerSlug?: string }) {
  const preset = speakerSlug ? speakers.find((s) => s.slug === speakerSlug) : undefined;
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Values>({
    ...empty,
    topic_or_speaker: preset ? preset.name : "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  function validateStep(n: number) {
    const next: Partial<Record<keyof Values, string>> = {};
    if (n === 1) {
      if (!values.event_date) next.event_date = "Add the date of your event.";
      if (!values.audience_size) next.audience_size = "Choose an audience size.";
      if (!values.topic_or_speaker) next.topic_or_speaker = "Choose a topic or a speaker.";
    }
    if (n === 2) {
      if (!values.full_name.trim()) next.full_name = "Add your full name.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.work_email))
        next.full_name === undefined;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.work_email))
        next.work_email = "Add a valid work email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitEnquiry({
        data: {
          ...values,
          audience_size: values.audience_size,
          speaker_slug: preset?.slug ?? null,
        },
      });
      setDone(true);
    } catch {
      setSubmitError("We couldn't send that. Try again, or email hello@summonspeakers.com.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-[62ch]">
        <p className="label-mono text-[var(--ink-3)]">Enquiry received</p>
        <h1 className="display mt-6 text-[length:var(--display-lg)]">Thank you</h1>
        <p className="mt-8 text-lg text-[var(--ink-2)]">
          We'll send a shortlist of matched speakers to your inbox within one business day. Fees
          are included, so you can compare before you reply.
        </p>
        <div className="mt-10">
          <Link
            to="/speakers"
            className="inline-flex min-h-[56px] items-center gap-2 rounded-full border border-[var(--line-2)] px-6 text-base transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface"
          >
            Keep browsing speakers <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[64ch]">
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            aria-hidden="true"
            className={`h-[2px] flex-1 ${n <= step ? "bg-ink" : "bg-[var(--line)]"}`}
          />
        ))}
      </div>
      <p className="label-mono mt-4 text-[var(--ink-3)]">
        STEP {step} OF 3 · ABOUT TWO MINUTES
      </p>

      {step > 1 && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="mt-8 inline-flex min-h-[44px] items-center gap-2 text-sm underline underline-offset-4"
        >
          <span aria-hidden="true">←</span> Back
        </button>
      )}

      <h1 className="display mt-6 text-[length:var(--display-md)]">
        {step === 1 ? "Get matched" : step === 2 ? "Where do we send it?" : "Anything else?"}
      </h1>

      {step === 1 && (
        <div className="mt-10 space-y-8">
          <p className="text-[var(--ink-2)]">Free to enquire, no obligation.</p>
          <Field id="event_date" label="Event date" error={errors.event_date}>
            <input
              id="event_date"
              type="date"
              className={fieldBase}
              value={values.event_date}
              onChange={set("event_date")}
              aria-invalid={!!errors.event_date}
              aria-describedby={errors.event_date ? "event_date-error" : undefined}
            />
          </Field>
          <Field id="audience_size" label="Audience size" error={errors.audience_size}>
            <select
              id="audience_size"
              className={fieldBase}
              value={values.audience_size}
              onChange={set("audience_size")}
              aria-invalid={!!errors.audience_size}
              aria-describedby={errors.audience_size ? "audience_size-error" : undefined}
            >
              <option value="">Choose a size</option>
              {audienceSizes.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field id="topic_or_speaker" label="Topic or speaker" error={errors.topic_or_speaker}>
            <select
              id="topic_or_speaker"
              className={fieldBase}
              value={values.topic_or_speaker}
              onChange={set("topic_or_speaker")}
              aria-invalid={!!errors.topic_or_speaker}
              aria-describedby={errors.topic_or_speaker ? "topic_or_speaker-error" : undefined}
            >
              <option value="">Choose a topic or a speaker</option>
              <optgroup label="Topics">
                {topics.map((t) => (
                  <option key={t.slug}>{t.name}</option>
                ))}
              </optgroup>
              <optgroup label="Speakers">
                {speakers.map((s) => (
                  <option key={s.slug}>{s.name}</option>
                ))}
              </optgroup>
            </select>
          </Field>
          <Button onClick={() => validateStep(1) && setStep(2)}>Continue</Button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-10 space-y-8">
          <Field id="full_name" label="Full name" error={errors.full_name}>
            <input
              id="full_name"
              className={fieldBase}
              value={values.full_name}
              onChange={set("full_name")}
              autoComplete="name"
              aria-invalid={!!errors.full_name}
              aria-describedby={errors.full_name ? "full_name-error" : undefined}
            />
          </Field>
          <Field id="work_email" label="Work email" error={errors.work_email}>
            <input
              id="work_email"
              type="email"
              className={fieldBase}
              value={values.work_email}
              onChange={set("work_email")}
              autoComplete="email"
              aria-invalid={!!errors.work_email}
              aria-describedby={errors.work_email ? "work_email-error" : undefined}
            />
          </Field>
          <Button onClick={() => validateStep(2) && setStep(3)}>Continue</Button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-10 space-y-8">
          <p className="text-[var(--ink-2)]">
            All optional. Skip straight to sending if you'd rather.
          </p>
          <Field id="budget_range" label="Budget range" optional>
            <select
              id="budget_range"
              className={fieldBase}
              value={values.budget_range}
              onChange={set("budget_range")}
            >
              <option value="">Choose a range</option>
              {budgets.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field id="city" label="City" optional>
            <input id="city" className={fieldBase} value={values.city} onChange={set("city")} />
          </Field>
          <Field id="notes" label="Notes" optional>
            <textarea
              id="notes"
              rows={4}
              className={`${fieldBase} py-3`}
              value={values.notes}
              onChange={set("notes")}
            />
          </Field>
          {submitError && (
            <p role="alert" className="text-sm text-[var(--color-warning)]">
              Error: {submitError}
            </p>
          )}
          <Button onClick={handleSubmit} loading={submitting}>
            Send enquiry
          </Button>
        </div>
      )}

      <p className="hairline-top mt-16 pt-8 text-sm text-[var(--ink-2)]">
        No account needed. See{" "}
        <ButtonLink to="/how-it-works" variant="secondary" className="text-sm">
          how it works
        </ButtonLink>
      </p>
    </div>
  );
}
