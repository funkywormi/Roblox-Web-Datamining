import { createElement, Fragment, type ReactNode } from "react";
import domPurify from "dompurify";
import { renderRobloxGlyphText } from "@rbx/sdui-common";

const DOM_PURIFY_CONFIG = {
  ALLOWED_TAGS: ["em", "i", "strong", "b", "u", "a", "br"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

const SANITIZE_TO_FRAGMENT_CONFIG = { ...DOM_PURIFY_CONFIG, RETURN_DOM_FRAGMENT: true } as const;

// `Node.*_NODE` values; the `Node` global doesn't exist during server rendering.
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const DOCUMENT_FRAGMENT_NODE = 11;

function isElement(node: Node): node is Element {
  return node.nodeType === ELEMENT_NODE;
}

/** Mirrors already-sanitized DOM as React elements, swapping Roblox glyphs in text nodes. */
function sanitizedNodeToReact(node: Node): ReactNode {
  if (node.nodeType === TEXT_NODE) {
    return renderRobloxGlyphText(node.textContent ?? "");
  }
  const children = Array.from(node.childNodes, sanitizedNodeToReact);
  if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
    return createElement(Fragment, null, ...children);
  }
  if (!isElement(node)) {
    return null;
  }
  const props = Object.fromEntries(Array.from(node.attributes, ({ name, value }) => [name, value]));
  return createElement(node.tagName.toLowerCase(), props, ...children);
}

/**
 * Sanitizes HTML and rebuilds it as React elements so Roblox glyphs can become icons.
 * When DOMPurify has no DOM (SSR), falls back to glyph substitution on the raw string.
 */
export function renderSanitizedRichText(html: string): ReactNode {
  if (!domPurify.isSupported) {
    return renderRobloxGlyphText(html);
  }
  return sanitizedNodeToReact(domPurify.sanitize(html, SANITIZE_TO_FRAGMENT_CONFIG));
}
