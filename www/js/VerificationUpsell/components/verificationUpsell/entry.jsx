import "./src/main.css";
import "@rbx/authentication/verificationUpsellModal/css/verificationUpsellModal.css";
import React from "react";
import { unmountComponentAtNode } from "react-dom";
import Roblox from "Roblox";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { ready } from "@rbx/core-scripts/legacy/core-utilities";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import AgeEstimationPromptApp from "@rbx/authentication/verificationUpsellModal/AgeEstimationPromptApp";
import App from "@rbx/authentication/verificationUpsellModal/App";
import {
  ageEstimationPromptRootElementId,
  contactMethodPromptRootElementId,
  emailRootElementId,
  phoneRootElementId,
  PHONE_UPSELL_TRANSLATION_NAMESPACES,
  translation,
} from "@rbx/authentication/verificationUpsellModal/app.config";
import ContactMethodPromptApp from "@rbx/authentication/verificationUpsellModal/ContactMethodPromptApp";
import {
  handleUserEmailUpsellAtBuyRobux,
  handleUserEmailUpsellAtLogout,
  handleUserEmailUpsellAtPremiumSubscription,
  handleUserEmailUpsellOnHomePage,
  handleUserEmailVerificationRequiredByBan,
  handleUserEmailVerificationRequiredByPurchaseWarning,
  openLogoutEmailUpsellModal,
} from "@rbx/authentication/verificationUpsellModal/emailUpsellModal/services/emailServices";
import PhoneUpsellApp from "@rbx/authentication/verificationUpsellModal/PhoneUpsellApp";

const renderPhoneUpsell = ({
  onClose,
  origin,
  existingPhoneNumber,
  addPhoneRequireLegalTextCheckbox,
  addPhoneHeadingKey,
  addPhoneDescriptionKey,
  addPhoneLegalTextKey,
  addPhoneButtonKey,
  beforeSuccess,
  containerId,
  renderInWebview,
} = {}) => {
  ready(() => {
    // using phoneRootElement is a bridge solution before refactoring the email
    // upsell logic.
    const element = document.getElementById(containerId ?? phoneRootElementId);
    if (element) {
      unmountComponentAtNode(element);
      renderWithErrorBoundary(
        <TranslationProviderSCC namespaces={PHONE_UPSELL_TRANSLATION_NAMESPACES}>
          <PhoneUpsellApp
            onClose={onClose}
            origin={origin}
            existingPhoneNumber={existingPhoneNumber}
            addPhoneRequireLegalTextCheckbox={addPhoneRequireLegalTextCheckbox}
            addPhoneHeadingKey={addPhoneHeadingKey}
            addPhoneDescriptionKey={addPhoneDescriptionKey}
            addPhoneLegalTextKey={addPhoneLegalTextKey}
            addPhoneButtonKey={addPhoneButtonKey}
            beforeSuccess={beforeSuccess}
            renderInWebview={renderInWebview}
          />
        </TranslationProviderSCC>,
        element,
      );
    }
  });
};

const renderEmailUpsell = onClose => {
  ready(() => {
    const element = document.getElementById(emailRootElementId);
    if (element) {
      unmountComponentAtNode(element);
      renderWithErrorBoundary(
        <TranslationProvider config={translation}>
          <App />
        </TranslationProvider>,
        element,
      );
      handleUserEmailUpsellOnHomePage(onClose);
    }
  });
};
const renderContactMethodPromptModal = ({ origin, section }) => {
  ready(() => {
    const element = document.getElementById(contactMethodPromptRootElementId);
    if (element) {
      unmountComponentAtNode(element);
      renderWithErrorBoundary(
        <TranslationProvider config={translation}>
          <ContactMethodPromptApp origin={origin} section={section} />
        </TranslationProvider>,
        element,
      );
    }
  });
};

const renderAgeEstimationPromptModal = () => {
  ready(() => {
    const element = document.getElementById(ageEstimationPromptRootElementId);
    if (element) {
      unmountComponentAtNode(element);
      renderWithErrorBoundary(
        <TranslationProvider config={translation}>
          <AgeEstimationPromptApp />
        </TranslationProvider>,
        element,
      );
    }
  });
};

Roblox.UpsellService = {
  renderEmailUpsell,
  renderPhoneUpsell,
  renderContactMethodPromptModal,
  renderAgeEstimationPromptModal,
};

// Expose service to external apps
Roblox.EmailVerificationService = {
  handleUserEmailUpsellAtLogout,
  handleUserEmailUpsellAtBuyRobux,
  handleUserEmailUpsellOnHomePage,
  handleUserEmailVerificationRequiredByPurchaseWarning,
  handleUserEmailUpsellAtPremiumSubscription,
  handleUserEmailVerificationRequiredByBan,
  openLogoutEmailUpsellModal,
};

// TODO: non-hompeage upsells like logout and pre-purchase upsells depend on
// this render call.
// To be cleaned up - https://jira.rbx.com/browse/AA-351
ready(() => {
  if (document.getElementById(emailRootElementId)) {
    renderWithErrorBoundary(
      <TranslationProvider config={translation}>
        <App />
      </TranslationProvider>,
      document.getElementById(emailRootElementId),
    );
  }
});
