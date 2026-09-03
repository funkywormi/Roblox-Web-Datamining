import { Card, PaymentProfileProviderPayload, PayPal } from "../services/paymentsGatewayService";

/**
 * Type guard to determine if a payment profile's provider payload is a Card.
 */
export const isCardProviderPayload = (
  providerPayload: PaymentProfileProviderPayload | null | undefined,
): providerPayload is Card => providerPayload?.paymentProfileType === "card";

/**
 * Type guard to determine if a payment profile's provider payload is PayPal.
 */
export const isPayPalProviderPayload = (
  providerPayload: PaymentProfileProviderPayload | null | undefined,
): providerPayload is PayPal => providerPayload?.paymentProfileType === "paypal";
