import { EnvironmentUrls } from "@rbx/environment-urls";
import { APICall, HTTPVerb, withApiEvents } from "../utils/apiEventsCounter";

export enum PurchaseWarningAction {
  U13PaymentModal = "U13PaymentModal",
  U13MonthlyThreshold1Modal = "U13MonthlyThreshold1Modal",
  U13MonthlyThreshold2Modal = "U13MonthlyThreshold2Modal",
  ParentalConsentWarningPaymentModal13To17 = "ParentalConsentWarningPaymentModal13To17",
  RequireEmailVerification = "RequireEmailVerification",
}

export type GetPurchaseWarningResponse = {
  action: PurchaseWarningAction;
};

export type AcknowledgePurchaseWarningResponse = object;

export const getPurchaseWarning = async (
  is13To17ScaryModalEnabled: boolean,
  productId: string,
): Promise<GetPurchaseWarningResponse | undefined> =>
  withApiEvents<GetPurchaseWarningResponse>(
    HTTPVerb.GET,
    APICall.GET_PURCHASE_WARNING,
    {
      url: `${EnvironmentUrls.apiGatewayUrl}/purchase-warning/v1/purchase-warnings`,
      withCredentials: true,
    },
    {
      is13To17ScaryModalEnabled,
      productId,
    },
  );

export const acknowledgePurchaseWarning = async (
  action: string,
): Promise<AcknowledgePurchaseWarningResponse | undefined> =>
  withApiEvents<AcknowledgePurchaseWarningResponse>(
    HTTPVerb.POST,
    APICall.ACKNOWLEDGE_PURCHASE_WARNING,
    {
      url: `${EnvironmentUrls.apiGatewayUrl}/purchase-warning/v1/purchase-warnings/acknowledge`,
      withCredentials: true,
    },
    {
      acknowledgement: `Confirmed${action}`,
    },
  );
