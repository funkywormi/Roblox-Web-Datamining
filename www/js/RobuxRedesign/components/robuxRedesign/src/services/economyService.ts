import { EnvironmentUrls } from "@rbx/environment-urls";
import { APICall, HTTPVerb, withApiEvents } from "../utils/apiEventsCounter";

export type GetRobuxBalanceResponse = {
  robux: number;
};

export const getRobuxBalance = async (
  userId: string,
): Promise<GetRobuxBalanceResponse | undefined> =>
  withApiEvents<GetRobuxBalanceResponse>(HTTPVerb.GET, APICall.GET_ROBUX_BALANCE, {
    url: `${EnvironmentUrls.economyApi}/v1/users/${userId}/currency`,
    withCredentials: true,
  });
