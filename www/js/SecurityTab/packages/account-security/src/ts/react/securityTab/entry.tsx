import Roblox, { CurrentUser } from "Roblox";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import "../../../css/securityTab/securityTab.scss";
import { RequestServiceDefault } from "../../common/request";
import App from "./App";
import * as Interface from "./interface";
import { EventServiceDefault } from "./services/eventService";

// Global instance since we do not need security tab parameters for instantiation.
const requestServiceDefault = new RequestServiceDefault();

/**
 * Renders the Security Tab UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderComponent: Interface.RenderComponent = (containerId: string) => {
  const rootElement = document.getElementById(containerId);
  if (rootElement !== null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(rootElement);

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const eventService = new EventServiceDefault();

    // Render the app on the selected element.
    render(
      <App
        eventService={eventService}
        requestService={requestServiceDefault}
        isUnder13={CurrentUser.isUnder13}
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
const SecurityTab: typeof Interface = {
  renderComponent,
};

Object.assign(Roblox, {
  SecurityTab,
});
