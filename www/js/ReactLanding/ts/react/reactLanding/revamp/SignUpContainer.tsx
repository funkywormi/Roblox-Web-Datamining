import React, { useEffect } from 'react';
import classNames from 'classnames';
import { queryClient, TranslationProvider, useTranslation } from 'react-utilities';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppStoreContainer } from '@rbx/app-store-links';
import { AccountSwitcherService } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import LeftRightLayout from './LeftRightLayout';
import SignUpForm from './SignUpForm';
import SignInButton from './components/SignInButton';
import bg from '../../../../images/landing/game_grid.webp';
import { signupTranslationConfig } from '../translation.config';
import { sendAppClickEvent, sendAuthPageLoadEvent } from '../services/eventService';
import { AUTH_ERROR_MODAL_CONTAINER_ID } from './utils/authErrorModalUtils';
import { isVerifiedParentConsentSignup } from '../utils/signupUtils';
import useRedirectHomeIf from '../../common/hooks/useRedirectHomeIf';
import './main.css';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';

// Used to override styling from css/vendors/bootstrap/_forms.scss
// To not affect the other, old sign up form, we only want to load this styling if this new
// component is being rendered. So, we dynamically inject the stylesheet below.
const styleFix = `
label {
  margin-bottom: 0;
}
.legal-text a, .legal-text a:hover {
  color: inherit;
  text-decoration: underline;
  text-decoration-skip-ink: none;
}
h3 {
  text-transform: none;
}
`;

const AppStoreFooter = (): JSX.Element => {
  const { translate } = useTranslation();
  return (
    <div className='padding-bottom-xlarge'>
      <AppStoreContainer
        onAppClick={sendAppClickEvent}
        translate={translate}
        isAccountExperienceRevampEnabled
      />
    </div>
  );
};

const SignUpContainer = (): JSX.Element => {
  useEffect(() => {
    sendAuthPageLoadEvent(EVENT_CONSTANTS.context.lrSignupForm);
  }, []);

  // VPC signup is not yet supported in the revamp flow, but including this check
  // to match the original SignupFormContainer and not forget to add it later
  const isVPCSignup = isVerifiedParentConsentSignup();

  const [
    isAccountSwitchingEnabledForBrowser,
    isAccountSwitcherHookCompleted
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false, false];

  // Redirect authenticated users home when account switching is not enabled.
  // This handles U13 users since account switching is always disabled for them.
  useRedirectHomeIf(
    !isVPCSignup &&
      authenticatedUser.isAuthenticated &&
      isAccountSwitcherHookCompleted &&
      !isAccountSwitchingEnabledForBrowser
  );

  return (
    <TranslationProvider config={signupTranslationConfig}>
      <QueryClientProvider client={queryClient}>
        <React.Fragment>
          <LeftRightLayout
            className='bg-surface-0 justify-center'
            style={{ width: '100%', minHeight: '100vh' }}
            left={
              <div
                className={classNames(
                  'flex flex-col gap-[var(--size-800)] size-full',
                  'padding-top-[var(--size-1200)] padding-x-xlarge medium:padding-x-[var(--size-1200)] large:padding-x-[var(--size-1600)]'
                )}>
                <style>{styleFix}</style>
                {/* Logo and Sign In button row - button visible on small screens, hidden on large screens */}
                <div className='flex justify-between items-center'>
                  {/* Hide logo when authenticated since the nav bar already displays it */}
                  <span
                    aria-label='Roblox'
                    className={classNames(
                      'icon-logo grow-0 shrink-0 basis-auto',
                      authenticatedUser?.isAuthenticated && 'invisible'
                    )}
                    style={{
                      backgroundSize: '160px 30px',
                      width: '160px',
                      height: '30px'
                    }}
                  />
                  <div
                    className={classNames(
                      'large:hidden',
                      authenticatedUser?.isAuthenticated && 'invisible'
                    )}>
                    <SignInButton />
                  </div>
                </div>
                <SignUpForm />
              </div>
            }
            right={
              <div className='relative size-full clip'>
                <img
                  className='absolute size-full select-none'
                  style={{ objectFit: 'cover', opacity: 0.7 }}
                  src={bg}
                  alt=''
                  draggable={false}
                />
                <div
                  className={classNames(
                    'absolute top-[0] left-[0] right-[0] flex justify-end padding-top-[var(--size-1200)] padding-x-[var(--size-1600)]',
                    authenticatedUser?.isAuthenticated && 'invisible'
                  )}>
                  <SignInButton />
                </div>
                <div
                  className='absolute bottom-[0] left-[0] right-[0] height-[50%] flex flex-col justify-end padding-xxlarge'
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.9))'
                  }}>
                  <AppStoreFooter />
                </div>
              </div>
            }
          />
          <div id={AUTH_ERROR_MODAL_CONTAINER_ID} />
        </React.Fragment>
      </QueryClientProvider>
    </TranslationProvider>
  );
};

export default SignUpContainer;
