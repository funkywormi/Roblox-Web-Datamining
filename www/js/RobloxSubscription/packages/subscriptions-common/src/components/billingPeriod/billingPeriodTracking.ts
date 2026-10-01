import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";

import { trackCounter } from "../../observability";

import type { BillingPeriodOption } from "../../utils/billingPeriod";

type PurchaseFlowEventParams = Parameters<
  typeof paymentFlowAnalyticsService.sendUserPurchaseFlowEvent
>;

export type BillingPeriodAnalyticsContext = {
  triggeringContext: PurchaseFlowEventParams[0];
  viewName: NonNullable<PurchaseFlowEventParams[2]>;
};

type BillingPeriodTrackingArgs = {
  analyticsContext: BillingPeriodAnalyticsContext;
  paymentSessionId?: string;
};

const { ENUM_PURCHASE_EVENT_TYPE, ENUM_VIEW_MESSAGE } = paymentFlowAnalyticsService;

const sendPurchaseFlowEvent = (
  { analyticsContext, paymentSessionId }: BillingPeriodTrackingArgs,
  eventType: NonNullable<PurchaseFlowEventParams[3]>,
  viewMessage: NonNullable<PurchaseFlowEventParams[4]>,
  metadata: Record<string, string>,
) => {
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
    analyticsContext.triggeringContext,
    false,
    analyticsContext.viewName,
    eventType,
    viewMessage,
    paymentSessionId ? { ...metadata, paymentSessionId } : metadata,
  );
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
