import { eventStreamService } from 'core-roblox-utilities';
import { getPhoneDiscoverabilityConsentEventParams, EventType } from '../constants/eventConstants';
import UserSetting from '../../../../legallySensitiveContent/enums/UserSetting';

const wrapEventServiceWithTryCatch = <T extends (...args: any[]) => void>(fn: T): T => {
  return ((...args: Parameters<T>) => {
    try {
      fn(...args);
    } catch (error) {
      // Ignore failures as event sending is non-critical
    }
  }) as T;
};

const sendDiscoverabilityModalShownEvent = wrapEventServiceWithTryCatch((context: string) => {
  const eventParams = getPhoneDiscoverabilityConsentEventParams.discoverabilityModalShown(context);
  eventStreamService.sendEventWithTarget(eventParams.name, eventParams.context, eventParams.params);
});

const sendConfirmDiscoverabilityEvent = wrapEventServiceWithTryCatch((context: string) => {
  const eventParams = getPhoneDiscoverabilityConsentEventParams.confirmDiscoverability(context);
  eventStreamService.sendEventWithTarget(eventParams.name, eventParams.context, eventParams.params);
});

const sendCancelDiscoverabilityEvent = wrapEventServiceWithTryCatch((context: string) => {
  const eventParams = getPhoneDiscoverabilityConsentEventParams.cancelDiscoverability(context);
  eventStreamService.sendEventWithTarget(eventParams.name, eventParams.context, eventParams.params);
});

const sendCloseDiscoverabilityModalEvent = wrapEventServiceWithTryCatch((context: string) => {
  const eventParams = getPhoneDiscoverabilityConsentEventParams.closeModal(context);
  eventStreamService.sendEventWithTarget(eventParams.name, eventParams.context, eventParams.params);
});

const settingUpsellEventHandlers = {
  [UserSetting.phoneNumberDiscoverabilityV2]: {
    [EventType.ModalShown]: sendDiscoverabilityModalShownEvent,
    [EventType.Confirm]: sendConfirmDiscoverabilityEvent,
    [EventType.Cancel]: sendCancelDiscoverabilityEvent,
    [EventType.CloseModal]: sendCloseDiscoverabilityModalEvent
  }
} as const;

const dispatchEvent = (
  eventType: keyof typeof settingUpsellEventHandlers[UserSetting.phoneNumberDiscoverabilityV2],
  settingName: string,
  context: string
): null => {
  const handlers =
    settingUpsellEventHandlers[settingName as keyof typeof settingUpsellEventHandlers];
  if (handlers && handlers[eventType]) {
    handlers[eventType](context);
  }
  return null;
};

export const getModalShownEvent = (settingName: string, context: string) =>
  dispatchEvent(EventType.ModalShown, settingName, context);

export const getConfirmEvent = (settingName: string, context: string) =>
  dispatchEvent(EventType.Confirm, settingName, context);

export const getCancelEvent = (settingName: string, context: string) =>
  dispatchEvent(EventType.Cancel, settingName, context);

export const getCloseModalEvent = (settingName: string, context: string) =>
  dispatchEvent(EventType.CloseModal, settingName, context);
