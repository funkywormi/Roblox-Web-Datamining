import classNames from 'classnames';
import React, { useState } from 'react';
import { DialogBody, DialogFooter, DialogTitle, Icon } from '@rbx/foundation-ui';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import { buttonVariants } from '../constants/buttonConstants';
import IdvButton from './IdvButton';
import { minimumAge } from '../constants/viewConstants';
import { postShowOverlay } from '../services/voiceChatService';
import type { ViewTemplatePageState } from '../stores/IdVerificationStoreContext';

type ViewTemplateProps = Omit<ViewTemplatePageState, 'footerText'> & {
  footerText?: string | null;
  translate: TranslateFunction;
  onHide: () => void;
  includeLink?: boolean;
};

function ViewTemplate({
  translate,
  onHide,
  heading,
  icon,
  bodyText,
  errorState = false,
  footerText = null,
  userEmail = null,
  daysUntilNextVerification = 0,
  canClose = true,
  buttonStack,
  includeLink = false,
  displayCheckbox = false
}: ViewTemplateProps) {
  const [checked, setChecked] = useState(false);
  return (
    <React.Fragment>
      <div className='modal-header'>
        <div className='email-upsell-title-container'>
          {canClose && (
            <button type='button' className='email-upsell-title-button' onClick={onHide}>
              <Icon name='icon-regular-x' size='Large' className='idv-close-icon' />
            </button>
          )}
          <DialogTitle className='modal-title'>{translate(heading)}</DialogTitle>
        </div>
      </div>
      <DialogBody className='modal-body'>
        {icon && <div className={icon} />}
        <ul className={errorState ? 'content-list error-text' : 'content-list'}>
          {includeLink
            ? bodyText.map(text => (
                <li
                  dangerouslySetInnerHTML={{
                    __html: translate(text, {
                      spanStart: "<a class='text-link' href='/info/privacy'>",
                      spanEnd: '</a>',
                      boldStart: '<b>',
                      boldEnd: '</b>'
                    })
                  }}
                />
              ))
            : bodyText.map(text => (
                <li>
                  {translate(text, {
                    age: minimumAge,
                    email: userEmail,
                    days: daysUntilNextVerification
                  })}
                </li>
              ))}
        </ul>
        {displayCheckbox && (
          <div className='checkbox checkbox-container'>
            <input
              id='isShowOverlayChecked'
              type='checkbox'
              checked={checked}
              onClick={() => {
                setChecked(!checked);
                postShowOverlay(checked);
              }}
            />
            <label htmlFor='isShowOverlayChecked'>{translate('Label.DontShowAgain')}</label>
          </div>
        )}
      </DialogBody>
      <DialogFooter className='modal-footer'>
        {footerText && (
          <p className='small'>
            <b>{translate(footerText)}</b>
          </p>
        )}
        {buttonStack.map(button => {
          const isPrimaryButton = button.variant === buttonVariants.primary;
          return (
            <span key={button.text}>
              <IdvButton
                className={classNames('button-stack-button', {
                  'primary-link': isPrimaryButton,
                  'secondary-link': !isPrimaryButton
                })}
                variant={button.variant}
                onClick={button.callback}>
                {translate(button.text)}
              </IdvButton>
            </span>
          );
        })}
      </DialogFooter>
    </React.Fragment>
  );
}

export default ViewTemplate;
