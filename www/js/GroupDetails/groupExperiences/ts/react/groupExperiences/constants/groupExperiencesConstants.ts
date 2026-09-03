import { EnvironmentUrls } from 'Roblox';
import { PaginatedRequestOptions } from '../types';

export default {
  urls: {
    gamesEndpoint: `${EnvironmentUrls.gamesApi}/v1/games`,
    gameVotesEndpoint: `${EnvironmentUrls.gamesApi}/v1/games/votes`,
    getPublicServersEndpoint: (placeId: number): string =>
      `${EnvironmentUrls.gamesApi}/v1/games/${placeId}/servers/Public`,
    getGroupGamesV2Endpoint: (
      groupId: number,
      { limit = 50, cursor, sortOrder = 'Desc' }: PaginatedRequestOptions
    ): string =>
      `${EnvironmentUrls.gamesApi}/v2/groups/${groupId}/gamesV2?accessFilter=Public&limit=${limit}${
        cursor ? `&cursor=${cursor}` : ''
      }&sortOrder=${sortOrder}`
  },
  limits: {
    experiencesPerPage: 10,
    topExperiencesFetchSize: 10,
    publicServersFetchSize: 25
  }
};
