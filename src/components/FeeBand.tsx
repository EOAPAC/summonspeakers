import { cn } from "@/lib/utils";
import { formatFee } from "@/lib/fee";

export function FeeBand({
  feeMin,
  feeMax,
  onApplication = false,
  available,
  invert = false,
  large = false,
  className,
}: {
  feeMin: number;
  feeMax: number;
  onApplication?: boolean;
  available?: boolean;
  invert?: boolean;
  large?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-2 rounded-full border px-3 py-2",
        invert ? "border-[var(--line-on-dark)] text-surface" : "border-[var(--line-2)] text-ink",
        large && "px-5 py-3 text-sm",
        className,
      )}
    >
      {available !== undefined && (
        <span
          aria-hidden="true"
          className={cn(
            "size-[7px] rounded-full",
            available ? "bg-ink" : "bg-[var(--ink-3)]",
            invert && (available ? "bg-surface" : "bg-[var(--ink-3)]"),
          )}
        />
      )}
      {available !== undefined && (
        <span className="sr-only">{available ? "Available" : "Limited availability"}. </span>
      )}
      {formatFee(feeMin, feeMax, onApplication)}
    </span>
  );
}
