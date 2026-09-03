import { createContext, useContext } from 'react';
import type { MarketplaceOffer } from '../../services/marketplaceSalesOffersService';

export type MarketplaceOfferContextValue = {
  offer: MarketplaceOffer | null;
  showOfferBanner: boolean;
  dismissOfferBanner: () => void;
  openOfferModal: () => void;
};

const defaultValue: MarketplaceOfferContextValue = {
  offer: null,
  showOfferBanner: false,
  dismissOfferBanner: () => undefined,
  openOfferModal: () => undefined
};

const MarketplaceOfferContext = createContext<MarketplaceOfferContextValue>(defaultValue);

export const MarketplaceOfferProvider = MarketplaceOfferContext.Provider;

export function useMarketplaceOfferContext(): MarketplaceOfferContextValue {
  return useContext(MarketplaceOfferContext);
}

export default MarketplaceOfferContext;
