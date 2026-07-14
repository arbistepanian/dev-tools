"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { tools } from "@/lib/tools/registry";
import { cn } from "@/lib/utils/cn";

interface SidebarNavProps {
  onNavigate?: () => void;
  variant?: "drawer" | "rail";
}

export function SidebarNav({ onNavigate, variant = "drawer" }: SidebarNavProps) {
  const pathname = usePathname();
  const isRail = variant === "rail";

  const linkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-2 rounded-[var(--radius-button)] py-2 text-sm transition",
      isRail
        ? "justify-center px-2 group-hover/sidebar:justify-start group-hover/sidebar:px-3"
        : "px-3",
      isActive
        ? "bg-primary-subtle text-primary font-medium"
        : "text-copy-muted hover:bg-surface-alternate hover:text-copy-default",
    );

  const labelClass = cn(
    "whitespace-nowrap transition-all duration-300",
    isRail &&
      "max-w-0 overflow-hidden opacity-0 group-hover/sidebar:max-w-48 group-hover/sidebar:opacity-100",
  );

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="Dashboard"
        title={isRail ? "Dashboard" : undefined}
        className={linkClass(pathname === "/")}
      >
        <Wrench size={16} className="shrink-0" aria-hidden />
        <span className={labelClass}>Dashboard</span>
      </Link>

      <p
        className={cn(
          "mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-copy-subtle transition-all duration-300",
          isRail
            ? "mt-2 max-h-0 overflow-hidden opacity-0 group-hover/sidebar:mt-4 group-hover/sidebar:max-h-6 group-hover/sidebar:opacity-100"
            : "mt-4",
        )}
      >
        Tools
      </p>

      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = pathname === tool.href;

        return (
          <Link
            key={tool.slug}
            href={tool.href}
            onClick={onNavigate}
            aria-label={tool.title}
            title={isRail ? tool.title : undefined}
            className={linkClass(isActive)}
          >
            <Icon size={16} className="shrink-0" aria-hidden />
            <span className={labelClass}>{tool.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
