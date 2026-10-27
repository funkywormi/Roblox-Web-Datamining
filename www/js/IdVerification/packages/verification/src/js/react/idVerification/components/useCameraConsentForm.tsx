import React, { useState } from 'react';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import { buttonVariants } from '../constants/buttonConstants';
import IdvButton from './IdvButton';
import type { ButtonInfo } from '../constants/buttonConstants';

function useCameraConsentForm(
  translate: TranslateFunction,
  implicitConsent: string,
  explicitConsent: string,
  requireExplicitCameraConsent: boolean,
  buttons: ButtonInfo[]
) {
  const [consent, setConsent] = useState(!requireExplicitCameraConsent);
  const checkbox = (
    <div className='checkbox checkbox-container'>
      {requireExplicitCameraConsent ? (
        <React.Fragment>
          <input
            type='checkbox'
            checked={consent}
            onClick={() => {
              setConsent(!consent);
            }}
            id='isShowOverlayChecked'
          />
          <label htmlFor='isShowOverlayChecked' className='voice-modal-checkbox-label'>
            {translate(explicitConsent)}
          </label>
        </React.Fragment>
      ) : (
        <span>{translate(implicitConsent)}</span>
      )}
    </div>
  );

  const buttonMarkup = buttons.map(buttonInfo => (
    <div className='half-flex' key={buttonInfo.text}>
      <IdvButton
        className='button-stack-button secondary-link'
        variant={buttonVariants.secondary}
        isDisabled={requireExplicitCameraConsent && buttonInfo.explicitDisable && !consent}
        onClick={buttonInfo.callback}>
        {translate(buttonInfo.text)}
      </IdvButton>
    </div>
  ));

  return [checkbox, buttonMarkup] as const;
}

export default useCameraConsentForm;
