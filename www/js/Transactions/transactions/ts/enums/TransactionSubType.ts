enum TransactionSubType {
  TransferCommission = 'TransferCommission',
  /**
   * A gifted sale. Carried on BOTH sides -- the sender's Purchase row and the creator's Sale row
   * -- so this value alone cannot pick the wording; combine it with the transaction type.
   */
  Gift = 'Gift',
  /** The recipient's own receipt. Served on the purchase path, with Amount = 0. */
  GiftReceipt = 'GiftReceipt'
}

export default TransactionSubType;
