import "./src/main.css";
import React from "react";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { queryClient, TranslationProvider } from "@rbx/core-scripts/legacy/react-utilities";
import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import type { Namespace } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
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
import { translations } from "./component.json";

// The account switcher on the login page reads its strings through @rbx/www-common/i18n.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
const namespaces = translations as unknown as readonly Namespace[];

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
      // The legacy login reads the content rating policy through the shared react-query hook;
      // the revamped container brings its own provider, so only this path needs one here.
      container = isAccountExperienceRevampEnabled() ? (
        <LoginContainer />
      ) : (
        <QueryClientProvider client={queryClient}>
          <LoginBase />
        </QueryClientProvider>
      );
    }
    renderWithErrorBoundary(
      <TranslationProviderSCC namespaces={namespaces}>
        <TranslationProvider config={loginPageProviderConfig}>{container}</TranslationProvider>
      </TranslationProviderSCC>,
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
