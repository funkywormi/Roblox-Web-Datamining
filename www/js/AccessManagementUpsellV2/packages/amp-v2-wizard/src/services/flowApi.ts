/**
 * Default `FlowApi`: HTTP client for the /entrypoint and /continue endpoints (both return a
 * `FlowResponse` fragment). The backend is stateless — /continue carries the full history so it can
 * reconstruct position. Tests and the demo inject their own.
 */

import { httpService } from "@rbx/core-scripts/legacy/core-utilities";

import { CONTINUE_URL, ENTRYPOINT_URL } from "../constants/urls";
import type { FlowApi, FlowContinueRequest, FlowEntrypointRequest, FlowResponse } from "../types";

async function postForFragment(
  url: string,
  body: FlowEntrypointRequest | FlowContinueRequest,
): Promise<FlowResponse> {
  const response = await httpService.post<FlowResponse>({ url, withCredentials: true }, body);
  return response.data;
}

export const flowApi: FlowApi = {
  entrypoint: request => postForFragment(ENTRYPOINT_URL, request),
  continue: request => postForFragment(CONTINUE_URL, request),
};
