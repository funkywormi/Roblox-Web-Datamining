import { useEffect, useReducer, useRef } from "react";
import type { AssetItem, ItemSection } from "../constants/types";
import {
  mapCatalogDetailsToInventoryItemCard,
  type CatalogItemDetail,
} from "../mappers/itemCardMappers";
import { postItemDetails } from "../services/assetsService";

type DetailCache = Record<string, Record<number, CatalogItemDetail | undefined> | undefined>;

const getItemId = (item: AssetItem): number | undefined => item.id ?? item.assetId;

const getCachedDetail = (cache: DetailCache, item: AssetItem): CatalogItemDetail | undefined => {
  const id = getItemId(item);
  return id === undefined ? undefined : cache[item.itemType ?? ""]?.[id];
};

const useItemHydration = (
  assets: AssetItem[],
  itemSection: ItemSection | undefined,
): AssetItem[] => {
  const cacheRef = useRef<DetailCache>({});
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  useEffect(() => {
    if (itemSection?.toLowerCase() !== "catalog") {
      return;
    }
    const missing = assets
      .filter(item => item.hydrationRequired && !getCachedDetail(cacheRef.current, item))
      .map(item => ({ id: getItemId(item), itemType: item.itemType }));
    if (missing.length === 0) {
      return;
    }

    postItemDetails(missing)
      .then(result => {
        result.data.forEach(detail => {
          cacheRef.current[detail.itemType] = {
            ...cacheRef.current[detail.itemType],
            [detail.id]: detail,
          };
        });
        if (isMountedRef.current) {
          rerender();
        }
      })
      .catch(() => undefined);
  }, [assets, itemSection]);

  return assets.map(item => {
    const detail = item.hydrationRequired ? getCachedDetail(cacheRef.current, item) : undefined;
    return detail ? mapCatalogDetailsToInventoryItemCard(item, detail) : item;
  });
};

export default useItemHydration;
