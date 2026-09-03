import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { EVENT_CONSTANTS } from "../app.config";
import { ActionType, MediaType } from "../interface";

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  private challengeId: string;

  private targetUserId: string;

  constructor(challengeId: string, targetUserId: string) {
    this.challengeId = challengeId;
    this.targetUserId = targetUserId;
  }

  sendChallengeInitializedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInitialized,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
      },
      targetTypes.WWW,
    );
  }

  sendUserConfigurationLoadedEvent(
    mediaType: MediaType | null,
    actionType: ActionType | null,
  ): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.userConfigurationLoaded,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || "",
        actionType: actionType || "",
      },
      targetTypes.WWW,
    );
  }

  sendNoEnabledMethodsReturnedEvent(
    primaryMediaType: MediaType | null,
    actionType: ActionType | null,
    methodsReturned: number,
  ): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.noEnabledMethodsReturned,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        primaryMediaType: primaryMediaType || "",
        actionType: actionType || "",
        methodsReturned,
      },
      targetTypes.WWW,
    );
  }

  sendChallengeInvalidatedEvent(mediaType: MediaType | null, actionType: ActionType | null): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeInvalidated,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || "",
        actionType: actionType || "",
      },
      targetTypes.WWW,
    );
  }

  sendChallengeAbandonedEvent(mediaType: MediaType | null, actionType: ActionType | null): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.challengeAbandoned,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || "",
        actionType: actionType || "",
      },
      targetTypes.WWW,
    );
  }

  sendEmailResendRequestedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.emailResendRequested,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
      },
      targetTypes.WWW,
    );
  }

  sendSmsResendRequestedEvent(): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.smsResendRequested,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
      },
      targetTypes.WWW,
    );
  }

  sendMediaTypeChangedEvent(mediaType: MediaType | null, actionType: ActionType | null): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.mediaTypeChanged,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || "",
        actionType: actionType || "",
      },
      targetTypes.WWW,
    );
  }

  sendCodeSubmittedEvent(mediaType: MediaType | null, actionType: ActionType | null): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.codeSubmitted,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || "",
        actionType: actionType || "",
      },
      targetTypes.WWW,
    );
  }

  sendCodeVerificationFailedEvent(
    mediaType: MediaType | null,
    actionType: ActionType | null,
    reason: string,
  ): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.codeVerificationFailed,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || "",
        actionType: actionType || "",
        reason,
      },
      targetTypes.WWW,
    );
  }

  sendTryToSwitchMediaTypeEvent(
    originalMediaType: MediaType | null,
    actionType: ActionType | null,
  ): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.tryToSwitchMediaType,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: originalMediaType || "",
        actionType: actionType || "",
      },
      targetTypes.WWW,
    );
  }

  sendCodeVerifiedEvent(mediaType: MediaType | null, actionType: ActionType | null): void {
    sendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.codeVerified,
      {
        challengeId: this.challengeId,
        targetUserId: this.targetUserId,
        mediaType: mediaType || "",
        actionType: actionType || "",
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
