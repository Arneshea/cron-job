import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-signal-amber text-ink-950 hover:bg-[#ffc576] active:bg-[#e6a24b] disabled:bg-ink-600 disabled:text-fog-500",
  secondary:
    "bg-ink-800 text-fog-100 border border-ink-600 hover:bg-ink-700 disabled:opacity-50",
  ghost:
    "bg-transparent text-fog-300 hover:bg-ink-800 hover:text-fog-100 disabled:opacity-50",
  danger:
    "bg-transparent text-signal-coral border border-signal-coral/40 hover:bg-signal-coral/10 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
};

const base =
  "inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed cursor-pointer select-none";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
