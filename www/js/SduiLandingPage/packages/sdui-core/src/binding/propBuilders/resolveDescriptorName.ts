import type { PropDescriptorName } from "../../types";
import { PROP_DESCRIPTOR_NAMES } from "../../types";

/**
 * Extracts the short descriptor name from a proto-decoded
 * prop's `$typeName`.
 * Returns `undefined` for unknown names; the dispatcher falls back to
 * `buildDefaultProp`.
 */

const PROP_TYPE_SUFFIX_RE = /\.([A-Za-z][A-Za-z0-9]*)$/;

export function extractDescriptorName(rawProp: Record<string, unknown>): string | undefined {
  const typeName = rawProp.$typeName;
  if (typeof typeName !== "string") return undefined;
  return PROP_TYPE_SUFFIX_RE.exec(typeName)?.[1];
}

export function isKnownPropDescriptor(name: string): name is PropDescriptorName {
  return PROP_DESCRIPTOR_NAMES.some(n => n === name);
}

export function resolveDescriptorName(name: string | undefined): PropDescriptorName | undefined {
  if (name !== undefined && isKnownPropDescriptor(name)) {
    return name;
  }
  return undefined;
}
