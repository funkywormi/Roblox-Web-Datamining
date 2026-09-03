import { httpService, urlService } from 'core-utilities';
import groupExperiencesConstants from '../constants/groupExperiencesConstants';
import {
  GroupExperience,
  ExperienceDetails,
  ExperienceVotes,
  GameInstance,
  Player,
  GetPublicServersResponse,
  PublicServersPage,
  PrimaryExperiencePublicServersData,
  GetExperienceVotesResponse,
  GetExperienceDetailsResponse,
  GetGroupExperiencesResponse,
  PaginatedRequestOptions
} from '../types';

const buildReferralUrl = (game: GroupExperience): string => {
  return urlService.getAbsoluteUrl(`/games/${game.rootPlace.id}`);
};

const getExperiences = async (universeIds: number[]): Promise<ExperienceDetails[]> => {
  const config = {
    url: groupExperiencesConstants.urls.gamesEndpoint
  };
  const response = await httpService.get<GetExperienceDetailsResponse>(config, {
    universeIds: universeIds.join(',')
  });
  return response.data?.data;
};

const getExperienceVotes = async (universeIds: number[]): Promise<ExperienceVotes[]> => {
  const config = {
    url: groupExperiencesConstants.urls.gameVotesEndpoint
  };
  const response = await httpService.get<GetExperienceVotesResponse>(config, {
    universeIds: universeIds.join(',')
  });
  return response.data?.data;
};

const getGroupExperiences = async (
  groupId: number,
  { limit, cursor, sortOrder }: PaginatedRequestOptions = {}
): Promise<GetGroupExperiencesResponse> => {
  const config = {
    url: groupExperiencesConstants.urls.getGroupGamesV2Endpoint(groupId, {
      limit,
      cursor,
      sortOrder
    })
  };
  const response = await httpService.get<GetGroupExperiencesResponse>(config);
  return response.data;
};

const getDetailedGroupExperiences = async (
  groupId: number,
  { limit, cursor, sortOrder }: PaginatedRequestOptions = {}
): Promise<GetGroupExperiencesResponse> => {
  const response = await getGroupExperiences(groupId, { limit, cursor, sortOrder });
  const experiences = response.data;

  if (experiences.length <= 0) {
    return {
      data: []
    };
  }

  const universeIds = experiences.map(experience => experience.id);

  const translatedNames = new Map<number, string>();
  const playerCounts = new Map<number, number>();
  const votes = new Map<number, ExperienceVotes>();

  try {
    const [detailsData, votesData] = await Promise.all([
      getExperiences(universeIds),
      getExperienceVotes(universeIds)
    ]);

    votesData.forEach(voteData => {
      const { upVotes, downVotes, id: universeId } = voteData;
      const totalVotes = upVotes + downVotes;
      const votePercentage = totalVotes > 0 ? `${Math.floor((100 * upVotes) / totalVotes)}%` : '0%';
      votes.set(universeId, {
        ...voteData,
        votePercentage
      });
    });

    detailsData.forEach(detailData => {
      playerCounts.set(detailData.id, detailData.playing);
      translatedNames.set(detailData.id, detailData.name);
    });
  } catch (error) {
    // if we encounter an error, still sort and return the experiences
  }

  const hydratedExperiences = experiences.map(experience => ({
    ...experience,
    votes: votes.get(experience.id) ?? {
      upVotes: 0,
      downVotes: 0,
      votePercentage: '0%'
    },
    playing: playerCounts.get(experience.id) ?? 0,
    name: translatedNames.get(experience.id) ?? experience.name,
    gameReferralUrl: buildReferralUrl(experience)
  }));

  hydratedExperiences.sort((expA, expB) => {
    if (expA.playing === expB.playing) {
      return expB.votes.upVotes - expA.votes.upVotes;
    }
    return expB.playing - expA.playing;
  });

  return {
    data: hydratedExperiences,
    nextPageCursor: response.nextPageCursor,
    prevPageCursor: response.prevPageCursor
  };
};

const normalizePlayers = (server: GameInstance): Player[] => {
  const players = server.players ?? [];
  const playerTokens = server.playerTokens ?? [];
  const playersByToken = new Map(players.map((player: Player) => [player.playerToken, player]));

  playerTokens.forEach((playerToken: string) => {
    if (!playersByToken.has(playerToken)) {
      players.push({
        id: null,
        playerToken,
        displayName: null
      });
    }
  });

  return players;
};

const buildPublicServersPage = (
  responseData: GetPublicServersResponse | null | undefined
): PublicServersPage => {
  return {
    servers: (responseData?.data ?? []).map(server => ({
      ...server,
      players: normalizePlayers(server)
    })),
    nextPageCursor: responseData?.nextPageCursor
  };
};

const getPublicServers = async (
  placeId: number,
  {
    limit = groupExperiencesConstants.limits.publicServersFetchSize,
    cursor
  }: PaginatedRequestOptions = {}
): Promise<PublicServersPage> => {
  const config = {
    url: groupExperiencesConstants.urls.getPublicServersEndpoint(placeId),
    withCredentials: true
  };
  const response = await httpService.get<GetPublicServersResponse>(config, {
    excludeFullGames: true,
    excludePrivateGames: true,
    limit,
    cursor
  });

  return buildPublicServersPage(response.data);
};

const getPrimaryExperiencePublicServers = async (
  groupId: number
): Promise<PrimaryExperiencePublicServersData | null> => {
  const response = await getDetailedGroupExperiences(groupId, {
    limit: groupExperiencesConstants.limits.topExperiencesFetchSize
  });
  const experience = response.data[0];

  if (!experience?.rootPlace?.id) {
    return null;
  }

  const publicServersResponse = await getPublicServers(experience.rootPlace.id);

  if (publicServersResponse.servers.length === 0) {
    return null;
  }

  return {
    experience,
    servers: publicServersResponse.servers,
    nextPageCursor: publicServersResponse.nextPageCursor
  };
};

export default {
  getGroupExperiences,
  getDetailedGroupExperiences,
  getExperiences,
  getExperienceVotes,
  getPublicServers,
  getPrimaryExperiencePublicServers
};
