import type { AxiosResponse } from "axios";
import PropTypes from "prop-types";
import { ErrorBoundary } from "@sentry/react";
import React, { useEffect, useState } from "react";
import { createSystemFeedback } from "react-style-guide";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { CurrentUser } from "Roblox";
import { Alert, Button, IconButton, TextInput, Tooltip, TooltipTrigger } from "@rbx/foundation-ui";
import type { CreditConversionData, RedeemReponse, RedemptionResult } from "@rbx/payments/types";
import { useRedeemConsent } from "@rbx/payments/redeemConsent";
import {
  createCancelCreditConversionModal,
  createCreditConversionModal,
  redeemPaymentsGateway,
  ROBLOX_PLUS_PRODUCT_NAMESPACE,
  trackCounter,
  trackCriticalError,
  trackError,
} from "@rbx/payments/creditCheckout";
import { getRobloxPlusProductIdFromTargetKey } from "@rbx/payments/services/subscriptions";
import { redeemPromoCode } from "@rbx/payments/promoCodes";
import HeuristicConvertToCredit from "./HeuristicConvertToCredit";
import {
  eventTypes,
  gameCardMessageMapping,
  keyCodeMapping,
  legacyPromoCodes,
  promoCodeMarker,
  supportLinkURL,
} from "../constants/redeemGiftCardConstants";
import sendRedeemGiftCardEvent from "../utils/events";
import ConfirmationModal from "./confirmationModal";
import ScanGiftCardModal from "./ScanGiftCardModal";

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
const [CreditConversionModal, creditconversionModalService] = createCreditConversionModal();
const [CancelCreditConversionModal, cancelCreditconversionModalService] =
  createCancelCreditConversionModal();

type GiftCardFormError = {
  message: string;
  type: "input-error" | "server-error";
};

type RedeemGiftCardFormProps = {
  translate: TranslateFunction;
  pinPlaceholder: string;
  showTwentyPercentMoreRobux: boolean;
  onShowRedeemedItemBanner?: (data: {
    itemName: string;
    itemId: number;
    itemType?: string;
  }) => void;
};

const ScanToRedeemIcon = ({
  translate,
  onClick,
}: {
  translate: TranslateFunction;
  onClick: () => void;
}) => {
  return (
    <Tooltip position="top-center" title={translate("Action.ScanGiftCard.TryScanToRedeem")}>
      <TooltipTrigger asChild>
        <IconButton
          icon="icon-regular-photo-camera"
          ariaLabel={translate("Action.ScanGiftCard.TryScanToRedeem")}
          variant="Utility"
          size="Large"
          onClick={onClick}
        />
      </TooltipTrigger>
    </Tooltip>
  );
};

function RedeemGiftCardForm({
  translate,
  pinPlaceholder,
  showTwentyPercentMoreRobux,
  onShowRedeemedItemBanner,
}: RedeemGiftCardFormProps): React.ReactElement {
  const [pinValue, setPinValue] = useState("");
  const [error, setError] = useState<GiftCardFormError>();
  const [loading, setLoading] = useState(false);
  const [redeemDisabled, setRedeemDisabled] = useState(false);
  const [confirmationData, setConfirmationData] = useState<RedemptionResult>({});
  const [showModal, setShowModal] = useState(false);
  const [redeemedItem, setRedeemedItem] = useState(false);
  const [redeemedRobux, setRedeemedRobux] = useState(false);
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [robuxAmountValue, setRobuxAmountValue] = useState(0);
  const [redeemedCredit, setRedeemedCredit] = useState(0);
  const [shouldAutoOpenGetPlusModal, setShouldAutoOpenGetPlusModal] = useState(false);
  const [preferredGetPlusSubscriptionTargetKey, setPreferredGetPlusSubscriptionTargetKey] =
    useState<string>();
  const [cardValue, setCardValue] = useState(0);
  const [cardCurrency, setCardCurrency] = useState("");
  const [convertedValue, setConvertedValue] = useState(0);
  const [convertedCurrency, setConvertedCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isShowingScanGiftCardModal, setIsShowingScanGiftCardModal] = useState<boolean>(false);

  const [hiddenPin, setHiddenPin] = useState<string | undefined>(undefined);

  const [redeemConsentChecked, needFirstTimeConsent, setNeedFirstTimeConsent, RedeemConsent] =
    useRedeemConsent();

  const enterCodeInstruction: string = translate(
    "Action.RedeemGiftCardOrItemOrPromoCodeInstructions",
  );

  const currencyCodesDoNotMatch = translate("Response.RedeemGiftCardCurrencyCodeNotMatchV2", {
    robloxSupportLinkStart: `<a href='${supportLinkURL}' class='text-link'>`,
    robloxSupportLinkEnd: "</a>",
  });

  const showError = (err?: GiftCardFormError) => {
    setError(err);
    // @ts-expect-error - most likely `FormEvents` does not exist. Verify and then remove
    if (typeof FormEvents !== "undefined") {
      // @ts-expect-error - most likely `FormEvents` does not exist. Verify and then remove
      // eslint-disable-next-line
      FormEvents.SendValidationFailed("redeemPage", "redeemButton", "[Redacted]", err?.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(false);
    showError();
    const regex = /^[a-zA-Z0-9\s-]*$/;
    if (regex.test(e.target.value)) {
      setPinValue(e.target.value);
    }
  };

  const normalizePin = (pin: string) => pin.replace(/[-\s]/g, "");

  // Promo codes detection logic as specified in https://jira.rbx.com/browse/PAY-4965
  const isPromoCode = () => {
    if (!pinValue) {
      return false;
    }

    const normalizedPin = normalizePin(pinValue).toLowerCase();
    return (
      normalizedPin.startsWith(promoCodeMarker) ||
      normalizedPin.endsWith(promoCodeMarker) ||
      legacyPromoCodes.includes(normalizedPin)
    );
  };

  const handleSuccess = (data: RedeemReponse) => {
    setNeedFirstTimeConsent(false);
    const result = data.redemptionResult ? data.redemptionResult : data;
    const isRobloxPlusRedemption = result.productNamespace === ROBLOX_PLUS_PRODUCT_NAMESPACE;
    setRedeemedItem(false);
    setRedeemedRobux(false);
    setRedeemedCredit(0);
    sendRedeemGiftCardEvent(eventTypes.codeRedeemSuccess, {
      isPromoCode: isPromoCode(),
      itemRedeemed: result.itemName || null,
      creditRedeemed: result.redeemedCredit || 0,
      robuxRedeemed: result.grantedRobux || 0,
    });
    if (result.itemName) setRedeemedItem(true);

    if (result.redeemedCreditInLocalCurrency)
      setRedeemedCredit(result.redeemedCreditInLocalCurrency);
    if (result.balanceAmountInLocalCurrency) setCreditBalance(result.balanceAmountInLocalCurrency);

    if (result.currencyCode) setCurrencyCode(result.currencyCode);

    if (parseInt((result.grantedRobux || "0").toString(), 10) > 0) setRedeemedRobux(true);

    setConfirmationData(result);
    setLoading(false);
    setShouldAutoOpenGetPlusModal(isRobloxPlusRedemption);
    setPreferredGetPlusSubscriptionTargetKey(
      isRobloxPlusRedemption
        ? getRobloxPlusProductIdFromTargetKey(result.subscriptionTargetKey)
        : undefined,
    );
    if (!isRobloxPlusRedemption) {
      setShowModal(true);
      sendRedeemGiftCardEvent(eventTypes.successModalOpened);
    }
    setRedeemDisabled(false);
    trackCounter("GiftCard_Redeemed");
  };

  const handleGetPlusModalAutoOpenFailed = () => {
    setShouldAutoOpenGetPlusModal(false);
    setShowModal(true);
    sendRedeemGiftCardEvent(eventTypes.successModalOpened);
  };

  const handleGetPlusModalAutoOpened = () => {
    setShouldAutoOpenGetPlusModal(false);
    if (confirmationData.itemName && confirmationData.itemId && confirmationData.itemId > 0) {
      onShowRedeemedItemBanner?.({
        itemName: confirmationData.itemName,
        itemId: confirmationData.itemId,
        itemType: confirmationData.itemType,
      });
    }
    setPinValue("");
    setConfirmationData({});
    setRedeemedItem(false);
    setRedeemedRobux(false);
    setRedeemedCredit(0);
  };

  const handleFailure = (data: RedeemReponse) => {
    setLoading(false);
    let apiErrorCode = "unknown";
    let errorData: GiftCardFormError = {
      message: translate("Response.UnexpectedError"),
      type: "server-error",
    };

    // Parse billing api redeem promo code response
    if (data?.errorMsg) {
      if (data.errorMsg === "Captcha") {
        return;
      }
      errorData = {
        message: data.errorMsg,
        type: "server-error",
      };
    }

    // Parse billing api redeem game card response
    if (data?.data?.errors && data.data.errors.length > 0) {
      const errorCode = data.data.errors[0]?.code!;
      apiErrorCode = String(errorCode ?? "unknown");
      const mappedError = gameCardMessageMapping[errorCode];
      errorData = mappedError
        ? {
            message: translate(mappedError.translationKey),
            type: mappedError.type,
          }
        : {
            message: translate("Response.UnexpectedError"),
            type: "server-error",
          };
    }

    // Parse gateway redeem gift card api
    if (data?.errors && data.errors.length > 0) {
      const errorCode = data.errors?.[0]?.code!;
      apiErrorCode = String(errorCode ?? "unknown");
      if (errorCode !== 20 || data.errors[0]?.message !== null) {
        // did not reach the consent creation when errorCode = 20 and there is no valid message
        // technically, we could simply set this to false but this is a simple UX improvement for user
        setNeedFirstTimeConsent(false);
      }

      if (
        gameCardMessageMapping[errorCode]?.translationKey ===
        "Response.RedeemGiftCardCurrencyCodeNotMatchV2"
      ) {
        if (data.errors[0]?.fieldData) {
          const creditConversionData = JSON.parse(data.errors[0]?.fieldData) as
            | CreditConversionData
            | undefined;
          if (creditConversionData?.grantCredit) {
            setCardValue(creditConversionData.redeemedCreditInLocalCurrency);
            setCardCurrency(creditConversionData.currencyCode);
            setConvertedValue(creditConversionData.grantCredit);
            setConvertedCurrency(creditConversionData.grantCurrencyCode);
            setExchangeRate(creditConversionData.exchangeRate);
            creditconversionModalService.open();
            return;
          }
        }

        errorData = {
          message: currencyCodesDoNotMatch,
          type: "input-error",
        };
      } else {
        const mappedError = gameCardMessageMapping[errorCode];
        errorData = mappedError
          ? {
              message: translate(mappedError.translationKey),
              type: mappedError.type,
            }
          : {
              message: translate("Response.UnexpectedError"),
              type: "server-error",
            };
      }
    }

    sendRedeemGiftCardEvent(eventTypes.codeRedeemFailure, {
      isPromoCode: isPromoCode(),
      error: errorData.message,
    });
    trackError("Error_GiftCard_RedeemFailed", { errorCode: apiErrorCode });
    showError(errorData);
    setRedeemDisabled(false);
  };

  const handleCloseModal = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    setShowModal(false);
    sendRedeemGiftCardEvent(eventTypes.successModalClosed);
    // Reset values to prepare for potential next redemption
    setPinValue("");
    setConfirmationData({});
    setRedeemedItem(false);
    setRedeemedRobux(false);
    setRedeemedCredit(0);
  };

  const resetCreditConversionData = () => {
    setCardValue(0);
    setCardCurrency("");
    setConvertedValue(0);
    setConvertedCurrency("");
    setExchangeRate(0);
  };

  const handleCreditConversionCancel = () => {
    sendRedeemGiftCardEvent(eventTypes.creditConversionCancelClicked);
    setRedeemDisabled(false);
    resetCreditConversionData();
    creditconversionModalService.close();
    cancelCreditconversionModalService.open();
  };

  const redeemCode = (
    unifiedCaptchaId: string,
    captchaToken: string,
    captchaProvider: string,
    continueWithCreditConversion = false,
    pinOverride?: string,
  ) => {
    if (needFirstTimeConsent && !redeemConsentChecked) {
      return;
    }
    sendRedeemGiftCardEvent(eventTypes.codeRedeemStarted, {
      isPromoCode: isPromoCode(),
    });
    showError();
    setLoading(true);
    setRedeemDisabled(true);

    trackCounter("GiftCard_RedeemStarted");

    let response: Promise<AxiosResponse<RedeemReponse>>;
    if (isPromoCode()) {
      response = redeemPromoCode<RedeemReponse>(normalizePin(pinOverride ?? hiddenPin ?? pinValue));
    } else {
      const sanitizedPinValue = normalizePin(pinOverride ?? hiddenPin ?? pinValue).toUpperCase();
      response = redeemPaymentsGateway(
        sanitizedPinValue,
        unifiedCaptchaId,
        captchaToken,
        captchaProvider,
        redeemConsentChecked,
        continueWithCreditConversion,
      ) as Promise<AxiosResponse<RedeemReponse>>; // TODO: fix my typecasting;
    }

    response.then(
      res => {
        if (!res.data) {
          showError({
            message: translate("Response.UnexpectedError"),
            type: "server-error",
          });
          return;
        }
        if (
          (res.data.errorMsg && res.data.errorMsg.length > 0) ||
          (res.data.errors && res.data.errors.length > 0)
        ) {
          handleFailure(res.data);
        } else {
          handleSuccess(res.data);
        }
      },
      errors => {
        handleFailure(errors);
      },
    );
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    redeemCode("", "", "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (keyCodeMapping[e.keyCode as keyof typeof keyCodeMapping] === "Enter") {
      e.preventDefault();
      sendRedeemGiftCardEvent(eventTypes.redeemClicked);
      redeemCode("", "", "");
    }
  };

  const handleCreditConversionContinue = () => {
    creditconversionModalService.close();
    resetCreditConversionData();
    sendRedeemGiftCardEvent(eventTypes.continueClicked);
    redeemCode("", "", "", true);
  };

  // This runs twice, once during initial render, and once when pinPlaceholder updates.
  useEffect(() => {
    if (pinPlaceholder) {
      setPinValue(pinPlaceholder);
    }
  }, [pinPlaceholder]);

  return (
    <div className="flex flex-col gap-small">
      <div className="container-header">
        <h2 className="enter-code-instruction">{enterCodeInstruction}</h2>
      </div>
      <form autoComplete="off" onSubmit={onSubmit}>
        <div className="flex flex-col gap-large">
          <div className="relative">
            <div>
              <TextInput
                id="code-input"
                value={pinValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                type="text"
                spellCheck="false"
                autoComplete="off"
                label={translate("Label.Code") || "Code"}
                hasError={Boolean(error?.type === "input-error")}
                className="flex width-full"
                trailingIconNode={
                  <ScanToRedeemIcon
                    translate={translate}
                    onClick={() => {
                      setIsShowingScanGiftCardModal(true);
                    }}
                  />
                }
              />
            </div>
          </div>
          {error && (
            <Alert
              variant="Feedback"
              severity={error.type === "input-error" ? "Error" : "Warning"}
              primaryActionLinkTarget={undefined}
              secondaryActionLinkTarget={undefined}
              hasCloseAffordance={false}
            >
              <div className="text-body-medium">{error.message}</div>
            </Alert>
          )}
          <Button
            type="submit"
            variant="Emphasis"
            size="Large"
            className="redeem-btn"
            isDisabled={
              (needFirstTimeConsent && !redeemConsentChecked) ||
              normalizePin(pinValue).length < 4 ||
              redeemDisabled
            }
            isLoading={loading}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              if (!CurrentUser.isAuthenticated) {
                window.location.href = `/NewLogin?ReturnUrl=%2Fredeem?code=${pinValue}`;
                event.preventDefault();
                return;
              }
              sendRedeemGiftCardEvent(eventTypes.redeemClicked);
            }}
          >
            {translate("Action.Redeem")}
          </Button>
        </div>
        <RedeemConsent />
      </form>
      <HeuristicConvertToCredit
        creditBalance={creditBalance}
        setCreditBalance={setCreditBalance}
        currencyCode={currencyCode as unknown as string}
        setCurrencyCode={setCurrencyCode}
        convertedRobuxAmount={robuxAmountValue}
        setConvertedRobuxAmount={setRobuxAmountValue}
        systemFeedbackService={systemFeedbackService}
        translate={translate}
        autoOpenGetPlusModal={shouldAutoOpenGetPlusModal}
        onGetPlusModalAutoOpened={handleGetPlusModalAutoOpened}
        onGetPlusModalAutoOpenFailed={handleGetPlusModalAutoOpenFailed}
        preferredGetPlusSubscriptionTargetKey={preferredGetPlusSubscriptionTargetKey}
      />
      <div id="react-captcha-container" />
      <ErrorBoundary
        onError={(err: unknown) => {
          trackCriticalError("Error_ConfirmationModal_Crash", null, err);
        }}
      >
        <ConfirmationModal
          grantedRobux={confirmationData.grantedRobux}
          itemName={confirmationData.itemName}
          itemId={confirmationData.itemId}
          itemType={confirmationData.itemType}
          redeemedItem={redeemedItem}
          redeemedRobux={redeemedRobux}
          redeemedCredit={redeemedCredit}
          currencyCode={currencyCode}
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          showTwentyPercentMoreRobux={showTwentyPercentMoreRobux}
          translate={translate}
        />
      </ErrorBoundary>
      <CreditConversionModal
        cardValue={cardValue}
        cardCurrencyCode={cardCurrency}
        convertedValue={convertedValue}
        convertedCurrencyCode={convertedCurrency}
        exchangeRate={exchangeRate}
        loading={loading}
        onContinue={handleCreditConversionContinue}
        onCancel={handleCreditConversionCancel}
        translate={translate}
      />
      <CancelCreditConversionModal
        loading={loading}
        onNeutral={() => {
          cancelCreditconversionModalService.close();
        }}
        translate={translate}
      />
      <SystemFeedback />
      {isShowingScanGiftCardModal && (
        <ErrorBoundary
          onError={(err: unknown) => {
            trackCriticalError("Error_ScanGiftCardModal_Crash", null, err);
          }}
        >
          <ScanGiftCardModal
            translate={translate}
            onClose={() => {
              setIsShowingScanGiftCardModal(false);
            }}
            onValidateSuccess={code => {
              setIsShowingScanGiftCardModal(false);
              setPinValue(code);
              sendRedeemGiftCardEvent(eventTypes.redeemGiftCardScanSuccess);
              redeemCode("", "", "", false, code);
            }}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

RedeemGiftCardForm.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({ getRobloxLocale: PropTypes.func.isRequired }).isRequired,
  pinPlaceholder: PropTypes.string.isRequired,
  showTwentyPercentMoreRobux: PropTypes.bool.isRequired,
  onShowRedeemedItemBanner: PropTypes.func,
};

export default RedeemGiftCardForm;
