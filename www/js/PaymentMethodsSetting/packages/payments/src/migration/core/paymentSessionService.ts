import { EnvironmentUrls } from 'Roblox';
import paymentFlowAnalyticsService from '@rbx/core-scripts/payments-flow';
import {
  APICall,
  Feature,
  HTTPVerb,
  withApiEvents
} from '../shared/apiEventsCounter';

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
  IOS_CLIENT = 'IosClient',
  ANDROID_CLIENT = 'AndroidClient'
}

export const createPaymentSession = async (): Promise<CreatePaymentSessionResponse | undefined> =>
  withApiEvents<CreatePaymentSessionResponse>(
    HTTPVerb.POST,
    {
      withCredentials: true,
      url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-sessions`
    },
    { feature: Feature.PAYMENT, call: APICall.CREATE_PAYMENT_SESSION },
    {
      paymentFlowId: paymentFlowAnalyticsService.getPaymentFlowUuid()
    }
  );

export const getPaymentSession = async (
  paymentSessionId: string
): Promise<GetPaymentSessionResponse | undefined> =>
  withApiEvents<GetPaymentSessionResponse>(
    HTTPVerb.GET,
    {
      withCredentials: true,
      url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-sessions/${paymentSessionId}`
    },
    { feature: Feature.PAYMENT, call: APICall.GET_PAYMENT_SESSION }
  );

export const getPaymentSessionByCheckoutSessionId = async (
  checkoutSessionId: string
): Promise<GetPaymentSessionByCheckoutSessionIdResponse | undefined> =>
  withApiEvents<GetPaymentSessionByCheckoutSessionIdResponse>(
    HTTPVerb.GET,
    {
      withCredentials: true,
      url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-sessions?checkoutSessionId=${checkoutSessionId}`
    },
    { feature: Feature.PAYMENT, call: APICall.GET_PAYMENT_SESSION_BY_CHECKOUT_SESSION_ID }
  );
