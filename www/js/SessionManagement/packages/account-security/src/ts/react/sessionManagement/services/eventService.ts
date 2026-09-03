import Roblox from "Roblox";
import { EVENT_CONSTANTS } from "../app.config";

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  // eslint-disable-next-line class-methods-use-this
  sendSignedOutOfAllSessionsEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.signedOutOfAllSessions,
      // User ID will be added automatically for the authenticated user when the
      // event is ingested.
      {},
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendSignedOutOfSessionEvent(sessionId: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.signedOutOfSession,
      {
        sessionId,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendOpenedSessionDetailsEvent(sessionId: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.openedSessionDetails,
      {
        sessionId,
      },
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
