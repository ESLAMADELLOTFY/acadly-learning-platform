import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  dot?: boolean;
};

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-hover text-label",
  success: "bg-[#e7f4eb] text-[#267348]",
  warning: "bg-[#fff3dc] text-[#956118]",
  danger: "bg-[#fdecec] text-[#a83636]",
  info: "bg-[#e9f2f8] text-[#2e688d]",
};

const dotTones: Record<BadgeTone, string> = {
  neutral: "bg-muted",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-error",
  info: "bg-info",
};

export function Badge({
  tone = "neutral",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${dotTones[tone]}`}
        />
      )}
      {children}
    </span>
  );
}
