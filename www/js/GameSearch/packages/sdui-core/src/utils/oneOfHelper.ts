import { isRecord } from "./typeGuards";

/**
 * Read-side contract for the post-conversion oneOf shape.
 *
 * `normalizeProtoValue` (in `proto/convertDecodedMessage.ts`) renames bufbuild's
 * `{ case, value }` oneOf encoding to `{ kind, value }`. A prop definition
 * wraps that oneOf under a parent `kind` key, giving
 * `{ kind: { kind, value }, …siblings }`.
 *
 * `isOneOf` and `unwrapOneOf` are the canonical readers for that contract.
 * Every prop builder uses `unwrapOneOf` (or receives the unwrapped tuple from
 * the dispatcher) so no builder ever needs to inspect bufbuild's `case`
 * discriminator or guess at shape.
 *
 * Lives under `binding/` because every consumer is in the binding pipeline;
 * the proto layer owns the *write* side of this contract via its private
 * `OneOfRaw` shape.
 */

export interface OneOf {
  kind: string;
  value: unknown;
}

export function isOneOf(value: unknown): value is OneOf {
  if (!isRecord(value)) return false;
  return typeof value.kind === "string" && "value" in value;
}

export interface UnwrappedProp {
  propType: string;
  propValue: unknown;
}

/**
 * Reads the `kind` wrapper on a prop definition and returns the
 * `(propType, propValue)` tuple. Returns `undefined` if the input does not
 * carry a recognizable oneOf wrapper, leaving the caller to decide the
 * fallback (typically failing the prop with an error).
 */
export function unwrapOneOf(rawProp: unknown): UnwrappedProp | undefined {
  if (!isRecord(rawProp)) return undefined;
  const wrapper = rawProp.kind;
  if (!isOneOf(wrapper)) return undefined;
  return { propType: wrapper.kind, propValue: wrapper.value };
}

/**
 * Some proto messages wrap a prop in `oneof oneof_prop { ... }` purely as a
 * type discriminator (e.g. `IconSizeProp`, `ShareLinkPayload`,
 * `TabItemIconOrString`). Bufbuild emits the discriminator at the camelCase
 * field `oneofProp` carrying `{ case, value }`; `normalizeProtoValue` renames
 * `case` → `kind`, leaving `oneofProp: { kind, value }` on the parent record.
 *
 * The dispatcher uses this reader to detect the wrapper and recurse into the
 * inner prop, which is itself a complete prop message with its own
 * `$typeName` and outer `kind` oneOf. Mirrors lua's `propDefinition.oneof_prop`
 * handling in `SduiClientBindingBuilder.buildProp`.
 *
 * Returns `undefined` when no wrapper is present so the caller can fall
 * through to the normal descriptor dispatch.
 */
export function unwrapOneofPropWrapper(rawProp: unknown): unknown {
  if (!isRecord(rawProp)) return undefined;
  const wrapper = rawProp.oneofProp;
  if (!isOneOf(wrapper)) return undefined;
  return wrapper.value;
}
