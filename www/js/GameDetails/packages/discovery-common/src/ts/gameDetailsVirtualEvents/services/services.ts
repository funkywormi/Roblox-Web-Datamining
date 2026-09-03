import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { TEventCategoryLabel } from "../constants/constants";

const apiGwUrl = environmentUrls.apiGatewayUrl || "https://apis.roblox.com";

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

export type RsvpCounters = {
  counters: {
    none: number;
    going: number;
    maybeGoing: number;
    notGoing: number;
  };
};

type TVirtualEventThumbnail = {
  mediaId: number;
  rank: number;
};

export type TEventCategory = {
  category: TEventCategoryLabel;
  rank: number;
};

export type VirtualEvent = {
  id: string;
  title: string;
  displayTitle: string;
  subtitle: string;
  displaySubtitle: string;
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
  placeId: number;
  eventStatus: string;
  createdUtc: string;
  updatedUtc: string;
  userRsvpStatus: string;
  thumbnails: TVirtualEventThumbnail[] | null;
  eventCategories: TEventCategory[] | null;
};

export const getEventDetailsRes = async (eventId: string): Promise<unknown> => {
  const isUserAuthenticated = authenticatedUser()?.isAuthenticated ?? false;

  const endpoint = endpointsFactory.getVirtualEventsDetailsEndpoint(eventId, isUserAuthenticated);
  const res = await http.get({
    withCredentials: isUserAuthenticated,
    url: endpoint,
  });

  return res.data;
};

export const getTotalRsvpCounters = async (eventId: string): Promise<RsvpCounters> => {
  const endpoint = endpointsFactory.getVirtualEventsTotalRsvpCountersEndpoint(eventId);

  const res = await http.get({
    withCredentials: true,
    url: endpoint,
  });

  return res.data as RsvpCounters;
};

export const postRsvpStatus = async (eventId: any, status: string): Promise<unknown> => {
  const endpoint = endpointsFactory.getVirtualEventsPostRsvpEndpoint(eventId);
  const res = await http.post(
    {
      withCredentials: true,
      url: endpoint,
    },
    { rsvpStatus: status },
  );

  return res.data;
};

export const getEventsForUniverseId = async (universeId: any): Promise<VirtualEvent[]> => {
  const endpoint = endpointsFactory.getEventsForUniverseIdEndpoint(universeId);
  const res = await http.get<{ data: VirtualEvent[] }>({
    url: endpoint,
    withCredentials: true,
  });
  return res.data.data;
};
