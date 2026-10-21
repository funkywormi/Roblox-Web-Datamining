import { Fragment, useState } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import PlusReferralSheet from "@rbx/subscriptions-common/PlusReferralSheet";
import { PlusReferralSurface } from "@rbx/subscriptions-common/referralEventConstants";
import referralEventService from "@rbx/subscriptions-common/referralEventService";
import { ReferralNavItem, useRewardAmount } from "./PlusNavCards";

/**
 * Recipient side of the same entry, for a non-subscriber with an invite waiting. The invite opens
 * over the current page — only subscribing navigates — and carries the referrer for credit.
 */
const PlusJoinReferralNavItem = ({
  referrerId,
  isReferralRolloutEnabled,
}: {
  referrerId: string;
  isReferralRolloutEnabled: boolean;
}) => {
  const t = useTranslations("Feature.RobloxSubscription");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const rewardAmount = useRewardAmount();

  return (
    <Fragment>
      <ReferralNavItem
        entry="join"
        label={t(
          "Heading.ReferralRecipientEntry",
          { amount: rewardAmount },
          `Join Plus to get ${rewardAmount} Robux`,
        )}
        onSelect={() => {
          referralEventService.flyoutJoinClick(referrerId);
          setIsInviteOpen(true);
        }}
        onExpose={() => {
          referralEventService.flyoutJoinImpression(referrerId);
        }}
      />
      <PlusReferralSheet
        invite={{ referrerId }}
        isReferralRolloutEnabled={isReferralRolloutEnabled}
        open={isInviteOpen}
        surface={PlusReferralSurface.Flyout}
        onOpenChange={setIsInviteOpen}
      />
    </Fragment>
  );
};

export default PlusJoinReferralNavItem;
