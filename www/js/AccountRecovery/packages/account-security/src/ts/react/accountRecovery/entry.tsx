import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import Roblox from "Roblox";
import * as Interface from "./interface";
import { RequestServiceDefault } from "../../common/request";
import App from "./App";
import "../../../css/common/modernCardContainer.scss";
import "../../../css/common/modernCardCTARow.scss";
import "../../../css/accountRecovery/accountRecovery.scss";
import { EventServiceDefault } from "./services/eventservice";

// Global instance since we do not need session management parameters for instantiation.
const requestServiceDefault = new RequestServiceDefault();

export const renderComponent: Interface.RenderComponent = (containerId: string) => {
  const rootElement = document.getElementById(containerId);
  if (rootElement !== null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(rootElement);

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const eventService = new EventServiceDefault();

    // Render the app on the selected element.
    render(<App requestService={requestServiceDefault} eventService={eventService} />, rootElement);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(() => renderComponent(containerId));
  }
};

// This type constraint (`typeof Interface`) ensures that any changes made to
// the shared interface types for this component get reflected in its compiled
// definition.
const AccountRecovery: typeof Interface = {
  renderComponent,
};

Object.assign(Roblox, {
  AccountRecovery,
});
