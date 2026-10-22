import { ReactNode, useCallback, useContext } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { ErrorBoundary } from "@sentry/react";
import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";
import { FirstTimePurchaseConsentModal } from "@rbx/payments/firstTimePurchaseConsent";
import { getTriggerContext } from "../utils/getTriggerContext";
import { ModalContext } from "../contexts/ModalContext";
import { BuyRobuxPageContext } from "../contexts/BuyRobuxPageContext";
import { Modals } from "../hooks/useModals";
import { PurchaseWarningModal } from "../components/modals/PurchaseWarningModal";
import { PurchaseDisabledModal } from "../components/modals/PurchaseDisabledModal";
import { RobuxGiftingModal } from "../components/modals/RobuxGiftingModal";
import { QuickPayModalWithLoading } from "../components/modals/QuickPayModal";
import { QuickPay } from "../hooks/quickPay/useQuickPay";
import { QuickPay3DSModal } from "../components/modals/QuickPay3DSModal";
import { SamsungPaymentMethodsModal } from "../components/modals/SamsungPaymentMethodsModal";
import { trackCounter, trackCriticalError } from "../observability";
import { publishMetric } from "../utils/publishMetric";
import { SamsungPaymentMethods } from "../hooks/samsungPaymentMethods/useSamsungPaymentMethods";
import { LoginRedirectErrorModal } from "../components/LoginRedirectErrorModal";

export const ModalContainer = ({
  children,
  modals,
  quickPay,
  samsungPaymentMethods,
}: {
  children: ReactNode;
  modals: Modals;
  quickPay: QuickPay;
  samsungPaymentMethods: SamsungPaymentMethods;
}) => {
  const { translate } = useTranslation();
  const { markConsentAcknowledged } = useContext(BuyRobuxPageContext);

  const onError = useCallback((error: unknown) => {
    trackCriticalError("StripeReactCrash", null, error);
  }, []);

  const handleConsentConfirm = useCallback(() => {
    trackCounter("FirstTimePurchaseConsentConfirmed");
    markConsentAcknowledged();
    modals.firstTimePurchaseConsent.closeModal();
    modals.firstTimePurchaseConsent.continuePurchase?.();
  }, [markConsentAcknowledged, modals.firstTimePurchaseConsent]);

  const handleConsentCancel = useCallback(() => {
    trackCounter("FirstTimePurchaseConsentDismiss");
    modals.firstTimePurchaseConsent.closeModal();
  }, [modals.firstTimePurchaseConsent]);

  return (
    <ModalContext.Provider value={modals}>
      {children}
      <SamsungPaymentMethodsModal {...samsungPaymentMethods} />
      <PurchaseWarningModal />
      <PurchaseDisabledModal />
      <RobuxGiftingModal />
      {quickPay.stripe && (
        <ErrorBoundary onError={onError}>
          <Elements stripe={quickPay.stripe}>
            <QuickPayModalWithLoading {...quickPay} />
            <QuickPay3DSModal />
          </Elements>
        </ErrorBoundary>
      )}
      <LoginRedirectErrorModal />
      <FirstTimePurchaseConsentModal
        title={translate("Label.AskParentFirst")}
        description={translateHtml(translate, "Description.ParentalApprovalRequired", [
          {
            opening: "learnLinkStart",
            closing: "learnLinkEnd",
            render: linkContent => (
              <a
                target="_blank"
                href="https://en.help.roblox.com/hc/en-us/articles/4409558125460-Monthly-Spending-Limits-and-Notifications-FAQ"
                className="color-content-default [text-decoration:underline] [text-underline-position:from-font]"
                rel="noreferrer"
              >
                {linkContent}
              </a>
            ),
          },
        ])}
        confirmation={translateHtml(translate, "Description.ParentalApprovalConfirmation", [
          {
            opening: "termsLinkStart",
            closing: "termsLinkEnd",
            render: linkContent => (
              <a
                target="_blank"
                href="https://en.help.roblox.com/hc/en-us/articles/115004647846-Roblox-Terms-of-Use"
                className="color-content-emphasis [text-decoration:underline] [text-underline-position:from-font]"
                rel="noreferrer"
              >
                {linkContent}
              </a>
            ),
          },
        ])}
        continueLabel={translate("Action.Continue")}
        cancelLabel={translate("Action.Cancel")}
        isOpen={modals.firstTimePurchaseConsent.isOpen}
        onConfirm={handleConsentConfirm}
        onCancel={handleConsentCancel}
        publishMetric={publishMetric}
        triggerContext={getTriggerContext()}
      />
    </ModalContext.Provider>
  );
};
