"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import type { DiffChange, StringComparison } from "@/lib/tools/string-diff";
import { cn } from "@/lib/utils/cn";

interface StringDiffViewProps {
  comparison: StringComparison;
  view: "split" | "inline";
  stringA: string;
  stringB: string;
}

export function StringDiffView({ comparison, view, stringA, stringB }: StringDiffViewProps) {
  if (!stringA && !stringB) {
    return (
      <div className="rounded-[var(--radius-input)] border border-dashed border-border px-4 py-10 text-center text-sm text-copy-muted">
        Differences appear here.
      </div>
    );
  }

  if (view === "inline") {
    return (
      <DiffSurface label="Inline difference">
        <InlineDiff changes={comparison.changes} />
      </DiffSurface>
    );
  }

  return <SplitDiff comparison={comparison} />;
}

function SplitDiff({ comparison }: { comparison: StringComparison }) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  function syncScroll(source: HTMLDivElement, target: HTMLDivElement | null) {
    if (!target || syncing.current) {
      return;
    }

    syncing.current = true;
    target.scrollTop = source.scrollTop;
    target.scrollLeft = source.scrollLeft;
    syncing.current = false;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DiffSurface
        label="String A with removals highlighted"
        title="String A"
        caption="Removed"
        captionClassName="bg-danger-subtle text-danger"
        scrollRef={leftRef}
        onScroll={(element) => syncScroll(element, rightRef.current)}
      >
        <HighlightedText changes={comparison.changes} side="a" />
      </DiffSurface>
      <DiffSurface
        label="String B with additions highlighted"
        title="String B"
        caption="Added"
        captionClassName="bg-success-subtle text-success"
        scrollRef={rightRef}
        onScroll={(element) => syncScroll(element, leftRef.current)}
      >
        <HighlightedText changes={comparison.changes} side="b" />
      </DiffSurface>
    </div>
  );
}

function DiffSurface({
  label,
  title,
  caption,
  captionClassName,
  children,
  scrollRef,
  onScroll,
}: {
  label: string;
  title?: string;
  caption?: string;
  captionClassName?: string;
  children: ReactNode;
  scrollRef?: RefObject<HTMLDivElement | null>;
  onScroll?: (element: HTMLDivElement) => void;
}) {
  return (
    <div className="space-y-2">
      {title ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-copy-default">{title}</p>
          {caption ? (
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", captionClassName)}>
              {caption}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        ref={scrollRef}
        role="region"
        aria-label={label}
        onScroll={onScroll ? (event) => onScroll(event.currentTarget) : undefined}
        className="max-h-[28rem] min-h-40 overflow-auto rounded-[var(--radius-input)] border border-border bg-surface-container px-3 py-2.5"
      >
        <pre className="m-0 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-copy-default">
          {children}
        </pre>
      </div>
    </div>
  );
}

function HighlightedText({ changes, side }: { changes: DiffChange[]; side: "a" | "b" }) {
  const visible = changes.filter((change) => (side === "a" ? change.type !== "insert" : change.type !== "delete"));
  const text = visible.map((change) => (side === "a" ? change.a : change.b)).join("");

  if (!text) {
    return <span className="text-copy-muted">Empty</span>;
  }

  return visible.map((change, index) => {
    const value = side === "a" ? change.a : change.b;

    if (!value) {
      return null;
    }

    const highlighted =
      !change.ignored && ((side === "a" && change.type === "delete") || (side === "b" && change.type === "insert"));
    const Tag = highlighted ? "mark" : "span";

    return (
      <Tag
        key={`${change.type}-${index}`}
        className={cn(
          highlighted && "box-decoration-clone rounded-sm px-0.5",
          highlighted && side === "a" && "bg-danger-subtle text-danger",
          highlighted && side === "b" && "bg-success-subtle text-success",
        )}
      >
        {value}
      </Tag>
    );
  });
}

function InlineDiff({ changes }: { changes: DiffChange[] }) {
  const visible = changes.filter((change) => !(change.ignored && change.type === "insert"));
  const text = visible.map((change) => (change.type === "insert" ? change.b : change.a)).join("");

  if (!text) {
    return <span className="text-copy-muted">Empty</span>;
  }

  return visible.map((change, index) => {
    const value = change.type === "insert" ? change.b : change.a;

    if (!value) {
      return null;
    }

    const removed = change.type === "delete" && !change.ignored;
    const added = change.type === "insert" && !change.ignored;
    const Tag = removed || added ? "mark" : "span";

    return (
      <Tag
        key={`${change.type}-${index}`}
        className={cn(
          (removed || added) && "box-decoration-clone rounded-sm px-0.5",
          removed && "bg-danger-subtle text-danger line-through",
          added && "bg-success-subtle text-success",
        )}
      >
        {value}
      </Tag>
    );
  });
}
