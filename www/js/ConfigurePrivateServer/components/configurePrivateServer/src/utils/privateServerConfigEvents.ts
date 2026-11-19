import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { PrivateServerEventType } from "@rbx/discovery-common/constants";
import type {
  PrivateServer,
  PrivateServerSubscription,
} from "../types/configurePrivateServerTypes";

type EventExtras = Record<string, string | number | boolean>;

const sendEvent = (
  server: PrivateServer,
  eventType: "show" | "click",
  component: string,
  fields: EventExtras,
): void => {
  try {
    sendEventWithTarget(
      PrivateServerEventType.PRIVATE_SERVER_CONFIG,
      component,
      {
        event_type: eventType,
        component,
        privateServerId: server.id,
        universeId: server.game.id,
        surface: "web",
        ...fields,
      },
      targetTypes.WWW,
    );
  } catch {
    // Telemetry must never block the action that follows it.
  }
};

export const sendShowEvent = (
  server: PrivateServer,
  component: string,
  extras: EventExtras = {},
): void => {
  sendEvent(server, "show", component, extras);
};

export const sendClickEvent = (
  server: PrivateServer,
  component: string,
  subcomponent: string,
  extras: EventExtras = {},
): void => {
  sendEvent(server, "click", component, { subcomponent, ...extras });
};

export const toTargetState = (enabled: boolean): string => (enabled ? "enabled" : "disabled");

export const getSubscriptionStatus = (subscription: PrivateServerSubscription): string => {
  if (subscription.expired) {
    return "inactive";
  }
  // Free servers have no renewable subscription, so an inactive free server isn't "expiring".
  if (subscription.active || !subscription.price) {
    return "active";
  }
  return "expiring";
};

// A server is plus_included only when a Plus discount made it free. The
// RobloxSubscription tag isn't used because Plus users on free games get it with no discount.
export const getOfferDetails = ({
  price,
  totalDiscountAmountInRobux,
}: PrivateServerSubscription): EventExtras => {
  let offerType = "paid";
  if (!price) {
    offerType = totalDiscountAmountInRobux ? "plus_included" : "free";
  }
  return {
    offer_type: offerType,
    ...(totalDiscountAmountInRobux && { discount_amount: totalDiscountAmountInRobux }),
  };
};
