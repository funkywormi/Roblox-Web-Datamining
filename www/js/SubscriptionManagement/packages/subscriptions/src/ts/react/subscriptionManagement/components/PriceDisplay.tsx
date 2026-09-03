import React, { useEffect } from 'react';
import { useTranslation } from 'react-utilities';
import { Price } from '../../../core/types/price';
import { PeriodType } from '../../../core/types/subscriptionEnums';
import '../../../../css/subscriptionManagement/priceDisplay.scss';

type PriceDisplayProps = {
  price: Price;
  period: PeriodType;
  periodCount?: number;
  className: string;
};

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, period, periodCount, className }) => {
  const { translate } = useTranslation();

  // Price-period suffix: " / month", " / year", " / 3 months". Label.SubscriptionDuration renders
  // the localized, parametrized duration ("month" / "3 months"), so any period/count works without
  // a dedicated key; the " / " forms the suffix. The price
  // itself is rendered by the adjacent price tag, so we use the duration-only key rather than
  // Action.PricePerSubscriptionDuration (which also embeds the price). periodCount is normalized
  // to >= 1 by the backend.
  const duration = translate('Label.SubscriptionDuration', {
    periodType: period,
    periodCount: periodCount ?? 1
  });
  const periodString = ` / ${duration}${className === 'resubscribe' ? '.' : ''}`;

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('price-tag:render', {
        detail: {
          tagClassName: `${className}-price text-description`,
          targetSelector: `.${className}-price-tag`
        }
      })
    );
  }, [price, className]);

  return (
    <span className='price-period'>
      <span
        className={`${className}-price-tag`}
        data-amount={price.amount}
        data-currency-code={price.currencyCode}
      />
      <span className={`${className}-period text-description`}>{periodString}</span>
    </span>
  );
};

export default PriceDisplay;
