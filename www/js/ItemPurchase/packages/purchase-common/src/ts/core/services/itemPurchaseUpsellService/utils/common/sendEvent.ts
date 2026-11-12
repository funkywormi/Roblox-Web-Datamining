import { sendEventWithTarget, targetTypes } from '@rbx/core-scripts/event-stream';
import { ITEM_UPSELL_EVENTS } from '../../constants/upsellConstants';

export default function sendEvent(context: string, properties: { [key: string]: unknown }) {
  try {
    sendEventWithTarget(
      ITEM_UPSELL_EVENTS.EVENT_NAME,
      context,
      // Callers pass objects and errors, which the global EventStream accepts.
      properties as Parameters<typeof sendEventWithTarget>[2],
      targetTypes.WWW
    );
  } catch (e) {
    // do nothing
  }
}
