import React from 'react';
import { getFreeTrialDisplay } from '@rbx/payments/services/subscriptions';
import { type PurchaseTranslate } from '../../itemPurchase/useTranslate';
import { translateHtml } from '@rbx/translation-utils';
import type { Money, PeriodType, SubscriptionOffer } from '@rbx/client-subscriptions-api/v2';

const formatMoney = (money: Money): string => {
  const amount = money.units + money.nanos * 1e-9;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: money.currencyCode
  }).format(amount);
};

type BillingInfoDisplayProps = {
  translate: PurchaseTranslate;
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
  const freeTrialOffer = eligibleOffers?.find(
    (o: SubscriptionOffer) => o.offerType === 'FreeTrial'
  );
  const isFreeTrial = freeTrialOffer != null;
  const trialDisplay = getFreeTrialDisplay(freeTrialOffer, periodType);

  const freeTrialContent = trialDisplay
    ? translateHtml(
        translate,
        'Label.RobloxPlusPriceRowV3',
        [
          {
            opening: 'boldStart',
            closing: 'boldEnd',
            render: text => <span className='font-bold'>{text}</span>
          }
        ],
        {
          trialDuration: String(trialDisplay.trialDuration),
          trialPeriodLabel: translate(trialDisplay.trialPeriodKey),
          price: displayPrice,
          periodType
        }
      )
    : translateHtml(
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
      );

  const content = isFreeTrial
    ? freeTrialContent
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
