import type { SduiErrorReporter, ReportSduiErrorAdditionalOptions } from "@rbx/sdui-core";
import type { AppPage, AppPageOrOverlay } from "../constants/pageConstants";
import { getSduiPageContext } from "../utils/sduiUtils";

type BaseErrorPayload = {
  errorName: string;
  errorMessage: string;
  options?: ReportSduiErrorAdditionalOptions;
};

export type PromptErrorPayload = BaseErrorPayload & {
  appPage: AppPage;
};

export type OverlayErrorPayload = BaseErrorPayload & {
  appPage: AppPageOrOverlay;
};

export const bindPromptErrorReporter =
  (reporter: SduiErrorReporter) => (payload: PromptErrorPayload | OverlayErrorPayload) => {
    reporter.reportSduiError(
      payload.errorName,
      payload.errorMessage,
      getSduiPageContext(payload.appPage),
      undefined,
      payload.options,
    );
  };
