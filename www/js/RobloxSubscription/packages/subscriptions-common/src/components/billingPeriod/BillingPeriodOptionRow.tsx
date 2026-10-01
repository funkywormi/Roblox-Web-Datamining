import { PeriodType } from "@rbx/client-subscriptions-api/v2";
import { useTranslation } from "@rbx/core-scripts/react";
import { Badge, OptionSelector } from "@rbx/foundation-ui";
import { getSubscriptionPeriodTranslationKey } from "@rbx/payments/services/subscriptions";

import { getPricePerMonth, getSavingsPercent } from "../../utils/billingPeriod";

import type { BillingPeriodOption, BillingPeriodPrice } from "../../utils/billingPeriod";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import type { FC } from "react";

const getTermLabel = (months: number, translate: TranslateFunction): string => {
  switch (months) {
    case 1:
      return translate("Label.BillingPeriodMonthly");
    case 3:
      return translate("Label.BillingPeriodThreeMonths");
    case 6:
      return translate("Label.BillingPeriodSixMonths");
    case 12:
      return translate("Label.BillingPeriodYearly");
    default:
      return translate(getSubscriptionPeriodTranslationKey(PeriodType.Month, months), {
        periodCount: months,
      });
  }
};

export type BillingPeriodOptionRowProps = {
  option: BillingPeriodOption;
  isSelected: boolean;
  isBestValue: boolean;
  onSelect: () => void;
};

const BillingPeriodOptionRow: FC<BillingPeriodOptionRowProps> = ({
  option,
  isSelected,
  isBestValue,
  onSelect,
}) => {
  const { translate, intl } = useTranslation();

  const formatPrice = ({ amount, currencyCode }: BillingPeriodPrice) =>
    intl.n(amount, { style: "currency", currency: currencyCode });

  const savingsPercent = getSavingsPercent(option);
  const pricePerMonth = formatPrice({
    amount: getPricePerMonth(option),
    currencyCode: option.price.currencyCode,
  });

  let hint: string | undefined;
  if (option.months > 1) {
    hint =
      savingsPercent === undefined
        ? translate("Action.PricePerMonth", {
            price: pricePerMonth,
            periodType: PeriodType.Month,
          })
        : translate("Label.BillingPeriodSavings", {
            pricePerMonth,
            savingsPercent: intl.n(savingsPercent / 100, { style: "percent" }),
          });
  }

  const content = (
    <div className="width-full min-height-1000 gap-small flex flex-row items-center justify-between">
      <div className="min-width-0 flex flex-col items-start">
        <div className="gap-xsmall flex flex-row items-center">
          <span className="text-title-medium content-emphasis">
            {getTermLabel(option.months, translate)}
          </span>
          {isBestValue && (
            <Badge label={translate("Label.BestValue")} size="XSmall" variant="Neutral" />
          )}
        </div>
        {hint && <span className="text-body-medium content-default">{hint}</span>}
      </div>
      <div className="gap-small flex shrink-0 flex-row items-center">
        {savingsPercent !== undefined && option.strikethroughPrice && (
          <span className="text-label-medium line-through [color:var(--color-extended-gray-600)]">
            {formatPrice(option.strikethroughPrice)}
          </span>
        )}
        <span className="text-label-medium content-emphasis">{formatPrice(option.price)}</span>
      </div>
    </div>
  );

  return (
    <div data-testid={`billing-period-option-${option.productId}`}>
      <OptionSelector
        hideSelectedIndicator
        isSelected={isSelected}
        label={undefined}
        layout="Horizontal"
        metadata={content}
        size="XSmall"
        type="Checkmark"
        onSelect={onSelect}
      />
    </div>
  );
};

export default BillingPeriodOptionRow;
