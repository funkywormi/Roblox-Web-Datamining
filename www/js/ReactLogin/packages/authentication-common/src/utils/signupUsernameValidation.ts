import {
  usernameValidationMessageMap,
  validateUsernameContext,
  validationMessages,
} from "../constants/signupConstants";
import { validateUsername } from "../services/signupService";
import { parseErrorCode } from "./requestUtils";
import getInvalidUsernameMessage from "./usernameValidationUtils";

/**
 * The signup username check: the client-side rules first, then `POST /v1/usernames/validate`.
 * @param onAvailabilityChecked called once the endpoint answers, so a caller can tell an
 * available username from a failed request (both return `""`), as SignUpV2 does.
 * @returns the translation key of the error to show, or `""` if there is none.
 */
export const usernameValidationMessage = async (
  username: string,
  birthdate: Date | null,
  onAvailabilityChecked?: () => void,
): Promise<string> => {
  if (username === "") {
    return validationMessages.usernameRequired;
  }

  const localValidationMessage = getInvalidUsernameMessage(username);
  if (localValidationMessage !== "") {
    return localValidationMessage;
  }

  if (birthdate == null) {
    return validationMessages.birthdayRequired;
  }

  try {
    const response = await validateUsername({
      username,
      context: validateUsernameContext,
      birthday: birthdate,
    });
    onAvailabilityChecked?.();
    return usernameValidationMessageMap.get(response.code) ?? ""; // TODO: this should not be an empty string
  } catch (error) {
    const errorCode = parseErrorCode(error);
    return errorCode === 2 ? validationMessages.birthdayRequired : ""; // TODO: this should not be an empty string
  }
};
