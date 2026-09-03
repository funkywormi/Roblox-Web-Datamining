import { AxiosPromise, httpService } from 'core-utilities';
import urlConfigs from '../constants/urlConfigs';

const itemListService = {
  getItemOwnership(userId: number, itemType: string, itemTargetId: number): AxiosPromise<boolean> {
    const urlConfig = {
      url: urlConfigs.getItemOwnershipUrl(userId, itemType, itemTargetId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  }
};
export default itemListService;
