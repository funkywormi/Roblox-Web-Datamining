import React, { useState, useMemo } from 'react';
import { TDetailEntry, TDiscountInformation, TDiscount } from 'Roblox';
import { Icon } from '@rbx/foundation-ui';
import { TCartItem, TSubscriptionStatus } from '../constants/types';
import {
  robloxSubscriptionTranslations,
  catalogTranslations
} from '../services/translationService';
import EmbeddableText from '../../catalog/components/EmbeddableText';
import type { MarketplaceOfferPricing } from '../hooks/useMarketplaceOffers';
import { MARKETPLACE_OFFER_DISCOUNT_TYPE } from '../../catalog/services/marketplaceSalesOffersService';

type TDiscountSummary = {
  localizedAttribution: string;
  totalAmount: number;
  discountPercentage: number;
  isOffer: boolean;
  isPlus: boolean;
};

type SubscribeUpsellContainerProps = {
  subtotal?: number;
  itemCount?: number;
  selectedItems: TCartItem[];
  itemDetails: Record<string, TDetailEntry>;
  subscriptionStatus: TSubscriptionStatus;
  marketplaceOfferPricing?: MarketplaceOfferPricing;
  savingsSummary?: string;
  /**
   * Which footer slot this instance fills. The savings breakdown sits above the
   * cart total, while the Plus upsell shown to non-subscribers sits below the
   * buy button, so the two states render from different places in the footer.
   */
  placement?: 'savings' | 'upsell';
};

const isExpandable = true;
const MIN_ELIGIBLE_PRICE = 10;
const MAX_ELIGIBLE_PRICE = 1000000;

// cart-pricing classifies Plus benefit lines via `discountType`; the catalog item
// details only carry campaign names.
const PLUS_DISCOUNT_TYPE = 'ROBLOX_PLUS';
const PLUS_DISCOUNT_CAMPAIGNS = [
  'BlackbirdSubscription',
  'RobloxPlusSubscription',
  'RobloxSubscription'
];

// Stable identity so the savings memo does not recompute on every render when
// the cart has nothing priced by cart-pricing.
const NO_OFFER_PRICING: MarketplaceOfferPricing = {};

const isPlusDiscount = (discountType?: string, discountCampaign?: string): boolean =>
  discountType === PLUS_DISCOUNT_TYPE ||
  (!!discountCampaign && PLUS_DISCOUNT_CAMPAIGNS.includes(discountCampaign));

const isResalePurchase = (details: TDetailEntry): boolean => {
  const collectible = details.collectibleItemDetails;
  return (
    details.saleLocationType === 'ExperiencesDevApiOnly' ||
    (collectible?.lowestResalePrice !== undefined &&
      collectible.lowestResalePrice > 0 &&
      (collectible.unitsAvailableForConsumption === 0 ||
        collectible.lowestResalePrice < (collectible.price ?? Infinity)))
  );
};

function SubscribeUpsellContainer({
  subtotal = 0,
  itemCount = 0,
  selectedItems,
  itemDetails,
  subscriptionStatus,
  marketplaceOfferPricing = NO_OFFER_PRICING,
  savingsSummary,
  placement = 'savings'
}: SubscribeUpsellContainerProps): JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(false);

  // Savings come from cart-pricing whenever it priced the item, and from the
  // catalog item details otherwise. The two cannot be mixed for a single item:
  // cart-pricing applies the offer first and computes the Plus benefit off the
  // discounted price, so its Plus amount is smaller than the item details'.
  const { discountSummaries, totalSavings, hasFallbackSavings } = useMemo(() => {
    const summaryMap = new Map<string, TDiscountSummary>();
    let total = 0;
    let fallbackSavings = false;

    const addDiscount = (summary: TDiscountSummary, key: string) => {
      const existing = summaryMap.get(key);
      if (existing) {
        existing.totalAmount += summary.totalAmount;
        return;
      }
      summaryMap.set(key, summary);
    };

    selectedItems.forEach(item => {
      const details: TDetailEntry | undefined = itemDetails[item.itemId];

      if (!details) return;

      // Don't include discounts for resale items
      if (isResalePurchase(details)) return;

      const pricedItem = details.collectibleItemId
        ? marketplaceOfferPricing[details.collectibleItemId]
        : undefined;

      if (pricedItem) {
        pricedItem.discountLines.forEach(line => {
          const isOffer = line.discountType === MARKETPLACE_OFFER_DISCOUNT_TYPE;
          const key = line.discountType || line.localizedAttribution || line.discountCampaign || '';
          addDiscount(
            {
              localizedAttribution:
                line.localizedAttribution || line.discountCampaign || 'Discount',
              totalAmount: line.amount,
              discountPercentage: 0,
              isOffer,
              isPlus: !isOffer && isPlusDiscount(line.discountType, line.discountCampaign)
            },
            key || 'discount'
          );
        });

        total +=
          pricedItem.originalPrice != null
            ? pricedItem.originalPrice - pricedItem.priceInRobux
            : pricedItem.discountLines.reduce((sum, line) => sum + line.amount, 0);
        return;
      }

      let discountInfo: TDiscountInformation | undefined = details.discountInformation;

      const { timedOptions } = details;
      if (timedOptions && timedOptions.length > 0) {
        const selectedTimedOption = item.timedOptions?.find(opt => opt.selected);
        const selectedDays = selectedTimedOption?.days ?? timedOptions[0]?.days;
        const matchingTimedOption = timedOptions.find(opt => opt.days === selectedDays);
        if (matchingTimedOption) {
          discountInfo = matchingTimedOption.discountInformation;
        }
      }

      if (discountInfo && discountInfo.discounts && Array.isArray(discountInfo.discounts)) {
        discountInfo.discounts.forEach((discount: TDiscount) => {
          const key =
            discount.localizedDiscountAttribution || discount.discountCampaign || 'discount';
          const amount =
            typeof discount.robuxDiscountAmount === 'number' ? discount.robuxDiscountAmount : 0;
          const percentage =
            typeof discount.robuxDiscountPercentage === 'number'
              ? discount.robuxDiscountPercentage
              : 0;

          addDiscount(
            {
              localizedAttribution:
                discount.localizedDiscountAttribution || discount.discountCampaign || 'Discount',
              totalAmount: amount,
              discountPercentage: percentage,
              isOffer: false,
              isPlus: isPlusDiscount(undefined, discount.discountCampaign)
            },
            key
          );
        });
      }

      if (discountInfo?.totalDiscountAmount) {
        total += discountInfo.totalDiscountAmount;
        fallbackSavings = true;
      }
    });

    return {
      discountSummaries: Array.from(summaryMap.values()),
      totalSavings: total,
      hasFallbackSavings: fallbackSavings
    };
  }, [selectedItems, itemDetails, marketplaceOfferPricing]);

  // cart-pricing returns its own localized savings sentence, which already reads
  // "Saving <robux>60 with Plus and offer". Prefer it over composing one here,
  // but only when it accounts for every discount shown: it covers the items
  // cart-pricing priced, not those falling back to the catalog item details.
  const serverSavingsSummary = hasFallbackSavings ? undefined : savingsSummary;

  const hasOfferSavings = discountSummaries.some(
    discount => discount.isOffer && discount.totalAmount > 0
  );
  // Anything that is not an offer keeps the existing "with Plus" copy, which is
  // how creator discounts have always been described here.
  const hasNonOfferSavings = discountSummaries.some(
    discount => !discount.isOffer && discount.totalAmount > 0
  );

  // Check if there's at least one eligible item for upsell (10-1M Robux, not resale)
  // Also eligible: Limited items being sold from original stock (not resale)
  const hasEligibleItem = useMemo(() => {
    return selectedItems.some(item => {
      const details: TDetailEntry | undefined = itemDetails[item.itemId];
      if (!details) return false;

      // Get the item price
      let price = details.price ?? details.lowestPrice ?? 0;
      const { timedOptions } = details;
      if (timedOptions && timedOptions.length > 0) {
        const selectedTimedOption = item.timedOptions?.find(opt => opt.selected);
        const selectedDays = selectedTimedOption?.days ?? timedOptions[0]?.days;
        const matchingTimedOption = timedOptions.find(opt => opt.days === selectedDays);
        if (matchingTimedOption) {
          price = matchingTimedOption.price;
        }
      }

      // Eligible if: 10-1M Robux and not a resale purchase
      return (
        price >= MIN_ELIGIBLE_PRICE && price <= MAX_ELIGIBLE_PRICE && !isResalePurchase(details)
      );
    });
  }, [selectedItems, itemDetails]);

  const getSavingsHeaderText = (robuxAmountHtml: string): string => {
    const params = { robuxAmount: robuxAmountHtml, amountStart: '', amountEnd: '' };

    if (hasOfferSavings && hasNonOfferSavings) {
      const translated = robloxSubscriptionTranslations.descriptionSavingWithPlusAndOffer(params);
      if (translated && !translated.includes('Description.SavingWithPlusAndOffer')) {
        return translated;
      }
      return `Saving ${robuxAmountHtml} with Plus and offer`;
    }

    if (hasOfferSavings) {
      const translated = robloxSubscriptionTranslations.descriptionSavingWithOffer(params);
      if (translated && !translated.includes('Description.SavingWithOffer')) {
        return translated;
      }
      return `Saving ${robuxAmountHtml} with offer`;
    }

    const translated = robloxSubscriptionTranslations.descriptionSavingWithPlus(params);
    if (translated && !translated.includes('Description.SavingWithPlus')) {
      return translated;
    }
    return `Saving ${robuxAmountHtml} with Plus`;
  };

  const getDiscountLabel = (discountPercentage: number): string => {
    const translated = robloxSubscriptionTranslations.labelBlackbirdUpsellBanner({
      discountPercentage: discountPercentage.toString()
    });
    if (translated && !translated.includes('Label.BlackbirdUpsellBanner')) {
      return translated;
    }
    return `Get ${discountPercentage}% off with Roblox Plus`;
  };

  const getSubscribeButtonText = (): string => {
    if (subscriptionStatus.hasFreeTrial) {
      const translated = robloxSubscriptionTranslations.actionTrialSubscription();
      if (translated && !translated.includes('Action.TrialSubscription')) {
        return translated;
      }
      return 'Get Free Trial';
    }
    const translated = robloxSubscriptionTranslations.actionSubscribe();
    if (translated && !translated.includes('Action.Subscribe')) {
      return translated;
    }
    return 'Subscribe';
  };

  const getSubtotalLabel = (count: number): string => {
    const translated = catalogTranslations.labelSubtotal(count);
    if (translated && !translated.includes('Label.Subtotal')) {
      return translated.replace(/\$/g, '');
    }
    const itemWord = count === 1 ? 'Item' : 'Items';
    return `Subtotal (${count} ${itemWord})`;
  };

  const hasDiscounts = discountSummaries.length > 0 && totalSavings > 0;

  // User HAS subscription - show savings dropdown if there are discounts
  if (subscriptionStatus.hasSubscription) {
    if (placement !== 'savings' || !hasDiscounts) {
      return null;
    }
    // Continue to render savings dropdown below
  } else {
    // User does NOT have subscription - show upsell banner if there's an eligible
    // item. There is no savings breakdown in this state: the only discount is the
    // offer, which the item rows already show as a strikethrough price.
    if (placement !== 'upsell' || !hasEligibleItem) {
      return null;
    }

    const upsellDiscountPercent =
      subscriptionStatus.discountPercentage > 0
        ? subscriptionStatus.discountPercentage
        : discountSummaries[0]?.discountPercentage || 10;

    return (
      <div className='subscribe-upsell-container subscribe-upsell-banner'>
        <div className='subscribe-upsell-header-content'>
          <Icon name='icon-filled-roblox-plus' size='Medium' className='roblox-plus-icon' />
          <span className='subscribe-upsell-title'>{getDiscountLabel(upsellDiscountPercent)}</span>
        </div>
        <a href='/plus' className='subscribe-link'>
          {getSubscribeButtonText()}
        </a>
      </div>
    );
  }

  if (!isExpandable) {
    const firstDiscount = discountSummaries[0];
    return (
      <div className='subscribe-upsell-container subscribe-upsell-compact'>
        <div className='subscribe-upsell-header-content'>
          <Icon name='icon-filled-roblox-plus' size='Medium' className='roblox-plus-icon' />
          <span className='subscribe-upsell-title'>{firstDiscount.localizedAttribution}</span>
        </div>
        <span className='subscribe-upsell-value discount-value'>
          <span className='icon-robux-16x16' />
          <span>{totalSavings.toLocaleString()}</span>
        </span>
      </div>
    );
  }

  return (
    <div className='subscribe-upsell-container'>
      <button
        type='button'
        className='subscribe-upsell-header'
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}>
        <div className='subscribe-upsell-header-content'>
          {hasNonOfferSavings && (
            <Icon name='icon-filled-roblox-plus' size='Medium' className='roblox-plus-icon' />
          )}
          {serverSavingsSummary ? (
            <EmbeddableText className='subscribe-upsell-title' text={serverSavingsSummary} />
          ) : (
            <span
              className='subscribe-upsell-title'
              dangerouslySetInnerHTML={{
                __html: getSavingsHeaderText(
                  `<span class='icon-robux-16x16'></span><span>${totalSavings.toLocaleString()}</span>`
                )
              }}
            />
          )}
        </div>
        <span className={isExpanded ? 'icon-up chevron-icon' : 'icon-down chevron-icon'} />
      </button>

      {isExpanded && (
        <div className='subscribe-upsell-content'>
          <div className='subscribe-upsell-row'>
            <span className='subscribe-upsell-label'>{getSubtotalLabel(itemCount)}</span>
            <span className='subscribe-upsell-value'>
              <span className='icon-robux-16x16' />
              <span>{subtotal.toLocaleString()}</span>
            </span>
          </div>
          {discountSummaries.map(discount => (
            <div
              key={discount.localizedAttribution}
              className='subscribe-upsell-row subscribe-upsell-discount'>
              <span className='subscribe-upsell-label'>
                {discount.discountPercentage > 0
                  ? getDiscountLabel(discount.discountPercentage)
                  : discount.localizedAttribution}
              </span>
              <span className='subscribe-upsell-value discount-value'>
                <span className='icon-robux-16x16' />
                <span>{(discount.totalAmount || 0).toLocaleString()}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubscribeUpsellContainer;
