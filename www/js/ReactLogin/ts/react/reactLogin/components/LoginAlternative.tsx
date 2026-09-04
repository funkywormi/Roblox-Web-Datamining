import React, { useEffect } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { CrossDeviceLoginDisplayCodeService } from 'Roblox';
import { FeatureLoginPage } from '../../common/constants/translationConstants';
import { loginTranslationConfig } from '../translation.config';
import {
  TLoginWithAuthTokenRenderEvent,
  TLoginWithAuthTokenParams
} from '../../common/types/crossDeviceLoginTypes';
import { sendXdlButtonClickEvent } from '../services/eventService';

export const LoginAlternative = ({
  onCrossDeviceLoginCodeValidated,
  isOtpLoginEnabled,
  openOtpLoginModal,
  showPasskeyLoginButton,
  openPasskeyLoginFlow,
  isOneTimeCodeDesignUpdated,
  translate
}: {
  isOtpLoginEnabled: boolean;
  openOtpLoginModal: () => void;
  showPasskeyLoginButton: boolean;
  openPasskeyLoginFlow: (mediation: string) => void;
  onCrossDeviceLoginCodeValidated: (data: TLoginWithAuthTokenParams) => void;
  isOneTimeCodeDesignUpdated: boolean;
  translate: WithTranslationsProps['translate'];
}): JSX.Element => {
  const handleCrossDeviceLoginClick = () => {
    sendXdlButtonClickEvent();
    CrossDeviceLoginDisplayCodeService.openModal();
  };

  const handlePasskeyLoginClick = () => {
    openPasskeyLoginFlow('required');
  };

  const getCrossDeviceLoginButtonString = (): string => {
    if (isOtpLoginEnabled) {
      if (isOneTimeCodeDesignUpdated) {
        return FeatureLoginPage.ActionUseAnotherDevice;
      }
      return FeatureLoginPage.ActionLogInAnotherDevice;
    }
    return FeatureLoginPage.ActionAnotherLoggedInDevice;
  };

  useEffect(() => {
    const onCrossDeviceCodeValidated = (event: TLoginWithAuthTokenRenderEvent) => {
      if (event.detail) {
        onCrossDeviceLoginCodeValidated(event.detail);
      }
    };

    window.addEventListener(
      'OnCrossDeviceCodeValidated',
      onCrossDeviceCodeValidated as EventListener
    );
    return () => {
      window.removeEventListener(
        'OnCrossDeviceCodeValidated',
        onCrossDeviceCodeValidated as EventListener
      );
    };
  }, []);

  return (
    <div>
      <div className='alternative-login-divider-container'>
        <div className='rbx-divider alternative-login-divider' />
        {!isOtpLoginEnabled && (
          <div className='divider-text-container'>
            <span className='divider-text'>{translate(FeatureLoginPage.LabelLoginWithYour)}</span>
          </div>
        )}
      </div>
      {isOtpLoginEnabled && (
        <button
          type='button'
          id='otp-login-button'
          className='btn-full-width btn-control-md otp-login-button'
          onClick={openOtpLoginModal}>
          {translate(FeatureLoginPage.ActionLogInEmailOneTimeCode)}
        </button>
      )}
      {showPasskeyLoginButton && (
        <button
          type='button'
          id='passkey-login-button'
          className='btn-full-width btn-control-md passkey-login-button'
          onClick={handlePasskeyLoginClick}>
          {translate(FeatureLoginPage.ActionLogInPasskey)}
        </button>
      )}
      <button
        type='button'
        id='cross-device-login-button'
        className='btn-full-width btn-control-md cross-device-login-button'
        onClick={handleCrossDeviceLoginClick}>
        <span>{translate(getCrossDeviceLoginButtonString())}</span>
      </button>
    </div>
  );
};

export default withTranslations(LoginAlternative, loginTranslationConfig);
