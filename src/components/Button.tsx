import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  external,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]";

  const styles =
    variant === "primary"
      ? "border-[color:var(--box)] bg-[color:var(--box)] text-white hover:translate-y-[-1px]"
      : "border-[color:var(--box)] bg-transparent text-[color:var(--fg)] hover:bg-black/5 hover:translate-y-[-1px]";

  const cls = `${base} ${styles} ${className}`;

  if (external) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  if (href.startsWith("mailto:")) {
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }

  return (
    <Link className={cls} href={href}>
      {children}
    </Link>
  );
}
