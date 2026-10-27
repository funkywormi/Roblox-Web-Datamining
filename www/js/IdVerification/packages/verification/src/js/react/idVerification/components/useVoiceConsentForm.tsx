import classNames from 'classnames';
import React, { useState } from 'react';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import { buttonVariants } from '../constants/buttonConstants';
import IdvButton from './IdvButton';
import type { ButtonInfo } from '../constants/buttonConstants';
import { postShowOverlay } from '../services/voiceChatService';

function useVoiceConsentForm(
  translate: TranslateFunction,
  buttonStack: ButtonInfo[],
  implicitConsent: string,
  explicitConsent: string,
  requireExplicitVoiceConsent: boolean | undefined
) {
  const [consent, setConsent] = useState(!requireExplicitVoiceConsent);
  const checkbox = (
    <div className='checkbox checkbox-container'>
      {requireExplicitVoiceConsent ? (
        <React.Fragment>
          <input
            type='checkbox'
            checked={consent}
            onClick={() => {
              setConsent(!consent);
              postShowOverlay(consent);
            }}
            id='isShowOverlayChecked'
          />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor='isShowOverlayChecked' className='voice-modal-checkbox-label'>
            {translate(explicitConsent, {
              linkStart: '',
              linkEnd: ''
            })}
          </label>
        </React.Fragment>
      ) : (
        <span>
          {translate(implicitConsent, {
            linkStart: '',
            linkEnd: ''
          })}
        </span>
      )}
    </div>
  );

  const buttons = buttonStack.map(button => {
    const isPrimaryButton = button.variant === buttonVariants.primary;
    return (
      <span key={button.text}>
        <IdvButton
          className={classNames('button-stack-button', {
            'primary-link': isPrimaryButton,
            'secondary-link': !isPrimaryButton
          })}
          variant={button.variant}
          isDisabled={requireExplicitVoiceConsent && button.explicitDisable && !consent}
          onClick={button.callback}>
          {translate(button.text)}
        </IdvButton>
      </span>
    );
  });

  return [checkbox, buttons] as const;
}

export default useVoiceConsentForm;
