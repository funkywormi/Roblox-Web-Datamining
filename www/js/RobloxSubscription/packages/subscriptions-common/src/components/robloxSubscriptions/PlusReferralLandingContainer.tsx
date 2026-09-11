import { useMemo, useState } from "react";

import PlusReferralSheet from "./PlusReferralSheet";

import type { PlusSubscribeButtonProps } from "../../hooks/usePlusSubscribeProduct";
import type {
  Money,
  PeriodType,
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionOffer,
} from "@rbx/client-subscriptions-api/v1";
import type { FC } from "react";

export type PlusReferralLanding =
  | { kind: "none" }
  | { kind: "invite"; code?: string; referrerId?: string }
  | { kind: "invalid" };

/**
 * Reads the referral params off the url, so the page need not resolve the share link again.
 * `deepLinkNavigate` in core-scripts writes these names, and its tests pin the exact url.
 */
export const readPlusReferralLanding = (search: string): PlusReferralLanding => {
  const params = new URLSearchParams(search);
  const code = params.get("referralCode");
  const referrerId = params.get("referrerId");
  if (code) {
    return { kind: "invite", code, ...(referrerId ? { referrerId } : {}) };
  }
  if (params.get("referralStatus")) {
    return { kind: "invalid" };
  }
  // Nav and pending-referrals entry points know the referrer but never have a share code.
  return referrerId ? { kind: "invite", referrerId } : { kind: "none" };
};

export type PlusReferralLandingContainerProps = {
  /**
   * Checkout wiring from the surrounding page. `/plus` has the product loaded and passes it down;
   * the home page omits it and the sheet looks the product up itself.
   */
  subscribeButtonProps?: PlusSubscribeButtonProps;
  /** Localized price from the surrounding product, quoted above the sheet.s benefits. */
  subscribePrice?: Money;
  /** Billing period of the surrounding product, which the sheet's benefit list labels rows with. */
  subscribePeriodType?: PeriodType;
  /** Feature config of that same product, listing the benefits the recipient sheet pitches. */
  subscribeFeatureConfig?: RobloxSubscriptionProductFeatureConfig;
  /** Offers from that product, used to select the correct subscription terms. */
  subscribeEligibleOffers?: SubscriptionOffer[];
};

/** Shows the recipient sheet when a referral link lands on the page carrying referral params. */
const PlusReferralLandingContainer: FC<PlusReferralLandingContainerProps> = ({
  subscribeButtonProps,
  subscribePrice,
  subscribePeriodType,
  subscribeFeatureConfig,
  subscribeEligibleOffers,
}) => {
  const landing = useMemo(() => readPlusReferralLanding(window.location.search), []);
  const [open, setOpen] = useState(landing.kind !== "none");

  if (landing.kind === "none") {
    return null;
  }

  return (
    <PlusReferralSheet
      invite={landing.kind === "invite" ? landing : undefined}
      open={open}
      subscribeButtonProps={subscribeButtonProps}
      subscribeEligibleOffers={subscribeEligibleOffers}
      subscribeFeatureConfig={subscribeFeatureConfig}
      subscribePeriodType={subscribePeriodType}
      subscribePrice={subscribePrice}
      onOpenChange={setOpen}
    />
  );
};

export default PlusReferralLandingContainer;
