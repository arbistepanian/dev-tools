"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: React.ReactNode;
}

const shellHeaderClass =
  "flex h-14 shrink-0 items-center border-b border-border bg-surface-container";

export function AppShell({ children }: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="min-h-screen bg-surface-page">
      <aside
        className="group/sidebar fixed inset-y-0 left-0 z-30 hidden w-18 flex-col overflow-hidden border-r border-border bg-surface-container shadow-card transition-[width] duration-300 ease-out hover:w-72 hover:shadow-xl lg:flex"
      >
        <div className={`${shellHeaderClass} px-2 group-hover/sidebar:px-4`}>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 overflow-hidden group-hover/sidebar:justify-start"
          >
            <AppLogo size={20} />
            <span className="truncate text-lg font-semibold whitespace-nowrap text-copy-default opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
              Dev Tools
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 group-hover/sidebar:p-4">
          <SidebarNav variant="rail" />
        </div>
      </aside>

      {isDrawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          aria-label="Close navigation"
          onClick={closeDrawer}
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface-container shadow-xl transition-transform duration-300 ease-out lg:hidden",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className={`${shellHeaderClass} justify-between px-4`}>
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-copy-default"
            onClick={closeDrawer}
          >
            <AppLogo size={20} />
            Dev Tools
          </Link>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            aria-label="Close menu"
            onClick={closeDrawer}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav onNavigate={closeDrawer} variant="drawer" />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-18">
        <header
          className={`${shellHeaderClass} sticky top-0 z-20 gap-3 bg-surface-container/80 px-4 backdrop-blur-md`}
        >
          <Button
            variant="ghost"
            size="sm"
            icon={Menu}
            className="lg:hidden"
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
          />
          <span className="flex-1 text-sm font-semibold text-copy-default">Dev Tools</span>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
