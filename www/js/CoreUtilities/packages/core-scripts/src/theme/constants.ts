/* The list of themes user can switch to. */
export const appThemes = [
  "default",
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
] as const;

/* The list of themes user can switch to. */
export type AppTheme = (typeof appThemes)[number];

/* The list of themes related to age and verification. */
export const ageThemes = ["kids"] as const;

/* The list of themes related to age and verification. */
export type AgeTheme = (typeof ageThemes)[number];

/* The list of all possible themes (including those forced upon the user like `kids`). */
export const themes = [...appThemes, ...ageThemes] as const;

/* The list of all possible themes (including those forced upon the user like `kids`). */
export type Theme = (typeof themes)[number];
