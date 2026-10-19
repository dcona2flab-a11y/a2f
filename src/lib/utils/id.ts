import { randomBytes } from "node:crypto";

export type IdPrefix = "award" | "project" | "member" | "field";

// e.g. "award-k3f9x2ab". Matches idSchema (lowercase letters, digits, hyphens).
export function createId(prefix: IdPrefix): string {
  const suffix = randomBytes(6).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "x");
  return `${prefix}-${suffix}`;
}
