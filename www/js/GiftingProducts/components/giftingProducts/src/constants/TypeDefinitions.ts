export type Currency = {
  id: number;
  currencyType: number;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
};
export type Price = {
  amount: number;
  currency: Currency;
  usdAmount: number;
};
export type GrantedAssetListItem = {
  id: number;
  grantedAssetListId: number;
  assetId: number;
  status: number;
  thumbnail2dUrl: string;
  thumbnail3dUrl: string;
  translationKey: string;
};
export type Product = {
  productId: number;
  premiumFeatureId: number;
  mobileProductId: string;
  robuxAmount: number;
  premiumFeatureTypeName: string;
  subscriptionTypeName?: string;
  isSubscriptionOnly: boolean;
  price: Price;
  description: string;
  name: string;
  defaultDisplayName: string;
  isPopular: boolean;
  grantedAssetListItems: GrantedAssetListItem[] | null;
};

export enum RobuxGiftErrorType {
  RecipientIneligible = "RecipientIneligible",
  PurchaserIneligible = "PurchaserIneligible",
  PreparePayment = "PreparePayment",
  GiftLimit = "GiftLimit",
}
