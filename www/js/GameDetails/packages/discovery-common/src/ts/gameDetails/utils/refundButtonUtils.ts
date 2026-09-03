import { sendEvent } from "@rbx/core-scripts/event-stream";
import eventStreamConstants from "../../common/constants/eventStreamConstants";

export const sendRequestRefundEvent = (placeId: number) => {
  const eventStreamParams = eventStreamConstants.requestRefundClick({
    placeId,
  });

  sendEvent(...eventStreamParams);
};

export default {
  sendRequestRefundEvent,
};
