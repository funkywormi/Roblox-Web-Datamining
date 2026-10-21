import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type { BindingContext, SduiDataBinder, TranslationRef } from "../types";

import { LOCALIZED_LITERALS_CONTENT_TYPE } from "./stores";

/**
 * Resolves a `TranslationRef` to its server-translated string by reading
 * `mapKey` from the localized-literals store on the data binder.
 *
 * Lookup is by `mapKey` only — the server is the sole writer of `map_key`,
 * so there is no client-side `namespace + key` hashing.
 *
 * Returns `undefined` and reports `FailedToResolveLocalizedLiteral` when the
 * ref is malformed (missing/non-string `mapKey`) or the store has no value
 * for that key.
 */
export function resolveLocalizedLiteral(
  ref: Partial<TranslationRef> | undefined,
  dataBinder: SduiDataBinder,
  ctx?: BindingContext,
): string | undefined {
  if (
    !ref ||
    typeof ref !== "object" ||
    typeof ref.mapKey !== "string" ||
    ref.mapKey.length === 0
  ) {
    reportError(
      SduiErrorName.FailedToResolveLocalizedLiteral,
      `Invalid translationRef: expected object with mapKey, got ${typeof ref}`,
      ctx?.pageContext,
      { componentType: ctx?.componentType, propName: ctx?.propName },
      ctx?.errorReporter,
    );
    return undefined;
  }

  const { mapKey, namespace, key } = ref;
  const { value: literal } = dataBinder.getField(LOCALIZED_LITERALS_CONTENT_TYPE, [mapKey], "");

  if (typeof literal !== "string") {
    reportError(
      SduiErrorName.FailedToResolveLocalizedLiteral,
      `Could not find localized literal for mapKey: ${mapKey}, namespace: ${namespace ?? "?"}, key: ${key ?? "?"}`,
      ctx?.pageContext,
      { componentType: ctx?.componentType, propName: ctx?.propName },
      ctx?.errorReporter,
    );
    return undefined;
  }

  return literal;
}
