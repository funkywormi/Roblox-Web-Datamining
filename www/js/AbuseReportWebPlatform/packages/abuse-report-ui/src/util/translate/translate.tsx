import React from "react";
import type { Intl } from "@rbx/core-scripts/legacy/Roblox";
import { translateHtml, type TranslateHtmlTag } from "@rbx/translation-utils";
import { translatePrimitive } from "./translatePrimitive";

export type LinkWrapperConfig = {
  type: "link";
  href: string;
  openInNewWindow?: boolean;
  rel?: string;
  className?: string;
};

export type StrongWrapperConfig = {
  type: "strong";
  className?: string;
};

export type WrapperConfig = LinkWrapperConfig | StrongWrapperConfig;

export type TranslateInput = {
  $translate: string;
  params?: Record<string, string | TranslateInput>;
  wrappers?: Record<string, WrapperConfig>;
};

export type TranslateInputOrString = TranslateInput | string;

/**
 * Merges additional params into a TranslateInput object.
 * If the input is a plain string, a warning is logged and it is returned unchanged.
 * Normally, we'd prefer to avoid this, and use the params in the config itself, but for
 * some dynamic values (such as character count) it doesn't make sense to live in the translation
 * file.
 *
 * NOTE: For plain-strings (e.g. not using translation system), params are ignored.
 *
 * @example
 * ```tsx
 * // Merge params into existing translation
 * mergeTranslationParams(
 *   { $translate: 'Label.CharacterCount' },
 *   { currentLength: '50', maxLength: '100' }
 * )
 * // Returns: { $translate: 'Label.CharacterCount', params: { currentLength: '50', maxLength: '100' } }
 *
 * // Merge params with existing params
 * mergeTranslationParams(
 *   { $translate: 'Label.Example', params: { existing: 'value' } },
 *   { newParam: 'newValue' }
 * )
 * // Returns: { $translate: 'Label.Example', params: { existing: 'value', newParam: 'newValue' } }
 * ```
 */
export const mergeTranslationParams = (
  input: TranslateInputOrString,
  params: Record<string, string>,
): TranslateInputOrString => {
  if (typeof input === "string") {
    console.warn(
      "mergeTranslationParams: Cannot merge params into a plain string. Use a TranslateInput object instead.",
    );
    return input;
  }

  return {
    ...input,
    params: {
      ...input.params,
      ...params,
    },
  };
};

/**
 * Builds a React element wrapper function from a WrapperConfig.
 */
const buildWrapperFn = (spec: WrapperConfig): ((content: React.ReactNode) => React.ReactNode) => {
  switch (spec.type) {
    case "link": {
      const { href, openInNewWindow, rel, className } = spec;
      // eslint-disable-next-line react/display-name
      return (content: React.ReactNode) => {
        if (openInNewWindow) {
          return (
            // eslint-disable-next-line react/jsx-no-target-blank
            <a href={href} target="_blank" rel={rel ?? "noopener noreferrer"} className={className}>
              {content}
            </a>
          );
        }
        return (
          <a href={href} rel={rel} className={className}>
            {content}
          </a>
        );
      };
    }
    case "strong": {
      const { className } = spec;
      // eslint-disable-next-line react/display-name
      return (content: React.ReactNode) => <strong className={className}>{content}</strong>;
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustive: never = spec;
      throw new Error(`Unknown wrapper type: ${(_exhaustive as WrapperConfig).type}`);
    }
  }
};

/**
 * Converts wrappers object to TranslateHtmlTag array.
 * Wrappers are expected to use "{wrapperName}Start" and "{wrapperName}End" keys in translations.
 */
const buildTranslateHtmlTags = (wrappers: Record<string, WrapperConfig>): TranslateHtmlTag[] => {
  return Object.entries(wrappers).map(([wrapperName, spec]) => ({
    opening: `${wrapperName}Start`,
    closing: `${wrapperName}End`,
    render: buildWrapperFn(spec),
  }));
};

/**
 * Recursively resolves params that may contain nested TranslateInput objects.
 * Nested $translate values are translated to plain strings before being passed
 * to the parent's interpolation.
 */
const resolveParams = (
  resourceMap: Record<string, string>,
  intl: Intl,
  params: Record<string, string | TranslateInput> | undefined,
): Record<string, string> | undefined => {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define -- mutual recursion: resolveParams <-> translateToStringOnly
      typeof value === "string" ? value : translateToStringOnly(resourceMap, intl, value),
    ]),
  );
};

/**
 * Main translate function that supports both simple string interpolation and rich content via wrappers.
 *
 * @example
 * ```tsx
 * // Simple translation
 * translate(resourceMap, intl, {
 *   $translate: 'My.Label',
 *   params: { username: 'My Name' }
 * })
 * // Returns: string
 *
 * // Translation with link wrapper
 * translate(resourceMap, intl, {
 *   $translate: 'My.Label',
 *   params: { username: 'My Name' },
 *   wrappers: {
 *     link: { type: 'link', href: 'https://example.com', openInNewWindow: true }
 *   }
 * })
 * // Returns: React.ReactNode[]
 * // Translation string should be: "Hello {username}, view {linkStart}details{linkEnd}."
 * ```
 */
export const translate = (
  resourceMap: Record<string, string>,
  intl: Intl,
  input: TranslateInputOrString,
): string | React.ReactNode[] => {
  // If input is a string, return it immediately
  if (typeof input === "string") {
    return input;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- extra check for bad input
  if (!input || !Object.hasOwn(input, "$translate")) {
    console.warn("translateToStringOnly: Unexpected input.", input);
    return "";
  }

  const { $translate: key, params, wrappers } = input;
  const resolved = resolveParams(resourceMap, intl, params);

  // If no wrappers, use simple translation
  if (!wrappers || Object.keys(wrappers).length === 0) {
    return translatePrimitive(resourceMap, intl, key, resolved);
  }

  const boundTranslate = (translateKey: string, translateParams?: Record<string, string>) =>
    translatePrimitive(resourceMap, intl, translateKey, translateParams);

  const tags = buildTranslateHtmlTags(wrappers);

  return translateHtml(boundTranslate, key, tags, resolved);
};

/**
 * Variant of translate that always returns a string, ignoring any wrappers.
 * Useful when you need a plain string output even if wrappers are specified.
 *

 * @example
 * ```tsx
 * // Simple translation
 * translateToStringOnly(resourceMap, intl, {
 *   $translate: 'My.Label',
 *   params: { username: 'My Name' }
 * })
 * // Returns: string
 *
 * // Translation with wrappers (wrappers are ignored)
 * translateToStringOnly(resourceMap, intl, {
 *   $translate: 'My.Label',
 *   params: { username: 'My Name' },
 *   wrappers: {
 *     link: { type: 'link', href: 'https://example.com' }
 *   }
 * })
 * // Returns: string (wrappers ignored, warning logged)
 * ```
 */
export const translateToStringOnly = (
  resourceMap: Record<string, string>,
  intl: Intl,
  input: TranslateInputOrString,
): string => {
  // If input is a string, return it immediately
  if (typeof input === "string") {
    return input;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- extra check for bad input
  if (!input || !Object.hasOwn(input, "$translate")) {
    console.warn("translateToStringOnly: Unexpected input.", input);
    return "";
  }

  const { $translate: key, params, wrappers } = input;
  const resolved = resolveParams(resourceMap, intl, params);

  // Warn if wrappers are provided but ignored
  if (wrappers && Object.keys(wrappers).length > 0) {
    console.warn(
      `translateToStringOnly: Wrappers provided for key '${key}' will be ignored. Use translate() if you need wrapper support.`,
    );
  }

  // Always use simple translation, ignoring wrappers
  return translatePrimitive(resourceMap, intl, key, resolved);
};
