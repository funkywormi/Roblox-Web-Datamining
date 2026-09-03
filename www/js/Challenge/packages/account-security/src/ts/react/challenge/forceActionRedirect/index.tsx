import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { withTranslations } from "react-utilities";
import "../../../../css/common/modalModern.scss";
import "../../../../css/common/spinner.scss";
import { ForceActionRedirect } from "@rbx/generic-challenge-types";
import App from "./App";
import { getForceActionRedirectChallengeConfig } from "./app.config";
import { DelayParameters } from "../twoStepVerification/delay/types";

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
const { ErrorCode, ForceActionRedirectChallengeType } = ForceActionRedirect;
export { ErrorCode, ForceActionRedirectChallengeType };
export * from "./app.config";

/**
 * Renders the Force Authenticator Challenge UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderChallenge: ForceActionRedirect.RenderChallenge = ({
  containerId,
  renderInline,
  forceActionRedirectChallengeType,
  headerTranslationKey,
  bodyTranslationKey,
  actionTranslationKey,
  onModalChallengeAbandoned,
  onChallengeAbandoned,
  delayParameters,
}) => {
  const container = document.getElementById(containerId);
  // The types need to be fixed in generic-challenge-types. But no time so we go fast.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const delayParametersTyped = delayParameters as DelayParameters | undefined;

  // Retrieve config specific for the forceActionRedirectChallengeType.
  const forceActionRedirectChallengeConfig = getForceActionRedirectChallengeConfig({
    forceActionRedirectChallengeType,
    headerTranslationKey,
    bodyTranslationKey,
    actionTranslationKey,
    delayParameters: delayParametersTyped,
  });

  if (container !== null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);

    // Wrapping with translations needs to be done here as translationConfig
    // can vary based upon forceActionRedirectChallengeType.
    const AppWithTranslations = withTranslations(
      App,
      forceActionRedirectChallengeConfig.translationConfig,
    );

    // Render the app on the selected element.
    render(
      <AppWithTranslations
        forceActionRedirectChallengeConfig={forceActionRedirectChallengeConfig}
        renderInline={renderInline}
        onModalChallengeAbandoned={onModalChallengeAbandoned}
        onChallengeAbandoned={onChallengeAbandoned}
        delayParameters={delayParametersTyped}
        bodyTranslationKey={bodyTranslationKey}
      />,
      container,
    );
    return true;
  }

  return false;
};
