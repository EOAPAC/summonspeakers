import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { topicSlugFor } from "@/data/speakers";

const shape =
  "label-mono inline-flex min-h-[44px] items-center rounded-full border border-[var(--line-2)] px-4";

export function Pill({ topic, className }: { topic: string; className?: string }) {
  const slug = topicSlugFor(topic);

  // A topic we publish no page for stays visible as a label rather than
  // linking somewhere that 404s.
  if (!slug) {
    return <span className={cn(shape, "text-[var(--ink-2)]", className)}>{topic}</span>;
  }

  return (
    <Link
      to="/topics/$slug"
      params={{ slug }}
      className={cn(
        shape,
        "transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface",
        className,
      )}
    >
      {topic}
    </Link>
  );
}
