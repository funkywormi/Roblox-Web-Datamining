import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { UpsellEventType } from "../constants/upsellAnalyticsConstants";
import { TAnalyticsProps } from "../types/upsellCardTypes";

type AnalyticsEventData = TAnalyticsProps & {
  btn?: string;
  context?: string;
};

type EventStreamData = {
  upsellIdentifier?: string;
  upsellEntrySurface?: string;
  upsellStage?: string;
  upsellComponent?: string;
  upsellPurpose?: string;
  clientTimeStamp: number;
  upsellImpressionId?: string;
  btn?: string;
};

const generateUpsellIdentifier = (
  upsellPurpose?: string,
  upsellEntrySurface?: string,
  upsellComponent?: string,
): string | undefined => {
  if (!upsellPurpose || !upsellEntrySurface || !upsellComponent) {
    return undefined;
  }
  return `${upsellPurpose}${upsellEntrySurface}${upsellComponent}`;
};

export const logUpsellBannerEvent = (
  eventType: string,
  {
    upsellPurpose,
    upsellEntrySurface,
    upsellComponent,
    upsellStage,
    impressionId,
    btn,
    context = "upsellBanner",
  }: AnalyticsEventData = {},
): void => {
  const upsellIdentifier = generateUpsellIdentifier(
    upsellPurpose,
    upsellEntrySurface,
    upsellComponent,
  );

  const eventData: EventStreamData = {
    upsellIdentifier,
    upsellEntrySurface,
    upsellStage,
    upsellComponent,
    upsellPurpose,
    clientTimeStamp: Math.floor(Date.now() / 1000),
    upsellImpressionId: impressionId,
  };

  if (btn) {
    eventData.btn = btn;
  }

  sendEventWithTarget(eventType, context, eventData);
};

export const logUpsellBannerShown = (analyticsEventData: TAnalyticsProps): void => {
  logUpsellBannerEvent(UpsellEventType.Shown, analyticsEventData);
};

export const logUpsellButtonClick = (
  buttonVariant: string,
  analyticsEventData: TAnalyticsProps,
): void => {
  logUpsellBannerEvent(UpsellEventType.ButtonClick, {
    ...analyticsEventData,
    btn: buttonVariant,
  });
};

export const logUpsellBannerDismissed = (analyticsEventData: TAnalyticsProps): void => {
  logUpsellBannerEvent(UpsellEventType.ButtonClick, {
    ...analyticsEventData,
    btn: "Dismiss",
  });
};
