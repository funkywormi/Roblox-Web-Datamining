import dataStores from "@rbx/core-scripts/data-store";
import { TAssetType, TCarouselItem, TGetUniverseAssetIdsResponse } from "../types/carouselTypes";

const { gamesDataStore } = dataStores;

const universeAssetIdsCache: { [key: string]: TCarouselItem[] } = {};

const getUniverseAssetIds = async (universeId: string): Promise<TCarouselItem[]> => {
  if (universeAssetIdsCache[universeId]) {
    return universeAssetIdsCache[universeId];
  }

  const {
    data: { data = [] },
  } = await gamesDataStore.getUniverseMedia(universeId as unknown as number);

  const filteredData = (data as TGetUniverseAssetIdsResponse[])
    .filter(asset => asset.approved)
    .map<TCarouselItem>(asset => {
      switch (asset.assetType) {
        case TAssetType.Image:
          return {
            id: asset.imageId.toString(),
            type: asset.assetType,
            assetId: asset.imageId,
            altText: asset.altText,
          };
        case TAssetType.YouTubeVideo:
          return {
            id: asset.videoHash,
            type: asset.assetType,
            videoHash: asset.videoHash,
          };
        case TAssetType.GamePreviewVideo:
          return {
            id: asset.videoId.toString(),
            type: asset.assetType,
            videoId: asset.videoId,
            imageId: asset.imageId,
          };
        default:
          return { id: "0", type: TAssetType.Unknown, assetId: 0 };
      }
    })
    .filter(asset => asset.type !== TAssetType.Unknown);

  universeAssetIdsCache[universeId] = filteredData;
  return filteredData;
};

export default {
  getUniverseAssetIds,
};
