/**
 * Starts an ODP session on child-requests-api. Omitting `odpProfileId` starts a fresh ODP; supplying
 * one targets that durable ODP.
 */

import transport from "./requestTransport";

import { START_ODP_SESSION_URL } from "../constants/urls";

export type StartOdpSessionRequest = {
  requestType: string;
  // requestDetails can be null for consents where parents freely pick a value
  requestDetails?: Record<string, string | null>;
  isOdpInitiatedRequest?: boolean;
  odpProfileId?: string;
};

export type StartOdpSessionResponse = {
  odpSessionId: string;
};

export type OdpSessionApi = {
  startOdpSession: (request: StartOdpSessionRequest) => Promise<StartOdpSessionResponse>;
};

function serializeRequest(request: StartOdpSessionRequest): Record<string, unknown> {
  return {
    requestType: request.requestType,
    requestDetails: request.requestDetails,
    isOdpInitiatedRequest: request.isOdpInitiatedRequest === true,
    odpProfileId: request.odpProfileId,
  };
}

async function startOdpSession(request: StartOdpSessionRequest): Promise<StartOdpSessionResponse> {
  const response = await transport.post<StartOdpSessionResponse>(
    { url: START_ODP_SESSION_URL, withCredentials: true },
    serializeRequest(request),
  );
  return response.data;
}

export const odpSessionApi: OdpSessionApi = {
  startOdpSession,
};
