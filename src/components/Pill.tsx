import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Pill({
  topic,
  className,
}: {
  topic: string;
  className?: string;
}) {
  const slug = topic
    .toLowerCase()
    .replace(/&/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return (
    <Link
      to="/topics/$slug"
      params={{ slug }}
      className={cn(
        "label-mono inline-flex min-h-[44px] items-center rounded-full border border-[var(--line-2)] px-4 transition-colors duration-500 [transition-timing-function:var(--ease)] hover:bg-ink hover:text-surface",
        className,
      )}
    >
      {topic}
    </Link>
  );
}
