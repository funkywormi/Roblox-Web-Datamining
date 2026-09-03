import React, { Fragment } from 'react';
import { useTranslations } from '../../util/translation';

const VERIFICATION_CODE_LENGTH = 6;

export interface VerificationCodeModalProps {
  code: string;
  codeError: string;
  isValidatingCode: boolean;
  isResendEnabled: boolean;
  timeUntilResend: number;
  isResending: boolean;
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResendCode: () => void;
}

const VerificationCodeModal: React.FC<VerificationCodeModalProps> = ({
  code,
  codeError,
  isValidatingCode,
  isResendEnabled,
  timeUntilResend,
  isResending,
  onCodeChange,
  onResendCode
}) => {
  const { translate } = useTranslations();

  const ResendButtonComponent = () => {
    if (isResending) {
      return (
        <button type='button' className='btn-secondary-md email-verify-code-button' disabled>
          <span className='spinner spinner-xs spinner-no-margin' />
        </button>
      );
    }
    return (
      <button
        type='button'
        className='btn-secondary-md email-verify-code-button'
        onClick={onResendCode}
        disabled={!isResendEnabled}>
        {isResendEnabled
          ? translate('Action.ResendCode')
          : `${translate('Action.CodeSent')} (${timeUntilResend})`}
      </button>
    );
  };

  return (
    <Fragment>
      <p className='email-verify-code-help-text'>{translate('Message.Modal.EnterCode')}</p>
      <input
        placeholder={translate('Label.CodePlaceholder')}
        onChange={onCodeChange}
        type='text'
        inputMode='numeric'
        maxLength={VERIFICATION_CODE_LENGTH}
        className='form-control input-field email-verify-code-input'
        value={code}
        disabled={isValidatingCode}
        autoComplete='off'
      />
      <p
        className={
          isValidatingCode
            ? 'muted-text email-verify-code-error-text'
            : 'text-error email-verify-code-error-text'
        }>
        {isValidatingCode ? translate('Message.Validating') : codeError}
      </p>
      <ResendButtonComponent />
    </Fragment>
  );
};

export default VerificationCodeModal;
