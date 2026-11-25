import type { PoolId, SectionId } from "./types";

export function isPoolId(value: unknown): value is PoolId {
  return typeof value === "string" && value.length > 0;
}

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === "string" && value.length > 0;
}
