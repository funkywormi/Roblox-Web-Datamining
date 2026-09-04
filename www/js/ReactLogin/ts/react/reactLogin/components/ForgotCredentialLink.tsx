import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { loginTranslationConfig } from '../translation.config';
import { FeatureLoginPage } from '../../common/constants/translationConstants';
import { urlConstants } from '../constants/loginConstants';

export type forgotCredentialLinkProps = {
  credentialValue: string;
  translate: WithTranslationsProps['translate'];
};

export const ForgotCredentialLink = ({
  credentialValue,
  translate
}: forgotCredentialLinkProps): JSX.Element => {
  const { forgotCredentialsUrl } = urlConstants;
  const forgotCredentialsUrlWithParameters = credentialValue
    ? `${forgotCredentialsUrl}?identifier=${encodeURIComponent(credentialValue)}`
    : forgotCredentialsUrl;

  const linkTextKey = FeatureLoginPage.ActionForgotPasswordOrUsernameQuestionCapitalized;
  return (
    <div className='text-center forgot-credentials-link'>
      <a
        id='forgot-credentials-link'
        className='text-link'
        href={forgotCredentialsUrlWithParameters}
        target='_self'>
        {translate(linkTextKey)}
      </a>
    </div>
  );
};

export default withTranslations(ForgotCredentialLink, loginTranslationConfig);
