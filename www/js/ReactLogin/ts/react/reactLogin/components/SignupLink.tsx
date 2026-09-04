import React, { useState, useEffect } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { authenticatedUser } from 'header-scripts';
import { AccountSwitcherService, NavigationService } from 'Roblox';
import { loginTranslationConfig } from '../translation.config';
import { FeatureLoginPage } from '../../common/constants/translationConstants';
import { buildSignupRedirUrl } from '../../common/utils/browserUtils';
import { getAccountSwitchingSignupUrl } from '../utils/loginUtils';

export const SignupLink = ({ translate }: WithTranslationsProps): JSX.Element => {
  const [showSignupLink, setShowSignupLink] = useState(false);
  const isAccountSwitching = AccountSwitcherService && authenticatedUser.isAuthenticated;
  const signupRedirUrl = isAccountSwitching
    ? getAccountSwitchingSignupUrl()
    : buildSignupRedirUrl();

  // Note that if vng users want to add a new account from logged in state, it is allowed.
  // https://roblox.atlassian.net/browse/WEBCORE-14284
  useEffect(() => {
    const fetchData = async () => {
      try {
        const isVNGComplianceEnabled = await NavigationService?.getIsVNGLandingRedirectEnabled();
        // if VNG landing page redirect is enabled, we don't want to show any signup UI unless the user is switching accounts
        setShowSignupLink(isAccountSwitching || !isVNGComplianceEnabled);
      } catch (error) {
        console.error('Error fetching data:', error);
        setShowSignupLink(true); // fallback to show signup link
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData();
  }, [isAccountSwitching]); // Include isAccountSwitching in the dependency array if it is used inside fetchData

  return (
    <div className='text-center'>
      {showSignupLink && (
        <div className='signup-option'>
          {!isAccountSwitching && (
            <span className='no-account-text'>{translate(FeatureLoginPage.LabelNoAccount)}</span>
          )}
          <a
            id='sign-up-link'
            className='text-link signup-link'
            href={signupRedirUrl}
            target='_self'>
            {translate(
              isAccountSwitching
                ? FeatureLoginPage.ActionCreateANewAccount
                : FeatureLoginPage.ActionSignUpCapitalized
            )}
          </a>
        </div>
      )}
    </div>
  );
};

export default withTranslations(SignupLink, loginTranslationConfig);
