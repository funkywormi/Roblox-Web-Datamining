import { passwordValidatorErrorMessages } from "../constants/validationConstants";
import { TValidatePasswordParams } from "../types/signupTypes";
import { validatePassword } from "../services/signupService";

const KOREA = "Korea";
const isPasswordBadLength = (password: string): boolean =>
  password.length < 8 || password.length > 200;

const isPasswordSameAsUsername = (password: string, username?: string): boolean =>
  password === username;

// requirement from Korean Information Security Agency
const isPasswordWeakForKISA = (password: string): boolean =>
  // A minimum 8 digits passowrd containing a combination of uppercase and lowercase letter and number
  !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
const isPasswordWeak = async (username: string, password: string): Promise<boolean> => {
  const lowerCasePassword = password.toLowerCase();
  const validatePasswordParams: TValidatePasswordParams = {
    username,
    password,
  };

  try {
    const validatePasswordResponse = await validatePassword(validatePasswordParams);
    if (validatePasswordResponse.code === 5) {
      return true;
    }
  } catch (_) {
    console.error("Error validating password");
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
  if (username != null && (await isPasswordWeak(username, password))) {
    return passwordValidatorErrorMessages.PasswordComplexity;
  }
  return "";
};

export { getInvalidPasswordMessage as default };
