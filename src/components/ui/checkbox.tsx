import type React from "react";
import { cn } from "@/lib/utils/cn";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;

  return (
    <label
      htmlFor={inputId}
      className={cn("inline-flex items-center gap-2 cursor-pointer select-none", className)}
    >
      <input
        type="checkbox"
        id={inputId}
        {...props}
        className="size-4 rounded border-border text-primary focus:ring-2 focus:ring-primary-subtle"
      />
      <span className="text-sm text-copy-default">{label}</span>
    </label>
  );
}
