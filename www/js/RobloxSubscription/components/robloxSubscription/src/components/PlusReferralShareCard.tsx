import { useTranslation } from "@rbx/core-scripts/react";
import { Button } from "@rbx/foundation-ui";
import { REFERRAL_REWARD_ROBUX } from "@rbx/subscriptions-common";

import type { FC } from "react";

/** Design width. Narrow enough that the next card peeks, so the rail reads as scrollable. */
const CARD_WIDTH_CLASS = "width-[235px]";

export type PlusReferralShareCardProps = {
  onOpenDashboard: () => void;
};

/**
 * Card-shaped referral entry point for the "Interact with Plus" rail. The home feed uses
 * {@link PlusReferralBanner} instead, which is a list row.
 */
const PlusReferralShareCard: FC<PlusReferralShareCardProps> = ({ onOpenDashboard }) => {
  const { translate, intl } = useTranslation();
  const amount = intl.n(REFERRAL_REWARD_ROBUX);

  return (
    <div
      // `height-full` keeps every card in the rail level; the minimum holds the design height when
      // this is the only card. Not a fixed height, which a longer locale would overflow.
      className={`radius-medium bg-shift-100 padding-large gap-y-small height-full min-height-[160px] ${CARD_WIDTH_CLASS} flex flex-col items-start`}
    >
      <span className="text-title-large content-emphasis">
        {translate("Heading.ReferralCard", { amount }, "Share Plus, get 100 Robux")}
      </span>
      <p className="text-body-medium content-default margin-none grow-1">
        {translate(
          "Description.ReferralShare",
          { amount },
          "Invite someone to Plus and you both get 100 Robux when they join.",
        )}
      </p>
      <Button size="Small" variant="Standard" onClick={onOpenDashboard}>
        {translate("Action.ReferralInvite", undefined, "Invite")}
      </Button>
    </div>
  );
};

export default PlusReferralShareCard;
