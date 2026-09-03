import type {
  RobloxFriendsApiModelsResponseUserResponse,
  RobloxFriendsApiMultigetAreFriendsResponse,
} from '@rbx/client-friends/v1';
import { FriendsApi } from '@rbx/client-friends/v1';
import { createClientConfiguration } from './utils';

export class FriendsApiClient {
  public friendsApi: FriendsApi;

  constructor() {
    this.friendsApi = new FriendsApi(createClientConfiguration('friends', 'bedev1'));
  }

  async getUsersFriends(
    userId: number,
  ): Promise<RobloxFriendsApiModelsResponseUserResponse[] | undefined> {
    return (await this.friendsApi.v1UsersUserIdFriendsGet({ userId })).data;
  }

  async getWhichUsersAreFriendsOfUser(
    userId: number,
    targetUserIds: number[],
  ): Promise<RobloxFriendsApiMultigetAreFriendsResponse | undefined> {
    return this.friendsApi.v1UserUserIdMultigetAreFriendsPost({
      userId,
      multigetAreFriendsRequestModel: { targetUserIds },
    });
  }
}

const friendsApiClient = new FriendsApiClient();
export default friendsApiClient;
