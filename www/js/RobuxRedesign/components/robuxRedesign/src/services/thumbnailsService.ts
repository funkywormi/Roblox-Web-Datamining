import { EnvironmentUrls } from "@rbx/environment-urls";
import { APICall, HTTPVerb, withApiEvents } from "../utils/apiEventsCounter";

export enum ThumbnailState {
  Completed = "Completed",
  Pending = "Pending",
}

export type Thumbnail = {
  targetId: number;
  state: ThumbnailState;
  imageUrl: string;
};

type GetThumbnailsResponse = {
  data: Thumbnail[];
};

export const getThumbnails = async (
  thumbnailArgs: object[],
): Promise<GetThumbnailsResponse | undefined> =>
  withApiEvents<GetThumbnailsResponse>(
    HTTPVerb.POST,
    APICall.GET_THUMBNAILS,
    {
      url: `${EnvironmentUrls.thumbnailsApi}/v1/batch`,
      withCredentials: true,
    },
    thumbnailArgs,
  );
