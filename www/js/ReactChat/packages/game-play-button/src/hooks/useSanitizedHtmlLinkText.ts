import { useMemo } from "react";
import { isSupported, sanitize } from "isomorphic-dompurify";

const DOM_PURIFY_CONFIG = { ADD_ATTR: ["target"] };

const SANITIZE_TO_FRAGMENT_CONFIG = {
  ...DOM_PURIFY_CONFIG,
  RETURN_DOM_FRAGMENT: true,
} as const;

const openAnchorInNewTab = (anchor: Element): void => {
  anchor.setAttribute("target", "_blank");
  anchor.setAttribute("rel", "noopener noreferrer");
};

/**
 * When DOMPurify has no usable DOM, RETURN_DOM_FRAGMENT is ignored and sanitize
 * returns a string — fall back to the string path. Otherwise mutate a fragment
 * so new-tab attributes stay off the default sanitize path.
 */
const sanitizeHtmlLinkText = (html: string, shouldOpenLinksInNewTab: boolean): string => {
  if (!shouldOpenLinksInNewTab || !isSupported) {
    return sanitize(html, DOM_PURIFY_CONFIG);
  }

  const fragment = sanitize(html, SANITIZE_TO_FRAGMENT_CONFIG);
  if (typeof fragment === "string") {
    return fragment;
  }

  fragment.querySelectorAll("a").forEach(openAnchorInNewTab);
  const container = fragment.ownerDocument.createElement("div");
  container.appendChild(fragment);
  return container.innerHTML;
};

type TUseSanitizedHtmlLinkTextOptions = {
  // Overrides any BE-sent target so every link opens in a new tab
  shouldOpenLinksInNewTab?: boolean;
};

/**
 * Sanitize HTML link text to prevent XSS attacks.
 *
 * Used for BE-driven HTML link text that must be sanitized before rendering in the UI.
 */
const useSanitizedHtmlLinkText = (
  html: string,
  options: TUseSanitizedHtmlLinkTextOptions = {},
): string => {
  const { shouldOpenLinksInNewTab } = options;

  return useMemo(
    () => sanitizeHtmlLinkText(html, shouldOpenLinksInNewTab ?? false),
    [html, shouldOpenLinksInNewTab],
  );
};

export default useSanitizedHtmlLinkText;
