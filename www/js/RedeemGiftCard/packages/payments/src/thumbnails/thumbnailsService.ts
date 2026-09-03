import axios from "axios";
import { EnvironmentUrls } from "@rbx/environment-urls";

export type ThumbnailType = "Asset" | "BundleThumbnail" | "GamePass";

export type ThumbnailRequest = {
  requestId?: number | string;
  targetId: number | string;
  type: ThumbnailType;
  size: string;
  format: string;
};

export type Thumbnail = {
  targetId: number;
  state: string;
  imageUrl: string;
};

type GetThumbnailsResponse = {
  data?: Thumbnail[];
};

export const getThumbnails = async (
  requests: ThumbnailRequest[],
): Promise<GetThumbnailsResponse | undefined> => {
  try {
    const { data } = await axios.post<GetThumbnailsResponse>(
      `${EnvironmentUrls.thumbnailsApi}/v1/batch`,
      requests,
      { withCredentials: true },
    );

    return data;
  } catch {
    return undefined;
  }
};
