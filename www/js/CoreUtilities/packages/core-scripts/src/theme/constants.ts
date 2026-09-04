/* Themes that only plus users can switch to. */
export const plusThemes = [
  "emerald",
  "peridot",
  "ruby",
  "rose",
  "amethyst",
  "cosmic-dust",
  "nebula-drift",
  "polar-freeze",
  "nitro-frost",
  "super-charge",
  "circuit-rush",
  "electric-lime",
  "kinetic-energy",
  "lava-glow",
  "inferno-blast",
  "star-burst",
  "hyper-plum",
  "pixel-pop",
  "quantum-pulse",
  "classic",
] as const;

/* Themes that only plus users can switch to. */
export type PlusTheme = (typeof plusThemes)[number];

/* Themes that non-plus and plus users can switch to. */
export const freeThemes = ["default"] as const;

/* Themes that non-plus and plus users can switch to. */
export type FreeTheme = (typeof freeThemes)[number];

/* Themes that users can manually select. */
export const appThemes = [...freeThemes, ...plusThemes] as const;

/* Themes that users can manually select. */
export type AppTheme = (typeof appThemes)[number];

/* All possible themes. */
export const themes = [...appThemes, "kids"] as const;

/* All possible themes. */
export type Theme = (typeof themes)[number];
