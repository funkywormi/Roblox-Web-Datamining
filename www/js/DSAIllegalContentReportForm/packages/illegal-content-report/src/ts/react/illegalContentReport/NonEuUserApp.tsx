import React from 'react';
import { EnvironmentUrls } from "@rbx/legacy-webapp-types/Roblox";
import { TranslationProvider, useTranslations } from '../util/translation';
import { NonEuUserInfo } from './constants';
import '../style/shared.scss';
import './style.scss';
import { dsaTranslationConfig } from '../../../translation.config';

/** Page when non EU user access IllegalContentReport website */
const NonEuUserPage = (): React.ReactElement => {
  const { translateHtml } = useTranslations();
  const supportWebsiteUrl = EnvironmentUrls.domain
    ? `https://${EnvironmentUrls.domain}/support`
    : NonEuUserInfo.DefaultSupportFormLink;

  return (
    <div className='form-container'>
      <div className='main-card'>
        <p className='text-description'>
          {translateHtml('Message.NonEuUserPage', [
            [
              'link',
              'linkEnd',
              text => (
                <a href={supportWebsiteUrl} className='text-link' target='_blank' rel='noreferrer'>
                  {text}
                </a>
              )
            ]
          ])}
        </p>
      </div>
    </div>
  );
};

const NonEuUserApp = (): React.ReactElement => {
  return (
    <TranslationProvider translationConfig={dsaTranslationConfig}>
      <NonEuUserPage />
    </TranslationProvider>
  );
};

export default NonEuUserApp;
