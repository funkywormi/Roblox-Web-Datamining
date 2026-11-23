import { PromptErrorName } from "../constants";
import type { AppPageOrOverlay } from "../../constants/pageConstants";
import type { OverlayErrorPayload } from "../promptErrorPayload";

export type PromptRenderErrorInput = {
  appPage: AppPageOrOverlay;
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
  }: PromptRenderErrorInput): OverlayErrorPayload => ({
    errorName: PromptErrorName.UncaughtRenderError,
    errorMessage,
    appPage,
    options: { additionalContext: { componentType } },
  }),
};
