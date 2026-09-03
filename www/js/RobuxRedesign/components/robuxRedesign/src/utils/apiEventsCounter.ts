import { UrlConfig } from "@rbx/core-scripts/http";
import { withApiEventsV2 } from "../observability";

export enum HTTPVerb {
  GET = "GET",
  POST = "POST",
}

export enum APICall {
  // Robux Redesign
  ACKNOWLEDGE_PURCHASE_WARNING = "AcknowledgePurchaseWarning",
  CHECK_USER_PURCHASE_SETTING = "CheckUserPurchaseSetting",
  GET_ENABLE_PURCHASES_SETTING = "GetEnablePurchaseSetting",
  GET_PAYMENT_PROFILES = "GetPaymentProfiles",
  GET_PENDING_ENABLE_PURCHASE_CONSENT_REQUESTS = "GetPendingEnablePurchaseConsentRequests",
  GET_PURCHASE_WARNING = "GetPurchaseWarning",
  GET_QUICK_PAY_METADATA = "GetQuickPayMetadata",
  GET_ROBUX_BALANCE = "GetRobuxBalance",
  GET_THUMBNAILS = "GetThumbnails",
  PREPARE_PAYMENT = "PreparePayment",
  PROCESS_PAYMENT = "ProcessPayment",
  GET_CLIENT_ASSERTION_V2 = "GetClientAssertionV2",
  GET_AUTH_TICKET_V2 = "GetAuthTicketV2",
  GET_MY_FRIENDS = "GetMyFriends",
  USER_SEARCH = "UserSearch",
}

/**
 * @deprecated Use withApiEventsV2 instead
 */
export async function withApiEvents<T>(
  httpVerb: HTTPVerb,
  call: APICall,
  urlConfig: Omit<UrlConfig, "fullError">,
  params?: object | [],
  customResolve?: (data: T, headers: Record<string, string>) => T | undefined,
  throwOnError?: boolean,
): Promise<T | undefined> {
  const { url, ...rest } = urlConfig;

  const promise =
    httpVerb === HTTPVerb.GET
      ? withApiEventsV2<T>({
          method: "GET",
          url,
          config: { ...rest, params },
          eventCounterProps: {
            call,
          },
        })
      : withApiEventsV2<T>({
          method: "POST",
          url,
          config: rest,
          eventCounterProps: {
            call,
          },
          data: params ?? {},
        });

  return promise
    .then(({ data, headers }) => {
      return customResolve?.(data, headers) ?? data;
    })
    .catch((err: unknown) => {
      if (throwOnError) {
        throw err;
      }
      return undefined;
    });
}
