import { PromptRequestService } from "../../../requestService";
import { InputValidator } from "../../../../common/inputValidation";
import {
  AccountSecurityPromptResources,
  mapPasswordValidationStatusToResource,
} from "../../../constants/resources";

/**
 * Returns null (no error) if the argument is an acceptable password (meets
 * certain requirements and does not match the user's username).
 */
const validatePassword =
  (
    requestService: PromptRequestService,
    resources: AccountSecurityPromptResources,
    username: string,
    defaultErrorMessage: string,
  ): InputValidator =>
  async (value: string) => {
    const result = await requestService.password.validate(username, value);
    if (result.isError) {
      return defaultErrorMessage;
    }

    return mapPasswordValidationStatusToResource(resources, result.value);
  };

export default validatePassword;
