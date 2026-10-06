import { PeriodType } from "@rbx/client-subscriptions-api/v2";
import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import { useFormatter } from "@rbx/www-common/intl";
import { useMemo } from "react";

import { INTRODUCTORY_DISCOUNT_DAYS, ONE_ROBUX_IN_MICROS } from "../../subscriptionConstants";

import type {
  CurrencySubscriptionBenefit,
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionOffer,
  SubscriptionTenureDiscount,
} from "@rbx/client-subscriptions-api/v2";
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
  freeTrialOffer?: SubscriptionOffer | null;
};

const DAYS_PER_WEEK = 7;

const BenefitList: FC<BenefitListProps> = ({
  featureConfig,
  currencySubscriptionBenefit,
  freeTrialOffer,
}) => {
  const { translate } = useTranslation();
  const format = useFormatter();

  // A weekly free trial is unpaid time and does not count toward the introductory-discount window (the
  // backend credits only paid months toward the step-up to the higher tier). Extend the displayed window
  // by the trial length so "N% off first X days" lines up with when the step-up actually unlocks. Monthly
  // trials count normally, so they get no extension.
  const introDiscountDays =
    freeTrialOffer?.freeTrialOffer?.periodType === PeriodType.Week
      ? INTRODUCTORY_DISCOUNT_DAYS + freeTrialOffer.freeTrialOffer.duration * DAYS_PER_WEEK
      : INTRODUCTORY_DISCOUNT_DAYS;

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
      {baseDiscount &&
        (nextDiscount ? (
          <BenefitItem
            iconName="icon-regular-tag"
            label={translate("Description.Benefit.DiscountV3", {
              trialUnlockDays: format.number(introDiscountDays),
            })}
          />
        ) : (
          <BenefitItem
            iconName="icon-regular-tag"
            label={translate("Description.Benefit.DiscountBase", {
              discountPercent: format.number(baseDiscount.discountPercent * 0.01, {
                style: "percent",
              }),
            })}
          />
        ))}
      {/* Static Plus benefit: no per-product featureConfig flag exists yet for
          profile frames / app theme, so this line always renders alongside the
          other Plus benefits. */}
      <BenefitItem
        iconName="icon-regular-paint-brush"
        label={translate("Description.Benefit.Customize")}
      />
      <BenefitItem
        iconName="icon-regular-controller"
        label={translate("Label.BlackbirdPSDiscount")}
      />
      {currencySubscriptionBenefit &&
        currencySubscriptionBenefit.entitledAmountMicrosPerGrantingPeriod > 0 && (
          <BenefitItem
            iconName="icon-regular-robux"
            label={translate("Description.Benefit.RobuxStipend", {
              amount: format.number(
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
