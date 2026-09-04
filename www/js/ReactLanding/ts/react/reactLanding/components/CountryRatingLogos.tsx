import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { landingTranslationConfig } from '../translation.config';
import { landingPageStrings } from '../constants/landingConstants';

export type countryRatingLogosProps = {
  shouldDisplayBrazilRatingLogo: boolean;
  shouldDisplayItalyRatingLogo: boolean;
  onContentRatingLogoClick?: () => void;
  translate: WithTranslationsProps['translate'];
};

const CountryRatingLogos = ({
  shouldDisplayBrazilRatingLogo,
  shouldDisplayItalyRatingLogo,
  onContentRatingLogoClick,
  translate
}: countryRatingLogosProps): JSX.Element => {
  return (
    <div>
      {shouldDisplayBrazilRatingLogo && (
        <div id='brazil-rating-logo'>
          <div id='brazil-rating-header'>
            <span>{translate(landingPageStrings.brazilContentRatingTitleSixteen)}</span>
          </div>
          <div id='brazil-rating-content'>
            <div
              role='button'
              tabIndex={0}
              id='brazil-icon'
              aria-label='brazil-content-rating'
              onClick={onContentRatingLogoClick}
            />
            <div id='brazil-logo-text-container'>
              <div className='brazil-logo-content-text'>
                <span>{translate(landingPageStrings.brazilContentDescriptorViolence)}</span>
              </div>
            </div>
          </div>
          <div id='brazil-rating-footer'>
            <div className='brazil-logo-footer-text'>
              <span>
                {translate(landingPageStrings.brazilInteractiveElementDescriptorUsersInteract)}
              </span>
            </div>
            <div className='brazil-logo-footer-text'>
              <span>
                {translate(landingPageStrings.brazilInteractiveElementDescriptorInGamePurchases)}
              </span>
            </div>
          </div>
        </div>
      )}
      {shouldDisplayItalyRatingLogo && (
        <div role='button' tabIndex={0} id='italy-rating-logo' onClick={onContentRatingLogoClick}>
          <div id='italy-icon-container'>
            <div id='pegi-icon' />
            <div id='fear-icon' />
            <div id='violence-icon' />
            <div id='purchases-icon' />
          </div>
          <div id='italy-logo-text'>
            <span>{translate(landingPageStrings.italyContentRatingTitle)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default withTranslations(CountryRatingLogos, landingTranslationConfig);
