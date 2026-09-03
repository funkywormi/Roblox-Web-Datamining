/**
 * Returns the iOS/iPadOS major version from the user agent, or null when the
 * UA is not iPhone/iPad. Covers Safari, in-app browsers, and Roblox Hybrid
 * (`iPhone OS 17_0` / iPad `CPU OS 17_0`). Does not use the Safari `Version/`
 * token, which Hybrid UAs omit.
 */
export const getIosMajorVersion = (): number | null => {
  const match = /(?:iPhone OS|CPU OS) (\d+)[._]/.exec(navigator.userAgent);
  if (match?.[1] == null) {
    return null;
  }

  const major = Number.parseInt(match[1], 10);
  return Number.isNaN(major) ? null : major;
};
