import Link from "next/link";
import type { ToolDefinition } from "@/lib/tools/registry";

interface ToolCardProps {
  tool: ToolDefinition;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link
      href={tool.href}
      className="group rounded-[var(--radius-card)] border border-border bg-surface-container p-5 shadow-card transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-[var(--radius-button)] bg-primary-subtle text-primary">
          <Icon size={18} aria-hidden />
        </span>
        <h2 className="text-base font-semibold text-copy-default group-hover:text-primary">
          {tool.title}
        </h2>
      </div>
      <p className="text-sm text-copy-muted">{tool.description}</p>
    </Link>
  );
}
