import { useEffect, useMemo, useState } from "react";
import { Asset } from "@rbx/profile-platform";
import { fetchMultipleItemDetails, HydratedAsset } from "../services/catalogService";

type FetchAssetsDataResponse = {
  hydratedAssets: HydratedAsset[];
  isLoading: boolean;
};

const useFetchAssetsData = (assets: Asset[]): FetchAssetsDataResponse => {
  const [hydratedAssets, setHydratedAssets] = useState<HydratedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const result = useMemo(() => ({ hydratedAssets, isLoading }), [hydratedAssets, isLoading]);

  useEffect(() => {
    if (assets.length > 0) {
      setIsLoading(true);
      fetchMultipleItemDetails(assets)
        .then(hydrated => {
          setHydratedAssets(hydrated.filter(item => item.isHydrated));
        })
        .catch((error: unknown) => {
          console.error(error);
          setHydratedAssets([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [assets]);

  return result;
};

export default useFetchAssetsData;
