import React, { useMemo } from 'react';
import { TranslateFunction } from '@rbx/core-scripts/react';
import { Icon } from '@rbx/foundation-ui';
import type {
  PeriodType,
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionTenureDiscount
} from '@rbx/client-subscriptions-api/v1';
import type { TTailwindIconClass } from '@rbx/foundation-tailwind/classes';

type BenefitItemProps = {
  iconName: TTailwindIconClass;
  label: React.ReactNode;
};

const BenefitItem: React.FC<BenefitItemProps> = ({ iconName, label }) => (
  <div className='gap-x-large align-items-center flex flex-row'>
    <Icon name={iconName} size='Large' />
    <span className='text-body-large'>{label}</span>
  </div>
);

export type BenefitListProps = {
  translate: TranslateFunction;
  featureConfig: RobloxSubscriptionProductFeatureConfig;
  periodType: PeriodType;
};

const formatPercent = (value: number): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);

const BenefitList: React.FC<BenefitListProps> = ({ translate, featureConfig, periodType }) => {
  const baseDiscount = useMemo(
    () =>
      featureConfig.virtualTransactionDiscounts?.find(
        (d: SubscriptionTenureDiscount) => d.periodIndex === 0
      ),
    [featureConfig]
  );

  const nextDiscount = useMemo(
    () =>
      featureConfig.virtualTransactionDiscounts
        ?.filter((d: SubscriptionTenureDiscount) => d.periodIndex > 0)
        .reduce<SubscriptionTenureDiscount | null>(
          (min: SubscriptionTenureDiscount | null, d: SubscriptionTenureDiscount) =>
            min === null || d.periodIndex < min.periodIndex ? d : min,
          null
        ),
    [featureConfig]
  );

  return (
    <div className='gap-y-xlarge flex flex-col'>
      {baseDiscount && (
        <BenefitItem
          iconName='icon-regular-tag'
          label={translate('Label.BlackbirdVTDiscountFirst', {
            discountPercent: formatPercent(baseDiscount.discountPercent)
          })}
        />
      )}
      {nextDiscount && (
        <BenefitItem
          iconName='icon-regular-tag-arrow-up'
          label={translate('Label.BlackbirdVTDiscountSecond', {
            discountPercent: formatPercent(nextDiscount.discountPercent),
            periodIndex: String(nextDiscount.periodIndex),
            periodType
          })}
        />
      )}
      {featureConfig.privateServerDiscounts && featureConfig.privateServerDiscounts.length > 0 && (
        <BenefitItem
          iconName='icon-regular-controller'
          label={translate('Description.Benefit.PrivateServers')}
        />
      )}
      {featureConfig.isRobuxTransferEnabled && (
        <BenefitItem
          iconName='icon-regular-robux'
          label={translate('Description.Benefit.RobuxTransfers')}
        />
      )}
    </div>
  );
};

export default BenefitList;
