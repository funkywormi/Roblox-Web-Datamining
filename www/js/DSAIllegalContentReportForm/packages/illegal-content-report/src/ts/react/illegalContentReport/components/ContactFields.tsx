import React, { useEffect, useRef } from 'react';
import * as EmailValidator from 'email-validator';
import { useTranslations } from '../../util/translation';
import { Limit } from '../constants';
import OTPModal from './OTPModal';
import { useEmailVerification } from '../hooks/useEmailVerification';
import VerificationCodeModal from './VerificationCodeModal';

const CHECKMARK_UNICODE = 0x2713; // ✓ symbol

interface FieldTitleProps {
  /** The field label text */
  label: string;
  /** Whether the field is optional (shows "(Optional)" subtitle instead of asterisk) */
  optional?: boolean;
}

/**
 * Reusable component for rendering field titles with required/optional indicators.
 * For optional fields: Shows label with an inline "(Optional)" indicator
 * For required fields: Shows label with asterisk
 */
const FieldTitle: React.FC<FieldTitleProps> = ({ label, optional = false }) => {
  const { translate } = useTranslations();

  if (optional) {
    return (
      <h5>
        {label} <span className='dsa-reason-limit'>{translate('Label.Optional')}</span>
      </h5>
    );
  }

  const title = `${label}*`;
  return <h5>{title}</h5>;
};

/**
 * ContactFields component for collecting user contact information.
 * Handles name and email inputs with real-time email validation.
 * Supports optional mode for special cases like CSE reports.
 */
export interface ContactFieldsProps {
  /** Current name value */
  name: string;
  /** Current email value */
  email: string;
  /** Callback when name changes */
  onNameChange: (value: string) => void;
  /** Callback when email changes */
  onEmailChange: (value: string) => void;
  /** Whether fields are optional (removes asterisk, adds "(Optional)" label) */
  optional?: boolean;
  /** When true open the OTP modal */
  openOtpModal?: boolean;
  /** Callback when OTP is successfully verified, returns the session token */
  onOtpVerified?: (otpSessionToken: string) => void;
  /** Callback when verification status changes */
  onVerificationStatusChange?: (isVerified: boolean) => void;
  /** Callback when user closes the OTP modal without verifying */
  onOtpModalClosedWithoutVerify?: () => void;
}

/**
 * Reusable contact information component with built-in email validation.
 * Provides real-time email format validation and handles optional field display.
 * Used across all illegal content report forms for consistent contact collection.
 */
const ContactFields: React.FC<ContactFieldsProps> = ({
  name,
  email,
  onNameChange,
  onEmailChange,
  optional = false,
  openOtpModal = false,
  onOtpVerified,
  onVerificationStatusChange,
  onOtpModalClosedWithoutVerify
}) => {
  const { translate } = useTranslations();

  const {
    showModal,
    code,
    codeError,
    isValidatingCode,
    isCodeVerified,
    isResendEnabled,
    timeUntilResend,
    isResending,
    emailError,
    verify,
    handleCodeChange: handleCodeChangeFromHook,
    handleResendCode,
    closeModal,
    resetVerification,
    clearEmailError,
    clearCodeError
  } = useEmailVerification(onOtpVerified, onVerificationStatusChange);

  /**
   * Reset verification states when email is cleared externally (e.g., after form submission).
   * This ensures a clean state when the user starts a new report.
   */
  useEffect(() => {
    if (email === '' && isCodeVerified) {
      resetVerification();
      if (onVerificationStatusChange) {
        onVerificationStatusChange(false);
      }
    }
  }, [email, isCodeVerified, resetVerification, onVerificationStatusChange]);

  /**
   * When openOtpModal is true (e.g. backend required verification), send OTP and open
   * the modal immediately instead of showing the Verify button. Only trigger once per transition.
   */
  const didOpenRef = useRef(false);
  useEffect(() => {
    if (!openOtpModal) {
      didOpenRef.current = false;
      return;
    }
    if (didOpenRef.current) return;
    if (!email.trim() || !EmailValidator.validate(email)) return;
    didOpenRef.current = true;
    verify(email).catch(() => {
      /* errors handled in hook (emailError/codeError state) */
    });
  }, [openOtpModal, email, verify]);

  /**
   * Handles email input changes.
   * Clears previous errors and resets verification status if needed.
   */
  const handleEmailChange = (newEmail: string) => {
    onEmailChange(newEmail);

    // Clear previous errors when user is typing
    if (emailError) {
      clearEmailError();
    }
    if (codeError) {
      clearCodeError();
    }

    // Reset verification status when email changes
    if (isCodeVerified) {
      resetVerification();
      if (onVerificationStatusChange) {
        onVerificationStatusChange(false);
      }
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCodeChangeFromHook(e.target.value);
  };

  return (
    <React.Fragment>
      <div id='information-header' className='section'>
        <h2>{translate('Title.Contact')}</h2>
      </div>
      <div id='reporter-info-name' className='section'>
        <FieldTitle label={translate('Label.Name')} optional={optional} />
        <input
          value={name}
          type='text'
          className='form-control input-field'
          maxLength={Limit.MAX_NAME_LENGTH}
          onChange={e => onNameChange(e.target.value)}
        />
      </div>

      <div id='reporter-info-email' className='section'>
        <FieldTitle label={translate('Label.Email')} optional={optional} />
        {optional && (
          <p className='dsa-reason-limit'>({translate('Message.OptionalEmailNote')})</p>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <input
            value={email}
            type='text'
            className={`form-control input-field ${emailError ? 'input-field-error' : ''}`}
            maxLength={Limit.MAX_EMAIL_LENGTH}
            onChange={e => handleEmailChange(e.target.value)}
            style={{ flex: 1 }}
            disabled={isCodeVerified}
          />
          {isCodeVerified && (
            <div className='verification-checkmark' title={translate('Message.EmailVerified')}>
              {String.fromCharCode(CHECKMARK_UNICODE)}
            </div>
          )}
        </div>
        {emailError && <span className='text-error field-validation-error'>{emailError}</span>}
        {!emailError && codeError && !showModal && (
          <span className='text-error field-validation-error'>{codeError}</span>
        )}
      </div>

      <OTPModal
        open={showModal}
        onClose={() => {
          closeModal(false);
          onOtpModalClosedWithoutVerify?.();
        }}
        title={
          isCodeVerified
            ? translate('Title.Modal.CodeVerified')
            : translate('Title.Modal.EnterCode')
        }>
        {isCodeVerified ? (
          <div className='otp-modal-content' style={{ padding: '16px' }}>
            <p
              className='success-text'
              style={{
                marginBottom: '16px',
                textAlign: 'center',
                fontSize: '16px'
              }}>
              {String.fromCharCode(CHECKMARK_UNICODE)} {translate('Message.Modal.CodeVerified')}
            </p>
          </div>
        ) : (
          <div className='otp-modal-content'>
            <VerificationCodeModal
              code={code}
              codeError={codeError}
              isValidatingCode={isValidatingCode}
              isResendEnabled={isResendEnabled}
              timeUntilResend={timeUntilResend}
              isResending={isResending}
              onCodeChange={handleCodeChange}
              onResendCode={handleResendCode}
            />
          </div>
        )}
      </OTPModal>
    </React.Fragment>
  );
};

export default ContactFields;
