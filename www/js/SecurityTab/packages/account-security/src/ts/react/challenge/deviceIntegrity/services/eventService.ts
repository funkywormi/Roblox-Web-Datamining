import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { EVENT_CONSTANTS } from "../app.config";

export class EventServiceDefault {
  private challengeId: string;

  private integrityType: string;

  constructor(challengeId: string, integrityType: string) {
    this.challengeId = challengeId;
    this.integrityType = integrityType;
  }

  sendChallengeInitializedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        challengeId: this.challengeId,
        integrityType: this.integrityType,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeCompletedEvent(result: string): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeCompleted,
      {
        challengeId: this.challengeId,
        integrityType: this.integrityType,
        result,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeInvalidatedEvent(result: string): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      {
        challengeId: this.challengeId,
        integrityType: this.integrityType,
        result,
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
