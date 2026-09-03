/**
 * Centralized discriminator strings for the post-`normalizeProtoValue` prop
 * `kind` oneOf. The proto wire is snake_case (`binding_path`); bufbuild + the
 * decoded-message normalizer leave us camelCase (`bindingPath`) at runtime.
 * Both are accepted everywhere so hand-built mocks and pre-normalize callers
 * keep working — see {@link isBindingPathKind}.
 */
export const PROP_KIND = {
  LITERAL: "literal",
  BINDING_PATH: "bindingPath",
  BINDING_PATH_SNAKE: "binding_path",
  TOKEN: "token",
  FORMAT: "format",
  CONDITIONAL: "conditional",
  TRANSLATION: "translation",
  ARRAY_MAP: "arrayMap",
  ARRAY_MAP_SNAKE: "array_map",
} as const;

export type PropKind = (typeof PROP_KIND)[keyof typeof PROP_KIND];

/** True for either the camelCase or snake_case binding-path discriminator. */
export function isBindingPathKind(kind: string): boolean {
  return kind === PROP_KIND.BINDING_PATH || kind === PROP_KIND.BINDING_PATH_SNAKE;
}

// ─── Envelope variants ───
//
// `{ kind, value }` shape every prop resolves to after `unwrapOneOf`.

export type PropValueLiteral<T> = { kind: typeof PROP_KIND.LITERAL; value: T };
export type PropValueBindingPath = {
  kind: typeof PROP_KIND.BINDING_PATH;
  value: string;
};
export type PropValueToken = { kind: typeof PROP_KIND.TOKEN; value: string };
export type PropValueFormat = {
  kind: typeof PROP_KIND.FORMAT;
  value: Record<string, unknown>;
};
export type PropValueConditional = {
  kind: typeof PROP_KIND.CONDITIONAL;
  value: Record<string, unknown>;
};
export type PropValueTranslation = {
  kind: typeof PROP_KIND.TRANSLATION;
  value: Record<string, unknown>;
};

/** Post-`unwrapOneOf` discriminated union for a single prop's value. */
export type PropValue<T> =
  | PropValueLiteral<T>
  | PropValueBindingPath
  | PropValueToken
  | PropValueFormat
  | PropValueConditional
  | PropValueTranslation;
