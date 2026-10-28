import { TranslateFunction } from 'react-utilities';
import { GIFT_TRANSLATION_FALLBACKS } from '../../../../ts';

/**
 * Translates a gift key, falling back to its English template when the key is not yet authored.
 *
 * `translate` returns falsy for an unknown key, which would otherwise drop the whole sentence and
 * leave the row blank -- worse than English text in a non-English locale.
 */
const translateGiftDescription = (
  translate: TranslateFunction,
  translationKey: string,
  tokens: { [token: string]: string }
): string => {
  const translated = translate(translationKey, tokens);
  if (translated) {
    return translated;
  }

  const fallback = GIFT_TRANSLATION_FALLBACKS[translationKey];
  if (!fallback) {
    return '';
  }

  // One pass, not a reduce of replacements: substituting in sequence lets an already-substituted
  // value be rewritten by a later token -- an item literally named "{recipient}" would have the
  // recipient name swapped into it.
  return fallback.replace(/\{(\w+)\}/g, (match, token: string) => tokens[token] ?? match);
};

export default translateGiftDescription;
