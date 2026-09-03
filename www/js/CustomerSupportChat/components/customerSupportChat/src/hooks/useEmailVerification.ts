import { useState, useCallback, useRef, useEffect } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { sendCode, resendCode } from "../core/services/otpService";
import useAutoVerifyCode from "./useAutoVerifyCode";

const VERIFICATION_CODE_LENGTH = 6;
const SECONDS_BETWEEN_RESENDS = 30;

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
  sendCodeError: string; // Error when sending initial code

  // Actions
  verify: (email: string) => Promise<void>;
  handleCodeChange: (value: string) => void;
  handleResendCode: () => Promise<void>;
  closeModal: (keepVerifiedState?: boolean) => void;
  resetVerification: () => void;
}

export const useEmailVerification = (
  translate: WithTranslationsProps["translate"],
): UseEmailVerificationResult => {
  const [showModal, setShowModal] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [otpSessionToken, setOtpSessionToken] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [sendCodeError, setSendCodeError] = useState("");
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
    setCode("");
    setCodeError("");
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

  const verify = useCallback(
    async (email: string) => {
      // Email validation is handled by the form, so we can proceed directly
      setIsSendingCode(true);
      setCodeError("");
      setSendCodeError("");
      try {
        const response = await sendCode({
          origin: "SupportFormEmailVerification",
          contactType: "Email",
          contactValue: email,
        });
        setOtpSessionToken(response.otpSessionToken);
        setShowModal(true);
        setCode("");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error sending OTP code:", error);

        // Check if it's a rate limit error
        const httpError = error as { status?: number };
        const status = httpError.status;

        if (status === 429) {
          setSendCodeError(translate("Message.TooManyRequests"));
        } else {
          setSendCodeError(translate("Message.SendCodeError"));
        }
      } finally {
        setIsSendingCode(false);
      }
    },
    [translate],
  );

  const handleCodeChange = useCallback((value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH);
    setCode(sanitized);
    setCodeError("");
  }, []);

  const handleResendCode = useCallback(async () => {
    setIsResending(true);
    setCodeError("");
    setCode(""); // Clear the existing code so user can enter new one
    try {
      const response = await resendCode({
        otpSessionToken,
        origin: "SupportFormEmailVerification",
        contactType: "Email",
      });
      setOtpSessionToken(response.otpSessionToken);
      startCountdownTimer();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error resending OTP code:", error);

      // Check if it's a rate limit error
      const httpError = error as { status?: number };
      const status = httpError.status;
      if (status === 429) {
        setCodeError(translate("Message.TooManyRequests"));
      } else {
        setCodeError(translate("Message.ResendError"));
      }
    } finally {
      setIsResending(false);
    }
  }, [otpSessionToken, startCountdownTimer, translate]);

  const resetVerification = useCallback(() => {
    setIsCodeVerified(false);
    setOtpSessionToken("");
    setCode("");
    setCodeError("");
    setSendCodeError("");
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
    origin: "SupportFormEmailVerification",
    contactType: "Email",
    onValidationStart: useCallback(() => {
      setIsValidatingCode(true);
      setCodeError("");
    }, []),
    onValidationSuccess: useCallback(() => {
      setIsCodeVerified(true);
      closeModal(true);
    }, [closeModal]),
    onValidationError: useCallback(
      (error: unknown) => {
        // Check if it's an HTTP error with a status code
        // The error object from axios/http has status directly on it
        const httpError = error as { status?: number };
        const status = httpError.status;

        if (status === 429) {
          // Rate limit error
          setCodeError(translate("Message.TooManyRequests"));
        } else if (status === 403) {
          // Invalid code
          setCodeError(translate("Message.CodeInvalid"));
        } else {
          // Generic error
          setCodeError(translate("Message.ValidationError"));
        }
      },
      [translate],
    ),
    onValidationEnd: useCallback(() => {
      setIsValidatingCode(false);
    }, []),
  });

  return {
    showModal,
    code,
    codeError,
    sendCodeError,
    isValidatingCode,
    isCodeVerified,
    isResendEnabled,
    timeUntilResend,
    isResending,
    isSendingCode,
    otpSessionToken,
    verify,
    handleCodeChange,
    handleResendCode,
    closeModal,
    resetVerification,
  };
};
