import React, { useState, useMemo } from 'react';
import { TDetailEntry, TDiscountInformation, TDiscount } from 'Roblox';
import { Icon } from '@rbx/foundation-ui';
import { TCartItem, TSubscriptionStatus } from '../constants/types';
import {
  robloxSubscriptionTranslations,
  catalogTranslations
} from '../services/translationService';

type TDiscountSummary = {
  localizedAttribution: string;
  totalAmount: number;
  discountPercentage: number;
};

type SubscribeUpsellContainerProps = {
  subtotal?: number;
  itemCount?: number;
  selectedItems: TCartItem[];
  itemDetails: Record<string, TDetailEntry>;
  subscriptionStatus: TSubscriptionStatus;
};

const isExpandable = true;
const MIN_ELIGIBLE_PRICE = 10;
const MAX_ELIGIBLE_PRICE = 1000000;

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
  subscriptionStatus
}: SubscribeUpsellContainerProps): JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(false);

  const discountSummaries = useMemo(() => {
    const summaryMap = new Map<string, TDiscountSummary>();

    selectedItems.forEach(item => {
      const details: TDetailEntry | undefined = itemDetails[item.itemId];

      if (!details) return;

      // Don't include discounts for resale items
      if (isResalePurchase(details)) return;

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

          const existing = summaryMap.get(key);
          if (existing) {
            existing.totalAmount += amount;
          } else {
            summaryMap.set(key, {
              localizedAttribution:
                discount.localizedDiscountAttribution || discount.discountCampaign || 'Discount',
              totalAmount: amount,
              discountPercentage: percentage
            });
          }
        });
      }
    });

    return Array.from(summaryMap.values());
  }, [selectedItems, itemDetails]);

  const totalSavings = useMemo(() => {
    let total = 0;
    selectedItems.forEach(item => {
      const details: TDetailEntry | undefined = itemDetails[item.itemId];
      if (!details) return;

      // Don't include savings for resale items
      if (isResalePurchase(details)) return;

      let discountInfo = details.discountInformation;

      const { timedOptions } = details;
      if (timedOptions && timedOptions.length > 0) {
        const selectedTimedOption = item.timedOptions?.find(opt => opt.selected);
        const selectedDays = selectedTimedOption?.days ?? timedOptions[0]?.days;
        const matchingTimedOption = timedOptions.find(opt => opt.days === selectedDays);
        if (matchingTimedOption) {
          discountInfo = matchingTimedOption.discountInformation;
        }
      }

      if (discountInfo?.totalDiscountAmount) {
        total += discountInfo.totalDiscountAmount;
      }
    });
    return total;
  }, [selectedItems, itemDetails]);

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

  const getSavingWithPlusText = (robuxAmountHtml: string): string => {
    const translated = robloxSubscriptionTranslations.descriptionSavingWithPlus({
      robuxAmount: robuxAmountHtml,
      amountStart: '',
      amountEnd: ''
    });
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
    if (!hasDiscounts) {
      return null;
    }
    // Continue to render savings dropdown below
  } else {
    // User does NOT have subscription - show upsell banner if there's an eligible item
    if (!hasEligibleItem) {
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
          <Icon name='icon-filled-roblox-plus' size='Medium' className='roblox-plus-icon' />
          <span
            className='subscribe-upsell-title'
            dangerouslySetInnerHTML={{
              __html: getSavingWithPlusText(
                `<span class='icon-robux-16x16'></span><span>${totalSavings.toLocaleString()}</span>`
              )
            }}
          />
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
