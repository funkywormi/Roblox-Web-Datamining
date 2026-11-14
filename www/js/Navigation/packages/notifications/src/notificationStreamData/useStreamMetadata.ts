import { useQuery } from "@tanstack/react-query";
import { streamGet } from "./streamTransport";
import { StreamMetadata, streamMetadataUrlConfig } from "./gameUpdatesApi";
import { useReportQueryError } from "./useReportQueryError";

export const STREAM_METADATA_QUERY_KEY = ["notification-stream-metadata"];

export const useStreamMetadata = (): {
  canLaunchGameFromGameUpdate: boolean;
  disconnectionDelayMs: number | undefined;
} => {
  const query = useQuery<StreamMetadata>({
    queryKey: STREAM_METADATA_QUERY_KEY,
    staleTime: Infinity,
    queryFn: () => streamGet<StreamMetadata>(streamMetadataUrlConfig).then(data => data ?? {}),
  });
  useReportQueryError("streamMetadata", query.error, query.errorUpdatedAt);

  return {
    canLaunchGameFromGameUpdate: Boolean(query.data?.canLaunchGameFromGameUpdate),
    disconnectionDelayMs: query.data?.signalRDisconnectionResponseInMilliseconds,
  };
};

export default useStreamMetadata;
