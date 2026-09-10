import { useEffect } from "react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { useTranslation } from "@rbx/core-scripts/react";
import { SheetRoot } from "@rbx/foundation-ui";

import { RobloxSubscriptionSheet } from "@rbx/subscriptions-common";
import { usePlusSubscriptionProduct } from "../hooks/usePlusSubscriptionProduct";
import { ROBLOX_PLUS_URL } from "../profileFrameConfig";

type ProfileFramePlusUpsellProps = {
  open: boolean;
  /** Called on Back / dismiss — the caller reopens the edit-frame dialog underneath. */
  onBack: () => void;
};

/**
 * Roblox Plus upsell for the profile-frame flow.
 *
 * Thin adapter over the shared `RobloxSubscriptionSheet`: fetches the Plus product,
 * renders the sheet in a `SheetRoot`, and gives it a Back button (the sheet's optional
 * prop) that returns the user to the frame chooser underneath. Attribution
 * (VIEW_SHOWN / USER_INPUT under the `WebProfileFramePlusUpsell` context) is handled
 * by the shared sheet.
 */
export const ProfileFramePlusUpsell = ({ open, onBack }: ProfileFramePlusUpsellProps) => {
  const { translate } = useTranslation();
  const {
    data: subscriptionProductInfo,
    isError,
    isSuccess,
  } = usePlusSubscriptionProduct({
    isEnabled: open,
  });
  const deviceMeta = getDeviceMeta();
  const redirectUrl = typeof window !== "undefined" ? window.location.href : undefined;

  // If the product can't load — either the query errored, or it resolved with no
  // purchasable product (e.g. region-ineligible) — fall back to the /plus page so the
  // user is never stuck on an empty sheet (the pre-modal behavior).
  useEffect(() => {
    if (open && (isError || (isSuccess && subscriptionProductInfo == null))) {
      window.location.href = ROBLOX_PLUS_URL;
    }
  }, [open, isError, isSuccess, subscriptionProductInfo]);

  return (
    <SheetRoot
      open={open}
      onOpenChange={next => {
        if (!next) onBack();
      }}
    >
      {open && subscriptionProductInfo && deviceMeta && (
        <RobloxSubscriptionSheet
          deviceMeta={deviceMeta}
          redirectUrl={redirectUrl}
          showBillingInfo={false}
          showBrandIcon={false}
          showPriceInCta
          subscriptionProductInfo={subscriptionProductInfo}
          subtitle={translate("Description.ProfileFramePlusUpsell")}
          title={translate("Title.SubscribeToPlus")}
          triggeringContext={
            paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PROFILE_FRAME_PLUS_UPSELL
          }
          onBack={onBack}
        />
      )}
    </SheetRoot>
  );
};
