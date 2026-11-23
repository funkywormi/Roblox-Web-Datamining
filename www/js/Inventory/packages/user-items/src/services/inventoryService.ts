import assetsConstants from "../constants/assetsConstants";
import inventoryConstants from "../constants/inventoryConstants";
import type { Category, PageResponse } from "../constants/types";
import {
  formatCreatorStoreAsset,
  formatInventoryV2Asset,
  translateBadgeItem,
  translateCatalogItem,
  translateGamePassItem,
  translatePlace,
  translatePrivateServer,
  type BadgeResponseItem,
  type CatalogBundleResponseItem,
  type CreatorStoreItemDetails,
  type GamePassResponseItem,
  type InventoryV2ResponseItem,
  type PlaceResponseItem,
} from "../mappers/assetMappers";
import formatString from "../utils/formatString";
import {
  loadMyPrivateServersPage,
  type ListUserPrivateServersResponse,
  type PrivateServerV1Item,
  type PrivateServersPage,
} from "../utils/privateServersV2";
import { getCurrentUserId } from "../utils/userInfo";
import { getJson, rejectWithDataOrError, rejectWithError } from "./request";

export type InventoryPagingParameters = {
  cursor: string;
  count: number;
  userId: number | null;
  placeTab: string | null | undefined;
  assetTypeId: number;
  sortOrder: string;
  type: string;
  inventoryUpdatesEnabled: boolean | undefined;
  privateServerStatus: string | undefined;
};

type CursorResponse<T> = {
  data?: T[] | null;
  nextPageCursor?: string | null;
  Data?: { nextPageCursor?: string | null } | null;
};

const getNextPageCursor = (response: CursorResponse<unknown>) =>
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  response.nextPageCursor ? response.nextPageCursor : response.Data?.nextPageCursor;

export const getUser = (userId: number | null): Promise<{ displayName?: string }> =>
  getJson({ url: formatString(inventoryConstants.urls.getUser, { userId }) });

export const getPrivateServers = (
  pagingParameters: InventoryPagingParameters,
): Promise<PageResponse> => {
  const isMyPrivateServersTab =
    pagingParameters.placeTab === assetsConstants.types.myPrivateServers;

  const fetchV1 = (cursor: string): Promise<PrivateServersPage> =>
    getJson<{ data: PrivateServerV1Item[]; nextPageCursor: string | null }>(
      { url: inventoryConstants.urls.getPrivateServers },
      {
        privateServersTab: pagingParameters.placeTab,
        itemsPerPage: pagingParameters.count,
        cursor,
      },
    ).then(response => ({ items: response.data, nextPageCursor: response.nextPageCursor }));

  // v2 returns 403 for anyone but the signed-in user, who is also the only user v1's "my" endpoint serves.
  const fetchV2 = (pageToken: string): Promise<ListUserPrivateServersResponse> =>
    getJson<ListUserPrivateServersResponse>(
      {
        url: formatString(inventoryConstants.urls.getMyPrivateServersV2, {
          userId: getCurrentUserId(),
        }),
      },
      {
        pageSize: pagingParameters.count,
        pageToken: pageToken || undefined,
        status: pagingParameters.privateServerStatus,
      },
    );

  return (
    isMyPrivateServersTab
      ? loadMyPrivateServersPage(fetchV2, pagingParameters.cursor)
      : fetchV1(pagingParameters.cursor)
  )
    .then(page => {
      const isOtherServersTab =
        pagingParameters.placeTab === assetsConstants.types.otherPrivateServers;
      return {
        nextPageCursor: page.nextPageCursor,
        items: page.items.map(item => ({
          ...translatePrivateServer(
            item,
            isMyPrivateServersTab,
            pagingParameters.inventoryUpdatesEnabled,
          ),
          ...(isOtherServersTab && { hidePrice: true }),
        })),
      };
    })
    .catch(rejectWithDataOrError);
};

export const getPlaces = (pagingParameters: InventoryPagingParameters): Promise<PageResponse> => {
  let placesTab = pagingParameters.placeTab;
  if (placesTab === null) {
    placesTab = "Created";
  }

  return getJson<CursorResponse<PlaceResponseItem>>(
    {
      url: formatString(inventoryConstants.urls.getPlaces, {
        userId: pagingParameters.userId,
      }),
    },
    {
      itemsPerPage: pagingParameters.count,
      cursor: pagingParameters.cursor,
      placesTab,
    },
  )
    .then(response => ({
      nextPageCursor: response.nextPageCursor,
      items: (response.data ?? []).map(translatePlace),
    }))
    .catch(rejectWithDataOrError);
};

export const getInventoryItemsV2 = (
  pagingParameters: InventoryPagingParameters,
): Promise<PageResponse> =>
  getJson<CursorResponse<InventoryV2ResponseItem>>(
    {
      url: formatString(inventoryConstants.urls.getUserInventoryV2, {
        userId: pagingParameters.userId,
        assetTypeId: pagingParameters.assetTypeId,
      }),
    },
    {
      limit: pagingParameters.count,
      cursor: pagingParameters.cursor,
      sortOrder: "Desc",
    },
  )
    .then(response => ({
      nextPageCursor: getNextPageCursor(response),
      items: (response.data ?? []).map(formatInventoryV2Asset),
    }))
    .catch(rejectWithDataOrError);

export const getBadges = (pagingParameters: InventoryPagingParameters): Promise<PageResponse> =>
  getJson<CursorResponse<BadgeResponseItem>>(
    {
      url: formatString(inventoryConstants.urls.getBadges, {
        userId: pagingParameters.userId,
      }),
    },
    {
      limit: pagingParameters.count,
      cursor: pagingParameters.cursor,
      sortOrder: "Desc",
    },
  )
    .then(response => ({
      nextPageCursor: response.nextPageCursor,
      items: (response.data ?? []).map(translateBadgeItem),
    }))
    .catch(rejectWithError);

type CreatorStoreItemDetailsResponse = {
  data: (CreatorStoreItemDetails & { asset: { id: number } })[];
};

const getCreatorStoreItemDetailsMap = (
  assetIds: number[],
): Promise<Record<number, CreatorStoreItemDetails> | undefined> =>
  // Make a single call to Toolbox service to fetch details for all assetIds
  getJson<CreatorStoreItemDetailsResponse>({
    url: formatString(inventoryConstants.urls.getCreatorStoreItemDetails, {
      assetIds: assetIds.join(","),
    }),
  })
    .then(itemDetailResponse =>
      itemDetailResponse.data.reduce<Record<number, CreatorStoreItemDetails>>(
        (result, itemDetails) => ({ ...result, [itemDetails.asset.id]: itemDetails }),
        {},
      ),
    )
    // If the call to Toolbox service fails, format the items without item details
    .catch(() => undefined);

export const getCreatorStoreAssets = (
  pagingParameters: InventoryPagingParameters,
): Promise<PageResponse> =>
  getJson<CursorResponse<InventoryV2ResponseItem>>(
    {
      url: formatString(inventoryConstants.urls.getUserInventoryV2, {
        userId: pagingParameters.userId,
        assetTypeId: pagingParameters.assetTypeId,
      }),
    },
    {
      limit: pagingParameters.count,
      cursor: pagingParameters.cursor,
      sortOrder: "Desc",
    },
  )
    .then(async inventoryResponse => {
      const items = inventoryResponse.data ?? [];
      const assetIds = items.map(item => item.assetId);

      if (assetIds.length === 0) {
        return {
          nextPageCursor: inventoryResponse.nextPageCursor,
          items,
        };
      }

      const itemDetailsMap = await getCreatorStoreItemDetailsMap(assetIds);
      return {
        nextPageCursor: getNextPageCursor(inventoryResponse),
        items: items.map(item =>
          formatCreatorStoreAsset(
            item,
            itemDetailsMap?.[item.assetId],
            pagingParameters.assetTypeId,
          ),
        ),
      };
    })
    .catch(rejectWithDataOrError);

const getUserBundles = (url: string, pagingParameters: InventoryPagingParameters) =>
  getJson<CursorResponse<CatalogBundleResponseItem>>(
    { url },
    {
      limit: pagingParameters.count,
      cursor: pagingParameters.cursor,
      sortOrder: pagingParameters.sortOrder,
    },
  )
    .then(response => ({
      nextPageCursor: response.nextPageCursor,
      items: (response.data ?? []).map(translateCatalogItem),
    }))
    .catch(rejectWithError);

export const getBundles = (pagingParameters: InventoryPagingParameters): Promise<PageResponse> =>
  getUserBundles(
    formatString(inventoryConstants.urls.getBundles, {
      userId: pagingParameters.userId,
    }),
    pagingParameters,
  );

export const getBundlesWithBundleType = (
  pagingParameters: InventoryPagingParameters,
): Promise<PageResponse> =>
  getUserBundles(
    formatString(inventoryConstants.urls.getBundlesWithType, {
      userId: pagingParameters.userId,
      bundleType: pagingParameters.assetTypeId,
    }),
    pagingParameters,
  );

export const getGamePasses = (pagingParameters: InventoryPagingParameters): Promise<PageResponse> =>
  getJson<{ gamePasses: GamePassResponseItem[] }>(
    {
      url: formatString(inventoryConstants.urls.getGamePasses, {
        userId: pagingParameters.userId,
      }),
    },
    {
      count: pagingParameters.count,
      exclusiveStartId: pagingParameters.cursor,
    },
  )
    .then(response => {
      // The game pass endpoint uses exclusiveStartId instead of cursor
      // So we pass in ID of last returned game pass if there was one
      const lastGamePass = response.gamePasses.at(-1);
      return {
        nextPageCursor: lastGamePass ? lastGamePass.gamePassId.toString() : undefined,
        items: response.gamePasses.map(translateGamePassItem),
      };
    })
    .catch(rejectWithError);

export const getCategories = (userId: number | null): Promise<{ categories: Category[] }> =>
  getJson({ url: formatString(inventoryConstants.urls.getCategories, { userId }) }, {});
