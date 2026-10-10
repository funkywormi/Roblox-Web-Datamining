import { getBrowserEnvironment } from "@rbx/core-lib/browser";

export const showUncheckedBadge = (): boolean => {
  const browser = getBrowserEnvironment();
  if (browser === undefined) {
    return false;
  }

  const dataset = browser.document.querySelector<HTMLMetaElement>(
    'meta[name="show-unchecked-badge"]',
  )?.dataset;
  return dataset?.show === "True";
};
