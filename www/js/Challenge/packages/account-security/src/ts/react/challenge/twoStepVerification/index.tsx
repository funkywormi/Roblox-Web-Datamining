import "../../../../css/challenge/twoStepVerification/twoStepVerification.css";
import "../../../../css/common/inlineChallenge.css";
import { RequestServiceDefault } from "../../../common/request";
import App from "./App";
import { TRANSLATION_NAMESPACES } from "./app.config";
import { RenderChallenge } from "./interface";
import { EventServiceDefault } from "./services/eventService";
import { MetricsServiceDefault } from "./services/metricsService";
import "../../../../css/tailwind.css";
import { mountChallenge, unmountChallenge } from "../challengeMount";

// Global instance since we do not need 2SV parameters for instantiation.
const requestServiceDefault = new RequestServiceDefault();

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ActionType, ErrorCode, MediaType } from "./interface";

/**
 * Renders the 2SV Challenge UI for a given set of parameters. Returns whether
 * the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = ({
  containerId,
  userId,
  challengeId,
  appType,
  actionType,
  renderInline,
  shouldModifyBrowserHistory,
  shouldShowRememberDeviceCheckbox,
  delayParameters,
  recoveryParameters,
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
    const eventService = new EventServiceDefault(challengeId, userId);
    const metricsService = new MetricsServiceDefault(actionType, appType, requestServiceDefault);

    // Render the app on the selected element.
    mountChallenge(
      container,
      <App
        userId={userId}
        challengeId={challengeId}
        actionType={actionType}
        renderInline={renderInline}
        shouldModifyBrowserHistory={shouldModifyBrowserHistory || false}
        shouldShowRememberDeviceCheckbox={shouldShowRememberDeviceCheckbox}
        eventService={eventService}
        metricsService={metricsService}
        requestService={requestServiceDefault}
        onChallengeCompleted={onChallengeCompleted}
        onChallengeInvalidated={onChallengeInvalidated}
        onModalChallengeAbandoned={onModalChallengeAbandoned}
        delayParameters={delayParameters}
        recoveryParameters={recoveryParameters}
      />,
      TRANSLATION_NAMESPACES,
    );
    eventService.sendChallengeInitializedEvent();
    metricsService.fireInitializedEvent();
    return true;
  }

  return false;
};
