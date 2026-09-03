export const PROMPTS_APPLICATION_NAME = "prompts";

export const PromptErrorName = {
  UncaughtRenderError: `${PROMPTS_APPLICATION_NAME}:UncaughtRenderError`,
  ImpressionEmitterError: `${PROMPTS_APPLICATION_NAME}:ImpressionEmitterError`,
  ImpressionPostError: `${PROMPTS_APPLICATION_NAME}:ImpressionPostError`,
  UpsellServiceDoesNotExist: `${PROMPTS_APPLICATION_NAME}:UpsellServiceDoesNotExist`,
  FailedToFetchVoicePolicy: `${PROMPTS_APPLICATION_NAME}:FailedToFetchVoicePolicy`,
  AccessManagementUpsellV2ServiceDoesNotExist: `${PROMPTS_APPLICATION_NAME}:AccessManagementUpsellV2ServiceDoesNotExist`,
  FacialAgeEstimationUpsellError: `${PROMPTS_APPLICATION_NAME}:FacialAgeEstimationUpsellError`,
} as const;
