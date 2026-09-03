import { httpService } from "@rbx/core-scripts/legacy/core-utilities";

import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";

const apiGwUrl = EnvironmentUrls.apiGatewayUrl || "https://apis.roblox.com";
const gamesApiUrl = EnvironmentUrls.gamesApi;
const thumbnailsApiUrl = EnvironmentUrls.thumbnailsApi;

const getDateQueryParam = (): string => {
  const currentDate = new Date();
  return `fromUtc=${currentDate.toISOString()}`;
};

const endpointsFactory = {
  getVirtualEventsDetailsEndpoint: (id: string, userAuthenticated: boolean) => {
    if (userAuthenticated) {
      return `${apiGwUrl}/virtual-events/v1/virtual-events/${id}`;
    }
    return `${apiGwUrl}/virtual-events/v1/virtual-events/public/${id}`;
  },
  getVirtualEventsRsvpEndpoint: (id: string) =>
    `${apiGwUrl}/virtual-events/v1/virtual-events/${id}/rsvps`,
  getVirtualEventsPostRsvpEndpoint: (id: string) =>
    `${apiGwUrl}/virtual-events/v1/virtual-events/${id}/rsvps`,
  getVirtualEventsTotalRsvpCountersEndpoint: (id: string) =>
    `${apiGwUrl}/virtual-events/v1/virtual-events/${id}/rsvps/counters`,
  getEventsForUniverseIdEndpoint: (universeId: string) =>
    `${apiGwUrl}/virtual-events/v1/universes/${universeId}/virtual-events?${getDateQueryParam()}`,
};

export const RSVP_STATUS = {
  NONE: "none",
  GOING: "going",
  NOT_GOING: "notGoing",
  MAYBE_GOING: "maybeGoing",
};

export const EVENT_STATUS = {
  UNPUBLISHED: "unpublished",
  ACTIVE: "active",
  CANCELLED: "cancelled",
  MODERATED: "moderated",
};

export type RsvpCounters = {
  counters: {
    none: number;
    going: number;
    maybeGoing: number;
    notGoing: number;
  };
};

export type VirtualEvent = {
  id: string;
  title: string;
  displayTitle: string;
  description: string;
  displayDescription: string;
  eventTime: {
    startUtc: string;
    endUtc: string;
  };
  host: {
    hostName: string;
    hasVerifiedBadge: boolean;
    hostType: string;
    hostId: number;
  };
  universeId: number;
  eventStatus: string;
  createdUtc: string;
  updatedUtc: string;
  eventCategories?: [
    {
      category: string;
      rank: number;
    },
  ];
  thumbnails?: [
    {
      mediaId: number;
      rank: number;
    },
  ];
  userRsvpStatus: string;
};

export const getEventDetailsRes = async (eventId: string): Promise<unknown> => {
  const isUserAuthenticated = window.Roblox?.CurrentUser?.isAuthenticated;

  const endpoint = endpointsFactory.getVirtualEventsDetailsEndpoint(eventId, !!isUserAuthenticated);
  const res = await httpService.get({
    withCredentials: isUserAuthenticated,
    url: endpoint,
  });

  return res.data;
};

export const getEventRsvpRes = async (eventId: string): Promise<unknown> => {
  const endpoint = endpointsFactory.getVirtualEventsRsvpEndpoint(eventId);
  const res = await httpService.get<{ data: { data: unknown } }>({
    withCredentials: true,
    url: endpoint,
  });

  return res.data.data;
};

export const getTotalRsvpCounters = async (eventId: string): Promise<RsvpCounters> => {
  const endpoint = endpointsFactory.getVirtualEventsTotalRsvpCountersEndpoint(eventId);

  const res = await httpService.get({
    withCredentials: true,
    url: endpoint,
  });

  return res.data as RsvpCounters;
};

export const postRsvpStatus = async (eventId: any, status: string): Promise<unknown> => {
  const endpoint = endpointsFactory.getVirtualEventsPostRsvpEndpoint(eventId);
  const res = await httpService.post(
    {
      withCredentials: true,
      url: endpoint,
    },
    { rsvpStatus: status },
  );

  return res.data;
};

export const getEventsForUniverseId = async (universeId: any): Promise<unknown> => {
  const endpoint = endpointsFactory.getEventsForUniverseIdEndpoint(universeId);
  const res = await httpService.get<{ data: { data: unknown } }>({
    url: endpoint,
    withCredentials: true,
  });

  return res.data.data;
};

export type GameDetails = {
  id: number;
  rootPlaceId: number;
  name: string;
  description: string;
  sourceName: string;
  sourceDescription: string;
  creator: {
    id: number;
    name: string;
    type: string;
    isRNVAccount: boolean;
    hasVerifiedBadge: boolean;
  };
  price: number | null;
  allowedGearGenres: string[];
  allowedGearCategories: string[];
  isGenreEnforced: boolean;
  copyingAllowed: boolean;
  playing: number;
  visits: number;
  maxPlayers: number;
  created: string;
  updated: string;
  studioAccessToApisAllowed: boolean;
  createVipServersAllowed: boolean;
  universeAvatarType: string;
  genre: string;
  isAllGenre: boolean;
  isFavoritedByUser: boolean;
  favoritedCount: number;
};

export const getDetailsForUniverseIds = async (universeIds: number[]): Promise<GameDetails> => {
  const res = await httpService.get<{ data: GameDetails[] }>(
    {
      url: `${gamesApiUrl}/v1/games`,
      timeout: 10000,
      withCredentials: true,
    },
    { universeIds },
  );

  const gameDetails: GameDetails = res.data.data[0]!;
  return gameDetails;
};

export const getGamePlaceDetails = async (placeId: string): Promise<unknown> => {
  const res = await httpService.get<any[]>({
    url: `${gamesApiUrl}/v1/games/multiget-place-details?placeIds=${placeId}`,
    withCredentials: true,
    timeout: 10000,
  });

  return res.data[0];
};

// get the thumbnail for the game using the following logic:
// try first in /media endpoint which is of type image
// fallback to events-specific default thumbnail
export const getThumbnailForGame = async (universeId: any): Promise<unknown> => {
  const resMedia = await httpService.get<{ data: any }>({
    url: `${gamesApiUrl}/v1/games/${universeId}/media`,
    timeout: 10000,
    withCredentials: true,
  });

  // Get first piece of media which is an image
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const imageId = resMedia?.data?.data?.find(
    (media: { assetType: string }) => media.assetType === "Image",
  )?.imageId;

  if (imageId !== null) {
    const thumbnailRes = await httpService.get<{ data: { state: any; imageUrl: any }[] }>(
      {
        url: `${thumbnailsApiUrl}/v1/assets`,
        timeout: 10000,
        withCredentials: true,
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        assetIds: imageId,
        size: "768x432",
        format: "Png",
      },
    );

    if (thumbnailRes) {
      if (thumbnailRes.data?.data[0]?.state === "Completed") {
        return thumbnailRes.data?.data[0]?.imageUrl;
      }
    }
  }
  return null;
};

export const getEventThumbnailUrl = async (imageId: string): Promise<string | null> => {
  const thumbnailRes = await httpService.get<{ data: { state: string; imageUrl: string }[] }>(
    {
      url: `${thumbnailsApiUrl}/v1/assets`,
      timeout: 10000,
      withCredentials: true,
    },
    {
      assetIds: imageId,
      size: "768x432",
      format: "Png",
    },
  );
  if (thumbnailRes) {
    if (thumbnailRes.data?.data[0]?.state === "Completed") {
      return thumbnailRes.data?.data[0]?.imageUrl;
    }
  }
  return null;
};

export const getProfileUrlForUserOrGroup = (id: string, type: string): string => {
  if (type === "user") {
    return `https://${window.location.hostname}/users/${id}/profile`;
  }
  return `https://${window.location.hostname}/groups/${id}`;
};

export const getGameDetailsUrlForPlace = (rootPlaceId: string): string => {
  return `https://${window.location.hostname}/games/${rootPlaceId}`;
};
