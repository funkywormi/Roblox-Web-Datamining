import { httpService } from 'core-utilities';
import GroupVideosConstants from '../constants/groupVideosConstants';

export default {
  getVideoTitle: async (assetId: string): Promise<string> => {
    const urlConfig = {
      url: GroupVideosConstants.urls.getAssetUrl(assetId),
      withCredentials: true
    };

    const response = await httpService.get(urlConfig);
    return (response.data as { displayName?: string }).displayName ?? 'unknown';
  }
};
