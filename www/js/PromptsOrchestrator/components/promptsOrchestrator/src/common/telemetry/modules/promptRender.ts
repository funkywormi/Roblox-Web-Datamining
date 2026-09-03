import { PromptErrorName } from "../constants";
import type { AppPage } from "../../constants/pageConstants";
import type { PromptErrorPayload } from "../promptErrorPayload";

export type PromptRenderErrorInput = {
  appPage: AppPage;
  componentType: string;
  errorMessage: string;
};

export const renderErrors = {
  /**
   * A render-time exception caught by the prompt error boundary.
   */
  uncaught: ({
    appPage,
    componentType,
    errorMessage,
  }: PromptRenderErrorInput): PromptErrorPayload => ({
    errorName: PromptErrorName.UncaughtRenderError,
    errorMessage,
    appPage,
    options: { additionalContext: { componentType } },
  }),
};
