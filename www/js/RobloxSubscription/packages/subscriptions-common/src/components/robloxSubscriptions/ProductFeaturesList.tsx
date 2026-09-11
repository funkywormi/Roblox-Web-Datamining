import { isReferralEnabled } from "@rbx/core-scripts/meta/subscription";
import { useTranslation } from "@rbx/core-scripts/react";
import { Icon, List } from "@rbx/foundation-ui";
import { Fragment, useMemo } from "react";

import { REFERRAL_REWARD_ROBUX } from "../../subscriptionConstants";

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
  /**
   * Adds referring as a benefit tile. Opt-in because it is not part of the product's feature
   * config: only surfaces shown to an existing subscriber can act on it.
   */
  includeReferralBenefit?: boolean;
};

// The introductory discount is a fixed 60-day offer regardless of the product's billing period.
const INTRODUCTORY_DISCOUNT_DAYS = 60;

const ProductFeaturesList: FC<ProductFeaturesListProps> = ({
  featureConfig,
  overrideIconName,
  onTileClick,
  includeReferralBenefit = false,
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
          primary={
            featureConfigNextDiscount
              ? translate("Description.Benefit.DiscountBaseV2")
              : translate("Description.Benefit.DiscountBase", {
                  discountPercent: intl.n(featureConfigBaseDiscount.discountPercent * 0.01, {
                    style: "percent",
                  }),
                })
          }
          // With a step-up tier, show the combined "X% now, Y% later" copy.
          // Without one (e.g. free-trial products that only have the base tier),
          // fall back to the previous single-tier subtitle.
          secondary={
            featureConfigNextDiscount
              ? translate("Description.Benefit.DiscountBaseSubtitleV2", {
                  discountPercentTier1: intl.n(featureConfigBaseDiscount.discountPercent * 0.01, {
                    style: "percent",
                  }),
                  discountTier1Days: intl.n(INTRODUCTORY_DISCOUNT_DAYS),
                  discountPercentTier2: intl.n(featureConfigNextDiscount.discountPercent * 0.01, {
                    style: "percent",
                  }),
                })
              : translate("Description.Benefit.DiscountBaseSubtitle")
          }
          onTileClick={onTileClick}
        />
      )}
      {featureConfig.isAiBackgroundEnabled && (
        <ProductFeaturesDisplayRow
          expandedPrimary={translate("Description.Benefit.AvatarBackground")}
          expandedSecondary={translate("Description.Benefit.AvatarBackgroundSubtitle")}
          iconName={overrideIconName ?? "icon-regular-image"}
          primary={translate("Description.Benefit.AvatarBackground")}
          secondary={translate("Description.Benefit.AvatarBackgroundSubtitle")}
          onTileClick={onTileClick}
        />
      )}
      {featureConfig.isAppThemesEnabled && (
        <ProductFeaturesDisplayRow
          expandedPrimary={translate("Description.Benefit.AppThemes")}
          expandedSecondary={translate("Description.Benefit.AppThemesSubtitle")}
          iconName={overrideIconName ?? "icon-regular-paint-brush"}
          primary={translate("Description.Benefit.AppThemes")}
          secondary={translate("Description.Benefit.AppThemesSubtitle")}
          onTileClick={onTileClick}
        />
      )}
      {featureConfig.isProfileFrameEnabled && (
        <ProductFeaturesDisplayRow
          expandedPrimary={translate("Description.Benefit.ProfileFrames")}
          expandedSecondary={translate("Description.Benefit.ProfileFramesSubtitle")}
          iconName={overrideIconName ?? "icon-regular-frame-expanded"}
          primary={translate("Description.Benefit.ProfileFrames")}
          secondary={translate("Description.Benefit.ProfileFramesSubtitle")}
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
      {includeReferralBenefit && isReferralEnabled() && (
        <ProductFeaturesDisplayRow
          // Referring has no expanded copy of its own, so the tile repeats itself when opened.
          expandedPrimary={translate("Description.Benefit.Referral")}
          expandedSecondary={translate("Description.Benefit.ReferralSubtitle", {
            amount: intl.n(REFERRAL_REWARD_ROBUX),
          })}
          iconName={overrideIconName ?? "icon-regular-person-plus"}
          primary={translate("Description.Benefit.Referral")}
          secondary={translate("Description.Benefit.ReferralSubtitle", {
            amount: intl.n(REFERRAL_REWARD_ROBUX),
          })}
          onTileClick={onTileClick}
        />
      )}
    </List>
  );
};

export default ProductFeaturesList;
