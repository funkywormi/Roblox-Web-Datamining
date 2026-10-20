/* eslint-disable no-void */
import { useState, useContext, useCallback, useMemo, Fragment, useEffect } from "react";
import { PaymentIntentResult } from "@stripe/stripe-js";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import {
  Badge,
  Button,
  EducationalTooltip,
  EducationalTooltipBody,
  EducationalTooltipContent,
  EducationalTooltipDescription,
  EducationalTooltipTrigger,
  IconButton,
  ProgressCircle,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogBody,
  Divider,
  Icon,
} from "@rbx/foundation-ui";
import { FullScreenLoading } from "@rbx/payments/components";
import { PriceTag } from "@rbx/payments/priceTag";
import { window } from "@rbx/core-lib/browser";
import { isIconVariant } from "../../utils/iconVariants";
import { resolveBonusRobuxTagLabelKey } from "../../utils/bonusRobuxTag";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { ModalContext } from "../../contexts/ModalContext";
import { convertProviderPayloadMoneyToDecimal, formatAmount } from "../../utils/formatMoney";
import { QuickPaySelectCardDropdown } from "./QuickPaySelectCardDropdown";
import { QuickPayLegalDisclosure } from "../QuickPayLegalDisclosure";
import SubscribeAndSaveQuickPayOffer from "../SubscribeAndSaveQuickPayOffer";
import { QuickPay, QuickPayIframeMessage } from "../../hooks/quickPay/useQuickPay";
import { Money } from "../../types/buyRobuxPageData";
import { TrackingContext } from "../../contexts/TrackingContext";
import { PreparePaymentProviderPayload } from "../../services/paymentsGatewayService";
import { trackCounter } from "../../observability";
import { BlueCheckIcon } from "../BlueCheckIcon";
import "../../stylesheets/quickPay.scss";

export type Complete3DSResult = {
  paymentIntentResult: PaymentIntentResult | undefined;
  error?: Error;
};

function QuickPayModal({
  isBonusItem,
  legalDisclosureTranslationKey,
  paymentProfiles,
  preparePaymentProviderPayload,
  processPaymentForQuickPay,
  process3DSForQuickPay,
  redirectToPurchase,
  selectPaymentProfile,
  selectedPaymentProfile,
  selectedProduct,
  stripe,
  taxTranslationKey,
  subscribedRobuxProductOffers = [],
  isSubscribeAndSaveChecked = false,
  toggleSubscribeAndSave = () => undefined,
}: QuickPay) {
  const {
    bonusItemDisplayName,
    bonusItemId,
    bonusItemImageUrl,
    collectibleBonusItemMetadata,
    buyRobuxPageData,
    getPurchaseUrl,
  } = useContext(BuyRobuxPageContext);
  const {
    quickPay: { closeModal, isOpen: isQuickPayModalOpen },
  } = useContext(ModalContext);
  const { trackQuickPayClose, trackQuickPayUseDifferentPaymentMethod } =
    useContext(TrackingContext);

  const { translate } = useTranslation();

  const ltbItemMetadata = useMemo(() => {
    if (!selectedProduct) return undefined;
    for (const section of buyRobuxPageData.sections) {
      const match = section.limitedTimeBonus?.limitedTimeBonuses.find(item =>
        item.robuxProductIds.includes(selectedProduct.productId),
      );
      if (match) return match.displayableBonus.collectibleItemMetadata;
    }
    return undefined;
  }, [selectedProduct, buyRobuxPageData.sections]);

  const shouldShowPersonalizedBonusItems = Boolean(
    ltbItemMetadata ?? (isBonusItem && bonusItemId) ?? collectibleBonusItemMetadata,
  );

  const subscribeAndSaveOffer = selectedProduct
    ? subscribedRobuxProductOffers.find(offer => offer.productId === selectedProduct.productId)
    : undefined;
  const continueToSubscriptionCheckout = Boolean(
    isSubscribeAndSaveChecked && subscribeAndSaveOffer,
  );
  const displayPriceAmount: Money = selectedProduct?.price.amount ?? { currencyCode: "USD" };

  const [isLoading, setIsLoading] = useState(false);
  const [isTaxTooltipOpen, setIsTaxTooltipOpen] = useState(false);
  const [quickPayError, setQuickPayError] = useState("");

  const handleProcessPayment = useCallback(
    async (providerPayload: PreparePaymentProviderPayload) => {
      setQuickPayError("");
      setIsLoading(true);

      const { error, isLoading: loading } = await processPaymentForQuickPay(providerPayload);
      if (error) {
        setQuickPayError(error);
      }
      setIsLoading(loading);
    },
    [processPaymentForQuickPay],
  );

  const handleClose = useCallback(() => {
    trackQuickPayClose();
    closeModal();
    setQuickPayError("");
  }, [trackQuickPayClose, closeModal]);

  const handleContinueToCheckout = useCallback(() => {
    if (!selectedProduct || window === undefined) {
      return;
    }

    const purchaseUrl = getPurchaseUrl(selectedProduct, false);
    const separator = purchaseUrl.includes("?") ? "&" : "?";
    trackCounter("QuickPaySubscribeAndSaveRedirect");
    window.location.href = `${purchaseUrl}${separator}subscribeAndSave=1`;
  }, [getPurchaseUrl, selectedProduct]);

  const handleUseDifferentPaymentMethodClick = useCallback(() => {
    trackQuickPayUseDifferentPaymentMethod();
    redirectToPurchase();
    closeModal();
  }, [trackQuickPayUseDifferentPaymentMethod, redirectToPurchase, closeModal]);

  const [amountTotal = 0, taxAmountExclusive = 0] = useMemo(() => {
    if (!preparePaymentProviderPayload) {
      return [];
    }

    return [
      convertProviderPayloadMoneyToDecimal(preparePaymentProviderPayload.amountTotal),
      convertProviderPayloadMoneyToDecimal(preparePaymentProviderPayload.taxAmountExclusive),
    ];
  }, [preparePaymentProviderPayload]);

  const eventListener3DS = useCallback(
    (event: MessageEvent<QuickPayIframeMessage>) => {
      const eventListener = async (ev: MessageEvent<QuickPayIframeMessage>) => {
        const err = await process3DSForQuickPay(ev);
        if (err) {
          setQuickPayError(err);
        }
      };

      void eventListener(event);
    },
    [process3DSForQuickPay],
  );

  const loadingAnimation = useMemo(
    () => (
      <div className="flex-container Placeholder Placeholder--animating">
        <span className="Text Text-color--gray400 Text-fontSize--14 Text--tabularNumbers" />
        {/* TODO: replace with price tag */}
        {/* eslint-disable-next-line react/jsx-no-literals */}
        <span>$0.00</span>
      </div>
    ),
    [],
  );

  useEffect(() => {
    window?.addEventListener("message", eventListener3DS);

    return () => {
      window?.removeEventListener("message", eventListener3DS);
    };
  }, [eventListener3DS]);

  if (!stripe || !selectedProduct || !selectedPaymentProfile) {
    return null;
  }

  return (
    <Dialog
      open={isQuickPayModalOpen}
      onOpenChange={open => {
        if (!open) {
          handleClose();
        }
      }}
      size="Large"
      hasCloseAffordance
      closeLabel={translate("Button.OneClickPay.Cancel")}
      isModal
    >
      <DialogContent>
        <DialogBody>
          <DialogTitle className="text-heading-medium content-emphasis">
            <div>{translate("Message.OneClickPay.Title")}</div>
          </DialogTitle>
          <Divider className="margin-y-small" />
          <div className="product">
            <div className="icon-wrapper">
              <Icon
                name="icon-filled-robux"
                size="XXLarge"
                style={{ height: 60, width: 60, color: "var(--color-content-emphasis)" }}
              />
              <div className="product-detail">
                <div className="product-name">
                  {translate("Label.RobuxQuantity", {
                    quantity: formatNumber(Number(selectedProduct.robuxAmount)),
                  })}
                </div>
                <PriceTag
                  tagClassName="product-price"
                  amount={Number(formatAmount(displayPriceAmount))}
                  currencyCode={displayPriceAmount.currencyCode}
                />
              </div>
              {selectedProduct.bonusRobuxAmount &&
                selectedProduct.bonusRobuxTagIcon &&
                isIconVariant(selectedProduct.bonusRobuxTagIcon) && (
                  <div className="margin-top-[14px] margin-left-[6px] self-start">
                    <Badge
                      variant="Contrast"
                      icon={selectedProduct.bonusRobuxTagIcon}
                      label={translate(
                        resolveBonusRobuxTagLabelKey(selectedProduct.bonusRobuxTagTranslationKey),
                        { amount: formatNumber(Number(selectedProduct.bonusRobuxAmount)) },
                      )}
                      className="text-overflow"
                      size="XSmall"
                    />
                  </div>
                )}
            </div>
            {shouldShowPersonalizedBonusItems && (
              <Fragment>
                <Icon name="icon-filled-plus-large" size="XXLarge" />
                <div className="bonus-item-card-small">
                  {ltbItemMetadata ? (
                    <img
                      src={ltbItemMetadata.image2dUrl}
                      alt="bonus item"
                      className="height-[60px] width-auto max-width-full object-contain shrink-0"
                    />
                  ) : bonusItemImageUrl ? (
                    <div className="icon-upsell-item-small-preview thumbnail-2d-container">
                      <img
                        src={bonusItemImageUrl}
                        alt="bonus item"
                        className="width-full height-full"
                      />
                    </div>
                  ) : collectibleBonusItemMetadata ? (
                    <img
                      src={collectibleBonusItemMetadata.image2dUrl}
                      alt="bonus item"
                      className="width-[60px] height-[60px]"
                    />
                  ) : null}
                  <div className="description-container">
                    <div className="description-title">
                      {ltbItemMetadata
                        ? translate(ltbItemMetadata.translationKey) || "Bonus Item"
                        : (bonusItemDisplayName ??
                          translate(collectibleBonusItemMetadata?.translationKey ?? ""))}
                    </div>
                    <div className="description-subtitle">
                      {ltbItemMetadata?.creatorDisplayName ? (
                        <div className="flex flex-row gap-xsmall self-stretch items-center justify-start margin-top-[8px]">
                          <div className="text-label-small medium:text-label-medium content-default">
                            {ltbItemMetadata.creatorDisplayName}
                          </div>
                          {ltbItemMetadata.creatorIsVerified && <BlueCheckIcon size={12} />}
                        </div>
                      ) : bonusItemImageUrl ? (
                        translate("Message.OneClickPay.BonusVirtualItem")
                      ) : collectibleBonusItemMetadata ? (
                        <div className="flex flex-row gap-xsmall self-stretch items-center justify-start margin-top-[8px]">
                          <div className="text-label-small medium:text-label-medium content-default">
                            {translate("Label.ByRoblox")}
                          </div>
                          <BlueCheckIcon size={12} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Fragment>
            )}
          </div>
          {subscribeAndSaveOffer && (
            <SubscribeAndSaveQuickPayOffer
              isChecked={isSubscribeAndSaveChecked}
              onToggle={toggleSubscribeAndSave}
              offer={subscribeAndSaveOffer}
            />
          )}

          <div className="price-info space-between-container">
            <div className="subtotal">{translate("Message.OneClickPay.Subtotal")}</div>
            <PriceTag
              tagClassName="subtotal-price"
              amount={Number(formatAmount(displayPriceAmount))}
              currencyCode={displayPriceAmount.currencyCode}
            />
          </div>
          <div className="tax-info space-between-container">
            <div className="tax">
              {preparePaymentProviderPayload ? (
                <Fragment>
                  <span className="tax-text">{translate(taxTranslationKey)}</span>
                  <EducationalTooltip open={isTaxTooltipOpen} onOpenChange={setIsTaxTooltipOpen}>
                    <EducationalTooltipTrigger asChild>
                      <IconButton
                        icon="icon-regular-circle-question"
                        size="XSmall"
                        variant="Utility"
                        ariaLabel={translate("Message.OneClickPay.TaxTooltip")}
                      />
                    </EducationalTooltipTrigger>
                    <EducationalTooltipContent
                      position="right-center"
                      hasCloseAffordance
                      closeLabel={translate("Action.Close")}
                    >
                      <EducationalTooltipBody>
                        <EducationalTooltipDescription>
                          {translate("Message.OneClickPay.TaxTooltip")}
                        </EducationalTooltipDescription>
                      </EducationalTooltipBody>
                    </EducationalTooltipContent>
                  </EducationalTooltip>
                </Fragment>
              ) : (
                loadingAnimation
              )}
            </div>
            {preparePaymentProviderPayload ? (
              <PriceTag
                tagClassName="tax-price"
                amount={taxAmountExclusive}
                currencyCode={displayPriceAmount.currencyCode}
              />
            ) : (
              loadingAnimation
            )}
          </div>
          <Divider style={{ margin: "8px 0" }} />
          <div className="space-between-container">
            <div className="total-due">{translate("Message.OneClickPay.TotalDue")}</div>
            {preparePaymentProviderPayload ? (
              <PriceTag
                tagClassName="total-due-price"
                amount={amountTotal}
                currencyCode={displayPriceAmount.currencyCode}
              />
            ) : (
              loadingAnimation
            )}
          </div>
          <div className="payment-method-info flex flex-col gap-small">
            <span>{translate("Message.OneClickPay.AmountChargedTo")}</span>
            <QuickPaySelectCardDropdown
              error={quickPayError}
              onSelectPaymentProfile={selectPaymentProfile}
              paymentProfiles={paymentProfiles}
              selectedPaymentProfile={selectedPaymentProfile}
            />
          </div>
          <div className="use-a-different-payment-method">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
            <div role="button" tabIndex={0} onClick={handleUseDifferentPaymentMethodClick}>
              {translate("Message.OneClickPay.RedirectToOldFlow")}
            </div>
          </div>
          <Divider style={{ margin: "8px 0" }} />
          <div className="margin-top-small">
            <QuickPayLegalDisclosure translationKey={legalDisclosureTranslationKey} />
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="loading">
            {isLoading && (
              <ProgressCircle variant="Indeterminate" ariaLabel={translate("Label.Loading")} />
            )}
          </div>
          {!isLoading && (
            <div className="flex flex-row gap-small justify-center">
              <Button
                isDisabled={!continueToSubscriptionCheckout && !preparePaymentProviderPayload}
                variant="Emphasis"
                className="min-width-[90px]"
                size="Medium"
                onClick={() => {
                  if (continueToSubscriptionCheckout) {
                    handleContinueToCheckout();
                    return;
                  }
                  if (preparePaymentProviderPayload) {
                    void handleProcessPayment(preparePaymentProviderPayload);
                  }
                }}
              >
                {translate(
                  continueToSubscriptionCheckout ? "Action.Continue" : "Button.OneClickPay.PayNow",
                )}
              </Button>
              <Button
                variant="Standard"
                onClick={handleClose}
                className="min-width-[90px]"
                size="Medium"
              >
                {translate("Button.OneClickPay.Cancel")}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const QuickPayModalWithLoading = (props: QuickPay) => {
  const { translate } = useTranslation();

  return (
    <div>
      {props.isQuickPayLoading && <FullScreenLoading ariaLabel={translate("Label.Loading")} />}
      <QuickPayModal {...props} />
    </div>
  );
};
