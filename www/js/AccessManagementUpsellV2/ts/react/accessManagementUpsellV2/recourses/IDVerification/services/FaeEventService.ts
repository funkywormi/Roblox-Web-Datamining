import { eventStreamService } from 'core-roblox-utilities';
import FAEEventConstants from '../constants/eventConstants';

const sendEventWithSilentError = (
  eventName: string,
  context: string,
  additionalProperties: Record<string, string | number>
) => {
  try {
    eventStreamService.sendEventWithTarget(eventName, context, additionalProperties);
  } catch (error) {
    // silent error
  }
};

export const sendFAEModalShownEvent = (context: string, sessionId: string, field: string) => {
  sendEventWithSilentError(FAEEventConstants.eventName.authModalShown, context, {
    state: sessionId,
    field,
    os_time: Date.now()
  });
};

export const sendFAEButtonClickEvent = (
  context: string,
  sessionId: string,
  btn: string,
  origin: string
) => {
  sendEventWithSilentError(FAEEventConstants.eventName.authButtonClick, context, {
    btn,
    state: sessionId,
    origin,
    os_time: Date.now()
  });
};

export const sendFAEFormInteractionEvent = (context: string, sessionId: string, field: string) => {
  sendEventWithSilentError(FAEEventConstants.eventName.authFormInteraction, context, {
    state: sessionId,
    field
  });
};

export const sendFAEMessageShownEvent = (
  context: string,
  sessionId: string,
  field: string,
  errorCode: string
) => {
  sendEventWithSilentError(FAEEventConstants.eventName.authMsgShown, context, {
    state: sessionId,
    field, // webFaeStatus
    errorCode // Success, Failure, etc
  });
};

export const sendFAEPageLoadEvent = (context: string, sessionId: string, origin: string) => {
  sendEventWithSilentError(FAEEventConstants.eventName.authPageLoad, context, {
    state: sessionId,
    origin,
    os_time: Date.now()
  });
};
