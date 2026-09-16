/**
 * Guards for reading a node's untyped server-authored `details` bag: a missing or malformed field
 * degrades to a default instead of crashing.
 */

export function asText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Parses a server-authored string map (e.g. `requestDetails`). A non-object degrades to `undefined`;
 * non-string values are dropped so the result is a clean `Record<string, string>`.
 */
export function asStringRecord(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  const entries: [string, unknown][] = Object.entries(value);
  const record: Record<string, string> = {};
  for (const [key, item] of entries) {
    const text = asText(item);
    if (text !== undefined) {
      record[key] = text;
    }
  }
  return record;
}

/** Reads a finite number. NaN and Infinity degrade to `undefined` along with non-numbers. */
export function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export type TextScreenButton = { label: string; outcome: string };

/**
 * Parses a server-authored `buttons` array of `{ label, outcome }`. Entries missing either field are
 * dropped; a non-array or empty result degrades to `undefined` so callers render nothing rather than
 * crash.
 */
export function asButtons(value: unknown): TextScreenButton[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  // Array.isArray narrows to any[]; re-widen the elements to unknown so we parse them via guards
  // rather than unsafe `any` member access / assertions.
  const items: unknown[] = value;
  const buttons: TextScreenButton[] = [];
  for (const item of items) {
    if (typeof item !== "object" || item === null || !("label" in item) || !("outcome" in item)) {
      continue;
    }
    const label = asText(item.label);
    const outcome = asText(item.outcome);
    if (label !== undefined && outcome !== undefined) {
      buttons.push({ label, outcome });
    }
  }
  return buttons.length > 0 ? buttons : undefined;
}

/** Which party a consent row is granted for. Echoed back verbatim; the client never reads into it. */
export const CONSENT_TARGETS = ["self", "child", "both"] as const;

export type ConsentTarget = (typeof CONSENT_TARGETS)[number];

export type AgreementConsentRow = {
  id: string;
  target: ConsentTarget;
  /** Pre-translated, with any anchors already embedded. */
  label: string;
  isRequired: boolean;
};

function asConsentTarget(value: unknown): ConsentTarget | undefined {
  return CONSENT_TARGETS.find(target => target === value);
}

/**
 * Parses a server-authored `rows` array of `{ id, target, label, isRequired }`. An entry without an
 * id or a recognised target is dropped, since reporting one back would fail the service's payload
 * read; a missing `label` degrades to empty and a non-boolean `isRequired` to optional.
 */
export function asConsentRows(value: unknown): AgreementConsentRow[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items: unknown[] = value;
  const rows: AgreementConsentRow[] = [];
  for (const item of items) {
    if (typeof item !== "object" || item === null || !("id" in item) || !("target" in item)) {
      continue;
    }
    const id = asText(item.id);
    const target = asConsentTarget(item.target);
    if (id === undefined || id === "" || target === undefined) {
      continue;
    }
    rows.push({
      id,
      target,
      label: ("label" in item ? asText(item.label) : undefined) ?? "",
      isRequired: "isRequired" in item && item.isRequired === true,
    });
  }
  return rows.length > 0 ? rows : undefined;
}

export type VerificationMethodOption = { id: string; label: string; description: string };

/**
 * Parses a server-authored `methods` array of `{ id, label, description }`. An entry without an `id` or
 * `label` is dropped; a missing `description` degrades to empty.
 */
export function asMethodOptions(value: unknown): VerificationMethodOption[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items: unknown[] = value;
  const options: VerificationMethodOption[] = [];
  for (const item of items) {
    if (typeof item !== "object" || item === null || !("id" in item) || !("label" in item)) {
      continue;
    }
    const id = asText(item.id);
    const label = asText(item.label);
    if (id !== undefined && label !== undefined) {
      const description = "description" in item ? asText(item.description) : undefined;
      options.push({ id, label, description: description ?? "" });
    }
  }
  return options.length > 0 ? options : undefined;
}
