import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";

const USER_BLOCKING_API_URL = `${EnvironmentUrls.apiGatewayUrl}/user-blocking-api/v1/users`;

/**
 * API to block a user.
 */
export const blockUser = async (userId: string): Promise<void> => {
  await httpService.post({
    url: `${USER_BLOCKING_API_URL}/${userId}/block-user`,
    withCredentials: true,
  });
};

/**
 * API to unblock a user.
 */
export const unblockUser = async (userId: string): Promise<void> => {
  await httpService.post({
    url: `${USER_BLOCKING_API_URL}/${userId}/unblock-user`,
    withCredentials: true,
  });
};

/**
 * API to check if a user is blocked.
 */
export const isBlockedUser = async (userId: string): Promise<boolean> => {
  const response = await httpService.get<boolean>({
    url: `${USER_BLOCKING_API_URL}/${userId}/is-blocked`,
    withCredentials: true,
  });
  return response.data;
};
