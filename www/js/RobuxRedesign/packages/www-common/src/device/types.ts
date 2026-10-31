import * as z from "zod/mini";

export const OperatingSystem = [
  "ios",
  "android",
  "osx",
  "windows",
  "windowsPhone",
  "xboxOne",
  "xboxOneSTx",
  "playStation",
  "chromeOS",
  "unknown",
] as const;
export type OperatingSystem = (typeof OperatingSystem)[number];

export const AppType = [
  "android",
  "ios",
  "xbox",
  "uwp",
  "amazon",
  "win32",
  "universalApp",
  "unknown",
] as const;
export type AppType = (typeof AppType)[number];

export const DeviceType = ["computer", "tablet", "phone", "console", "vr", "unknown"] as const;
export type DeviceType = (typeof DeviceType)[number];

export const Browser = ["chrome", "edge", "firefox", "safari", "unknown"] as const;
export type Browser = (typeof Browser)[number];

// `<meta name="device-meta">` dataset values are the strings "true" and "false".
// Sidecar JSON uses booleans. Anything else falls back to false.
const optionalBooleanString = z.catch(
  z.union([z.boolean(), z.stringbool({ truthy: ["true"], falsy: ["false"] })]),
  false,
);

const enumFromAnyCase = <const T extends readonly [string, ...string[]]>(
  values: T,
  fallback: T[number],
) => {
  const canonical = new Map(values.map(value => [value.toLowerCase(), value]));
  // Catch the string, not the transform. `z.transform` reports its output as
  // `Awaited<T[number]>`, and a generic `T[number]` is not assignable to that.
  return z.pipe(
    z.catch(z.string().check(z.toLowerCase()), fallback.toLowerCase()),
    z.transform<string, T[number]>(value => canonical.get(value) ?? fallback),
  );
};

// `dataset` and sidecar JSON spell these differently from core-scripts.
// Copy them onto the canonical keys before field parsing, so a missing
// canonical key is not caught as `false` first. An existing canonical key wins.
const deviceMetaKeyAliases = {
  isUwpApp: "isUWPApp",
  isPcgdkApp: "isPcGdkApp",
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value != null && !Array.isArray(value);

const aliasDeviceMetaKeys = (value: unknown): unknown => {
  if (!isRecord(value)) {
    return value;
  }

  const record = { ...value };
  for (const [wireKey, canonicalKey] of Object.entries(deviceMetaKeyAliases)) {
    if (record[canonicalKey] === undefined && record[wireKey] !== undefined) {
      record[canonicalKey] = record[wireKey];
    }
  }
  return record;
};

/**
 * Sidecar JSON and `<meta name="device-meta">` attributes use `isUwpApp` and `isPcgdkApp`.
 * The parsed object uses the core-scripts names `isUWPApp` and `isPcGdkApp`.
 */
const deviceMetaObject = z.object({
  browser: enumFromAnyCase(Browser, "unknown"),
  operatingSystem: enumFromAnyCase(OperatingSystem, "unknown"), // Only avaiable on NextJS app. On .net it will be `unknown`
  deviceType: enumFromAnyCase(DeviceType, "unknown"),
  appType: enumFromAnyCase(AppType, "unknown"), // For web and mobile web, it will be unknown
  isInApp: optionalBooleanString,
  isDesktop: optionalBooleanString,
  isPhone: optionalBooleanString,
  isTablet: optionalBooleanString,
  isConsole: optionalBooleanString,
  isAndroidApp: optionalBooleanString,
  isIosApp: optionalBooleanString,
  isUWPApp: optionalBooleanString,
  isXboxApp: optionalBooleanString,
  isAmazonApp: optionalBooleanString,
  isWin32App: optionalBooleanString,
  isStudio: optionalBooleanString,
  isIosDevice: optionalBooleanString,
  isAndroidDevice: optionalBooleanString,
  isUniversalApp: optionalBooleanString,
  isChromeOs: optionalBooleanString,
  isSamsungGalaxyStoreApp: optionalBooleanString,
  isPcGdkApp: optionalBooleanString,
  isMac: optionalBooleanString,
  isWindows: optionalBooleanString,
});

// `.shape` stays on the object schema. Callers parse operating system and device type from it.
export const DeviceMeta = Object.assign(
  z.pipe(z.transform(aliasDeviceMetaKeys), deviceMetaObject),
  { shape: deviceMetaObject.shape },
);

export type DeviceMeta = z.output<typeof DeviceMeta>;
