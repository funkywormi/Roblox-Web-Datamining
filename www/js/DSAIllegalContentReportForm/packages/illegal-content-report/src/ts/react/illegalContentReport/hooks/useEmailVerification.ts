import { useState, useCallback, useRef, useEffect } from 'react';
import * as EmailValidator from 'email-validator';
import { useTranslations } from '../../util/translation';
import { sendCode, resendCode } from '../services/otpService';
import useAutoVerifyCode from './useAutoVerifyCode';

const VERIFICATION_CODE_LENGTH = 6;
const SECONDS_BETWEEN_RESENDS = 30;

/**
 * Helper function to extract HTTP status code from error
 */
const getErrorStatusCode = (error: unknown): number | null => {
  if (typeof error === 'object' && error !== null) {
    // Check for axios-style error structure
    const axiosError = error as any;
    if (axiosError.response?.status) {
      return axiosError.response.status;
    }
    // Check for other error structures
    if (axiosError.status) {
      return axiosError.status;
    }
  }
  return null;
};

export interface UseEmailVerificationResult {
  // State
  showModal: boolean;
  code: string;
  codeError: string;
  isValidatingCode: boolean;
  isCodeVerified: boolean;
  isResendEnabled: boolean;
  timeUntilResend: number;
  isResending: boolean;
  isSendingCode: boolean;
  otpSessionToken: string;
  emailError: string;

  // Actions
  verify: (email: string) => Promise<void>;
  handleCodeChange: (value: string) => void;
  handleResendCode: () => Promise<void>;
  closeModal: (keepVerifiedState?: boolean) => void;
  resetVerification: () => void;
  clearEmailError: () => void;
  clearCodeError: () => void;
}

export const useEmailVerification = (
  onVerified?: (token: string) => void,
  onVerificationStatusChange?: (isVerified: boolean) => void
): UseEmailVerificationResult => {
  const { translate } = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [otpSessionToken, setOtpSessionToken] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [timeUntilResend, setTimeUntilResend] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdownTimer = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setIsResendEnabled(false);
    setTimeUntilResend(SECONDS_BETWEEN_RESENDS);

    countdownIntervalRef.current = setInterval(() => {
      setTimeUntilResend(time => {
        if (time <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setIsResendEnabled(true);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }, []);

  const closeModal = useCallback((keepVerifiedState = false) => {
    setShowModal(false);
    setCode('');
    setCodeError('');
    setIsResendEnabled(false);
    setTimeUntilResend(0);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (!keepVerifiedState) {
      setIsCodeVerified(false);
    }
  }, []);

  const clearEmailError = useCallback(() => {
    setEmailError('');
  }, []);

  const clearCodeError = useCallback(() => {
    setCodeError('');
  }, []);

  const verify = useCallback(
    async (email: string) => {
      // Validate email before sending code
      if (!email.trim() || !EmailValidator.validate(email)) {
        setEmailError(translate('Message.EmailError'));
        return;
      }

      setIsSendingCode(true);
      setCodeError('');
      setEmailError('');
      try {
        const response = await sendCode({
          origin: 'IllegalContentReport',
          contactType: 'Email',
          contactValue: email
        });
        setOtpSessionToken(response.otpSessionToken);
        setShowModal(true);
        setCode('');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error sending OTP code:', error);
        
        const statusCode = getErrorStatusCode(error);
        if (statusCode === 429) {
          // Rate limit error - show specific message but don't disable the button
          setCodeError(translate('Message.RateLimitError'));
        } else {
          // Other errors - show generic error and disable button
          setEmailError(translate('Message.EmailError'));
        }
      } finally {
        setIsSendingCode(false);
      }
    },
    [translate]
  );

  const handleCodeChange = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, '');
    if (sanitized.length <= VERIFICATION_CODE_LENGTH) {
      setCode(sanitized);
      setCodeError('');
    }
  }, []);

  const handleResendCode = useCallback(async () => {
    setIsResending(true);
    setCodeError('');
    try {
      const response = await resendCode({
        otpSessionToken,
        origin: 'IllegalContentReport',
        contactType: 'Email'
      });
      setOtpSessionToken(response.otpSessionToken);
      startCountdownTimer();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error resending OTP code:', error);
      
      const statusCode = getErrorStatusCode(error);
      if (statusCode === 429) {
        setCodeError(translate('Message.RateLimitError'));
      } else {
        setCodeError(translate('Message.ResendError'));
      }
    } finally {
      setIsResending(false);
    }
  }, [otpSessionToken, startCountdownTimer, translate]);

  const resetVerification = useCallback(() => {
    // Clear all OTP states
    setShowModal(false);
    setIsSendingCode(false);
    setOtpSessionToken('');
    setCode('');
    setCodeError('');
    setEmailError('');
    setIsValidatingCode(false);
    setIsCodeVerified(false);
    setIsResendEnabled(false);
    setTimeUntilResend(0);
    setIsResending(false);

    // Clear countdown timer
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Start countdown timer when modal opens
  useEffect(() => {
    if (showModal && !isCodeVerified) {
      startCountdownTimer();
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [showModal, isCodeVerified, startCountdownTimer]);

  // Auto-verify when 6 digits are entered
  useAutoVerifyCode({
    code,
    codeLength: VERIFICATION_CODE_LENGTH,
    otpSessionToken,
    isValidatingCode,
    origin: 'IllegalContentReport',
    contactType: 'Email',
    onValidationStart: useCallback(() => {
      setIsValidatingCode(true);
      setCodeError('');
    }, []),
    onValidationSuccess: useCallback(() => {
      setIsCodeVerified(true);
      if (onVerified) {
        onVerified(otpSessionToken);
      }
      if (onVerificationStatusChange) {
        onVerificationStatusChange(true);
      }
      setTimeout(() => {
        closeModal(true);
      }, 1500);
    }, [onVerified, otpSessionToken, onVerificationStatusChange, closeModal]),
    onValidationError: useCallback(() => {
      setCodeError(translate('Message.CodeInvalid'));
    }, [translate]),
    onValidationEnd: useCallback(() => {
      setIsValidatingCode(false);
    }, [])
  });

  return {
    showModal,
    code,
    codeError,
    isValidatingCode,
    isCodeVerified,
    isResendEnabled,
    timeUntilResend,
    isResending,
    isSendingCode,
    otpSessionToken,
    emailError,
    verify,
    handleCodeChange,
    handleResendCode,
    closeModal,
    resetVerification,
    clearEmailError,
    clearCodeError
  };
};
