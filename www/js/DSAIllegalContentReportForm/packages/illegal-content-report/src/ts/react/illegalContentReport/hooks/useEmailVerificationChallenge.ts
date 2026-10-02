import { useCallback, useState } from "react";
import type { SendReportResponse, SubmitRequestBody } from "../types";
import {
  getStoredVerificationToken,
  setStoredVerificationToken,
} from "../util/verificationTokenStorage";

const VERIFICATION_REQUIRED_MESSAGE = "Email Verification Required";

export interface UseEmailVerificationChallengeResult {
  isVerificationRequired: boolean;
  /** Returns true when the response is a verification challenge rather than a final result. */
  handleResponse: (response: SendReportResponse) => boolean;
  withVerification: (body: SubmitRequestBody, otpSessionToken?: string) => SubmitRequestBody;
  dismissVerification: () => void;
}

/**
 * Handles the backend's email-verification challenge for report submissions: sends the stored
 * verification token, and flags when the reporter must verify their email with an OTP.
 */
const useEmailVerificationChallenge = (): UseEmailVerificationChallengeResult => {
  const [isVerificationRequired, setIsVerificationRequired] = useState(false);

  const handleResponse = useCallback((response: SendReportResponse): boolean => {
    if (!response.success && response.message?.includes(VERIFICATION_REQUIRED_MESSAGE)) {
      setIsVerificationRequired(true);
      return true;
    }
    if (response.verificationToken) {
      setStoredVerificationToken(response.verificationToken);
    }
    return false;
  }, []);

  // A fresh OTP session replaces the stored token, which the backend may have just rejected.
  const withVerification = useCallback(
    (body: SubmitRequestBody, otpSessionToken?: string): SubmitRequestBody => {
      if (otpSessionToken) {
        return { ...body, OtpSessionToken: otpSessionToken };
      }
      const storedToken = getStoredVerificationToken();
      return storedToken ? { ...body, VerificationToken: storedToken } : body;
    },
    [],
  );

  const dismissVerification = useCallback(() => setIsVerificationRequired(false), []);

  return { isVerificationRequired, handleResponse, withVerification, dismissVerification };
};

export default useEmailVerificationChallenge;
