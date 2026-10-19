/**
 * SectionHeading — eyebrow label + title + optional description,
 * centred or left-aligned. Used by every home section for consistent typography.
 */
import { cx } from "@/lib/cx";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
}: SectionHeadingProps) {
  return (
    <div className={cx(align === "center" ? "text-center mx-auto" : "text-left")}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark">
          {eyebrow}
        </p>
      )}
      <h2
        className={cx(
          "mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cx(
            "mt-4 text-base leading-relaxed",
            align === "center" && "max-w-2xl mx-auto",
            tone === "light" ? "text-[#E0E3E7]" : "text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
