import { paymentFlowAnalyticsService } from "@rbx/payments/payments-flow-analytics";

import { trackCounter } from "../../observability";

import type { BillingPeriodOption } from "../../utils/billingPeriod";
import type {
  PurchaseEventType,
  TriggeringContext,
  ViewMessage,
  ViewName,
} from "@rbx/payments/payments-flow-analytics";

export type BillingPeriodAnalyticsContext = {
  triggeringContext: TriggeringContext;
  viewName: ViewName;
};

type BillingPeriodTrackingArgs = {
  analyticsContext: BillingPeriodAnalyticsContext;
  paymentSessionId?: string;
};

const { ENUM_PURCHASE_EVENT_TYPE, ENUM_VIEW_MESSAGE } = paymentFlowAnalyticsService;

const sendPurchaseFlowEvent = (
  { analyticsContext, paymentSessionId }: BillingPeriodTrackingArgs,
  purchaseEventType: PurchaseEventType,
  viewMessage: ViewMessage,
  eventMetadata: Record<string, string>,
) => {
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent({
    triggerContext: analyticsContext.triggeringContext,
    isMidPurchaseStep: false,
    viewName: analyticsContext.viewName,
    purchaseEventType,
    viewMessage,
    eventMetadata: paymentSessionId ? { ...eventMetadata, paymentSessionId } : eventMetadata,
  });
};

const optionMetadata = (option: BillingPeriodOption) => ({
  productId: option.productId,
  months: String(option.months),
});

export const trackBillingPeriodSheetShown = (
  args: BillingPeriodTrackingArgs,
  options: BillingPeriodOption[],
) => {
  const termMonths = options
    .map(option => option.months)
    .sort((a, b) => a - b)
    .join(",");
  sendPurchaseFlowEvent(
    args,
    ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
    ENUM_VIEW_MESSAGE.ROBLOX_PLUS_BILLING_PERIOD_SHEET_OPENED,
    { termMonths },
  );
  trackCounter("BillingPeriodSheetShown", {
    viewName: args.analyticsContext.viewName,
    termMonths,
  });
};

export const trackBillingPeriodOptionSelected = (
  args: BillingPeriodTrackingArgs,
  option: BillingPeriodOption,
) => {
  sendPurchaseFlowEvent(
    args,
    ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
    ENUM_VIEW_MESSAGE.ROBLOX_PLUS_BILLING_PERIOD_SELECTED,
    optionMetadata(option),
  );
  trackCounter("BillingPeriodOptionSelected", {
    viewName: args.analyticsContext.viewName,
    months: String(option.months),
  });
};

export const trackBillingPeriodSubscribeClick = (
  args: BillingPeriodTrackingArgs,
  option: BillingPeriodOption,
) => {
  const isFreeTrial = option.freeTrialEndDate !== undefined;
  sendPurchaseFlowEvent(
    args,
    ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
    isFreeTrial
      ? ENUM_VIEW_MESSAGE.ROBLOX_PLUS_FREE_TRIAL
      : ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE,
    { ...optionMetadata(option), isFreeTrial: String(isFreeTrial) },
  );
  trackCounter("BillingPeriodSubscribeClick", {
    viewName: args.analyticsContext.viewName,
    months: String(option.months),
    isFreeTrial: String(isFreeTrial),
  });
};

export const trackBillingPeriodSheetDismissed = (
  args: BillingPeriodTrackingArgs,
  selectedOption: BillingPeriodOption,
) => {
  sendPurchaseFlowEvent(
    args,
    ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
    ENUM_VIEW_MESSAGE.ROBLOX_PLUS_BILLING_PERIOD_SHEET_DISMISSED,
    optionMetadata(selectedOption),
  );
  trackCounter("BillingPeriodSheetDismissed", {
    viewName: args.analyticsContext.viewName,
    months: String(selectedOption.months),
  });
};
