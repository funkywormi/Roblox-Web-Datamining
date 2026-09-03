import { AxiosResponse, httpService } from 'core-utilities';
import gameBadgesConstants from '../constants/gameBadgesListConstants';
import { TGetGameBadgesResponse } from '../types/gameBadgesListTypes';

const { urls } = gameBadgesConstants;
export const getGameBadges = async (
  universeId: string,
  cursor?: string,
  limit?: number
): Promise<TGetGameBadgesResponse> => {
  const {
    data: { data, nextPageCursor, previousPageCursor }
  }: AxiosResponse<TGetGameBadgesResponse> = await httpService.get(
    urls.getGameBadges(universeId, cursor, limit)
  );
  return { data: data.filter(badge => badge.enabled), nextPageCursor, previousPageCursor };
};

export default {
  getGameBadges
};
