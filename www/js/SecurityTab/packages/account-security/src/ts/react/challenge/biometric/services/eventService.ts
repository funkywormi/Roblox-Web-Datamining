import Roblox from "Roblox";
import { EVENT_CONSTANTS } from "../app.config";

/**
 * Default implementation of the event service for biometric challenges.
 */
export class EventServiceDefault {
  private challengeId: string;

  constructor(challengeId: string) {
    this.challengeId = challengeId;
  }
  private constructEventParameters(reason?: string, inquiryId?: string): Record<string, string> {
    return {
      challengeId: this.challengeId,
      ...(reason && { reason }),
      ...(inquiryId && { inquiryId }),
    };
  }

  sendChallengeInitializedEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      this.constructEventParameters(),
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  sendChallengeDisplayedEvent(reason?: string, inquiryId?: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeDisplayed,
      this.constructEventParameters(reason, inquiryId),
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  sendChallengeCompletedEvent(reason?: string, inquiryId?: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeCompleted,
      this.constructEventParameters(reason, inquiryId),
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  sendChallengeInvalidatedEvent(reason?: string, inquiryId?: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      this.constructEventParameters(reason, inquiryId),
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  sendChallengeAbandonedEvent(reason?: string, inquiryId?: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeAbandoned,
      this.constructEventParameters(reason, inquiryId),
      Roblox.EventStream.TargetTypes.WWW,
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
