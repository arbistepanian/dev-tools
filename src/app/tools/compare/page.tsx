"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ArrowLeftRight, Eraser, FileText } from "lucide-react";
import { ToolPage } from "@/components/layout/tool-page";
import { StringDiffView } from "@/components/tools/string-diff-view";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import {
  compareStrings,
  diffUnit,
  formatDiffCount,
  SAMPLE_STRING_A,
  SAMPLE_STRING_B,
  type DiffGranularity,
} from "@/lib/tools/string-diff";
import { getToolBySlug } from "@/lib/tools/registry";
import { cn } from "@/lib/utils/cn";

const tool = getToolBySlug("compare");

const GRANULARITIES: { value: DiffGranularity; label: string }[] = [
  { value: "character", label: "Characters" },
  { value: "word", label: "Words" },
  { value: "line", label: "Lines" },
];

type DiffView = "split" | "inline";

export default function ComparePage() {
  const [stringA, setStringA] = useState(SAMPLE_STRING_A);
  const [stringB, setStringB] = useState(SAMPLE_STRING_B);
  const [granularity, setGranularity] = useState<DiffGranularity>("word");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [view, setView] = useState<DiffView>("split");

  const deferredA = useDeferredValue(stringA);
  const deferredB = useDeferredValue(stringB);
  const comparison = useMemo(
    () =>
      compareStrings(deferredA, deferredB, {
        granularity,
        ignoreCase,
        ignoreWhitespace,
        deadlineMs: 200,
      }),
    [deferredA, deferredB, granularity, ignoreCase, ignoreWhitespace],
  );

  const summary = buildSummary({
    identical: comparison.identical,
    removed: comparison.removed,
    added: comparison.added,
    firstDifferenceIndex: comparison.firstDifferenceIndex,
    approximate: comparison.approximate,
    stringA: deferredA,
    stringB: deferredB,
    granularity,
    ignoreCase,
    ignoreWhitespace,
  });

  function handleSwap() {
    setStringA(stringB);
    setStringB(stringA);
  }

  function handleClear() {
    setStringA("");
    setStringB("");
  }

  function handleLoadExample() {
    setStringA(SAMPLE_STRING_A);
    setStringB(SAMPLE_STRING_B);
  }

  return (
    <ToolPage
      title={tool?.title ?? "String Compare"}
      description={tool?.description}
      contentClassName="max-w-6xl"
    >
      <div className="space-y-8">
        <ToolPanel
          title="Strings"
          description="Paste two strings. Differences are highlighted as you type, locally in your browser."
        >
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Comparison granularity">
            {GRANULARITIES.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={granularity === option.value ? "primary" : "secondary"}
                aria-pressed={granularity === option.value}
                onClick={() => setGranularity(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Toggle checked={ignoreCase} onChange={setIgnoreCase} label="Ignore case" />
            <Toggle checked={ignoreWhitespace} onChange={setIgnoreWhitespace} label="Ignore whitespace" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <StringField
              id="compare-string-a"
              label="String A"
              value={stringA}
              placeholder="Paste the first string"
              onChange={setStringA}
            />
            <StringField
              id="compare-string-b"
              label="String B"
              value={stringB}
              placeholder="Paste the second string"
              onChange={setStringB}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" icon={ArrowLeftRight} onClick={handleSwap}>
              Swap
            </Button>
            <Button variant="ghost" icon={Eraser} onClick={handleClear}>
              Clear
            </Button>
            <Button variant="ghost" icon={FileText} onClick={handleLoadExample}>
              Load example
            </Button>
          </div>
        </ToolPanel>

        <ToolPanel title="Differences" description="Removed text is red. Added text is green.">
          <p
            role="status"
            className={cn(
              "rounded-[var(--radius-input)] px-4 py-3 text-sm",
              summary.tone === "success" && "bg-success-subtle text-success",
              summary.tone === "warning" && "bg-warning-subtle text-warning",
              summary.tone === "neutral" && "bg-surface-alternate text-copy-default",
            )}
          >
            {summary.text}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Difference view">
              <Button
                size="sm"
                variant={view === "split" ? "primary" : "secondary"}
                aria-pressed={view === "split"}
                onClick={() => setView("split")}
              >
                Side by side
              </Button>
              <Button
                size="sm"
                variant={view === "inline" ? "primary" : "secondary"}
                aria-pressed={view === "inline"}
                onClick={() => setView("inline")}
              >
                Inline
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-copy-muted">
              <span className="rounded-sm bg-danger-subtle px-1.5 py-0.5 font-medium text-danger">Removed</span>
              <span className="rounded-sm bg-success-subtle px-1.5 py-0.5 font-medium text-success">Added</span>
            </div>
          </div>

          <StringDiffView comparison={comparison} view={view} stringA={deferredA} stringB={deferredB} />
        </ToolPanel>
      </div>
    </ToolPage>
  );
}

function StringField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs text-copy-muted">{formatDiffCount(value.length, "character")}</span>
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        monospace
        spellCheck={false}
        className="min-h-52"
      />
    </div>
  );
}

function buildSummary({
  identical,
  removed,
  added,
  firstDifferenceIndex,
  approximate,
  stringA,
  stringB,
  granularity,
  ignoreCase,
  ignoreWhitespace,
}: {
  identical: boolean;
  removed: number;
  added: number;
  firstDifferenceIndex: number | null;
  approximate: boolean;
  stringA: string;
  stringB: string;
  granularity: DiffGranularity;
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}): { tone: "success" | "warning" | "neutral"; text: string } {
  if (!stringA && !stringB) {
    return { tone: "neutral", text: "Paste two strings to compare them." };
  }

  if (identical) {
    const ignored = [ignoreCase ? "case" : null, ignoreWhitespace ? "whitespace" : null].filter(
      (item): item is string => item !== null,
    );

    if (stringA === stringB || ignored.length === 0) {
      return { tone: "success", text: "The strings are identical." };
    }

    return {
      tone: "success",
      text: `The strings match, ignoring ${ignored.join(" and ")}.`,
    };
  }

  if (removed === 0 && added === 0) {
    return { tone: "warning", text: "Only whitespace differs." };
  }

  const unit = diffUnit(granularity);
  const location =
    firstDifferenceIndex === null ? "" : ` First difference at index ${firstDifferenceIndex}.`;
  const simplified = approximate
    ? " Showing a simplified diff because the inputs differ in many places."
    : "";

  return {
    tone: "neutral",
    text: `${formatDiffCount(removed, unit)} removed, ${formatDiffCount(added, unit)} added.${location}${simplified}`,
  };
}
