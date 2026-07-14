import type { LucideIcon } from "lucide-react";
import {
  Fingerprint,
  Hash,
  KeyRound,
  LayoutGrid,
  Shield,
} from "lucide-react";

export type ToolSlug =
  | "hash"
  | "uuid"
  | "base64"
  | "secrets"
  | "jwt";

export interface ToolDefinition {
  slug: ToolSlug;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export const tools: ToolDefinition[] = [
  {
    slug: "hash",
    title: "Hash",
    description: "Compute MD5, SHA-1, SHA-256, or SHA-512 digests for any string.",
    icon: Hash,
    href: "/tools/hash",
  },
  {
    slug: "uuid",
    title: "UUID Generator",
    description: "Generate one or many RFC 4122 UUIDs.",
    icon: Fingerprint,
    href: "/tools/uuid",
  },
  {
    slug: "base64",
    title: "Base64",
    description: "Encode and decode text with optional URL-safe mode.",
    icon: LayoutGrid,
    href: "/tools/base64",
  },
  {
    slug: "secrets",
    title: "Secret Generator",
    description: "Generate cryptographically random secrets in hex or base64.",
    icon: KeyRound,
    href: "/tools/secrets",
  },
  {
    slug: "jwt",
    title: "JWT Decoder",
    description: "Decode JWT header and payload without verification.",
    icon: Shield,
    href: "/tools/jwt",
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}
