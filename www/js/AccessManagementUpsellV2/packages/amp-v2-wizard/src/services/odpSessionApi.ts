/**
 * Starts an ODP session on child-requests-api. Omitting `odpProfileId` starts a fresh ODP; supplying
 * one targets that durable ODP.
 */

import * as http from "@rbx/core-scripts/http";

import { START_ODP_SESSION_URL } from "../constants/urls";

export type StartOdpSessionRequest = {
  requestType: string;
  requestDetails?: Record<string, string>;
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
  const response = await http.post<StartOdpSessionResponse>(
    { url: START_ODP_SESSION_URL, withCredentials: true },
    serializeRequest(request),
  );
  return response.data;
}

export const odpSessionApi: OdpSessionApi = {
  startOdpSession,
};
