import React from 'react';
import { DialogBody, DialogFooter, DialogTitle, Icon } from '@rbx/foundation-ui';
import { buttonVariants } from '../constants/buttonConstants';
import IdvButton from './IdvButton';
import { DisplayView } from '../constants/viewConstants';
import useIdVerificationState from '../hooks/useIdVerificationState';
import { useEmailUpsellTranslate } from '../hooks/useIdVerificationTranslate';

type IdVerificationModalProps = {
  onHide: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onInputChange: (value: string) => void;
  onInputFocus: () => void;
  onKeyDown: (key: string) => void;
};

function IdVerificationModal({
  onHide,
  onPrimaryAction,
  onSecondaryAction,
  onInputChange,
  onInputFocus,
  onKeyDown
}: IdVerificationModalProps) {
  const translate = useEmailUpsellTranslate();
  const { idVerificationState } = useIdVerificationState();
  const {
    pageName,
    titleText,
    bodyText,
    primaryButtonText,
    secondaryButtonText,
    userEmailInput,
    userEmailInputPlaceholder,
    userEmail,
    errorMsg,
    isEmailUpdating
  } = idVerificationState;
  return (
    <React.Fragment>
      <div className='modal-header'>
        <div className='email-upsell-title-container'>
          <button type='button' className='email-upsell-title-button' onClick={onHide}>
            <Icon name='icon-regular-x' size='Large' className='idv-close-icon' />
          </button>
          <DialogTitle className='modal-title'>{translate(titleText)}</DialogTitle>
        </div>
      </div>
      <DialogBody className='modal-body'>
        <div className='email-upsell-image' />
        <p className='email-upsell-text-body'>{translate(bodyText, { emailAddress: userEmail })}</p>
        {pageName === DisplayView.EMAIL && (
          <input
            type='email'
            /* eslint-disable */
            autoFocus
            /* eslint-enable */
            className={`${
              errorMsg ? 'input-field-error' : ''
            } form-control input-field email-upsell-modal-input`}
            placeholder={translate(userEmailInputPlaceholder)}
            value={userEmailInput}
            onFocus={() => onInputFocus()}
            onChange={event => onInputChange(event.target.value)}
            onKeyDown={event => onKeyDown(event.key)}
          />
        )}
        {errorMsg && <p className='text-error modal-error-message'>{translate(errorMsg)}</p>}
      </DialogBody>
      <DialogFooter className='modal-footer'>
        <div className='email-upsell-footer-container'>
          {pageName === DisplayView.EMAIL && (
            <IdvButton
              className='modal-button email-upsell-btn'
              variant={buttonVariants.cta}
              isDisabled={isEmailUpdating}
              onClick={onPrimaryAction}>
              {translate(primaryButtonText)}
            </IdvButton>
          )}
          {secondaryButtonText && (
            <button type='button' className='change-email-button' onClick={onSecondaryAction}>
              {translate(secondaryButtonText)}
            </button>
          )}
        </div>
      </DialogFooter>
    </React.Fragment>
  );
}

export default IdVerificationModal;
