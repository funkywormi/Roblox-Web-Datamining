import Roblox from "Roblox";
import { EVENT_CONSTANTS } from "../app.config";

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private readonly challengeId: string;

  constructor(challengeId: string) {
    this.challengeId = challengeId;
  }

  private sendEvent(context: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      context,
      {
        challengeId: this.challengeId,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  sendChallengeInitializedEvent(): void {
    this.sendEvent(EVENT_CONSTANTS.context.challengeInitialized);
  }

  sendChallengeDisplayedEvent(): void {
    this.sendEvent(EVENT_CONSTANTS.context.challengeDisplayed);
  }

  sendChallengeCompletedEvent(): void {
    this.sendEvent(EVENT_CONSTANTS.context.challengeCompleted);
  }

  sendChallengeInvalidatedEvent(): void {
    this.sendEvent(EVENT_CONSTANTS.context.challengeInvalidated);
  }

  sendChallengeAbandonedEvent(): void {
    this.sendEvent(EVENT_CONSTANTS.context.challengeAbandoned);
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
