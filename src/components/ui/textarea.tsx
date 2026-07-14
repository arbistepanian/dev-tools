import type React from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  monospace?: boolean;
}

export function Textarea({ className, hasError, monospace, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-[var(--radius-input)] border bg-surface-container px-3 py-2.5 text-sm text-copy-default outline-none transition resize-y min-h-[80px]",
        "placeholder:text-copy-muted",
        "focus:border-primary focus:ring-2 focus:ring-primary-subtle",
        "disabled:cursor-not-allowed disabled:opacity-50",
        monospace && "font-mono text-xs",
        hasError ? "border-danger focus:border-danger focus:ring-danger-subtle" : "border-border",
        className,
      )}
    />
  );
}
