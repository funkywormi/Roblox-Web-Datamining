import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createPageLifecycle } from "@rbx/observability-framework/page-lifecycle";
import { createObsErrorBoundary } from "@rbx/observability-framework/react";
import { captureException } from "@rbx/payments/error";
import { createWithApiMetricsV2 } from "@rbx/payments/withApiMetrics";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";
import { createFireTelemetryHistogram } from "@rbx/web-telemetry/histogram";

export const observabilityRegistry = {
  featureName: "BuyRobuxRedesign",
  team: "Economy > Payments & Fraud",

  features: {
    health: {
      pagePerformance: true,
      counters: ["PageLoad", "PageView"],
      criticalErrors: [
        "BuyRobuxPageReactCrash",
        "NoPageData",
        "NoRoot",
        "ParsePageDataFailed",
        "SectionReactCrash",
        "SendRobuxButtonReactCrash",
        "StripeReactCrash",
      ],
    },
    page: {
      apiCalls: [
        "AcknowledgePurchaseWarning",
        "CheckUserPurchaseSetting",
        "GetEnablePurchaseSetting",
        "GetPaymentProfiles",
        "GetPendingEnablePurchaseConsentRequests",
        "GetPurchaseWarning",
        "GetQuickPayMetadata",
        "GetRobuxBalance",
        "GetThumbnails",
        "PreparePayment",
        "ProcessPayment",
        "GetClientAssertionV2",
        "GetAuthTicketV2",
        "GetMyFriends",
        "UserSearch",
      ],
      counters: [{ name: "GetMyFriends_API", dimensions: ["status"] }, "ClickShowMore"],
    },
    bonusItems: {
      counters: [
        { name: "BonusItemMissingMetadata", dimensions: ["productType"] },
        { name: "BonusItemUnsupportedType", dimensions: ["productType"] },
      ],
    },
    purchase: {
      counters: [
        "StartPurchase",
        "DesktopPurchaseRedirect",
        "MobilePurchaseRedirect",
        "IneligiblePurchase",
        "UnsupportedPlatform",
        "UnexpectedPurchaseRedirectCall",
        "PurchaseRedirectUrlEmpty",
        "QuickPayUpsell",
        "EmailVerificationComplete",
        "EmailVerificationModalShown",
      ],
      errors: ["EmailVerificationException", "ApplePayAvailabilityException"],
    },
    purchaseEligibility: {
      counters: [
        { name: "PurchaseEligibility", dimensions: ["failureReason"] },
        "PurchaseEligibilityFailedToFetch",
        "EconomicRestrictionModalShown",
        "AccessManagementUpsellModalShown",
        "PurchaseDisabledModalShownDisabledBySelf",
        "PurchaseDisabledModalShownParentalConsent",
      ],
      errors: ["AccessManagementUpsellException"],
    },
    purchaseWarning: {
      counters: [
        { name: "PurchaseWarningModalShown", dimensions: ["action"] },
        { name: "StoppedPurchaseWarning", dimensions: ["action"] },
      ],
      errors: ["PurchaseWarningEmailVerificationException"],
    },
    firstTimePurchaseConsent: {
      counters: ["FirstTimePurchaseConsentNotFetchedInTime"],
      flows: [
        {
          id: "firstTimePurchaseConsent",
          title: "First-time purchase consent gate",
          steps: [
            { counter: "FirstTimePurchaseConsentShown", role: "start" },
            { counter: "FirstTimePurchaseConsentConfirmed", role: "success" },
            { counter: "FirstTimePurchaseConsentDismiss", role: "drop" },
          ],
        },
      ],
    },
    quickPay: {
      counters: [
        "StartQuickPay",
        { name: "QuickPayPaymentMethodSelected", dimensions: ["method"] },
        "QuickPayPaypalSelected",
        "QuickPayPaypalRedirect",
        "QuickPayRedirect",
        "QuickPayPurchaseSuccessRedirect",
        "QuickPay3DSModalShown",
        "QuickPay3DSMessageReceived",
        "QuickPayPreparePaymentStarted",
        "QuickPayPreparePaymentSuccess",
        "QuickPayChallengeAbandoned",
        "QuickPayProfileRemovedByFraud",
      ],
      errors: [
        "QuickPayPaymentProfilesNoneReceived",
        "QuickPayPaymentProfilesNoneEligibleReceived",
        "QuickPayStripeException",
        "QuickPayPercentStringException",
        "QuickPayPreparePaymentNoData",
        "QuickPayPreparePaymentNoPaymentProfile",
        "QuickPayPreparePaymentError",
        "QuickPayProcessPaymentFailure",
        { name: "QuickPayStripeProcessPaymentError", dimensions: ["stripeErrorCode"] },
        "QuickPay3DSException",
        "QuickPay3DSStripeError",
        "QuickPay3DSUnsuccessful",
        "QuickPay3DSUrlNotSet",
        "QuickPay3DSClientSecretNotSet",
      ],
    },
    subscriptionV2: {
      counters: [
        {
          name: "SubscriptionV2SubscribeClick",
          dimensions: ["isFreeTrial", "productId", "isRedirect"],
        },
        "SubscriptionV2LearnMoreClick",
        "SubscriptionV2NoPrimaryProduct",
        "SubscriptionV2NoDeviceMeta",
        {
          name: "SubscriptionV2SectionShown",
          dimensions: ["variant", "tierCount", "isFreeTrial"],
        },
      ],
    },
    transfers: {
      counters: [
        "TransferSendImpression",
        "TransferSendSheetView",
        { name: "TransferSendUserSelected", dimensions: ["source"] },
        "TransferPendingImpression",
        "TransferPendingSheetView",
        "TransferPendingAcceptClick",
        "PendingTransferDeepLink",
        "SendTransferDeepLink",
        { name: "SendRobuxExperimentEvaluated", dimensions: ["variant"] },
        "SendRobuxExperimentExposed",
      ],
      errors: [
        "QRCodeGenerationFailed",
        "SendRobuxExperimentFetchFailed",
        "SendRobuxExperimentExposureFailed",
      ],
    },
    userSearch: {
      counters: ["UserSearchStarted", "UserSearchNoResults", "UserSearchUserSelected"],
    },
    redirect: {
      counters: [
        "MobileRedirectUrlGenerationStarted",
        "MobileRedirectUrlGenerationSuccess",
        { name: "MobileToWebPurchaseRedirect", dimensions: ["version"] },
        "LoginRedirectLoggingExposureWithoutExperimentAccess",
        {
          name: "LoginRedirectExperimentEvaluated",
          dimensions: ["variant", "appType"],
        },
        "LoginRedirectExperimentExposed",
        {
          name: "LoginRedirectUnsupportedIos",
          dimensions: ["iosMajorVersion", "appType"],
        },
      ],
      errors: [
        "MobileRedirectUrlGenerationFailed",
        "LoginRedirectExperimentFetchFailed",
        "LoginRedirectLayerExposureError",
      ],
    },
    limitedTimeBonus: {
      errors: ["ResolveLimitedTimeBonusExpirationInvalidTimestamp"],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type ApiCall = Obs["ApiCall"];
export type FeatureName = Obs["FeatureName"];
export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];
export type DimensionsFor<N extends CounterName> = Obs["DimensionsFor"][N];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  { publish: publishMetric, captureException },
);

/**
 * Failure-propagating variant of `withApiEvents`: captures every failure to
 * Sentry and rethrows (success type is `T`, not `T | undefined`). Prefer this
 * for new call sites so errors surface as proper error state instead of a
 * silent `undefined`.
 */
export const withApiEventsV2 = createWithApiMetricsV2<ApiCall>(publishMetric, captureException);

const publishPerformance = createFireTelemetryHistogram(observabilityRegistry.featureName, {});

export const { reportPageLoad, reportPageView } = createPageLifecycle({
  publishCounter: publishMetric,
  publishPerformance,
});

export const ObsErrorBoundary = createObsErrorBoundary({
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});
