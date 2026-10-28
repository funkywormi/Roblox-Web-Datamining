import {
  GIFT_RECEIPT_TRANSLATION_KEY,
  GIFTED_PURCHASE_TRANSLATION_KEY,
  GIFTED_PURCHASE_WITH_RECIPIENT_TRANSLATION_KEY,
  GIFTED_SALE_TRANSLATION_KEY,
  TransactionOriginType,
  TransactionSubType
} from '../../../../ts';

/**
 * The wording key for a gift row, or null when the transaction is not a gift.
 *
 * Both the desktop table and the mobile list call this, deliberately: the two render paths
 * duplicate their wording logic, and a gift row worded correctly in one and not the other is the
 * failure mode this exists to prevent.
 *
 * The subtype is not enough on its own. A gifted sale carries `Gift` on the sender's Purchase row
 * AND the creator's Sale row, and those read differently -- "Gifted X to Y" versus "Sold X as a
 * gift" -- so the transaction type decides between them.
 */
const getGiftTranslationKey = (
  transactionSubtype: TransactionSubType | null | undefined,
  transactionType: TransactionOriginType | null | undefined,
  hasRecipientName: boolean
): string | null => {
  if (transactionSubtype === TransactionSubType.GiftReceipt) {
    return GIFT_RECEIPT_TRANSLATION_KEY;
  }

  if (transactionSubtype !== TransactionSubType.Gift) {
    return null;
  }

  if (transactionType === TransactionOriginType.Sale) {
    return GIFTED_SALE_TRANSLATION_KEY;
  }

  if (transactionType === TransactionOriginType.Purchase) {
    // Falls back to the nameless key rather than rendering an empty token: the api returns no
    // recipient for a recipient who has since been forgotten, and that is a normal answer.
    return hasRecipientName
      ? GIFTED_PURCHASE_WITH_RECIPIENT_TRANSLATION_KEY
      : GIFTED_PURCHASE_TRANSLATION_KEY;
  }

  // A gift subtype on some other transaction type is not something this app knows how to word.
  // Returning null leaves the existing wording in place instead of inventing one.
  return null;
};

export default getGiftTranslationKey;
