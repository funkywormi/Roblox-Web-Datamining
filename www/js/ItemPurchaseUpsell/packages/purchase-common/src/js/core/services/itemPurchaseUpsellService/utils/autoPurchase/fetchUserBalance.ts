import { CurrentUser } from '@rbx/legacy-webapp-types/Roblox';
import { EnvironmentUrls } from '@rbx/environment-urls';
import * as httpService from '@rbx/core-scripts/http';
import { GET_USER_BALANCE_API } from '../../constants/upsellConstants';
import { UserBalance } from '../../constants/serviceTypeDefinitions';

export default async function fetchUserBalance(): Promise<number> {
  const { userId } = CurrentUser;

  const urlConfig = {
    url: `${EnvironmentUrls.economyApi}${GET_USER_BALANCE_API.replace('{userId}', userId)}`,
    withCredentials: true,
    retryable: false,
    noCache: true
  };

  try {
    const userBalanceResponse = await httpService.get<UserBalance>(urlConfig);
    if (userBalanceResponse.status === 200) {
      return userBalanceResponse.data.robux;
    }
    return Promise.reject();
  } catch (e) {
    return Promise.reject(e);
  }
}
