/* eslint-disable no-void */
import { fireEvent } from "roblox-event-tracker";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import type { AxiosError, AxiosResponse, UrlConfig } from "@rbx/core-scripts/http";

export enum HTTPVerb {
  GET = "GET",
  POST = "POST",
}

export enum Feature {
  PAYMENT = "Payment",
  ROBUX = "Robux",
  ROBUX_GIFTING = "RobuxGifting",
  ROBUX_REDESIGN = "RobuxRedesign",
}

export enum APICall {
  // Robux Gifting
  VERIFY_PHONE_VERIFICATION_SESSION = "VerifyPhoneVerificationSession",
  LANDING_PAGE_METADATA = "GetLandingPageMetadata",
  GET_USER_NAME = "GetUserName",
  PREPARE_PAYMENT = "PreparePayment",

  // Shared
  GET_METADATA = "GetMetadata",
  GET_PRODUCTS = "GetProducts",
  GET_PAYMENT_METHODS_INFO = "GetPaymentMethodsInfo",
  GET_PURCHASE_WARNING = "GetPurchaseWarning",
  GET_USER_PURCHASE_ELIGIBILITY = "GetUserPurchaseEligibility",

  // Robux
  CREATE_PAYMENT_SESSION = "CreatePaymentSession",
  GET_PAYMENT_SESSION = "GetPaymentSession",
  GET_PAYMENT_SESSION_BY_CHECKOUT_SESSION_ID = "GetPaymentSessionByCheckoutSessionId",
  CREATE_BONUS_SESSION = "CreateBonusSession",
  GET_BONUS_SESSION_BY_CHECKOUT_SESSION_ID = "GetBonusSessionByCheckoutSessionId",
  GET_DISPLAYABLE_BONUS_FOR_PRODUCT = "GetDisplayableBonusForProduct",
  GET_THUMBNAILS = "GetThumbnails",
  HANDLE_GAME_PASS_JOIN_EVENT = "HandleGamePassJoinEvent",

  // Robux Redesign
  GET_ROBUX_BALANCE = "GetRobuxBalance",
  GET_AUTH_TICKET = "GetAuthTicket",
  GET_CLIENT_ASSERTION = "GetClientAssertion",
}

const fireAPICounter = (feature: Feature, call: APICall, status?: number): Promise<void> =>
  new Promise<void>(resolve => {
    fireEvent(`API_COUNTER_${feature}_${call}_${status || "Throughput"}`);
    resolve();
  });

export const fireErrorCounter = (feature: Feature, call: APICall, status?: number): Promise<void> =>
  new Promise<void>(resolve => {
    fireEvent(`ERROR_COUNTER_${feature}_${call}_${status || "UnknownAxiosError"}`);
    resolve();
  });

const fireNonAxiosErrorCounter = (feature: Feature, call: APICall): Promise<void> =>
  new Promise<void>(resolve => {
    fireEvent(`ERROR_COUNTER_${feature}_${call}_NonAxiosError`);
    resolve();
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAxiosRequest(error: any): error is AxiosResponse {
  return typeof error === "object" && "status" in error;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAxiosError(error: any): error is AxiosError {
  return typeof error === "object" && "config" in error;
}

export async function withApiEvents<T>(
  httpVerb: HTTPVerb,
  urlConfig: UrlConfig,
  {
    feature,
    call,
  }: {
    feature: Feature;
    call: APICall;
  },
  params?: object | [],
  customResolve?: (data: T, headers: { [key: string]: string }) => T | undefined,
): Promise<T | undefined> {
  void fireAPICounter(feature, call);

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, headers } = await (httpVerb === HTTPVerb.GET
      ? httpService.get<T>(urlConfig, params)
      : httpService.post<T>(urlConfig, params));

    void fireAPICounter(feature, call, 200);

    return customResolve?.(data, headers as { [key: string]: string }) || data;
  } catch (err) {
    if (isAxiosRequest(err)) {
      void fireErrorCounter(feature, call, err.status);
    } else if (isAxiosError(err)) {
      void fireErrorCounter(feature, call, err.response?.status);
    } else {
      console.error(err);
      void fireNonAxiosErrorCounter(feature, call);
    }

    return undefined;
  }
}
