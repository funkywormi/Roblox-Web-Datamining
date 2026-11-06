import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { EVENT_CONSTANTS } from "../app.config";
import ModalState from "../store/modalState";

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private promptType: string;

  constructor(promptType: string) {
    this.promptType = promptType;
  }

  sendModalStateViewedEvent(state: ModalState): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.modalStateViewed,
      {
        promptType: this.promptType,
        state,
      },
      targetTypes.WWW,
    );
  }
}

/**
 * An interface encapsulating the events fired by this web app.
 *
 * This interface type offers future flexibility e.g. for mocking the default
 * event service.
 */
export type EventService = {
  [K in keyof EventServiceDefault]: EventServiceDefault[K];
};
