export type DeviceInfo = {
  /** "computer" | "phone" | "tablet" | "console" */
  deviceType?: string | null;
  /** "chrome" | "edge" | "firefox" | "safari" */
  browser?: string | null;
};

// Browser is absent from both DOM device sources, so callers derive it from `navigator.userAgent`.
// Mobile browsers on iOS all carry `Safari/`, and Edge on Android carries `Chrome/`, so the
// vendor-specific tokens (FxiOS/CriOS/EdgiOS/EdgA) must be matched before the generic ones.
export const browserFromUserAgent = (userAgent: string): string | null => {
  if (/Firefox\/|FxiOS\//i.test(userAgent)) {
    return "firefox";
  }
  if (/Edg(?:e|A|iOS)?\//i.test(userAgent)) {
    return "edge";
  }
  if (/Chrome\/|CriOS\//i.test(userAgent)) {
    return "chrome";
  }
  if (/Safari\//i.test(userAgent)) {
    return "safari";
  }
  return null;
};
