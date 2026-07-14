"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { ErrorBanner } from "@/components/tools/error-banner";
import { ResultField } from "@/components/tools/result-field";
import { ToolPanel } from "@/components/tools/tool-panel";
import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  HASH_ALGORITHMS,
  hashString,
  isHashAlgorithm,
  type HashAlgorithm,
} from "@/lib/tools/hash";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("hash");

export default function HashPage() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("md5");
  const [digest, setDigest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (!input) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(() => {
      setIsComputing(true);

      hashString(input, algorithm)
        .then((result) => {
          if (!cancelled) {
            setDigest(result);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setDigest("");
            setError(err instanceof Error ? err.message : "Failed to compute hash.");
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsComputing(false);
          }
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [input, algorithm]);

  const algorithmLabel = HASH_ALGORITHMS.find((item) => item.value === algorithm)?.label ?? algorithm;
  const showComputing = Boolean(input) && isComputing;

  return (
    <div className="space-y-8">
      <Header title={tool?.title ?? "Hash"} description={tool?.description} />

      <ToolPanel
        title="Compute hash"
        description="Hash any string using common digest algorithms. All computation runs locally in your browser."
      >
        <div className="grid gap-4 md:grid-cols-3 md:items-start">
          <FormField label="Algorithm" htmlFor="hash-algorithm" className="md:col-span-1">
            <Select
              id="hash-algorithm"
              value={algorithm}
              onChange={(e) => {
                const value = e.target.value;
                if (isHashAlgorithm(value)) {
                  setAlgorithm(value);
                }
              }}
            >
              {HASH_ALGORITHMS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Input"
            htmlFor="hash-input"
            helperText="Any UTF-8 text"
            className="md:col-span-3"
          >
            <Textarea
              id="hash-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash"
              monospace
              className="min-h-[120px]"
            />
          </FormField>
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        {input ? (
          <ResultField
            label={`${algorithmLabel} digest`}
            value={showComputing ? "Computing…" : digest}
            helperText="Lowercase hexadecimal"
          />
        ) : null}
      </ToolPanel>
    </div>
  );
}
