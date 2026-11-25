import { useTranslation } from "@rbx/core-scripts/react";
import { ContextBanner } from "@rbx/foundation-ui";
import { paymentFlowAnalyticsService } from "@rbx/payments/payments-flow-analytics";
import { usePaymentSession } from "@rbx/payments/services/paymentSession";
import {
  readPlusReferralLanding,
  SubscriptionButton,
  useReferralEligibility,
} from "@rbx/subscriptions-common";
import { useCallback, useEffect, useMemo, useRef } from "react";

import useLocalizedMoney from "../hooks/useLocalizedMoney";
import { Event } from "../utils/eventsCounter";
import { publishMetric } from "../utils/publishMetric";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";
import type { FC } from "react";

export type PlusUpgradeBannerProps = {
  deviceMeta: DeviceMeta;
  upgradeProduct: SubscriptionProductInfo;
  onMobilePurchaseInitiated?: () => void;
};

/** Offers an upgradeable member the plan that keeps their Plus benefits. */
const PlusUpgradeBanner: FC<PlusUpgradeBannerProps> = ({
  deviceMeta,
  upgradeProduct,
  onMobilePurchaseInitiated,
}) => {
  const { translate } = useTranslation();
  const price = useLocalizedMoney(upgradeProduct.localizedPrice);
  const { id: paymentSessionId } = usePaymentSession() ?? {};
  const landing = useMemo(() => readPlusReferralLanding(window.location.search), []);
  const inviteReferrerId = landing.kind === "invite" ? landing.referrerId : undefined;
  // Checkout fails the purchase over a referral the server won't credit, such as one for a member
  // who already had Plus, so only an eligible referrer is sent.
  const { eligibility: referralEligibility } = useReferralEligibility({
    referrerId: inviteReferrerId,
  });
  const referrerId = referralEligibility === "Eligible" ? inviteReferrerId : undefined;

  const hasFiredImpression = useRef(false);
  useEffect(() => {
    if (hasFiredImpression.current) {
      return;
    }
    hasFiredImpression.current = true;
    publishMetric(Event.UPGRADE_BANNER_SHOWN);
  }, []);

  // The purchase page's funnel events, so an upgrade is tracked like any other Plus purchase.
  // VIEW_SHOWN waits for the payment session so it carries the same id as the click.
  const hasFiredViewShown = useRef(false);
  useEffect(() => {
    if (hasFiredViewShown.current || !paymentSessionId) {
      return;
    }
    hasFiredViewShown.current = true;
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent({
      triggerContext: paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE,
      isMidPurchaseStep: false,
      viewName: paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_LANDING,
      purchaseEventType: paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      viewMessage: paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE,
      eventMetadata: { paymentSessionId },
    });
  }, [paymentSessionId]);

  const trackUpgradeClick = useCallback(() => {
    publishMetric(Event.UPGRADE_BANNER_CLICK);
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent({
      triggerContext: paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE,
      isMidPurchaseStep: false,
      viewName: paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_LANDING,
      purchaseEventType: paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage: paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE,
      eventMetadata: {
        product_id: upgradeProduct.productKey.id,
        ...(paymentSessionId ? { paymentSessionId } : {}),
      },
    });
  }, [paymentSessionId, upgradeProduct.productKey.id]);

  return (
    <ContextBanner
      trailing={
        <SubscriptionButton
          deviceMeta={deviceMeta}
          paymentSessionId={paymentSessionId}
          productId={upgradeProduct.productKey.id}
          productType={upgradeProduct.productKey.type}
          referrerId={referrerId}
          size="XSmall"
          trackSubscriptionButtonClick={trackUpgradeClick}
          variant="Link"
          onMobilePurchaseInitiated={onMobilePurchaseInitiated}
        >
          {translate("Action.Subscribe")}
        </SubscriptionButton>
      }
      variant="Emphasis"
    >
      {/* translate returns the fallback as is, so it carries the price itself. */}
      {translate(
        "Description.KeepPlusBenefits",
        { price },
        `Keep your Plus benefits for ${price}/month`,
      )}
    </ContextBanner>
  );
};

export default PlusUpgradeBanner;
