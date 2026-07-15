import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils/cn";

interface ToolPageProps {
  title: string;
  description?: string;
  children: ReactNode;
  contentClassName?: string;
}

export function ToolPage({
  title,
  description,
  children,
  contentClassName,
}: ToolPageProps) {
  return (
    <div className="space-y-8">
      <Header title={title} description={description} />
      <div className={cn("max-w-3xl", contentClassName)}>{children}</div>
    </div>
  );
}
