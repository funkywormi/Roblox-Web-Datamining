import React from 'react';
import { TranslateFunction } from '@rbx/core-scripts/react';
import { translateHtml } from '@rbx/translation-utils';
import type { Money, PeriodType, SubscriptionOffer } from '@rbx/client-subscriptions-api/v1';

const formatMoney = (money: Money): string => {
  const amount = money.units + money.nanos * 1e-9;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: money.currencyCode
  }).format(amount);
};

type BillingInfoDisplayProps = {
  translate: TranslateFunction;
  eligibleOffers?: SubscriptionOffer[];
  price: Money;
  periodType: PeriodType;
};

const BillingInfoDisplay: React.FC<BillingInfoDisplayProps> = ({
  translate,
  eligibleOffers,
  price,
  periodType
}) => {
  const displayPrice = formatMoney(price);
  const isFreeTrial =
    eligibleOffers?.some((o: SubscriptionOffer) => o.offerType === 'FreeTrial') ?? false;

  const content = isFreeTrial
    ? translateHtml(
        translate,
        'Description.BillingInfoWithFreeTrialOffer',
        [
          {
            opening: 'boldTagStart',
            closing: 'boldTagEnd',
            render: text => <span className='font-bold'>{text}</span>
          }
        ],
        { trialPeriod: '1', trialPeriodType: periodType, price: displayPrice, periodType }
      )
    : translateHtml(
        translate,
        'Description.BillingInfo',
        [
          {
            opening: 'priceStart',
            closing: 'priceEnd',
            render: text => <span className='text-heading-medium'>{text}</span>
          }
        ],
        { price: displayPrice, periodType }
      );

  return <span className='text-body-large'>{content}</span>;
};

export default BillingInfoDisplay;
