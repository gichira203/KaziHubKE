import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  /**
   * Height of the logo in pixels. Width follows the source aspect ratio
   * (2172 x 724 ≈ 3:1), so this scales the whole wordmark.
   */
  height?: number;
  /** Link target — defaults to the top of the page. */
  href?: string;
  /** Extra classes for the wrapper (e.g. sizing on small screens). */
  className?: string;
};

/**
 * Brand mark. The supplied logo is a wide wordmark that already contains the
 * "KaziHub KE" text, so no separate text label is rendered beside it.
 */
export default function Logo({ height = 36, href = "#home", className = "" }: LogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center no-underline ${className}`.trim()}
      aria-label="KaziHub KE — home"
    >
      <Image
        src="/images/logo.png"
        alt="KaziHub KE logo"
        width={2172}
        height={724}
        priority
        className="h-auto w-auto object-contain"
        style={{ height: `${height}px` }}
      />
    </Link>
  );
}
