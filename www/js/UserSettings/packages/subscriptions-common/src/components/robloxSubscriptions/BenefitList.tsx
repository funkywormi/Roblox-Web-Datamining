import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import { useMemo } from "react";

import { ONE_ROBUX_IN_MICROS } from "../../subscriptionConstants";

import type {
  CurrencySubscriptionBenefit,
  PeriodType,
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionTenureDiscount,
} from "@rbx/client-subscriptions-api/v1";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import type { FC, ReactNode } from "react";

export type BenefitItemProps = {
  iconName: TTailwindIconClass;
  label: ReactNode;
};

export const BenefitItem: FC<BenefitItemProps> = ({ iconName, label }) => (
  <div className="gap-x-medium align-items-center flex flex-row">
    <Icon name={iconName} size="Large" />
    <span className="[font-size:var(--font-size-350)]">{label}</span>
  </div>
);

export type BenefitListProps = {
  featureConfig: RobloxSubscriptionProductFeatureConfig;
  periodType: PeriodType;
  currencySubscriptionBenefit?: CurrencySubscriptionBenefit | null;
};

const BenefitList: FC<BenefitListProps> = ({
  featureConfig,
  periodType,
  currencySubscriptionBenefit,
}) => {
  const { translate, intl } = useTranslation();

  const baseDiscount = useMemo(
    () =>
      featureConfig.virtualTransactionDiscounts?.find(
        (d: SubscriptionTenureDiscount) => d.periodIndex === 0,
      ),
    [featureConfig],
  );

  const nextDiscount = useMemo(
    () =>
      featureConfig.virtualTransactionDiscounts
        ?.filter((d: SubscriptionTenureDiscount) => d.periodIndex > 0)
        .reduce<SubscriptionTenureDiscount | null>(
          (min: SubscriptionTenureDiscount | null, d: SubscriptionTenureDiscount) =>
            min === null || d.periodIndex < min.periodIndex ? d : min,
          null,
        ),
    [featureConfig],
  );

  return (
    <div className="gap-y-xlarge flex flex-col">
      {baseDiscount && (
        <BenefitItem
          iconName="icon-regular-tag"
          label={translate("Description.Benefit.DiscountBase", {
            discountPercent: intl.n(baseDiscount.discountPercent * 0.01, {
              style: "percent",
            }),
          })}
        />
      )}
      {nextDiscount && (
        <BenefitItem
          iconName="icon-regular-tag-arrow-up"
          label={translate("Description.Benefit.DiscountNext", {
            productName: translate("Label.Blackbird"),
            discountPercent: intl.n(nextDiscount.discountPercent * 0.01, {
              style: "percent",
            }),
            discountPeriodCount: intl.n(nextDiscount.periodIndex),
            discountPeriodUnit: periodType,
          })}
        />
      )}
      <BenefitItem
        iconName="icon-regular-controller"
        label={translate("Label.BlackbirdPSDiscount")}
      />
      {currencySubscriptionBenefit &&
        currencySubscriptionBenefit.entitledAmountMicrosPerGrantingPeriod > 0 && (
          <BenefitItem
            iconName="icon-regular-robux"
            label={translate("Description.Benefit.RobuxStipend", {
              amount: intl.n(
                Math.round(
                  currencySubscriptionBenefit.entitledAmountMicrosPerGrantingPeriod /
                    ONE_ROBUX_IN_MICROS,
                ),
              ),
              periodType: currencySubscriptionBenefit.grantingPeriodType,
            })}
          />
        )}
      {featureConfig.isRobuxTransferEnabled && (
        <BenefitItem
          iconName="icon-regular-robux"
          label={translate("Description.Benefit.RobuxTransfers")}
        />
      )}
      {featureConfig.isTradingEnabled && (
        <BenefitItem
          iconName="icon-regular-hand-two-arrows-horizontal"
          label={translate("Description.Benefit.TradeResellItems")}
        />
      )}
      {featureConfig.isUgcPublishingEnabled && (
        <BenefitItem
          iconName="icon-regular-arrow-up-from-landscape-rectangle"
          label={translate("Description.Benefit.PublishItems")}
        />
      )}
    </div>
  );
};

export default BenefitList;
