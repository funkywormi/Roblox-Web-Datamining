import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { document, window } from "@rbx/core-lib/browser";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import ready from "@rbx/core-scripts/util/ready";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { getCurrentUser, User } from "@rbx/www-common/user";
import "../../../css/common/highlight.css";
import "../../../css/common/modalModern.css";
import "../../../css/common/spinner.css";
import { PromptAssignment, PromptType } from "../../common/request/types/promptAssignments";
import AccountSecurityPromptRoot from "./AccountSecurityPromptRoot";
import App from "./App";
import { ROOT_ELEMENT_ID, PROVIDER_NAMESPACES } from "./app.config";
import { promptRequestService } from "./requestService";
import { EventServiceDefault } from "./services/eventService";

/**
 * Renders the account security prompt for one assignment, skipping the fetch. Used by the
 * `Roblox.AccountSecurityPrompt.render` debug hook.
 */
const renderApp = (
  promptAssignment: PromptAssignment,
  username: string,
  isUserUnder13: boolean,
) => {
  const rootElement = document?.getElementById(ROOT_ELEMENT_ID);
  if (rootElement != null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(rootElement);

    // Instantiate services externally to the app, which will offer future
    // flexibility (e.g. for mocking).
    const eventService = new EventServiceDefault(promptAssignment.promptType);

    // Render the app on the selected element.
    render(
      <TranslationProviderSCC namespaces={PROVIDER_NAMESPACES}>
        <App
          promptAssignment={promptAssignment}
          username={username}
          isUserUnder13={isUserUnder13}
          eventService={eventService}
          requestService={promptRequestService}
        />
      </TranslationProviderSCC>,
      rootElement,
    );
  }
};

/**
 * Fetches the current user's assignments and renders the first one allowed on this page.
 */
const renderPrompt = (currentUser: User) => {
  const rootElement = document?.getElementById(ROOT_ELEMENT_ID);
  if (rootElement == null) {
    return;
  }
  render(
    <TranslationProviderSCC namespaces={PROVIDER_NAMESPACES}>
      <AccountSecurityPromptRoot
        href={window?.location.href ?? ""}
        username={currentUser.userName ?? ""}
        isUserUnder13={currentUser.isUnder13}
        requestService={promptRequestService}
      />
    </TranslationProviderSCC>,
    rootElement,
  );
};

// Sanity-check that the current user is authenticated and not accessing the
// website using an app-based web view (even to render prompts manually via the
// JavaScript console).
const currentUser = getCurrentUser();
if (currentUser != null && getDeviceMeta()?.appType === "unknown") {
  // Add some variables to the global `Roblox` object for manual testing via the
  // JavaScript console.
  if (window?.Roblox != null) {
    Object.assign(window.Roblox, {
      AccountSecurityPrompt: {
        render: renderApp,
        PromptType,
      },
    });
  }
  // The page loads this bundle's translations after it. The provider reads them only once.
  ready(() => renderPrompt(currentUser));
}
