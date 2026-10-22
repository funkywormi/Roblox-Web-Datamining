import React from "react";
import { RequestServiceDefault } from "../../../common/request";
import App from "./App";
import { TRANSLATION_NAMESPACES } from "./app.config";
import { RenderChallenge } from "./interface";
import { EventServiceDefault } from "./services/eventService";
import { MetricsServiceDefault } from "./services/metricsService";
import { mountChallenge, unmountChallenge } from "../challengeMount";

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ErrorCode, CaptchaMode } from "./interface";

export { preloadSensor } from "./containers/sensor";

// Global instance since we do not need challenge parameters for instantiation.
const requestServiceDefault = new RequestServiceDefault();

/**
 * Renders the CaptchaV2 Challenge UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = ({
  containerId,
  challengeId,
  appType,
  mode,
  renderInline,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}) => {
  const container = document.getElementById(containerId);
  if (container !== null) {
    // Remove any existing instances of the app.
    unmountChallenge(container);

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const eventService = new EventServiceDefault(challengeId);
    const metricsService = new MetricsServiceDefault(appType, requestServiceDefault);

    // Render the app on the selected element.
    mountChallenge(
      container,
      <App
        challengeId={challengeId}
        appType={appType}
        mode={mode}
        renderInline={renderInline}
        eventService={eventService}
        metricsService={metricsService}
        requestService={requestServiceDefault}
        onChallengeDisplayed={onChallengeDisplayed}
        onChallengeCompleted={onChallengeCompleted}
        onChallengeInvalidated={onChallengeInvalidated}
        onModalChallengeAbandoned={onModalChallengeAbandoned}
      />,
      TRANSLATION_NAMESPACES,
    );
    return true;
  }

  return false;
};
