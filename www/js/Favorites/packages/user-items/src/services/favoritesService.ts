import { callBehaviour } from "@rbx/core-scripts/guac";
import favoritesConstants from "../constants/favoritesConstants";
import type { Category, PageResponse } from "../constants/types";
import {
  convertCreatorTypeStringToNumber,
  formatCreatorStoreAsset,
  translateCatalogItem,
  translateFavoriteAsset,
  translateFavoriteLook,
  translateFavoritePlace,
  type CatalogBundleResponseItem,
  type CreatorStoreItemDetails,
  type FavoriteGameResponseItem,
  type FavoriteResponseItem,
} from "../mappers/assetMappers";
import formatString from "../utils/formatString";
import { getJson, postJson, rejectWithError } from "./request";

export type FavoritesPagingParameters = {
  cursor: string;
  count: number;
  userId: number | null;
  itemType: string;
  subtypeId: number;
};

type CursorResponse<T> = {
  data?: T[] | null;
  nextPageCursor?: string | null;
};

export const getUser = (userId: number | null): Promise<{ displayName?: string }> =>
  getJson({ url: formatString(favoritesConstants.urls.getUser, { userId }) });

export const getInventoryCreatorNamePolicy = (): Promise<{
  displayCreatorNameInFavorites: boolean;
}> => callBehaviour("inventory-creator-policy");

type CreatorStoreFavorite = {
  asset: { id: number; name: string };
  creator: { creator: string; name: string };
};

// When Creator team moves this page to CreatorHub, we can delete this
export const getFavoriteCreatorAssets = async (
  pagingParameters: FavoritesPagingParameters,
): Promise<PageResponse> => {
  try {
    const response = await getJson<{
      data: CreatorStoreFavorite[];
      nextPageCursor?: string | null;
    }>(
      {
        url: formatString(favoritesConstants.urls.getCreatorStoreFavoriteAssets, {
          userId: pagingParameters.userId,
          subtypeId: pagingParameters.subtypeId,
        }),
      },
      {
        limit: pagingParameters.count,
        cursor: pagingParameters.cursor,
      },
    );
    const items = response.data;
    const itemDetailsMap = items.reduce<Record<number, CreatorStoreItemDetails>>(
      (result, item) => ({
        ...result,
        [item.asset.id]: {
          creator: {
            // api returns type and id as a single string e.g. 'user/1'
            id: Number(item.creator.creator.split("/")[1]),
            type: convertCreatorTypeStringToNumber(item.creator.creator.split("/")[0] ?? ""),
            name: item.creator.name,
          },
        },
      }),
      {},
    );

    return {
      nextPageCursor: response.nextPageCursor,
      items: items.map(item =>
        formatCreatorStoreAsset(
          { ...item, assetId: item.asset.id, assetName: item.asset.name },
          itemDetailsMap[item.asset.id],
          pagingParameters.subtypeId,
        ),
      ),
    };
  } catch (error) {
    return rejectWithError(error);
  }
};

export const getFavoriteAssets = async (
  pagingParameters: FavoritesPagingParameters,
): Promise<PageResponse> => {
  try {
    const response = await getJson<CursorResponse<FavoriteResponseItem>>(
      {
        url: formatString(favoritesConstants.urls.getUserFavoriteAssets, {
          userId: pagingParameters.userId,
          subtypeId: pagingParameters.subtypeId,
        }),
      },
      {
        limit: pagingParameters.count,
        cursor: pagingParameters.cursor,
      },
    );
    return {
      nextPageCursor: response.nextPageCursor ?? null,
      items: (response.data ?? []).map(translateFavoriteAsset),
    };
  } catch (error) {
    return rejectWithError(error);
  }
};

type HydratedLook = {
  id: number;
  name: string;
  curator: { type: string; name: string; id: number };
  totalPrice: number | null;
};

export const getFavoriteLooks = async (
  pagingParameters: FavoritesPagingParameters,
): Promise<PageResponse> => {
  try {
    const response = await getJson<{ lookIds?: number[] | null; nextPageCursor?: string | null }>(
      { url: favoritesConstants.urls.getUserFavoriteLooks },
      {
        limit: pagingParameters.count,
        cursor: pagingParameters.cursor,
        isPrevious: false,
        userId: pagingParameters.userId,
        lookType: "Avatar",
      },
    );
    const lookIds = response.lookIds ?? [];

    if (lookIds.length === 0) {
      return { nextPageCursor: null, items: [] };
    }

    const lookReq = lookIds.map(lookId => ({ id: lookId, type: "Look" }));

    const widgetResult = await postJson<{ hydratedContent?: HydratedLook[] } | null>(
      { url: favoritesConstants.urls.getHydratedWidgets },
      { content: lookReq },
    );
    const hydratedContentMap: Record<number, HydratedLook | undefined> = {};
    const hydratedContent = widgetResult?.hydratedContent ?? [];
    hydratedContent.forEach(content => {
      hydratedContentMap[content.id] = content;
    });

    const items = lookIds.flatMap(lookId => {
      const content = hydratedContentMap[lookId];
      if (!content) {
        return [];
      }
      return [
        translateFavoriteLook({
          itemType: "Look",
          name: content.name,
          creatorType: content.curator.type,
          creatorName: content.curator.name,
          price: content.totalPrice,
          isOffSale: false,
          creatorTargetId: content.curator.id,
          id: lookId,
        }),
      ];
    });

    return {
      nextPageCursor: response.nextPageCursor ?? null,
      items,
    };
  } catch (error) {
    return rejectWithError(error);
  }
};

export const getFavoriteGames = async (
  pagingParameters: FavoritesPagingParameters,
): Promise<PageResponse> => {
  try {
    const response = await getJson<CursorResponse<FavoriteGameResponseItem>>(
      {
        url: formatString(favoritesConstants.urls.getUserFavoriteGames, {
          userId: pagingParameters.userId,
        }),
      },
      {
        limit: pagingParameters.count,
        cursor: pagingParameters.cursor,
        sortOrder: "Desc",
      },
    );
    return {
      nextPageCursor: response.nextPageCursor ?? null,
      items: (response.data ?? []).map(translateFavoritePlace),
    };
  } catch (error) {
    return rejectWithError(error);
  }
};

export const getFavoriteBundles = async (
  pagingParameters: FavoritesPagingParameters,
): Promise<PageResponse> => {
  try {
    const response = await getJson<{
      favorites: CatalogBundleResponseItem[];
      nextCursor?: string | null;
    }>(
      {
        url: formatString(favoritesConstants.urls.getUserFavoriteBundles, {
          userId: pagingParameters.userId,
          subtypeId: pagingParameters.subtypeId,
        }),
      },
      {
        itemsPerPage: pagingParameters.count,
        cursor: pagingParameters.cursor,
      },
    );
    return {
      // What's important is that we return a unique next page cursor string, even if we're not reading it.
      // The consumer of this method needs it to know if there _is_ a next page.
      nextPageCursor: response.nextCursor ?? null,
      items: response.favorites.map(translateCatalogItem),
    };
  } catch (error) {
    return rejectWithError(error);
  }
};

export const getCategories = (userId: number | null): Promise<{ categories: Category[] }> =>
  getJson({ url: formatString(favoritesConstants.urls.getCategories, { userId }) }, {});
