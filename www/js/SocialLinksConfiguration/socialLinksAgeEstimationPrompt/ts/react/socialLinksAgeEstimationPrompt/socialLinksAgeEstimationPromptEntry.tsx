import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import SocialLinksAgeEstimationPrompt from './components/socialLinksAgeEstimationPrompt';
import { socialLinksConfig } from '../shared/translation.config';
import '../../../css/faceAgeEstimationUpsell.scss';

const renderSocialLinkAgeEstimationPrompt = (
  container: Element,
  socialLinksVerificationStatus: string
) => {
  unmountComponentAtNode(container);

  render(
    <TranslationProvider config={socialLinksConfig}>
      <SocialLinksAgeEstimationPrompt
        socialLinksVerificationStatus={socialLinksVerificationStatus}
      />
    </TranslationProvider>,
    container
  );
};

const SocialLinksAgeEstimationPromptService = {
  renderSocialLinkAgeEstimationPrompt
};

Object.assign(Roblox, {
  SocialLinksAgeEstimationPromptService
});
