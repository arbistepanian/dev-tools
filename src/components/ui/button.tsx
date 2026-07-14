import type React from "react";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconClassName?: string;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "border border-border bg-surface-container text-copy-default hover:bg-surface-alternate",
  ghost: "bg-transparent text-copy-default hover:bg-surface-alternate",
};

const sizeClasses: Record<ButtonSize, { button: string; icon: number }> = {
  sm: { button: "px-3 py-1.5 text-xs", icon: 13 },
  md: { button: "px-5 py-2.5 text-sm", icon: 15 },
};

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconClassName,
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const { button, icon: iconSize } = sizeClasses[size];

  const iconSlot = (() => {
    if (isLoading) {
      return <Loader2 size={iconSize} className="shrink-0 animate-spin" aria-hidden />;
    }
    if (Icon) {
      return <Icon size={iconSize} className={cn("shrink-0", iconClassName)} aria-hidden />;
    }
    return null;
  })();

  return (
    <button
      type="button"
      disabled={disabled ?? isLoading}
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-button)] font-semibold transition cursor-pointer",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        button,
        className,
      )}
    >
      {iconSlot}
      {children}
    </button>
  );
}
