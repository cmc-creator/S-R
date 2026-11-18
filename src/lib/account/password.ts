import { createHash } from "node:crypto";
export function passwordError(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 12) return "Use at least 12 characters. A longer, unique passphrase is recommended.";
  if (Buffer.byteLength(value, "utf8") > 72) return "Use at most 72 UTF-8 bytes (some characters use more than one byte).";
  if (!value.trim()) return "Password cannot be only spaces.";
  return null;
}
// This fingerprint remains inside the encrypted JWT, never in the client session.
export function passwordVersion(hash: string) { return createHash("sha256").update(hash).digest("hex"); }
