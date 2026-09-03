import { httpService } from 'core-utilities';
import { getCommunityInfoUrl } from '../utils/urlHelper';
import { CommunityInfo } from '../types';

export default {
  getLinkedCommunity: async (universeId: string): Promise<CommunityInfo> => {
    const urlConfig = {
      url: getCommunityInfoUrl(universeId),
      retryable: true,
      withCredentials: true
    };

    const { data } = await httpService.get(urlConfig);
    return data as CommunityInfo;
  }
};
