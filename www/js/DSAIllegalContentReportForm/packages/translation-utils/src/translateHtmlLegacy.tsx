import React from "react";
import translateHtml, { type TranslateFn, type TranslateHtmlTag } from "./translateHtml";

/**
 * Legacy tuple-based parameter format.
 *
 * - 3-element tuple: `[startKey, endKey, contentFn]` -- wraps content between placeholders
 * - 2-element tuple: `[key, stringValue]` -- plain string substitution
 *
 * @deprecated Prefer `translateHtml` with explicit `tags` and `args` parameters.
 */
export type TranslateHtmlParams = (
  | [startKey: string, endKey: string, content: (content: React.ReactNode) => React.ReactNode]
  | [key: string, content: string]
)[];

/**
 * Adapter that accepts the legacy tuple-based format and delegates to `translateHtml`.
 *
 * Use this to migrate existing call sites without rewriting them. For new code,
 * prefer `translateHtml` directly.
 *
 * @deprecated Prefer `translateHtml` with explicit `tags` and `args` parameters.
 */
const translateHtmlLegacy = (
  translate: TranslateFn,
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- accepting the deprecated type for backward compat
  params: TranslateHtmlParams,
): React.ReactNode[] => {
  const tags: TranslateHtmlTag[] = [];
  const args: Record<string, string> = {};

  params.forEach(param => {
    if (param.length === 3) {
      const [opening, closing, render] = param;
      tags.push({ opening, closing, render });
    } else {
      const [paramKey, value] = param;
      args[paramKey] = value;
    }
  });

  return translateHtml(
    translate,
    key,
    tags.length > 0 ? tags : null,
    Object.keys(args).length > 0 ? args : undefined,
  );
};

// eslint-disable-next-line @typescript-eslint/no-deprecated -- exporting the deprecated function
export default translateHtmlLegacy;
