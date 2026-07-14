"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  value: string;
  label?: string;
  size?: "sm" | "md";
}

export function CopyButton({ value, label = "Copy", size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      variant="secondary"
      size={size}
      icon={copied ? Check : Copy}
      onClick={handleCopy}
      disabled={!value}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}
