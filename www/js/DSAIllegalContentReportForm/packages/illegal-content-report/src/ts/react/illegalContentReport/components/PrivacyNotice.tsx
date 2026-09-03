import React from 'react';
import { useTranslations } from '../../util/translation';
import { Urls } from '../constants';

/**
 * PrivacyNotice component that displays privacy policy information.
 * Shows a translated message with embedded link to Roblox Privacy and Cookie Policy.
 * Used at the bottom of all illegal content report forms for compliance.
 */
const PrivacyNotice: React.FC = () => {
  const { translateHtml } = useTranslations();

  const personalDataTranslationHtml = translateHtml('Message.PrivacyAndCookiePolicy', [
    [
      'docLink',
      'docLinkEnd',
      text => (
        <a
          href={Urls.PRIVACY_AND_COOKIE_POLICY}
          key={Urls.PRIVACY_AND_COOKIE_POLICY}
          className='text-link'
          target='_blank'
          rel='noreferrer'>
          {text}
        </a>
      )
    ]
  ]);

  return (
    <div className='section'>
      <p className='dsa-reason-limit'>{personalDataTranslationHtml}</p>
    </div>
  );
};

export default PrivacyNotice;
