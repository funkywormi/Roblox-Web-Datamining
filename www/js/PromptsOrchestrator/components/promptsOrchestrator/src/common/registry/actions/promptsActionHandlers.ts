import { ActionType, type SduiActionHandlerConfig } from "@rbx/sdui-core";
import { dismissPromptHandler } from "./dismissPromptHandler";
import { openPhoneUpsellHandler } from "./openPhoneUpsellHandler";
import { openEmailUpsellHandler } from "./openEmailUpsellHandler";
import { openFacialAgeEstimationUpsellHandler } from "./openFacialAgeEstimationUpsellHandler";

export const PROMPTS_ACTION_HANDLERS: Partial<Record<ActionType, SduiActionHandlerConfig>> = {
  [ActionType.DISMISS_PROMPT]: dismissPromptHandler,
  [ActionType.OPEN_PHONE_UPSELL_MODAL]: openPhoneUpsellHandler,
  [ActionType.OPEN_EMAIL_UPSELL_MODAL]: openEmailUpsellHandler,
  [ActionType.OPEN_FACIAL_AGE_ESTIMATION]: openFacialAgeEstimationUpsellHandler,
};
