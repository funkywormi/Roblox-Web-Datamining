import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import { captureException } from "@rbx/payments/error";
import { isAxiosError } from "@rbx/payments/utils";
import Intl from "@rbx/core-scripts/intl";
import { getStripePublicAPIKeyForEnv } from "../../constants/stripe";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { TrackingContext } from "../../contexts/TrackingContext";
import {
  getPaymentProfiles,
  getQuickPayMetadata,
  PaymentProfile,
  preparePayment,
  PreparePaymentProviderPayload,
  processPayment,
  ProcessPaymentPaypalProviderPayload,
  ProcessPaymentProviderPayload,
  ProcessPaymentStripeProviderPayload,
  QuickPayFlowType,
  StripeErrorCode,
  StripeTaxType,
} from "../../services/paymentsGatewayService";
import { Product } from "../../types/buyRobuxPageData";
import { trackCounter, trackError } from "../../observability";
import { isInApp, isInUniversalApp } from "../../utils/platform";
import { isCardProviderPayload, isPayPalProviderPayload } from "../../utils/paymentProfile";
import { Modals } from "../useModals";
import { QuickPayError } from "./QuickPayError";

const isGenericChallengeAbandonedError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "parameters" in error &&
    typeof error.parameters === "object" &&
    error.parameters !== null &&
    "kind" in error.parameters &&
    error.parameters.kind === "abandoned"
  );
};

const getAxiosResponseFailureReason = (error: unknown): string | undefined => {
  if (!isAxiosError(error)) {
    return undefined;
  }

  const data: unknown = error.response?.data;
  if (typeof data !== "object" || data === null || !("failureReason" in data)) {
    return undefined;
  }

  const { failureReason } = data;
  return typeof failureReason === "string" ? failureReason : undefined;
};

export type QuickPayIframeMessage = {
  type: string;
  url: string;
};

export enum QuickPayTax {
  Default = "Message.QuickPay.Tax",
  GST = "Message.QuickPay.GST",
  HST = "Message.QuickPay.HST",
  IVA = "Message.QuickPay.IVA",
  JCT = "Message.QuickPay.JCT",
  Sales = "Message.QuickPay.SalesTax",
  Service = "Message.QuickPay.ServiceTax",
  TVA = "Messsage.QuickPay.TVA", // key was configured with an extra 's' in translations hub
  VAT = "Message.QuickPay.VAT",
}

export type QuickPay = {
  checkoutSessionId: number | null | undefined;
  isBonusItem: boolean;
  isQuickPay: boolean;
  legalDisclosureTranslationKey: string;
  markRedirectHandled: () => void;
  paymentProfiles: PaymentProfile[];
  preparePaymentForQuickPay: (
    product: Product,
    isBonus: boolean,
    isSub: boolean,
    updatedPaymentProfile?: PaymentProfile,
  ) => Promise<void>;
  preparePaymentProviderPayload: PreparePaymentProviderPayload | null | undefined;
  process3DSForQuickPay: (ev: MessageEvent<QuickPayIframeMessage>) => Promise<string | undefined>;
  processPaymentForQuickPay: (
    providerPayload: PreparePaymentProviderPayload,
  ) => Promise<{ error?: string; isLoading: boolean }>;
  redirectToPurchase: () => void;
  selectedPaymentProfile: PaymentProfile | undefined;
  selectedProduct: Product | undefined;
  selectPaymentProfile: (paymentProfile: PaymentProfile) => void;
  shouldRedirectToPurchase: boolean;
  stripe: Stripe | null;
  taxTranslationKey: string;
  isQuickPayLoading: boolean;
};

const isValidHttpUrl = (urlString: string): boolean => {
  try {
    const urlObject = new URL(urlString);
    return urlObject.protocol === "http:" || urlObject.protocol === "https:";
  } catch (e) {
    captureException(e);
    return false;
  }
};

export function useQuickPay({
  quickPay: { openModal: openQuickPayModal },
  quickPay3DS: {
    closeModal: closeQuickPay3DSModal,
    openModal: openQuickPay3DSModal,
    url: quickPay3DSUrl,
  },
}: Modals): QuickPay {
  const { getPurchaseUrl, paymentSession, purchaseFlowId, urlSearchParams } =
    useContext(BuyRobuxPageContext);
  const { trackQuickPayClick, trackQuickPayPurchase } = useContext(TrackingContext);

  const [checkoutSessionId, setCheckoutSessionId] = useState<number | null | undefined>();
  const [isBonusItem, setIsBonusItem] = useState<boolean>(false);
  const [isQuickPay, setIsQuickPay] = useState<boolean>(false);
  const [isSubscriptionProduct, setIsSubscriptionProduct] = useState<boolean>(false);
  const [legalDisclosureTranslationKey, setLegalDisclosureTranslationKey] = useState<string>("");
  const [paymentProfiles, setPaymentProfiles] = useState<PaymentProfile[]>([]);
  const [preparePaymentProviderPayload, setPreparePaymentProviderPayload] = useState<
    PreparePaymentProviderPayload | null | undefined
  >();
  const [shouldRedirectToPurchase, setShouldRedirectToPurchase] = useState<boolean>(false);
  const [selectedPaymentProfile, setSelectedPaymentProfile] = useState<
    PaymentProfile | undefined
  >();
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isQuickPayLoading, setIsQuickPayLoading] = useState<boolean>(false);

  const prepareRequestIdRef = useRef(0);

  useEffect(() => {
    if (isPayPalProviderPayload(selectedPaymentProfile?.providerPayload)) {
      trackCounter("QuickPayPaypalSelected");
    }
  }, [selectedPaymentProfile]);

  const firePaymentMethodSelectedCounter = useCallback((profile: PaymentProfile | undefined) => {
    if (!profile) {
      return;
    }

    let method = "unknown";
    if (isCardProviderPayload(profile.providerPayload)) {
      method = "card";
    } else if (isPayPalProviderPayload(profile.providerPayload)) {
      method = "paypal";
    }

    trackCounter("QuickPayPaymentMethodSelected", { method });
  }, []);

  const fetchQuickPayMetadata = useCallback(async () => {
    let quickPayFlowType: QuickPayFlowType = QuickPayFlowType.BuyRobuxPage;
    if (urlSearchParams.get("product_id") && isInUniversalApp) {
      quickPayFlowType = QuickPayFlowType.BuyRobuxPagePreselectedProduct;
    }

    const data = await getQuickPayMetadata(quickPayFlowType);
    if (!data) {
      return;
    }

    setLegalDisclosureTranslationKey(data.legalDisclosureTranslationKey);

    if (!data.isUserEligible) {
      return;
    }

    const profiles = await getPaymentProfiles();
    if (!profiles?.length) {
      trackError("QuickPayPaymentProfilesNoneReceived");
      return;
    }

    // TODO: Remove backwards compatibility check after isQuickPayEnabled is fully rolled out.
    // Once fully rolled out, filter strictly on isQuickPayEnabled === true.
    const eligibleProfiles = profiles.filter(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
      profile => profile.isQuickPayEnabled === undefined || profile.isQuickPayEnabled === true,
    );

    if (!eligibleProfiles.length) {
      trackError("QuickPayPaymentProfilesNoneEligibleReceived");
      return;
    }

    eligibleProfiles.sort((a, b) => b.lastChargeTime - a.lastChargeTime);

    setIsQuickPay(true);
    setPaymentProfiles(eligibleProfiles);
    setSelectedPaymentProfile(eligibleProfiles[0]);

    firePaymentMethodSelectedCounter(eligibleProfiles[0]);
  }, [urlSearchParams, firePaymentMethodSelectedCounter]);

  const fetchStripe = useCallback(async () => {
    try {
      const stripePublicKey = getStripePublicAPIKeyForEnv();
      const response = await loadStripe(stripePublicKey);
      setStripe(response);
    } catch (e) {
      trackError("QuickPayStripeException", null, e);
    }
  }, []);

  // TODO: Backend should unify redirect URL field name across providers
  const getRedirectUrl = (payload: ProcessPaymentProviderPayload): string | undefined =>
    (payload as ProcessPaymentStripeProviderPayload).redirectToUrl ??
    (payload as ProcessPaymentPaypalProviderPayload).RedirectionUrl;

  const preparePaymentForQuickPay = useCallback(
    async (
      product: Product,
      isBonus: boolean,
      isSub: boolean,
      updatedPaymentProfile?: PaymentProfile,
    ) => {
      setPreparePaymentProviderPayload(undefined);
      setCheckoutSessionId(undefined);
      setIsBonusItem(isBonus);
      setIsSubscriptionProduct(isSub);
      setSelectedProduct(product);
      setIsQuickPayLoading(true);

      const paymentProfile = updatedPaymentProfile ?? selectedPaymentProfile;
      if (!paymentProfile) {
        trackError("QuickPayPreparePaymentNoPaymentProfile");
        setIsQuickPayLoading(false);
        return;
      }

      // Auth-only; defensive guard for optional context types.
      if (!purchaseFlowId || !paymentSession) {
        return;
      }

      prepareRequestIdRef.current += 1;
      const requestId = prepareRequestIdRef.current;

      // Determine payment method based on payment profile type
      const isPayPalPayment = isPayPalProviderPayload(paymentProfile.providerPayload);
      const paymentMethod = isPayPalPayment ? "BraintreePaypal" : "StripeCard";

      trackCounter("QuickPayPreparePaymentStarted");

      const data = await preparePayment(
        purchaseFlowId,
        paymentMethod,
        paymentSession.id,
        product.productId,
        paymentProfile.id,
      )
        /** Note about 2SV Friction
         * This API can return 2SV friction. That is in the form of a 403 error with rbx-challenge-id and rbx-challenge-type headers.
         * The axios interceptor automatically catches that and invokes the 2SV flow while this promise remains unresolved.
         * If the user successfully completes 2SV, then the interception automatically calls the API again and on success resolve this promise.
         * If the user cancels out, then it will reject the promise
         * */
        .then(response => {
          trackCounter("QuickPayPreparePaymentSuccess");
          setIsQuickPayLoading(false);
          openQuickPayModal(product);
          return response;
        })
        .catch((err: unknown) => {
          setIsQuickPayLoading(false);
          setPreparePaymentProviderPayload(null);
          setCheckoutSessionId(null);

          if (isGenericChallengeAbandonedError(err)) {
            trackCounter("QuickPayChallengeAbandoned");
          } else if (getAxiosResponseFailureReason(err) === "RemovedPaymentProfile") {
            trackCounter("QuickPayProfileRemovedByFraud");
          } else {
            trackError("QuickPayPreparePaymentError", null, err);
          }

          // For any kinds of error, we send the user to the non-quick-pay flow
          const purchaseUrl = getPurchaseUrl(product, isSub);
          window.location.href = purchaseUrl;
        });

      if (prepareRequestIdRef.current !== requestId) {
        return;
      }

      if (!data) {
        trackError("QuickPayPreparePaymentNoData");
        return;
      }

      if (data.providerPayload?.redirectionPath) {
        setPreparePaymentProviderPayload(null);
        setCheckoutSessionId(null);

        // Redirect to old flow (Select Payment Methods page)
        const purchaseUrl = getPurchaseUrl(product, isSub);
        if (paymentProfiles.length === 1 && purchaseUrl) {
          trackCounter("QuickPayRedirect");
          window.location.href = purchaseUrl;
        }
        return;
      }

      setPreparePaymentProviderPayload(data.providerPayload);
      setCheckoutSessionId(data.checkoutSessionId);
    },
    [
      openQuickPayModal,
      selectedPaymentProfile,
      purchaseFlowId,
      paymentSession,
      getPurchaseUrl,
      paymentProfiles.length,
    ],
  );

  const processPaymentForQuickPay = useCallback(
    async (
      providerPayload: PreparePaymentProviderPayload,
    ): Promise<{ error?: string; isLoading: boolean }> => {
      trackQuickPayClick();

      // Determine payment provider type based on selected payment profile
      const isPayPalPayment = isPayPalProviderPayload(selectedPaymentProfile?.providerPayload);
      const paymentProviderType = isPayPalPayment ? "BraintreePayPal" : "StripeCard";

      if (!paymentSession) {
        return { isLoading: false };
      }

      const data = await processPayment({
        checkoutSessionId: checkoutSessionId ?? undefined,
        paymentProviderType,
        paymentSessionId: paymentSession.id,
        providerPayload,
        quickPaySelectedPaymentProfileId: selectedPaymentProfile?.id,
      });

      if (!data) {
        trackError("QuickPayProcessPaymentFailure");
        // generate a new checkout session id and provider payload if purchase fails
        // selectedProduct should always be defined here
        if (selectedProduct) {
          await preparePaymentForQuickPay(selectedProduct, isBonusItem, isSubscriptionProduct);
        }

        return {
          error: QuickPayError.GenericError,
          isLoading: false,
        };
      }

      const { providerPayload: responsePayload } = data;
      const { StripeErrorCode: stripeErrorCode } = responsePayload;

      if (stripeErrorCode) {
        trackError("QuickPayStripeProcessPaymentError", { stripeErrorCode });
        let quickPayError: QuickPayError;
        switch (stripeErrorCode) {
          case StripeErrorCode.CARD_DECLINED: {
            quickPayError = QuickPayError.CardDeclined;
            break;
          }
          case StripeErrorCode.EXPIRED_CARD: {
            quickPayError = QuickPayError.CardExpired;
            break;
          }
          case StripeErrorCode.INSUFFICIENT_FUNDS:
          case StripeErrorCode.BALANCE_INSUFFICIENT: {
            quickPayError = QuickPayError.InsufficientFunds;
            break;
          }
          case StripeErrorCode.INCORRECT_CVC:
          default: {
            quickPayError = QuickPayError.GenericError;
            break;
          }
        }

        return {
          error: quickPayError,
          isLoading: true,
        };
      }

      const redirectUrl = getRedirectUrl(responsePayload);
      if (redirectUrl) {
        if (isPayPalPayment) {
          trackCounter("QuickPayPaypalRedirect");
          // PayPal redirects directly to PayPal flow
          window.location.href = redirectUrl;
          return {
            isLoading: true,
          };
        } else {
          trackCounter("QuickPay3DSModalShown");
          openQuickPay3DSModal(redirectUrl);
          return {
            isLoading: false,
          };
        }
      }

      trackCounter("QuickPayPurchaseSuccessRedirect");
      trackQuickPayPurchase(selectedProduct);
      window.location.href = `/upgrades/checkout/success?checkoutSessionId=${checkoutSessionId}`;

      return {
        isLoading: true,
      };
    },
    [
      trackQuickPayClick,
      preparePaymentForQuickPay,
      selectedProduct,
      isBonusItem,
      isSubscriptionProduct,
      trackQuickPayPurchase,
      checkoutSessionId,
      openQuickPay3DSModal,
      selectedPaymentProfile,
      paymentSession,
    ],
  );

  const taxTranslationKey = useMemo(() => {
    if (!preparePaymentProviderPayload) {
      return QuickPayTax.Default;
    }

    const { taxType, taxAmountExclusive, billingCountryCode, taxPercentageDecimal } =
      preparePaymentProviderPayload;

    if (taxAmountExclusive.Units === 0 && taxAmountExclusive.Nanos === 0) {
      return QuickPayTax.Default;
    }

    if (!taxType) {
      return QuickPayTax.Default;
    }

    let percentString = "";
    try {
      const intl = new Intl();
      const percent = parseFloat(taxPercentageDecimal);
      if (percent > 0) {
        percentString = intl.n(percent);
      }
    } catch (e) {
      trackError("QuickPayPercentStringException", null, e);
    }

    let taxString: string;
    switch (taxType) {
      case StripeTaxType.GST: {
        taxString = QuickPayTax.GST;
        break;
      }
      case StripeTaxType.VAT: {
        if (
          ["AE", "CO", "ID", "IS", "TR", "UA", "VN", "ZA"].includes(
            billingCountryCode.toUpperCase(),
          )
        ) {
          taxString = QuickPayTax.Default;
          break;
        }

        if (["SP", "IT"].includes(billingCountryCode.toUpperCase())) {
          taxString = QuickPayTax.IVA;
          break;
        }

        if (["FR"].includes(billingCountryCode.toUpperCase())) {
          taxString = QuickPayTax.TVA;
          break;
        }

        taxString = QuickPayTax.VAT;
        break;
      }
      case StripeTaxType.JCT: {
        taxString = QuickPayTax.JCT;
        break;
      }
      case StripeTaxType.HST: {
        taxString = QuickPayTax.HST;
        break;
      }
      case StripeTaxType.SALES_TAX: {
        taxString = QuickPayTax.Sales;
        break;
      }
      case StripeTaxType.SERVICE_TAX: {
        taxString = QuickPayTax.Service;
        break;
      }
      case StripeTaxType.SUMMED:
      case StripeTaxType.UNKNOWN:
      case StripeTaxType.INVALID:
      case StripeTaxType.AMUSEMENT_TAX:
      case StripeTaxType.COMMUNICATIONS_TAX:
      case StripeTaxType.IGST:
      case StripeTaxType.LEASE_TAX:
      case StripeTaxType.PST:
      case StripeTaxType.QST:
      case StripeTaxType.RST:
      default: {
        taxString = QuickPayTax.Default;
        break;
      }
    }

    return taxString + (percentString.length > 0 ? ` (${percentString}%)` : "");
  }, [preparePaymentProviderPayload]);

  const process3DSForQuickPay = useCallback(
    async (ev: MessageEvent<QuickPayIframeMessage>): Promise<string | undefined> => {
      // This handler will receive many events. So we early return if the event is not the one we want.
      if (ev.data.type !== "3DS-authentication-complete" || !ev.data.url || !stripe) {
        return;
      }

      trackCounter("QuickPay3DSMessageReceived");

      try {
        if (!quickPay3DSUrl || !isValidHttpUrl(quickPay3DSUrl)) {
          trackError("QuickPay3DSUrlNotSet");
          return QuickPayError.GenericError;
        }

        const clientSecret = new URL(quickPay3DSUrl).searchParams.get(
          "payment_intent_client_secret",
        );
        if (!clientSecret) {
          trackError("QuickPay3DSClientSecretNotSet");
          return QuickPayError.GenericError;
        }

        const { error, paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        if (error) {
          trackError("QuickPay3DSStripeError", null, error);
          return QuickPayError.GenericError;
        }

        if (paymentIntent.status !== "succeeded") {
          trackError("QuickPay3DSUnsuccessful");
          return QuickPayError.GenericError;
        }

        window.location.href = `/upgrades/checkout/success?checkoutSessionId=${checkoutSessionId}`;
        return undefined;
      } catch (e) {
        trackError("QuickPay3DSException", null, e);

        return QuickPayError.GenericError;
      } finally {
        closeQuickPay3DSModal();
      }
    },
    [stripe, quickPay3DSUrl, closeQuickPay3DSModal, checkoutSessionId],
  );

  const selectPaymentProfile = useCallback(
    (profile: PaymentProfile) => {
      setSelectedPaymentProfile(profile);
      firePaymentMethodSelectedCounter(profile);
      // regenerate provider payload with the new payment profile
      if (selectedProduct) {
        preparePaymentForQuickPay(
          selectedProduct,
          isBonusItem,
          isSubscriptionProduct,
          profile,
        ).catch(captureException);
      }
    },
    [
      firePaymentMethodSelectedCounter,
      selectedProduct,
      preparePaymentForQuickPay,
      isBonusItem,
      isSubscriptionProduct,
    ],
  );

  const redirectToPurchase = useCallback(() => {
    setShouldRedirectToPurchase(true);
  }, []);

  const markRedirectHandled = useCallback(() => {
    setShouldRedirectToPurchase(false);
  }, []);

  useEffect(() => {
    if (isInApp) {
      return;
    }

    fetchQuickPayMetadata().catch(captureException);
  }, [fetchQuickPayMetadata]);

  useEffect(() => {
    if (isInApp || !isQuickPay) {
      return;
    }

    fetchStripe().catch(captureException);
  }, [isQuickPay, fetchStripe]);

  return useMemo(
    () => ({
      checkoutSessionId,
      isBonusItem,
      isQuickPay,
      legalDisclosureTranslationKey,
      markRedirectHandled,
      paymentProfiles,
      preparePaymentForQuickPay,
      preparePaymentProviderPayload,
      process3DSForQuickPay,
      processPaymentForQuickPay,
      redirectToPurchase,
      selectPaymentProfile,
      selectedPaymentProfile,
      selectedProduct,
      shouldRedirectToPurchase,
      stripe,
      taxTranslationKey,
      isQuickPayLoading,
    }),
    [
      checkoutSessionId,
      isBonusItem,
      isQuickPay,
      legalDisclosureTranslationKey,
      markRedirectHandled,
      paymentProfiles,
      preparePaymentForQuickPay,
      preparePaymentProviderPayload,
      processPaymentForQuickPay,
      redirectToPurchase,
      selectPaymentProfile,
      selectedPaymentProfile,
      selectedProduct,
      shouldRedirectToPurchase,
      stripe,
      taxTranslationKey,
      process3DSForQuickPay,
      isQuickPayLoading,
    ],
  );
}
