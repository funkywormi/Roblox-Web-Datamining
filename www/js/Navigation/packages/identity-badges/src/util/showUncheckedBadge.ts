import { document } from "@rbx/core-lib/browser";

export const showUncheckedBadge = (): boolean => {
  const dataset = document?.querySelector<HTMLMetaElement>(
    'meta[name="show-unchecked-badge"]',
  )?.dataset;
  return dataset?.show === "True";
};
