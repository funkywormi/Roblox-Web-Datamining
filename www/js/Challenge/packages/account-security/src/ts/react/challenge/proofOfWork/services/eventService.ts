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

  sendChallengeInitializedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        sessionId: this.sessionId,
      },
      targetTypes.WWW,
    );
  }

  sendPuzzleInitializedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.puzzleInitialized,
      {
        sessionId: this.sessionId,
      },
      targetTypes.WWW,
    );
  }

  sendPuzzleCompletedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.puzzleCompleted,
      {
        sessionId: this.sessionId,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeCompletedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeCompleted,
      {
        sessionId: this.sessionId,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeInvalidatedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      {
        sessionId: this.sessionId,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeAbandonedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeAbandoned,
      {
        sessionId: this.sessionId,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeTimeoutEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeTimeout,
      {
        sessionId: this.sessionId,
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
