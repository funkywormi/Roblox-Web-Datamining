import type { SduiErrorReporter, ReportSduiErrorAdditionalOptions } from "@rbx/sdui-core";
import type { AppPage } from "../constants/pageConstants";
import { getSduiPageContext } from "../utils/sduiUtils";

export type PromptErrorPayload = {
  errorName: string;
  errorMessage: string;
  appPage: AppPage;
  options?: ReportSduiErrorAdditionalOptions;
};

export const bindPromptErrorReporter =
  (reporter: SduiErrorReporter) => (payload: PromptErrorPayload) => {
    reporter.reportSduiError(
      payload.errorName,
      payload.errorMessage,
      getSduiPageContext(payload.appPage),
      undefined,
      payload.options,
    );
  };
