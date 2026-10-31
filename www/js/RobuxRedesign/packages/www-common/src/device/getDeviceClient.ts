import { document, navigator } from "@rbx/core-lib/browser";
import { DeviceMeta } from "./types";
import { browserFromUserAgent, defaultDeviceMeta } from "./utils";

/**
 * Reads device meta from `<meta name="device-meta">` tag that is available on NextJS and .NET apps.
 */
export const getDeviceClient = (): DeviceMeta => {
  if (document == null) {
    return defaultDeviceMeta;
  }

  const metaTag = document.querySelector<HTMLMetaElement>('meta[name="device-meta"]');
  if (metaTag != null) {
    const parsed = DeviceMeta.safeParse(metaTag.dataset);

    if (parsed.success) {
      return {
        ...parsed.data,
        browser:
          parsed.data.browser === "unknown"
            ? browserFromUserAgent(navigator?.userAgent ?? "")
            : parsed.data.browser,
      };
    }
  }

  return defaultDeviceMeta;
};

/** Drop-in name for `@rbx/core-scripts/meta/device`'s `getDeviceMeta`. */
export const getDeviceMeta = getDeviceClient;
