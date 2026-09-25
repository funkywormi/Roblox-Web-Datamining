import "./src/main.css";
import React from "react";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { TranslationProvider } from "@rbx/core-scripts/legacy/react-utilities";
import ready from "@rbx/core-scripts/util/ready";
import Roblox from "Roblox";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import ReactLandingService from "@rbx/authentication/reactLanding/services/landingService";
import ReactLandingEventService from "@rbx/authentication/reactLanding/services/eventService";
import ReactSignupService from "@rbx/authentication/reactLanding/services/signupService";
import ReactSignupUtils, {
  isVerifiedParentConsentSignup,
} from "@rbx/authentication/reactLanding/utils/signupUtils";
import ReactIdentityVerificationUtils from "@rbx/authentication/reactLanding/utils/identityVerificationUtils";
import SignUpV2ExperimentRouter from "@rbx/authentication/reactLanding/signupV2/containers/SignUpV2ExperimentRouter";
import LoggedInU13Interstitial, {
  shouldShowLoggedInU13Interstitial,
} from "@rbx/authentication/shared/LoggedInU13Interstitial";
import useLandingBackground from "@rbx/authentication/reactLanding/hooks/useLandingBackground";
import { landingPageContainer } from "@rbx/authentication-common/constants/browserConstants";
import { landingPageProviderConfig } from "@rbx/authentication/reactLanding/translation.config";
import "@rbx/authentication/reactLanding/css/reactLanding.css";

Object.assign(Roblox, {
  ReactLandingService,
});

Object.assign(Roblox, {
  ReactSignupService,
});

Object.assign(Roblox, {
  ReactLandingEventService,
});

// Utils will be removed after migration complete, needed for hybrid for now
Object.assign(Roblox, {
  ReactSignupUtils,
});

Object.assign(Roblox, {
  ReactIdentityVerificationUtils,
});

const shouldRenderLoggedInU13Interstitial = shouldShowLoggedInU13Interstitial(
  authenticatedUser?.isAuthenticated ?? false,
  authenticatedUser?.isUnder13 ?? false,
  isVerifiedParentConsentSignup(),
);

const LoggedInU13LandingInterstitial = (): JSX.Element => {
  const landingBackgroundClass = useLandingBackground();

  return (
    <section
      className={`row full-height-section rollercoaster-background ${landingBackgroundClass}`}
      id="RollerContainer"
    >
      <div className="col-md-12 inner-full-height-section" id="InnerRollerContainer">
        <LoggedInU13Interstitial context="createAccount" />
      </div>
    </section>
  );
};

function renderApp() {
  const entryPoint = landingPageContainer();
  if (entryPoint) {
    const container = shouldRenderLoggedInU13Interstitial ? (
      <LoggedInU13LandingInterstitial />
    ) : (
      <SignUpV2ExperimentRouter />
    );
    renderWithErrorBoundary(
      <TranslationProvider config={landingPageProviderConfig}>{container}</TranslationProvider>,
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
    Roblox.AccountIntegrityChallengeService?.CaptchaV2?.preloadSensor?.();
  }

  renderApp();
});
