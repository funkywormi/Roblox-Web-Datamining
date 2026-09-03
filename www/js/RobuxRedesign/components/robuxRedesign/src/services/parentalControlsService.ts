import { EnvironmentUrls } from "@rbx/environment-urls";
import { APICall, HTTPVerb, withApiEvents } from "../utils/apiEventsCounter";

export type ConsentData = {
  monthlySpendLimit: string;
  enablePurchases: string;
};

export type Consent = {
  id: number;
  consentData?: ConsentData;
};

export type PendingEnablePurchaseConsentResponse = {
  consents: Consent[];
  nextCursor?: string;
};

export type consentType = "UpdateUserSetting";

const internalGetConsentForType = async (
  childUserId: string,
  consentType: consentType,
  nextCursor?: string,
): Promise<PendingEnablePurchaseConsentResponse | undefined> =>
  withApiEvents<PendingEnablePurchaseConsentResponse>(
    HTTPVerb.GET,
    APICall.GET_PENDING_ENABLE_PURCHASE_CONSENT_REQUESTS,
    {
      url: `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/consents`,
      withCredentials: true,
    },
    {
      childUserId,
      consentStatus: "Pending",
      consentType: consentType,
      cursor: nextCursor,
    },
  );

export const getConsentRequest = async (
  childUserId: string,
  consentType: consentType,
): Promise<Consent | undefined> => {
  let cursor: string | undefined = undefined;
  let consents: Consent[] = [];

  do {
    // eslint-disable-next-line no-await-in-loop
    const pendingConsentRequests = await internalGetConsentForType(
      childUserId,
      consentType,
      cursor,
    );

    if (pendingConsentRequests) {
      consents = [...consents, ...pendingConsentRequests.consents];
      // typescript-eslint-disable-next-line prefer-nullish-coalescing
      cursor = pendingConsentRequests.nextCursor;
    } else {
      cursor = undefined;
    }
  } while (cursor);

  return consents.find(({ consentData }) => consentData?.enablePurchases);
};
