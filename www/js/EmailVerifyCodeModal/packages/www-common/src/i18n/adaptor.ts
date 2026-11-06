import type { ReactNode } from "react";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import type { Messages, RichTagsFunction, _Translator as UseIntlTranslator } from "use-intl";
import { renderHtml, type HtmlTag } from "./html";
import {
  type FromColonToPeriodDelimited,
  type FromPeriodToColonDelimited,
  fromPeriodToColonDelimited,
  toFullKeyPath,
} from "./util";
import type { Namespace } from "./types";
import { trackError, type ErrorName } from "../observability";
import { getInternalPageName } from "../utils/getInternalPageName";

type TranslationKey<N extends Namespace> = FromColonToPeriodDelimited<
  keyof Messages[FromPeriodToColonDelimited<N>] & string
>;

type TranslationValues = Record<string, string | number | Date>;

type Translate<N extends Namespace> = (
  key: TranslationKey<N>,
  values?: TranslationValues,
  /** Returned when `key` is absent from the messages loaded at runtime. */
  fallback?: string,
) => string;

type TranslateRich<N extends Namespace> = (
  key: TranslationKey<N>,
  values?: Record<string, string | number | Date | RichTagsFunction>,
) => ReactNode;

/**
 * Whether the key resolves, for call sites that used the legacy `translate` fallback argument.
 * Accepts a runtime string so a server-supplied key can be checked, and narrows it when it does.
 */
type Has<N extends Namespace> = (key: string) => key is TranslationKey<N>;

/**
 * Looks up a key that only exists at runtime. Returns the translation when the key resolves, and
 * `fallback` (or `""`) when it does not, without the missing-key console error from `translate`.
 */
type TranslateDynamic = (key: string, values?: TranslationValues, fallback?: string) => string;

/**
 * Renders a legacy `{tagStart}...{tagEnd}` string. `key` may be a catalogue key or a runtime
 * string. A missing key or malformed segment is tracked and renders nothing.
 */
type TranslateHtml<N extends Namespace> = (
  key: TranslationKey<N> | (string & {}),
  tags: readonly HtmlTag[],
  values?: Record<string, string | number | Date>,
) => ReactNode;

/**
 * Renders a legacy `{tagStart}...{tagEnd}` string for a full `Namespace.Key`. A missing key or
 * malformed segment is tracked and renders nothing.
 */
type TranslateFullKeyHtml = (
  key: string,
  tags: readonly HtmlTag[],
  values?: Record<string, string | number | Date>,
) => ReactNode;

/**
 * Translates a full `Namespace.Key` string (the namespace is the first two segments). The third
 * argument is returned when the key is missing; when it is omitted, the result is `""`.
 */
export type FullKeyTranslator = ((
  key: string,
  values?: TranslationValues,
  fallback?: string,
) => string) & {
  html: TranslateFullKeyHtml;
};

export type FullKeyTranslations = {
  translateFullKey: FullKeyTranslator;
};

export type Translator<N extends Namespace> = Translate<N> & {
  rich: TranslateRich<N>;
  has: Has<N>;
  dynamic: TranslateDynamic;
  html: TranslateHtml<N>;
};

/**
 * The colon-delimited keys we hand back to use-intl no longer match the period-delimited key type
 * the caller sees, so widen the underlying translator once here rather than asserting per call.
 */
type UntypedTranslator = {
  (key: string, values?: Record<string, unknown>): string;
  rich: (key: string, values?: Record<string, unknown>) => ReactNode;
  has: (key: string) => boolean;
};

const isUsableKey = (key: unknown): key is string => typeof key === "string" && key.length > 0;

const trackTranslationError = (error: ErrorName, namespace: string, key: string) => {
  // The publisher is the browser counter. Server renders of getTranslations must not send it.
  if (typeof window === "undefined") {
    return;
  }
  trackError(error, {
    key,
    namespace,
    internalPageName: getInternalPageName() ?? "unknown",
  });
};

export const adaptTranslator = <N extends Namespace>(
  translator: UseIntlTranslator<Messages, FromPeriodToColonDelimited<N>>,
  namespace: N,
): Translator<N> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const untyped = translator as unknown as UntypedTranslator;

  const translate: Translate<N> = (key, values, fallback) => {
    const translatedKey = fromPeriodToColonDelimited(key);
    if (fallback !== undefined && !untyped.has(translatedKey)) {
      trackTranslationError("TranslationKeyNotFound", namespace, translatedKey);
      return fallback;
    }
    return untyped(translatedKey, values);
  };

  const rich: TranslateRich<N> = (key, values) =>
    untyped.rich(fromPeriodToColonDelimited(key), values);

  const has: Has<N> = (key): key is TranslationKey<N> =>
    isUsableKey(key) && untyped.has(fromPeriodToColonDelimited(key));

  const dynamic: TranslateDynamic = (key, values, fallback = "") => {
    if (!isUsableKey(key)) {
      trackTranslationError("TranslationKeyNotFound", namespace, String(key));
      return fallback;
    }

    const translatedKey = fromPeriodToColonDelimited(key);
    const isAvailable = untyped.has(translatedKey);
    if (!isAvailable) {
      trackTranslationError("TranslationKeyNotFound", namespace, translatedKey);
    }
    return isAvailable ? untyped(translatedKey, values) : fallback;
  };

  const html: TranslateHtml<N> = (key, tags, values) => {
    if (!isUsableKey(key)) {
      trackTranslationError("TranslationKeyNotFound", namespace, String(key));
      return null;
    }

    const translatedKey = fromPeriodToColonDelimited(key);
    if (!untyped.has(translatedKey)) {
      trackTranslationError("TranslationKeyNotFound", namespace, translatedKey);
      return null;
    }
    const result = renderHtml(interpolated => untyped(translatedKey, interpolated), tags, values);
    if (result == null) {
      trackTranslationError("TranslationMalformed", namespace, translatedKey);
    }
    return result;
  };

  return Object.assign(translate, { rich, has, dynamic, html });
};

/**
 * Adapts an un-namespaced `use-intl` translator to full `Namespace.Key` strings.
 * The argument is widened once: colon-delimited lookup paths are not part of the caller's key type.
 */
export const adaptFullKeyTranslator = (translator: unknown): FullKeyTranslator => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const untyped = translator as UntypedTranslator;

  const translateFullKey = (fullKey: string, values?: TranslationValues, fallback = "") => {
    if (!isUsableKey(fullKey)) {
      trackTranslationError("TranslationKeyNotFound", "unknown", String(fullKey));
      return fallback;
    }

    const resolved = toFullKeyPath(fullKey);
    if (!resolved) {
      trackTranslationError("TranslationKeyNotFound", fullKey, fullKey);
      return fallback;
    }

    if (!untyped.has(resolved.path)) {
      trackTranslationError("TranslationKeyNotFound", resolved.namespace, resolved.key);
      return fallback;
    }

    return untyped(resolved.path, values);
  };

  const html: TranslateFullKeyHtml = (fullKey, tags, values) => {
    if (!isUsableKey(fullKey)) {
      trackTranslationError("TranslationKeyNotFound", "unknown", String(fullKey));
      return null;
    }

    const resolved = toFullKeyPath(fullKey);
    if (!resolved) {
      trackTranslationError("TranslationKeyNotFound", fullKey, fullKey);
      return null;
    }

    if (!untyped.has(resolved.path)) {
      trackTranslationError("TranslationKeyNotFound", resolved.namespace, resolved.key);
      return null;
    }

    const result = renderHtml(interpolated => untyped(resolved.path, interpolated), tags, values);
    if (result == null) {
      trackTranslationError("TranslationMalformed", resolved.namespace, resolved.key);
    }
    return result;
  };

  return Object.assign(translateFullKey, { html });
};
