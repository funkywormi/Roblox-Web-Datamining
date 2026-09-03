const VALID_HTML_ELEMENTS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div"] as const;
export type ValidHtmlElement = (typeof VALID_HTML_ELEMENTS)[number];

/**
 * Returns the value as a `ValidHtmlElement` if it is a known block/inline
 * element, otherwise falls back to the provided default (defaults to "span").
 */
export function toHtmlElement(
  value: string | undefined,
  fallback: ValidHtmlElement = "span",
): ValidHtmlElement {
  return value !== undefined && (VALID_HTML_ELEMENTS as readonly string[]).includes(value)
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- value is verified to be a member of VALID_HTML_ELEMENTS above
      (value as ValidHtmlElement)
    : fallback;
}
