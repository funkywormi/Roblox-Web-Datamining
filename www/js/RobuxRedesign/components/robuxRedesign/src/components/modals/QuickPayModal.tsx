/* eslint-disable no-void */
import { useState, useContext, useCallback, useMemo, Fragment, useEffect } from "react";
import { PaymentIntentResult } from "@stripe/stripe-js";
import { Modal, Button, Loading, Popover } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Badge } from "@rbx/foundation-ui";
import { FullScreenLoading } from "@rbx/payments/components";
import { isIconVariant } from "../../utils/iconVariants";
import { resolveBonusRobuxTagLabelKey } from "../../utils/bonusRobuxTag";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { ModalContext } from "../../contexts/ModalContext";
import { convertProviderPayloadMoneyToDecimal, formatAmount } from "../../utils/formatMoney";
import { QuickPaySelectCardDropdown } from "./QuickPaySelectCardDropdown";
import { QuickPayLegalDisclosure } from "../QuickPayLegalDisclosure";
import { QuickPay, QuickPayIframeMessage } from "../../hooks/quickPay/useQuickPay";
import { TrackingContext } from "../../contexts/TrackingContext";
import { PreparePaymentProviderPayload } from "../../services/paymentsGatewayService";
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
}: QuickPay) {
  const {
    bonusItemDisplayName,
    bonusItemId,
    bonusItemImageUrl,
    collectibleBonusItemMetadata,
    buyRobuxPageData,
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

  const [isLoading, setIsLoading] = useState(false);
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

  const handleUseDifferentPaymentMethodClick = useCallback(() => {
    trackQuickPayUseDifferentPaymentMethod();
    redirectToPurchase();
    closeModal();
  }, [trackQuickPayUseDifferentPaymentMethod, redirectToPurchase, closeModal]);

  const [amountTotal, taxAmountExclusive] = useMemo(() => {
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
    window.addEventListener("message", eventListener3DS);

    return () => {
      window.removeEventListener("message", eventListener3DS);
    };
  }, [eventListener3DS]);

  useEffect(() => {
    if (!isQuickPayModalOpen) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("price-tag:render", {
        detail: {
          targetSelector: ".quick-pay-price-tag",
        },
      }),
    );
  }, [isQuickPayModalOpen, taxAmountExclusive, amountTotal]);

  if (!stripe || !selectedProduct || !selectedPaymentProfile) {
    return null;
  }

  return (
    <Modal
      show={isQuickPayModalOpen}
      onHide={handleClose}
      size="lg"
      centered
      scrollable={false}
      dialogClassName="quick-pay-modal"
    >
      <Modal.Header
        title={translate("Message.OneClickPay.Title")}
        showCloseButton
        onClose={handleClose}
      />
      <Modal.Body>
        <div className="product">
          <div className="icon-wrapper">
            <div className="icon-robux-redesign" />
            <div className="product-detail">
              <div className="product-name">
                {translate("Label.RobuxQuantity", {
                  quantity: formatNumber(Number(selectedProduct.robuxAmount)),
                })}
              </div>
              <span
                className="product-price quick-pay-price-tag"
                data-amount={formatAmount(selectedProduct.price.amount)}
                data-currency-code={selectedProduct.price.amount.currencyCode}
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
              <span className="icon-plus" />
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

        <div className="price-info space-between-container">
          <div className="subtotal">{translate("Message.OneClickPay.Subtotal")}</div>
          <span
            className="subtotal-price quick-pay-price-tag"
            data-amount={formatAmount(selectedProduct.price.amount)}
            data-currency-code={selectedProduct.price.amount.currencyCode}
          />
        </div>
        <div className="tax-info space-between-container">
          <div className="tax">
            {preparePaymentProviderPayload ? (
              <Fragment>
                <span className="tax-text">{translate(taxTranslationKey)}</span>
                <Popover
                  id="tax-popover"
                  placement="right"
                  trigger="click"
                  button={<span className="icon-moreinfo-16x16" />}
                >
                  {translate("Message.OneClickPay.TaxTooltip")}
                </Popover>
              </Fragment>
            ) : (
              loadingAnimation
            )}
          </div>
          {preparePaymentProviderPayload ? (
            <span
              className="tax-price quick-pay-price-tag"
              data-amount={taxAmountExclusive}
              data-currency-code={selectedProduct.price.amount.currencyCode}
            />
          ) : (
            loadingAnimation
          )}
        </div>
        <div className="divider" />
        <div className="space-between-container">
          <div className="total-due">{translate("Message.OneClickPay.TotalDue")}</div>
          {preparePaymentProviderPayload ? (
            <span
              className="total-due-price quick-pay-price-tag"
              data-amount={amountTotal}
              data-currency-code={selectedProduct.price.amount.currencyCode}
            />
          ) : (
            loadingAnimation
          )}
        </div>
        <div className="payment-method-info">
          {translate("Message.OneClickPay.AmountChargedTo")}
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
        <div className="divider" />
        <div className="margin-top-small">
          <QuickPayLegalDisclosure translationKey={legalDisclosureTranslationKey} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="loading">{isLoading && <Loading />}</div>
        {!isLoading && (
          <div className="modal-buttons">
            <Button
              isDisabled={!preparePaymentProviderPayload}
              className="modal-button"
              variant={Button.variants.growth}
              width={Button.widths.min}
              size={Button.sizes.medium}
              onClick={() => {
                if (preparePaymentProviderPayload) {
                  void handleProcessPayment(preparePaymentProviderPayload);
                }
              }}
            >
              {translate("Button.OneClickPay.PayNow")}
            </Button>
            <Button
              className="modal-button"
              variant={Button.variants.control}
              width={Button.widths.min}
              size={Button.sizes.medium}
              onClick={handleClose}
            >
              {translate("Button.OneClickPay.Cancel")}
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
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
