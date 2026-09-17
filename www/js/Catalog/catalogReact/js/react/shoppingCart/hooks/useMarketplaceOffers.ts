import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MARKETPLACE_OFFER_DISCOUNT_TYPE,
  MARKETPLACE_OFFERS_FEATURE_KEY,
  postCartPricing
} from '../../catalog/services/marketplaceSalesOffersService';
import type {
  CartPricingAvailableOffer,
  CartPricingDiscountInformation,
  CartPricingItemRequest,
  CartPricingItemResponse
} from '../../catalog/services/marketplaceSalesOffersService';

export type MarketplaceOfferSelection = {
  offerId: string;
  localizedText: string;
  selected: boolean;
};

export type CartPricedDiscountLine = {
  amount: number;
  /** Discount classification, e.g. `ROBLOX_PLUS` | `MARKETPLACE_OFFER`. */
  discountType?: string;
  discountCampaign?: string;
  localizedAttribution?: string;
};

export type CartPricedItem = {
  priceInRobux: number;
  /** Price before cart-pricing discounts, when the API reports one. */
  originalPrice?: number;
  /** Whether cart-pricing attributed a marketplace offer to this specific item. */
  hasOfferDiscount: boolean;
  /**
   * Every discount cart-pricing applied to this item, offer and Plus alike.
   * These are authoritative for the savings breakdown: an offer is applied
   * before the Plus benefit, so the Plus amount here is a percentage of the
   * already-discounted price and does not match the catalog item details.
   */
  discountLines: CartPricedDiscountLine[];
};

export type MarketplaceOfferPricing = Record<string, CartPricedItem & { offerIds: string[] }>;

export type UseMarketplaceOffersResult = {
  offerSelections: MarketplaceOfferSelection[];
  marketplaceOfferPricing: MarketplaceOfferPricing;
  /** Server-localized savings sentence, e.g. "Saving \\u{E002}60 with Plus and offer". */
  savingsSummary?: string;
  isPricingLoading: boolean;
  handleOfferCheckedChange: (offerId: string, checked: boolean) => void;
};

export function mapAvailableOffersToSelections(
  availableOffers: CartPricingAvailableOffer[] | null | undefined
): MarketplaceOfferSelection[] {
  return (
    availableOffers?.reduce<MarketplaceOfferSelection[]>((offers, offer) => {
      const localizedText = offer.localizedDescription?.trim();
      if (offer.offerId && localizedText) {
        offers.push({
          offerId: offer.offerId,
          localizedText,
          selected: offer.selected ?? false
        });
      }
      return offers;
    }, []) ?? []
  );
}

/**
 * An offer only ever discounts some of the priced items -- a "20% off up to 20
 * Robux" offer can be exhausted by the first line item -- so per-item attribution
 * has to come from the response rather than from comparing prices.
 */
export function mapDiscountLines(
  discountInformation: CartPricingDiscountInformation | null | undefined
): CartPricedDiscountLine[] {
  return (discountInformation?.discounts ?? []).map(discount => ({
    amount: discount.discountAmount ?? discount.robuxDiscountAmount ?? 0,
    discountType: discount.discountType,
    discountCampaign: discount.discountCampaign,
    localizedAttribution: discount.localizedDiscountAttribution?.trim() || undefined
  }));
}

export function isMarketplaceOfferDiscountLine(line: CartPricedDiscountLine): boolean {
  return line.discountType === MARKETPLACE_OFFER_DISCOUNT_TYPE;
}

export function mapPricedItems(
  items: CartPricingItemResponse[] | null | undefined
): Record<string, CartPricedItem> {
  const pricedItems: Record<string, CartPricedItem> = {};

  (items ?? []).forEach(item => {
    if (item.collectibleItemId && item.priceInRobux != null) {
      const discountLines = mapDiscountLines(item.discountInformation);
      pricedItems[item.collectibleItemId] = {
        priceInRobux: item.priceInRobux,
        originalPrice: item.discountInformation?.originalPrice ?? item.regularPriceInRobux,
        hasOfferDiscount: discountLines.some(isMarketplaceOfferDiscountLine),
        discountLines
      };
    }
  });

  return pricedItems;
}

export function buildMarketplaceOfferPricing(
  pricedItems: Record<string, CartPricedItem>,
  offerSelections: MarketplaceOfferSelection[]
): MarketplaceOfferPricing {
  const selectedOfferIds = offerSelections
    .filter(offer => offer.selected)
    .map(offer => offer.offerId);
  const pricing: MarketplaceOfferPricing = {};

  Object.entries(pricedItems).forEach(([collectibleItemId, pricedItem]) => {
    // The order API claims the offer against every line item it is sent with, so
    // it can only ride along with the items cart-pricing actually discounted. A
    // capped offer ("20% off up to 20 Robux") is regularly exhausted by the
    // first line item, and sending its id on the rest would redeem the offer
    // against items whose agreed price never included it.
    pricing[collectibleItemId] = {
      ...pricedItem,
      offerIds: pricedItem.hasOfferDiscount ? selectedOfferIds : []
    };
  });

  return pricing;
}

/**
 * Prices all offer-eligible shopping-cart items together. The marketplace-sales
 * response exposes cart-level offer choices, while the order API consumes those
 * selected offer IDs on each eligible line item.
 */
export default function useMarketplaceOffers(
  items: CartPricingItemRequest[]
): UseMarketplaceOffersResult {
  const [offerSelections, setOfferSelections] = useState<MarketplaceOfferSelection[]>([]);
  const [pricedItems, setPricedItems] = useState<Record<string, CartPricedItem>>({});
  const [savingsSummary, setSavingsSummary] = useState<string>();
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const offerSelectionsRef = useRef<MarketplaceOfferSelection[]>([]);
  // Unchecking an offer is a user choice that has to outlive the cart edits that
  // follow it: every request replays the ids, otherwise the next cart change
  // re-applies the offer and the response flips the checkbox back on.
  const unselectedOfferIdsRef = useRef<string[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    offerSelectionsRef.current = offerSelections;
  }, [offerSelections]);

  // The caller rebuilds the line-item array on every render, so key all work off
  // a stable serialization of the request instead of the array identity. Reading
  // the items through a ref keeps `fetchCartPricing` referentially stable.
  const itemsKey = JSON.stringify(items);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const fetchCartPricing = useCallback(async () => {
    const requestItems = itemsRef.current;
    if (requestItems.length === 0) {
      return;
    }

    const unselectedOffers = unselectedOfferIdsRef.current;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsPricingLoading(true);

    try {
      const response = await postCartPricing({
        featureKey: MARKETPLACE_OFFERS_FEATURE_KEY,
        items: requestItems,
        ...(unselectedOffers.length ? { unselectedOffers } : {})
      });

      // A newer request superseded this one, or the request failed.
      if (requestId !== requestIdRef.current || !response) {
        return;
      }

      setPricedItems(mapPricedItems(response.items));
      setSavingsSummary(response.savingsSummary?.trim() || undefined);

      const selections = mapAvailableOffersToSelections(response.availableOffers);
      offerSelectionsRef.current = selections;
      setOfferSelections(selections);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsPricingLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    requestIdRef.current += 1;

    // Whatever is in state was priced for the previous item set, so it is wrong
    // for this one: the rows, the cart total and the agreed price submitted with
    // the order all read it. Drop it until the replacement response lands, which
    // never happens when postCartPricing swallows a failure. The offer selections
    // are cart-level rather than per-item, so they survive the cart edit.
    setPricedItems({});
    setSavingsSummary(undefined);

    if (itemsRef.current.length === 0) {
      // Nothing priceable in the cart -- drop any offers resolved for a previous
      // selection too.
      setOfferSelections([]);
      setIsPricingLoading(false);
      return;
    }

    fetchCartPricing().catch(() => undefined);
  }, [itemsKey, fetchCartPricing]);

  const handleOfferCheckedChange = useCallback(
    (offerId: string, checked: boolean) => {
      const selections = offerSelectionsRef.current.map(offer =>
        offer.offerId === offerId ? { ...offer, selected: checked } : offer
      );
      offerSelectionsRef.current = selections;
      setOfferSelections(selections);

      unselectedOfferIdsRef.current = selections
        .filter(offer => !offer.selected)
        .map(offer => offer.offerId);
      fetchCartPricing().catch(() => undefined);
    },
    [fetchCartPricing]
  );

  const marketplaceOfferPricing = useMemo(
    () => buildMarketplaceOfferPricing(pricedItems, offerSelections),
    [offerSelections, pricedItems]
  );

  return {
    offerSelections,
    marketplaceOfferPricing,
    savingsSummary,
    isPricingLoading,
    handleOfferCheckedChange
  };
}
