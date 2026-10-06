import { paymentFlowAnalyticsService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button } from "@rbx/foundation-ui";
import { usePaymentSession } from "@rbx/payments/services/paymentSession";
import { getFreeTrialDisplay } from "@rbx/payments/services/subscriptions";
import {
  BillingInfoDisplay,
  BillingPeriodSheet,
  PlusReferralLandingContainer,
  readPlusReferralLanding,
  RobloxPlusHeading,
  ProductFeaturesList,
  RobloxPlusGiftItemUpsellBanner,
  SUBSCRIPTION_TERMS_URL,
  SubscriptionButton,
  translateHtml,
} from "@rbx/subscriptions-common";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import BackdropTexture from "./BackdropTexture";
import BenefitDetailDialog from "./BenefitDetailDialog";
import PlusBundleCards from "./PlusBundleCards";
import Divider from "./ui/Divider";
import useLocalizedMoney from "../hooks/useLocalizedMoney";
import { Event } from "../utils/eventsCounter";
import { GIFT_ITEM, navigateToGiftItemDetails } from "../utils/giftItemNavigation";
import { publishMetric } from "../utils/publishMetric";
import {
  getFeatureConfig,
  groupPlusProducts,
  isFreeTrialEligible,
  toBillingPeriodOption,
} from "../utils/subscriptionProductInfo";

import type { BundleButtonProps } from "./PlusBundleCards";
import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";
import type { FC, ReactNode } from "react";
// Keep the promotion implementation available for a future rerun without rendering it currently.
const PURCHASE_GIFT_BANNER_CONFIG = {
  enabled: false,
  arrivedGiftDate: new Date(2026, 7, 14),
};

export type PurchaseViewProps = {
  deviceMeta: DeviceMeta;
  robloxSubscriptionProducts: SubscriptionProductInfo[];
  isEntrypointDisabled: boolean;
  onMobilePurchaseInitiated: () => void;
};

const PurchaseView: FC<PurchaseViewProps> = ({
  deviceMeta,
  robloxSubscriptionProducts,
  isEntrypointDisabled,
  onMobilePurchaseInitiated,
}) => {
  const { translate } = useTranslation();
  const { id: paymentSessionId } = usePaymentSession() ?? {};

  const landing = useMemo(() => readPlusReferralLanding(window.location.search), []);
  const referrerId = landing.kind === "invite" ? landing.referrerId : undefined;

  const baselineProduct = robloxSubscriptionProducts[0];
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const localizedArrivedGiftDate = useMemo(
    () =>
      PURCHASE_GIFT_BANNER_CONFIG.arrivedGiftDate.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [],
  );

  if (!baselineProduct) {
    // Parent (Content.tsx) should never mount this with an empty array, but
    // this guard keeps the rest of the file free of `| undefined` noise.
    throw new Error("PurchaseView requires at least one subscription product");
  }

  const { plusTerms, bundles, unsupported } = useMemo(
    () => groupPlusProducts(robloxSubscriptionProducts),
    [robloxSubscriptionProducts],
  );
  const billingPeriodOptions = useMemo(() => plusTerms.map(toBillingPeriodOption), [plusTerms]);
  const hasBundles = bundles.length > 0;
  const opensBillingPeriodSheet = billingPeriodOptions.length > 1;

  const { id: productId, type: productType } = baselineProduct.productKey;

  const freeTrialOffer = useMemo(
    () => baselineProduct.eligibleOffers.find(o => o.offerType === "FreeTrial"),
    [baselineProduct.eligibleOffers],
  );
  const isFreeTrial = freeTrialOffer != null;

  const trialEndDate = useMemo(() => {
    const endDate = freeTrialOffer?.freeTrialOffer?.estimatedTrialEndDate;
    if (!endDate) {
      return "";
    }
    return new Date(endDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [freeTrialOffer]);

  const termsLink = useMemo(
    () => [
      {
        opening: "linkStart",
        closing: "linkEnd",
        render: (children: ReactNode) => (
          <a
            className="content-link underline"
            href={SUBSCRIPTION_TERMS_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            {children}
          </a>
        ),
      },
    ],
    [],
  );

  const trialDisplay = getFreeTrialDisplay(freeTrialOffer, baselineProduct.periodType);
  const useVariableTrialCopy = isFreeTrial && trialDisplay != null;

  const legalFooter: ReactNode = isEntrypointDisabled
    ? translate("Description.EntrypointDisabled")
    : useVariableTrialCopy
      ? translateHtml(translate, "Description.SubscriptionFreeTrialLegalV2", termsLink, {
          date: trialEndDate,
          trialDuration: String(trialDisplay.trialDuration),
          trialPeriodLabel: translate(trialDisplay.trialPeriodKey),
          billingPeriodLabel: translate(trialDisplay.billingPeriodKey),
        })
      : translateHtml(
          translate,
          isFreeTrial ? "Description.SubscriptionFreeTrialLegal" : "Description.SubscriptionLegal",
          termsLink,
          isFreeTrial ? { date: trialEndDate } : undefined,
        );

  // Defer VIEW_SHOWN until `usePaymentSession` resolves so the event carries
  // the same `paymentSessionId` as downstream USER_INPUT events. Use a ref to
  // guarantee fire-once.
  const hasFiredViewShown = useRef(false);
  useEffect(() => {
    if (hasFiredViewShown.current || !paymentSessionId) {
      return;
    }
    hasFiredViewShown.current = true;
    const viewMessage = isFreeTrial
      ? paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_FREE_TRIAL
      : paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE;
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_LANDING,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      viewMessage,
      paymentSessionId ? { paymentSessionId } : {},
    );
    publishMetric(Event.PURCHASE_VIEW_SHOWN, {
      variant: hasBundles ? "multi" : "single",
      tierCount: String(bundles.length + 1),
      opensBillingPeriodSheet: String(opensBillingPeriodSheet),
      isFreeTrial: String(isFreeTrial),
      referralLanding: landing.kind,
    });
  }, [
    paymentSessionId,
    isFreeTrial,
    hasBundles,
    bundles.length,
    opensBillingPeriodSheet,
    landing.kind,
  ]);

  useEffect(() => {
    unsupported.forEach(product => {
      publishMetric(Event.UNSUPPORTED_PRODUCT_SKIPPED, { productId: product.productKey.id });
    });
  }, [unsupported]);

  const hasFiredReferralLanding = useRef(false);
  useEffect(() => {
    if (hasFiredReferralLanding.current || landing.kind === "none") {
      return;
    }
    hasFiredReferralLanding.current = true;
    publishMetric(Event.REFERRAL_LANDING_DETECTED, {
      kind: landing.kind,
      hasReferrerId: String(referrerId !== undefined),
    });
  }, [landing.kind, referrerId]);

  const isMobileInApp = deviceMeta.isAndroidApp || deviceMeta.isIosApp;

  const [benefitDetail, setBenefitDetail] = useState<{ primary: string; secondary: string } | null>(
    null,
  );

  const trackSubscribeClick = useCallback(
    (product: SubscriptionProductInfo) => {
      const isProductFreeTrial = isFreeTrialEligible(product);
      const viewMessage = isProductFreeTrial
        ? paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_FREE_TRIAL
        : paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE;
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE,
        false,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_LANDING,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        viewMessage,
        {
          product_id: product.productKey.id,
          ...(paymentSessionId ? { paymentSessionId } : {}),
        },
      );
    },
    [paymentSessionId],
  );

  const trackBundleSubscribeClick = useCallback(
    (product: SubscriptionProductInfo) => {
      trackSubscribeClick(product);
      publishMetric(Event.BUNDLE_PICKER_SUBSCRIBE_CLICK, {
        productId: product.productKey.id,
        isFreeTrial: String(isFreeTrialEligible(product)),
      });
    },
    [trackSubscribeClick],
  );

  const billingPeriodAnalyticsContext = useMemo(
    () => ({
      triggeringContext:
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE,
      viewName: paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_LANDING,
    }),
    [],
  );

  const subscribeLabel = isFreeTrial
    ? translate("Action.TryItForFree")
    : translate("Action.Subscribe");

  const sharedButtonProps: BundleButtonProps = {
    deviceMeta,
    isDisabled: isEntrypointDisabled,
    paymentSessionId,
    referrerId,
    onSubscribeClick: isMobileInApp ? onMobilePurchaseInitiated : undefined,
  };

  const subscribeButtonProps = {
    ...sharedButtonProps,
    productId,
    productType,
    trackSubscriptionButtonClick: () => {
      trackSubscribeClick(baselineProduct);
    },
  };

  // The referral popup is its own surface, so a subscribe from it is not a landing-CTA click.
  const referralSubscribeButtonProps = {
    ...subscribeButtonProps,
    trackSubscriptionButtonClick: undefined,
  };

  const openSheet = () => {
    if (isEntrypointDisabled) {
      return;
    }
    publishMetric(Event.PURCHASE_VIEW_OPEN_SHEET_CLICK);
    setIsSheetOpen(true);
  };

  const renderSheetTriggerButton = (className: string, size: "Large" | "Medium" = "Large") => (
    <Button
      className={className}
      data-testid="purchase-open-sheet-button"
      isDisabled={isEntrypointDisabled}
      size={size}
      variant="Emphasis"
      onClick={openSheet}
    >
      {subscribeLabel}
    </Button>
  );

  const baselinePrice = useLocalizedMoney(baselineProduct.localizedPrice);
  const withBundlesSubtitle = translateHtml(
    translate,
    "Label.PlusLandingPage.Subtitle.V3",
    [
      {
        opening: "boldStart",
        closing: "boldEnd",
        render: price => <span className="text-heading-small">{price}</span>,
      },
    ],
    {
      price: baselinePrice,
      periodType: baselineProduct.periodType,
    },
  );

  const mobileDock = (
    <div
      aria-label={translate("Action.Subscribe")}
      className="bottom-dock padding-t-medium bg-surface-100 large:hidden width-full gap-y-medium flex flex-col"
      data-testid="purchase-subscribe-dock"
      role="region"
    >
      <Divider />
      <div className="width-full gap-y-medium padding-b-[env(safe-area-inset-bottom\,0px)] padding-x-xxlarge flex flex-col items-stretch">
        {opensBillingPeriodSheet ? (
          renderSheetTriggerButton("min-width-0 width-full")
        ) : (
          <SubscriptionButton
            {...subscribeButtonProps}
            className="min-width-0 width-full"
            size="Medium"
          >
            {subscribeLabel}
          </SubscriptionButton>
        )}
        <p className="text-caption-small content-muted margin-bottom-[24px] large:margin-bottom-none padding-x-xsmall text-align-x-start">
          {legalFooter}
        </p>
      </div>
    </div>
  );

  return (
    <Fragment>
      <BackdropTexture />
      <div className="width-full min-width-0 large:items-center flex flex-col items-start">
        <div className="margin-top-[48px] width-full min-width-0 content-emphasis large:max-width-[792px] large:self-auto large:padding-x-xlarge gap-y-xxlarge flex flex-col self-stretch">
          {PURCHASE_GIFT_BANNER_CONFIG.enabled && (
            <div className="width-full min-width-0 padding-x-xxlarge large:padding-x-none">
              <RobloxPlusGiftItemUpsellBanner
                body={translate("Description.BannerBodyArrivedPurchase", {
                  date: localizedArrivedGiftDate,
                })}
                title={translate("Description.BannerTitleArrivedPurchase")}
                onItemDetailsClick={() => {
                  navigateToGiftItemDetails(GIFT_ITEM).catch(() => undefined);
                }}
              />
            </div>
          )}
          <div className="width-full min-width-0 gap-y-xxlarge padding-x-xxlarge text-align-x-start large:gap-y-[24px] large:items-center large:padding-x-none large:text-align-x-center flex flex-col items-start">
            <div className="gap-y-xsmall large:items-center flex flex-col items-start">
              <RobloxPlusHeading variant="compact" />
              <h1 className="font-builder-extended text-display-small large:![font-size:var(--font-size-1000)] content-emphasis ![font-size:var(--font-size-800)]">
                <span className="large:inline block">
                  {translate("Title.PurchasePromoHeadlinePart1")}
                </span>
                <span className="large:inline hidden">&nbsp;</span>
                <span className="large:inline block">
                  {translate("Title.PurchasePromoHeadlinePart2")}
                </span>
              </h1>
            </div>
            <div className="gap-y-xsmall width-full min-width-0 large:text-align-x-center flex flex-col">
              {hasBundles ? (
                <span className="text-body-large content-emphasis">{withBundlesSubtitle}</span>
              ) : (
                <BillingInfoDisplay
                  eligibleOffers={baselineProduct.eligibleOffers}
                  periodType={baselineProduct.periodType}
                  price={baselineProduct.localizedPrice}
                />
              )}
              <div className="width-full gap-y-medium padding-t-none large:margin-x-auto large:margin-top-[24px] large:flex large:max-width-[min(440px,100%)] large:width-full large:flex-col large:items-center hidden items-start">
                <div className="width-full gap-x-small flex shrink-0 flex-row items-start justify-center">
                  {opensBillingPeriodSheet ? (
                    renderSheetTriggerButton("width-full large:width-[230px] shrink-0", "Medium")
                  ) : (
                    <SubscriptionButton
                      {...subscribeButtonProps}
                      className="width-full large:width-[230px] shrink-0"
                      size="Medium"
                    >
                      {subscribeLabel}
                    </SubscriptionButton>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="width-full min-width-0 gap-y-xxlarge padding-x-xxlarge large:padding-x-none flex flex-col">
            <div className="width-full gap-y-large flex flex-col">
              <span className="text-heading-small">
                {translate("Title.Benefits", { productShort: translate("Label.BlackbirdShort") })}
              </span>
              {/* No freeTrialOffer: the landing lists non-trial bundles too, so the shared benefits card
                  shows the generic 60-day window rather than the base trial's extended window. */}
              <ProductFeaturesList
                featureConfig={getFeatureConfig(baselineProduct)}
                periodType={baselineProduct.periodType}
                onTileClick={(primary, secondary) => {
                  setBenefitDetail({ primary, secondary });
                }}
              />
            </div>
            {hasBundles && (
              <PlusBundleCards
                bundles={bundles}
                buttonProps={sharedButtonProps}
                trackSubscribeClick={trackBundleSubscribeClick}
              />
            )}
            <p
              className="text-caption-small content-muted padding-x-xsmall text-align-x-start large:block large:padding-x-none hidden"
              data-testid="purchase-legal-footer"
            >
              {legalFooter}
            </p>
          </div>
        </div>
      </div>
      {mobileDock}

      <BenefitDetailDialog
        body={benefitDetail?.secondary ?? ""}
        open={benefitDetail != null}
        title={benefitDetail?.primary ?? ""}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            setBenefitDetail(null);
          }
        }}
      />
      {opensBillingPeriodSheet && (
        <BillingPeriodSheet
          analyticsContext={billingPeriodAnalyticsContext}
          deviceMeta={deviceMeta}
          isDisabled={isEntrypointDisabled}
          isOpen={isSheetOpen}
          options={billingPeriodOptions}
          paymentSessionId={paymentSessionId}
          referrerId={referrerId}
          onMobilePurchaseInitiated={onMobilePurchaseInitiated}
          onOpenChange={setIsSheetOpen}
        />
      )}
      <PlusReferralLandingContainer
        subscribeButtonProps={referralSubscribeButtonProps}
        subscribeEligibleOffers={baselineProduct.eligibleOffers}
        subscribeFeatureConfig={getFeatureConfig(baselineProduct)}
        subscribePeriodType={baselineProduct.periodType}
        subscribePrice={baselineProduct.localizedPrice}
      />
    </Fragment>
  );
};

export default PurchaseView;
