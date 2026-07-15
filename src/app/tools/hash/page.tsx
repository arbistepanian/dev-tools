"use client";

import { useEffect, useState } from "react";
import { ToolPage } from "@/components/layout/tool-page";
import { ErrorBanner } from "@/components/tools/error-banner";
import { ResultField } from "@/components/tools/result-field";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import {
  computeHash,
  getHashOutputHelperText,
  HASH_ALGORITHMS,
  HASH_OUTPUT_FORMATS,
  isHashAlgorithm,
  isHashOutputFormat,
  type HashAlgorithm,
  type HashMode,
  type HashOutputFormat,
} from "@/lib/tools/hash";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("hash");

export default function HashPage() {
  const [input, setInput] = useState("");
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("sha256");
  const [mode, setMode] = useState<HashMode>("digest");
  const [outputFormat, setOutputFormat] = useState<HashOutputFormat>("hex");
  const [uppercaseHex, setUppercaseHex] = useState(false);
  const [digest, setDigest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (!input || (mode === "hmac" && !secret)) {
      setDigest("");
      setError(null);
      setIsComputing(false);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(() => {
      setIsComputing(true);

      computeHash({
        message: input,
        algorithm,
        mode,
        secret,
        outputFormat,
        uppercaseHex,
      })
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
  }, [algorithm, input, mode, outputFormat, secret, uppercaseHex]);

  const algorithmLabel = HASH_ALGORITHMS.find((item) => item.value === algorithm)?.label ?? algorithm;
  const modeLabel = mode === "hmac" ? "HMAC" : "Hash";
  const showComputing = Boolean(input) && (mode !== "hmac" || Boolean(secret)) && isComputing;
  const resultLabel = `${algorithmLabel} ${modeLabel}`;

  return (
    <ToolPage title={tool?.title ?? "Hash"} description={tool?.description}>
      <ToolPanel
        title="Compute hash"
        description="Hash or HMAC any string using common digest algorithms. All computation runs locally in your browser."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={mode === "digest" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setMode("digest")}
          >
            Hash
          </Button>
          <Button
            variant={mode === "hmac" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setMode("hmac")}
          >
            HMAC
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Algorithm" htmlFor="hash-algorithm">
            <Select
              id="hash-algorithm"
              value={algorithm}
              onChange={(event) => {
                const value = event.target.value;
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

          <FormField label="Output format" htmlFor="hash-output-format">
            <Select
              id="hash-output-format"
              value={outputFormat}
              onChange={(event) => {
                const value = event.target.value;
                if (isHashOutputFormat(value)) {
                  setOutputFormat(value);
                }
              }}
            >
              {HASH_OUTPUT_FORMATS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Toggle
            checked={uppercaseHex}
            onChange={setUppercaseHex}
            label="Uppercase hex"
            disabled={outputFormat === "base64"}
          />
        </div>

        {mode === "hmac" ? (
          <FormField
            label="Secret key"
            htmlFor="hash-secret"
            helperText="Used as the HMAC key"
          >
            <Input
              id="hash-secret"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="Enter secret key"
              autoComplete="off"
            />
          </FormField>
        ) : null}

        <FormField
          label={mode === "hmac" ? "Message" : "Input"}
          htmlFor="hash-input"
          helperText="Any UTF-8 text"
        >
          <Textarea
            id="hash-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={mode === "hmac" ? "Enter message to authenticate" : "Enter text to hash"}
            monospace
            className="min-h-[120px]"
          />
        </FormField>

        {error ? <ErrorBanner message={error} /> : null}

        {input && (mode !== "hmac" || secret) ? (
          <ResultField
            label={`${resultLabel} digest`}
            value={showComputing ? "Computing…" : digest}
            helperText={getHashOutputHelperText(outputFormat, uppercaseHex)}
          />
        ) : null}
      </ToolPanel>
    </ToolPage>
  );
}
