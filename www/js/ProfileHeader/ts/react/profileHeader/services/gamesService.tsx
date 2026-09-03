import { httpService } from 'core-utilities';
import apiConstants from '../constants/apiEndpoint';
import { TFavoriteGamesResponse } from '../types/profileHeaderTypes';

const getFavoriteGames = async (profileUserId: number): Promise<TFavoriteGamesResponse> => {
  const { data }: { data: TFavoriteGamesResponse } = await httpService.get(
    apiConstants.favoriteGames(profileUserId)
  );
  return data;
};

export default {
  getFavoriteGames
};
