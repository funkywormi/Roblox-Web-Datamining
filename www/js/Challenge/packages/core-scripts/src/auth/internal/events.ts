import { sendEventWithTarget } from "../../event-stream";
import { SaiGenerationErrorInfo } from "./types";

// BAT events live in @rbx/www-common/auth alongside boundAuth.
const constants = {
  eventName: {
    saiCreated: "saiCreated",
    saiMissing: "saiMissing",
  },
  context: {
    hba: "hba",
  },
};

export const sendSAISuccessEvent = (): void => {
  sendEventWithTarget(constants.eventName.saiCreated, constants.context.hba, {});
};

export const sendSAIMissingEvent = (errorInfo: SaiGenerationErrorInfo): void => {
  sendEventWithTarget(constants.eventName.saiMissing, constants.context.hba, {
    messageRaw: errorInfo.message,
  });
};
