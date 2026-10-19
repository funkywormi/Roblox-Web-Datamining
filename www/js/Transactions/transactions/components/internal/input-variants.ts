import type { TTailwindBgClass, TTailwindStrokeClass } from '@rbx/foundation-tailwind/classes';

export const INPUT_VARIANTS = ['Standard', 'Contrast', 'Utility'] as const;

/** Input variant options. */
export type TInputVariant = (typeof INPUT_VARIANTS)[number];

export const INPUT_BACKGROUND_BY_VARIANT: Record<TInputVariant, TTailwindBgClass> = {
  Standard: 'bg-none',
  Contrast: 'bg-shift-200',
  Utility: 'bg-none'
};

export const INPUT_STROKE_BY_VARIANT: Record<TInputVariant, TTailwindStrokeClass> = {
  Standard: 'stroke-standard',
  Contrast: 'stroke-none',
  Utility: 'stroke-none'
};
