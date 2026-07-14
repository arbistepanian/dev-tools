import type React from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({ className, hasError, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-[var(--radius-input)] border bg-surface-container px-3 py-2.5 text-sm text-copy-default outline-none transition",
        "placeholder:text-copy-muted",
        "focus:border-primary focus:ring-2 focus:ring-primary-subtle",
        "disabled:cursor-not-allowed disabled:opacity-50",
        hasError ? "border-danger focus:border-danger focus:ring-danger-subtle" : "border-border",
        className,
      )}
    />
  );
}
