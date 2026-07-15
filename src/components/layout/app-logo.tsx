import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 20, className }: AppLogoProps) {
  const glyphSize = Math.round(size * 0.72);

  return (
    <span
      className={cn("inline-flex shrink-0 items-center text-primary", className)}
      aria-hidden
    >
      <ChevronLeft size={glyphSize} strokeWidth={2.5} />
      <span
        className="font-mono font-semibold leading-none"
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        /
      </span>
      <ChevronRight size={glyphSize} strokeWidth={2.5} />
    </span>
  );
}
