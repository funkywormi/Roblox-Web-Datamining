// Kept free of zod, because App Shell counters use it in .NET components.

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

const canonicalAppType = new Map<string, AppType>(
  AppType.map(value => [value.toLowerCase(), value]),
);

/** Fixes the casing (.NET sends lowercase). Anything unrecognized is `unknown`. */
export const toAppType = (value: string | undefined): AppType =>
  canonicalAppType.get(value?.trim().toLowerCase() ?? "") ?? "unknown";
