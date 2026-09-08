import type { AppTheme } from "@rbx/core-scripts/theme";
import { AccountTheme } from "@rbx/user-settings";

export type AppThemeCategoryId = "calm" | "dynamic" | "special";

export type AppThemeSwatch = {
  light: string;
  dark: string;
};

export type AppThemeDef = {
  key: AppTheme;
  accountTheme: AccountTheme;
  labelKey: string;
  category: AppThemeCategoryId | null;
  swatch: AppThemeSwatch;
};

export const appThemeCategories: { id: AppThemeCategoryId; labelKey: string }[] = [
  { id: "dynamic", labelKey: "AppTheme.CategoryDynamic" },
  { id: "calm", labelKey: "AppTheme.CategoryCalm" },
];

export const defaultTheme: AppThemeDef = {
  key: "default",
  accountTheme: AccountTheme.Default,
  labelKey: "AppTheme.Default",
  category: null,
  swatch: {
    light: "#ffffff",
    dark: "#121215",
  },
};

export const classicTheme: AppThemeDef = {
  key: "classic",
  accountTheme: AccountTheme.Classic,
  labelKey: "AppTheme.Classic",
  category: null,
  swatch: {
    light: "#e42727",
    dark: "#e42727",
  },
};

export const appThemeDefs: AppThemeDef[] = [
  defaultTheme,
  {
    key: "cosmic-dust",
    accountTheme: AccountTheme.CosmicDust,
    labelKey: "AppTheme.CosmicDust",
    category: "dynamic",
    swatch: { light: "#cbb7fd", dark: "#6625d0" },
  },
  {
    key: "polar-freeze",
    accountTheme: AccountTheme.PolarFreeze,
    labelKey: "AppTheme.PolarFreeze",
    category: "dynamic",
    swatch: { light: "#6cd1ed", dark: "#065684" },
  },
  {
    key: "super-charge",
    accountTheme: AccountTheme.SuperCharge,
    labelKey: "AppTheme.SuperCharge",
    category: "dynamic",
    swatch: { light: "#81d887", dark: "#045d4a" },
  },
  {
    key: "electric-lime",
    accountTheme: AccountTheme.ElectricLime,
    labelKey: "AppTheme.ElectricLime",
    category: "dynamic",
    swatch: { light: "#b4d159", dark: "#455903" },
  },
  {
    key: "lava-glow",
    accountTheme: AccountTheme.LavaGlow,
    labelKey: "AppTheme.LavaGlow",
    category: "dynamic",
    swatch: { light: "#fbb2a9", dark: "#a71811" },
  },
  {
    key: "star-burst",
    accountTheme: AccountTheme.StarBurst,
    labelKey: "AppTheme.StarBurst",
    category: "dynamic",
    swatch: { light: "#fbadc6", dark: "#a5094f" },
  },
  {
    key: "pixel-pop",
    accountTheme: AccountTheme.PixelPop,
    labelKey: "AppTheme.PixelPop",
    category: "dynamic",
    swatch: { light: "#f7acf4", dark: "#8e1f8e" },
  },
  {
    key: "nebula-drift",
    accountTheme: AccountTheme.NebulaDrift,
    labelKey: "AppTheme.NebulaDrift",
    category: "calm",
    swatch: { light: "#ddcffe", dark: "#480b98" },
  },
  {
    key: "nitro-frost",
    accountTheme: AccountTheme.NitroFrost,
    labelKey: "AppTheme.NitroFrost",
    category: "calm",
    swatch: { light: "#98e3f4", dark: "#043b5d" },
  },
  {
    key: "circuit-rush",
    accountTheme: AccountTheme.CircuitRush,
    labelKey: "AppTheme.CircuitRush",
    category: "calm",
    swatch: { light: "#ade7b1", dark: "#043e32" },
  },
  {
    key: "kinetic-energy",
    accountTheme: AccountTheme.KineticEnergy,
    labelKey: "AppTheme.KineticEnergy",
    category: "calm",
    swatch: { light: "#cae388", dark: "#2e3c02" },
  },
  {
    key: "inferno-blast",
    accountTheme: AccountTheme.InfernoBlast,
    labelKey: "AppTheme.InfernoBlast",
    category: "calm",
    swatch: { light: "#fecec8", dark: "#6b0f0b" },
  },
  {
    key: "hyper-plum",
    accountTheme: AccountTheme.HyperPlum,
    labelKey: "AppTheme.HyperPlum",
    category: "calm",
    swatch: { light: "#fbc9d8", dark: "#710437" },
  },
  {
    key: "quantum-pulse",
    accountTheme: AccountTheme.QuantumPulse,
    labelKey: "AppTheme.QuantumPulse",
    category: "calm",
    swatch: { light: "#fbc8f8", dark: "#5d0e5d" },
  },
  classicTheme,
];

export const appThemesByKey = new Map<string, AppThemeDef>(appThemeDefs.map(def => [def.key, def]));
