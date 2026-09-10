import { useEffect, useRef } from "react";

const UNREAD_PREFIX_REGEX = /^\(\d+\)\s*/;

/**
 * Reflects the global unread chat count in the browser tab title — e.g. `(3) Roblox` — and restores
 * the page's own title when the count returns to 0 or the chat unmounts. The base title is captured
 * once (with any stale unread prefix stripped) so re-renders never compound the prefix.
 */
export const useUnreadTabTitle = (unreadCount: number): void => {
  const baseTitleRef = useRef<string | null>(null);

  useEffect(() => {
    baseTitleRef.current ??= document.title.replace(UNREAD_PREFIX_REGEX, "");
    const baseTitle = baseTitleRef.current;
    document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;

    return () => {
      if (baseTitleRef.current !== null) {
        document.title = baseTitleRef.current;
      }
    };
  }, [unreadCount]);
};

export default useUnreadTabTitle;
