import { useCallback } from "react";
import { authenticatedUser } from "header-scripts";
import { ParentConsentStatus, TConsentResponse } from "../../../types/parentConsentsTypes";
import {
  useGetParentalConsentsQuery,
  useLazyGetParentalConsentsQuery,
} from "../../apis/parentalControlsApi";

type UseGetAllPendingParentalConsentsResult = {
  allConsents: TConsentResponse[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  isFetchingMore: boolean;
};

/**
 * Fetches all pending parental consents for a user.
 * Fetches first page initially, with pagination for additional pages.
 *
 * @param userId - The ID of the user to fetch consents for (defaults to current user)
 * @returns All consents, loading state, error state, and pagination controls
 */
const useGetAllPendingParentalConsents = (
  userId?: number,
): UseGetAllPendingParentalConsentsResult => {
  const childUserId = userId ?? authenticatedUser.id!;

  // Initial fetch for first page
  const { data, isLoading, isError } = useGetParentalConsentsQuery({
    childUserId,
    consentStatus: ParentConsentStatus.Pending,
    fetchSinglePageOnly: true,
  });

  // Lazy query for loading more pages
  const [fetchNextPage, { isFetching: isFetchingMore }] = useLazyGetParentalConsentsQuery();

  const loadMore = useCallback(async () => {
    if (data?.nextCursor) {
      await fetchNextPage({
        childUserId,
        consentStatus: ParentConsentStatus.Pending,
        cursor: data.nextCursor,
        fetchSinglePageOnly: true,
      });
    }
  }, [data?.nextCursor, fetchNextPage, childUserId]);

  const hasMore = !!data?.nextCursor;

  return {
    allConsents: data?.consents ?? [],
    isLoading,
    isError,
    hasMore,
    loadMore,
    isFetchingMore,
  };
};

export default useGetAllPendingParentalConsents;
