import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { AccountIntegrityChallengeService } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import LoginBase from './containers/LoginBase';
import {
  reactLoginPageContainer,
  reactWebAppLoginPageContainer
} from '../common/constants/browserConstants';
import '../../../css/login/login.scss';
import LoginContainer from './revamp/LoginContainer';
import isAccountExperienceRevampEnabled from '../common/utils/accountExperienceUtils';
import LoggedInU13Interstitial, {
  shouldShowLoggedInU13Interstitial
} from '../common/components/LoggedInU13Interstitial';
import useLoginBackground from '../common/hooks/useLoginBackground';

const shouldRenderLoggedInU13Interstitial = shouldShowLoggedInU13Interstitial(
  authenticatedUser?.isAuthenticated ?? false,
  authenticatedUser?.isUnder13 ?? false
);

const LoggedInU13LoginInterstitial = (): JSX.Element => {
  const { isLoginBackgroundImageEnabled, loginBackgroundClass } = useLoginBackground();
  const backgroundClass =
    isLoginBackgroundImageEnabled && loginBackgroundClass ? loginBackgroundClass : '';

  return (
    <div id='background-image' className={`background-image ${backgroundClass}`}>
      <LoggedInU13Interstitial context='login' />
    </div>
  );
};

function renderApp() {
  const entryPoint = reactWebAppLoginPageContainer() || reactLoginPageContainer();
  if (entryPoint) {
    if (entryPoint.id === 'react-login-web-app') {
      entryPoint.classList.add('login-container');
    }

    let container: JSX.Element;
    if (shouldRenderLoggedInU13Interstitial) {
      container = <LoggedInU13LoginInterstitial />;
    } else {
      container = isAccountExperienceRevampEnabled() ? <LoginContainer /> : <LoginBase />;
    }
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
    AccountIntegrityChallengeService?.CaptchaV2?.preloadSensor?.();
  }

  renderApp();
});
