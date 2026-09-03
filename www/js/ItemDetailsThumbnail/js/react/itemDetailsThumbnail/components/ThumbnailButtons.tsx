import React from 'react';
import { Button } from 'react-style-guide';
import { withTranslations, TranslateFunction, WithTranslationsProps } from 'react-utilities';
import { CurrentUser } from 'Roblox';
import { buttonTranslationConfig } from '../translation.config';

type TThumbnailButtonsProps = {
  onModeButtonClick: (currentlyEnabledMode: boolean) => void;
  onTryOnButtonClick: (currentlyEnabledMode: boolean) => void;
  onPlayButtonClick: (currentlyEnabledMode: boolean) => void;
  mode3DEnabled: boolean;
  showMode3D: boolean;
  showTryOn: boolean;
  tryOnEnabled: boolean;
  modePlayEnabled: boolean;
  isAnimation: boolean;
  isBundle: boolean;
};

export function ThumbnailButtons({
  onModeButtonClick,
  onTryOnButtonClick,
  onPlayButtonClick,
  showMode3D,
  mode3DEnabled,
  showTryOn,
  tryOnEnabled,
  modePlayEnabled,
  isAnimation,
  isBundle,
  translate
}: TThumbnailButtonsProps & WithTranslationsProps): JSX.Element {
  return (
    <div className='thumbnail-button-container'>
      {showTryOn === true && (
        <Button
          className='enable-three-dee btn-control button-placement'
          variant={Button.variants.control}
          size={Button.sizes.medium}
          width={Button.widths.default}
          onClick={() => onTryOnButtonClick(tryOnEnabled)}>
          {tryOnEnabled === true ? translate('Label.TakeOff') : translate('Label.TryOn')}
        </Button>
      )}
      {isAnimation === false && showMode3D && CurrentUser.isAuthenticated && (
        <Button
          className='enable-three-dee btn-control button-placement'
          variant={Button.variants.control}
          size={Button.sizes.medium}
          width={Button.widths.default}
          onClick={() => onModeButtonClick(mode3DEnabled)}>
          {mode3DEnabled === true ? translate('Label.2D') : translate('Label.3D')}
        </Button>
      )}
      {isAnimation === true && isBundle === true && (
        <React.Fragment>
          <Button
            className='enable-three-dee btn-control button-placement'
            variant={Button.variants.control}
            size={Button.sizes.medium}
            width={Button.widths.default}
            onClick={() => onPlayButtonClick(modePlayEnabled)}>
            {modePlayEnabled === true ? (
              <div className='icon-bigstop' />
            ) : (
              <div className='icon-bigplay' />
            )}
          </Button>
        </React.Fragment>
      )}
    </div>
  );
}

export default withTranslations(ThumbnailButtons, buttonTranslationConfig);
