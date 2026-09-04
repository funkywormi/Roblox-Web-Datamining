/**
 * Shared converter: decoded protobuf message → SduiApiResponse.
 *
 * Both `fromBinary()` (binary protobuf) and `fromJson()` (proto JSON) produce
 * the same message shape. This module converts that shape into our internal
 * `SduiApiResponse`. This converter handles structural extraction (page entries, templates,
 * hydration data) and low-level proto normalization (BigInt, $unknown, oneOf).
 */
import {
  UiComponentType,
  type HydrationContentType,
  type SduiApiResponse,
  type HydrationDataSpec as InternalHydrationDataSpec,
  type UiComponentTemplate,
  type ComponentShared as InternalComponentShared,
} from "../types";
import { HYDRATION_FIELD_KEYS, hydrationContentTypeToFieldKey } from "../utils/hydration";
import { asRecordOrEmpty, isRecord, type RecordOf } from "../utils/typeGuards";

// ─── Shape primitives & narrowing helpers ───

/** Local alias documenting that a value is the decoded shape of a proto message. */
type ProtoRecord = RecordOf;

/**
 * Bufbuild encodes a oneOf field as `{ case: "selectedFieldName", value: ... }`
 * directly on the parent message. We rename `case` to `kind` for consistency
 * with the rest of the SDUI binding contract — most oneOf values are shaped
 * `{ kind: <caseName>, value: <converted> }` after conversion.
 *
 * Exception: a direct protobuf oneof on `input_data` / `inputData`
 *  is hoisted to a sibling field for nested binding path resolution (e.g. `inputData.attribution_row.title`).
 */
interface OneOfRaw {
  case: string;
  value: unknown;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Returns a string only when it is non-empty. Equivalent to the legacy
 * `someStringField || undefined` pattern but type-safe — proto fields default
 * to `""` for unset strings, and downstream consumers expect `undefined` so
 * they can apply their own fallbacks.
 */
function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isOneOfRaw(record: ProtoRecord): record is ProtoRecord & OneOfRaw {
  return typeof record.case === "string" && "value" in record;
}

function isInputDataFieldName(key: string): boolean {
  return key === "inputData" || key === "input_data";
}

/**
 * Bufbuild prefixes runtime metadata with `$` (e.g. `$typeName`, `$unknown`).
 * `$unknown` is binary padding we always strip; other `$` keys are preserved
 * because downstream prop builders route on `$typeName`.
 */
function isProtoMetaKey(key: string): boolean {
  return key.startsWith("$");
}

// ─── Object Serialization (leaf — used by every higher-level converter) ───

/**
 * Recursively normalizes a decoded protobuf value.
 *
 * - BigInt → Number (or String if > MAX_SAFE_INTEGER)
 * - Strips `$unknown`, keeps `$typeName` (and any other `$`-prefixed metadata)
 * - Uniform oneOf normalization
 */
function normalizeProtoValue(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "bigint") {
    // Implicit type narrowing: int64/uint64 fields decode as bigint. We coerce
    // to Number when safe, but anything above MAX_SAFE_INTEGER (2^53 - 1) is
    // returned as a string to avoid silent precision loss. Downstream consumers
    // that read these fields must accept `number | string` for 64-bit ids.
    if (value > Number.MAX_SAFE_INTEGER) {
      console.warn(`[sdui] bigint ${value.toString()} exceeds MAX_SAFE_INTEGER; coerced to string`);
      return String(value);
    }
    return Number(value);
  }
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(normalizeProtoValue);
  // Defensive: every remaining `value` is a non-array, non-null object, so this
  // narrows without an unsafe assertion. Preserves the type system invariant.
  if (!isRecord(value)) return value;

  if (isOneOfRaw(value)) {
    const out: Record<string, unknown> = {
      kind: value.case,
      value: normalizeProtoValue(value.value),
    };
    for (const [key, propValue] of Object.entries(value)) {
      if (key === "case" || key === "value" || key === "$unknown") continue;
      out[key] = isProtoMetaKey(key) ? propValue : normalizeProtoValue(propValue);
    }
    return out;
  }

  const generic: Record<string, unknown> = {};
  for (const [key, propValue] of Object.entries(value)) {
    if (key === "$unknown") continue;
    if (isProtoMetaKey(key)) {
      generic[key] = propValue;
      continue;
    }
    // Direct oneof on input_data: hoist `case` to a sibling; skip the field.
    if (isInputDataFieldName(key) && isRecord(propValue) && isOneOfRaw(propValue)) {
      if (!(propValue.case in generic)) {
        generic[propValue.case] = normalizeProtoValue(propValue.value);
      }
      continue;
    }
    generic[key] = normalizeProtoValue(propValue);
  }
  return generic;
}

/**
 * Recursively normalizes a proto message into a plain object.
 * Strips `$unknown` (binary padding), keeps `$typeName` (useful metadata
 * for downstream routing), converts BigInts, and normalizes oneOf wrappers.
 * Returns an empty object for anything that isn't a record.
 */
function toPlainObject(rawMessage: unknown): Record<string, unknown> {
  if (!isRecord(rawMessage)) return {};

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawMessage)) {
    if (key === "$unknown") continue;
    if (isProtoMetaKey(key)) {
      result[key] = value;
      continue;
    }
    result[key] = normalizeProtoValue(value);
  }
  return result;
}

// ─── Props ───

/**
 * Normalize each prop via {@link normalizeProtoValue}. No type interpretation —
 * the binding layer reads `$typeName` for prop builder routing. Non-record
 * values are dropped because every SDUI prop on the wire is a message.
 */
function convertProps(rawProps: unknown): Record<string, Record<string, unknown>> {
  if (!isRecord(rawProps)) return {};

  const result: Record<string, Record<string, unknown>> = {};
  for (const [propName, rawValue] of Object.entries(rawProps)) {
    if (rawValue == null || isProtoMetaKey(propName)) continue;
    const converted = normalizeProtoValue(rawValue);
    if (isRecord(converted)) {
      result[propName] = converted;
    }
  }
  return result;
}

// ─── Hydration ───

/**
 * Reads a oneOf discriminator from either shape: raw bufbuild (`.case`) or
 * post-normalize (`.kind`). Returns `undefined` when neither is a string.
 */
function readOneOfDiscriminator(oneOfWrapper: RecordOf | undefined): string | undefined {
  if (!oneOfWrapper) return undefined;
  if (typeof oneOfWrapper.case === "string") return oneOfWrapper.case;
  if (typeof oneOfWrapper.kind === "string") return oneOfWrapper.kind;
  return undefined;
}

function convertHydrationDataSpec(rawSpec: unknown): InternalHydrationDataSpec {
  const spec = asRecordOrEmpty(rawSpec);

  // `contentType` is a numeric proto enum; the lookup returns "" for unknown
  // values. Tag unmapped variants as `unknown:<n>` so telemetry can pinpoint
  // the drift instead of collapsing every miss into one bucket.
  const contentType =
    typeof spec.contentType === "number"
      ? hydrationContentTypeToFieldKey(spec.contentType as HydrationContentType) ||
        `unknown:${spec.contentType}`
      : "";
  const alias = asString(spec.alias) ?? "";

  // Top-level template decoding runs before `normalizeProtoValue`, so oneOfs
  // are still in bufbuild's raw `{ case, value }` shape. The same converter
  // is reused for inline `UiComponentSchema` values that arrive through the
  // already-normalized prop pipeline (`{ kind, value }`) — accept both.
  const idBinding = isRecord(spec.idBinding) ? spec.idBinding : undefined;
  const idBindingKind = idBinding && isRecord(idBinding.kind) ? idBinding.kind : undefined;
  const oneOfCase = readOneOfDiscriminator(idBindingKind);

  if (oneOfCase === "literal") {
    return {
      contentType,
      alias,
      idSource: "literal",
      literalId: asString(idBindingKind?.value) ?? "",
    };
  }
  if (oneOfCase === "inputPath") {
    return {
      contentType,
      alias,
      idSource: "inputPath",
      inputPath: asString(idBindingKind?.value) ?? "",
    };
  }

  return { contentType, alias, idSource: "none" };
}

/**
 * Converts the decoded HydrationContent message into a plain object map.
 * Iterates only over `HYDRATION_FIELD_KEYS` (derived from the HydrationContentType
 * enum in service-contracts), so new entity types added to the proto are
 * automatically picked up when the service-contracts package is bumped.
 */
function convertHydrationContent(
  rawContent: unknown,
): Record<string, Record<string, Record<string, unknown>>> {
  if (!isRecord(rawContent)) return {};

  const result: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const fieldKey of HYDRATION_FIELD_KEYS) {
    const entityMap = rawContent[fieldKey];
    if (!isRecord(entityMap)) continue;

    const entityEntries = Object.entries(entityMap);
    if (entityEntries.length === 0) continue;

    const entitiesByFieldKey: Record<string, Record<string, unknown>> = {};
    for (const [entityId, entityData] of entityEntries) {
      entitiesByFieldKey[entityId] = toPlainObject(entityData);
    }
    result[fieldKey] = entitiesByFieldKey;
  }
  return result;
}

// ─── Component Shared / Templates ───

function convertComponentShared(rawShared: unknown): InternalComponentShared {
  if (!isRecord(rawShared)) return { componentType: UiComponentType.INVALID };

  const componentType: UiComponentType =
    typeof rawShared.componentType === "number" ? rawShared.componentType : UiComponentType.INVALID;

  const sharedData = asArray(rawShared.data);
  const hydrationDataSpecs =
    sharedData.length > 0 ? sharedData.map(convertHydrationDataSpec) : undefined;

  return {
    componentType,
    analyticsData: isRecord(rawShared.analyticsData)
      ? toPlainObject(rawShared.analyticsData)
      : undefined,
    hydrationDataSpecs,
    isComponentFiltered: isRecord(rawShared.isComponentFiltered)
      ? toPlainObject(rawShared.isComponentFiltered)
      : undefined,
  };
}

/**
 * Converts a decoded `UiComponentSchema` (the wire shape of both top-level
 * `templates` entries and inline `inline_component` values inside props)
 * into the internal {@link UiComponentTemplate} shape. Tolerates both the
 * raw bufbuild oneOf (`{ case, value }`) and the post-normalize form
 * (`{ kind, value }`) so it can be reused from the prop-builder pipeline.
 */
export function convertUiComponentTemplate(rawTemplate: unknown): UiComponentTemplate {
  const template = asRecordOrEmpty(rawTemplate);
  const templateKind = isRecord(template.kind) ? template.kind : undefined;
  const templateType = readOneOfDiscriminator(templateKind);

  if (!templateType) {
    return {
      schemaType: "unknown",
      props: {},
      shared: { componentType: UiComponentType.INVALID },
    };
  }

  const body = asRecordOrEmpty(templateKind?.value);
  return {
    schemaType: templateType,
    // Platform-specific `web_props` override generic `props` on duplicate keys
    // and may introduce new keys absent from the generic bag.
    props: { ...convertProps(body.props), ...convertProps(body.webProps) },
    shared: convertComponentShared(body.shared),
  };
}

function convertTemplates(templates: ProtoRecord): SduiApiResponse["templates"] {
  const result: SduiApiResponse["templates"] = {};
  for (const [templateKey, rawEntry] of Object.entries(templates)) {
    const entry = asRecordOrEmpty(rawEntry);
    result[templateKey] = {
      template: convertUiComponentTemplate(entry.template),
      robloxComponent: asString(entry.robloxComponent) ?? "",
    };
  }
  return result;
}

// ─── Page Entries ───

function convertPageEntry(rawEntry: unknown): SduiApiResponse["pageEntries"][number] {
  const entry = asRecordOrEmpty(rawEntry);
  const pageEntry = asRecordOrEmpty(entry.pageEntry);

  // We only support the surface-agnostic UniversalPageEntry shape, where the
  // `kind` oneof is nested under `input_data` (camelCase: `inputData`).
  const inputDataMessage = asRecordOrEmpty(entry.inputData);
  const inputDataKind = isRecord(inputDataMessage.kind) ? inputDataMessage.kind : undefined;

  let inputData: Record<string, unknown> = {};
  let inputDataType = "unknown";
  if (inputDataKind && typeof inputDataKind.case === "string") {
    inputDataType = inputDataKind.case;
    inputData = toPlainObject(inputDataKind.value);
  }

  return {
    pageEntry: {
      robloxComponent: asString(pageEntry.robloxComponent) ?? "",
      identifier: asString(pageEntry.identifier) ?? "",
      title: asNonEmptyString(pageEntry.title),
      category: asNonEmptyString(pageEntry.category),
    },
    inputData,
    inputDataType,
  };
}

/**
 * Plucks the top-level `localized_literals` map (server populates it as
 * `map<string, string>` on every template-backed SDUI response). Bufbuild
 * emits both binary and JSON paths as camelCase `localizedLiterals` and the
 * map keys are server-generated opaque strings, so they pass through
 * unchanged. Returns `undefined` for a missing or empty map so downstream
 * consumers can use a single `if (literals)` guard.
 */
function convertLocalizedLiterals(raw: unknown): Record<string, string> | undefined {
  if (!isRecord(raw) || Object.keys(raw).length === 0) return undefined;
  // Safe: `raw` reaches us after `fromBinary`/`fromJson` has already validated
  // the payload against the proto schema, where this field is declared as
  // `map<string, string>`. Re-checking every value here would be defensive
  // overhead on the response hot path.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return raw as Record<string, string>;
}

// ─── Entry point ───

/**
 * Converts a decoded protobuf message (from `fromBinary` or `fromJson`) into
 * the internal {@link SduiApiResponse} format used by the rest of the pipeline.
 *
 * Surface-specific extras (pagination cursors, totals, custom counters) are
 * *not* modeled on `SduiApiResponse`. They flow through the spread so they
 * survive the conversion verbatim (after generic oneOf/BigInt normalization),
 * and callers that need them statically can read via {@link SduiApiResponseAs}.
 */
export function convertDecodedMessage(message: ProtoRecord): SduiApiResponse {
  const {
    pageEntries: rawPageEntries,
    templates: rawTemplates,
    hydrationData: rawHydrationData,
    localizedLiterals: rawLiterals,
    ...rest
  } = message;

  return {
    ...asRecordOrEmpty(normalizeProtoValue(rest)),
    pageEntries: asArray(rawPageEntries).map(convertPageEntry),
    templates: convertTemplates(asRecordOrEmpty(rawTemplates)),
    hydrationData: convertHydrationContent(rawHydrationData),
    localizedLiterals: convertLocalizedLiterals(rawLiterals),
  };
}
