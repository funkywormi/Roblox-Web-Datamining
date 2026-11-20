import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { PrivateServerEventType } from "../../../js/serverList/analytics/privateServerLogging";

type CreatePrivateServerOffer = {
  universeId: number;
  price: number;
  discountTotal: number;
};

// A discount only comes from Plus, so a server made free by a discount is the Plus free server.
const getOfferType = (price: number, discountTotal: number): string => {
  if (price > 0) {
    return "paid";
  }
  return discountTotal > 0 ? "plus_included" : "free";
};

const sendCreatePrivateServerModalEvent = (
  eventType: "show" | "click",
  subcomponent: "cta_btn" | "cancel_btn" | undefined,
  { universeId, price, discountTotal }: CreatePrivateServerOffer,
): void => {
  try {
    sendEventWithTarget(
      PrivateServerEventType.PRIVATE_SERVER_CONFIG,
      "create_private_server_modal",
      {
        event_type: eventType,
        component: "create_private_server_modal",
        subcomponent,
        universeId,
        surface: "web",
        offer_type: getOfferType(price, discountTotal),
        price,
        ...(discountTotal > 0 && { discount_amount: discountTotal }),
      },
      targetTypes.WWW,
    );
  } catch {
    // Telemetry must never block creating the server.
  }
};

export default sendCreatePrivateServerModalEvent;
