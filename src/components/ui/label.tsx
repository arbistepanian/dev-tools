import type React from "react";
import { cn } from "@/lib/utils/cn";

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn("text-sm font-medium text-copy-default", className)}
    >
      {children}
    </label>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, helperText, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {helperText ? <p className="text-xs text-copy-muted">{helperText}</p> : null}
    </div>
  );
}
