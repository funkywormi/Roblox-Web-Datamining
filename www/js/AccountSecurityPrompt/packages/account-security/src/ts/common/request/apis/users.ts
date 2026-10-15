import transport from "../requestTransport";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Users from "../types/users";

export const getUserById = (
  userId: string,
): Promise<Result<Users.UserInfo, Users.UsersApiError | null>> =>
  toResult(transport.get(Users.GET_USER_BY_ID_CONFIG(userId)), Users.UsersApiError);

export const getUserByUsername = (
  username: string,
): Promise<Result<Users.UserInfoListResponse, Users.UsersApiError | null>> =>
  toResult(
    transport.post(Users.GET_USER_BY_USERNAME_CONFIG, {
      usernames: [username],
      excludeBannedUsers: true,
    }),
    Users.UsersApiError,
  );

export const getUsersByIds = (
  userIds: number[],
): Promise<Result<Users.UserInfoListResponse, Users.UsersApiError | null>> =>
  toResult(
    transport.post(Users.GET_USERS_BY_IDS_CONFIG, {
      userIds,
      excludeBannedUsers: false,
    }),
    Users.UsersApiError,
  );
