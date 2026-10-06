import React from "react";
import { Loading } from "@rbx/core-ui/legacy/react-style-guide";
import { accountSwitcherConfirmationModalContainer } from "../../reactLanding/constants/signupConstants";
import CountryRatingLogos from "../../reactLanding/components/CountryRatingLogos";
import ForgotCredentialLink from "./ForgotCredentialLink";
import LoginAccountSwitcher from "./LoginAccountSwitcher";
import LoginAlternative from "./LoginAlternative";
import LoginChallengeOverlays from "./LoginChallengeOverlays";
import LoginForm from "./LoginForm";
import MagicLinkLoginErrorModal from "./MagicLinkLoginErrorModal";
import SecurityNotificationModal from "./SecurityNotificationModal";
import SignupLink from "./SignupLink";
import StudioLegalLinks from "./StudioLegalLinks";
import { containerConstants } from "../constants/loginConstants";
import type { LoginControllerViewModel } from "../types/loginControllerTypes";

export type LoginLegacyViewProps = {
  viewModel: LoginControllerViewModel;
};

const LoginLegacyView = ({ viewModel }: LoginLegacyViewProps): React.JSX.Element => {
  if (viewModel.status === "loading") {
    return <Loading />;
  }

  const {
    loginBaseContainerClass,
    loginBaseAttributes,
    accountSwitcherProps,
    loginForm,
    challengeOverlaysProps,
    isStudioWebView,
    isLoginBackgroundImageEnabled,
    loginBackgroundClass,
    shouldDisplayBrazilRatingLogo,
    translate,
  } = viewModel;

  const loginBase = (
    <div id="login-base" className={loginBaseContainerClass} {...loginBaseAttributes}>
      {accountSwitcherProps && <LoginAccountSwitcher {...accountSwitcherProps} />}
      {loginForm && (
        <div
          className="section-content login-section"
          hidden={loginForm.isHidden}
          data-testid="login-password-form"
        >
          <h1 className="login-header">{loginForm.headerText}</h1>
          <LoginForm {...loginForm.formProps} />
          <ForgotCredentialLink
            credentialValue={loginForm.forgotCredentialValue}
            translate={translate}
          />
          <LoginAlternative {...loginForm.alternativeProps} />
          <div id="crossDeviceLoginDisplayCodeModal-container" />
          <div id={containerConstants.otpLoginContainer} />
          <div id={accountSwitcherConfirmationModalContainer} />
          {loginForm.showSecurityNotificationModal && (
            <SecurityNotificationModal
              credentialValue={loginForm.forgotCredentialValue}
              translate={translate}
            />
          )}
          <MagicLinkLoginErrorModal
            isOpen={loginForm.isMagicLinkLoginErrorModalOpen}
            onClose={loginForm.onMagicLinkLoginErrorModalClose}
            translate={translate}
          />
          <SignupLink />
          {isStudioWebView && <StudioLegalLinks />}
        </div>
      )}
      <LoginChallengeOverlays {...challengeOverlaysProps} />
    </div>
  );

  const countryRatingLogos = (
    <div>
      <CountryRatingLogos
        shouldDisplayBrazilRatingLogo={shouldDisplayBrazilRatingLogo}
        shouldDisplayItalyRatingLogo={false}
        translate={translate}
      />
    </div>
  );

  if (isLoginBackgroundImageEnabled && loginBackgroundClass) {
    return (
      <div id="background-image" className={`background-image ${loginBackgroundClass}`}>
        <div className="login-content-wrapper">
          {loginBase}
          {countryRatingLogos}
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {loginBase}
      {countryRatingLogos}
    </React.Fragment>
  );
};

export default LoginLegacyView;
