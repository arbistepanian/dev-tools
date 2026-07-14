"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

type ThemeChoice = "light" | "dark" | "system";

const THEME_CYCLE: ThemeChoice[] = ["light", "dark", "system"];

const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const LABELS = {
  light: "Light",
  dark: "Dark",
  system: "System",
} as const;

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <Button variant="secondary" size="sm" disabled aria-label="Theme">
        Theme
      </Button>
    );
  }

  const current = (theme ?? "system") as ThemeChoice;
  const Icon = ICONS[current];

  function handleToggle() {
    const index = THEME_CYCLE.indexOf(current);
    const next = THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
    setTheme(next);
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      icon={Icon}
      onClick={handleToggle}
      aria-label={`Theme: ${LABELS[current]} (resolved ${resolvedTheme})`}
      title={`Theme: ${LABELS[current]}`}
    >
      {LABELS[current]}
    </Button>
  );
}
