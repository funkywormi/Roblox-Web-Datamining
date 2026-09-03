import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";

export const FALLBACK_ICON: TTailwindIconClass = "icon-regular-triangle-exclamation";

/**
 * Curated allowlist mapping a backend icon stem (e.g. "microphone") to its Foundation
 * `icon-regular-*` class. Foundation icons are delivered as Tailwind-generated CSS, and Tailwind
 * only emits a class when it sees the full literal at build time. Spelling each class out here keeps
 * the component's CSS to just the icons we actually render instead of bundling the entire icon set.
 * Add an entry when a new feature timeout icon needs to be supported.
 */
const FEATURE_ICONS: Record<string, TTailwindIconClass> = {
  "circle-person": "icon-regular-circle-person",
  "speech-bubble-align-center": "icon-regular-speech-bubble-align-center",
  microphone: "icon-regular-microphone",
  robux: "icon-regular-robux",
  "shield-lock": "icon-regular-shield-lock",
  "triangle-exclamation": "icon-regular-triangle-exclamation",
  "two-people-speech-bubble": "icon-regular-two-people-speech-bubble",
  wallet: "icon-regular-wallet",
};

/**
 * Resolves a backend icon stem to its Foundation icon class, falling back to the warning triangle
 * when the stem isn't in the curated allowlist.
 */
export const featureIconClass = (iconName: string): TTailwindIconClass =>
  FEATURE_ICONS[iconName] ?? FALLBACK_ICON;
