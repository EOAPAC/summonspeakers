import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Page, Eyebrow } from "@/components/Page";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ButtonLink } from "@/components/Button";
import { ClosingCta } from "@/components/ClosingCta";
import { getPost, relatedPosts, type Post } from "@/data/editorial";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }): { post: Post } => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article unavailable | SummonSpeakers" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.post;
    return {
      meta: [
        { title: `${p.title} | SummonSpeakers` },
        { name: "description", content: p.dek },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.dek },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "/" },
              { name: "Journal", item: "/blog" },
              { name: p.title, item: `/blog/${p.slug}` },
            ]),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.title,
            description: p.dek,
            datePublished: p.iso,
            articleSection: p.category,
            author: { "@type": "Organization", name: "SummonSpeakers" },
            publisher: { "@type": "Organization", name: "SummonSpeakers" },
            mainEntityOfPage: `/blog/${p.slug}`,
          }),
        },
      ],
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  const related = relatedPosts(post.slug);

  return (
    <Page>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Journal", to: "/blog" },
          { label: post.category },
        ]}
      />

      <article>
        <header className="container-x pb-12 pt-10">
          <Eyebrow>{post.category}</Eyebrow>
          <h1 className="display mt-6 max-w-[18ch] text-[length:var(--display-md)]">{post.title}</h1>
          <p className="mt-8 max-w-[52ch] text-lg text-[var(--ink-2)]">{post.dek}</p>
          <p className="label-mono mt-10 border-t border-[var(--line)] pt-6 text-[var(--ink-3)]">
            By the SummonSpeakers team · {post.date} · {post.read_minutes} min read
          </p>
        </header>

        <div className="container-x pb-16">
          <div className="max-w-[68ch]">
            {post.body.map((block, i) => {
              if (block.kind === "h2") {
                return (
                  <h2 key={i} className="mt-14 text-2xl font-semibold tracking-[-0.03em] first:mt-0">
                    {block.text}
                  </h2>
                );
              }
              if (block.kind === "quote") {
                return (
                  <blockquote key={i} className="my-12 max-w-[26ch] border-y border-[var(--ink)] py-8 text-[length:var(--display-sm)] tracking-[-0.02em]">
                    {block.text}
                  </blockquote>
                );
              }
              if (block.kind === "list") {
                return (
                  <ul key={i} className="mt-6 grid gap-3">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-4 text-[var(--ink-2)]">
                        <span aria-hidden="true" className="text-ink">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="mt-6 text-lg leading-relaxed text-[var(--ink-2)]">
                  {block.text}
                </p>
              );
            })}
          </div>

          <aside className="mt-16 flex max-w-[68ch] flex-wrap items-center justify-between gap-6 rounded-[var(--radius-card)] border border-[var(--ink)] p-8">
            <div>
              <Eyebrow>Skip the guesswork</Eyebrow>
              <p className="mt-3 text-xl font-semibold tracking-[-0.03em]">
                Get real fees for your actual event.
              </p>
            </div>
            <ButtonLink to="/get-matched">Get matched</ButtonLink>
          </aside>
        </div>
      </article>

      <section className="container-x pb-24">
        <div className="rule-open pt-10">
          <h2 className="display text-[var(--display-md)]">Keep reading</h2>
          <ul className="mt-10 border-t border-[var(--line)]">
            {related.map((r) => (
              <li key={r.slug} className="border-b border-[var(--line)]">
                <Link
                  to="/blog/$slug"
                  params={{ slug: r.slug }}
                  className="group grid gap-3 py-8 transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface md:grid-cols-[1fr_1.2fr_auto] md:items-baseline md:gap-12 md:px-4"
                >
                  <h3 className="text-xl font-semibold tracking-[-0.03em]">{r.title}</h3>
                  <p className="text-[var(--ink-2)] group-hover:text-[rgba(255,255,255,0.72)]">{r.dek}</p>
                  <span className="label-mono whitespace-nowrap text-[var(--ink-3)] group-hover:text-[rgba(255,255,255,0.72)]">
                    {r.read_minutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ClosingCta />
    </Page>
  );
}
