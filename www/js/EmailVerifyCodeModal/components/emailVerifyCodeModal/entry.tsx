import "./src/main.css";
import Roblox from "Roblox";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import EmailVerifyCodeModalContainer from "@rbx/authentication/emailVerifyCodeModal/containers/EmailVerifyCodeModalContainer";
import { EmailVerifyCodeModalStateProvider } from "@rbx/authentication/emailVerifyCodeModal/store/emailVerifyCodeModalStoreContext";
import { EmailVerifyCodeModalParams } from "@rbx/authentication/emailVerifyCodeModal/interface";
import { TRANSLATION_NAMESPACES } from "@rbx/authentication/emailVerifyCodeModal/translation.config";

export const renderEmailVerifyCodeModal = ({
  containerId,
  codeLength,
  onEmailCodeEntered,
  onComplete,
  onModalAbandoned,
  enterEmailTitle,
  enterEmailDescription,
  enterCodeTitle,
  enterCodeDescription,
  legalCheckboxLabel,
  origin,
  translate,
  isChangeEmailEnabled,
  renderInWebview,
}: EmailVerifyCodeModalParams): boolean => {
  const container = document.getElementById(containerId);
  if (container != null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);
    render(
      <TranslationProviderSCC namespaces={TRANSLATION_NAMESPACES}>
        <EmailVerifyCodeModalStateProvider>
          <EmailVerifyCodeModalContainer
            containerId={containerId}
            codeLength={codeLength}
            onEmailCodeEntered={onEmailCodeEntered}
            onModalAbandoned={onModalAbandoned}
            legalCheckboxLabel={legalCheckboxLabel}
            onComplete={onComplete}
            enterEmailTitle={enterEmailTitle}
            enterEmailDescription={enterEmailDescription}
            enterCodeTitle={enterCodeTitle}
            enterCodeDescription={enterCodeDescription}
            origin={origin}
            translate={translate}
            isChangeEmailEnabled={isChangeEmailEnabled}
            renderInWebview={renderInWebview}
          />
        </EmailVerifyCodeModalStateProvider>
      </TranslationProviderSCC>,
      container,
    );
    return true;
  }
  return false;
};

const EmailVerifyCodeModalService = {
  renderEmailVerifyCodeModal,
};

// EmailVerifyCodeModalService needs to be assigned to Roblox, as it will be used in other
// flows where veryfing a code from email is necessary, such as making adjustments to account
// settings, so we will need to render this modal on multiple pages
Object.assign(Roblox, {
  EmailVerifyCodeModalService,
});

export default renderEmailVerifyCodeModal;
