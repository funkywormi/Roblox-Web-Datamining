import React, { useEffect } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Loading } from 'react-style-guide';
import { loginTranslationConfig } from '../translation.config';
import { FeatureLoginPage } from '../../common/constants/translationConstants';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { detectInputMethod } from '../../common/utils/inputMethodUtils';
import {
  sendUsernameFocusEvent,
  sendUsernameOffFocusEvent,
  sendPasswordFocusEvent,
  sendPasswordOffFocusEvent,
  sendAuthFormInteractionEvent
} from '../services/eventService';

export type loginFormProps = {
  captchaId: string;
  captchaToken: string;
  credentialValue: string;
  password: string;
  isLoading: boolean;
  errorMsg: string;
  translate: WithTranslationsProps['translate'];
  onFormSubmit: (isFromLoginButtonClick?: boolean) => void;
  onCredentialValueChange: (value: string) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoginFormDisabled: boolean;
};

export const LoginForm = ({
  captchaId,
  captchaToken,
  credentialValue,
  password,
  isLoading,
  errorMsg,
  translate,
  onFormSubmit,
  onCredentialValueChange,
  onPasswordChange,
  isLoginFormDisabled
}: loginFormProps): JSX.Element => {
  const checkAndSendInputMethodEvent = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const method = detectInputMethod(e.nativeEvent);
    if (method) {
      sendAuthFormInteractionEvent(EVENT_CONSTANTS.context.loginForm, field, method);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFormSubmit();
    }
  };

  useEffect(() => {
    if (captchaId && captchaToken) {
      onFormSubmit(false);
    }
  }, [captchaId + captchaToken]);

  return (
    <div id='login-form'>
      <div>
        <div className='login-form-container'>
          <form className='login-form' name='loginForm' onSubmit={onSubmit}>
            <div className='form-group username-form-group'>
              <label htmlFor='login-username' className='sr-only'>
                {translate(FeatureLoginPage.LabelUsernameEmailPhone)}
              </label>
              <input
                id='login-username'
                name='username'
                type='text'
                className='form-control input-field'
                autoComplete='username webauthn'
                onFocus={sendUsernameFocusEvent}
                onBlur={sendUsernameOffFocusEvent}
                placeholder={translate(FeatureLoginPage.LabelUsernameEmailPhone)}
                value={credentialValue}
                onChange={e => {
                  checkAndSendInputMethodEvent(e, EVENT_CONSTANTS.field.username);
                  onCredentialValueChange(e.target.value);
                }}
              />
            </div>
            <div className='form-group password-form-group'>
              <label htmlFor='login-password' className='sr-only'>
                {translate(FeatureLoginPage.LabelPassword)}
              </label>
              <input
                id='login-password'
                name='password'
                type='password'
                className='form-control input-field'
                onFocus={sendPasswordFocusEvent}
                onBlur={sendPasswordOffFocusEvent}
                placeholder={translate(FeatureLoginPage.LabelPassword)}
                value={password}
                onChange={e => {
                  checkAndSendInputMethodEvent(e, EVENT_CONSTANTS.field.password);
                  onPasswordChange(e);
                }}
                onKeyPress={e => handlePasswordKeyPress(e)}
              />
              <div aria-live='polite'>
                {errorMsg.length > 0 && (
                  <p
                    className='form-control-label xsmall text-error login-error'
                    id='login-form-error'>
                    {errorMsg}
                  </p>
                )}
              </div>
            </div>
            {isLoading ? (
              <Loading />
            ) : (
              <button
                type='button'
                id='login-button'
                className='btn-full-width login-button btn-secondary-md'
                onClick={e => onFormSubmit()}
                disabled={isLoginFormDisabled}>
                {translate(FeatureLoginPage.ActionLogInCapitalized)}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default withTranslations(LoginForm, loginTranslationConfig);
