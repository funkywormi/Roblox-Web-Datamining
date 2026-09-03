import { useCallback } from "react";
import { ItemCard } from "@rbx/core-ui";
import { AvatarItemType } from "@rbx/profile-platform";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { HydratedAsset } from "../services/catalogService";

const useRenderAssetItem = (showCreatorName: boolean, showPrice: boolean, className?: string) => {
  const renderAssetItem = useCallback(
    (asset: HydratedAsset) => (
      <ItemCard
        id={asset.assetId}
        name={asset.name ?? ""}
        type={asset.itemType}
        creatorName={asset.creatorName ?? ""}
        // Set creatorType to User and creatorTargetId to 1 to hide creator name
        creatorType={showCreatorName ? (asset.creatorType ?? "") : "User"}
        creatorTargetId={showCreatorName ? (asset.creatorTargetId ?? 1) : 1}
        price={asset.price}
        lowestPrice={asset.lowestPrice}
        priceStatus={asset.priceStatus}
        premiumPricing={asset.premiumPricing}
        unitsAvailableForConsumption={asset.unitsAvailableForConsumption}
        itemStatus={asset.itemStatus}
        itemRestrictions={asset.itemRestrictions}
        containerClassName={`item-card ${!showPrice ? "hide-price" : ""} ${className}`}
        thumbnail2d={
          <Thumbnail2d
            type={
              asset.itemType === AvatarItemType.Bundle
                ? ThumbnailTypes.bundleThumbnail
                : ThumbnailTypes.assetThumbnail
            }
            targetId={asset.assetId}
          />
        }
      />
    ),
    [showCreatorName, className, showPrice],
  );

  const getItemId = useCallback((asset: HydratedAsset) => asset.assetId, []);

  const onItemsImpressed = useCallback((_itemIndexes: number[]) => {
    // TODO: Implement analytics for asset item impressions
  }, []);

  return { renderAssetItem, getItemId, onItemsImpressed };
};

export default useRenderAssetItem;
