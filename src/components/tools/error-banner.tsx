import { AlertTriangle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-input)] border border-danger/30 bg-danger-subtle px-4 py-3 text-sm text-danger">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
