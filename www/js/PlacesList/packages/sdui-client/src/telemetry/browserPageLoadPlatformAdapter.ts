import type { SduiPageLoadPlatformAdapter } from "@rbx/sdui-core";

export const browserPageLoadPlatformAdapter: SduiPageLoadPlatformAdapter = {
  isPageHidden() {
    return document.visibilityState === "hidden";
  },

  observePageHidden(onHidden) {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        onHidden();
      }
    };

    window.addEventListener("pagehide", onHidden);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", onHidden);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  },

  scheduleFallback(callback, delayMs) {
    const timeoutId = window.setTimeout(callback, delayMs);
    return () => {
      window.clearTimeout(timeoutId);
    };
  },
};
