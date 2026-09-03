import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MARKETPLACE_OFFERS_FEATURE_KEY,
  buildCartPricingItem,
  mapAvailableOffersToSelections,
  postCartPricing
} from '../services/marketplaceSalesOffersService';
import type { MarketplaceOfferSelection } from '../services/marketplaceSalesOffersService';
import type { DiscountInformation } from '../components/discountInformation';

export type UseMarketplaceOffersOptions = {
  collectibleItemId?: string | null;
  rentalOptionDays?: number | null;
  /**
   * Catalog price of the item. A free item (price 0) has nothing to discount, so
   * cart-pricing is skipped entirely.
   */
  expectedPrice?: number;
  /**
   * Whether this is a limited item. Limited items are not eligible for offer
   * discounts, so cart-pricing is skipped entirely.
   */
  isLimitedItem?: boolean;
  /** When false, pending requests are invalidated and resolved state is reset. */
  open?: boolean;
  /**
   * Fired after each successful cart-pricing response with the priced (discounted)
   * amount in Robux (or undefined when the response omits a price). Lets callers
   * react to price changes (e.g. re-fetch a recommended Robux package) without
   * destabilizing the memoized fetch callback.
   */
  onPriceResolved?: (priceInRobux: number | undefined) => void;
};

export type UseMarketplaceOffersResult = {
  offerSelections: MarketplaceOfferSelection[];
  resolvedPrice: number | undefined;
  resolvedDiscountInformation: DiscountInformation | null | undefined;
  resolvedSavingsSummary: string | undefined;
  isPricingLoading: boolean;
  selectedOfferIds: string[];
  handleOfferCheckedChange: (offerId: string, checked: boolean) => void;
};

/**
 * Owns marketplace offer discovery + cart-pricing for a collectible item: fetches
 * the priced cart (best offer applied by default), exposes the available offer
 * toggles, and re-prices when a toggle changes. Shared by the unified purchase
 * modal and the Robux upsell modal.
 */
export default function useMarketplaceOffers({
  collectibleItemId = null,
  rentalOptionDays = null,
  expectedPrice,
  isLimitedItem = false,
  open = false,
  onPriceResolved
}: UseMarketplaceOffersOptions): UseMarketplaceOffersResult {
  // A free item (price 0) or a limited item is not eligible for offer discounts;
  // skip cart-pricing entirely.
  const isFreeItem = expectedPrice != null && expectedPrice <= 0;
  const shouldSkipPricing = isFreeItem || isLimitedItem;
  const [offerSelections, setOfferSelections] = useState<MarketplaceOfferSelection[]>([]);
  // Mirror of offerSelections so a toggle can compute the next unselected set
  // synchronously (independent of React's setState batching) before re-pricing.
  const offerSelectionsRef = useRef<MarketplaceOfferSelection[]>([]);
  useEffect(() => {
    offerSelectionsRef.current = offerSelections;
  }, [offerSelections]);
  const [resolvedPrice, setResolvedPrice] = useState<number | undefined>();
  const [resolvedDiscountInformation, setResolvedDiscountInformation] = useState<
    DiscountInformation | null | undefined
  >(undefined);
  const [resolvedSavingsSummary, setResolvedSavingsSummary] = useState<string | undefined>();
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const pricingRequestIdRef = useRef(0);

  // Hold the latest callback in a ref so fetchCartPricing stays referentially
  // stable (callers don't have to memoize onPriceResolved to avoid refetch loops).
  const onPriceResolvedRef = useRef(onPriceResolved);
  useEffect(() => {
    onPriceResolvedRef.current = onPriceResolved;
  }, [onPriceResolved]);

  const fetchCartPricing = useCallback(
    async (unselectedOffers?: string[]) => {
      if (!collectibleItemId || shouldSkipPricing) {
        return;
      }

      const requestId = pricingRequestIdRef.current + 1;
      pricingRequestIdRef.current = requestId;
      setIsPricingLoading(true);
      try {
        const pricingResponse = await postCartPricing({
          featureKey: MARKETPLACE_OFFERS_FEATURE_KEY,
          items: [buildCartPricingItem(collectibleItemId, rentalOptionDays)],
          ...(unselectedOffers?.length ? { unselectedOffers } : {})
        });

        if (requestId !== pricingRequestIdRef.current) {
          return;
        }

        if (!pricingResponse) {
          setResolvedSavingsSummary(undefined);
          return;
        }

        const pricedItem =
          pricingResponse.items?.find(item => item.collectibleItemId === collectibleItemId) ??
          pricingResponse.items?.[0];

        if (pricedItem?.priceInRobux != null) {
          setResolvedPrice(pricedItem.priceInRobux);
        }

        setResolvedDiscountInformation(pricedItem?.discountInformation ?? null);
        setResolvedSavingsSummary(pricingResponse.savingsSummary?.trim() || undefined);
        onPriceResolvedRef.current?.(pricedItem?.priceInRobux ?? undefined);

        setOfferSelections(mapAvailableOffersToSelections(pricingResponse.availableOffers));
      } finally {
        if (requestId === pricingRequestIdRef.current) {
          setIsPricingLoading(false);
        }
      }
    },
    [collectibleItemId, rentalOptionDays, shouldSkipPricing]
  );

  useEffect(() => {
    if (!open) {
      pricingRequestIdRef.current += 1;
      setResolvedPrice(undefined);
      setResolvedDiscountInformation(undefined);
      setResolvedSavingsSummary(undefined);
      setOfferSelections([]);
      setIsPricingLoading(false);
      return undefined;
    }

    if (!collectibleItemId || shouldSkipPricing) {
      return undefined;
    }

    fetchCartPricing().catch(() => undefined);
    return undefined;
  }, [open, collectibleItemId, shouldSkipPricing, fetchCartPricing]);

  const handleOfferCheckedChange = useCallback(
    (offerId: string, checked: boolean) => {
      const updatedSelections = offerSelectionsRef.current.map(offer =>
        offer.offerId === offerId ? { ...offer, selected: checked } : offer
      );
      offerSelectionsRef.current = updatedSelections;
      setOfferSelections(updatedSelections);

      const unselected = updatedSelections
        .filter(offer => !offer.selected)
        .map(offer => offer.offerId);

      fetchCartPricing(unselected.length ? unselected : undefined).catch(() => undefined);
    },
    [fetchCartPricing]
  );

  const selectedOfferIds = useMemo(
    () => offerSelections.filter(offer => offer.selected).map(offer => offer.offerId),
    [offerSelections]
  );

  return {
    offerSelections,
    resolvedPrice,
    resolvedDiscountInformation,
    resolvedSavingsSummary,
    isPricingLoading,
    selectedOfferIds,
    handleOfferCheckedChange
  };
}
