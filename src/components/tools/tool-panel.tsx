import type { ReactNode } from "react";

interface ToolPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ToolPanel({ title, description, children }: ToolPanelProps) {
  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-surface-container p-6 shadow-card">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold text-copy-default">{title}</h2>
        {description ? <p className="text-sm text-copy-muted">{description}</p> : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
