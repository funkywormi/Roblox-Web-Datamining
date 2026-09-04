import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";
import * as http from "@rbx/core-scripts/http";
import { PLUS_PROFILE_FIELD } from "../constants";

export type PlusStatusByUserId = Record<number, boolean>;

type ProfileRow = {
  userId: number;
  hasRobloxSubscription?: boolean;
};

type GetProfilesResponse = {
  profileDetails?: ProfileRow[];
};

export const fetchPlusStatusForUsers = async (
  userIds: readonly number[],
): Promise<PlusStatusByUserId> => {
  const dedupedUserIds = [...new Set(userIds)];
  if (dedupedUserIds.length === 0) {
    return {};
  }

  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}/user-profile-api/v1/user/profiles/get-profiles`,
    retryable: true,
    withCredentials: true,
  };

  const requestData = {
    userIds: dedupedUserIds,
    fields: [PLUS_PROFILE_FIELD],
  };

  const { data } = await http.post<GetProfilesResponse>(urlConfig, requestData);
  const result: PlusStatusByUserId = {};
  for (const row of data.profileDetails ?? []) {
    result[row.userId] = row.hasRobloxSubscription === true;
  }
  return result;
};
