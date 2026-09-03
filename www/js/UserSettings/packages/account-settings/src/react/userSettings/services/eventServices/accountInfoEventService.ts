import { eventStreamService } from "core-roblox-utilities";
import { getEventParams } from "../../constants/eventConstants";
import {
  firePasskeyPageLoadCounter,
  firePasskeyCreatedCounter,
  firePasskeyCreationSourceCounter,
} from "../../utils/accountInfoEventsCounters";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";

const changeBirthdayState = (isVerified: boolean, above13: boolean): string => {
  let state;
  if (!above13) {
    state = "U13";
  } else if (isVerified) {
    state = "13Verified";
  } else {
    state = "13Unverified";
  }
  return state;
};

const pendingChangeBirthdayState = (newBirthday: string): string => {
  const date = new Date(newBirthday);
  const ageDifferenceMills = Date.now() - date.getTime(); // milliseconds from epoch
  const ageDate = new Date(ageDifferenceMills);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  let state;
  if (age < 13) {
    state = "U13ToU13";
  } else {
    state = "U13To1318";
  }
  return state;
};

const accountInfoEventService = {
  changeDisplayNameSuccess: wrapEventServiceWithTryCatch(
    (oldName: string, newName: string): void => {
      const params = getEventParams.changeDisplayNameSuccess(oldName, newName);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  changeDisplayNameCancel: wrapEventServiceWithTryCatch((oldName: string): void => {
    const params = getEventParams.changeDisplayNameCancel(oldName);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  passkeyPageLoad: wrapEventServiceWithTryCatch((eligible: boolean, timeout?: boolean): void => {
    const params = getEventParams.passkeyPageload(eligible, timeout);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    firePasskeyPageLoadCounter(eligible, timeout);
  }),
  passkeyCreated: wrapEventServiceWithTryCatch((state: string): void => {
    const params = getEventParams.passkeyCreated(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    firePasskeyCreatedCounter(state);
  }),
  passkeyCreationSource: wrapEventServiceWithTryCatch((source: string): void => {
    const params = getEventParams.passkeyCreationSource(source);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    firePasskeyCreationSourceCounter(source);
  }),
  authPageLoad: wrapEventServiceWithTryCatch((isVerified: boolean, above13: boolean): void => {
    const params = getEventParams.authPageLoad(changeBirthdayState(isVerified, above13));
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  birthdayUpdateBtnClick: wrapEventServiceWithTryCatch(
    (isVerified: boolean, above13: boolean): void => {
      const params = getEventParams.birthdayUpdateBtnClick(
        changeBirthdayState(isVerified, above13),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  cancelPendingConsentModalLoad: wrapEventServiceWithTryCatch(
    (isVerified: boolean, above13: boolean): void => {
      const params = getEventParams.cancelPendingConsentModalLoad(
        changeBirthdayState(isVerified, above13),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  confirmCancelPendingConsent: wrapEventServiceWithTryCatch((newBirthday: string): void => {
    const params = getEventParams.confirmCancelPendingConsent(
      pendingChangeBirthdayState(newBirthday),
    );
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  rejectCancelPendingConsent: wrapEventServiceWithTryCatch((newBirthday: string): void => {
    const params = getEventParams.rejectCancelPendingConsent(
      pendingChangeBirthdayState(newBirthday),
    );
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  birthdayUpdateModalLoad: wrapEventServiceWithTryCatch(
    (isVerified: boolean, above13: boolean): void => {
      const params = getEventParams.birthdayUpdateModalLoad(
        changeBirthdayState(isVerified, above13),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  birthdayUpdateModalInteration: wrapEventServiceWithTryCatch(
    (isVerified: boolean, above13: boolean): void => {
      const params = getEventParams.birthdayUpdateModalInteration(
        changeBirthdayState(isVerified, above13),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  birthdayUpdateModalContinue: wrapEventServiceWithTryCatch(
    (isVerified: boolean, above13: boolean): void => {
      const params = getEventParams.birthdayUpdateModalContinue(
        changeBirthdayState(isVerified, above13),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  birthdayUpdateModalCancel: wrapEventServiceWithTryCatch(
    (isVerified: boolean, above13: boolean): void => {
      const params = getEventParams.birthdayUpdateModalCancel(
        changeBirthdayState(isVerified, above13),
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  birthdayUpdateModalError: wrapEventServiceWithTryCatch(
    (isVerified: boolean, above13: boolean, errorCode?: string): void => {
      const params = getEventParams.birthdayUpdateModalError(
        changeBirthdayState(isVerified, above13),
        errorCode,
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickConfirmFae: wrapEventServiceWithTryCatch((state?: string): void => {
    const params = getEventParams.authButtonClickConfirmFae(state);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
};

export default accountInfoEventService;
