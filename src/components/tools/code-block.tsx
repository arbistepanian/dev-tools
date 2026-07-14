"use client";

import { useMemo } from "react";
import { highlightCode } from "@/lib/tools/syntax-highlight";
import { cn } from "@/lib/utils/cn";

interface CodeBlockProps {
  code: string;
  language: "json" | "xml";
  placeholder?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  placeholder = "Output appears here",
  className,
}: CodeBlockProps) {
  const highlighted = useMemo(
    () => (code ? highlightCode(code, language) : ""),
    [code, language],
  );

  return (
    <div
      className={cn(
        "w-full overflow-auto rounded-[var(--radius-input)] border border-border bg-surface-container px-3 py-2.5",
        className,
      )}
    >
      {code ? (
        <pre className="syntax-block m-0">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      ) : (
        <p className="text-sm text-copy-muted">{placeholder}</p>
      )}
    </div>
  );
}
