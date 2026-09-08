import type {
  RobloxUsersApiAuthenticatedGetUserResponse,
  RobloxUsersApiGetUserResponse,
  RobloxUsersApiMultiGetUserByNameResponse,
  RobloxWebWebAPIModelsApiArrayResponseRobloxUsersApiMultiGetUserResponse,
  RobloxWebWebAPIModelsApiPageResponseRobloxUsersApiSearchGetUserResponse,
  V1UsersSearchGetLimitEnum,
} from '@rbx/client-users/v1';
import { UsersApi, UserSearchApi } from '@rbx/client-users/v1';
import { createClientConfiguration } from './utils';

export type User = RobloxUsersApiAuthenticatedGetUserResponse;
export type UserSearchResponse =
  RobloxWebWebAPIModelsApiPageResponseRobloxUsersApiSearchGetUserResponse;
export type GetUserByIdResponse = RobloxUsersApiGetUserResponse;
export type UserByUsername = RobloxUsersApiMultiGetUserByNameResponse;

export class UsersClassClient {
  private usersApi: UsersApi;

  private userSearchApi: UserSearchApi;

  constructor() {
    const configuration = createClientConfiguration('users', 'bedev1');
    this.usersApi = new UsersApi(configuration);
    this.userSearchApi = new UserSearchApi(configuration);
  }

  getUsersByIds(
    userIds: number[],
  ): Promise<RobloxWebWebAPIModelsApiArrayResponseRobloxUsersApiMultiGetUserResponse> {
    return this.usersApi.v1UsersPost({ request: { userIds } });
  }

  searchUsers(
    keyword: string,
    limit?: V1UsersSearchGetLimitEnum,
    cursor?: string,
  ): Promise<UserSearchResponse> {
    return this.userSearchApi.v1UsersSearchGet({ keyword, limit, cursor });
  }

  async getUsersByUsernames(usernames: string[]): Promise<UserByUsername[]> {
    const response = await this.usersApi.v1UsernamesUsersPost({ request: { usernames } });
    return response.data ?? [];
  }

  getUserById(userId: number): Promise<GetUserByIdResponse> {
    return this.usersApi.v1UsersUserIdGet({ userId });
  }
}

const usersClient = new UsersClassClient();

export default usersClient;
