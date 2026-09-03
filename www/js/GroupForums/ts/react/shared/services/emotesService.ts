import { httpService } from 'core-utilities';
import { EmoteSet } from '../types';
import emoteConstants from '../constants/emoteConstants';

interface GetEmotesSetsResponse {
  emoteSets: EmoteSet[];
}

export default {
  getGroupEmoteSets: async (groupId: number): Promise<GetEmotesSetsResponse> => {
    const urlConfig = {
      url: emoteConstants.urls.getGroupEmoteSetsEndpoint(groupId),
      withCredentials: true
    };

    const response = await httpService.get<GetEmotesSetsResponse>(urlConfig);
    return response.data;
  }
};
