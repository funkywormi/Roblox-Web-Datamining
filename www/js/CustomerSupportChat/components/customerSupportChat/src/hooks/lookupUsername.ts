import * as http from "@rbx/core-scripts/http";
import { apiSet } from "../core/constants/services";
import { UsernameValidationContext, UsernameValidationResponse } from "../core/types/supportTicket";

/**
 * Asks auth-api whether a username is still registerable. A taken username is what we are
 * after: the underlying availability check consults username history, so names the account
 * has since moved away from still come back as taken.
 *
 * `birthday` is required whenever the request is unauthenticated, and auth-api dereferences it
 * without a null check on any context other than UsernameChange, so it is never optional here.
 */
const lookupUsername = async (
  username: string,
  birthday: string,
): Promise<UsernameValidationResponse> => {
  const { data } = await http.get<UsernameValidationResponse>(apiSet.validateUsername, {
    username,
    birthday,
    context: UsernameValidationContext.Unknown,
  });

  return data;
};

export default lookupUsername;
