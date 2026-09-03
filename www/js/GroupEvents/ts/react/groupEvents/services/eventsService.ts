import { httpService } from 'core-utilities';
import groupEventsConstants from '../constants/groupEventsConstants';
import {
  VirtualEvent,
  VirtualEventResponse,
  GameDetails,
  GameDetailsResponse,
  FeaturedEvent,
  GroupGamesResponse,
  GroupGame
} from '../types';

export default {
  getVirtualEvents: async (
    groupId: number,
    filterBy = 'upcoming',
    fromUtc = new Date().toISOString(),
    sortBy = 'startUtc',
    sortOrder = 'desc'
  ): Promise<VirtualEvent[]> => {
    const urlConfig = {
      url: groupEventsConstants.urls.getVirtualEventsUrl(
        groupId,
        filterBy,
        fromUtc,
        sortBy,
        sortOrder
      ),
      withCredentials: true
    };

    const response = await httpService.get<VirtualEventResponse>(urlConfig);
    return response.data?.data;
  },
  getVirtualEventDetails: async (id: string): Promise<VirtualEvent> => {
    const isUserAuthenticated = window.Roblox?.CurrentUser?.isAuthenticated;
    const urlConfig = {
      url: groupEventsConstants.urls.getVirtualEventDetailsUrl(id, isUserAuthenticated),
      withCredentials: true
    };

    const response = await httpService.get<VirtualEvent>(urlConfig);
    return response.data;
  },
  postRsvpStatus: async (eventId: string, rsvpStatus: string): Promise<void> => {
    const urlConfig = {
      url: groupEventsConstants.urls.getVirtualEventsRsvpEndpoint(eventId),
      withCredentials: true
    };
    const data = { rsvpStatus };
    await httpService.post(urlConfig, data);
  },
  getGameDetailsForUniverseIds: async (universeIds: Array<number>): Promise<GameDetails[]> => {
    const urlConfig = {
      url: groupEventsConstants.urls.getGameDetailsForUniverseIdsEndpoint(),
      withCredentials: true
    };
    const data = { universeIds };
    const response = await httpService.get<GameDetailsResponse>(urlConfig, data);
    return response.data?.data;
  },
  getGamesForGroup: async (groupId: number): Promise<GroupGame[]> => {
    const urlConfig = {
      url: groupEventsConstants.urls.getGamesForGroupEndpoint(groupId),
      withCredentials: true
    };
    const response = await httpService.get<GroupGamesResponse>(urlConfig);
    return response.data?.data;
  },
  getFeaturedEvent: async (groupId: number): Promise<FeaturedEvent> => {
    const urlConfig = {
      url: groupEventsConstants.urls.getGroupFeaturedEventsUrl(groupId),
      withCredentials: true
    };
    const response = await httpService.get<FeaturedEvent>(urlConfig);
    return response.data;
  },
  postFeaturedEvent: async (groupId: number, eventId: string): Promise<FeaturedEvent> => {
    const urlConfig = {
      url: groupEventsConstants.urls.getGroupFeaturedEventUrl(groupId, eventId),
      withCredentials: true
    };
    const response = await httpService.post<FeaturedEvent>(urlConfig);
    return response.data;
  },
  deleteFeaturedEvent: async (groupId: number, eventId: string): Promise<void> => {
    const urlConfig = {
      url: groupEventsConstants.urls.getGroupFeaturedEventUrl(groupId, eventId),
      withCredentials: true
    };
    await httpService.delete(urlConfig);
  }
};
