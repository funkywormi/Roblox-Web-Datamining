import type { SduiErrorReporter } from "../types";

export const noOpErrorReporter: SduiErrorReporter = {
  reportSduiError(errorName, errorMessage, pageContext, dimensions) {
    // eslint-disable-next-line no-console
    console.log("[noOpErrorReporter] reportSduiError", {
      errorName,
      errorMessage,
      pageContext,
      dimensions,
    });
  },
};
