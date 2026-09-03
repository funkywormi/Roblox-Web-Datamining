import { TPriceDisplayMode } from './types';

export const nonPurchasableDisplayModes: TPriceDisplayMode[] = [
  'MODERATED',
  'NOT_FOR_SALE',
  'PURCHASE_DISABLED',
  'ITEM_ALREADY_OWNED',
  'LIMITED_NO_RESELLERS',
  'COLLECTIBLE_NO_SELLERS'
];

export const regularPriceDisplayModes: TPriceDisplayMode[] = [
  'UNAUTHENTICATED_USER_PREMIUM_ITEM',
  'NON_PREMIUM_USER_PREMIUM_ITEM',
  'REGULAR'
];

export const noResellerDisplayModes: TPriceDisplayMode[] = [
  'LIMITED_NO_RESELLERS',
  'COLLECTIBLE_NO_SELLERS'
];

export const consumableDisplayModes: TPriceDisplayMode[] = [
  'LIMITED_WITH_CONSUMABLE',
  'COLLECTIBLE_ONLY_ORIGINAL'
];
