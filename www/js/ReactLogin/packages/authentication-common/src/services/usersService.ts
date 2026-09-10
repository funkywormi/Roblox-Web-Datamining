import { EnvironmentUrls } from "@rbx/environment-urls";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { TUserData, TUserResponse } from "../types/userTypes";

const getUsersApiUrl = (endpoint: string): string => EnvironmentUrls.usersApi + endpoint;

export const postUsersInfo = async (userIds: string[]): Promise<TUserData[]> => {
  const url = getUsersApiUrl("/v1/users");
  const params = { userIds };
  const urlConfig = {
    url,
    withCredentials: false,
  };
  const { data } = await httpService.post<TUserResponse>(urlConfig, params);
  return data.data;
};

export default {
  postUsersInfo,
};
