import React, { useState } from "react";
import { Modal } from "@rbx/core-ui/legacy/react-style-guide";
import type { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { Icon } from "@rbx/foundation-ui";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import GoogleLogo from "../../shared/components/GoogleLogo";
import { loginFormStrings } from "../constants/loginConstants";
import {
  sendLoginOtherSignInOptionsClickEvent,
  sendLoginOtherSignInOptionsShownEvent,
  sendLoginSsoButtonClickEvent,
  sendLoginSsoButtonShownEvent,
} from "../services/eventService";
import {
  redirectToSsoProvider,
  type SsoIdentityProviderIds,
} from "../../shared/services/ssoRedirectService";
import { ssoProviderLabels } from "../../shared/constants/ssoConstants";
import { getAvailableSsoProviders } from "../../shared/utils/ssoProviderUtils";
import { legacyLoginTelemetry } from "../utils/loginTelemetry";

export type LegacyLoginSsoOptionsProps = {
  identityProviderIds: Readonly<SsoIdentityProviderIds>;
  translate: WithTranslationsProps["translate"];
};

const LegacyLoginSsoOptions = ({
  identityProviderIds,
  translate,
}: LegacyLoginSsoOptionsProps): React.JSX.Element | null => {
  const [isOpen, setIsOpen] = useState(false);
  const providers = getAvailableSsoProviders(identityProviderIds);

  // The modal only holds SSO, so the button would open an empty modal without a provider.
  if (providers.length === 0) {
    return null;
  }

  const title = translate(loginFormStrings.ActionOtherSignInOptions);
  const close = () => setIsOpen(false);
  const open = () => {
    sendLoginOtherSignInOptionsClickEvent();
    sendLoginOtherSignInOptionsShownEvent();
    providers.forEach(provider => sendLoginSsoButtonShownEvent(provider, "otherSignInOptions"));
    setIsOpen(true);
  };

  return (
    <React.Fragment>
      <button
        type="button"
        id="other-sign-in-options-button"
        className="btn-full-width btn-control-md other-sign-in-options-button"
        onClick={open}
      >
        {title}
      </button>
      <Modal className="legacy-login-sso-modal" show={isOpen} onHide={close} size="sm" centered>
        <Modal.Header title={title} onClose={close} />
        <Modal.Body>
          {providers.map(provider => (
            <button
              key={provider}
              type="button"
              className="btn-full-width btn-control-md legacy-login-sso-button"
              data-sso-provider={provider}
              onClick={() => {
                sendLoginSsoButtonClickEvent(provider, "otherSignInOptions");
                // SSO finishes in a popup and this page stays. An open modal keeps its scroll lock
                // and blocks scrolling in what the page shows next, such as the birthday modal.
                close();
                redirectToSsoProvider(
                  provider,
                  identityProviderIds,
                  EVENT_CONSTANTS.context.schematizedLoginForm,
                  legacyLoginTelemetry,
                );
              }}
            >
              {provider === "google" ? (
                <GoogleLogo />
              ) : (
                <Icon name="icon-filled-apple" size="Small" aria-hidden="true" />
              )}
              <span>{translate(ssoProviderLabels[provider])}</span>
            </button>
          ))}
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
};

export default LegacyLoginSsoOptions;
