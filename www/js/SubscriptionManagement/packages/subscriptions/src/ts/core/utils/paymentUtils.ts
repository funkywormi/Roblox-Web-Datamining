import { CardNetwork } from '../types/cardInfo';

export const GetStripeCardIcon = (cardNetwork: string): string => {
  switch (cardNetwork) {
    case CardNetwork.AMEX:
    case CardNetwork.AMERICANEXPRESS:
      return 'icon-amex';
    case CardNetwork.DISCOVER:
      return 'icon-discover';
    case CardNetwork.MASTERCARD:
      return 'icon-mastercard';
    case CardNetwork.VISA:
      return 'icon-visa';
    case CardNetwork.DEBIT:
      return 'icon-debit';
    default:
      return 'icon-generic-card';
  }
};

export default { GetStripeCardIcon };
