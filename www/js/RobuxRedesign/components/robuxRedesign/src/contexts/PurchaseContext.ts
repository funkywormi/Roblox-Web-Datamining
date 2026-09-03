import { createContext } from "react";
import { Product } from "../types/buyRobuxPageData";

export const BuyRobuxPageSectionType = {
  RedirectProductList: "RedirectProductList",
  GiftCard: "GiftCard",
  LimitedTimeBonus: "LimitedTimeBonus",
  PersonalizedBonus: "PersonalizedBonus",
  ProductsList: "ProductsList",
  Recommended: "Recommended",
  RobuxGift: "RobuxGift",
} as const;

export type BuyRobuxPageSectionType =
  (typeof BuyRobuxPageSectionType)[keyof typeof BuyRobuxPageSectionType];

type HandlePurchaseOptions = {
  product: Product;
  isRedirect: boolean;
  isSubscription: boolean;
  isBonus: boolean;
  sectionType?: BuyRobuxPageSectionType;
  event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>;
};

export type PurchaseContextProps = {
  purchaseNonRedirectProduct: (
    product: Product,
    isSubscriptionProduct?: boolean,
    isBonusItem?: boolean,
    sectionType?: BuyRobuxPageSectionType,
  ) => Promise<void>;
  selectedProduct: Product | undefined;
  purchaseProduct: (options: HandlePurchaseOptions) => void;
};

export const PurchaseContext = createContext<PurchaseContextProps>({
  selectedProduct: undefined,
  purchaseProduct: () => undefined,
  purchaseNonRedirectProduct: () => Promise.resolve(),
});
