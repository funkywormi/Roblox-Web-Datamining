export const BONUS_ROBUX_TAG_FALLBACK_KEY = "Label.PlusAmountMoreLower";

/**
 * Resolves the translation key for a product's bonus-Robux tag. An unset protobuf string can reach
 * the client as "" rather than undefined, so an empty key has to fall back too. Shared so the
 * product rows and the QuickPay modal always label the same bonus identically.
 */
export function resolveBonusRobuxTagLabelKey(translationKey: string | undefined): string {
  return translationKey === undefined || translationKey === ""
    ? BONUS_ROBUX_TAG_FALLBACK_KEY
    : translationKey;
}
