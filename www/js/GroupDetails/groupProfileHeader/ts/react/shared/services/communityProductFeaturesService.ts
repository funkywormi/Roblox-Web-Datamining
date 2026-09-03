import { httpService } from 'core-utilities';
import { CommunityProductFeatures } from '../types';
import groupConstants from '../constants/groupConstants';

export default {
  fetchCommunityProductFeatures: async (groupId: number): Promise<CommunityProductFeatures> => {
    const url = groupConstants.urls.getGroupFeaturesURL(groupId);
    const urlConfig = {
      url,
      withCredentials: false
    };
    const { data } = await httpService.get<CommunityProductFeatures>(urlConfig);

    return data;
  }
};
