import { useCallback, useState } from "react";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import AvatarAccoutrementService from "../utils/avatarAccoutrementService";
import { LayeredClothingAssetSlot, LayeredClothingSlot, isEmptySlot, CategoryRow } from "../types";
import { avatarRefineChangeOrderTapEvent, avatarRefineAutosavedEvent } from "../eventService";
import { SetWearingAssetsResponse } from "../services/avatarAPIService";
import getItemThumbnailAndLink from "../utils/assetManager.helpers";

const useLayeredClothingSlots = (
  currentlyWearingAssets: AccoutrementAsset[],
  setWearingAssets: (assets: AccoutrementAsset[]) => Promise<SetWearingAssetsResponse>,
) => {
  const [layeredClothingSlots, setLayeredClothingSlots] = useState<LayeredClothingSlot[]>([]);
  const [layeredClothingItemCount, setLayeredClothingItemCount] = useState<number>(0);

  const isLayeredClothingCategory = useCallback(
    (menuName: string | undefined, selectedRow: CategoryRow | undefined | null): boolean => {
      if (menuName && AvatarAccoutrementService.getAssetTypeByName(menuName)) {
        return AvatarAccoutrementService.isLayeredClothing(
          AvatarAccoutrementService.getAssetTypeByName(menuName).id,
          true,
        );
      }
      if (selectedRow?.showLayeredClothingSlots) {
        return true;
      }
      return false;
    },
    [],
  );

  const showLayeredClothingSlotUp = useCallback(
    (item: LayeredClothingSlot): boolean => {
      const index = layeredClothingSlots.indexOf(item);
      return index > 0;
    },
    [layeredClothingSlots],
  );

  const showLayeredClothingSlotDown = useCallback(
    (item: LayeredClothingSlot): boolean => {
      const index = layeredClothingSlots.indexOf(item);
      return index < layeredClothingItemCount - 1;
    },
    [layeredClothingSlots, layeredClothingItemCount],
  );

  const constructLayeredClothingMetadata = useCallback(
    (
      assets: AccoutrementAsset[],
      newLayeredClothingOrder: LayeredClothingSlot[] | undefined = undefined,
    ) => {
      const wornAssets: AccoutrementAsset[] = [];
      let layeredClothingOrder = layeredClothingSlots;
      if (newLayeredClothingOrder !== undefined) {
        layeredClothingOrder = newLayeredClothingOrder;
      }
      assets.forEach(asset => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const assetInfo: AccoutrementAsset = JSON.parse(JSON.stringify(asset));
        if (AvatarAccoutrementService.isLayeredClothing(asset.assetType.id)) {
          let order = AvatarAccoutrementService.getLayeredClothingAssetOrder(asset.assetType.id);
          const findLcItem = (item: LayeredClothingSlot) =>
            !isEmptySlot(item) && item.id === asset.id;
          const lcIndex = layeredClothingOrder.findIndex(findLcItem);
          if (lcIndex >= 0) {
            order = lcIndex;
          }
          if (order !== undefined) {
            assetInfo.meta = {
              order,
              // this doesn't exist on the type?
              // version: 1
            };
          }
        }
        wornAssets.push(assetInfo);
      });

      return wornAssets;
    },
    [layeredClothingSlots],
  );

  const onLayeredClothingSlotMove = useCallback(
    (item: LayeredClothingSlot, isUp: boolean): void => {
      const itemInCurrentlyWornList = currentlyWearingAssets?.find(
        asset => "id" in item && asset.id === item.id,
      );
      if (!itemInCurrentlyWornList) {
        return;
      }
      const itemOrderCurrent = itemInCurrentlyWornList.meta?.order;
      const itemOrderToSwap = isUp ? itemOrderCurrent - 1 : itemOrderCurrent + 1;
      if (currentlyWearingAssets) {
        const reorderedAssets = currentlyWearingAssets.map(asset => {
          if (asset.meta?.order === itemOrderCurrent) {
            return { ...asset, meta: { ...asset.meta, order: itemOrderToSwap } };
          }
          if (asset.meta?.order === itemOrderToSwap) {
            return { ...asset, meta: { ...asset.meta, order: itemOrderCurrent } };
          }
          return asset;
        });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        setWearingAssets(reorderedAssets);

        avatarRefineChangeOrderTapEvent();
        avatarRefineAutosavedEvent();
      }
    },
    [currentlyWearingAssets, setWearingAssets],
  );

  const onLayeredClothingSlotUp = useCallback(
    (item: LayeredClothingSlot): void => {
      if (!showLayeredClothingSlotUp(item)) {
        return;
      }
      onLayeredClothingSlotMove(item, true);
    },
    [onLayeredClothingSlotMove, showLayeredClothingSlotUp],
  );

  const onLayeredClothingSlotDown = useCallback(
    (item: LayeredClothingSlot): void => {
      if (!showLayeredClothingSlotDown(item)) {
        return;
      }
      onLayeredClothingSlotMove(item, false);
    },
    [onLayeredClothingSlotMove, showLayeredClothingSlotDown],
  );

  const updateLayeredClothingSlots = useCallback(
    (assets: AccoutrementAsset[]) => {
      const newLayeredClothingSlots: LayeredClothingSlot[] = [];
      const orderedLayeredClothing = assets
        .filter(asset => AvatarAccoutrementService.isLayeredClothing(asset.assetType.id, true))
        .sort((a, b) => {
          if (a.meta?.order === undefined || b.meta?.order === undefined) {
            return 0;
          }
          if (a.meta.order === b.meta.order) {
            return -1;
          }
          return a.meta.order - b.meta.order;
        });

      const max = AvatarAccoutrementService.maxNumberOfLayeredClothingItems;
      let count = 0;
      orderedLayeredClothing.forEach(asset => {
        if (count >= max) {
          return;
        }
        if (AvatarAccoutrementService.isLayeredClothing(asset.assetType.id, true)) {
          const slot: Omit<LayeredClothingAssetSlot, "thumbnail" | "link" | "thumbnailType"> = {
            ...asset,
            type: "Asset",
            meta: {
              order: count,
            },
          };

          const updatedSlot: LayeredClothingSlot = {
            ...getItemThumbnailAndLink(slot as any),
            ...slot,
          } as LayeredClothingSlot;
          if (asset.meta !== undefined) {
            let sortCounter = 0;
            for (sortCounter = 0; sortCounter < count; sortCounter++) {
              const currentSlot = newLayeredClothingSlots[sortCounter]!;
              if (!isEmptySlot(currentSlot) && asset.meta.order <= currentSlot.meta.order) {
                break;
              }
            }
            newLayeredClothingSlots.splice(sortCounter, 0, updatedSlot as any);
          } else {
            newLayeredClothingSlots.push(updatedSlot as any);
          }

          count += 1;
        }
      });

      setLayeredClothingItemCount(newLayeredClothingSlots.length);

      while (count < max) {
        count += 1;
        newLayeredClothingSlots.push({ empty: true });
      }

      setLayeredClothingSlots(newLayeredClothingSlots);
    },
    [setLayeredClothingSlots],
  );

  return {
    layeredClothingSlots,
    layeredClothingItemCount,
    isLayeredClothingCategory,
    showLayeredClothingSlotUp,
    onLayeredClothingSlotUp,
    showLayeredClothingSlotDown,
    onLayeredClothingSlotDown,
    updateLayeredClothingSlots,
    constructLayeredClothingMetadata,
  };
};

export default useLayeredClothingSlots;
