import { isReferralEnabled as isPlusReferralRolloutEnabled } from "@rbx/core-scripts/meta/subscription";
import {
  useIsPlusSubscriber,
  usePendingPlusReferrals,
  useSenderReferralEligibility,
} from "@rbx/subscriptions-common";
import type { PlusNavEntries } from "../../util/navCapabilities";
import { plusNavEntries } from "./PlusNavCards";
import PlusJoinReferralNavItem from "./PlusJoinReferralNavItem";

export const usePlusNavEntries = (currentPath: string): PlusNavEntries => {
  // Not `isBlackbirdUser`: the page-load meta tag still says no on the screen that follows a
  // purchase, which left the recipient entry up and the share entry hidden until a reload.
  const isBlackbird = useIsPlusSubscriber();
  const isReferralRolloutEnabled = isPlusReferralRolloutEnabled();
  const { eligibility: senderEligibility } = useSenderReferralEligibility({
    enabled: isReferralRolloutEnabled && isBlackbird,
  });
  const { latestPendingReferral } = usePendingPlusReferrals();
  const pendingReferral = isBlackbird ? undefined : latestPendingReferral;

  return plusNavEntries({
    currentPath,
    isPlusSubscriber: isBlackbird,
    isReferralRolloutEnabled,
    senderEligibility,
    joinEntry: pendingReferral ? (
      <PlusJoinReferralNavItem
        referrerId={String(pendingReferral.senderUserId)}
        isReferralRolloutEnabled={isReferralRolloutEnabled}
      />
    ) : null,
  });
};
