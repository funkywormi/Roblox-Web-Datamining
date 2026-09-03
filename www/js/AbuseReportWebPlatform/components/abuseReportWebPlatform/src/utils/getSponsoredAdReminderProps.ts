import { ThumbnailAssetsSize, ThumbnailTypes } from "@rbx/thumbnails";
import dataStore from "@rbx/core-scripts/data-store";
import { ArwpReminderRenderProps } from "./types";
import { CustomUrlParamsType } from "../context/ArwpUrlParamProvider";

const getSponsoredAdReminderProps = async (
  customParams?: CustomUrlParamsType,
): Promise<ArwpReminderRenderProps | null> => {
  try {
    if (!customParams?.stringId || !customParams.adCreativeAssetId) {
      return null;
    }

    const universeId = Number(customParams.stringId);
    if (Number.isNaN(universeId)) {
      return null;
    }

    let universeName: string | undefined;
    let creatorName: string | undefined;
    try {
      const { data: payload } = await dataStore.gamesDataStore.getGameDetails([universeId]);
      const details = payload.data?.[0];
      universeName = details?.name;
      creatorName = details?.creator?.name;
    } catch {
      return null;
    }

    return {
      subtitle: universeName,
      message: creatorName,
      thumbnailProps: {
        containerClass: "radius-medium clip height-1600 width-[calc(var(--size-1600)*16/9)]",
        size: ThumbnailAssetsSize.width256,
        targetId: customParams.adCreativeAssetId,
        type: ThumbnailTypes.assetThumbnail,
      },
    };
  } catch {
    return null;
  }
};

export default getSponsoredAdReminderProps;
