import { createContext } from "react";
import {
  BuyRobuxPageData,
  CollectibleItemMetadata,
  PaymentSession,
  Product,
} from "../types/buyRobuxPageData";
import { BreakpointResult } from "../hooks/useBreakpoint";
import { UseRedirectResult } from "../hooks/useRedirect";

export type LimitedTimeBonusItemFields = {
  bannerImageUrls: string[];
  creatorDisplayNames: string[];
  displayNames: string[];
  ids: string[];
  imageUrls: string[];
};

// Plain query values the Buy Robux page actually reads. A record (not URLSearchParams)
// so Next.js can pass search params across the server/client boundary.
export type BuyRobuxUrlParams = Partial<{
  ctx: string;
  product_id: string;
  showHeader: string;
}>;

export type BuyRobuxPageContextProps = {
  limitedTimeBonusItem: LimitedTimeBonusItemFields;
  bonusItemBannerImageUrl: string;
  bonusItemDisplayName: string | undefined;
  bonusItemId: number | undefined;
  bonusItemImageUrl: string;
  breakpoint: BreakpointResult;
  buyRobuxPageData: BuyRobuxPageData;
  getPurchaseUrl: (product: Product, isSubscriptionProduct: boolean) => string;
  giftingAvatarImageUrl: string;
  giftingUrl: string;
  isSubscriber: boolean;
  // Auth-only; consumers must short-circuit when undefined.
  paymentSession?: PaymentSession;
  productIds: string[];
  // Auth-only.
  purchaseFlowId?: string;
  robuxBalance: number | null | undefined;
  sectionNames: string[];
  subscriptionProductIds: string[];
  upsellProduct: Product | undefined;
  urlParams: BuyRobuxUrlParams;
  redirect?: UseRedirectResult;
  collectibleBonusItemMetadata: CollectibleItemMetadata | undefined;
  shouldShowFirstTimePurchaseConsent: boolean | undefined;
  markConsentAcknowledged: () => void;
  productBadgeSlotCount: number;
  atLeastOneProductHasBonusAmount: boolean;
};

export const BuyRobuxPageContext = createContext<BuyRobuxPageContextProps>({
  limitedTimeBonusItem: {
    bannerImageUrls: [],
    creatorDisplayNames: [],
    displayNames: [],
    ids: [],
    imageUrls: [],
  },
  bonusItemBannerImageUrl: "",
  bonusItemDisplayName: "",
  bonusItemId: undefined,
  bonusItemImageUrl: "",
  breakpoint: {
    isAboveInclusive: () => false,
    value: "xsmall",
  },
  buyRobuxPageData: {
    sections: [],
  },
  getPurchaseUrl: () => "",
  giftingAvatarImageUrl: "",
  giftingUrl: "",
  isSubscriber: false,
  paymentSession: undefined,
  productIds: [],
  purchaseFlowId: undefined,
  robuxBalance: undefined,
  sectionNames: [],
  subscriptionProductIds: [],
  upsellProduct: undefined,
  urlParams: {
    ctx: undefined,
    product_id: undefined,
    showHeader: undefined,
  },
  collectibleBonusItemMetadata: undefined,
  shouldShowFirstTimePurchaseConsent: undefined,
  markConsentAcknowledged: () => undefined,
  productBadgeSlotCount: 0,
  atLeastOneProductHasBonusAmount: false,
});
