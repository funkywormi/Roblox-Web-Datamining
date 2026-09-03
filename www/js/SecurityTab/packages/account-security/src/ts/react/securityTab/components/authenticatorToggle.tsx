import React from "react";

import classNames from "classnames";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import { MediaType } from "../../challenge/twoStepVerification";

type Props = {
  unlockPinAndToggleAuthenticator: (emailVerified: boolean) => void;
};

const AuthenticatorToggle: React.FC<Props> = ({ unlockPinAndToggleAuthenticator }: Props) => {
  const {
    state: { resources, enabledMediaTypes, mySettingsInfo },
  } = useSecurityTabContext();

  /*
   * Event Handlers
   */

  const isEmailVerified = () =>
    mySettingsInfo !== null && mySettingsInfo.IsEmailOnFile && mySettingsInfo.IsEmailVerified;

  /*
   * Component Markup
   */

  const isAuthenticatorEnabled = () => {
    return enabledMediaTypes.includes(MediaType.Authenticator);
  };

  const toggleClassName = classNames("btn-toggle receiver-destination-type-toggle", {
    on: isAuthenticatorEnabled(),
  });

  return (
    <div className="section-content notifications-section">
      <button
        type="button"
        id="2sv-authenticator-toggle"
        role="switch"
        aria-checked={isAuthenticatorEnabled()}
        className={toggleClassName}
        aria-describedby="2sv-authenticator-disabled-description 2sv-authenticator-enabled-description"
        onClick={() => unlockPinAndToggleAuthenticator(isEmailVerified())}
      >
        <span className="toggle-flip" />
        <span id="toggle-on" className="toggle-on" />
        <span id="toggle-off" className="toggle-off" />
      </button>
      <div className="security-2svsetting-label btn-toggle-label">
        <label htmlFor="2sv-authenticator-toggle" className="btn-toggle-label">
          {resources.Label.AuthenticatorTwoStepVerificationCodes}
        </label>
        <div className="rbx-divider" />
        <div
          className="text-description"
          id="2sv-authenticator-disabled-description"
          style={{
            display: isAuthenticatorEnabled() ? "none" : undefined,
          }}
        >
          {resources.Label.AuthenticatorDisabledHelpText}
        </div>
        <div
          className="text-description"
          id="2sv-authenticator-enabled-description"
          style={{
            display: isAuthenticatorEnabled() ? undefined : "none",
          }}
        >
          {resources.Label.AuthenticatorHelpText}
        </div>
      </div>
    </div>
  );
};

export default AuthenticatorToggle;
