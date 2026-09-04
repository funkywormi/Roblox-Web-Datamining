import { passwordValidatorErrorMessages } from '../constants/validationConstants';
import { TValidatePasswordParams } from '../types/signupTypes';
import { validatePassword } from '../../reactLanding/services/signupService';

const KOREA = 'Korea';

// Roblox.Platform.Membership.PasswordValidationResult
const validationResultCodes = {
  forbiddenPassword: 4,
  dumbStrings: 5
};

export const isPasswordBadLength = (password: string): boolean => {
  return password.length < 8 || password.length > 200;
};

export const isPasswordSameAsUsername = (password: string, username?: string): boolean => {
  return password === username;
};

// requirement from Korean Information Security Agency
const isPasswordWeakForKISA = (password: string): boolean => {
  // A minimum 8 digits passowrd containing a combination of uppercase and lowercase letter and number
  return !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
};

const isPasswordWeak = async (
  username: string,
  password: string,
  shouldRejectForbiddenPasswords: boolean
): Promise<boolean> => {
  const lowerCasePassword = password.toLowerCase();
  const validatePasswordParams: TValidatePasswordParams = {
    username,
    password
  };

  try {
    const { code } = await validatePassword(validatePasswordParams);
    if (
      code === validationResultCodes.dumbStrings ||
      (shouldRejectForbiddenPasswords && code === validationResultCodes.forbiddenPassword)
    ) {
      return true;
    }
  } catch (_) {
    console.error('Error validating password');
    // fail open, signup will validate
  }

  if (/^[\s]*$/.test(lowerCasePassword)) {
    // if the password only contains whitespace characters, consider it weak
    return true;
  }
  return false;
};

const getInvalidPasswordMessage = async (
  password: string,
  username?: string,
  country?: string,
  // Only signup V2 surfaces a blocklisted password to the user; the older forms leave it
  // to the signup call so their behavior does not change under them.
  shouldRejectForbiddenPasswords = false
): Promise<string> => {
  if (isPasswordBadLength(password)) {
    return passwordValidatorErrorMessages.PasswordBadLength;
  }
  if (isPasswordSameAsUsername(password, username)) {
    return passwordValidatorErrorMessages.PasswordContainsUsernameError;
  }
  if (country === KOREA && isPasswordWeakForKISA(password)) {
    return passwordValidatorErrorMessages.PasswordKISAComplexity;
  }
  if (
    username != null &&
    (await isPasswordWeak(username, password, shouldRejectForbiddenPasswords))
  ) {
    return passwordValidatorErrorMessages.PasswordComplexity;
  }
  return '';
};

export { getInvalidPasswordMessage as default };
