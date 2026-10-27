import { window } from '@rbx/core-lib/browser';
import httpService from '@rbx/amp-v2-wizard/services/requestTransport';
import RequestType from '../enums/RequestType';
import { newParentalRequest, broadcastParentalRequest } from '../constants/urlConstants';

const rememberCooldown = (settingName: string | undefined, lockedUntil: string): void => {
  try {
    window?.localStorage.setItem(
      `Roblox.ParentalRequest.${String(settingName)}CooldownExpirationTime`,
      JSON.stringify(lockedUntil)
    );
  } catch {
    // Storage is only a client-side cooldown hint; the request itself already succeeded.
  }
};

type TNewParentalRequestParams = {
  email: string;
  requestType: RequestType;
  requestDetails?: Record<string, unknown>;
  auditData?: string;
};

type TParentalRequestResponse = {
  lockedUntil: string;
  sessionId: string;
};

type TBoadcastParentalRequestParams = {
  requestType: RequestType;
  requestDetails?: Record<string, unknown>;
};

const parentalRequestService = {
  sendRequestToNewParent: async (
    params: TNewParentalRequestParams
  ): Promise<TParentalRequestResponse> => {
    const { auditData, ...requestBody } = params;
    const urlConfig = {
      url: newParentalRequest,
      withCredentials: true,
      ...(auditData ? { headers: { 'rbx-audit-data': auditData } } : {})
    };
    const { requestDetails } = requestBody;

    const response = await httpService.post<TParentalRequestResponse>(urlConfig, requestBody);
    if (requestDetails) {
      const settingName = Object.keys(requestDetails)[0];
      rememberCooldown(settingName, response.data.lockedUntil);
    }
    return response.data;
  },
  sendRequestToAllParents: async (
    params: TBoadcastParentalRequestParams
  ): Promise<TParentalRequestResponse> => {
    const urlConfig = { url: broadcastParentalRequest, withCredentials: true };
    const { requestDetails } = params;

    const response = await httpService.post<TParentalRequestResponse>(urlConfig, params);
    if (requestDetails) {
      const settingName = Object.keys(requestDetails)[0];
      rememberCooldown(settingName, response.data.lockedUntil);
    }
    return response.data;
  }
};

export default parentalRequestService;
