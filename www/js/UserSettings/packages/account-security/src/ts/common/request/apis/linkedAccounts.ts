import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as LinkedAccounts from "../types/linkedAccounts";

// This module is limited to link-lifecycle endpoints. Recovery-intent calls
// live in accountRecovery.ts because Account Recovery owns those endpoints.
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

export const requestAccountLink = (
  request: LinkedAccounts.RequestAccountLinkRequest,
): Promise<
  Result<LinkedAccounts.AccountLinkUpdateIntentResponse, LinkedAccounts.LinkedAccountsError | null>
> =>
  toResult(
    http.post(LinkedAccounts.REQUEST_ACCOUNT_LINK_CONFIG, request),
    LinkedAccounts.LinkedAccountsError,
  );

export const cancelAccountLink = (
  request: LinkedAccounts.AccountLinkUpdateIntentRequest,
): Promise<
  Result<LinkedAccounts.AccountLinkUpdateIntentResponse, LinkedAccounts.LinkedAccountsError | null>
> =>
  toResult(
    http.post(LinkedAccounts.CANCEL_ACCOUNT_LINK_CONFIG, request),
    LinkedAccounts.LinkedAccountsError,
  );

export const getPendingAccountLink = (
  ownerUserId: number,
): Promise<
  Result<LinkedAccounts.GetPendingAccountLinkResponse, LinkedAccounts.LinkedAccountsError | null>
> =>
  toResult(
    http.get(LinkedAccounts.GET_PENDING_ACCOUNT_LINK_CONFIG, { ownerUserId }),
    LinkedAccounts.LinkedAccountsError,
  );

export const acceptAccountLink = (
  request: LinkedAccounts.AccountLinkUpdateIntentRequest,
): Promise<
  Result<LinkedAccounts.AcceptAccountLinkResponse, LinkedAccounts.LinkedAccountsError | null>
> =>
  toResult(
    http.post(LinkedAccounts.ACCEPT_ACCOUNT_LINK_CONFIG, request),
    LinkedAccounts.LinkedAccountsError,
  );

export const deleteAccountLink = (
  request: LinkedAccounts.DeleteAccountLinkRequest,
): Promise<Result<void, LinkedAccounts.LinkedAccountsError | null>> =>
  toResult(
    http.post(LinkedAccounts.DELETE_ACCOUNT_LINK_CONFIG, request),
    LinkedAccounts.LinkedAccountsError,
  );
