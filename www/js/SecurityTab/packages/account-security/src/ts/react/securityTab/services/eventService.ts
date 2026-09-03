import { eventStreamService } from "core-roblox-utilities";
import { AccountIntegrityChallengeService } from "Roblox";
import { EVENT_CONSTANTS, EPP_EVENT_CONSTANTS } from "../app.config";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";

/**
 * A class encapsulating the events fired by this web app.
 */
export class EventServiceDefault {
  // eslint-disable-next-line class-methods-use-this
  sendTwoStepVerificationEnabledEvent(): void {
    eventStreamService.sendEventWithTarget(
      eventStreamService.eventTypes.formInteraction!,
      EVENT_CONSTANTS.settingsContext,
      { btn: EVENT_CONSTANTS.button.twoStepVerificationEnabled },
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendTwoStepVerificationDisabledEvent(): void {
    eventStreamService.sendEventWithTarget(
      eventStreamService.eventTypes.formInteraction!,
      EVENT_CONSTANTS.settingsContext,
      { btn: EVENT_CONSTANTS.button.twoStepVerificationDisabled },
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendVerificationWarningSecurityPageTriggeredEvent(actionType: string): void {
    const { ActionType } = AccountIntegrityChallengeService.TwoStepVerification;
    let context: string;
    switch (actionType) {
      case ActionType.RobuxSpend:
        context = "2svRobuxSpend";
        break;
      case ActionType.ItemTrade:
        context = "2svItemTrade";
        break;
      default:
        context = "2svResale";
    }
    eventStreamService.sendEventWithTarget(eventStreamService.eventTypes.buttonClick!, context, {
      btn: EVENT_CONSTANTS.button.verificationWarningSecurityPageTriggered,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  sendCodeInputModalTriggeredEvent(actionType: string): void {
    const { ActionType } = AccountIntegrityChallengeService.TwoStepVerification;
    let context: string;
    switch (actionType) {
      case ActionType.RobuxSpend:
        context = "2svRobuxSpend";
        break;
      case ActionType.ItemTrade:
        context = "2svItemTrade";
        break;
      default:
        context = "2svResale";
    }
    eventStreamService.sendEventWithTarget(eventStreamService.eventTypes.buttonClick!, context, {
      btn: EVENT_CONSTANTS.button.codeInputModalTriggered,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  sendVerifySecurityPageEvent(actionType: string): void {
    const { ActionType } = AccountIntegrityChallengeService.TwoStepVerification;
    let context: string;
    switch (actionType) {
      case ActionType.RobuxSpend:
        context = "2svRobuxSpend";
        break;
      case ActionType.ItemTrade:
        context = "2svItemTrade";
        break;
      default:
        context = "2svResale";
    }
    eventStreamService.sendEventWithTarget(eventStreamService.eventTypes.buttonClick!, context, {
      btn: EVENT_CONSTANTS.button.verifySecurityPage,
    });
  }

  sendEppCardClickEvent(isEnrolled: boolean): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppCard,
      {
        btn: EPP_EVENT_CONSTANTS.btn.open,
        state: isEnrolled
          ? EPP_EVENT_CONSTANTS.state.enrolled
          : EPP_EVENT_CONSTANTS.state.unenrolled,
      },
    );
  }

  sendEppBackClickEvent(isEnrolled: boolean): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppDetails,
      {
        btn: EPP_EVENT_CONSTANTS.btn.back,
        state: isEnrolled
          ? EPP_EVENT_CONSTANTS.state.enrolled
          : EPP_EVENT_CONSTANTS.state.unenrolled,
      },
    );
  }
  sendEppPasskeyClickEvent(isManage: boolean): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppDetails,
      {
        btn: isManage ? EPP_EVENT_CONSTANTS.btn.managePasskey : EPP_EVENT_CONSTANTS.btn.addPasskey,
      },
    );
  }

  sendEppEmailClickEvent(isEdit: boolean): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppDetails,
      {
        btn: isEdit ? EPP_EVENT_CONSTANTS.btn.editEmail : EPP_EVENT_CONSTANTS.btn.addEmail,
      },
    );
  }

  sendEppEmailModalShownEvent(): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authModalShown,
      EPP_EVENT_CONSTANTS.context.eppEmailModal,
      {},
    );
  }

  sendEppPhoneClickEvent(isEdit: boolean): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppDetails,
      {
        btn: isEdit ? EPP_EVENT_CONSTANTS.btn.editPhone : EPP_EVENT_CONSTANTS.btn.addPhone,
      },
    );
  }

  sendEppPhoneModalShownEvent(): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authModalShown,
      EPP_EVENT_CONSTANTS.context.eppPhoneModal,
      {},
    );
  }

  sendEppEnrollClickEvent(): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppDetails,
      {
        btn: EPP_EVENT_CONSTANTS.btn.enroll,
      },
    );
  }
  sendEppUnenrollClickEvent(): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppDetails,
      {
        btn: EPP_EVENT_CONSTANTS.btn.unenroll,
      },
    );
  }

  sendEppUnenrollWarningModalShownEvent(): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authModalShown,
      EPP_EVENT_CONSTANTS.context.eppUnenrollWarning,
      {},
    );
  }

  sendEppUnenrollConfirmClickEvent(): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppUnenrollWarning,
      {
        btn: EPP_EVENT_CONSTANTS.btn.confirmUnenroll,
      },
    );
  }

  sendEppUnenrollCancelClickEvent(): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppUnenrollWarning,
      {
        btn: EPP_EVENT_CONSTANTS.btn.cancelUnenroll,
      },
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sendPasskeyCreationSourceEvent(source: string): void {
    eventStreamService.sendEventWithTarget(
      AUTH_EVENT_CONSTANTS.schematizedEventTypes.authMsgShown,
      AUTH_EVENT_CONSTANTS.context.passkeyCreationSource,
      { state: AUTH_EVENT_CONSTANTS.state.passkeyCreation.finishRegistration, field: source },
    );
  }

  sendEppBackupCodesClickEvent(isCreateAgain: boolean): void {
    eventStreamService.sendEventWithTarget(
      EPP_EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
      EPP_EVENT_CONSTANTS.context.eppDetails,
      {
        btn: isCreateAgain
          ? EPP_EVENT_CONSTANTS.btn.createAgainBackupCodes
          : EPP_EVENT_CONSTANTS.btn.createBackupCodes,
      },
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
