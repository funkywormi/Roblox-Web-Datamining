import React, { useEffect } from "react";
import { getSubscriptionPeriodTranslationKey } from "@rbx/subscriptions-common";
import { useTranslation } from "react-utilities";
import { Price } from "../../../core/types/price";
import { PeriodType } from "../../../core/types/subscriptionEnums";
import "../../../../css/subscriptionManagement/priceDisplay.scss";

type PriceDisplayProps = {
  price: Price;
  period: PeriodType;
  periodCount?: number;
  className: string;
};

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, period, periodCount, className }) => {
  const { translate } = useTranslation();

  const count = periodCount ?? 1;
  const duration = translate(getSubscriptionPeriodTranslationKey(period, count), {
    periodCount: count,
  });
  const periodString = ` / ${duration}${className === "resubscribe" ? "." : ""}`;

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("price-tag:render", {
        detail: {
          tagClassName: `${className}-price text-description`,
          targetSelector: `.${className}-price-tag`,
        },
      }),
    );
  }, [price, className]);

  return (
    <span className="price-period">
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
