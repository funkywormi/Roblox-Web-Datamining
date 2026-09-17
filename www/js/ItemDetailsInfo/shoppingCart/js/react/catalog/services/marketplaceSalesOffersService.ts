import { CurrentUser, EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';

export type MarketplaceOfferStatus = 'AVAILABLE' | string;

export type MarketplaceOfferModal = {
  modalHeroIcon?: string;
  modalTitle?: string;
  offerBodyLinkText?: string;
  termsModalTitle?: string;
  termsBody?: string;
};

export type MarketplaceOffer = {
  icon?: string;
  localizedText?: string;
  offerId?: string;
  offerStatus?: MarketplaceOfferStatus;
  modal?: MarketplaceOfferModal;
};

export type MarketplaceOffersResponse = {
  offers?: MarketplaceOffer[];
};

export type CartPricingItemRequest = {
  collectibleItemId: string;
  isPermanent?: boolean;
  rentalDays?: number;
};

export type CartPricingRequest = {
  featureKey: string;
  items: CartPricingItemRequest[];
  unselectedOffers?: string[];
};

export type CartPricingAvailableOffer = {
  offerId: string;
  localizedDescription?: string;
  selected?: boolean;
};

/** `discountType` value cart-pricing uses to attribute a line to a marketplace offer. */
export const MARKETPLACE_OFFER_DISCOUNT_TYPE = 'MARKETPLACE_OFFER';

export type CartPricingDiscountLine = {
  discountAmount?: number;
  robuxDiscountAmount?: number;
  /** Discount classification, e.g. `ROBLOX_PLUS` | `MARKETPLACE_OFFER`. */
  discountType?: string;
  discountCampaign?: string;
  localizedDiscountAttribution?: string | null;
};

export type CartPricingDiscountInformation = {
  originalPrice?: number;
  totalDiscountAmount?: number;
  discounts?: CartPricingDiscountLine[];
};

export type CartPricingItemResponse = {
  collectibleItemId?: string;
  priceInRobux?: number;
  regularPriceInRobux?: number;
  discountInformation?: CartPricingDiscountInformation | null;
};

export type CartPricingResponse = {
  items?: CartPricingItemResponse[];
  savingsSummary?: string;
  availableOffers?: CartPricingAvailableOffer[];
};

/** Feature key for marketplace-sales `/offers` on catalog (confirm with marketplace-sales for your surface). */
export const MARKETPLACE_OFFERS_FEATURE_KEY = 'MARKETPLACE_CART';

export function findFirstAvailableMarketplaceOffer(
  offers: MarketplaceOffer[] | null | undefined
): MarketplaceOffer | undefined {
  return offers?.find(offer => {
    if (offer.offerStatus !== 'AVAILABLE' || !offer.offerId || !offer.modal?.modalTitle?.trim()) {
      return false;
    }

    return !!(offer.modal.offerBodyLinkText?.trim() || offer.localizedText?.trim());
  });
}

export async function getMarketplaceOffers(
  featureKey: string,
  userId: number | string = CurrentUser.userId
): Promise<MarketplaceOffer[]> {
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}/marketplace-sales/v1/offers`,
    withCredentials: true
  };

  try {
    const response = await httpService.get<MarketplaceOffersResponse>(urlConfig, {
      userId,
      featureKey
    });

    if (response.status !== 200) {
      return [];
    }

    return response.data?.offers ?? [];
  } catch {
    return [];
  }
}

export async function postCartPricing(
  request: CartPricingRequest
): Promise<CartPricingResponse | null> {
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}/marketplace-sales/v1/cart-pricing`,
    withCredentials: true
  };

  try {
    const response = await httpService.post<CartPricingResponse>(urlConfig, request);
    return response.status === 200 ? response.data ?? null : null;
  } catch {
    return null;
  }
}

export default {
  findFirstAvailableMarketplaceOffer,
  getMarketplaceOffers,
  postCartPricing,
  MARKETPLACE_OFFERS_FEATURE_KEY
};
