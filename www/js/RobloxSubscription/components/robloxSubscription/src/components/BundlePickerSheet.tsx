import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { useTranslation } from "@rbx/core-scripts/react";
import { SheetActions, SheetBody, SheetContent, SheetRoot, SheetTitle } from "@rbx/foundation-ui";
import { SubscriptionButton, translateHtml } from "@rbx/subscriptions-common";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BundlePickerSheetRow from "./BundlePickerSheetRow";
import { Event } from "../utils/eventsCounter";
import { publishMetric } from "../utils/publishMetric";
import { findFreeTrialOffer, isFreeTrialEligible } from "../utils/subscriptionProductInfo";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v1";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";
import type { FC, ReactNode } from "react";

const SUBSCRIPTION_TERMS_URL = "https://www.roblox.com/info/terms";

export type BundlePickerSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-sorted ascending by Robux allowance. Must be non-empty. */
  products: SubscriptionProductInfo[];
  deviceMeta: DeviceMeta;
  isEntrypointDisabled: boolean;
  onMobilePurchaseInitiated: () => void;
  /** Payments-gateway session id for checkout handoff (from {@link usePaymentSession}). */
  paymentSessionId?: string;
};

const BundlePickerSheet: FC<BundlePickerSheetProps> = ({
  isOpen,
  onOpenChange,
  products,
  deviceMeta,
  isEntrypointDisabled,
  onMobilePurchaseInitiated,
  paymentSessionId,
}) => {
  const { translate } = useTranslation();
  const baselineProductId = products[0]?.productKey.id;
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(baselineProductId);

  // Keep the selection sticky on the baseline if product set changes.
  useEffect(() => {
    if (!selectedProductId || !products.some(p => p.productKey.id === selectedProductId)) {
      setSelectedProductId(baselineProductId);
    }
  }, [baselineProductId, products, selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find(p => p.productKey.id === selectedProductId) ?? products[0],
    [products, selectedProductId],
  );

  const selectedIsFreeTrial = isFreeTrialEligible(selectedProduct);

  // Analytics: sheet opened. Defer VIEW_SHOWN until `paymentSessionId` is
  // available so the event carries the same id as downstream USER_INPUT events,
  // and use a ref to fire exactly once per open (the sheet stays mounted across
  // open/close cycles, so the ref is reset when `isOpen` becomes false).
  const hasFiredSheetViewShown = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      hasFiredSheetViewShown.current = false;
      return;
    }
    if (hasFiredSheetViewShown.current || !paymentSessionId) {
      return;
    }
    hasFiredSheetViewShown.current = true;
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_LANDING,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_BUNDLE_SHEET_OPENED,
      paymentSessionId ? { paymentSessionId } : {},
    );
    publishMetric(Event.BUNDLE_PICKER_SHEET_OPENED, {
      tierCount: String(products.length),
      defaultProductId: baselineProductId ?? "",
    });
  }, [isOpen, paymentSessionId, products.length, baselineProductId]);

  const onSelectTier = useCallback(
    (productId: string) => {
      setSelectedProductId(productId);
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE,
        false,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_LANDING,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_BUNDLE_TIER_SELECTED,
        { product_id: productId, ...(paymentSessionId ? { paymentSessionId } : {}) },
      );
      publishMetric(Event.BUNDLE_PICKER_TIER_SELECTED, { productId });
    },
    [paymentSessionId],
  );

  const trackSubscribeClick = useCallback(() => {
    const viewMessage = selectedIsFreeTrial
      ? paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_FREE_TRIAL
      : paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE;
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBLOX_PLUS_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_LANDING,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage,
      paymentSessionId ? { paymentSessionId } : {},
    );
    publishMetric(Event.BUNDLE_PICKER_SUBSCRIBE_CLICK, {
      productId: selectedProductId ?? "",
      isFreeTrial: String(selectedIsFreeTrial),
    });
  }, [selectedIsFreeTrial, selectedProductId, paymentSessionId]);

  if (!selectedProduct) {
    // Defensive: parent shouldn't mount this sheet with an empty list.
    return null;
  }

  const termsLink = [
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
  ];

  const trialEndDate = (() => {
    const endDate = findFreeTrialOffer(selectedProduct)?.freeTrialOffer?.estimatedTrialEndDate;
    if (!endDate) {
      return "";
    }
    return new Date(endDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  const legalKey = selectedIsFreeTrial
    ? "Description.SubscriptionFreeTrialLegal"
    : "Description.SubscriptionLegal";

  const legalFooter: ReactNode = isEntrypointDisabled
    ? translate("Description.EntrypointDisabled")
    : translateHtml(
        translate,
        legalKey,
        termsLink,
        selectedIsFreeTrial ? { date: trialEndDate } : undefined,
      );

  const isMobileInApp = deviceMeta.isAndroidApp || deviceMeta.isIosApp;

  const subscribeLabel = selectedIsFreeTrial
    ? translate("Action.TryItForFree")
    : translate("Action.PricePerMonth", {
        price: selectedProduct.localizedPriceDisplayString ?? "",
        periodType: selectedProduct.periodType,
      });

  return (
    <SheetRoot open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        centerSheetSize="Medium"
        closeLabel={translate("Action.Close")}
        largeScreenVariant="center"
      >
        <SheetTitle>{translate("Label.PickAPlan")}</SheetTitle>
        <SheetBody
          className="gap-y-medium padding-y-medium flex flex-col"
          data-testid="bundle-picker-sheet-body"
        >
          {products.map((product, index) => (
            <BundlePickerSheetRow
              key={product.productKey.id}
              isBundle={index !== 0}
              isSelected={selectedProduct.productKey.id === product.productKey.id}
              product={product}
              onSelect={() => {
                onSelectTier(product.productKey.id);
              }}
            />
          ))}
        </SheetBody>
        <SheetActions>
          <div className="gap-y-small flex flex-col">
            <SubscriptionButton
              className="width-full"
              deviceMeta={deviceMeta}
              isDisabled={isEntrypointDisabled}
              paymentSessionId={paymentSessionId}
              productId={selectedProductId ?? ""}
              productType={selectedProduct.productKey.type}
              size="Medium"
              trackSubscriptionButtonClick={trackSubscribeClick}
              onSubscribeClick={isMobileInApp ? onMobilePurchaseInitiated : undefined}
            >
              {subscribeLabel}
            </SubscriptionButton>
            <p
              className="text-caption-small content-muted text-align-x-left"
              data-testid="bundle-picker-legal-footer"
            >
              {legalFooter}
            </p>
          </div>
        </SheetActions>
      </SheetContent>
    </SheetRoot>
  );
};

export default BundlePickerSheet;
