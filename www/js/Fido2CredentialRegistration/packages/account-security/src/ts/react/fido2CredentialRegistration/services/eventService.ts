import { eventStreamService } from "core-roblox-utilities";
import { EVENT_CONSTANTS } from "../app.config";

/**
 * A class encapsulating the events fired by this web app.
 */
/* eslint-disable class-methods-use-this */
export class EventServiceDefault {
  sendPasskeyRegistrationModalShownEvent(): void {
    eventStreamService.sendEventWithTarget(
      EVENT_CONSTANTS.eventTypes.authModalShown,
      EVENT_CONSTANTS.ctx.passkey,
      {
        state: EVENT_CONSTANTS.state.addPasskey,
      },
    );
  }

  sendPasskeyRegistrationButtonClickedEvent(btn: string): void {
    eventStreamService.sendEventWithTarget(
      EVENT_CONSTANTS.eventTypes.authButtonClick,
      EVENT_CONSTANTS.ctx.passkey,
      { btn },
    );
  }

  sendOSDialogErrorEvent(): void {
    eventStreamService.sendEventWithTarget(
      EVENT_CONSTANTS.eventTypes.authModalShown,
      EVENT_CONSTANTS.ctx.passkeyCreated,
      {
        state: EVENT_CONSTANTS.state.userOSDialogError,
      },
    );
  }

  sendPasskeyRegistrationErrorEvent(body: string, source: string): void {
    eventStreamService.sendEventWithTarget(
      EVENT_CONSTANTS.eventTypes.authClientError,
      EVENT_CONSTANTS.ctx.passkeyCreated,
      {
        state: body,
        origin: source,
      },
    );
  }
}
/* eslint-enable class-methods-use-this */

/**
 * An interface encapsulating the events fired by this web app.
 *
 * This interface type offers future flexibility e.g. for mocking the default
 * event service.
 */
export type EventService = {
  [K in keyof EventServiceDefault]: EventServiceDefault[K];
};
