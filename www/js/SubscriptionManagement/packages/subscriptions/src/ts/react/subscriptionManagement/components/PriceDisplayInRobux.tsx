import React from 'react';
import { useTranslation } from 'react-utilities';
import { Icon } from '@rbx/foundation-ui';
import { Skeleton } from '@rbx/ui';
import '../../../../css/subscriptionManagement/priceDisplay.scss';

type PriceDisplayInRobuxProps = {
  priceInRobux: number | null;
  totalDiscountAmountInRobux?: number | null;
  isLoading?: boolean;
};

const PriceDisplayInRobux: React.FC<PriceDisplayInRobuxProps> = ({
  priceInRobux,
  totalDiscountAmountInRobux,
  isLoading = false
}) => {
  const { translate } = useTranslation();

  if (isLoading) {
    return <Skeleton animate variant='text' width={120} height={22} />;
  }

  // This is a hack while the only discount source is Roblox Plus.
  // If/when we add more discount sources, we need to update this logic.
  const isPaid = (priceInRobux ?? 0) > 0;
  const hasDiscount = (totalDiscountAmountInRobux ?? 0) > 0;
  if (!isPaid && hasDiscount) {
    return (
      <span className='flex items-center gap-xsmall'>
        <Icon name='icon-regular-roblox-plus' size='Small' />
        <span>{translate('Label.Subscriptions.FreeWithPlus')}</span>
      </span>
    );
  }

  const periodString = ` ${translate('Label.Subscriptions.PerMonth')}`;

  return (
    <span className='robux-amount'>
      <span className='icon-robux-16x16' />
      <span className='price-period'>
        <span className='text-robux'>{priceInRobux?.toString()}</span>
        <span className='subscription-period text-description'>{periodString}</span>
      </span>
    </span>
  );
};

export default PriceDisplayInRobux;
