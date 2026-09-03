import { getAbsoluteUrl } from "@rbx/core-scripts/util/url";
import { getSignupUrl } from "@rbx/navigation";
import { TSduiActionConfig, TSduiParsedActionConfig } from "../SduiActionParserRegistry";
import logSduiError, { SduiErrorNames } from "../../utils/logSduiError";
import { TAnalyticsContext, TSduiContext } from "../SduiTypes";

const openSignupParser = (
  _actionConfig: TSduiActionConfig,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TSduiParsedActionConfig => {
  if (!getSignupUrl) {
    const defaultSignupUrl = getAbsoluteUrl("/account/signupredir");
    logSduiError(
      SduiErrorNames.SduiActionOpenSignupInvalidGetSignupUrl,
      "getSignupUrl is not defined",
      sduiContext.pageContext,
    );
    return {
      linkPath: defaultSignupUrl,
    };
  }

  return {
    linkPath: getSignupUrl(),
  };
};

export default openSignupParser;
