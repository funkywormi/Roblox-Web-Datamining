import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { hashStringWithFnv1a32, stringToUrlSafeBase64 } from "@rbx/www-common/auth";
import {
  MARKETING_CONSENT_AMP_NAMESPACE,
  MARKETING_CONSENT_AUTO_OPT_IN_FEATURE,
  MARKETING_CONSENT_AUTO_OPT_IN_SURFACE,
  MARKETING_CONSENT_CHECKBOX_SURFACE,
  MARKETING_CONSENT_GATE_FEATURE,
  MARKETING_CONSENT_SOURCE_CONTENT_ID,
  MARKETING_CONSENT_WRITE_WAIT_MS,
} from "../constants/marketingConsentConstants";
import { getHttpStatus } from "../utils/requestUtils";
import {
  reportMarketingConsentWriteFailed,
  reportMarketingConsentWriteSucceeded,
} from "./accountUpgradeAnalytics";

const FEATURE_ACCESS_URL = `${environmentUrls.apiGatewayUrl}/access-management/v1/feature-access`;
const USER_SETTINGS_URL = `${environmentUrls.userSettingsApi}/v2/user-settings`;
const AMP_FEATURE_NAMES = [MARKETING_CONSENT_GATE_FEATURE, MARKETING_CONSENT_AUTO_OPT_IN_FEATURE];

export type MarketingConsentOptInMethod = "None" | "AutoOptIn" | "Checkbox";

type FeatureAccessResponse = { features?: unknown } | null;

type FeatureAccess = { featureName: unknown; access: unknown };

const isFeatureAccess = (value: unknown): value is FeatureAccess =>
  typeof value === "object" && value !== null && "featureName" in value && "access" in value;

const getAccess = (features: unknown[], featureName: string): unknown =>
  features.filter(isFeatureAccess).find(feature => feature.featureName === featureName)?.access;

export const getMarketingConsentOptInMethod = async (): Promise<MarketingConsentOptInMethod> => {
  try {
    const { data } = await http.get<FeatureAccessResponse>(
      { url: FEATURE_ACCESS_URL, withCredentials: true },
      { featureNames: AMP_FEATURE_NAMES.join(","), nameSpace: MARKETING_CONSENT_AMP_NAMESPACE },
    );
    const features: unknown = data?.features;
    if (
      !Array.isArray(features) ||
      getAccess(features, MARKETING_CONSENT_GATE_FEATURE) !== "Granted"
    ) {
      return "None";
    }
    // An Error or a missing auto opt-in decision must not fall back to the checkbox.
    const autoOptInAccess = getAccess(features, MARKETING_CONSENT_AUTO_OPT_IN_FEATURE);
    if (autoOptInAccess === "Granted") {
      return "AutoOptIn";
    }
    if (autoOptInAccess === "Denied") {
      return "Checkbox";
    }
    return "None";
  } catch {
    return "None";
  }
};

const toAuditHeader = (payload: object): string => stringToUrlSafeBase64(JSON.stringify(payload));

export const getCheckboxAuditHeader = (consentText: string): string =>
  toAuditHeader({
    surface: MARKETING_CONSENT_CHECKBOX_SURFACE,
    content: {
      [MARKETING_CONSENT_SOURCE_CONTENT_ID]: { hash: hashStringWithFnv1a32(consentText) },
    },
  });

export const getAutoOptInAuditHeader = (): string =>
  toAuditHeader({ surface: MARKETING_CONSENT_AUTO_OPT_IN_SURFACE });

export const sendMarketingConsent = async (auditHeader: string): Promise<void> => {
  try {
    await http.post(
      {
        url: USER_SETTINGS_URL,
        withCredentials: true,
        headers: { "rbx-audit-data": auditHeader },
      },
      {
        allowPromotionalOffersNotifications: {
          channelSettings: [{ channelName: "Email", setting: "Enabled" }],
        },
      },
    );
    reportMarketingConsentWriteSucceeded();
  } catch (error) {
    console.warn("marketing consent write error : ", error);
    reportMarketingConsentWriteFailed(String(getHttpStatus(error) ?? "unknown"));
  }
};

/**
 * If MARKETING_CONSENT_WRITE_WAIT_MS pass before `write` settles, this increments
 * `MarketingConsentWriteFailure` with `errorCode` `timeout`. The write keeps running after a
 * timeout.
 */
export const waitForMarketingConsentWrite = async (write: Promise<void>): Promise<void> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const isSettled = await Promise.race([
    write.then(
      () => true,
      () => true,
    ),
    new Promise<false>(resolve => {
      timer = setTimeout(() => {
        resolve(false);
      }, MARKETING_CONSENT_WRITE_WAIT_MS);
    }),
  ]);
  clearTimeout(timer);
  if (!isSettled) {
    reportMarketingConsentWriteFailed("timeout");
  }
};
