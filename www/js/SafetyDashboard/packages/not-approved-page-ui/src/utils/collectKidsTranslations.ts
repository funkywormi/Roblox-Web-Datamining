import type { TranslateFunction } from "../providers/types";
import KIDS_CONTENT_BY_ABUSE_KEY from "../pageItemConfigs/educationalConfigs/kidsContentRegistry";

/**
 * Uses focused Kids labels when configured while preserving source order and standard labels for
 * unsupported violations.
 */
const collectKidsTranslations = (
  abuseTypeKeys: string[],
  translate: TranslateFunction,
): string[] => {
  const translatedReasons = new Set<string>();

  abuseTypeKeys.forEach(abuseTypeKey => {
    const translationKey = KIDS_CONTENT_BY_ABUSE_KEY[abuseTypeKey]?.displayLabel ?? abuseTypeKey;
    const translatedReason = translate(translationKey);

    if (translatedReason) {
      translatedReasons.add(translatedReason);
    }
  });

  return [...translatedReasons];
};

export default collectKidsTranslations;
