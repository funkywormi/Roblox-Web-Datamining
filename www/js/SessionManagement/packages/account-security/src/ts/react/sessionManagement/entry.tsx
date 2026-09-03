import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import Roblox from "Roblox";
import * as Interface from "./interface";
import { RequestServiceDefault } from "../../common/request";
import "../../../css/sessionManagement/sessionManagement.scss";
import App from "./App";
import { DEFAULT_NUM_SESSIONS_TO_DISPLAY } from "./app.config";
import { EventServiceDefault } from "./services/eventService";

// Global instance since we do not need session management parameters for instantiation.
const requestServiceDefault = new RequestServiceDefault();

/**
 * Renders the Session Management UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderComponent: Interface.RenderComponent = (
  sessionManagementParameters: Interface.SessionManagementParameters,
) => {
  const rootElement = document.getElementById(sessionManagementParameters.containerId);
  if (rootElement !== null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(rootElement);

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const eventService = new EventServiceDefault();

    const userHasConsoleSession = sessionManagementParameters.userHasConsoleSession || false;
    // Render the app on the selected element.
    render(
      <App
        eventService={eventService}
        requestService={requestServiceDefault}
        numSessionsToDisplay={DEFAULT_NUM_SESSIONS_TO_DISPLAY}
        userHasConsoleSession={userHasConsoleSession}
      />,
      rootElement,
    );
    return true;
  }
  return false;
};

// This type constraint (`typeof Interface`) ensures that any changes made to
// the shared interface types for this component get reflected in its compiled
// definition.
const SessionManagement: typeof Interface = {
  renderComponent,
};

Object.assign(Roblox, {
  SessionManagement,
});
