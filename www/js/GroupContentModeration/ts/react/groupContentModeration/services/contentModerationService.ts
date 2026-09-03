import { httpService } from 'core-utilities';
import groupContentModerationConstants from '../constants/groupContentModerationConstants';
import {
  ActivitySettings,
  BlockedKeyword,
  BlockedKeywordPageResponse,
  CreateBlockedKeywordsResponse
} from '../types';

export default {
  getGroupBlockedKeywords: async (
    groupId: number,
    limit: number,
    direction: number,
    cursor?: string
  ): Promise<BlockedKeywordPageResponse> => {
    const urlParams = new URLSearchParams();
    urlParams.append('limit', limit.toString());
    urlParams.append('pagingDirection', direction.toString());
    if (cursor) {
      urlParams.append('cursor', cursor);
    }
    const urlConfig = {
      url: `${groupContentModerationConstants.urls.getBlockedKeywordsEndpoint(
        groupId
      )}?${urlParams.toString()}`,
      withCredentials: true
    };
    const response = await httpService.get<BlockedKeywordPageResponse>(urlConfig);
    return response.data;
  },
  createGroupBlockedKeywords: async (
    groupId: number,
    keywords: string
  ): Promise<CreateBlockedKeywordsResponse> => {
    const urlConfig = {
      url: groupContentModerationConstants.urls.getBlockedKeywordsEndpoint(groupId),
      withCredentials: true
    };

    const data = {
      keywords,
      isPrivate: false
    };

    const response = await httpService.post<CreateBlockedKeywordsResponse>(urlConfig, data);
    return response.data;
  },
  updateGroupBlockedKeyword: async (
    groupId: number,
    keywordId: string,
    updatedKeyword: string
  ): Promise<BlockedKeyword> => {
    const urlConfig = {
      url: `${groupContentModerationConstants.urls.getBlockedKeywordsEndpoint(
        groupId
      )}/${keywordId}`,
      withCredentials: true
    };

    const data = {
      keyword: updatedKeyword,
      isPrivate: false
    };

    const response = await httpService.patch<BlockedKeyword>(urlConfig, data);
    return response.data;
  },
  deleteGroupBlockedKeyword: async (groupId: number, keywordId: string): Promise<void> => {
    const urlConfig = {
      url: `${groupContentModerationConstants.urls.getBlockedKeywordsEndpoint(
        groupId
      )}/${keywordId}`,
      withCredentials: true
    };

    await httpService.delete(urlConfig);
  },
  getGroupActivitySettings: async (groupId: number): Promise<ActivitySettings> => {
    const urlConfig = {
      url: `${groupContentModerationConstants.urls.groupFeatureSettingsEndpoint(groupId)}`,
      withCredentials: true
    };
    const response = await httpService.get<ActivitySettings>(urlConfig);
    return response.data;
  },
  updateGroupFeatureSettings: async (
    groupId: number,
    settings: ActivitySettings
  ): Promise<ActivitySettings> => {
    const urlConfig = {
      url: `${groupContentModerationConstants.urls.groupFeatureSettingsEndpoint(groupId)}`,
      withCredentials: true
    };
    const response = await httpService.patch<ActivitySettings>(urlConfig, settings);
    return response.data;
  }
};
