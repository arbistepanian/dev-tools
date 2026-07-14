"use client";

import { useState } from "react";
import { Menu, X, Wrench } from "lucide-react";
import Link from "next/link";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-page">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface-container p-6 md:block">
          <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold text-copy-default">
            <Wrench size={20} className="text-primary" aria-hidden />
            Ikon Dev Tools
          </Link>
          <SidebarNav />
        </aside>

        {isSidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close navigation"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="relative z-50 h-full w-72 border-r border-border bg-surface-container p-6 shadow-card">
              <div className="mb-6 flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold text-copy-default"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Wrench size={20} className="text-primary" aria-hidden />
                  Ikon Dev Tools
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  aria-label="Close menu"
                  onClick={() => setIsSidebarOpen(false)}
                />
              </div>
              <SidebarNav />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border bg-surface-container px-4 py-3 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              icon={Menu}
              aria-label="Open menu"
              onClick={() => setIsSidebarOpen(true)}
            />
            <span className="text-sm font-semibold text-copy-default">Ikon Dev Tools</span>
          </div>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
