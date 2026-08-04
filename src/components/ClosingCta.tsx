import { ButtonLink } from "./Button";

export function ClosingCta({
  heading = "Get matched",
  sub = "Tell us about your event and we'll send a shortlist within one business day.",
}: {
  heading?: string;
  sub?: string;
}) {
  return (
    <section className="rule-open container-x section-y">
      <h2 className="display text-[length:var(--display-cta)] leading-[var(--leading-cta)]">
        {heading}
      </h2>
      <div className="mt-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[42ch] text-lg text-[var(--ink-2)]">{sub}</p>
        <ButtonLink to="/get-matched">Get matched</ButtonLink>
      </div>
    </section>
  );
}
