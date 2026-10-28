import { TranslateFunction } from 'react-utilities';
import {
  TRANSACTION_TYPE_LABEL_FALLBACKS,
  transactionTypeTranslationKeys,
  TransactionType
} from '../../../../ts';

/**
 * The dropdown label for a category, falling back to English when the key is not yet authored.
 *
 * Without this a category whose key does not exist yet renders as an empty dropdown entry -- the
 * user can select it but cannot read it. Only categories with a fallback entry are covered; every
 * existing one resolves through `translate` as before.
 */
const translateTransactionTypeLabel = (
  translate: TranslateFunction,
  transactionType: TransactionType
): string => {
  const translationKey = transactionTypeTranslationKeys[transactionType];

  return translate(translationKey) || TRANSACTION_TYPE_LABEL_FALLBACKS[translationKey] || '';
};

export default translateTransactionTypeLabel;
