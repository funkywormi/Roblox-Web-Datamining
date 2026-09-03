import { EnvironmentUrls } from '@rbx/environment-urls';
import * as httpService from '@rbx/core-scripts/http';
import type { DiscountInformation } from '../components/discountInformation';

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

export type CartPricingItemResponse = {
  collectibleItemId?: string;
  priceInRobux?: number;
  regularPriceInRobux?: number;
  discountInformation?: DiscountInformation | null;
};

export type CartPricingResponse = {
  items?: CartPricingItemResponse[];
  savingsSummary?: string;
  availableOffers?: CartPricingAvailableOffer[];
  errors?: Array<{ message?: string; code?: number }>;
};

export type MarketplaceOfferSelection = {
  offerId: string;
  localizedText: string;
  selected: boolean;
};

/** Feature key for marketplace-sales `/cart-pricing` on single-item purchase.
 * Confirm with marketplace-sales that this is the correct key for catalog item purchase
 * (sitetest currently uses `MARKETPLACE_CART`). */
export const MARKETPLACE_OFFERS_FEATURE_KEY = 'MARKETPLACE_CART';

export function buildCartPricingItem(
  collectibleItemId: string,
  rentalOptionDays?: number | null
): CartPricingItemRequest {
  if (rentalOptionDays != null && rentalOptionDays > 0) {
    return { collectibleItemId, rentalDays: rentalOptionDays };
  }

  return { collectibleItemId, isPermanent: true };
}

export function mapAvailableOffersToSelections(
  availableOffers: CartPricingAvailableOffer[] | null | undefined
): MarketplaceOfferSelection[] {
  return (
    availableOffers?.reduce<MarketplaceOfferSelection[]>((selections, offer) => {
      const localizedText = offer.localizedDescription?.trim();
      if (offer.offerId && localizedText) {
        selections.push({
          offerId: offer.offerId,
          localizedText,
          selected: offer.selected ?? false
        });
      }
      return selections;
    }, []) ?? []
  );
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

    if (response.status !== 200) {
      return null;
    }

    return response.data ?? null;
  } catch {
    return null;
  }
}

export default {
  buildCartPricingItem,
  mapAvailableOffersToSelections,
  postCartPricing,
  MARKETPLACE_OFFERS_FEATURE_KEY
};
