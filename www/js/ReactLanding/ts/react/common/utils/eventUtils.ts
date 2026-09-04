// Duplicated from Roblox.CoreScripts.WebApp/js/utilities/boundAuthTokens/utils/eventUtil.ts.
// TODO: Can this login/signup-specific logic be unified with the CoreScripts logic?
import { eventStreamService } from 'core-roblox-utilities';
import EVENT_CONSTANTS from '../constants/eventsConstants';

export const sendSAISuccessEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.saiCreated,
    EVENT_CONSTANTS.context.hba,
    {}
  );
};

type SaiGenerationErrorInfo = {
  message: string;
  // TODO: Add discrete error kinds here...
};

export const sendSAIMissingEvent = (errorInfo: SaiGenerationErrorInfo): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.eventName.saiMissing,
    EVENT_CONSTANTS.context.hba,
    {
      messageRaw: errorInfo.message
    }
  );
};

export default {
  sendSAISuccessEvent,
  sendSAIMissingEvent
};
