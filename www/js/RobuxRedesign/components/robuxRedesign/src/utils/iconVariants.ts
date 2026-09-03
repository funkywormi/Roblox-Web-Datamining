import { arrayIncludes } from "@rbx/core-types";

// We need these explicitly defined here because the presence of the explicit strings
// tells the bundler which icon css classes to include in the bundle.
const iconVariants = [
  "icon-regular-star",
  "icon-regular-circle-star",
  "icon-regular-shopping-basket-check",
  "icon-regular-flame",
  "icon-filled-robux",
  "icon-regular-wallet",
  "icon-regular-tag",
] as const;

type IconVariant = (typeof iconVariants)[number];

export const isIconVariant = (value: string): value is IconVariant =>
  arrayIncludes(iconVariants, value);
