import React from "react";
import { Loading } from "@rbx/core-ui/legacy/react-style-guide";
import { accountSwitcherConfirmationModalContainer } from "../../reactLanding/constants/signupConstants";
import ForgotCredentialLink from "./ForgotCredentialLink";
import LoginAccountSwitcher from "./LoginAccountSwitcher";
import LegacyLoginSsoOptions from "./LegacyLoginSsoOptions";
import LoginAlternative from "./LoginAlternative";
import LoginForm from "./LoginForm";
import MagicLinkLoginErrorModal from "./MagicLinkLoginErrorModal";
import SecurityNotificationModal from "./SecurityNotificationModal";
import SignupLink from "./SignupLink";
import StudioLegalLinks from "./StudioLegalLinks";
import { containerConstants } from "../constants/loginConstants";
import { ssoIdentityProviderIds } from "../../shared/constants/ssoConstants";
import type { LoginControllerViewModel } from "../types/loginControllerTypes";

export type LoginLegacyViewProps = {
  viewModel: LoginControllerViewModel;
};

const LoginLegacyView = ({ viewModel }: LoginLegacyViewProps): React.JSX.Element => {
  if (viewModel.status === "loading") {
    return <Loading />;
  }

  const { accountSwitcherProps, experiments, loginForm, isStudioWebView, translate } = viewModel;

  return (
    <React.Fragment>
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
          {experiments.ssoPlacement === "otherSignInOptions" && (
            <LegacyLoginSsoOptions
              identityProviderIds={ssoIdentityProviderIds}
              translate={translate}
            />
          )}
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
    </React.Fragment>
  );
};

export default LoginLegacyView;
