import Roblox from "Roblox";
import { EVENT_CONSTANTS } from "../app.config";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";

function sendAuthEvent(schematizedEventType: string, state: string): void {
  Roblox.EventStream.SendEventWithTarget(
    schematizedEventType,
    AUTH_EVENT_CONSTANTS.context.resetPasswordPage,
    { state },
    Roblox.EventStream.TargetTypes.WWW,
  );
}

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  // eslint-disable-next-line class-methods-use-this
  sendPageLoadEvent(): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.pageLoad,
      {},
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendRecoveryInitializedFromAutofillEvent(
    recoverySessionId: string,
    identifierType: string,
    nextComponent: string,
  ): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.recoveryInitializedFromAutofill,
      {
        recoverySessionId,
        identifierType,
        nextComponent,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendIdentifierSentEvent(
    recoverySessionId: string,
    identifierType: string,
    nextComponent: string,
  ): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.identifierSent,
      {
        recoverySessionId,
        identifierType,
        nextComponent,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendContactMethodSentEvent(recoverySessionId: string, contactMethodType: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.contactMethodSent,
      {
        recoverySessionId,
        contactMethodType,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendUserSelectedEvent(recoverySessionId: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.userSelected,
      {
        recoverySessionId,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendPasswordResetEvent(recoverySessionId: string, redirectAfterReset: string): void {
    Roblox.EventStream.SendEventWithTarget(
      EVENT_CONSTANTS.eventName,
      EVENT_CONSTANTS.context.passwordReset,
      {
        recoverySessionId,
        redirectAfterReset,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendAuthModalShown(state: string): void {
    sendAuthEvent(AUTH_EVENT_CONSTANTS.schematizedEventTypes.authModalShown, state);
  }

  // eslint-disable-next-line class-methods-use-this
  sendAuthButtonClick(state: string): void {
    sendAuthEvent(AUTH_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick, state);
  }

  // eslint-disable-next-line class-methods-use-this
  sendAuthMsgShown(state: string): void {
    sendAuthEvent(AUTH_EVENT_CONSTANTS.schematizedEventTypes.authMsgShown, state);
  }

  // eslint-disable-next-line class-methods-use-this
  sendPasskeyCreationSourceEvent(source: string): void {
    Roblox.EventStream.SendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
      AUTH_EVENT_CONSTANTS.context.passkeyCreationSource,
      { state: AUTH_EVENT_CONSTANTS.state.passkeyCreation.finishRegistration, field: source },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendPasskeyRegistrationFailure(source: string, detail: string): void {
    Roblox.EventStream.SendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
      AUTH_EVENT_CONSTANTS.context.resetPasswordPage,
      {
        state: AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyRegistrationFailure,
        field: detail,
        origin: source,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendRecoveryPageReachedEvent(): void {
    sendAuthEvent(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
      AUTH_EVENT_CONSTANTS.state.accountRecoveryPage.recoveryPageShown,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendRecoveryPathChosenEvent(btn: string): void {
    Roblox.EventStream.SendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      AUTH_EVENT_CONSTANTS.context.resetPasswordPage,
      {
        state: AUTH_EVENT_CONSTANTS.state.accountRecoveryPage.recoveryPathChosen,
        btn: btn,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendPasswordResetSubmitted(flowType: string): void {
    Roblox.EventStream.SendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      AUTH_EVENT_CONSTANTS.context.resetPasswordPage,
      {
        state: AUTH_EVENT_CONSTANTS.state.accountRecoveryPage.passwordResetSubmitted,
        origin: flowType,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendPasswordResetSucceeded(flowType: string): void {
    Roblox.EventStream.SendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
      AUTH_EVENT_CONSTANTS.context.resetPasswordPage,
      {
        state: AUTH_EVENT_CONSTANTS.state.accountRecoveryPage.passwordResetSucceeded,
        origin: flowType,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendRecoverySuccessContinueClicked(flowType: string): void {
    Roblox.EventStream.SendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      AUTH_EVENT_CONSTANTS.context.resetPasswordPage,
      {
        state: AUTH_EVENT_CONSTANTS.state.accountRecoveryPage.recoverySuccessContinueClicked,
        btn: AUTH_EVENT_CONSTANTS.btn.continue,
        origin: flowType,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendPasswordResetFailure(
    errorCode: number | null,
    errorStatusCode: number | null,
    flowType: string,
  ): void {
    // Emit the RAW backend code (not the mapped enum, which collapses unmapped
    // codes like NullRecoverySessionId to null). Fall back to the HTTP status so
    // there is always an identifiable value to map back to auth-api. authMsgShown
    // is used (not authClientError) because its schema has a dedicated `errorcode`
    // column; authClientError drops any code that isn't `state`/`origin`.
    const code =
      errorCode !== null
        ? String(errorCode)
        : errorStatusCode !== null
          ? `http_${errorStatusCode}`
          : "";
    Roblox.EventStream.SendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
      AUTH_EVENT_CONSTANTS.context.resetPasswordPage,
      {
        state: AUTH_EVENT_CONSTANTS.state.accountRecoveryPage.passwordResetFailure,
        errorCode: code,
        origin: flowType,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendPasswordReset2svIncomplete(flowType: string, reason: string): void {
    // Single event for every "2SV challenge did not complete" branch (abandon
    // or error). `reason` (see recovery2svIncompleteReason) keeps them separable
    // while ensuring none of them silently fall into the password-abandon bucket.
    // authMsgShown is used (not authClientError) for schema parity with the
    // failure event and so `field`/`origin` both schematize into columns.
    Roblox.EventStream.SendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
      AUTH_EVENT_CONSTANTS.context.resetPasswordPage,
      {
        state: AUTH_EVENT_CONSTANTS.state.accountRecoveryPage.passwordReset2svIncomplete,
        field: reason,
        origin: flowType,
      },
      Roblox.EventStream.TargetTypes.WWW,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendPasswordDeactivationSourceEvent(source: string): void {
    Roblox.EventStream.SendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
      AUTH_EVENT_CONSTANTS.context.passwordDeactivationSource,
      { state: AUTH_EVENT_CONSTANTS.state.passwordDeactivation.deactivationSuccess, field: source },
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
