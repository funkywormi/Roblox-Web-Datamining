"use client";

import { useEffect } from "react";

const scrollToTop = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

/**
 * Disables the browser's automatic scroll restoration for the lifetime of the
 * caller, and scrolls the window to the top. Update `resetKey` to scroll to top
 * again. For example, when a route param changes.
 */
export const useManualScrollRestore = (resetKey?: unknown): void => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("scrollRestoration" in window.history)) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [resetKey]);
};

export default useManualScrollRestore;
