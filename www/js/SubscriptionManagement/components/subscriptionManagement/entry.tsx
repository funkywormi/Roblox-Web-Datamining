import './src/main.css';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Roblox from 'Roblox';
import * as Interface from '@rbx/subscriptions/ts/react/subscriptionManagement/interface';
import App from '@rbx/subscriptions/ts/react/subscriptionManagement/App';

/**
 * Renders the Subscriptions Tab UI for a given set of parameters.
 * Returns whether the UI could be successfully rendered.
 */
export const renderComponent: Interface.RenderComponent = (containerId: string) => {
  const rootElement = document.getElementById(containerId);
  if (rootElement !== null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(rootElement);

    // Render the app on the selected element.
    render(<App />, rootElement);
    return true;
  }
  return false;
};

// This type constraint (`typeof Interface`) ensures that any changes made to
// the shared interface types for this component get reflected in its compiled
// definition.
const SubscriptionManagement: typeof Interface = {
  renderComponent
};

Object.assign(Roblox, {
  SubscriptionManagement
});
