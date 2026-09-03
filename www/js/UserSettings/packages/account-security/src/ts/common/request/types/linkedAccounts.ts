import { UrlConfig } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

const LINKED_ACCOUNTS_URL = `${environmentUrls.apiGatewayUrl}/linked-accounts-service/v1/linked-accounts`;

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

export type LinkedAccount = {
  accountLinkId: number;
  ownerUserId: number;
  linkedUserId: number;
  username: string;
  currentLinkType: number;
  createdTime: string;
  updatedTime: string;
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

export const GET_LINKED_ACCOUNTS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: LINKED_ACCOUNTS_URL,
  timeout: 10000,
};
