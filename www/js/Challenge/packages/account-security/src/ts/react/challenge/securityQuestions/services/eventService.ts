import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { EVENT_CONSTANTS } from "../app.config";

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  sendAnswerChoicesFailedToLoadEvent(
    answerChoicesWithNoCaption: string[],
    answerChoicesWithNoIcon: string[],
  ): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.answerChoicesFailedToLoad,
      {
        sessionId: this.sessionId,
        answerChoicesWithNoCaption: JSON.stringify(answerChoicesWithNoCaption),
        answerChoicesWithNoIcon: JSON.stringify(answerChoicesWithNoIcon),
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
