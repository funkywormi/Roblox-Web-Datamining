import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { EVENT_CONSTANTS } from "../app.config";

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private readonly challengeId: string;

  private startTime: number | null;

  constructor(challengeId: string) {
    this.challengeId = challengeId;
    this.startTime = null;
  }

  sendChallengeInitializedEvent(): void {
    this.startTime = Date.now();
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        challengeId: this.challengeId,
      },
      targetTypes.WWW,
    );
  }

  sendPuzzleInitializedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.puzzleInitialized,
      {
        challengeId: this.challengeId,
      },
      targetTypes.WWW,
    );
  }

  sendPuzzleCompletedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.puzzleCompleted,
      {
        challengeId: this.challengeId,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeCompletedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeCompleted,
      {
        challengeId: this.challengeId,
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

  sendChallengeTimeoutEvent(progress: number): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeTimeout,
      {
        challengeId: this.challengeId,
        timeoutProgress: progress,
        timeoutElapsedTime: this.startTime !== null ? Date.now() - this.startTime : 0,
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
