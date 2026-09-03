import { EnvironmentUrls, CurrentUser, Guac, NumberFormatting } from '@rbx/legacy-webapp-types/Roblox';
import { httpService } from '@rbx/core-scripts/legacy/core-utilities';

export type TShowFavoriteCount = {
  EnableAggregateLikesFavoritesCount: boolean;
};

export type LookFavoritesResponse = {
  isFavorited: boolean;
};

export type LookCountDetail = {
  favoriteCount: number;
};
export type Look = {
  look: LookCountDetail;
};

export const FavoritesButtonService = {
  getCurrentFavoriteCount: async (id: string | number, itemType: string): Promise<number> => {
    if (itemType === 'looks') {
      const { data } = await httpService.get<Look>({
        url: `${EnvironmentUrls.apiGatewayUrl}/look-api/v2/looks/${id}`,
        retryable: true,
        withCredentials: true
      });
      return data?.look?.favoriteCount ?? -1;
    }
    const { data } = await httpService.get<number>({
      url: `${EnvironmentUrls.catalogApi}/v1/favorites/${itemType}/${id}/count`,
      retryable: true,
      withCredentials: true
    });

    return data;
  },

  getCurrentFavoriteStatus: async (id: number | string, itemType: string): Promise<boolean> => {
    if (itemType === 'looks') {
      const { data } = await httpService.get<LookFavoritesResponse>({
        url: `${EnvironmentUrls.apiGatewayUrl}/look-api/v1/looks/${id}/favorite`,
        retryable: true,
        withCredentials: true
      });
      return data?.isFavorited ?? false;
    }
    const { data } = await httpService.get<JSON>({
      url: `${EnvironmentUrls.catalogApi}/v1/favorites/users/${CurrentUser.userId}/${itemType}/${id}/favorite`,
      retryable: true,
      withCredentials: true
    });

    return data !== null;
  },

  postFavorite: async (id: number | string, itemType: string): Promise<number> => {
    if (itemType === 'looks') {
      const data = {
        lookType: 'Avatar',
        id
      };
      const { status } = await httpService.post<LookFavoritesResponse>(
        {
          url: `${EnvironmentUrls.apiGatewayUrl}/look-api/v1/looks/favorite/create`,
          retryable: true,
          withCredentials: true
        },
        data
      );
      return status;
    }
    const { status } = await httpService.post<number>({
      url: `${EnvironmentUrls.catalogApi}/v1/favorites/users/${CurrentUser.userId}/${itemType}/${id}/favorite`,
      retryable: true,
      withCredentials: true
    });
    return status;
  },

  deleteFavorite: async (id: number | string, itemType: string): Promise<number> => {
    if (itemType === 'looks') {
      const data = {
        lookType: 'Avatar',
        id
      };
      const { status } = await httpService.post<LookFavoritesResponse>(
        {
          url: `${EnvironmentUrls.apiGatewayUrl}/look-api/v1/looks/favorite/delete`,
          retryable: true,
          withCredentials: true
        },
        data
      );
      return status;
    }
    const { status } = await httpService.delete<number>({
      url: `${EnvironmentUrls.catalogApi}/v1/favorites/users/${CurrentUser.userId}/${itemType}/${id}/favorite`,
      retryable: true,
      withCredentials: true
    });
    return status;
  },
  getShowFavoriteCount: async (): Promise<TShowFavoriteCount> => {
    return Guac.callBehaviour<TShowFavoriteCount>('app-policy');
  }
};

export default FavoritesButtonService;
