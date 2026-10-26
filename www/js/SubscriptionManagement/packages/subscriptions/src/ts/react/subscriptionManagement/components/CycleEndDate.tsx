import React from "react";
import { useTranslation } from "react-utilities";
import classNames from "classnames";
import { ProductType } from "@rbx/client-subscriptions-api/v2";

type CycleEndDateProps = {
  expiration: Date;
  renewal: Date;
  productType?: string;
};

const CycleEndDate: React.FC<CycleEndDateProps> = ({ expiration, renewal, productType }) => {
  const { translate } = useTranslation();

  // Backend returns renewal time ms as 0 if not renewing
  const expiring = renewal.getTime() === 0 || expiration < renewal;

  const subscriptionDisplayDate = (expiring ? expiration : renewal).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const renewingLabel =
    productType === ProductType.RobuxSubscription
      ? translate("Label.Subscriptions.NextChargeAndDelivery")
      : translate("Label.Subscriptions.Renews");

  const subscriptionDateString = `${
    expiring ? translate("Label.Subscriptions.Expires") : renewingLabel
  } ${subscriptionDisplayDate}`;

  return (
    <span
      className={classNames("subscription-date", "text-description", {
        "text-alert": expiring,
      })}
    >
      {subscriptionDateString}
    </span>
  );
};

export default CycleEndDate;
