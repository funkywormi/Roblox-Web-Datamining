import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { EVENT_CONSTANTS } from "../app.config";

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private challengeId: string;

  constructor(challengeId: string) {
    this.challengeId = challengeId;
  }

  sendChallengeInitializedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        challengeId: this.challengeId,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeCompletedEvent(supportPAT: boolean): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeCompleted,
      {
        challengeId: this.challengeId,
        supportPAT,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeInvalidatedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      {
        challengeId: this.challengeId,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeAbandonedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeAbandoned,
      {
        challengeId: this.challengeId,
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
