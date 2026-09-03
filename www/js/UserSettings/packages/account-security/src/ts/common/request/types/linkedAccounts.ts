import { UrlConfig } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

const LINKED_ACCOUNTS_SERVICE_URL = `${environmentUrls.apiGatewayUrl}/linked-accounts-service/v1`;
const REQUEST_TIMEOUT = 10000;

export enum LinkedAccountsError {
  UNKNOWN = 0,
}

export enum LinkedAccountsDirection {
  Incoming = 1,
  Outgoing = 2,
}

export enum LinkedAccountsLinkType {
  LinkedAccount = 1,
  LinkedRecoveryAccount = 2,
}

export enum AccountLinkUpdateIntentStatus {
  Pending = 1,
  Denied = 2,
  Canceled = 3,
  Expired = 4,
  Approved = 5,
}

export type LinkedAccount = {
  accountLinkId: number;
  ownerUserId: number;
  linkedUserId: number;
  username: string;
  currentLinkType: number;
  createdTime: string;
  updatedTime: string;
};

export type AccountLinkUpdateIntent = {
  accountLinkUpdateIntentId: number;
  accountLinkId: number;
  desiredLinkType: LinkedAccountsLinkType;
  status: AccountLinkUpdateIntentStatus;
  createdTime: string;
  updatedTime: string;
  expiryTime: string;
};

export type GetLinkedAccountsRequest = {
  direction: LinkedAccountsDirection;
  pageSize: number;
  pageToken: string;
};

export type GetLinkedAccountsResponse = {
  accountLinks: LinkedAccount[];
  nextPageToken: string;
};

export type RequestAccountLinkRequest = {
  linkedUserId: number;
  desiredLinkType: LinkedAccountsLinkType;
};

export type AccountLinkUpdateIntentRequest = {
  accountLinkUpdateIntentId: number;
};

export type DeleteAccountLinkRequest = {
  accountLinkId: number;
};

export type AccountLinkUpdateIntentResponse = {
  accountLinkUpdateIntent: AccountLinkUpdateIntent;
};

export type AcceptAccountLinkResponse = AccountLinkUpdateIntentResponse & {
  accountLink: LinkedAccount;
};

export type GetPendingAccountLinkResponse = AccountLinkUpdateIntentResponse;

export const GET_LINKED_ACCOUNTS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${LINKED_ACCOUNTS_SERVICE_URL}/linked-accounts`,
  timeout: REQUEST_TIMEOUT,
};

const linkedAccountsConfig = (path: string): UrlConfig => ({
  withCredentials: true,
  url: `${LINKED_ACCOUNTS_SERVICE_URL}/${path}`,
  timeout: REQUEST_TIMEOUT,
});

export const REQUEST_ACCOUNT_LINK_CONFIG = linkedAccountsConfig("account-links");
export const CANCEL_ACCOUNT_LINK_CONFIG = linkedAccountsConfig("cancel-account-link");
export const GET_PENDING_ACCOUNT_LINK_CONFIG = linkedAccountsConfig("pending-account-link");
export const ACCEPT_ACCOUNT_LINK_CONFIG = linkedAccountsConfig("accept-account-link");
// A linkee can ignore a request; an explicit deny endpoint is intentionally
// not exposed yet. Pending requests resolve through cancellation or expiry.
export const DELETE_ACCOUNT_LINK_CONFIG = linkedAccountsConfig("delete-account-link");
