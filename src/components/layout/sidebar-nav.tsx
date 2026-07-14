"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { tools } from "@/lib/tools/registry";
import { cn } from "@/lib/utils/cn";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/"
        className={cn(
          "flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium transition",
          pathname === "/"
            ? "bg-primary-subtle text-primary"
            : "text-copy-muted hover:bg-surface-alternate hover:text-copy-default",
        )}
      >
        <Wrench size={16} aria-hidden />
        Dashboard
      </Link>

      <p className="mt-4 mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-copy-subtle">
        Tools
      </p>

      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = pathname === tool.href;

        return (
          <Link
            key={tool.slug}
            href={tool.href}
            className={cn(
              "flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm transition",
              isActive
                ? "bg-primary-subtle text-primary font-medium"
                : "text-copy-muted hover:bg-surface-alternate hover:text-copy-default",
            )}
          >
            <Icon size={16} aria-hidden />
            {tool.title}
          </Link>
        );
      })}
    </nav>
  );
}
