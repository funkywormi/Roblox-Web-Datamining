import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { RequestServiceDefault } from "../../../common/request";
import App from "./App";
import { LOG_PREFIX } from "./app.config";
import { RenderChallenge } from "./interface";
import { EventServiceDefault } from "./services/eventService";
import { MetricsServiceDefault } from "./services/metricsService";

// Global instance since we do not need challenge parameters for instantiation.
const requestServiceDefault = new RequestServiceDefault();

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ErrorCode } from "./interface";

/**
 * Renders the Turnstile Challenge UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = async ({
  containerId,
  challengeId,
  appType,
  renderInline,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}) => {
  const container = document.getElementById(containerId);
  if (container === null) {
    return false;
  }

  // Remove any existing instances of the app.
  unmountComponentAtNode(container);

  // Query for the Turnstile site key, which is necessary to render the widget.
  // The site key is resolved from the session, so the challenge ID must be
  // passed through to the metadata request.
  const metadata = await requestServiceDefault.turnstile.getMetadata(challengeId);
  if (metadata.isError) {
    // eslint-disable-next-line no-console
    console.error(
      LOG_PREFIX,
      `Got error code ${metadata.error?.toString() || "null"} fetching metadata`,
    );
    return false;
  }

  // Instantiate services externally to the app, which will offer future
  // flexibility (e.g. for mocking).
  const eventService = new EventServiceDefault(challengeId);
  const metricsService = new MetricsServiceDefault(appType, requestServiceDefault);

  // Render the app on the selected element.
  render(
    <App
      challengeId={challengeId}
      appType={appType}
      siteKey={metadata.value.cloudflare_turnstile_site_key}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestServiceDefault}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
    />,
    container,
  );
  return true;
};
