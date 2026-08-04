import { portraitAlt, portraitFor } from "@/data/speaker-portraits";

/**
 * A speaker's portrait, or the hatch placeholder when there isn't one.
 *
 * The choice is made from the generated manifest rather than by letting a
 * missing file 404, so server-rendered HTML is already correct and there is no
 * broken-image flash. Both the card and the profile page render through here, so
 * the two cannot drift.
 */
export function Portrait({
  slug,
  name,
  className = "",
  imageClassName = "",
  /** Shown over the hatch when there is no portrait. */
  fallbackLabel,
  sizes,
}: {
  slug: string;
  name: string;
  className?: string;
  imageClassName?: string;
  fallbackLabel?: string | undefined;
  sizes?: string | undefined;
}) {
  const src = portraitFor(slug);

  if (!src) {
    return (
      <div className={`hatch ${className}`}>
        {fallbackLabel && (
          <span className="label-mono block p-6 text-[var(--ink-2)]">{fallbackLabel}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={portraitAlt(name)}
      width={1024}
      height={1280}
      loading="lazy"
      decoding="async"
      {...(sizes ? { sizes } : {})}
      className={`${className} ${imageClassName} bg-[var(--surface-alt)] object-cover`}
    />
  );
}
