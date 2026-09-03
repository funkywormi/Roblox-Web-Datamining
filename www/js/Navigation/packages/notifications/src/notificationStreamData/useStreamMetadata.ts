import { useQuery } from "@tanstack/react-query";
import { httpService } from "core-utilities";
import { StreamMetadata, streamMetadataUrlConfig } from "./gameUpdatesApi";
import { reportNotificationStreamError } from "./notificationStreamObservability";

export const STREAM_METADATA_QUERY_KEY = ["notification-stream-metadata"];

export const useStreamMetadata = (): { canLaunchGameFromGameUpdate: boolean } => {
  const query = useQuery<StreamMetadata>({
    queryKey: STREAM_METADATA_QUERY_KEY,
    staleTime: Infinity,
    queryFn: () =>
      httpService.get<StreamMetadata>(streamMetadataUrlConfig).then(({ data }) => data ?? {}),
    onError: error => reportNotificationStreamError("streamMetadata", error),
  });

  return { canLaunchGameFromGameUpdate: Boolean(query.data?.canLaunchGameFromGameUpdate) };
};

export default useStreamMetadata;
