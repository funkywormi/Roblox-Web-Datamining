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

export default {
  findFirstAvailableMarketplaceOffer,
  getMarketplaceOffers,
  MARKETPLACE_OFFERS_FEATURE_KEY
};
