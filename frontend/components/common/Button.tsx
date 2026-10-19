/**
 * Button — renders an <a> (default, for placeholder routes) or a <button>.
 * Variants: primary (green fill), outline (white with border), ghost (light).
 * `onClick` is supported on both so interactive menus can close themselves.
 */
import Link from "next/link";

type Variant = "primary" | "outline" | "ghost" | "onGreen";
type Size = "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand disabled:bg-disabled disabled:text-muted disabled:pointer-events-none disabled:shadow-none disabled:transform-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-sm hover:bg-brand-dark hover:shadow-md hover:-translate-y-0.5",
  outline:
    "bg-white text-ink border border-line hover:border-brand hover:text-brand-dark hover:bg-surface",
  ghost:
    "bg-surface text-ink border border-transparent hover:bg-white hover:border-line",
  // For use on the green hero field.
  onGreen:
    "bg-white text-brand-dark border border-transparent shadow-sm hover:bg-[#E8F5EC] hover:shadow-md hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
