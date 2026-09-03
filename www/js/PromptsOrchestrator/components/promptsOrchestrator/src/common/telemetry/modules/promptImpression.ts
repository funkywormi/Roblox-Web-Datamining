import { PromptErrorName } from "../constants";
import { generateErrorMessage } from "../../utils/errorMessageUtils";
import type { AppPage } from "../../constants/pageConstants";
import type { PromptErrorPayload } from "../promptErrorPayload";

export type PromptImpressionErrorInput = {
  appPage: AppPage;
  promptType?: string;
  promptId?: string;
  errorMessage: string;
};

const buildPromptImpressionError = (
  errorName: string,
  { appPage, promptType, promptId, errorMessage }: PromptImpressionErrorInput,
): PromptErrorPayload => {
  const formattedErrorMessage = generateErrorMessage({
    tags: { appPage, promptType, promptId },
    errorMessage,
  });

  return {
    errorName,
    errorMessage: formattedErrorMessage,
    appPage,
    options: {
      additionalTags: promptType !== undefined ? { promptType } : undefined,
      additionalContext: { promptId },
    },
  };
};

export const impressionErrors = {
  /**
   * Reports a failed impression POST
   */
  post: (input: PromptImpressionErrorInput) =>
    buildPromptImpressionError(PromptErrorName.ImpressionPostError, input),
  /**
   * Generic error when the impression emitter throws
   */
  emitter: (input: PromptImpressionErrorInput) =>
    buildPromptImpressionError(PromptErrorName.ImpressionEmitterError, input),
};
