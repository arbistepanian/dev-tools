"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { CopyButton } from "@/components/tools/copy-button";
import { ErrorBanner } from "@/components/tools/error-banner";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  decodeJwt,
  formatJwtTimestamp,
  prettyPrintJson,
} from "@/lib/tools/jwt";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("jwt");

const TIMESTAMP_CLAIMS = ["exp", "iat", "nbf"] as const;

export default function JwtPage() {
  const [token, setToken] = useState("");
  const [debouncedToken, setDebouncedToken] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedToken(token), 300);
    return () => window.clearTimeout(timer);
  }, [token]);

  const result = useMemo((): { error: string } | { data: ReturnType<typeof decodeJwt> } | null => {
    const trimmed = debouncedToken.trim();
    if (!trimmed) return null;
    try {
      return { data: decodeJwt(trimmed) };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to decode JWT." };
    }
  }, [debouncedToken]);

  return (
    <div className="space-y-8">
      <Header title={tool?.title ?? "JWT Decoder"} description={tool?.description} />

      <div className="rounded-[var(--radius-input)] border border-warning/30 bg-warning-subtle px-4 py-3 text-sm text-copy-default">
        Decode only — do not paste production credentials. Signature is not verified.
      </div>

      <ToolPanel title="Decode JWT" description="Paste a JWT to inspect header and payload.">
        <div className="space-y-2">
          <Label htmlFor="jwt-token">JWT</Label>
          <Textarea
            id="jwt-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            monospace
            className="min-h-[120px]"
          />
        </div>

        {result && "error" in result ? <ErrorBanner message={result.error} /> : null}

        {result && "data" in result ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <JwtSegmentCard title="Header" json={result.data.header.json} raw={result.data.header.raw} />
            <JwtSegmentCard
              title="Payload"
              json={result.data.payload.json}
              raw={result.data.payload.raw}
              showTimestamps
            />
          </div>
        ) : null}

        {result && "data" in result && result.data.signature ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Signature</Label>
              <CopyButton value={result.data.signature} />
            </div>
            <div className="rounded-[var(--radius-input)] border border-border bg-surface-alternate px-3 py-2.5 font-mono text-xs text-copy-default break-all">
              {result.data.signature}
            </div>
          </div>
        ) : null}
      </ToolPanel>
    </div>
  );
}

interface JwtSegmentCardProps {
  title: string;
  json: Record<string, unknown>;
  raw: string;
  showTimestamps?: boolean;
}

function JwtSegmentCard({ title, json, raw, showTimestamps = false }: JwtSegmentCardProps) {
  const pretty = prettyPrintJson(json);

  return (
    <div className="space-y-3 rounded-[var(--radius-input)] border border-border bg-surface-alternate p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-copy-default">{title}</h3>
        <CopyButton value={pretty} />
      </div>

      {showTimestamps ? (
        <div className="space-y-1 text-xs text-copy-muted">
          {TIMESTAMP_CLAIMS.map((claim) => {
            const formatted = formatJwtTimestamp(json[claim]);
            if (!formatted) return null;
            return (
              <p key={claim}>
                <span className="font-medium text-copy-default">{claim}</span>: {formatted}
              </p>
            );
          })}
        </div>
      ) : null}

      <pre className="overflow-x-auto rounded-[var(--radius-input)] border border-border bg-surface-container p-3 font-mono text-xs text-copy-default">
        {pretty}
      </pre>
      <details>
        <summary className="cursor-pointer text-xs text-copy-muted">Raw JSON string</summary>
        <p className="mt-2 font-mono text-xs text-copy-muted break-all">{raw}</p>
      </details>
    </div>
  );
}
