import { useTranslation } from "@rbx/core-scripts/react";
import { Icon, ProgressCircle } from "@rbx/foundation-ui";
import { useMemo } from "react";

import { addBillingPeriod } from "../utils/subscriptionDates";

import type { PeriodType, SubscriptionTenureDiscount } from "@rbx/client-subscriptions-api/v1";
import type { FC, ReactNode } from "react";

export type DiscountTierProgressCardProps = {
  /** Resolved discount % the user effectively has on this product (0–100). */
  currentDiscountPercent: number;
  /** Lowest tier above the user's current tier, or null when at max / no tiers. */
  nextDiscount: SubscriptionTenureDiscount | null;
  activationTimestampMs: number;
  isCancelled: boolean;
  periodType: PeriodType;
};

const DiscountTierProgressCard: FC<DiscountTierProgressCardProps> = ({
  currentDiscountPercent,
  nextDiscount,
  activationTimestampMs,
  isCancelled,
  periodType,
}) => {
  const { translate, intl } = useTranslation();

  const nextDiscountSummary = useMemo(() => {
    if (!nextDiscount) {
      return null;
    }

    const nowTimestampMs = Date.now();
    const targetDateTimestampMs = addBillingPeriod(
      activationTimestampMs,
      nextDiscount.periodIndex,
      periodType,
    ).getTime();

    const { discountPercent } = nextDiscount;
    const targetDateDaysUntil = Math.max(
      0,
      Math.ceil((targetDateTimestampMs - nowTimestampMs) / (1000 * 60 * 60 * 24)),
    );
    const targetDateProgressPercent = Math.min(
      Math.max(
        0,
        ((nowTimestampMs - activationTimestampMs) /
          (targetDateTimestampMs - activationTimestampMs)) *
          100,
      ),
      100,
    );

    return {
      discountPercent,
      targetDateDaysUntil,
      targetDateProgressPercent,
    };
  }, [nextDiscount, activationTimestampMs, periodType]);

  // TODO(SUBS-4070): handle case where targetDateDaysUntil is 0 (i.e., waiting for next renewal)

  // Don't render the card when the product has no discount tiers configured at all
  if (nextDiscountSummary === null && currentDiscountPercent === 0) {
    return null;
  }

  const isMaxDiscountReached = nextDiscountSummary === null;
  const isCloseToUnlock =
    nextDiscountSummary !== null && nextDiscountSummary.targetDateDaysUntil <= 15;

  const renderTopLine = () => {
    if (isCancelled) {
      return translate(
        isMaxDiscountReached
          ? "Description.Benefit.DiscountStaySubscribedToKeep"
          : "Description.Benefit.DiscountStaySubscribedToGet",
      );
    }
    if (isMaxDiscountReached) {
      return translate("Description.Benefit.DiscountMaxReached");
    }
    return translate("Description.Benefit.DiscountCurrent", {
      discountPercent: intl.n(currentDiscountPercent * 0.01, {
        style: "percent",
      }),
    });
  };

  const renderHeading = () => {
    if (isMaxDiscountReached) {
      return translate(
        isCancelled
          ? "Description.Benefit.DiscountAllPurchases"
          : "Description.Benefit.DiscountUnlocked",
        {
          discountPercent: intl.n(currentDiscountPercent * 0.01, {
            style: "percent",
          }),
        },
      );
    }
    return translate("Description.Benefit.DiscountOffInDays", {
      discountPercent: intl.n(nextDiscountSummary.discountPercent * 0.01, {
        style: "percent",
      }),
      dayCount: nextDiscountSummary.targetDateDaysUntil,
    });
  };

  // TODO(SUBS-XXXX): replace placeholder icons with real tilted-calendar and celebration
  // graphics ("72") from the design system once available.
  const renderTiltedIconFrame = (children: ReactNode) => (
    <div className="margin-right-[-16px] relative flex size-[60px] shrink-0 items-center justify-center">
      <div
        aria-hidden
        // eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value -- `inset-0` doesn't apply correctly under foundation-tailwind
        className="stroke-emphasis stroke-standard absolute inset-[0] rounded-[2.4px] [transform:rotate(-15deg)]"
      />
      {children}
    </div>
  );

  const renderStateIcon = () => {
    if (isMaxDiscountReached) {
      return renderTiltedIconFrame(<Icon name="icon-regular-circle-check" size="XLarge" />);
    }
    if (isCloseToUnlock && !isCancelled) {
      return (
        <ProgressCircle
          ariaLabel={translate("Label.Progress")}
          className="[--fui-future-alpha-color-system-progress:var(--color-content-emphasis)]"
          size="Large"
          value={nextDiscountSummary.targetDateProgressPercent}
          variant="Determinate"
        />
      );
    }
    return renderTiltedIconFrame(<Icon name="icon-regular-calendar" size="XLarge" />);
  };

  // TODO(SUBS-4954): make the card dismissable when the max discount is reached
  return (
    <div className="radius-medium padding-large bg-shift-200 width-full gap-x-small flex items-center justify-between [overflow:clip]">
      <div className="gap-y-small min-width-0 flex flex-col items-start justify-center">
        <span className="text-title-medium content-default">{renderTopLine()}</span>
        <span className="text-heading-large content-emphasis">{renderHeading()}</span>
      </div>
      <div className="shrink-0">{renderStateIcon()}</div>
    </div>
  );
};

export default DiscountTierProgressCard;
