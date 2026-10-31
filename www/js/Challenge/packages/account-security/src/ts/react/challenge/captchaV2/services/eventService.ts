import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { DEFAULT_ACTION_TYPE, EVENT_CONSTANTS } from "../app.config";

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private readonly challengeId: string;

  // Canonical action that trigered the challenge.
  private readonly actionType: string;

  constructor(challengeId: string, actionType?: string) {
    this.challengeId = challengeId;
    // `||` (not `??`) is intentional: GCS sends an empty string for an
    // unresolved action type, which must also fall back to the default so every
    // event carries a meaningful action type value.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    this.actionType = actionType || DEFAULT_ACTION_TYPE;
  }

  private sendEvent(context: string, additionalParams: Record<string, string> = {}): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      context,
      {
        challengeId: this.challengeId,
        actionType: this.actionType,
        ...additionalParams,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeInitializedEvent(): void {
    this.sendEvent(EVENT_CONSTANTS.context.challengeInitialized);
  }

  sendSensorFinishedEvent(): void {
    this.sendEvent(EVENT_CONSTANTS.context.sensorFinished);
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

  // ABR (press-and-hold widget) lifecycle events. `uuid` is the ABR ReferenceID
  // (the server-side px_uuid), included so these correlate to the HUMAN block.
  sendAbrLoadedEvent(uuid: string): void {
    this.sendEvent(EVENT_CONSTANTS.context.abrLoaded, { uuid });
  }

  sendAbrFailedEvent(uuid: string): void {
    this.sendEvent(EVENT_CONSTANTS.context.abrFailed, { uuid });
  }

  sendAbrSucceededEvent(uuid: string): void {
    this.sendEvent(EVENT_CONSTANTS.context.abrSucceeded, { uuid });
  }

  sendAbrAcceptedEvent(uuid: string): void {
    this.sendEvent(EVENT_CONSTANTS.context.abrAccepted, { uuid });
  }

  sendAbrRejectedEvent(uuid: string): void {
    this.sendEvent(EVENT_CONSTANTS.context.abrRejected, { uuid });
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
