import { CopyButton } from "@/components/tools/copy-button";
import { Label } from "@/components/ui/label";

interface ResultFieldProps {
  label: string;
  value: string;
  helperText?: string;
  monospace?: boolean;
}

export function ResultField({ label, value, helperText, monospace = true }: ResultFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <CopyButton value={value} />
      </div>
      <div
        className={`rounded-[var(--radius-input)] border border-border bg-surface-alternate px-3 py-2.5 text-sm text-copy-default break-all ${monospace ? "font-mono text-xs" : ""}`}
      >
        {value || "—"}
      </div>
      {helperText ? <p className="text-xs text-copy-muted">{helperText}</p> : null}
    </div>
  );
}
