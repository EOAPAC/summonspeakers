import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="label-mono text-[var(--ink-3)]">{children}</p>;
}

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="rule-open pt-10">
      <h2 className="display text-[var(--display-md)]">Questions</h2>
      <dl className="mt-10 divide-y divide-[var(--line)] border-t border-[var(--line)]">
        {items.map((item) => (
          <div key={item.q} className="grid gap-3 py-8 md:grid-cols-[1fr_1.4fr] md:gap-12">
            <dt className="text-lg font-semibold tracking-[-0.02em]">{item.q}</dt>
            <dd className="text-[var(--ink-2)]">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
