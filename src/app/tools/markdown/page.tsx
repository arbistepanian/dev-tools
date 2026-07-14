"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Download } from "lucide-react";
import { Header } from "@/components/layout/header";
import { CopyButton } from "@/components/tools/copy-button";
import { ErrorBanner } from "@/components/tools/error-banner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  convert,
  SAMPLE_HTML,
  SAMPLE_MARKDOWN,
  type ConversionDirection,
} from "@/lib/tools/markdown";
import { getToolBySlug } from "@/lib/tools/registry";
import { cn } from "@/lib/utils/cn";

const tool = getToolBySlug("markdown");

type OutputTab = "preview" | "raw";

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-t-[var(--radius-button)] border border-b-0 px-4 py-2 text-sm font-medium transition",
        active
          ? "border-border bg-surface-container text-copy-default"
          : "border-transparent bg-transparent text-primary hover:text-primary-hover",
      )}
    >
      {children}
    </button>
  );
}

export default function MarkdownPage() {
  const [direction, setDirection] = useState<ConversionDirection>("markdown-to-html");
  const [input, setInput] = useState(SAMPLE_MARKDOWN);
  const [outputTab, setOutputTab] = useState<OutputTab>("preview");

  const isMarkdownInput = direction === "markdown-to-html";
  const inputLabel = isMarkdownInput ? "Enter Markdown" : "Enter HTML";
  const rawOutputLabel = isMarkdownInput ? "Raw HTML" : "Raw Markdown";

  const conversion = useMemo(() => {
    try {
      const raw = convert(input, direction);

      if (isMarkdownInput) {
        return { rawOutput: raw, previewHtml: raw, error: null as string | null };
      }

      return { rawOutput: raw, previewHtml: input, error: null as string | null };
    } catch (err) {
      return {
        rawOutput: "",
        previewHtml: "",
        error: err instanceof Error ? err.message : "Conversion failed.",
      };
    }
  }, [direction, input, isMarkdownInput]);

  const { rawOutput, previewHtml, error } = conversion;

  function handleDirectionChange(next: ConversionDirection) {
    if (next === direction) {
      return;
    }

    setDirection(next);
    setOutputTab("preview");
    setInput(next === "markdown-to-html" ? SAMPLE_MARKDOWN : SAMPLE_HTML);
  }

  function handleSwapDirection() {
    const next: ConversionDirection = isMarkdownInput ? "html-to-markdown" : "markdown-to-html";
    setDirection(next);
    setInput(rawOutput || input);
    setOutputTab("preview");
  }

  function handleDownload() {
    if (!rawOutput) {
      return;
    }

    const extension = isMarkdownInput ? "html" : "md";
    const mimeType = isMarkdownInput ? "text/html" : "text/markdown";
    const blob = new Blob([rawOutput], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `converted.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <Header title={tool?.title ?? "Markdown / HTML"} description={tool?.description} />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isMarkdownInput ? "primary" : "secondary"}
            size="sm"
            onClick={() => handleDirectionChange("markdown-to-html")}
          >
            Markdown → HTML
          </Button>
          <Button
            variant={!isMarkdownInput ? "primary" : "secondary"}
            size="sm"
            onClick={() => handleDirectionChange("html-to-markdown")}
          >
            HTML → Markdown
          </Button>
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex min-h-[28rem] flex-col rounded-[var(--radius-card)] border border-border bg-surface-container shadow-card">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-copy-default">{inputLabel}</p>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={isMarkdownInput ? "Paste or type Markdown..." : "Paste or type HTML..."}
                monospace={isMarkdownInput}
                className="min-h-[24rem] flex-1 resize-none border-0 bg-transparent p-0 shadow-none focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-row items-center justify-center gap-2 xl:flex-col xl:py-8">
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeftRight}
              aria-label="Swap direction and use output as input"
              title="Swap direction"
              onClick={handleSwapDirection}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              aria-label="Download output"
              title="Download output"
              disabled={!rawOutput}
              onClick={handleDownload}
            />
          </div>

          <div className="flex min-h-[28rem] flex-col rounded-[var(--radius-card)] border border-border bg-surface-container shadow-card">
            <div className="flex items-end justify-between gap-3 border-b border-border px-2 pt-2">
              <div className="flex">
                <TabButton active={outputTab === "preview"} onClick={() => setOutputTab("preview")}>
                  Preview
                </TabButton>
                <TabButton active={outputTab === "raw"} onClick={() => setOutputTab("raw")}>
                  {rawOutputLabel}
                </TabButton>
              </div>
              <div className="pb-2 pr-2">
                <CopyButton value={rawOutput} label="Copy" />
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {outputTab === "preview" ? (
                previewHtml ? (
                  <div
                    className="markdown-preview"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <p className="text-sm text-copy-muted">Preview appears here as you type.</p>
                )
              ) : (
                <Textarea
                  readOnly
                  monospace
                  value={rawOutput}
                  placeholder="Converted output appears here"
                  className="min-h-[24rem] resize-none border-0 bg-transparent p-0 shadow-none focus:ring-0"
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
