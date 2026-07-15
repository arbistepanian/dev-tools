"use client";

import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { ToolPage } from "@/components/layout/tool-page";
import { CopyButton } from "@/components/tools/copy-button";
import { ErrorBanner } from "@/components/tools/error-banner";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { decodeBase64, encodeBase64 } from "@/lib/tools/base64";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("base64");

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleEncode() {
    try {
      setError(null);
      setOutput(encodeBase64(input, { urlSafe }));
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "Failed to encode.");
    }
  }

  function handleDecode() {
    try {
      setError(null);
      setOutput(decodeBase64(input, { urlSafe }));
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "Failed to decode.");
    }
  }

  function handleSwap() {
    setInput(output);
    setOutput("");
    setError(null);
  }

  return (
    <ToolPage title={tool?.title ?? "Base64"} description={tool?.description}>
      <ToolPanel title="Encode / decode" description="UTF-8 safe text conversion.">
        <Toggle checked={urlSafe} onChange={setUrlSafe} label="URL-safe base64" />

        <div className="space-y-2">
          <Label htmlFor="base64-input">Input</Label>
          <Textarea
            id="base64-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text or base64"
            monospace
            className="min-h-[140px]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleEncode}>Encode</Button>
          <Button variant="secondary" onClick={handleDecode}>
            Decode
          </Button>
          <Button variant="ghost" icon={ArrowDownUp} onClick={handleSwap}>
            Use output as input
          </Button>
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Output</Label>
            <CopyButton value={output} />
          </div>
          <Textarea
            readOnly
            monospace
            value={output}
            placeholder="Result appears here"
            className="min-h-[140px]"
          />
        </div>
      </ToolPanel>
    </ToolPage>
  );
}
