import { useEffect } from "react";
import { document as browserDocument, window as browserWindow } from "@rbx/core-lib/browser";

const UNREAD_PREFIX_REGEX = /^\(\d+\)\s*/;

const stripUnreadPrefix = (title: string) => title.replace(UNREAD_PREFIX_REGEX, "");

const isTitleNode = (node: Node | null) => node?.nodeName === "TITLE";

const touchesTitle = (record: MutationRecord) =>
  isTitleNode(record.target) ||
  isTitleNode(record.target.parentNode) ||
  Array.from(record.addedNodes).some(isTitleNode);

/**
 * Puts the unread chat count in front of the tab title, e.g. `(3) Roblox`, and removes it when the
 * count is 0 or chat unmounts. Next.js can change the title after chat mounts, so the count is added
 * again whenever the title changes.
 */
export const useUnreadTabTitle = (unreadCount: number): void => {
  useEffect(() => {
    if (browserDocument == null || browserWindow == null) {
      return undefined;
    }
    const doc = browserDocument;

    const applyPrefix = () => {
      const baseTitle = stripUnreadPrefix(doc.title);
      const title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
      // Writing the title triggers the observer, so skip writes that change nothing.
      if (doc.title !== title) {
        doc.title = title;
      }
    };

    applyPrefix();
    // Watch the whole document: Next.js can render <title> in <body> when it streams metadata.
    const observer = new browserWindow.MutationObserver(records => {
      if (records.some(touchesTitle)) {
        applyPrefix();
      }
    });
    observer.observe(doc.documentElement, { childList: true, characterData: true, subtree: true });

    return () => {
      observer.disconnect();
      doc.title = stripUnreadPrefix(doc.title);
    };
  }, [unreadCount]);
};
