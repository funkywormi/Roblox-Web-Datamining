import React, { useEffect, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Button } from '@rbx/foundation-ui';
import { urlService } from 'core-utilities';
import { AccountSwitcherService } from 'Roblox';
import { signupTranslationConfig } from '../translation.config';
import { urlConstants, landingPageStrings } from '../constants/landingConstants';
import { signupFormStrings } from '../constants/signupConstants';
import { RETURNURL } from '../../common/constants/browserConstants';
import { sendSignUpV2ShellSignInEvent } from '../services/eventService';

const { getQueryParam, composeQueryString } = urlService;

type ActionBarProps = WithTranslationsProps & {
  usesFoundationSignIn?: boolean;
};

export const ActionBar = ({
  translate,
  usesFoundationSignIn = false
}: ActionBarProps): JSX.Element => {
  const [loginUrl, setLoginUrl] = useState(urlConstants.loginLink);

  const [
    isAccountSwitchingEnabledForBrowser
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false];

  useEffect(() => {
    if (isAccountSwitchingEnabledForBrowser) {
      const returnUrl = getQueryParam(RETURNURL) || '';
      if (returnUrl) {
        setLoginUrl(`${urlConstants.loginLink}?${composeQueryString({ returnUrl })}`);
      } // else leave as login link
    }
  }, [isAccountSwitchingEnabledForBrowser]);

  return (
    <div id='action-bar-container'>
      <div id='action-bar'>
        {usesFoundationSignIn ? (
          <Button
            id='main-sign-in-button'
            // Foundation hardcodes `display: flex`, which content-sizes a `button` but makes an
            // `a` fill its container, leaving `margin-left-auto` no free space to push against.
            className='margin-left-auto width-fit'
            size='Medium'
            style={{ minWidth: '150px', height: '40px' }}
            variant='Emphasis'
            as='a'
            href={loginUrl}
            onClick={() => {
              sendSignUpV2ShellSignInEvent();
            }}>
            {translate(signupFormStrings.SignIn)}
          </Button>
        ) : (
          <a id='main-login-button' className='btn-cta-md' href={loginUrl}>
            {translate(landingPageStrings.logIn)}
          </a>
        )}
      </div>
    </div>
  );
};

export default withTranslations(ActionBar, signupTranslationConfig);
