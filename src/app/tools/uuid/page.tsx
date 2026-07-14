"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { CopyButton } from "@/components/tools/copy-button";
import { ErrorBanner } from "@/components/tools/error-banner";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getToolBySlug } from "@/lib/tools/registry";
import { generateUuids, UUID_COUNT_LIMITS } from "@/lib/tools/uuid";

const tool = getToolBySlug("uuid");

export default function UuidPage() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    try {
      setError(null);
      setUuids(generateUuids(count));
    } catch (err) {
      setUuids([]);
      setError(err instanceof Error ? err.message : "Failed to generate UUIDs.");
    }
  }

  const output = uuids.join("\n");

  return (
    <div className="space-y-8">
      <Header title={tool?.title ?? "UUID Generator"} description={tool?.description} />

      <ToolPanel title="Generate UUIDs" description="Uses crypto.randomUUID() in the browser.">
        <FormField
          label="Count"
          htmlFor="uuid-count"
          helperText={`${UUID_COUNT_LIMITS.min}–${UUID_COUNT_LIMITS.max}`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Input
              id="uuid-count"
              type="number"
              min={UUID_COUNT_LIMITS.min}
              max={UUID_COUNT_LIMITS.max}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-32"
            />
            <Button icon={RefreshCw} onClick={handleGenerate}>
              Generate
            </Button>
          </div>
        </FormField>

        {error ? <ErrorBanner message={error} /> : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Output</Label>
            <CopyButton value={output} label="Copy all" />
          </div>
          <Textarea
            readOnly
            monospace
            value={output}
            placeholder="Click Generate to create UUIDs"
            className="min-h-[160px]"
          />
        </div>
      </ToolPanel>
    </div>
  );
}
