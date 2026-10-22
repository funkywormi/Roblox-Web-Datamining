import { Fragment, type ReactNode } from "react";

/**
 * A `{opening}...{closing}` pair in a legacy translation string, and how to wrap the text between
 * them. The string stays in the localization service as placeholders such as `{itemBoldStart}`;
 * this is the `next-intl` stand-in for `translateHtml` until those strings use rich tags.
 */
export type HtmlTag = {
  opening: string;
  closing: string;
  render: (children: ReactNode) => ReactNode;
};

const START_MARK = "__FN_nvfToKPAOuiV__";
const END_MARK = "__FN_END_nvfToKPAOuiV__";
const START = (key: string) => `${START_MARK}${key}|`;
const END = (key: string) => `${END_MARK}${key}|`;
const START_PATTERN = new RegExp(`${START_MARK}(\\d+)\\|`);
const END_PATTERN = new RegExp(`${END_MARK}(\\d+)\\|`);

/**
 * Interpolates `values`, then replaces each tag's placeholders with `render`. Returns `null`
 * when a segment is malformed, so the caller can track the failure without displaying raw
 * placeholders or a partial message. Tags whose placeholders are both absent are ignored.
 */
export const renderHtml = (
  translate: (values: Record<string, string | number | Date>) => string,
  tags: readonly HtmlTag[],
  values?: Record<string, string | number | Date>,
): ReactNode => {
  const plainValues: Record<string, string | number | Date> = { ...values };
  const segments: Record<string, { start: string; end: string; render: HtmlTag["render"] }> = {};

  tags.forEach((tag, index) => {
    const reactKey = index.toString();
    const start = START(reactKey);
    const end = END(reactKey);
    plainValues[tag.opening] = start;
    plainValues[tag.closing] = end;
    segments[reactKey] = { start, end, render: tag.render };
  });

  const generateTree = (translation: string): ReactNode[] | null => {
    const parts: ReactNode[] = [];
    const startMatch = START_PATTERN.exec(translation);
    const endMatch = END_PATTERN.exec(translation);
    if (endMatch && (!startMatch || endMatch.index < startMatch.index)) {
      return null;
    }
    if (!startMatch) {
      return [translation];
    }

    if (startMatch.index > 0) {
      parts.push(translation.slice(0, startMatch.index));
    }

    const segment = startMatch[1] == null ? undefined : segments[startMatch[1]];
    if (segment == null) {
      return null;
    }

    const endIndex = translation.indexOf(segment.end);
    if (endIndex < startMatch.index + startMatch[0].length) {
      return null;
    }

    const inner = translation.slice(startMatch.index + startMatch[0].length, endIndex);
    const children = generateTree(inner);
    if (children == null) {
      return null;
    }
    parts.push(segment.render(children));

    const rest = translation.slice(endIndex + segment.end.length);
    if (rest.length > 0) {
      const remaining = generateTree(rest);
      if (remaining == null) {
        return null;
      }
      parts.push(...remaining);
    }
    return parts;
  };

  const result = generateTree(translate(plainValues));
  if (result == null) {
    return null;
  }

  return result
    .filter(part => part !== "")
    .map((node, index) => (
      // Static translation segments do not reorder.
      // eslint-disable-next-line react/no-array-index-key
      <Fragment key={index}>{node}</Fragment>
    ));
};
