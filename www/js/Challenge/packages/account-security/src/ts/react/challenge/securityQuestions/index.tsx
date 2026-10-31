import React from "react";
import "../../../../css/challenge/securityQuestions/securityQuestions.css";
import { RequestServiceDefault } from "../../../common/request";
import App from "./App";
import { TRANSLATION_NAMESPACES } from "./app.config";
import { RenderChallenge } from "./interface";
import { EventServiceDefault } from "./services/eventService";
import { MetricsServiceDefault } from "./services/metricsService";
import { mountChallenge, unmountChallenge } from "../challengeMount";

// Global instance since we do not need Security Questions parameters for
// instantiation.
const requestServiceDefault = new RequestServiceDefault();

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ErrorCode } from "./interface";

/**
 * Renders the Security Questions Challenge UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = ({
  containerId,
  userId,
  sessionId,
  appType,
  renderInline,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}) => {
  // Explicitly coerce user ID to string. Unlike some of the other challenge
  // services, the Security Questions API will reject requests that try to pass
  // user ID as a number; since user ID is (erroneously) stored as number across
  // much of the front-end, this coercion will prevent a common bug.
  // eslint-disable-next-line no-param-reassign
  userId = userId.toString();

  const container = document.getElementById(containerId);
  if (container !== null) {
    // Remove any existing instances of the app.
    unmountChallenge(container);

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const eventService = new EventServiceDefault(sessionId);
    const metricsService = new MetricsServiceDefault({ appType, requestServiceDefault });

    // Render the app on the selected element.
    mountChallenge(
      container,
      <App
        userId={userId}
        sessionId={sessionId}
        renderInline={renderInline}
        eventService={eventService}
        metricsService={metricsService}
        requestService={requestServiceDefault}
        onChallengeCompleted={onChallengeCompleted}
        onChallengeInvalidated={onChallengeInvalidated}
        onModalChallengeAbandoned={onModalChallengeAbandoned}
      />,
      TRANSLATION_NAMESPACES,
    );
    metricsService.fireInitializedEvent();
    return true;
  }

  return false;
};
