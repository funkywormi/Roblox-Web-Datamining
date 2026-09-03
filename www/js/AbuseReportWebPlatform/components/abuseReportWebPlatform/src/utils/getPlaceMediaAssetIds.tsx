import dataStore from "@rbx/core-scripts/data-store";

/**
 * Fetches all media asset IDs associated with a given universe.
 * This includes thumbnails and the game icon, if available.
 *
 * @param universeId - The ID of the universe to fetch media for.
 * @returns A promise that resolves to an array of media asset IDs.
 */
export const getPlaceMediaAssetIds = async (universeId: string): Promise<number[]> => {
  let thumbnailAssetIds: number[];
  try {
    const universeMediaRes = await dataStore.gamesDataStore.getUniverseMedia(Number(universeId));
    thumbnailAssetIds = [
      ...new Set(
        universeMediaRes.data.data
          ?.filter(item => item.approved)
          .map(item => item.imageId)
          .filter((id): id is number => typeof id === "number") ?? [],
      ),
    ];
  } catch {
    thumbnailAssetIds = [];
  }
  return thumbnailAssetIds;
};
