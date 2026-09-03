import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { captureException } from "../../error";
import { createWithApiMetrics } from "../../withApiMetrics";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

export const observabilityRegistry = {
  featureName: "RedeemGiftCard",
  team: "Economy > Payments & Fraud",
  features: {
    health: {
      criticalErrors: ["Error_ReactCrash", "Error_NoRootContainer"],
      counters: ["Page_Viewed"],
      flows: [
        {
          id: "gift_card_redeem",
          title: "Gift card redeem (success & failed vs start)",
          steps: [
            { counter: "GiftCard_RedeemStarted", role: "start", title: "Started" },
            { counter: "GiftCard_Redeemed", role: "success", title: "Redeemed" },
            {
              counter: "Error_GiftCard_RedeemFailed",
              role: "error",
              title: "Failed",
              dimensions: ["errorCode"],
            },
          ],
        },
      ],
    },

    scanGiftCard: {
      apiCalls: ["ScanGiftCard"],
      counters: ["CameraAccessUnmounted", "CameraRetryClicked"],
      errors: ["Error_IxpLayerFetchFailed"],
      flows: [
        {
          id: "camera_access",
          title: "Camera access (success & failed vs start)",
          steps: [
            { counter: "CameraAccessStarted", role: "start", title: "Started" },
            { counter: "CameraAccessSuccess", role: "success", title: "Success" },
            { counter: "Error_CameraAccessFailed", role: "error", title: "Failed" },
            { counter: "Error_CameraAccessUnsupported", role: "error", title: "Unsupported" },
            { counter: "Error_CameraAccessException", role: "error", title: "Exception" },
          ],
        },
        {
          id: "scan_attempt",
          title: "Scan attempt (success & failed vs take photo)",
          steps: [
            { counter: "TakePhotoClicked", role: "start", title: "Take photo" },
            { counter: "ScanCodeFound", role: "success", title: "Code found" },
            { counter: "ScanNoCodeFound", role: "error", title: "No code found" },
            { counter: "Error_ScanRequestFailed", role: "error", title: "Request failed" },
            { counter: "Error_ScanDrawImageException", role: "error", title: "Draw failed" },
          ],
        },
      ],
    },

    modals: {
      criticalErrors: ["Error_ConfirmationModal_Crash", "Error_ScanGiftCardModal_Crash"],
    },

    creditConversion: {
      counters: [
        "GetNextPurchasable_Unexpected",
        "GetNextPurchasable_CreditBalanceZero",
        { name: "GetNextPurchasable_Success", dimensions: ["type"] },
        { name: "GetConversionMetadata_Failed", dimensions: ["statusCode"] },
        { name: "ProcessPayment_Unsuccessful", dimensions: ["type"] },
        "ProcessPayment_Redirected",
        "ProcessPayment_Unexpected",
        "ProcessPayment_EconomicRestriction",
        "CreditConversion_SwitchedToProductPurchase",
        "CreditConversion_ProductSwitchFailed",
        "CreditConversion_ContinueClicked",
        "CreditConversion_CancelClicked",
        "ProductPurchase_CancelClicked",
        "Conversion_CancelClicked",
      ],
    },

    getPlus: {
      counters: [
        { name: "GetPlus_AutoOpened", dimensions: ["creditBucket", "currencyCode"] },
        { name: "GetPlus_EntryClicked", dimensions: ["creditBucket", "currencyCode"] },
        {
          name: "GetPlus_TierSelected",
          dimensions: ["tier", "source", "creditBucket", "currencyCode"],
        },
        { name: "GetPlus_SubscribeClicked", dimensions: ["tier"] },
        "GetPlus_PreparePurchase_Redirected",
        "GetPlus_Dismissed",
        { name: "GetPlus_ListProducts_Success", dimensions: ["hasProducts"] },
      ],
      errors: [
        "Error_GetPlus_ListProducts_Failed",
        { name: "Error_GetPlus_PreparePurchase_Failed", dimensions: ["reason"] },
      ],
    },

    conversionFooter: {
      counters: [
        {
          name: "ConversionFooter_Viewed",
          dimensions: [
            "getPlusVisible",
            "getRobuxVisible",
            "convertVisible",
            "creditBucket",
            "currencyCode",
          ],
        },
        {
          name: "GetRobux_EntryClicked",
          dimensions: ["buttonType", "creditBucket", "currencyCode"],
        },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;
export type ApiCall = Obs["ApiCall"];
export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];
export type DimensionsFor<N extends CounterName | ErrorName | CriticalErrorName> =
  Obs["DimensionsFor"][N];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  { publish: publishMetric, captureException, featureName: observabilityRegistry.featureName },
);

export const withApiEvents = createWithApiMetrics<ApiCall>(publishMetric);
