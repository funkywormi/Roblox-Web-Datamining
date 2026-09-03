import { RoleColorValues } from '../types';
import type { RoleColors } from '../types';

export type RoleColorTokenMapEntry = {
  Dark: string;
  Light: string;
  TranslationId: string;
};

export const colorIntToColorTokenMap: Record<RoleColors, RoleColorTokenMapEntry> = {
  [RoleColorValues.Invalid]: {
    Dark: 'color-content-emphasis',
    Light: 'light-mode-content-emphasis',
    TranslationId: 'Label.RoleColorDefault'
  },
  // Reds & Crimsons
  [RoleColorValues.Red]: {
    Dark: 'color-extended-red-700',
    Light: 'color-extended-red-800',
    TranslationId: 'Label.RoleColorRed'
  },
  [RoleColorValues.Crimson]: {
    Dark: 'color-extended-red-900',
    Light: 'color-extended-red-1100',
    TranslationId: 'Label.RoleColorCrimson'
  },

  // Oranges & Rusts
  [RoleColorValues.Orange]: {
    Dark: 'color-extended-orange-500',
    Light: 'color-extended-orange-700',
    TranslationId: 'Label.RoleColorOrange'
  },
  [RoleColorValues.Rust]: {
    Dark: 'color-extended-orange-700',
    Light: 'color-extended-orange-900',
    TranslationId: 'Label.RoleColorRust'
  },

  // Yellows
  [RoleColorValues.Yellow]: {
    Dark: 'color-extended-yellow-500',
    Light: 'color-extended-yellow-800',
    TranslationId: 'Label.RoleColorYellow'
  },

  // Greens & Pistachio
  [RoleColorValues.Pistachio]: {
    Dark: 'color-extended-green-200',
    Light: 'color-extended-green-700',
    TranslationId: 'Label.RoleColorPistachio'
  },
  [RoleColorValues.Green]: {
    Dark: 'color-extended-green-500',
    Light: 'color-extended-green-800',
    TranslationId: 'Label.RoleColorGreen'
  },

  // Teals & Turquoises
  [RoleColorValues.Teal]: {
    Dark: 'color-extended-turquoise-300',
    Light: 'color-extended-turquoise-700',
    TranslationId: 'Label.RoleColorTeal'
  },
  [RoleColorValues.Turquoise]: {
    Dark: 'color-extended-turquoise-900',
    Light: 'color-extended-turquoise-1200',
    TranslationId: 'Label.RoleColorTurquoise'
  },

  // Blues & Midnights
  [RoleColorValues.Blue]: {
    Dark: 'color-extended-blue-500',
    Light: 'color-extended-blue-600',
    TranslationId: 'Label.RoleColorBlue'
  },
  [RoleColorValues.Midnight]: {
    Dark: 'color-extended-blue-900',
    Light: 'color-extended-blue-1100',
    TranslationId: 'Label.RoleColorMidnight'
  },

  // Purples & Lavenders
  [RoleColorValues.Purple]: {
    Dark: 'color-extended-purple-600',
    Light: 'color-extended-purple-800',
    TranslationId: 'Label.RoleColorPurple'
  },
  [RoleColorValues.Lavender]: {
    Dark: 'color-extended-purple-900',
    Light: 'color-extended-purple-1100',
    TranslationId: 'Label.RoleColorLavender'
  },

  // Magentas & Plums
  [RoleColorValues.Magenta]: {
    Dark: 'color-extended-magenta-600',
    Light: 'color-extended-magenta-700',
    TranslationId: 'Label.RoleColorMagenta'
  },
  [RoleColorValues.Plum]: {
    Dark: 'color-extended-magenta-800',
    Light: 'color-extended-magenta-1000',
    TranslationId: 'Label.RoleColorPlum'
  },

  // Pinks
  [RoleColorValues.Pink]: {
    Dark: 'color-extended-pink-400',
    Light: 'color-extended-pink-700',
    TranslationId: 'Label.RoleColorPink'
  }
};

export const pickableRoleColorsList: RoleColors[] = [
  // Reds & Crimsons
  RoleColorValues.Red,
  RoleColorValues.Crimson,

  // Oranges & Rusts
  RoleColorValues.Orange,
  RoleColorValues.Rust,

  // Yellows
  RoleColorValues.Yellow,

  // Greens & Pistachio
  RoleColorValues.Pistachio,
  RoleColorValues.Green,

  // Teals & Turquoises
  RoleColorValues.Teal,
  RoleColorValues.Turquoise,
  RoleColorValues.Blue,

  // Blues & Midnights
  RoleColorValues.Midnight,
  RoleColorValues.Purple,
  RoleColorValues.Lavender,

  // Magentas & Plums
  RoleColorValues.Magenta,
  RoleColorValues.Plum,

  // Pinks
  RoleColorValues.Pink,

  RoleColorValues.Invalid
];

export default {
  colorIntToColorTokenMap,
  pickableRoleColorsList
};
