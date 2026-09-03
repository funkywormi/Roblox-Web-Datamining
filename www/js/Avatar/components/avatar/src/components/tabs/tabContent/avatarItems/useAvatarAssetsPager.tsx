import { useState, useCallback, useRef } from "react";
import { reportAXError } from "../../../../utils/axAnalyticsService";
import AvatarAPIService from "../../../../services/avatarAPIService";
import parseError from "../../../../utils/parseErrorUtil";
import { getCurrentUserId } from "../../../../utils/currentUser";

type CursorPaginationData = {
  cursor: string | null;
  assetTypes: string;
};

interface PaginationError {
  code: number;
  message: string;
}

interface UseAssetsPagerParams {
  onLoadSuccess: (data: any, hasNextPage: boolean, assetSubTypeForRecommendations: number) => void;
  onLoadError: (error: string) => void;
}

export type Asset = {
  assetId: number;
  name: string;
  assetType: string;
  created: string; // ISO date as string
};

const useAvatarAssetsPager = ({ onLoadSuccess, onLoadError }: UseAssetsPagerParams) => {
  const [dataList, setDataList] = useState<Asset[]>([]);
  const pageCursor = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<PaginationError[]>([]);
  const [assetTypes, setAssetTypes] = useState<string | null>();
  const [assetSubTypeForRecommendations, setAssetSubTypeForRecommendations] = useState<
    number | null
  >();

  const loadPageSize = 50;
  const sortOrder = "Desc";

  const fetchPage = useCallback(
    async (paginationData: CursorPaginationData, subTypeForRecommendations: number) => {
      setIsLoading(true);
      try {
        const params = {
          ...paginationData,
          limit: loadPageSize,
          sortOrder,
          userId: getCurrentUserId(),
        };
        const response = await AvatarAPIService.getInventoryItems(params);

        const data = response?.data || [];
        const nextPageCursor = response?.nextPageCursor || null;

        setDataList(prevData => [...prevData, ...data]);
        pageCursor.current = nextPageCursor;
        onLoadSuccess(data, !!nextPageCursor, subTypeForRecommendations);
      } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const errorMessage: string = error?.response?.data || error.message || "";
        setErrors([{ code: 0, message: errorMessage }]);
        onLoadError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [onLoadSuccess, onLoadError],
  );

  const loadFirstPage = useCallback(
    (newAssetTypes: string, newAssetSubtypeForRecommendations: number) => {
      setDataList([]);
      pageCursor.current = null;
      setIsLoading(true);
      setAssetTypes(newAssetTypes);
      setAssetSubTypeForRecommendations(newAssetSubtypeForRecommendations);

      fetchPage(
        {
          assetTypes: newAssetTypes,
          cursor: null,
        },
        newAssetSubtypeForRecommendations,
      ).catch(e => {
        console.error(e);
        const itemName = `FetchPageError`;
        // Report the error
        // We need to specify container name as counters name so we can build the graphs on grafana
        reportAXError({
          itemName,
          counterName: "AvatarAssetsPagerError",
          log: parseError(e),
        });
      });
    },
    [fetchPage],
  );

  const hasNextPage = useCallback((): boolean => {
    return !!pageCursor.current;
  }, []);

  const canLoadNextPage = useCallback((): boolean => {
    return hasNextPage();
  }, [hasNextPage]);

  const fetchNextPage = useCallback(() => {
    if (!assetTypes) {
      console.error("Can't fetch next page without asset types");
      return;
    }
    if (!assetSubTypeForRecommendations) {
      console.error("Can't fetch next page without asset subtype for recommendations!");
      return;
    }
    fetchPage({ assetTypes, cursor: pageCursor.current }, assetSubTypeForRecommendations).catch(
      e => {
        console.error(e);
        const itemName = `FetchNextPageError`;
        // Report the error
        // We need to specify container name as counters name so we can build the graphs on grafana
        reportAXError({
          itemName,
          counterName: "AvatarAssetsPagerError",
          log: parseError(e),
        });
      },
    );
  }, [assetSubTypeForRecommendations, assetTypes, fetchPage, pageCursor]);

  return {
    dataList,
    isLoading,
    errors,
    fetchNextPage,
    hasNextPage,
    loadFirstPage,
    canLoadNextPage,
  };
};

export default useAvatarAssetsPager;
