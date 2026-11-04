import { PeriodType } from "@rbx/client-subscriptions-api/v2";
import { isReferralEnabled } from "@rbx/core-scripts/meta/subscription";
import { useTranslation } from "@rbx/core-scripts/react";
import { useFormatter } from "@rbx/www-common/intl";
import { useMemo } from "react";

import { INTRODUCTORY_DISCOUNT_DAYS, REFERRAL_REWARD_ROBUX } from "../subscriptionConstants";

import type {
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionOffer,
  SubscriptionTenureDiscount,
} from "@rbx/client-subscriptions-api/v2";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";

export type ProductFeatureBenefitId =
  | "discount"
  | "avatarBackground"
  | "appThemes"
  | "profileFrames"
  | "privateServers"
  | "robuxTransfers"
  | "trading"
  | "ugcPublishing"
  | "referral";

export type ProductFeatureBenefit = {
  id: ProductFeatureBenefitId;
  iconName: TTailwindIconClass;
  primary: string;
  secondary: string;
  expandedPrimary: string;
  expandedSecondary: string;
};

export type UseProductFeatureBenefitsOptions = {
  featureConfig: RobloxSubscriptionProductFeatureConfig;
  freeTrialOffer?: SubscriptionOffer | null;
  /**
   * Adds referring as a benefit. Opt-in because it is not part of the product's feature
   * config: only surfaces shown to an existing subscriber can act on it.
   */
  includeReferralBenefit?: boolean;
  /**
   * The subscriber's current discount (0–100). When set, the discount details show it instead of
   * the introductory tier a new subscriber starts on.
   */
  currentDiscountPercent?: number;
};

const DAYS_PER_WEEK = 7;

/** The Plus benefits a product grants, in display order, gated on the backend feature config. */
export function useProductFeatureBenefits({
  featureConfig,
  freeTrialOffer,
  includeReferralBenefit = false,
  currentDiscountPercent,
}: UseProductFeatureBenefitsOptions): ProductFeatureBenefit[] {
  const { translate } = useTranslation();
  const format = useFormatter();

  // A weekly free trial is unpaid time and does not count toward the introductory-discount window (the
  // backend credits only paid months toward the step-up). Extend the displayed window by the trial length
  // so the copy matches when the step-up unlocks. Monthly trials count normally, so no extension.
  const introDiscountDays =
    freeTrialOffer?.freeTrialOffer?.periodType === PeriodType.Week
      ? INTRODUCTORY_DISCOUNT_DAYS + freeTrialOffer.freeTrialOffer.duration * DAYS_PER_WEEK
      : INTRODUCTORY_DISCOUNT_DAYS;

  return useMemo(() => {
    const baseDiscount = featureConfig.virtualTransactionDiscounts?.find(
      (d: SubscriptionTenureDiscount) => d.periodIndex === 0,
    );

    const nextDiscount = featureConfig.virtualTransactionDiscounts
      ?.filter((d: SubscriptionTenureDiscount) => d.periodIndex > 0)
      .reduce<SubscriptionTenureDiscount | null>(
        (min: SubscriptionTenureDiscount | null, d: SubscriptionTenureDiscount) =>
          min === null || d.periodIndex < min.periodIndex ? d : min,
        null,
      );

    const privateServerBaseDiscount = featureConfig.privateServerDiscounts?.find(
      (d: SubscriptionTenureDiscount) => d.periodIndex === 0,
    );

    const formatPercent = (discountPercent: number) =>
      format.number(discountPercent * 0.01, { style: "percent" });

    const benefits: ProductFeatureBenefit[] = [];

    if (baseDiscount) {
      benefits.push({
        id: "discount",
        iconName: "icon-regular-tag",
        primary: nextDiscount
          ? translate("Description.Benefit.DiscountBaseV2")
          : translate("Description.Benefit.DiscountBase", {
              discountPercent: formatPercent(baseDiscount.discountPercent),
            }),
        // With a step-up tier, show the combined "X% now, Y% later" copy. Without one (e.g. free-trial
        // products that only have the base tier), fall back to the single-tier subtitle.
        secondary: nextDiscount
          ? translate("Description.Benefit.DiscountBaseSubtitleV2", {
              discountPercentTier1: formatPercent(baseDiscount.discountPercent),
              discountTier1Days: format.number(introDiscountDays),
              discountPercentTier2: formatPercent(nextDiscount.discountPercent),
            })
          : translate("Description.Benefit.DiscountBaseSubtitle"),
        expandedPrimary:
          currentDiscountPercent != null && currentDiscountPercent > 0
            ? translate("Description.Benefit.DiscountAllPurchases", {
                discountPercent: formatPercent(currentDiscountPercent),
              })
            : translate("Description.Benefit.DiscountBaseExpandedTitle"),
        expandedSecondary: translate("Description.Benefit.DiscountBaseExpandedBody"),
      });
    }

    if (featureConfig.isAiBackgroundEnabled) {
      benefits.push({
        id: "avatarBackground",
        iconName: "icon-regular-image-person",
        primary: translate("Description.Benefit.AvatarBackground"),
        secondary: translate("Description.Benefit.AvatarBackgroundSubtitle"),
        expandedPrimary: translate("Description.Benefit.AvatarBackground"),
        expandedSecondary: translate("Description.Benefit.AvatarBackgroundSubtitle"),
      });
    }

    if (featureConfig.isAppThemesEnabled) {
      benefits.push({
        id: "appThemes",
        iconName: "icon-regular-paint-brush",
        primary: translate("Description.Benefit.AppThemes"),
        secondary: translate("Description.Benefit.AppThemesSubtitle"),
        expandedPrimary: translate("Description.Benefit.AppThemes"),
        expandedSecondary: translate("Description.Benefit.AppThemesSubtitle"),
      });
    }

    if (featureConfig.isProfileFrameEnabled) {
      benefits.push({
        id: "profileFrames",
        iconName: "icon-regular-circle-dashed-person",
        primary: translate("Description.Benefit.ProfileFrames"),
        secondary: translate("Description.Benefit.ProfileFramesSubtitle"),
        expandedPrimary: translate("Description.Benefit.ProfileFrames"),
        expandedSecondary: translate("Description.Benefit.ProfileFramesSubtitle"),
      });
    }

    if (privateServerBaseDiscount) {
      benefits.push({
        id: "privateServers",
        iconName: "icon-regular-controller",
        primary: translate("Description.Benefit.PrivateServers", {
          discountPercent: formatPercent(privateServerBaseDiscount.discountPercent),
        }),
        secondary: translate("Description.Benefit.PrivateServersSubtitle"),
        expandedPrimary: translate("Description.Benefit.PrivateServersExpandedTitle"),
        expandedSecondary: translate("Description.Benefit.PrivateServersExpandedBody"),
      });
    }

    if (featureConfig.isRobuxTransferEnabled) {
      benefits.push({
        id: "robuxTransfers",
        iconName: "icon-regular-robux",
        primary: translate("Description.Benefit.RobuxTransfers"),
        secondary: translate("Description.Benefit.RobuxTransfersSubtitle"),
        expandedPrimary: translate("Description.Benefit.RobuxTransfersExpandedTitle"),
        expandedSecondary: translate("Description.Benefit.RobuxTransfersExpandedBody"),
      });
    }

    if (featureConfig.isTradingEnabled) {
      benefits.push({
        id: "trading",
        iconName: "icon-regular-hand-two-arrows-horizontal",
        primary: translate("Description.Benefit.TradeResellItems"),
        secondary: translate("Description.Benefit.TradeResellItemsSubtitle"),
        expandedPrimary: translate("Description.Benefit.TradeResellItemsExpandedTitle"),
        expandedSecondary: translate("Description.Benefit.TradeResellItemsExpandedBody"),
      });
    }

    if (featureConfig.isUgcPublishingEnabled) {
      benefits.push({
        id: "ugcPublishing",
        iconName: "icon-regular-arrow-up-from-landscape-rectangle",
        primary: translate("Description.Benefit.PublishItems"),
        secondary: translate("Description.Benefit.PublishItemsSubtitle"),
        expandedPrimary: translate("Description.Benefit.PublishItemsExpandedTitle"),
        expandedSecondary: translate("Description.Benefit.PublishItemsExpandedBody"),
      });
    }

    if (includeReferralBenefit && isReferralEnabled()) {
      const referralSubtitle = translate("Description.Benefit.ReferralSubtitle", {
        amount: format.number(REFERRAL_REWARD_ROBUX),
      });
      // Referring has no expanded copy of its own, so it repeats itself when opened.
      benefits.push({
        id: "referral",
        iconName: "icon-regular-person-plus",
        primary: translate("Description.Benefit.Referral"),
        secondary: referralSubtitle,
        expandedPrimary: translate("Description.Benefit.Referral"),
        expandedSecondary: referralSubtitle,
      });
    }

    return benefits;
  }, [
    currentDiscountPercent,
    featureConfig,
    format,
    includeReferralBenefit,
    introDiscountDays,
    translate,
  ]);
}
