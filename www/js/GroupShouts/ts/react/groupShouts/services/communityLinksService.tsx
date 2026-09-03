import { httpService } from 'core-utilities';
import { AxiosResponse } from 'axios';
import {
  CommunityInfo,
  CreateCommunityResponse,
  GetGuildedChannelsResponse,
  GuildedServer,
  GuildedServersResponse,
  GuildedUser,
  UpdateCommunitySettings,
  ValidateCommunityRequest,
  ValidateCommunityResponse
} from '../types';

import groupAnnouncementsConstants from '../constants/groupAnnouncementsConstants';

export default {
  getLinkedCommunity: async (groupId: number): Promise<CommunityInfo> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getGroupCommunityInfoUrl(groupId),
      retryable: true,
      withCredentials: true
    };

    const { data } = await httpService.get(urlConfig);
    return data as CommunityInfo;
  },

  getGuildedUser: async (): Promise<AxiosResponse<GuildedUser>> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.guildedUserUrl,
      retryable: true,
      withCredentials: true
    };

    return httpService.get(urlConfig);
  },

  getGuildedServers: async (): Promise<Array<GuildedServer>> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.guildedUserServersUrl,
      retryable: true,
      withCredentials: true
    };

    const { data }: { data: GuildedServersResponse } = await httpService.get(urlConfig);
    return data?.servers ?? [];
  },

  createCommunity: async (groupId: number, name: string): Promise<CreateCommunityResponse> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getGroupCommunityInfoUrl(groupId),
      retryable: true,
      withCredentials: true
    };

    const { data } = await httpService.post(urlConfig, { name });
    return data as CreateCommunityResponse;
  },

  linkCommunity: async (
    groupId: number,
    communityId: string,
    announcementChannelId: string | null
  ): Promise<CommunityInfo> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getGroupCommunityLinkUrl(groupId),
      retryable: true,
      withCredentials: true
    };

    const { data } = await httpService.post(urlConfig, { communityId, announcementChannelId });
    return data as CommunityInfo;
  },

  getLinkedCommunityChannels: async (communityId: string): Promise<GetGuildedChannelsResponse> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getUserCommunityChannelsUrl(communityId),
      retryable: true,
      withCredentials: true
    };
    const { data } = await httpService.get(urlConfig);
    return data as GetGuildedChannelsResponse;
  },

  deleteLinkedCommunity: async (groupId: number): Promise<void> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getGroupCommunityInfoUrl(groupId),
      retryable: true,
      withCredentials: true
    };

    await httpService.delete(urlConfig);
  },

  updateLinkedCommunity: async (
    groupId: number,
    settings: UpdateCommunitySettings
  ): Promise<void> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getGroupCommunityInfoUrl(groupId),
      retryable: true,
      withCredentials: true
    };

    await httpService.patch(urlConfig, { settings });
  },

  validateCommunity: async (
    groupId: number,
    request: ValidateCommunityRequest
  ): Promise<ValidateCommunityResponse> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getGroupCommunityValidateUrl(groupId),
      retryable: false,
      withCredentials: true
    };

    const { data } = await httpService.post(urlConfig, { name: request.name });
    return data as ValidateCommunityResponse;
  }
};
