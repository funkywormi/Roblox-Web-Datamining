import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button, Icon, SheetBody, SheetContent, SheetTitle } from "@rbx/foundation-ui";
import { usePaymentSession } from "@rbx/payments/services/paymentSession";
import { translateHtml } from "@rbx/translation-utils";
import { useCallback, useEffect, useMemo, useRef } from "react";

import BenefitList from "./BenefitList";
import BillingInfoDisplay from "./BillingInfoDisplay";
import useLocalizedMoney from "../../hooks/useLocalizedMoney";
import SubscriptionButton from "../shared/SubscriptionButton";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v1";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";

const SUBSCRIPTION_TERMS_URL = "https://www.roblox.com/info/terms";

const { ENUM_TRIGGERING_CONTEXT } = paymentFlowAnalyticsService;

type TriggeringContext = (typeof ENUM_TRIGGERING_CONTEXT)[keyof typeof ENUM_TRIGGERING_CONTEXT];

export type RobloxSubscriptionSheetProps = {
  subscriptionProductInfo: SubscriptionProductInfo;
  deviceMeta: DeviceMeta;
  redirectUrl?: string;
  /**
   * Starts an asset-based upsell flow, which stamps `item_type` and derives the
   * triggering context from the asset. Omit for surfaces that aren't selling an
   * asset and pass {@link RobloxSubscriptionSheetProps.triggeringContext} instead.
   */
  assetType?: string;
  /**
   * UI surface the user came from, reported as `trigger_context` on the
   * UserPurchaseFlow events. Only applied when no flow is already in progress.
   */
  triggeringContext?: TriggeringContext;
  onSubscribeClick?: () => void;
  /** Fired only on mobile in-app subscribe click; see SubscriptionButton. */
  onMobilePurchaseInitiated?: () => void;
  /**
   * Externally controlled loading state for the subscribe CTA. Used by the
   * mobile in-app flow to keep the button in a spinner state while the parent
   * polls for the new entitlement.
   */
  isLoading?: boolean;
  /**
   * Optional Back affordance. When set, a Standard "Back" button renders inline
   * with the subscribe CTA and replaces the sheet's X close.
   */
  onBack?: () => void;
  /**
   * Optional title override. Defaults to `Title.GetBlackbird`. The roblox-plus
   * icon is shown alongside it unless {@link showBrandIcon} is false.
   */
  title?: React.ReactNode;
  /** Optional subtitle rendered under the title. Defaults to none. */
  subtitle?: React.ReactNode;
  /** Shows the roblox-plus brand icon next to the title. Defaults to true. */
  showBrandIcon?: boolean;
  /** Shows the price/billing row above the benefits. Defaults to true. */
  showBillingInfo?: boolean;
  /**
   * Shows the price (e.g. "$4.99/month") as the subscribe CTA label instead of
   * "Subscribe". Ignored during a free trial. Defaults to false.
   */
  showPriceInCta?: boolean;
};

const RobloxSubscriptionSheet = ({
  subscriptionProductInfo,
  deviceMeta,
  redirectUrl,
  assetType,
  triggeringContext = ENUM_TRIGGERING_CONTEXT.WEB_PRIVATE_SERVER_PLUS_UPSELL,
  onSubscribeClick,
  onMobilePurchaseInitiated,
  isLoading,
  onBack,
  title,
  subtitle,
  showBrandIcon = true,
  showBillingInfo = true,
  showPriceInCta = false,
}: RobloxSubscriptionSheetProps) => {
  const { translate } = useTranslation();
  const { id: paymentSessionId } = usePaymentSession() ?? {};

  const { type, id } = subscriptionProductInfo.productKey;
  const { periodType, localizedPrice, eligibleOffers } = subscriptionProductInfo;
  const featureConfig =
    subscriptionProductInfo.productTypeDetails.robloxSubscriptionProductDetails?.featureConfig;

  const freeTrialOffer = useMemo(
    () => eligibleOffers.find(o => o.offerType === "FreeTrial"),
    [eligibleOffers],
  );
  const isFreeTrial = freeTrialOffer != null;

  const displayPrice = useLocalizedMoney(localizedPrice);

  const plusUpsellViewMessage = useMemo(
    () =>
      isFreeTrial
        ? paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_FREE_TRIAL
        : paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE,
    [isFreeTrial],
  );

  // Defer VIEW_SHOWN (and the upsell-flow start) until `usePaymentSession`
  // resolves so the event carries the same `paymentSessionId` as downstream
  // USER_INPUT events. Use a ref to guarantee fire-once.
  const hasFiredViewShown = useRef(false);
  useEffect(() => {
    if (hasFiredViewShown.current || !paymentSessionId) {
      return;
    }
    hasFiredViewShown.current = true;
    // startRobloxPlusUpsellFlow maps assetType -> the right WEB_*_PLUS_UPSELL
    // context and force-stores it on the singleton, overriding the context
    // passed below. Asset-less surfaces skip it, so their triggeringContext is
    // only adopted when no flow is in progress: a flow already resumed from the
    // RBXPaymentsFlowContext cookie keeps the originating surface's context.
    if (assetType) {
      paymentFlowAnalyticsService.startRobloxPlusUpsellFlow({ assetType });
    }
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      triggeringContext,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_UPSELL_BANNER,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      plusUpsellViewMessage,
      paymentSessionId ? { paymentSessionId } : {},
    );
  }, [paymentSessionId, assetType, triggeringContext, plusUpsellViewMessage]);

  const sendEventAndTrackingOnClick = useCallback(() => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      triggeringContext,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_UPSELL_BANNER,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      plusUpsellViewMessage,
      paymentSessionId ? { paymentSessionId } : {},
    );
    onSubscribeClick?.();
  }, [triggeringContext, plusUpsellViewMessage, onSubscribeClick, paymentSessionId]);

  const legalKey = isFreeTrial
    ? "Description.SubscriptionFreeTrialLegal"
    : "Description.SubscriptionLegal";

  const trialEndDate = useMemo(() => {
    const endDate = freeTrialOffer?.freeTrialOffer?.estimatedTrialEndDate;
    if (!endDate) return "";
    return new Date(endDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [freeTrialOffer]);

  const termsLink = [
    {
      opening: "linkStart",
      closing: "linkEnd",
      render: (children: React.ReactNode) => (
        <a
          className="underline"
          href={SUBSCRIPTION_TERMS_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          {children}
        </a>
      ),
    },
  ];

  const ctaLabel =
    showPriceInCta && !isFreeTrial
      ? translate("Description.BillingInfo", { price: displayPrice, periodType })
      : translate(isFreeTrial ? "Action.TryItForFree" : "Action.Subscribe");

  const subscribeButton = (
    <SubscriptionButton
      className={onBack ? "width-full" : undefined}
      deviceMeta={deviceMeta}
      isLoading={isLoading}
      paymentSessionId={paymentSessionId}
      productId={id}
      productType={type}
      redirectUrl={redirectUrl}
      trackSubscriptionButtonClick={sendEventAndTrackingOnClick}
      onMobilePurchaseInitiated={onMobilePurchaseInitiated}
    >
      {ctaLabel}
    </SubscriptionButton>
  );

  return (
    <SheetContent
      centerSheetSize="Medium"
      // Hide Foundation's built-in X close when Back is present.
      className={onBack ? "[&_.fui-sheet-close-affordance-container]:hidden" : undefined}
      closeLabel={translate("Action.Close")}
      largeScreenVariant="center"
    >
      <SheetTitle>
        <div className="gap-x-small flex items-center">
          {showBrandIcon && <Icon className="size-1000" name="icon-regular-roblox-plus" />}
          {title ?? translate("Title.GetBlackbird")}
        </div>
        {subtitle != null && (
          <div className="margin-top-small text-body-large content-default">{subtitle}</div>
        )}
      </SheetTitle>
      <SheetBody>
        <div className="padding-large gap-y-xlarge flex flex-col">
          {showBillingInfo && (
            <BillingInfoDisplay
              eligibleOffers={eligibleOffers}
              periodType={periodType}
              price={localizedPrice}
            />
          )}

          {featureConfig && (
            <BenefitList
              featureConfig={{
                ...featureConfig,
                isTradingEnabled: false,
                isUgcPublishingEnabled: false,
              }}
              periodType={periodType}
            />
          )}

          {onBack ? (
            <div className="gap-x-medium flex">
              {subscribeButton}
              <Button className="width-full" variant="Standard" onClick={onBack}>
                {translate("Action.Back")}
              </Button>
            </div>
          ) : (
            subscribeButton
          )}

          <span className="text-caption-medium content-muted">
            {translateHtml(
              translate,
              legalKey,
              termsLink,
              isFreeTrial ? { date: trialEndDate } : undefined,
            )}
          </span>
        </div>
      </SheetBody>
    </SheetContent>
  );
};

export default RobloxSubscriptionSheet;
