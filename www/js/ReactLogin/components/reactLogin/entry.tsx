import "./src/main.css";
import React from "react";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { TranslationProvider } from "@rbx/core-scripts/legacy/react-utilities";
import ready from "@rbx/core-scripts/util/ready";
import { AccountIntegrityChallengeService } from "Roblox";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import LoginBase from "@rbx/authentication/reactLogin/containers/LoginBase";
import LoginContainer from "@rbx/authentication/reactLogin/revamp/LoginContainer";
import LoggedInU13Interstitial, {
  shouldShowLoggedInU13Interstitial,
} from "@rbx/authentication/shared/LoggedInU13Interstitial";
import useLoginBackground from "@rbx/authentication/reactLogin/hooks/useLoginBackground";
import {
  reactLoginPageContainer,
  reactWebAppLoginPageContainer,
} from "@rbx/authentication-common/constants/browserConstants";
import isAccountExperienceRevampEnabled from "@rbx/authentication-common/utils/accountExperienceUtils";
import { loginPageProviderConfig } from "@rbx/authentication/reactLogin/translation.config";
import "@rbx/authentication/reactLogin/css/login.css";

const shouldRenderLoggedInU13Interstitial = shouldShowLoggedInU13Interstitial(
  authenticatedUser?.isAuthenticated ?? false,
  authenticatedUser?.isUnder13 ?? false,
);

const LoggedInU13LoginInterstitial = (): JSX.Element => {
  const { isLoginBackgroundImageEnabled, loginBackgroundClass } = useLoginBackground();
  const backgroundClass =
    isLoginBackgroundImageEnabled && loginBackgroundClass ? loginBackgroundClass : "";

  return (
    <div id="background-image" className={`background-image ${backgroundClass}`}>
      <LoggedInU13Interstitial context="login" />
    </div>
  );
};

function renderApp() {
  const entryPoint = reactWebAppLoginPageContainer() || reactLoginPageContainer();
  if (entryPoint) {
    if (entryPoint.id === "react-login-web-app") {
      entryPoint.classList.add("login-container");
    }

    let container: JSX.Element;
    if (shouldRenderLoggedInU13Interstitial) {
      container = <LoggedInU13LoginInterstitial />;
    } else {
      container = isAccountExperienceRevampEnabled() ? <LoginContainer /> : <LoginBase />;
    }
    renderWithErrorBoundary(
      <TranslationProvider config={loginPageProviderConfig}>{container}</TranslationProvider>,
      entryPoint,
    );
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  if (!shouldRenderLoggedInU13Interstitial) {
    // Warm up sensor for CaptchaV2 to make decision in async.
    AccountIntegrityChallengeService?.CaptchaV2?.preloadSensor?.();
  }

  renderApp();
});
