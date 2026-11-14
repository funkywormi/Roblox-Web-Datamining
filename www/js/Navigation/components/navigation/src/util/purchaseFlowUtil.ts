import {
  paymentFlowAnalyticsService,
  type SendUserPurchaseFlowEventParams,
} from "@rbx/payments/payments-flow-analytics";
import { getNavCapability } from "./navCapabilities";

export const sendUserPurchaseFlowEvent = (params: SendUserPurchaseFlowEventParams): void => {
  const send = getNavCapability("sendUserPurchaseFlowEvent");
  if (send != null) {
    send(params);
    return;
  }
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(params);
};
