import { EnvironmentUrls } from "@rbx/environment-urls";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { withApiEventsV2 } from "../../observability";

type CreatePaymentSessionResponse = {
  paymentSession: PaymentSession;
};

type GetPaymentSessionResponse = {
  paymentSession: PaymentSession;
};

type GetPaymentSessionByCheckoutSessionIdResponse = {
  paymentSession: PaymentSession;
};

export type PaymentSession = {
  id: string;
  expiresAt: Date;
  metadata: Record<string, any>;
  applicationType?: PaymentSessionApplicationType;
};

export enum PaymentSessionApplicationType {
  IOS_CLIENT = "IosClient",
  ANDROID_CLIENT = "AndroidClient",
}

export const createPaymentSession = async (): Promise<CreatePaymentSessionResponse | undefined> =>
  withApiEventsV2<CreatePaymentSessionResponse>({
    method: "POST",
    url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-sessions`,
    data: { paymentFlowId: paymentFlowAnalyticsService.getPaymentFlowUuid() },
    config: {
      withCredentials: true,
    },
    eventCounterProps: { call: "CreatePaymentSession" },
  })
    .then(({ data }) => data)
    .catch(() => {
      // error is already captured by withApiEvents
      return undefined;
    });

export const getPaymentSession = async (
  paymentSessionId: string,
): Promise<GetPaymentSessionResponse | undefined> =>
  withApiEventsV2<GetPaymentSessionResponse>({
    method: "GET",
    url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-sessions/${paymentSessionId}`,
    config: {
      withCredentials: true,
    },
    eventCounterProps: { call: "GetPaymentSession" },
  })
    .then(({ data }) => data)
    .catch(() => {
      // error is already captured by withApiEvents
      return undefined;
    });

export const getPaymentSessionByCheckoutSessionId = async (
  checkoutSessionId: string,
): Promise<GetPaymentSessionByCheckoutSessionIdResponse | undefined> =>
  withApiEventsV2<GetPaymentSessionByCheckoutSessionIdResponse>({
    method: "GET",
    url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-sessions?checkoutSessionId=${checkoutSessionId}`,
    config: {
      withCredentials: true,
    },
    eventCounterProps: { call: "GetPaymentSessionByCheckoutSessionId" },
  })
    .then(({ data }) => data)
    .catch(() => {
      // error is already captured by withApiEvents
      return undefined;
    });
