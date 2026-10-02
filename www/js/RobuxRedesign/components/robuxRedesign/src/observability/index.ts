import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createPageLifecycle } from "@rbx/observability-framework/page-lifecycle";
import { createObsErrorBoundary } from "@rbx/observability-framework/react";
import { captureException } from "@rbx/payments/error";
import { createWithApiMetricsV2 } from "@rbx/payments/withApiMetrics";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

export const observabilityRegistry = {
  featureName: "BuyRobuxRedesign",
  team: "Economy > Payments & Fraud",
  internalPageName: ["Robux", "LeanerRobuxRedesignModel"],
  features: {
    health: {
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
        { name: "StartPurchase", dimensions: ["isQuickPay"] },
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
        "PurchaseWarningAcknowledged",
      ],
      errors: ["PurchaseWarningEmailVerificationException", "PurchaseWarningAcknowledgeFailed"],
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
    gifting: {
      counters: [
        "RobuxGiftingModalShown",
        "RobuxGiftingModalClosed",
        "RobuxGiftingCopyUrl",
        { name: "RobuxGiftingShare", dimensions: ["method"] },
        "RobuxGiftingShareDismissed",
        "RobuxGiftingQrGenerated",
      ],
      errors: ["RobuxGiftingCopyFailed", "RobuxGiftingShareFailed"],
    },
    quickPay: {
      counters: [
        {
          name: "QuickPayPaymentFlow",
          dimensions: ["step"],
          steps: {
            dimension: "step",
            values: [
              {
                value: "start",
                role: "start",
              },
              {
                value: "complete",
                role: "success",
              },
              {
                value: "redirect",
                role: "success",
              },
              {
                value: "3dsModalShown",
                role: "neutral",
              },
              {
                value: "noData",
                role: "error",
              },
              {
                value: "error",
                role: "error",
              },
              {
                value: "3dsError",
                role: "error",
              },
            ],
          },
        },
        {
          name: "QuickPayPreparePaymentFlow",
          dimensions: ["step"],
          steps: {
            dimension: "step",
            values: [
              {
                value: "start",
                role: "start",
              },
              {
                value: "success",
                role: "success",
              },
              {
                value: "redirect",
                role: "success",
              },
              {
                value: "error",
                role: "error",
              },
              {
                value: "noData",
                role: "error",
              },
              {
                value: "genericChallengeAbandoned",
                role: "error",
              },
              {
                value: "profileRemovedByFraud",
                role: "error",
              },
            ],
          },
        },
        {
          name: "QuickPayGetMetadataFlow",
          dimensions: ["step"],
          steps: {
            dimension: "step",
            values: [
              { value: "start", role: "start" },
              { value: "success", role: "success" },
              { value: "ineligible", role: "drop" },
              { value: "noPaymentProfiles", role: "error" },
              { value: "noEligiblePaymentProfiles", role: "error" },
              { value: "noData", role: "error" },
            ],
          },
        },
        {
          name: "QuickPayPaymentMethodSelected",
          dimensions: ["method"],
        },
        {
          name: "QuickPay3DSFlow",
          dimensions: ["step"],
          steps: {
            dimension: "step",
            values: [
              { value: "start", role: "start" },
              { value: "messageReceived", role: "neutral" },
              { value: "success", role: "success" },
              { value: "error", role: "error" },
              { value: "urlNotSet", role: "error" },
              { value: "clientSecretNotSet", role: "error" },
              { value: "stripeError", role: "error" },
              { value: "unsuccessful", role: "error" },
            ],
          },
        },
      ],
      errors: [
        { name: "QuickPayStripeProcessPaymentError", dimensions: ["stripeErrorCode"] },
        "QuickPayPreparePaymentNoPaymentProfile",
        "QuickPayStripeException",
        "QuickPayPercentStringException",
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
        { name: "PlusBillingPeriodSelectionExperimentEvaluated", dimensions: ["variant"] },
        "PlusBillingPeriodSelectionExperimentExposed",
        "PlusBillingPeriodSelectionExposureBeforeAssignment",
      ],
      errors: [
        "PlusBillingPeriodSelectionExperimentFetchFailed",
        "PlusBillingPeriodSelectionLayerExposureError",
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
      ],
      errors: ["QRCodeGenerationFailed"],
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
        {
          name: "RedirectClickTime",
          dimensions: ["bucket"],
        },
        "StampRedirectStartTsFailed",
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

export const { reportPageLoad, reportPageView } = createPageLifecycle({
  publishCounter: publishMetric,
});

export const ObsErrorBoundary = createObsErrorBoundary({
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});
