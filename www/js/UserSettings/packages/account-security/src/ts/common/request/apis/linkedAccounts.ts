import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as LinkedAccounts from "../types/linkedAccounts";

export const getLinkedAccounts = (
  request: LinkedAccounts.GetLinkedAccountsRequest,
): Promise<
  Result<LinkedAccounts.GetLinkedAccountsResponse, LinkedAccounts.LinkedAccountsError | null>
> =>
  toResult(
    http.get(LinkedAccounts.GET_LINKED_ACCOUNTS_CONFIG, {
      ...request,
      linkType: LinkedAccounts.LinkedAccountsLinkType.LinkedRecoveryAccount,
    }),
    LinkedAccounts.LinkedAccountsError,
  );
