/**
 * Allowed drag effect types for file upload drag and drop operations.
 * Used to set the visual feedback cursor during drag operations.
 */
export const allowedEffectTypes = {
  copy: 'copy'
} as const;

export type AllowedEffectType = typeof allowedEffectTypes[keyof typeof allowedEffectTypes];
