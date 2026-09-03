import { EnvironmentUrls } from "@rbx/legacy-webapp-types/Roblox";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import type { AxiosResponse } from "@rbx/core-scripts/http";

export type ThumbnailData = {
  targetId: number;
  state: string;
  imageUrl: string;
};

export type GetThumbnailsResponse = {
  data: ThumbnailData[];
};

export const getThumbnails = async (
  assetIds: number[],
): Promise<AxiosResponse<GetThumbnailsResponse>> => {
  const assetIdParams = assetIds.map(id => `assetIds=${id}`).join("&");
  const url = `${EnvironmentUrls.thumbnailsApi}/v1/assets?${assetIdParams}&size=420x420&format=Png`;

  return httpService.get({
    url,
    withCredentials: false,
  });
};
