/**
 * Renders the server's intentionally small legal-copy markup — `<a href>` anchors inside otherwise
 * plain text — without injecting raw HTML. An href that is not http(s) degrades to its label as
 * plain text. Returns the nodes rather than an element, so the caller owns the surrounding element
 * and its typography.
 */

import type { ReactNode } from "react";
import { Link } from "@rbx/foundation-ui";

const ANCHOR = /<a\s+href=(?:"([^"]*)"|'([^']*)')\s*>(.*?)<\/a>/gi;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function decodeEntities(value: string): string {
  if (typeof document === "undefined") {
    return value;
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

export function renderAnchoredCopy(text: string): ReactNode[] {
  const content: ReactNode[] = [];
  let index = 0;
  let lastIndex = 0;

  for (const match of text.matchAll(ANCHOR)) {
    const [anchor] = match;
    const start = match.index;
    if (start > lastIndex) {
      content.push(decodeEntities(text.slice(lastIndex, start)));
    }

    const href = match.at(1) ?? match.at(2) ?? "";
    const linkLabel = decodeEntities(match.at(3) ?? "");
    content.push(
      isHttpUrl(href) ? (
        <Link
          key={`link-${index}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          variant="Inline"
          underline="always"
          isExternal={false}
        >
          {linkLabel}
        </Link>
      ) : (
        <span key={`text-${index}`}>{linkLabel}</span>
      ),
    );
    index += 1;
    lastIndex = start + anchor.length;
  }

  if (lastIndex < text.length) {
    content.push(decodeEntities(text.slice(lastIndex)));
  }

  return content;
}
