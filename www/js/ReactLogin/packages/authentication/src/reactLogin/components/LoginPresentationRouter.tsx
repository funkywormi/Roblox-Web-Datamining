import React from "react";
import FoundationLoginView from "./FoundationLoginView";
import LoginChallengeOverlays from "./LoginChallengeOverlays";
import LoginComplianceSurface from "./LoginComplianceSurface";
import LoginLegacyView from "./LoginLegacyView";
import SsoCompleteHandler from "../../shared/components/SsoCompleteHandler";
import type { LoginControllerViewModel } from "../types/loginControllerTypes";
import { getSsoRedirectUrl, navigateToSsoReturnUrl } from "../utils/loginNavigationUtils";

export type LoginPresentationRouterProps = {
  viewModel: LoginControllerViewModel;
  isLoginRefreshEnabled: boolean;
  renderRefreshedLogin?: (viewModel: LoginControllerViewModel) => React.JSX.Element;
  renderAlternativeMethods?: (viewModel: LoginControllerViewModel) => React.ReactNode;
};

const LoginPresentationRouter = ({
  viewModel,
  isLoginRefreshEnabled,
  renderRefreshedLogin,
  renderAlternativeMethods,
}: LoginPresentationRouterProps): React.JSX.Element => {
  const presentation = isLoginRefreshEnabled ? (
    (renderRefreshedLogin?.(viewModel) ?? (
      <FoundationLoginView
        viewModel={viewModel}
        alternativeMethods={renderAlternativeMethods?.(viewModel)}
      />
    ))
  ) : (
    <LoginLegacyView viewModel={viewModel} />
  );

  if (viewModel.status === "loading") {
    return presentation;
  }

  const {
    loginBaseContainerClass,
    loginBaseAttributes,
    challengeOverlaysProps,
    compliance,
    isLoginBackgroundImageEnabled,
    loginBackgroundClass,
    translate,
  } = viewModel;
  const loginBase = (
    <div
      id="login-base"
      className={`${loginBaseContainerClass}${
        isLoginRefreshEnabled ? " login-foundation-base-container" : ""
      }`}
      {...loginBaseAttributes}
    >
      {presentation}
      <SsoCompleteHandler
        navigateToDestination={navigateToSsoReturnUrl}
        getSignupReturnUrl={getSsoRedirectUrl}
      />
      <LoginChallengeOverlays {...challengeOverlaysProps} />
    </div>
  );
  const complianceSurface = (
    <LoginComplianceSurface
      shouldDisplayBrazilRatingLogo={compliance.shouldDisplayBrazilRatingLogo}
      // Legacy login has never shown the Italy rating; keep it limited to the refreshed login.
      shouldDisplayItalyRatingLogo={
        isLoginRefreshEnabled && compliance.shouldDisplayItalyRatingLogo
      }
      translate={translate}
    />
  );

  if (isLoginBackgroundImageEnabled && loginBackgroundClass) {
    return (
      <div id="background-image" className={`background-image ${loginBackgroundClass}`}>
        <div className="login-content-wrapper">
          {loginBase}
          {complianceSurface}
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {loginBase}
      {complianceSurface}
    </React.Fragment>
  );
};

export default LoginPresentationRouter;
