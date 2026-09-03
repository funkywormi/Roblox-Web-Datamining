import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl, gamesApi, groupsApi, domain } = EnvironmentUrls;

const virtualEventsUrlPrefix = `${apiGatewayUrl}/virtual-events/v1/virtual-events`;
const gameDetailsUrlPrefix = `${gamesApi}/v1/games`;
const groupGamesUrlPrefix = `${gamesApi}/v2/groups`;
const featuredContentUrlPrefix = `${groupsApi}/v1/featured-content`;

export default {
  urls: {
    getVirtualEventsUrl(
      groupId: number,
      filterBy: string,
      fromUtc: string,
      sortBy: string,
      sortOrder: string
    ): string {
      return `${virtualEventsUrlPrefix}/groups/${groupId}`;
    },
    getVirtualEventDetailsUrl(id: string, isUserAuthenticated: boolean): string {
      if (isUserAuthenticated) {
        return `${virtualEventsUrlPrefix}/${id}`;
      }
      return `${virtualEventsUrlPrefix}/public/${id}`;
    },
    getVirtualEventsRsvpEndpoint(id: string): string {
      return `${virtualEventsUrlPrefix}/${id}/rsvps`;
    },
    getGameDetailsForUniverseIdsEndpoint(): string {
      return `${gameDetailsUrlPrefix}`;
    },
    getGamesForGroupEndpoint(groupId: number): string {
      return `${groupGamesUrlPrefix}/${groupId}/gamesV2?accessFilter=Public&sortOrder=Desc`;
    },
    getGroupFeaturedEventsUrl(groupId: number): string {
      return `${featuredContentUrlPrefix}/event?groupId=${groupId}`;
    },
    getGroupFeaturedEventUrl(groupId: number, eventId: string): string {
      return `${featuredContentUrlPrefix}/event?groupId=${groupId}&eventId=${eventId}`;
    },
    getEventUrl(eventId: string): string {
      return `https://${domain}/events/${eventId}`;
    },
    getCreateExperienceUrl(groupId: number): string {
      return `https://create.${domain}/dashboard/creations?groupId=${groupId}`;
    },
    getCreateEventForExperienceUrl(universeId: number): string {
      return `https://create.${domain}/dashboard/creations/experiences/${universeId}/events`;
    }
  },
  eventStatus: {
    active: 'active'
  },
  eventRsvpStatus: {
    going: 'going',
    notGoing: 'notGoing'
  }
};
