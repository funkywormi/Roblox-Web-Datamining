/* eslint-disable no-void */
import { useCallback, useEffect, useState } from "react";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { getThumbnails, ThumbnailState } from "../services/thumbnailsService";

type Thumbnails = {
  bonusItemId: number | undefined;
  bonusItemRootPlaceId: number | undefined;
  giftingUrl: string;
};

export function useThumbnails({ bonusItemId, giftingUrl, bonusItemRootPlaceId }: Thumbnails): {
  bonusItemBannerImageUrl: string;
  bonusItemImageUrl: string;
  giftingAvatarImageUrl: string;
} {
  const [bonusItemBannerImageUrl, setBonusItemBannerImageUrl] = useState<string>("");
  const [bonusItemImageUrl, setBonusItemImageUrl] = useState<string>("");
  const [giftingAvatarImageUrl, setGiftingAvatarImageUrl] = useState<string>("");

  const fetchThumbnail = useCallback(
    async ({ bonusItemId: itemId, giftingUrl: url, bonusItemRootPlaceId: placeId }: Thumbnails) => {
      const thumbnailArgs: object[] = [];
      if (itemId) {
        thumbnailArgs.push({
          format: "png",
          requestId: itemId,
          size: "150x150",
          targetId: itemId,
          type: "GamePass",
        });
      }

      if (url && CurrentUser) {
        thumbnailArgs.push({
          format: "png",
          requestId: CurrentUser.userId,
          size: "150x150",
          targetId: CurrentUser.userId,
          type: "AvatarHeadshot",
        });
      }

      if (placeId) {
        thumbnailArgs.push({
          format: "png",
          requestId: placeId,
          size: "768x432",
          targetId: placeId,
          type: "GameThumbnail",
        });
      }

      const data = await getThumbnails(thumbnailArgs);
      data?.data.forEach(thumbnail => {
        if (thumbnail.state !== ThumbnailState.Completed) {
          return;
        }

        // TODO: remove @ts-ignores once rootPlaceId / virtualPurchasingProductTargetId types are fixed
        // @ts-expect-error itemId is typed as number but is coming from BE as string
        if (thumbnail.targetId.toString() === itemId) {
          setBonusItemImageUrl(thumbnail.imageUrl);
        }

        if (thumbnail.targetId.toString() === CurrentUser?.userId) {
          setGiftingAvatarImageUrl(thumbnail.imageUrl);
        }

        // @ts-expect-error placeId is typed as number but is coming from BE as string
        if (thumbnail.targetId.toString() === placeId) {
          setBonusItemBannerImageUrl(thumbnail.imageUrl);
        }
      });
    },
    [],
  );

  useEffect(() => {
    if (!bonusItemRootPlaceId && !bonusItemId && !giftingUrl) {
      return;
    }

    void fetchThumbnail({ bonusItemId, bonusItemRootPlaceId, giftingUrl });
  }, [bonusItemRootPlaceId, bonusItemId, giftingUrl, fetchThumbnail]);

  return {
    bonusItemBannerImageUrl,
    bonusItemImageUrl,
    giftingAvatarImageUrl,
  };
}
