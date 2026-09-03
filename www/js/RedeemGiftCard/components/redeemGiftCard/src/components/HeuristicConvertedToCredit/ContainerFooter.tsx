import { Button, TSystemFeedbackService } from "react-style-guide";
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v1";
import {
  TRANSLATION_KEYS,
  useHeuristicCreditConversionModal,
  useCreditConvertAllModal,
  trackCounter,
  getCreditBucket,
  redeemFunnelMetadata,
} from "@rbx/payments/creditCheckout";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import GetPlusModal from "./GetPlusModal";

type TContainerFooterProps = {
  convertedRobuxAmount: number;
  creditBalance: number;
  currencyCode: string;
  systemFeedbackService: TSystemFeedbackService;
  isConvertAllFlowEnabled: boolean;
  translate: TranslateFunction;
  plusProducts: SubscriptionProductInfo[];
  isLoadingPlusProducts: boolean;
  autoOpenGetPlusModal?: boolean;
  onGetPlusModalAutoOpened?: () => void;
  onGetPlusModalAutoOpenFailed?: () => void;
  preferredGetPlusSubscriptionTargetKey?: string;
};

const buttonInitProps = {
  width: Button.widths.full,
  variant: Button.variants.secondary,
  size: Button.sizes.medium,
};

function ContainerFooter({
  convertedRobuxAmount,
  creditBalance,
  currencyCode,
  systemFeedbackService,
  isConvertAllFlowEnabled,
  translate,
  plusProducts,
  isLoadingPlusProducts,
  autoOpenGetPlusModal = false,
  onGetPlusModalAutoOpened,
  onGetPlusModalAutoOpenFailed,
  preferredGetPlusSubscriptionTargetKey,
}: TContainerFooterProps) {
  const [isGetPlusModalOpen, setIsGetPlusModalOpen] = useState(false);

  const showGetPlus = plusProducts.length > 0;

  const handleModalSuccess = useCallback((isCreditConversion: boolean) => {
    // Long term, may be possible to just update the Available Credit on the page + refresh the Navigation bar.
    // For now, just refresh page after credit conversion.
    if (isCreditConversion) {
      window.location.reload();
    }
  }, []);

  const [HeuristicCreditConversionModal, startCreditConversionFlow] =
    useHeuristicCreditConversionModal({
      systemFeedbackService,
      translate,
      onSuccess: handleModalSuccess,
    });
  const [CreditConvertAllModal, creditConvertAllModalService] = useCreditConvertAllModal();

  const handleGetPlusClick = useCallback(() => {
    const creditBucket = getCreditBucket(creditBalance);
    trackCounter("GetPlus_EntryClicked", { creditBucket, currencyCode });
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.REDEEM_CREDIT_FOOTER,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GET_PLUS_CLICKED,
      redeemFunnelMetadata({
        availableCreditBalance: String(creditBalance),
        currencyCode,
      }),
    );
    setIsGetPlusModalOpen(true);
  }, [creditBalance, currencyCode]);

  useEffect(() => {
    if (!autoOpenGetPlusModal || isGetPlusModalOpen) {
      return;
    }
    if (!showGetPlus) {
      if (!isLoadingPlusProducts) {
        onGetPlusModalAutoOpenFailed?.();
      }
      return;
    }
    const creditBucket = getCreditBucket(creditBalance);
    trackCounter("GetPlus_AutoOpened", { creditBucket, currencyCode });
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.REDEEM_CREDIT_GET_PLUS_MODAL,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      undefined,
      redeemFunnelMetadata({
        availableCreditBalance: String(creditBalance),
        currencyCode,
        source: "giftCard",
      }),
    );
    setIsGetPlusModalOpen(true);
    onGetPlusModalAutoOpened?.();
  }, [
    autoOpenGetPlusModal,
    creditBalance,
    showGetPlus,
    isLoadingPlusProducts,
    isGetPlusModalOpen,
    onGetPlusModalAutoOpened,
    onGetPlusModalAutoOpenFailed,
    currencyCode,
  ]);

  const handleStartCreditConversion = useCallback(() => {
    const creditBucket = getCreditBucket(creditBalance);
    const buttonType = convertedRobuxAmount > 0 ? "convertCredit" : "getRobux";
    trackCounter("GetRobux_EntryClicked", {
      buttonType,
      creditBucket,
      currencyCode,
    });
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.REDEEM_CREDIT_FOOTER,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GET_ROBUX_CLICKED,
      redeemFunnelMetadata({
        availableCreditBalance: String(creditBalance),
        currencyCode,
        buttonType,
      }),
    );
    if (isConvertAllFlowEnabled) {
      creditConvertAllModalService.open();
    } else {
      startCreditConversionFlow();
    }
  }, [
    startCreditConversionFlow,
    isConvertAllFlowEnabled,
    creditConvertAllModalService,
    convertedRobuxAmount,
    creditBalance,
    currencyCode,
  ]);

  const impressionTrackedRef = useRef(false);
  useEffect(() => {
    if (isLoadingPlusProducts || impressionTrackedRef.current) {
      return;
    }
    impressionTrackedRef.current = true;
    const convertVisible = convertedRobuxAmount > 0;
    trackCounter("ConversionFooter_Viewed", {
      getPlusVisible: String(!convertVisible && showGetPlus),
      getRobuxVisible: String(!convertVisible),
      convertVisible: String(convertVisible),
      creditBucket: getCreditBucket(creditBalance),
      currencyCode,
    });
  }, [isLoadingPlusProducts, convertedRobuxAmount, showGetPlus, creditBalance, currencyCode]);

  const paymentFlowImpressionTrackedRef = useRef(false);
  useEffect(() => {
    if (isLoadingPlusProducts || paymentFlowImpressionTrackedRef.current) {
      return;
    }
    paymentFlowImpressionTrackedRef.current = true;
    const convertVisible = convertedRobuxAmount > 0;
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.REDEEM_CREDIT_FOOTER,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      undefined,
      redeemFunnelMetadata({
        availableCreditBalance: String(creditBalance),
        currencyCode,
        getPlusVisible: String(!convertVisible && showGetPlus),
        getRobuxVisible: String(!convertVisible),
        convertVisible: String(convertVisible),
      }),
    );
  }, [isLoadingPlusProducts, convertedRobuxAmount, showGetPlus, creditBalance, currencyCode]);

  // If credit balance > 0 => we render footer
  // In footer:
  //   if the Robux Amount > 0, then we show ConvertCreditToRobux button
  //   if the Robux Amount = 0, then we show Get Robux button
  const showConvertCreditToRobuxButtonOnly = convertedRobuxAmount > 0;

  return (
    <div className="hcc-container-footer convert-text d-flex justify-content-between">
      {showConvertCreditToRobuxButtonOnly ? (
        <Button
          {...buttonInitProps}
          className="convert-credit-to-robux-button"
          onClick={handleStartCreditConversion}
        >
          {translate(TRANSLATION_KEYS.ConvertCreditToRobuxAction) || "Available Credit:"}
        </Button>
      ) : (
        <Fragment>
          {showGetPlus && (
            <Button {...buttonInitProps} className="get-plus-button" onClick={handleGetPlusClick}>
              {translate(TRANSLATION_KEYS.GetPlusAction)}
            </Button>
          )}
          <Button
            {...buttonInitProps}
            className="get-robux-button"
            variant={Button.variants.growth}
            onClick={handleStartCreditConversion}
          >
            {translate(TRANSLATION_KEYS.GetRobuxAction)}
          </Button>
        </Fragment>
      )}
      <HeuristicCreditConversionModal />
      {showGetPlus && isGetPlusModalOpen && (
        <GetPlusModal
          open={isGetPlusModalOpen}
          onOpenChange={setIsGetPlusModalOpen}
          creditBalance={creditBalance}
          currencyCode={currencyCode}
          translate={translate}
          systemFeedbackService={systemFeedbackService}
          products={plusProducts}
          preferredPackageId={preferredGetPlusSubscriptionTargetKey}
        />
      )}
      {isConvertAllFlowEnabled && (
        <CreditConvertAllModal
          systemFeedbackService={systemFeedbackService}
          translate={translate}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

export default ContainerFooter;
