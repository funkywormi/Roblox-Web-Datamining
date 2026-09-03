import { fireEvent } from "roblox-event-tracker";

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

export const fireErrorCounter = (feature: Feature, call: APICall, status?: number): Promise<void> =>
  new Promise<void>(resolve => {
    fireEvent(`ERROR_COUNTER_${feature}_${call}_${status ?? "UnknownAxiosError"}`);
    resolve();
  });
