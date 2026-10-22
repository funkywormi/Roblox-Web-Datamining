import React, { Fragment } from "react";

/**
 * Plain translation function with optional string interpolation.
 * This matches the signature returned by `useTranslation().translate` from core-scripts.
 */
export type TranslateFn = (key: string, params?: Record<string, string>) => string;

/**
 * Describes a pair of opening/closing placeholders in a translation string
 * and how the content between them should be wrapped. This is very close to
 * the format used by `@rbx/intl`'s `translateHTML` (though we don't use that package
 * in web-frontend at the time of writing).
 *
 * One difference is that what we call "render" is what `@rbx/intl` calls "content".
 * We use `render` to avoid triggering ESLint rules complaining about defining components inline
 * (render is a magic word).
 *
 * @example
 * Translation string: "Please agree to our {linkStart}Terms of Service{linkEnd}."
 * Tag: { opening: "linkStart", closing: "linkEnd", render: (c) => <a href="/tos">{c}</a> }
 */
export type TranslateHtmlTag = {
  opening: string;
  closing: string;
  render: (children: React.ReactNode) => React.ReactNode;
};

const FN_START_MARK = "__FN_nvfToKPAOuiV__";
const FN_END_MARK = "__FN_END_nvfToKPAOuiV__";

const FN_START = (key: string) => `${FN_START_MARK}${key}|`;
const FN_END = (key: string) => `${FN_END_MARK}${key}|`;

const FN_START_REGEXP = new RegExp(`${FN_START_MARK}(\\d+)\\|`);

/**
 * Translates a key and injects React elements into the result, avoiding
 * `dangerouslySetInnerHTML`. Works by:
 *
 * 1. Replacing tag opening/closing placeholders with magic strings
 * 2. Calling the base `translate` function to get an intermediate string
 * 3. Recursively splitting the string on those magic strings
 * 4. Replacing segments with React elements via the tag `render` functions
 *
 * @example
 * ```tsx
 * // Given a translation string like:
 * // "Description.TermsOfService" → "By signing up you agree to our {linkStart}Terms of Service{linkEnd}, {username}."
 * // We can translate it with a link to the Terms of Service
 * translateHtml(
 *   translate,
 *   "Description.TermsOfService",
 *   [{ opening: "linkStart", closing: "linkEnd", render: (c) => <a href="/tos">{c}</a> }],
 *   { username: "Jane" },
 * );
 * ```
 */
const translateHtml = (
  /** The base translation function to use. Normally `useTranslation().translate` */
  translate: TranslateFn,
  /** The translation key to use */
  key: string,
  /** HTML tags to wrap the translation string with. @see TranslateHtmlTag */
  tags?: TranslateHtmlTag[] | null,
  /** Plain string parameters to use. What you'd normally pass to `translate` as the second argument. */
  args?: Record<string, string>,
): React.ReactNode[] => {
  const plainParams: Record<string, string> = { ...args };
  const reactSegments: Record<
    string,
    {
      start: string;
      end: string;
      used: boolean;
      render: (children: React.ReactNode) => React.ReactNode;
    }
  > = {};

  tags?.forEach((tag, index) => {
    const reactKey = index.toString();
    const startMarker = FN_START(reactKey);
    const endMarker = FN_END(reactKey);
    plainParams[tag.opening] = startMarker;
    plainParams[tag.closing] = endMarker;
    reactSegments[reactKey] = {
      start: startMarker,
      end: endMarker,
      render: tag.render,
      used: false,
    };
  });

  const intermediateTranslation = translate(key, plainParams);

  const generateTree = (translation: string) => {
    const parts: React.ReactNode[] = [];

    const reactSegmentStartMatch = FN_START_REGEXP.exec(translation);
    if (!reactSegmentStartMatch) {
      return [translation];
    }

    if (reactSegmentStartMatch.index > 0) {
      parts.push(translation.slice(0, reactSegmentStartMatch.index));
    }

    const reactInfo = reactSegmentStartMatch[1] && reactSegments[reactSegmentStartMatch[1]];

    if (!reactInfo) {
      console.warn("Unexpected malformed segment", key);
      return [];
    }
    reactInfo.used = true;

    const endIndex = translation.indexOf(reactInfo.end);

    if (endIndex === -1) {
      console.warn("Unexpected malformed segment", key);
      return [];
    }

    const subString = translation.slice(
      reactSegmentStartMatch.index + reactSegmentStartMatch[0].length,
      endIndex,
    );
    const subStringResult = reactInfo.render(generateTree(subString));

    if (Array.isArray(subStringResult)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- render() returns ReactNode which may be ReactNode[]
      parts.push(...subStringResult);
    } else {
      parts.push(subStringResult);
    }

    const endSegment = translation.slice(endIndex + reactInfo.end.length);
    if (endSegment.length > 0) {
      parts.push(...generateTree(endSegment));
    }

    return parts;
  };

  const result = generateTree(intermediateTranslation).filter(part => part !== "");

  const hasUnusedSegments = Object.values(reactSegments).some(reactInfo => !reactInfo.used);
  if (hasUnusedSegments) {
    console.warn("Unused segments found", key);
    return [];
  }

  // eslint-disable-next-line react/no-array-index-key -- static translation segments won't reorder
  return result.map((node, index) => <Fragment key={index}>{node}</Fragment>);
};

export default translateHtml;
