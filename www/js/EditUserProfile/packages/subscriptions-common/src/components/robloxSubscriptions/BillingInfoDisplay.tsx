import { escapeHtml } from "@rbx/core-scripts/format/string";
import { useTranslation } from "@rbx/core-scripts/react";

import useLocalizedMoney from "../../hooks/useLocalizedMoney";

import type { Money, PeriodType, SubscriptionOffer } from "@rbx/client-subscriptions-api/v1";
import type { FC } from "react";

export type BillingInfoDisplayProps = {
  eligibleOffers?: SubscriptionOffer[];
  price: Money;
  periodType: PeriodType;
};

const BillingInfoDisplay: FC<BillingInfoDisplayProps> = ({ eligibleOffers, price, periodType }) => {
  const { translate } = useTranslation();
  const displayPrice = useLocalizedMoney(price);
  const priceElement = `<span class='text-heading-medium'>${escapeHtml(displayPrice)}</span>`;
  const priceHtml = translate("Description.BillingInfo", {
    price: priceElement,
    periodType,
  });
  const freeTrialHtml = translate("Description.BillingInfoWithFreeTrialOffer", {
    boldTagStart: "<b>",
    boldTagEnd: "</b>",
    trialPeriod: 1,
    trialPeriodType: periodType,
    price: escapeHtml(displayPrice),
    periodType: periodType,
  });

  const isFreeTrial =
    eligibleOffers?.some((o: SubscriptionOffer) => o.offerType === "FreeTrial") ?? false;

  return (
    <span
      // TODO: find translateHtml workaround
      /* eslint-disable-next-line react/no-danger */
      dangerouslySetInnerHTML={{
        __html: isFreeTrial ? freeTrialHtml : priceHtml,
      }}
      className="text-body-large"
    />
  );
};

export default BillingInfoDisplay;
