import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TSystemFeedbackService } from "react-style-guide";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Icon,
  ListItem,
  OptionSelector,
} from "@rbx/foundation-ui";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import {
  PaymentProvider,
  ProductType,
  SubscriptionProductInfo,
} from "@rbx/client-subscriptions-api/v1";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import {
  SYSTEM_FEEDBACK_CONFIG,
  TRANSLATION_KEYS,
  trackCounter,
  trackError,
  getCreditBucket,
  redeemFunnelMetadata,
} from "@rbx/payments/creditCheckout";
import { preparePurchaseV2, getPrice } from "@rbx/payments/services/subscriptions";
import { usePaymentSession } from "@rbx/payments/services/paymentSession";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { PriceTag } from "@rbx/payments/priceTag";

type TGetPlusModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditBalance: number;
  currencyCode: string;
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
  products: SubscriptionProductInfo[];
  preferredPackageId?: string;
};

type TPlusFeature = {
  icon: TTailwindIconClass;
  title: string;
  subtitle: string;
};

type TPlusPackage = {
  id: string;
  tier: string;
  duration: string;
  price: string;
  originalPrice: string;
  isDisabled: boolean;
};

const canAfford = (product: SubscriptionProductInfo, creditBalance: number): boolean =>
  getPrice(product.localizedPrice) <= creditBalance;

const getTier = (product: SubscriptionProductInfo): string =>
  `${product.periodCount}_${product.periodType}`;

const GetPlusModal = ({
  open,
  onOpenChange,
  creditBalance,
  currencyCode,
  translate,
  systemFeedbackService,
  products,
  preferredPackageId,
}: TGetPlusModalProps): JSX.Element => {
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const paymentSession = usePaymentSession();
  const paymentSessionId = paymentSession?.id;

  const sortedProducts = useMemo(
    () => products.toSorted((a, b) => getPrice(a.localizedPrice) - getPrice(b.localizedPrice)),
    [products],
  );

  const autoSelectTrackedRef = useRef(false);
  const autoSelectPaymentFlowTrackedRef = useRef(false);
  useEffect(() => {
    if (!open) {
      autoSelectTrackedRef.current = false;
      autoSelectPaymentFlowTrackedRef.current = false;
      return;
    }
    const affordable = sortedProducts.filter(product => canAfford(product, creditBalance));
    const preferredProduct = preferredPackageId
      ? affordable.find(product => product.productKey.id === preferredPackageId)
      : undefined;
    const defaultProduct = affordable.at(-1);
    const selectedProduct = preferredProduct ?? defaultProduct;
    setSelectedPackageId(selectedProduct?.productKey.id ?? "");
    if (selectedProduct && !autoSelectTrackedRef.current) {
      autoSelectTrackedRef.current = true;
      trackCounter("GetPlus_TierSelected", {
        tier: getTier(selectedProduct),
        source: "auto",
        creditBucket: getCreditBucket(creditBalance),
        currencyCode,
      });
    }
    if (selectedProduct && !autoSelectPaymentFlowTrackedRef.current) {
      autoSelectPaymentFlowTrackedRef.current = true;
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.REDEEM_CREDIT_GET_PLUS_MODAL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.TIER_SELECTED,
        redeemFunnelMetadata({
          paymentSessionId: paymentSessionId ?? "",
          tier: getTier(selectedProduct),
          source: "auto",
          availableCreditBalance: String(creditBalance),
          currencyCode,
          subscriptionProductId: selectedProduct.productKey.id,
        }),
      );
    }
  }, [open, sortedProducts, creditBalance, currencyCode, preferredPackageId, paymentSessionId]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (open && !nextOpen) {
      trackCounter("GetPlus_Dismissed");
    }
    onOpenChange(nextOpen);
  };

  const handlePurchaseFailure = (error?: unknown) => {
    if (error) {
      trackError("Error_GetPlus_PreparePurchase_Failed", { reason: "exception" }, error);
    }
    systemFeedbackService.warning(
      translate(TRANSLATION_KEYS.GenericFailureAlert),
      SYSTEM_FEEDBACK_CONFIG.TIMEOUT_SHOW_MS,
      SYSTEM_FEEDBACK_CONFIG.TIMEOUT_HIDE_MS,
    );
  };

  const preparePurchaseMutation = useMutation({
    mutationFn: (packageId: string) =>
      preparePurchaseV2(
        ProductType.Blackbird,
        packageId,
        PaymentProvider.CreditBalance,
        undefined,
        paymentSessionId,
      ),
    onSuccess: response => {
      const checkoutUrl =
        response.providerPurchasePayload.creditBalancePurchasePayload?.checkoutUrl;
      if (checkoutUrl) {
        trackCounter("GetPlus_PreparePurchase_Redirected");
        window.location.href = checkoutUrl;
        return;
      }
      trackError("Error_GetPlus_PreparePurchase_Failed", { reason: "missingCheckoutUrl" });
      handlePurchaseFailure();
    },
    onError: (error: unknown) => {
      handlePurchaseFailure(error);
    },
  });

  const handleSubscribe = () => {
    if (!selectedPackageId || preparePurchaseMutation.isLoading) {
      return;
    }
    const selectedProduct = sortedProducts.find(
      product => product.productKey.id === selectedPackageId,
    );
    trackCounter("GetPlus_SubscribeClicked", {
      tier: selectedProduct ? getTier(selectedProduct) : "unknown",
    });
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.REDEEM_CREDIT_GET_PLUS_MODAL,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.SUBSCRIBE_CLICKED,
      redeemFunnelMetadata({
        paymentSessionId: paymentSessionId ?? "",
        tier: selectedProduct ? getTier(selectedProduct) : "unknown",
        availableCreditBalance: String(creditBalance),
        currencyCode,
        subscriptionProductId: selectedPackageId,
      }),
    );
    preparePurchaseMutation.mutate(selectedPackageId);
  };

  const handleSelectPackage = (packageId: string, tier: string) => {
    setSelectedPackageId(packageId);
    trackCounter("GetPlus_TierSelected", {
      tier,
      source: "manual",
      creditBucket: getCreditBucket(creditBalance),
      currencyCode,
    });
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.REDEEM_CREDIT_GET_PLUS_MODAL,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.TIER_SELECTED,
      redeemFunnelMetadata({
        paymentSessionId: paymentSessionId ?? "",
        tier,
        source: "manual",
        availableCreditBalance: String(creditBalance),
        currencyCode,
        subscriptionProductId: packageId,
      }),
    );
  };

  const toPlusPackage = (product: SubscriptionProductInfo): TPlusPackage => ({
    id: product.productKey.id,
    tier: getTier(product),
    duration: translate("Label.SubscriptionDuration", {
      periodType: product.periodType,
      periodCount: product.periodCount,
    }),
    price: product.localizedPriceDisplayString ?? "",
    originalPrice: product.localizedStrikethroughPriceDisplayString ?? "",
    isDisabled: !canAfford(product, creditBalance),
  });

  const plusPackages = sortedProducts.map(toPlusPackage);

  const features: TPlusFeature[] = [
    {
      icon: "icon-regular-tag",
      title: translate("Description.Benefit.InstantDiscount"),
      subtitle: translate("Description.Benefit.InstantDiscountSubtitle"),
    },
    {
      icon: "icon-regular-tag-arrow-up",
      title: translate("Description.Benefit.OngoingDiscount"),
      subtitle: translate("Description.Benefit.OngoingDiscountSubtitle"),
    },
    {
      icon: "icon-regular-controller",
      title: translate("Description.Benefit.PrivateServers"),
      subtitle: translate("Description.Benefit.PrivateServersSubtitle"),
    },
    {
      icon: "icon-regular-robux",
      title: translate("Description.Benefit.RobuxTransfers"),
      subtitle: translate("Description.Benefit.RobuxTransfersDisclaimer"),
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      size="Large"
      isModal
      hasCloseAffordance
      closeLabel={translate(TRANSLATION_KEYS.CancelAction)}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-xlarge">
          <div className="flex flex-col gap-xsmall">
            <DialogTitle className="flex items-center gap-small text-heading-medium content-emphasis">
              {translate(TRANSLATION_KEYS.AvailableCreditLabel)}
              <PriceTag amount={creditBalance} currencyCode={currencyCode} />
            </DialogTitle>
            <span className="text-body-medium content-default">
              {translate("Message.UseBalanceToSubscribeToPlus")}
            </span>
          </div>

          <div className="flex flex-col gap-medium">
            <span className="text-heading-small content-emphasis">
              {translate("Header.PlusPackages")}
            </span>

            <div className="grid gap-medium [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
              {features.map(feature => (
                <ListItem
                  key={feature.icon}
                  isContained
                  size="Medium"
                  divider="None"
                  alignment="Top"
                  leading={<Icon name={feature.icon} size="Medium" />}
                  title={feature.title}
                  description={feature.subtitle}
                />
              ))}
            </div>

            <div className="grid gap-large [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
              {plusPackages.map(plusPackage => (
                <OptionSelector
                  key={plusPackage.id}
                  layout="Horizontal"
                  size="Medium"
                  type="Checkmark"
                  isDisabled={plusPackage.isDisabled}
                  icon="icon-regular-roblox-plus"
                  label={translate("Label.BlackbirdShort")}
                  description={
                    <span className="flex flex-col gap-xsmall">
                      <span>{plusPackage.duration}</span>
                      <span className="flex items-center gap-xsmall">
                        <span className="text-title-medium content-emphasis">
                          {plusPackage.price}
                        </span>
                        {plusPackage.originalPrice && (
                          <span className="content-muted line-through">
                            {plusPackage.originalPrice}
                          </span>
                        )}
                      </span>
                    </span>
                  }
                  isSelected={selectedPackageId === plusPackage.id}
                  onSelect={() => {
                    handleSelectPackage(plusPackage.id, plusPackage.tier);
                  }}
                />
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-medium">
          <Button
            className="width-full"
            variant="Emphasis"
            size="Medium"
            isDisabled={!selectedPackageId || preparePurchaseMutation.isLoading}
            isLoading={preparePurchaseMutation.isLoading}
            onClick={handleSubscribe}
          >
            {translate(TRANSLATION_KEYS.SubscribeAction)}
          </Button>
          <Button
            className="width-full"
            variant="Standard"
            size="Medium"
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            {translate(TRANSLATION_KEYS.CancelAction)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GetPlusModal;
