import { eventStreamService } from 'core-roblox-utilities';
import EVENT_CONSTANTS from '../constants/eventConstants';

const sendEvent = (eventName: string, params: Record<string, string | number>): void => {
  eventStreamService.sendEventWithTarget(
    eventName,
    EVENT_CONSTANTS.context.settingsSpending,
    params
  );
};

/**
 * Sends an event for loading the spending page.
 * @param state - Which version of the spending page is loaded
 */
export const sendLoadSpendingEvent = (state: string): void => {
  sendEvent(EVENT_CONSTANTS.eventName.authPageLoad, {
    state,
    associatedText: EVENT_CONSTANTS.text.spending
  });
};

/**
 * Sends an event for the "Ask my parent" button click.
 * @param state - Which setting the user is requesting consent for
 */
export const sendAskMyParentButtonClickEvent = (state: string): void => {
  sendEvent(EVENT_CONSTANTS.eventName.authButtonClick, {
    btn: EVENT_CONSTANTS.btn.askParent,
    state,
    associatedText: EVENT_CONSTANTS.text.askMyParent
  });
};

/**
 * Sends an event for showing the "Ask your parent" modal.
 * @param state - Which setting the user is requesting consent for
 */
export const sendAskYourParentModalShownEvent = (state: string): void => {
  sendEvent(EVENT_CONSTANTS.eventName.authModalShown, {
    field: EVENT_CONSTANTS.field.askParentConfirm,
    state,
    associatedText: EVENT_CONSTANTS.text.askYourParent
  });
};

/**
 * Sends an event for the "Ask now" button click in the "Ask your parent" modal.
 * @param state - Which setting the user is requesting consent for
 */
export const sendAskNowModalButtonClickEvent = (state: string): void => {
  sendEvent(EVENT_CONSTANTS.eventName.authButtonClick, {
    btn: EVENT_CONSTANTS.btn.askParentConfirm,
    state,
    associatedText: EVENT_CONSTANTS.text.askNow
  });
};

/**
 * Sends an event for the "Cancel" button click in the "Ask your parent" modal.
 * @param state - Which setting the user is requesting consent for
 */
export const sendCancelAskParentModalButtonClickEvent = (state: string): void => {
  sendEvent(EVENT_CONSTANTS.eventName.authButtonClick, {
    btn: EVENT_CONSTANTS.btn.cancelAskParentConfirm,
    state,
    associatedText: EVENT_CONSTANTS.text.cancel
  });
};

/**
 * Sends an event for clicking the cancel pending request button.
 * @param state - Which setting the user is cancelling the pending request for
 */
export const sendCancelPendingRequestButtonClickEvent = (state: string): void => {
  sendEvent(EVENT_CONSTANTS.eventName.authModalShown, {
    state,
    field: EVENT_CONSTANTS.field.cancelModal,
    associatedText: EVENT_CONSTANTS.text.cancelRequest
  });
};

/**
 * Sends an event for showing the cancel pending request modal.
 * @param state - Which setting the user is cancelling the pending request for
 */
export const sendCancelPendingRequestModalShownEvent = (state: string): void => {
  sendEvent(EVENT_CONSTANTS.eventName.authModalShown, {
    state,
    field: EVENT_CONSTANTS.field.cancelModal,
    associatedText: EVENT_CONSTANTS.text.cancelRequest
  });
};

/**
 * Sends an event for the "Cancel request" button click on the modal.
 * @param state - Which setting the user is requesting consent for
 */
export const sendCancelRequestModalButtonClickEvent = (state: string): void => {
  sendEvent(EVENT_CONSTANTS.eventName.authButtonClick, {
    btn: EVENT_CONSTANTS.btn.cancelRequest,
    state,
    associatedText: EVENT_CONSTANTS.text.cancelRequest
  });
};

/**
 * Sends an event for the "Do not cancel request" button click on the modal.
 * @param state - Which setting the user is requesting consent for
 */
export const sendDoNotCancelModalButtonClickEvent = (state: string): void => {
  sendEvent(EVENT_CONSTANTS.eventName.authButtonClick, {
    btn: EVENT_CONSTANTS.btn.doNotCancelRequest,
    state,
    associatedText: EVENT_CONSTANTS.text.doNotCancel
  });
};
