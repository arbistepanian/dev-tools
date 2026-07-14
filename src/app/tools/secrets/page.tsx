"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { CopyButton } from "@/components/tools/copy-button";
import { ErrorBanner } from "@/components/tools/error-banner";
import { ResultField } from "@/components/tools/result-field";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getToolBySlug } from "@/lib/tools/registry";
import {
  generateSecret,
  SECRET_BYTE_LIMITS,
  type SecretEncoding,
} from "@/lib/tools/secrets";

const tool = getToolBySlug("secrets");

export default function SecretsPage() {
  const [lengthBytes, setLengthBytes] = useState(32);
  const [encoding, setEncoding] = useState<SecretEncoding>("hex");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    try {
      setError(null);
      setSecret(generateSecret({ lengthBytes, encoding }));
    } catch (err) {
      setSecret("");
      setError(err instanceof Error ? err.message : "Failed to generate secret.");
    }
  }

  return (
    <div className="space-y-8">
      <Header title={tool?.title ?? "Secret Generator"} description={tool?.description} />

      <ToolPanel
        title="Generate random secret"
        description="Uses crypto.getRandomValues() in the browser."
      >
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <FormField
            label="Length (bytes)"
            htmlFor="secret-length"
            helperText={`${SECRET_BYTE_LIMITS.min}–${SECRET_BYTE_LIMITS.max} bytes`}
          >
            <Input
              id="secret-length"
              type="number"
              min={SECRET_BYTE_LIMITS.min}
              max={SECRET_BYTE_LIMITS.max}
              value={lengthBytes}
              onChange={(e) => setLengthBytes(Number(e.target.value))}
            />
          </FormField>

          <FormField label="Encoding" htmlFor="secret-encoding">
            <Select
              id="secret-encoding"
              value={encoding}
              onChange={(e) => setEncoding(e.target.value as SecretEncoding)}
            >
              <option value="hex">hex</option>
              <option value="base64">base64</option>
              <option value="base64url">base64url</option>
            </Select>
          </FormField>
        </div>

        <Button icon={RefreshCw} onClick={handleGenerate}>
          Generate
        </Button>

        {error ? <ErrorBanner message={error} /> : null}

        {secret ? (
          <div className="space-y-3">
            <ResultField label="Secret" value={secret} />
            <CopyButton value={secret} label="Copy secret" size="md" />
          </div>
        ) : null}
      </ToolPanel>
    </div>
  );
}
