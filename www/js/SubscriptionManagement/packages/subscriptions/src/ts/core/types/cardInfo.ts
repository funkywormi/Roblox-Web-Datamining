export enum CardNetwork {
  VISA = 'visa',
  DISCOVER = 'discover',
  MASTERCARD = 'mastercard',
  // We have both american express and amex since both are used
  AMERICANEXPRESS = 'americanexpress',
  AMEX = 'amex',
  DEBIT = 'debitcard'
}

export type PaymentProviderCardInfo = {
  cardNetwork: string;
  last4Digits: string;
  expMonth: number;
  expYear: number;
};
