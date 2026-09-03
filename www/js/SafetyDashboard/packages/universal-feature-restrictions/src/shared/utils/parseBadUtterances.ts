import type { BadUtterance } from "../../types/api";

interface ParseBadUtterancesResult {
  textItems: string[];
  abuseTypes: string[];
}

/**
 * Splits bad utterances into reversed text items (chronological order) and
 * a deduplicated list of translated abuse type labels, filtering out empty translations.
 */
export const parseBadUtterances = (
  badUtterances: BadUtterance[],
  translate: (key: string) => string,
): ParseBadUtterancesResult => {
  const textItems: string[] = [];
  const abuseTypeSet = new Set<string>();

  badUtterances.forEach(utterance => {
    textItems.push(utterance.utteranceText);
    abuseTypeSet.add(translate(utterance.labelTranslationKey));
  });

  return {
    textItems: textItems.reverse(),
    abuseTypes: [...abuseTypeSet].filter(Boolean),
  };
};
