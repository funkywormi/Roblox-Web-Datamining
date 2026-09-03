import { PeriodType, ProductType } from "@rbx/client-subscriptions-api/v1";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button, Icon } from "@rbx/foundation-ui";
import { type FC, useEffect } from "react";

import { CompactBenefitList, LargeScreenBenefitList } from "./SubscriptionBenefitLists";
import useLocalizedMoney from "../../hooks/useLocalizedMoney";
import { parseMoneyUnits } from "../../utils/parseMoneyUnits";
import { trackCounter } from "../../utils/trackCounter";
import SubscriptionButton from "../shared/SubscriptionButton";

import type { SectionSubscriptionV2 } from "../../types/sectionSubscriptionV2";
import type { Money } from "@rbx/client-subscriptions-api/v1";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";

const SECTION_PRODUCT_TYPE_TO_API: Record<string, ProductType> = {
  PRODUCT_TYPE_ROBLOX_PLUS: ProductType.Blackbird,
};

const PRODUCT_PERIOD_TYPE_TO_PERIOD_TYPE: Record<string, PeriodType> = {
  PERIOD_TYPE_MONTH: PeriodType.Month,
  PERIOD_TYPE_YEAR: PeriodType.Year,
  PERIOD_TYPE_WEEK: PeriodType.Week,
};

export type RobloxSubscriptionWidgetProps = {
  subscriptionV2: SectionSubscriptionV2;
  deviceMeta: DeviceMeta;
  isPrimary: boolean;
  /** Buy Robux redesign: fires once when the subscription block is shown (via `trackFlow`). */
  onSubscriptionSectionViewShown: () => void;
  /** Buy Robux redesign: user tapped subscribe / start trial (via `trackFlow`). */
  onSubscriptionSubscribeClick: (eventMetadata?: object) => void;
  /**
   * Fires when the embedded "Learn more" affordance is selected. Always invoked
   * (used for tracking). When `learnMoreHref` is provided the widget renders an
   * anchor and the parent's click handler runs alongside the navigation; when
   * it's omitted the widget renders a plain button and this is the only action.
   */
  onLearnMoreClick: () => void;
  /**
   * When set, the desktop "Learn more" button renders as an anchor pointing
   * here. When unset, it renders as a plain button so the parent can hook the
   * click into a non-navigation action (e.g. opening a sheet for in-app
   * webviews where there's no reliable back affordance).
   */
  learnMoreHref?: string;
  paymentSessionId?: string;
};

const RobloxSubscriptionWidget: FC<RobloxSubscriptionWidgetProps> = ({
  subscriptionV2,
  deviceMeta,
  isPrimary,
  onSubscriptionSectionViewShown,
  onSubscriptionSubscribeClick,
  onLearnMoreClick,
  learnMoreHref,
  paymentSessionId,
}) => {
  const { translate } = useTranslation();

  const primaryProduct = subscriptionV2.products[0];
  const apiProductType = primaryProduct
    ? SECTION_PRODUCT_TYPE_TO_API[primaryProduct.subscriptionProductType]
    : undefined;
  const apiPeriodType = primaryProduct
    ? PRODUCT_PERIOD_TYPE_TO_PERIOD_TYPE[primaryProduct.periodType]
    : undefined;
  const shouldRender = primaryProduct != null && apiProductType !== undefined;

  useEffect(() => {
    if (shouldRender) {
      onSubscriptionSectionViewShown();
    }
  }, [shouldRender, onSubscriptionSectionViewShown]);

  useEffect(() => {
    if (!primaryProduct) {
      trackCounter("Error_RobloxSubscriptionWidget_NoPrimaryProduct");
      return;
    }
    if (!apiProductType) {
      trackCounter("Error_RobloxSubscriptionWidget_InvalidSubscriptionProductType");
    }
  }, [primaryProduct, apiProductType]);

  const localizedMoney: Money =
    primaryProduct != null
      ? {
          currencyCode: primaryProduct.price.currencyCode,
          units: parseMoneyUnits(primaryProduct.price.units),
          nanos: primaryProduct.price.nanos ?? 0,
        }
      : { currencyCode: "USD", units: 0, nanos: 0 };

  const formattedPrice = useLocalizedMoney(localizedMoney);

  if (!primaryProduct) {
    return null;
  }
  if (!apiProductType) {
    return null;
  }

  const offers = Array.isArray(primaryProduct.offers) ? primaryProduct.offers : [];
  const hasFreeTrial = offers.some(o => o.freeTrial != null);

  const productBenefits = Array.isArray(primaryProduct.benefits) ? primaryProduct.benefits : [];

  const buttonLabel = hasFreeTrial
    ? translate("Action.TryItForFree")
    : translate("Action.PricePerMonth", {
        price: formattedPrice,
        periodType: apiPeriodType ?? PeriodType.Month,
      });

  const learnMoreLabel = translate("Label.Learnmore");
  const learnMoreClassName =
    "width-full text-label-medium height-1000 [display:none] medium:[display:flex]";

  return (
    <div className="gap-y-xlarge flex flex-col">
      <div className="gap-x-small min-width-0 flex flex-row flex-wrap justify-between">
        <div className="gap-x-medium flex items-center">
          <Icon name="icon-regular-roblox-plus" size="Large" />
          <span className="text-label-large content-emphasis text-no-wrap">
            {translate("Title.GetBlackbird")}
          </span>
        </div>
        {hasFreeTrial && (
          <div className="gap-x-small text-label-large flex shrink-0 flex-row items-center">
            <div className="relative flex flex-row [color:var(--color-extended-gray-600)]">
              <span className="robux-amount-strike-through" />
              <span>{formattedPrice}</span>
            </div>
            <span>{translate("Label.Free") || "Free"}</span>
          </div>
        )}
      </div>

      <div
        className="gap-x-large gap-y-small medium:hidden flex flex-col"
        data-testid="subscription-compact-benefits"
      >
        <CompactBenefitList benefits={productBenefits} translate={translate} />
      </div>

      <div className="medium:block hidden">
        <LargeScreenBenefitList benefits={productBenefits} translate={translate} />
      </div>

      <div className="gap-x-small medium:gap-x-xlarge width-full flex flex-row">
        <SubscriptionButton
          className="width-full text-label-medium"
          deviceMeta={deviceMeta}
          loadingStateDisabled
          paymentSessionId={paymentSessionId}
          productId={primaryProduct.subscriptionProductId}
          productType={apiProductType}
          size="Medium"
          trackSubscriptionButtonClick={onSubscriptionSubscribeClick}
          variant={isPrimary ? "Emphasis" : "Standard"}
        >
          {buttonLabel}
        </SubscriptionButton>
        {learnMoreHref != null ? (
          // Desktop / mobile web: keep link semantics so middle-click,
          // open-in-new-tab, and share all keep working.
          <Button
            as="a"
            className={learnMoreClassName}
            href={learnMoreHref}
            size="Medium"
            variant="Standard"
            onClick={onLearnMoreClick}
          >
            {learnMoreLabel}
          </Button>
        ) : (
          // No href => parent owns the action (e.g. opens a sheet for in-app
          // webviews that can't reliably navigate back).
          <Button
            className={learnMoreClassName}
            size="Medium"
            variant="Standard"
            onClick={onLearnMoreClick}
          >
            {learnMoreLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RobloxSubscriptionWidget;
