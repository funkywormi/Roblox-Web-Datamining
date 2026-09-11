import { isReferralEnabled as isPlusReferralRolloutEnabled } from "@rbx/core-scripts/meta/subscription";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  RobloxPlusHeading,
  RobloxPlusGiftItemUpsellBanner,
  RobloxPlusFreeTrialBanner,
} from "@rbx/subscriptions-common";
import { useMemo } from "react";

import ActionPanel from "./ActionPanel";
import DiscountTierProgressCard from "./DiscountTierProgressCard";
import InteractWithPlusSection from "./InteractWithPlusSection";
import ManageButton from "./ManageButton";
import PlusReferralShareCard from "./PlusReferralShareCard";
import SavingsDashboard from "./SavingsDashboard";
import SubscriberStatusSummary from "./SubscriberStatusSummary";
import SubscriptionBenefitsDisplay from "./SubscriptionBenefitsDisplay";
import { useOwnsGiftItem } from "../hooks/useOwnsGiftItem";
import { resolveDiscountTier } from "../utils/discountTier";
import {
  GIFT_ITEM,
  navigateToGiftItemAvatarEditor,
  navigateToGiftItemDetails,
} from "../utils/giftItemNavigation";
import { calculateCurrentPeriodIndex } from "../utils/subscriptionDates";
import { getFeatureConfig } from "../utils/subscriptionProductInfo";

import type { GetRobloxPlusUserBenefitsResponse } from "@rbx/client-roblox-subscriptions-api/v1";
import type { SubscriptionProductInfo, Subscription } from "@rbx/client-subscriptions-api/v1";
import type { FC } from "react";

// Keep the promotion implementation available for a future rerun without rendering it currently.
const SUBSCRIBER_GIFT_BANNER_CONFIG = {
  enabled: false,
};

export type SubscriberViewProps = {
  robloxSubscriptionProduct: SubscriptionProductInfo;
  robloxSubscriptionMembership: Subscription;
  robloxPlusUserBenefits: GetRobloxPlusUserBenefitsResponse | undefined;
  isFaeFreeTrial: boolean;
  onOpenReferrals: () => void;
};

const SubscriberView: FC<SubscriberViewProps> = ({
  robloxSubscriptionProduct,
  robloxSubscriptionMembership,
  robloxPlusUserBenefits,
  isFaeFreeTrial,
  onOpenReferrals,
}) => {
  const { translate } = useTranslation();
  const savedRobux = robloxPlusUserBenefits?.robuxSavedWithPlus;
  const itemsBoughtWithDiscountCount = robloxPlusUserBenefits?.itemsBoughtWithPlusDiscount;
  const privateServersCreatedCount = robloxPlusUserBenefits?.privateServersCreatedForFree;
  const robuxSentToFriendsCount = robloxPlusUserBenefits?.robuxSentToFriends;

  const hasFreeTrial = useMemo(
    () => robloxSubscriptionMembership.activeOffers.some(o => o.offerType === "FreeTrial"),
    [robloxSubscriptionMembership.activeOffers],
  );

  // TODO(SUBS-4071): fetch current period index from membership endpoint
  const currentPeriodIndex = useMemo(
    () =>
      calculateCurrentPeriodIndex(
        robloxSubscriptionMembership.activationTimestampMs,
        robloxSubscriptionMembership.periodType,
        robloxSubscriptionMembership.nextRenewalTimestampMs,
        Date.now(),
      ),
    [
      robloxSubscriptionMembership.activationTimestampMs,
      robloxSubscriptionMembership.nextRenewalTimestampMs,
      robloxSubscriptionMembership.periodType,
    ],
  );

  const discountTier = useMemo(
    () =>
      resolveDiscountTier(
        getFeatureConfig(robloxSubscriptionProduct),
        robloxSubscriptionMembership.productTypeMembershipDetails
          .robloxSubscriptionMembershipDetails?.features.virtualTransactionDiscountTierId,
        currentPeriodIndex,
      ),
    [
      robloxSubscriptionProduct,
      robloxSubscriptionMembership.productTypeMembershipDetails,
      currentPeriodIndex,
    ],
  );
  const currentDiscountPercent = discountTier.current?.discountPercent ?? 0;
  const { data: ownsGiftItem } = useOwnsGiftItem(SUBSCRIBER_GIFT_BANNER_CONFIG.enabled);

  return (
    <div className="flex flex-col items-center">
      <div className="margin-top-[48px] padding-x-xlarge content-emphasis gap-y-xxlarge width-full large:max-width-[730px] flex flex-col">
        {SUBSCRIBER_GIFT_BANNER_CONFIG.enabled && ownsGiftItem === true && (
          <RobloxPlusGiftItemUpsellBanner
            body={translate("Description.BannerBodyUnboxed")}
            equipText={translate("Action.BannerEquip")}
            title={translate("Description.BannerTitleUnboxed")}
            onEquip={() => {
              navigateToGiftItemAvatarEditor().catch(() => undefined);
            }}
            onItemDetailsClick={() => {
              navigateToGiftItemDetails(GIFT_ITEM).catch(() => undefined);
            }}
          />
        )}
        {isFaeFreeTrial && (
          <RobloxPlusFreeTrialBanner
            body={translate("Subtext.FreeTrialBanner", {
              date: new Date(robloxSubscriptionMembership.expirationTimestampMs).toLocaleDateString(
                undefined,
                { day: "2-digit", month: "short", year: "numeric" },
              ),
            })}
            title={translate("Header.FreeTrialBannerTitle")}
          />
        )}
        <div className="gap-y-small large:items-center flex flex-col">
          <RobloxPlusHeading />
          <SubscriberStatusSummary
            activationTimestampMs={robloxSubscriptionMembership.activationTimestampMs}
            expirationTimestampMs={robloxSubscriptionMembership.expirationTimestampMs}
            hasFreeTrial={hasFreeTrial}
            nextRenewalTimestampMs={robloxSubscriptionMembership.nextRenewalTimestampMs}
          />
          <DiscountTierProgressCard
            activationTimestampMs={robloxSubscriptionMembership.activationTimestampMs}
            currentDiscountPercent={currentDiscountPercent}
            isCancelled={
              robloxSubscriptionMembership.nextRenewalTimestampMs === null ||
              robloxSubscriptionMembership.nextRenewalTimestampMs === 0
            }
            nextDiscount={discountTier.next}
            periodType={robloxSubscriptionMembership.periodType}
          />
        </div>
        <div className="flex flex-col gap-y-[32px]">
          {/* The invite card is the rail's only item today, so the whole section goes away with
              it rather than leaving a heading above an empty carousel. */}
          {isPlusReferralRolloutEnabled() ? (
            <InteractWithPlusSection>
              <PlusReferralShareCard onOpenDashboard={onOpenReferrals} />
            </InteractWithPlusSection>
          ) : null}
          <SavingsDashboard
            currentDiscountPercent={currentDiscountPercent}
            itemsBoughtWithDiscountCount={itemsBoughtWithDiscountCount}
            privateServersCreatedCount={privateServersCreatedCount}
            robuxSentToFriendsCount={robuxSentToFriendsCount}
            savedRobux={savedRobux}
          />
          <SubscriptionBenefitsDisplay
            featureConfig={getFeatureConfig(robloxSubscriptionProduct)}
          />
          <ActionPanel>
            <div className="gap-y-medium flex flex-col">
              <ManageButton robloxSubscriptionProduct={robloxSubscriptionProduct} />
            </div>
          </ActionPanel>
        </div>
      </div>
    </div>
  );
};

export default SubscriberView;
