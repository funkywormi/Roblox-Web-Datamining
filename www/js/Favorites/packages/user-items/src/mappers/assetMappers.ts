import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { concat } from "@rbx/core-scripts/format/string";
import { ThumbnailTypes } from "../constants/thumbnailTypes";
import assetsConstants from "../constants/assetsConstants";
import { creatorStoreAssetTypes } from "../constants/creatorStoreAssetTypes";
import type { AssetItem, Category, ItemCreator, ItemSection } from "../constants/types";
import type { PrivateServerV1Item } from "../utils/privateServersV2";
import formatString from "../utils/formatString";
import { mapItemRestrictionIcons } from "./itemCardMappers";

type ApiCreator = {
  id: number;
  type: string;
  name: string;
};

export type PlaceResponseItem = {
  name: string;
  placeId: number;
  universeId: number;
  creator: ApiCreator;
  priceInRobux: number | null;
};

export type FavoriteGameResponseItem = {
  id: number;
  name: string;
  rootPlace: { id: number };
  creator: ApiCreator;
};

export type CatalogBundleResponseItem = {
  id: number;
  name: string;
  creator?: { id: number; type: string | number; name: string };
};

export type FavoriteResponseItem = {
  id: number;
  name: string;
  creatorType: string;
  creatorName: string;
  creatorTargetId: number;
  price: number | null;
  lowestPrice?: number;
  itemRestrictions?: string[];
  itemType?: string;
  isOffSale?: boolean;
};

export type BadgeResponseItem = {
  id: number;
  displayName: string;
  creator: ApiCreator;
};

export type GamePassResponseItem = {
  gamePassId: number;
  name: string;
  price: number | null;
  isForSale: boolean;
  creator: { creatorType: string; creatorId: number; name: string };
};

export type InventoryV2ResponseItem = {
  assetId: number;
  serialNumber?: number;
};

export type CreatorStoreItemDetails = {
  creator?: {
    id: number;
    type: number;
    name: string;
  };
};

const withNameForDisplay = (creator: ItemCreator): ItemCreator => {
  const { userTypes, robloxSystemUserId } = assetsConstants;
  const { Name: creatorName = "", Type: creatorType, Id: creatorTargetId } = creator;

  if (userTypes.user === creatorType && robloxSystemUserId !== creatorTargetId) {
    // some of the inventory api is already include @ as creatorName
    // the better solution is to isoalte inventory api from www site
    // so not use same CreatorModal as item details page
    return {
      ...creator,
      nameForDisplay: creatorName.startsWith("@") ? creatorName : concat(["", creatorName]),
    };
  }
  return { ...creator, nameForDisplay: creatorName };
};

const profileLink = (creatorTypeNum: number, id: number) =>
  creatorTypeNum === assetsConstants.userTypes.user
    ? getAbsoluteUrl(`/users/${id}/profile`)
    : getAbsoluteUrl(`/groups/${id}`);

export const convertCreatorTypeStringToNumber = (creatorType: string): number => {
  const { userTypes, userTypesString } = assetsConstants;
  switch (creatorType.toLowerCase()) {
    case userTypesString.user.toLowerCase():
      return userTypes.user;
    case userTypesString.group.toLowerCase():
      return userTypes.group;
    default:
      return userTypes.user;
  }
};

export const getItemSection = (category: Pick<Category, "categoryType">): ItemSection => {
  const { types } = assetsConstants;
  // library
  switch (category.categoryType) {
    case types.decal:
    case types.model:
    case types.audio:
    case types.video:
    case types.plugin:
    case types.meshPart:
      return "library";
    default:
      break;
  }

  // no section
  switch (category.categoryType) {
    case types.place:
    case types.badge:
    case types.gamePass:
    case types.animation:
    case types.privateServers:
      return null;
    default:
      break;
  }

  // catalog
  return "catalog";
};

export const translatePrivateServer = (
  item: PrivateServerV1Item,
  isMyPrivateServers: boolean,
  inventoryUpdatesEnabled: boolean | undefined,
): AssetItem => {
  const baseCreator: ItemCreator = {
    Id: item.ownerId,
    Type: assetsConstants.userTypes.user,
    Name: item.ownerName,
    CreatorProfileLink: getAbsoluteUrl(`/users/${item.ownerId}/profile`),
  };
  const isUpdated = Boolean(inventoryUpdatesEnabled) && isMyPrivateServers;

  return {
    ...item,
    Item: {
      Name: item.name,
      AbsoluteUrl: getAbsoluteUrl(`/games/${item.placeId}#!/game-instances`),
    },
    itemV2: {
      id: item.universeId,
      type: assetsConstants.itemTypes.game,
      thumbnail: {
        type: ThumbnailTypes.gameIcon,
      },
    },
    Creator: isUpdated
      ? {
          ...baseCreator,
          nameForDisplay: item.universeName,
          CreatorProfileLink: getAbsoluteUrl(`/games/${item.placeId}`),
        }
      : withNameForDisplay(baseCreator),
    ...(isUpdated && {
      showUnavailableBadge: item.isUnavailable,
      showExpiringBadge: item.isExpiring,
      showInactiveTint: item.isInactive,
      privateServerPriceLine: item.priceLine,
    }),
    Product: {
      IsFree: item.priceInRobux === null,
      TranslateFree: item.priceInRobux === null,
      PriceInRobux: item.priceInRobux,
    },
    itemType: "Asset",
  };
};

export const translatePlace = (item: PlaceResponseItem): AssetItem => ({
  ...item,
  Item: {
    Name: item.name,
    AbsoluteUrl: getAbsoluteUrl(`/games/${item.placeId}`),
  },
  itemV2: {
    id: item.universeId,
    type: assetsConstants.itemTypes.game,
    thumbnail: {
      type: ThumbnailTypes.gameIcon,
    },
  },
  Creator: withNameForDisplay({
    Id: item.creator.id,
    Type: item.creator.type,
    Name: item.creator.name,
    CreatorProfileLink:
      item.creator.type === assetsConstants.userTypesString.user
        ? getAbsoluteUrl(`/users/${item.creator.id}/profile`)
        : getAbsoluteUrl(`/groups/${item.creator.id}`),
  }),
  Product: {
    IsFree: item.priceInRobux === null,
    TranslateFree: item.priceInRobux === null,
    PriceInRobux: item.priceInRobux,
  },
  itemType: "Asset",
});

export const translateFavoritePlace = (item: FavoriteGameResponseItem): AssetItem => {
  const { id, type, name } = item.creator;
  const creatorTypeNum = convertCreatorTypeStringToNumber(type);
  return {
    ...item,
    Item: {
      Name: item.name,
      AbsoluteUrl: getAbsoluteUrl(`/games/${item.rootPlace.id}`),
    },
    itemV2: {
      id: item.id,
      type: assetsConstants.itemTypes.game,
      thumbnail: {
        type: ThumbnailTypes.gameIcon,
      },
    },
    Creator: withNameForDisplay({
      Id: id,
      Type: creatorTypeNum,
      Name: name,
      CreatorProfileLink: profileLink(creatorTypeNum, id),
    }),
    hidePrice: true,
    itemType: "Asset",
  };
};

export const translateCatalogItem = (item: CatalogBundleResponseItem): AssetItem => ({
  ...item,
  Item: {
    Name: item.name,
    AbsoluteUrl: getAbsoluteUrl(`/bundles/${item.id}`),
  },
  itemV2: {
    id: item.id,
    type: assetsConstants.itemTypes.bundle,
    thumbnail: {
      type: ThumbnailTypes.bundleThumbnail,
    },
  },
  ...(item.creator && {
    Creator: withNameForDisplay({
      Id: item.creator.id,
      Type: item.creator.type,
      Name: item.creator.name,
    }),
  }),
  itemType: "Bundle",
  hydrationRequired: true,
});

export const translateFavoriteLook = (item: FavoriteResponseItem): AssetItem => {
  const creatorTypeNum = convertCreatorTypeStringToNumber(item.creatorType);
  return mapItemRestrictionIcons({
    ...item,
    Item: {
      Name: item.name,
      AbsoluteUrl: getAbsoluteUrl(`/looks/${item.id}`),
    },
    itemV2: {
      id: item.id,
      type: assetsConstants.itemTypes.look,
      thumbnail: {
        type: ThumbnailTypes.lookThumbnail,
      },
    },
    Creator: withNameForDisplay({
      Id: item.creatorTargetId,
      Type: creatorTypeNum,
      Name: item.creatorName,
      CreatorProfileLink: profileLink(creatorTypeNum, item.creatorTargetId),
    }),
    Product: {
      IsFree: item.price === null || item.price === 0,
      PriceInRobux: item.price,
    },
    itemType: "Look",
  });
};

export const translateFavoriteAsset = (item: FavoriteResponseItem): AssetItem => {
  const creatorTypeNum = convertCreatorTypeStringToNumber(item.creatorType);
  return mapItemRestrictionIcons({
    ...item,
    Item: {
      Name: item.name,
      AbsoluteUrl: getAbsoluteUrl(`/catalog/${item.id}`),
    },
    itemV2: {
      id: item.id,
      type: assetsConstants.itemTypes.asset,
      thumbnail: {
        type: ThumbnailTypes.assetThumbnail,
      },
    },
    Creator: withNameForDisplay({
      Id: item.creatorTargetId,
      Type: creatorTypeNum,
      Name: item.creatorName,
      CreatorProfileLink: profileLink(creatorTypeNum, item.creatorTargetId),
    }),
    Product: {
      IsFree: item.price === null || item.price === 0,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      PriceInRobux: item.lowestPrice ? item.lowestPrice : item.price,
    },
    itemType: "Asset",
    // The favorites endpoint omits license metadata, so catalog details fill it in.
    hydrationRequired: true,
  });
};

export const translateBadgeItem = (item: BadgeResponseItem): AssetItem => {
  const { id, type, name } = item.creator;
  const creatorTypeNum = convertCreatorTypeStringToNumber(type);
  return {
    ...item,
    Item: {
      Name: item.displayName,
      AbsoluteUrl: getAbsoluteUrl(`/badges/${item.id}`),
    },
    itemV2: {
      id: item.id,
      type: assetsConstants.itemTypes.badge,
      thumbnail: {
        type: ThumbnailTypes.badgeIcon,
      },
    },
    Creator: withNameForDisplay({
      Id: id,
      Type: creatorTypeNum,
      Name: name,
      CreatorProfileLink: profileLink(creatorTypeNum, id),
    }),
    itemType: "Badge",
    hydrationRequired: false,
  };
};

export const translateGamePassItem = (item: GamePassResponseItem): AssetItem => {
  const creatorTypeNum = convertCreatorTypeStringToNumber(item.creator.creatorType);
  return {
    ...item,
    Item: {
      Name: item.name,
      AbsoluteUrl: getAbsoluteUrl(`/game-pass/${item.gamePassId}`),
    },
    itemV2: {
      id: item.gamePassId,
      type: assetsConstants.itemTypes.gamePass,
      thumbnail: {
        type: ThumbnailTypes.gamePassIcon,
      },
    },
    Product: {
      PriceInRobux: item.price,
      IsForSale: item.isForSale,
    },
    Creator: withNameForDisplay({
      Id: item.creator.creatorId,
      Type: creatorTypeNum,
      Name: item.creator.name,
      CreatorProfileLink: profileLink(creatorTypeNum, item.creator.creatorId),
    }),
  };
};

export const formatInventoryV2Asset = (item: InventoryV2ResponseItem): AssetItem => ({
  ...item,
  hydrationRequired: true,
  itemDetailsLoading: true,
  itemType: "Asset",
});

const isCreatorStoreAssetTypeId = (
  assetTypeId: number,
): assetTypeId is keyof typeof creatorStoreAssetTypes => assetTypeId in creatorStoreAssetTypes;

export const formatCreatorStoreAsset = (
  item: { assetId: number; assetName?: string },
  itemDetails: CreatorStoreItemDetails | undefined,
  assetTypeId: number,
): AssetItem => {
  const { assetId } = item;
  const assetType = isCreatorStoreAssetTypeId(assetTypeId)
    ? creatorStoreAssetTypes[assetTypeId]
    : undefined;
  const creator = itemDetails?.creator;

  return {
    ...item,
    id: assetId,
    itemType: "Asset",
    hydrationRequired: false,
    itemDetailsLoading: false,
    hidePrice: true,
    Item: {
      Name: item.assetName,
      AbsoluteUrl: formatString(assetsConstants.creatorStoreAssetAbsoluteUrl, {
        assetId,
        assetType: String(assetType),
      }),
    },
    itemV2: {
      id: assetId,
      type: assetsConstants.itemTypes.asset,
      thumbnail: {
        type: ThumbnailTypes.assetThumbnail,
      },
    },
    ...(creator && {
      Creator: withNameForDisplay({
        Id: creator.id,
        Name: creator.name,
        Type: creator.type,
        CreatorProfileLink: profileLink(creator.type, creator.id),
      }),
    }),
  };
};
