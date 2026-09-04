import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import Roblox from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import ReactLandingService from './services/landingService';
import ReactLandingEventService from './services/eventService';
import ReactSignupService from './services/signupService';
import ReactSignupUtils, { isVerifiedParentConsentSignup } from './utils/signupUtils';
import ReactIdentityVerificationUtils from './utils/identityVerificationUtils';
import { landingPageContainer } from '../common/constants/browserConstants';
import '../../../css/landing/reactLanding.scss';
import SignUpV2ExperimentRouter from './signupV2/containers/SignUpV2ExperimentRouter';
import LoggedInU13Interstitial, {
  shouldShowLoggedInU13Interstitial
} from '../common/components/LoggedInU13Interstitial';
import useLandingBackground from '../common/hooks/useLandingBackground';

Object.assign(Roblox, {
  ReactLandingService
});

Object.assign(Roblox, {
  ReactSignupService
});

Object.assign(Roblox, {
  ReactLandingEventService
});

// Utils will be removed after migration complete, needed for hybrid for now
Object.assign(Roblox, {
  ReactSignupUtils
});

Object.assign(Roblox, {
  ReactIdentityVerificationUtils
});

const shouldRenderLoggedInU13Interstitial = shouldShowLoggedInU13Interstitial(
  authenticatedUser?.isAuthenticated ?? false,
  authenticatedUser?.isUnder13 ?? false,
  isVerifiedParentConsentSignup()
);

const LoggedInU13LandingInterstitial = (): JSX.Element => {
  const landingBackgroundClass = useLandingBackground();

  return (
    <section
      className={`row full-height-section rollercoaster-background ${landingBackgroundClass}`}
      id='RollerContainer'>
      <div className='col-md-12 inner-full-height-section' id='InnerRollerContainer'>
        <LoggedInU13Interstitial context='createAccount' />
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
    render(container, entryPoint);
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
