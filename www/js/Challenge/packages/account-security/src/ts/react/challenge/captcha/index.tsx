import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { RequestServiceDefault } from "../../../common/request";
import App from "./App";
import { LOG_PREFIX, USE_LIGHTBOX_MODAL } from "./app.config";
import { RenderChallenge } from "./interface";
import { EventServiceDefault } from "./services/eventService";
import { MetricsServiceDefault } from "./services/metricsService";

// Global instance since we do not need captcha parameters for instantiation.
const requestServiceDefault = new RequestServiceDefault();

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ActionType, ErrorCode } from "./interface";

/**
 * Renders the Captcha UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderChallenge: RenderChallenge = async ({
  containerId,
  actionType,
  appType,
  dataExchangeBlob,
  unifiedCaptchaId,
  renderInline,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}) => {
  const container = document.getElementById(containerId);
  if (container !== null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const metricsService = new MetricsServiceDefault(
      actionType,
      "FunCaptcha",
      appType,
      requestServiceDefault,
      unifiedCaptchaId,
    );

    // Query for captcha metadata, which is necessary to render the challenge.
    const metadata = await requestServiceDefault.captcha.getMetadata();
    if (metadata.isError) {
      metricsService.fireMetadataErrorEvent();
      // eslint-disable-next-line no-console
      console.error(
        LOG_PREFIX,
        `Got error code ${metadata.error?.toString() || "null"} fetching metadata`,
      );
      return false;
    }

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const eventService = new EventServiceDefault("FunCaptcha");

    // Set the captcha version.
    const captchaVersion = USE_LIGHTBOX_MODAL;

    // Render the app on the selected element.
    render(
      <App
        actionType={actionType}
        appType={appType}
        dataExchangeBlob={dataExchangeBlob}
        unifiedCaptchaId={unifiedCaptchaId}
        renderInline={renderInline}
        requestService={requestServiceDefault}
        metadataResponse={metadata.value}
        eventService={eventService}
        metricsService={metricsService}
        captchaVersion={captchaVersion}
        onChallengeDisplayed={onChallengeDisplayed}
        onChallengeCompleted={onChallengeCompleted}
        onChallengeInvalidated={onChallengeInvalidated}
        onModalChallengeAbandoned={onModalChallengeAbandoned}
      />,
      container,
    );
    return true;
  }

  // Return a Promise to better standardize our challenge interface.
  return Promise.resolve(false);
};
