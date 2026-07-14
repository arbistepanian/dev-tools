"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Minimize2, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { CopyButton } from "@/components/tools/copy-button";
import { CodeBlock } from "@/components/tools/code-block";
import { ErrorBanner } from "@/components/tools/error-banner";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatJson,
  getJsonErrorMessage,
  minifyJson,
  SAMPLE_JSON,
  type JsonIndent,
} from "@/lib/tools/json-format";
import { getToolBySlug } from "@/lib/tools/registry";
import {
  formatXml,
  getXmlErrorMessage,
  minifyXml,
  SAMPLE_XML,
  type XmlIndent,
} from "@/lib/tools/xml-format";
import { cn } from "@/lib/utils/cn";

const tool = getToolBySlug("formatter");

type FormatKind = "json" | "xml";
type FormatAction = "prettify" | "minify";

function formatInput(
  input: string,
  kind: FormatKind,
  action: FormatAction,
  jsonIndent: JsonIndent,
  xmlIndent: XmlIndent,
): string {
  if (kind === "json") {
    return action === "prettify" ? formatJson(input, jsonIndent) : minifyJson(input);
  }

  return action === "prettify" ? formatXml(input, xmlIndent) : minifyXml(input);
}

function getErrorMessage(error: unknown, kind: FormatKind): string {
  return kind === "json" ? getJsonErrorMessage(error) : getXmlErrorMessage(error);
}

export default function FormatterPage() {
  const [kind, setKind] = useState<FormatKind>("json");
  const [action, setAction] = useState<FormatAction>("prettify");
  const [jsonIndent, setJsonIndent] = useState<JsonIndent>(2);
  const [xmlIndent, setXmlIndent] = useState<XmlIndent>(2);
  const [input, setInput] = useState(SAMPLE_JSON);

  useEffect(() => {
    setInput(kind === "json" ? SAMPLE_JSON : SAMPLE_XML);
  }, [kind]);

  const result = useMemo(() => {
    if (!input.trim()) {
      return { output: "", error: null as string | null };
    }

    try {
      return {
        output: formatInput(input, kind, action, jsonIndent, xmlIndent),
        error: null as string | null,
      };
    } catch (error) {
      return {
        output: "",
        error: getErrorMessage(error, kind),
      };
    }
  }, [action, input, jsonIndent, kind, xmlIndent]);

  function handleSwap() {
    if (!result.output) {
      return;
    }

    setInput(result.output);
  }

  const indentValue = kind === "json" ? String(jsonIndent) : String(xmlIndent);

  return (
    <div className="space-y-8">
      <Header title={tool?.title ?? "JSON / XML Formatter"} description={tool?.description} />

      <ToolPanel
        title="Format and validate"
        description="Paste minified or messy JSON/XML and prettify or minify it locally in your browser."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={kind === "json" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setKind("json")}
          >
            JSON
          </Button>
          <Button
            variant={kind === "xml" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setKind("xml")}
          >
            XML
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Button
            variant={action === "prettify" ? "primary" : "secondary"}
            size="sm"
            icon={Sparkles}
            onClick={() => setAction("prettify")}
          >
            Prettify
          </Button>
          <Button
            variant={action === "minify" ? "primary" : "secondary"}
            size="sm"
            icon={Minimize2}
            onClick={() => setAction("minify")}
          >
            Minify
          </Button>

          {action === "prettify" ? (
            <FormField label="Indent" htmlFor="formatter-indent" className="min-w-[8rem]">
              <Select
                id="formatter-indent"
                value={indentValue}
                onChange={(event) => {
                  const value = event.target.value;

                  if (kind === "json") {
                    setJsonIndent(value === "tab" ? "tab" : Number(value) === 4 ? 4 : 2);
                    return;
                  }

                  setXmlIndent(Number(value) === 4 ? 4 : 2);
                }}
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                {kind === "json" ? <option value="tab">Tab</option> : null}
              </Select>
            </FormField>
          ) : null}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-copy-default">
              Input {kind === "json" ? "JSON" : "XML"}
            </p>
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={kind === "json" ? "Paste JSON here..." : "Paste XML here..."}
              monospace
              hasError={Boolean(result.error)}
              className={cn("min-h-[20rem] resize-y", result.error && "border-danger")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-copy-default">Output</p>
              <CopyButton value={result.output} />
            </div>
            <CodeBlock
              code={result.output}
              language={kind}
              placeholder="Formatted output appears here"
              className="min-h-[20rem]"
            />
          </div>
        </div>

        {result.error ? <ErrorBanner message={result.error} /> : null}

        <div>
          <Button variant="ghost" icon={ArrowDownUp} onClick={handleSwap} disabled={!result.output}>
            Use output as input
          </Button>
        </div>
      </ToolPanel>
    </div>
  );
}
