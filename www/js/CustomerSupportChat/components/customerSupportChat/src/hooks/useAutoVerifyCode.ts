import { useEffect, useRef } from "react";
import { validateCode } from "../core/services/otpService";

interface UseAutoVerifyCodeOptions {
  code: string;
  codeLength: number;
  otpSessionToken: string;
  isValidatingCode: boolean;
  origin: string;
  contactType: "Email";
  onValidationStart: () => void;
  onValidationSuccess: () => void;
  onValidationError: (error: unknown) => void;
  onValidationEnd: () => void;
}

/**
 * Custom hook that automatically validates an OTP code when it reaches the required length.
 * Prevents duplicate validations for the same code using a ref to track the last validated code.
 */
const useAutoVerifyCode = ({
  code,
  codeLength,
  otpSessionToken,
  isValidatingCode,
  origin,
  contactType,
  onValidationStart,
  onValidationSuccess,
  onValidationError,
  onValidationEnd,
}: UseAutoVerifyCodeOptions): void => {
  const lastValidatedCodeRef = useRef("");
  const lastOtpSessionTokenRef = useRef("");

  // Reset the last validated code when the OTP session token changes (new code sent)
  useEffect(() => {
    if (otpSessionToken !== lastOtpSessionTokenRef.current) {
      lastValidatedCodeRef.current = "";
      lastOtpSessionTokenRef.current = otpSessionToken;
    }
  }, [otpSessionToken]);

  // Reset the last validated code when the code input is cleared (e.g., on resend)
  useEffect(() => {
    if (code === "") {
      lastValidatedCodeRef.current = "";
    }
  }, [code]);

  useEffect(() => {
    const verifyCodeAutomatically = async () => {
      if (
        code.length === codeLength &&
        !isValidatingCode &&
        code !== lastValidatedCodeRef.current
      ) {
        lastValidatedCodeRef.current = code;
        onValidationStart();
        try {
          await validateCode({
            passCode: code,
            otpSessionToken,
            contactType,
            origin,
          });
          onValidationSuccess();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error validating OTP code:", error);
          onValidationError(error);
        } finally {
          onValidationEnd();
        }
      }
    };
    // eslint-disable-next-line no-void
    void verifyCodeAutomatically();
  }, [
    code,
    codeLength,
    otpSessionToken,
    isValidatingCode,
    origin,
    contactType,
    onValidationStart,
    onValidationSuccess,
    onValidationError,
    onValidationEnd,
  ]);
};

export default useAutoVerifyCode;
