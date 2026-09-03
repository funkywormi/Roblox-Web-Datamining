import * as http from "@rbx/core-scripts/http";
import urlConstant from "../constants/urlConstants";
import { AssetTextFilterSettingsResponse } from "../types";

const { getAssetTextFilterSettingsUrl } = urlConstant;

const getAssetTextFilterSettings = async (
  universeId: string,
): Promise<AssetTextFilterSettingsResponse> => {
  const atfsUrl = {
    url: getAssetTextFilterSettingsUrl(universeId),
    retryable: true,
    withCredentials: true,
  };

  const { data }: { data: AssetTextFilterSettingsResponse } = await http.get(atfsUrl);
  return data;
};

export default { getAssetTextFilterSettings };
