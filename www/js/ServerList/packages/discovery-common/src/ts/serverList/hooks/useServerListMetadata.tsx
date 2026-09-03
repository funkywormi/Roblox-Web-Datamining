import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import gameDetailMetaData from "../../../js/gameData/utils/gameDetailMetaData";
import fetchServerListMetadata from "../utils/fetchServerListMetadata";
import { parseUniverseIdFromServersSectionUrl } from "../utils/urlParsingUtils";

const { getCurrentGameMetaData } = gameDetailMetaData;

const SERVER_LIST_METADATA_QUERY_KEY = "serverListMetadata";

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
  const domMetadata: TServerListMetadata | undefined = useMemo(() => {
    const metaData = getCurrentGameMetaData();

    // If any of the DOM metadata is missing, return undefined and fetch
    if (
      !metaData ||
      typeof metaData.gameDetailCanCreateServer !== "boolean" ||
      typeof metaData.gameDetailPlaceId !== "number" ||
      typeof metaData.gameDetailPlaceName !== "string" ||
      typeof metaData.gameDetailPrivateServerPrice !== "number" ||
      typeof metaData.gameDetailPrivateServerProductId !== "number" ||
      typeof metaData.gameDetailSellerId !== "number" ||
      typeof metaData.gameDetailSellerName !== "string" ||
      typeof metaData.gameDetailUniverseId !== "number" ||
      typeof metaData.gameDetailUserCanManagePlace !== "boolean" ||
      typeof metaData.gameDetailPreopenCreatePrivateServerModal !== "boolean" ||
      typeof metaData.gameDetailPrivateServerLimit !== "number"
    ) {
      return undefined;
    }

    return {
      canCreateServer: metaData.gameDetailCanCreateServer,
      placeId: metaData.gameDetailPlaceId,
      placeName: metaData.gameDetailPlaceName,
      price: metaData.gameDetailPrivateServerPrice,
      privateServerProductId: metaData.gameDetailPrivateServerProductId,
      sellerId: metaData.gameDetailSellerId,
      sellerName: metaData.gameDetailSellerName,
      universeId: metaData.gameDetailUniverseId,
      userCanManagePlace: metaData.gameDetailUserCanManagePlace,
      preopenCreatePrivateGame: metaData.gameDetailPreopenCreatePrivateServerModal,
      privateServerLimit: metaData.gameDetailPrivateServerLimit,
      discounts: [],
    };
  }, []);

  const universeId = useMemo(() => {
    if (domMetadata?.universeId) {
      return domMetadata.universeId;
    }

    const urlUniverseId = parseUniverseIdFromServersSectionUrl(window.location.pathname);

    if (urlUniverseId) {
      return urlUniverseId;
    }

    window.EventTracker?.fireEvent(EVENT_COUNTER_NAMES.NO_UNIVERSE_ID);

    return undefined;
  }, [domMetadata?.universeId]);

  // Fetch only if we have universeId and the DOM metadata did not exist
  const shouldFetchData = !!universeId && !domMetadata;

  const logMetadataFetchError = () => {
    window.EventTracker?.fireEvent(EVENT_COUNTER_NAMES.FETCH_ERROR);
  };

  const {
    data: fetchedMetadata,
    isLoading,
    isError: hasError,
    refetch: refetchServerListMetadata,
  } = useQuery({
    queryKey: [SERVER_LIST_METADATA_QUERY_KEY, universeId],
    queryFn: () => fetchServerListMetadata(universeId),

    enabled: shouldFetchData,

    onError: logMetadataFetchError,
  });

  return useMemo(() => {
    if (domMetadata) {
      return {
        serverListMetadata: domMetadata,
        isLoading: false,
        hasError: false,
        refetchServerListMetadata: undefined,
      };
    }

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
  }, [domMetadata, universeId, fetchedMetadata, isLoading, hasError, refetchServerListMetadata]);
};

export default useServerListMetadata;
