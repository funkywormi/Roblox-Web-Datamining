import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import gameDetailMetaData from "../../../js/gameData/utils/gameDetailMetaData";
import fetchServerListMetadata from "../utils/fetchServerListMetadata";
import { parseUniverseIdFromServersSectionUrl } from "../utils/urlParsingUtils";
import { privateServerListKeys } from "../constants/queryKeys";

const { getCurrentGameMetaData } = gameDetailMetaData;

const EVENT_COUNTER_NAMES = {
  FETCH_ERROR: "UseServerListMetadataFetchError",
  NO_UNIVERSE_ID: "UseServerListMetadataNoUniverseId",
};

export type TServerListMetadata = {
  canCreateServer: boolean;
  placeId: number;
  placeName: string;
  price: number;
  privateServerProductId: number;
  privateServerLimit: number;
  sellerId: number;
  sellerName: string;
  universeId: number;
  userCanManagePlace: boolean;
  preopenCreatePrivateGame: boolean;
  discounts: { source: string; robux: number }[];
};

const useServerListMetadata = (): {
  serverListMetadata: TServerListMetadata | undefined;
  isLoading: boolean;
  hasError: boolean;
  refetchServerListMetadata: (() => void) | undefined;
} => {
  const universeId = useMemo(() => {
    const domUniverseId = getCurrentGameMetaData()?.gameDetailUniverseId;
    if (domUniverseId) {
      return domUniverseId;
    }

    const urlUniverseId = parseUniverseIdFromServersSectionUrl(window.location.pathname);

    if (urlUniverseId) {
      return urlUniverseId;
    }

    window.EventTracker?.fireEvent(EVENT_COUNTER_NAMES.NO_UNIVERSE_ID);

    return undefined;
  }, []);

  const logMetadataFetchError = () => {
    window.EventTracker?.fireEvent(EVENT_COUNTER_NAMES.FETCH_ERROR);
  };

  const {
    data: fetchedMetadata,
    isLoading,
    isError: hasError,
    refetch: refetchServerListMetadata,
  } = useQuery({
    queryKey: privateServerListKeys.universePrivateServerMetadata(universeId),
    queryFn: () => fetchServerListMetadata(universeId),
    enabled: !!universeId,
    onError: logMetadataFetchError,
  });

  return useMemo(() => {
    if (!universeId) {
      // Show error but not refresh functionality, since refresh is impossible without universeId
      return {
        serverListMetadata: undefined,
        isLoading: false,
        hasError: true,
        refetchServerListMetadata: undefined,
      };
    }

    return {
      serverListMetadata: fetchedMetadata,
      isLoading,
      hasError,
      refetchServerListMetadata,
    };
  }, [universeId, fetchedMetadata, isLoading, hasError, refetchServerListMetadata]);
};

export default useServerListMetadata;
