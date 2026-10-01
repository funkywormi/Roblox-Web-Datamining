import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Email from "../types/email";

export const updateForCurrentUser = (
  emailAddress: string,
): Promise<Result<void, Email.EmailError | null>> =>
  toResult(
    http.post(Email.UPDATE_FOR_CURRENT_USER_CONFIG, {
      emailAddress,
      skipVerificationEmail: true,
    }),
    Email.EmailError,
  );

export const updateForCurrentUserWithVerification = (
  emailAddress: string,
): Promise<Result<void, Email.EmailError | null>> =>
  toResult(
    http.post(Email.UPDATE_FOR_CURRENT_USER_CONFIG, {
      emailAddress,
      skipVerificationEmail: false,
    }),
    Email.EmailError,
  );

export const getEmailConfiguration = (): Promise<
  Result<Email.GetEmailConfigurationReturnType, Email.EmailError | null>
> => toResult(http.get(Email.GET_EMAIL_CONFIG), Email.EmailError);
