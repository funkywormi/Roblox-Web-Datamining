import React from "react";
import { accountSwitcherConfirmationModalContainer } from "../../reactLanding/constants/signupConstants";
import AuthenticationMethodDivider from "../../shared/components/AuthenticationMethodDivider";
import { ForgotCredentialLink } from "./ForgotCredentialLink";
import FoundationLoginControlMethods from "./FoundationLoginControlMethods";
import FoundationLoginForm from "./FoundationLoginForm";
import LoginAccountSwitcher from "./LoginAccountSwitcher";
import LoginLegacyView from "./LoginLegacyView";
import MagicLinkLoginErrorModal from "./MagicLinkLoginErrorModal";
import { SecurityNotificationModal } from "./SecurityNotificationModal";
import { SignupLink } from "./SignupLink";
import StudioLegalLinks from "./StudioLegalLinks";
import { containerConstants, loginFormStrings } from "../constants/loginConstants";
import { ssoIdentityProviderIds } from "../../shared/constants/ssoConstants";
import type { LoginControllerViewModel } from "../types/loginControllerTypes";

type ReadyLoginViewModel = Extract<LoginControllerViewModel, { status: "ready" }>;

type FoundationLoginCardProps = {
  loginForm: NonNullable<ReadyLoginViewModel["loginForm"]>;
  ssoPlacement: ReadyLoginViewModel["experiments"]["ssoPlacement"];
  isStudioWebView: boolean;
  translate: ReadyLoginViewModel["translate"];
  alternativeMethods?: React.ReactNode;
};

const FoundationLoginCard = ({
  loginForm,
  ssoPlacement,
  isStudioWebView,
  translate,
  alternativeMethods,
}: FoundationLoginCardProps): React.JSX.Element => {
  return (
    <section
      className="login-foundation-card"
      aria-labelledby="login-foundation-heading"
      hidden={loginForm.isHidden}
      data-testid="login-password-form"
    >
      <h1
        id="login-foundation-heading"
        className="content-emphasis text-heading-small padding-y-none"
      >
        {loginForm.isAddingAccount
          ? loginForm.headerText
          : translate(loginFormStrings.HeadingSignIn)}
      </h1>
      <div className="login-foundation-content">
        <FoundationLoginForm {...loginForm.formProps} />
        <ForgotCredentialLink
          credentialValue={loginForm.forgotCredentialValue}
          translate={translate}
          useSentenceCaseLabel
        />
        <div className="login-foundation-alternative-section">
          <AuthenticationMethodDivider label={translate(loginFormStrings.LabelOR)} />
          {alternativeMethods ?? (
            <FoundationLoginControlMethods
              {...loginForm.alternativeProps}
              ssoPlacement={ssoPlacement}
              identityProviderIds={ssoIdentityProviderIds}
            />
          )}
        </div>
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
        <SignupLink useCombinedCreateAccountLabel />
        {isStudioWebView && <StudioLegalLinks />}
      </div>
    </section>
  );
};

export type FoundationLoginViewProps = {
  viewModel: LoginControllerViewModel;
  alternativeMethods?: React.ReactNode;
};

const FoundationLoginView = ({
  viewModel,
  alternativeMethods,
}: FoundationLoginViewProps): React.JSX.Element => {
  if (viewModel.status === "loading") {
    return <LoginLegacyView viewModel={viewModel} />;
  }

  const { accountSwitcherProps, experiments, loginForm, isStudioWebView, translate } = viewModel;

  return (
    <div className="login-foundation-presentation" data-testid="foundation-login-presentation">
      <span className="icon-default-logo login-foundation-wordmark" aria-hidden="true" />
      {accountSwitcherProps && <LoginAccountSwitcher {...accountSwitcherProps} />}
      {loginForm && (
        <FoundationLoginCard
          loginForm={loginForm}
          ssoPlacement={experiments.ssoPlacement}
          isStudioWebView={isStudioWebView}
          translate={translate}
          alternativeMethods={alternativeMethods}
        />
      )}
    </div>
  );
};

export default FoundationLoginView;
