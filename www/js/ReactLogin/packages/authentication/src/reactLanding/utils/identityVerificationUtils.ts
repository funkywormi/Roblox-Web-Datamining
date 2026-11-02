import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { localStorageService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import {
  koreaIdVerification,
  identityVerificationResultTokenName,
} from "../constants/signupConstants";

export const cleanupIdentityVerificationResultToken = (): void => {
  localStorageService.removeLocalStorage(identityVerificationResultTokenName);
};

export const identityVerificationResultTokenErrorHandler = (): void => {
  cleanupIdentityVerificationResultToken();
  window.location.href = getAbsoluteUrl(koreaIdVerification);
};

export const isUnderThresholdAge = (
  thresholdAge: number,
  year: string,
  month: string,
  day: string,
): boolean => {
  if (!year || !month || !day) {
    return false;
  }

  const testDate = new Date(`${month} ${day} ${year}`);
  const now = new Date();
  now.setFullYear(now.getFullYear() - thresholdAge);
  return testDate > now;
};

export default {
  cleanupIdentityVerificationResultToken,
  identityVerificationResultTokenErrorHandler,
  isUnderThresholdAge,
};
