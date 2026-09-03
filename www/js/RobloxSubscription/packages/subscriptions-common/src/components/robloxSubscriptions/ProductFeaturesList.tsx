import { useTranslation } from "@rbx/core-scripts/react";
import { Icon, List } from "@rbx/foundation-ui";
import { Fragment, useMemo } from "react";

import type {
  PeriodType,
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionTenureDiscount,
} from "@rbx/client-subscriptions-api/v1";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import type { FC } from "react";

type ProductFeaturesDisplayRowProps = {
  expandedPrimary: string;
  expandedSecondary: string;
  iconName: TTailwindIconClass;
  onTileClick?: (primary: string, secondary: string) => void;
  primary: string;
  secondary: string;
};

const tileCardClassName =
  "height-full min-width-0 grow-1 gap-x-large radius-medium !bg-surface-100 stroke-standard stroke-default padding-medium box-border flex items-center";

const ProductFeaturesDisplayRow: FC<ProductFeaturesDisplayRowProps> = ({
  expandedPrimary,
  expandedSecondary,
  iconName,
  onTileClick,
  primary,
  secondary,
}) => {
  const tileBody = (
    <Fragment>
      <div className="flex shrink-0 items-center justify-center">
        <Icon name={iconName} size="Large" />
      </div>
      <div className="min-width-0 grow-1 gap-xsmall flex flex-col justify-center">
        <div className="text-title-medium content-emphasis text-align-x-start">{primary}</div>
        <div className="text-body-medium content-default text-align-x-start">{secondary}</div>
      </div>
    </Fragment>
  );

  return (
    <li className="min-width-0 height-full flex list-none flex-col [list-style:none]">
      {onTileClick != null ? (
        <button
          aria-label={primary}
          className={`${tileCardClassName} width-full text-align-x-start cursor-pointer font-[inherit]`}
          type="button"
          onClick={() => {
            onTileClick(expandedPrimary, expandedSecondary);
          }}
        >
          {tileBody}
        </button>
      ) : (
        <div className={tileCardClassName}>{tileBody}</div>
      )}
    </li>
  );
};

export type ProductFeaturesListProps = {
  featureConfig: RobloxSubscriptionProductFeatureConfig;
  periodType: PeriodType;
  overrideIconName?: TTailwindIconClass;
  onTileClick?: (primary: string, secondary: string) => void;
};

const ProductFeaturesList: FC<ProductFeaturesListProps> = ({
  featureConfig,
  periodType,
  overrideIconName,
  onTileClick,
}) => {
  const { translate, intl } = useTranslation();

  const featureConfigBaseDiscount = useMemo(
    () =>
      featureConfig.virtualTransactionDiscounts?.find(
        (d: SubscriptionTenureDiscount) => d.periodIndex === 0,
      ),
    [featureConfig],
  );

  const featureConfigNextDiscount = useMemo(
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

  const privateServerBaseDiscount = useMemo(
    () =>
      featureConfig.privateServerDiscounts?.find(
        (d: SubscriptionTenureDiscount) => d.periodIndex === 0,
      ),
    [featureConfig],
  );

  return (
    <List className="width-full large:[grid-template-columns:repeat(2,minmax(0,1fr))] grid gap-x-[12px] gap-y-[12px] [grid-template-columns:minmax(0,1fr)]">
      {featureConfigBaseDiscount && (
        <ProductFeaturesDisplayRow
          expandedPrimary={translate("Description.Benefit.DiscountBaseExpandedTitle")}
          expandedSecondary={translate("Description.Benefit.DiscountBaseExpandedBody")}
          iconName={overrideIconName ?? "icon-regular-tag"}
          primary={translate("Description.Benefit.DiscountBase", {
            discountPercent: intl.n(featureConfigBaseDiscount.discountPercent * 0.01, {
              style: "percent",
            }),
          })}
          secondary={translate("Description.Benefit.DiscountBaseSubtitle")}
          onTileClick={onTileClick}
        />
      )}
      {featureConfigNextDiscount && (
        <ProductFeaturesDisplayRow
          expandedPrimary={translate("Description.Benefit.DiscountNextExpandedTitle")}
          expandedSecondary={translate("Description.Benefit.DiscountNextExpandedBody")}
          iconName={overrideIconName ?? "icon-regular-tag-arrow-up"}
          primary={translate("Description.Benefit.DiscountNext", {
            productName: translate("Label.Blackbird"),
            discountPercent: intl.n(featureConfigNextDiscount.discountPercent * 0.01, {
              style: "percent",
            }),
            discountPeriodCount: intl.n(featureConfigNextDiscount.periodIndex),
            discountPeriodUnit: periodType,
          })}
          secondary={translate("Description.Benefit.DiscountNextSubtitle")}
          onTileClick={onTileClick}
        />
      )}
      {privateServerBaseDiscount && (
        <ProductFeaturesDisplayRow
          expandedPrimary={translate("Description.Benefit.PrivateServersExpandedTitle")}
          expandedSecondary={translate("Description.Benefit.PrivateServersExpandedBody")}
          iconName={overrideIconName ?? "icon-regular-controller"}
          primary={translate("Description.Benefit.PrivateServers", {
            discountPercent: intl.n(privateServerBaseDiscount.discountPercent * 0.01, {
              style: "percent",
            }),
          })}
          secondary={translate("Description.Benefit.PrivateServersSubtitle")}
          onTileClick={onTileClick}
        />
      )}
      {featureConfig.isRobuxTransferEnabled && (
        <ProductFeaturesDisplayRow
          expandedPrimary={translate("Description.Benefit.RobuxTransfersExpandedTitle")}
          expandedSecondary={translate("Description.Benefit.RobuxTransfersExpandedBody")}
          iconName={overrideIconName ?? "icon-regular-robux"}
          primary={translate("Description.Benefit.RobuxTransfers")}
          secondary={translate("Description.Benefit.RobuxTransfersSubtitle")}
          onTileClick={onTileClick}
        />
      )}
      {featureConfig.isTradingEnabled && (
        <ProductFeaturesDisplayRow
          expandedPrimary={translate("Description.Benefit.TradeResellItemsExpandedTitle")}
          expandedSecondary={translate("Description.Benefit.TradeResellItemsExpandedBody")}
          iconName={overrideIconName ?? "icon-regular-hand-two-arrows-horizontal"}
          primary={translate("Description.Benefit.TradeResellItems")}
          secondary={translate("Description.Benefit.TradeResellItemsSubtitle")}
          onTileClick={onTileClick}
        />
      )}
      {featureConfig.isUgcPublishingEnabled && (
        <ProductFeaturesDisplayRow
          expandedPrimary={translate("Description.Benefit.PublishItemsExpandedTitle")}
          expandedSecondary={translate("Description.Benefit.PublishItemsExpandedBody")}
          iconName={overrideIconName ?? "icon-regular-arrow-up-from-landscape-rectangle"}
          primary={translate("Description.Benefit.PublishItems")}
          secondary={translate("Description.Benefit.PublishItemsSubtitle")}
          onTileClick={onTileClick}
        />
      )}
    </List>
  );
};

export default ProductFeaturesList;
