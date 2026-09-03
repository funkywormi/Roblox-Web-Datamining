import React, { useCallback, useState } from 'react';
import { TranslateFunction } from '@rbx/core-scripts/react';
import { Badge, Icon } from '@rbx/foundation-ui';
import type { SubscriptionProductInfo, SubscriptionOffer } from '@rbx/client-subscriptions-api/v1';
import useUpsellTracking from '../../hooks/useUpsellTracking';

const NEW_BADGE_SEEN_STORAGE_KEY = 'roblox_plus_upsell_new_badge_seen';

const readHasSeenUpsellNewBadge = (): boolean => {
  try {
    return window.localStorage.getItem(NEW_BADGE_SEEN_STORAGE_KEY) === 'true';
  } catch {
    // If localStorage is unavailable, fail closed to "seen" — writing would
    // also fail, so the badge would otherwise show forever.
    return true;
  }
};

const writeHasSeenUpsellNewBadge = (): void => {
  try {
    window.localStorage.setItem(NEW_BADGE_SEEN_STORAGE_KEY, 'true');
  } catch {
    // No-op: localStorage may be unavailable in some environments.
  }
};

type SubscriptionUpsellBannerProps = {
  translate: TranslateFunction;
  assetType: string;
  subscriptionProductInfo?: SubscriptionProductInfo;
  onBannerClick: () => void;
};

const SubscriptionUpsellBanner: React.FC<SubscriptionUpsellBannerProps> = ({
  translate,
  assetType,
  subscriptionProductInfo,
  onBannerClick
}) => {
  const [hasSeenUpsellNewBadge, setHasSeenUpsellNewBadge] = useState(readHasSeenUpsellNewBadge);

  const featureConfig =
    subscriptionProductInfo?.productTypeDetails.robloxSubscriptionProductDetails?.featureConfig;
  const initDiscount = featureConfig?.virtualTransactionDiscounts?.find(d => d.periodIndex === 0);

  const bannerText = translate('Label.BlackbirdUpsellBanner', {
    discountPercentage: initDiscount?.discountPercent?.toFixed(0)
  });

  const isFreeTrial =
    subscriptionProductInfo?.eligibleOffers?.some(
      (o: SubscriptionOffer) => o.offerType === 'FreeTrial'
    ) ?? false;

  useUpsellTracking(
    'UnifiedPurchaseModalUpsellBanner',
    assetType,
    Boolean(subscriptionProductInfo)
  );

  const handleBannerClick = useCallback(() => {
    writeHasSeenUpsellNewBadge();
    setHasSeenUpsellNewBadge(true);
    onBannerClick();
  }, [onBannerClick]);

  const actionContent = !hasSeenUpsellNewBadge ? (
    <Badge variant='Contrast' label={translate('Label.New')} />
  ) : (
    <span className='content-default underline'>
      {isFreeTrial ? translate('Action.TrialSubscription') : translate('Action.Subscribe')}
    </span>
  );

  return subscriptionProductInfo ? (
    <button
      type='button'
      className='gap-y-medium flex flex-row justify-between padding-medium bg-shift-100 stroke-default stroke-thick radius-medium cursor-pointer text-body-medium margin-top-[12px]'
      onClick={handleBannerClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleBannerClick();
        }
      }}>
      <div className='gap-x-small flex items-center'>
        <Icon name='icon-regular-roblox-plus' size='Small' />
        <span>{bannerText}</span>
      </div>
      {actionContent}
    </button>
  ) : null;
};

export default SubscriptionUpsellBanner;
