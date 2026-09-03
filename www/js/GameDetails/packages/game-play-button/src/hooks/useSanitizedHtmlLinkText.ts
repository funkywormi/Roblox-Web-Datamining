import { useMemo } from "react";
import domPurify from "dompurify";

const DOM_PURIFY_CONFIG = { ADD_ATTR: ["target"] };

const forceLinksToOpenInNewTab = (node: Element): void => {
  if (node.nodeName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
};

const newTabDomPurify = domPurify();
newTabDomPurify.addHook("afterSanitizeAttributes", forceLinksToOpenInNewTab);

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

  return useMemo(() => {
    const sanitizer = shouldOpenLinksInNewTab ? newTabDomPurify : domPurify;

    return sanitizer.sanitize(html, DOM_PURIFY_CONFIG);
  }, [html, shouldOpenLinksInNewTab]);
};

export default useSanitizedHtmlLinkText;
