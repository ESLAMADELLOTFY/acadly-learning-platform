import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-light disabled:bg-primary/60",
  secondary:
    "border border-border bg-white text-foreground hover:bg-surface-hover disabled:text-muted",
  ghost: "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
  danger: "bg-error text-white shadow-sm hover:bg-error/90 disabled:bg-error/60",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 gap-2 rounded-lg px-3 text-sm",
  md: "min-h-10 gap-2 rounded-lg px-4 text-sm",
  lg: "min-h-12 gap-2.5 rounded-xl px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
