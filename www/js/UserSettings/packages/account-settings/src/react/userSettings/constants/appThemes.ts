import { EventData } from "@rbx/core-scripts/meta/event";
import type { AppTheme, FreeTheme, PlusTheme } from "@rbx/core-scripts/theme";
import { AccountTheme } from "@rbx/user-settings";

export type AppThemeCategoryId = "calm" | "dynamic" | "special";

export type AppThemeSwatch =
  | `bg-[light-dark(${string},${string})]`
  | { light: `bg-[${string}]`; dark: `bg-[${string}]` };

export type FreeThemeDef = {
  key: FreeTheme;
  accountTheme: AccountTheme;
  labelKey: string;
  swatch: AppThemeSwatch;
  category?: null;
};

export type PlusThemeDef = {
  key: PlusTheme;
  accountTheme: AccountTheme;
  labelKey: string;
  swatch: AppThemeSwatch;
  category: AppThemeCategoryId;
};

export type AppThemeDef = FreeThemeDef | PlusThemeDef;

export const appThemeCategories: { id: AppThemeCategoryId; labelKey: string }[] = [
  { id: "dynamic", labelKey: "AppTheme.CategoryDynamic" },
  { id: "calm", labelKey: "AppTheme.CategoryCalm" },
  { id: "special", labelKey: "AppTheme.CategorySpecial" },
];

export const makeThemes = (event: EventData | null, isPlus: boolean) => {
  const themes: AppThemeDef[] = [
    {
      key: "default",
      accountTheme: AccountTheme.Default,
      labelKey: "AppTheme.Default",
      swatch: "bg-[light-dark(#ffffff,#121215)]",
    },
    {
      key: "cosmic-dust",
      accountTheme: AccountTheme.CosmicDust,
      labelKey: "AppTheme.CosmicDust",
      category: "dynamic",
      swatch: "bg-[light-dark(#cbb7fd,#6625d0)]",
    },
    {
      key: "polar-freeze",
      accountTheme: AccountTheme.PolarFreeze,
      labelKey: "AppTheme.PolarFreeze",
      category: "dynamic",
      swatch: "bg-[light-dark(#6cd1ed,#065684)]",
    },
    {
      key: "super-charge",
      accountTheme: AccountTheme.SuperCharge,
      labelKey: "AppTheme.SuperCharge",
      category: "dynamic",
      swatch: "bg-[light-dark(#81d887,#045d4a)]",
    },
    {
      key: "electric-lime",
      accountTheme: AccountTheme.ElectricLime,
      labelKey: "AppTheme.ElectricLime",
      category: "dynamic",
      swatch: "bg-[light-dark(#b4d159,#455903)]",
    },
    {
      key: "lava-glow",
      accountTheme: AccountTheme.LavaGlow,
      labelKey: "AppTheme.LavaGlow",
      category: "dynamic",
      swatch: "bg-[light-dark(#fbb2a9,#a71811)]",
    },
    {
      key: "star-burst",
      accountTheme: AccountTheme.StarBurst,
      labelKey: "AppTheme.StarBurst",
      category: "dynamic",
      swatch: "bg-[light-dark(#fbadc6,#a5094f)]",
    },
    {
      key: "pixel-pop",
      accountTheme: AccountTheme.PixelPop,
      labelKey: "AppTheme.PixelPop",
      category: "dynamic",
      swatch: "bg-[light-dark(#f7acf4,#8e1f8e)]",
    },
    {
      key: "nebula-drift",
      accountTheme: AccountTheme.NebulaDrift,
      labelKey: "AppTheme.NebulaDrift",
      category: "calm",
      swatch: "bg-[light-dark(#ddcffe,#480b98)]",
    },
    {
      key: "nitro-frost",
      accountTheme: AccountTheme.NitroFrost,
      labelKey: "AppTheme.NitroFrost",
      category: "calm",
      swatch: "bg-[light-dark(#98e3f4,#043b5d)]",
    },
    {
      key: "circuit-rush",
      accountTheme: AccountTheme.CircuitRush,
      labelKey: "AppTheme.CircuitRush",
      category: "calm",
      swatch: "bg-[light-dark(#ade7b1,#043e32)]",
    },
    {
      key: "kinetic-energy",
      accountTheme: AccountTheme.KineticEnergy,
      labelKey: "AppTheme.KineticEnergy",
      category: "calm",
      swatch: "bg-[light-dark(#cae388,#2e3c02)]",
    },
    {
      key: "inferno-blast",
      accountTheme: AccountTheme.InfernoBlast,
      labelKey: "AppTheme.InfernoBlast",
      category: "calm",
      swatch: "bg-[light-dark(#fecec8,#6b0f0b)]",
    },
    {
      key: "hyper-plum",
      accountTheme: AccountTheme.HyperPlum,
      labelKey: "AppTheme.HyperPlum",
      category: "calm",
      swatch: "bg-[light-dark(#fbc9d8,#710437)]",
    },
    {
      key: "quantum-pulse",
      accountTheme: AccountTheme.QuantumPulse,
      labelKey: "AppTheme.QuantumPulse",
      category: "calm",
      swatch: "bg-[light-dark(#fbc8f8,#5d0e5d)]",
    },
    {
      key: "classic",
      accountTheme: AccountTheme.Classic,
      labelKey: "AppTheme.Classic",
      category: "special",
      swatch: "bg-[light-dark(#e42727,#e42727)]",
    },
    ...(event == null
      ? []
      : [
          {
            key: "halloween-2026",
            accountTheme: AccountTheme.Halloween2026,
            labelKey: "AppTheme.Halloween2026",
            category: (isPlus ? event.phase < 2 : event.phase === 1) ? null : "special",
            swatch: { light: "bg-[#e92127]", dark: "bg-[#0242dc]" },
          } as const,
        ]),
  ];

  const themesByKey = new Map<AppTheme, AppThemeDef>(themes.map(theme => [theme.key, theme]));

  return {
    themes,
    themesByKey,
  };
};
