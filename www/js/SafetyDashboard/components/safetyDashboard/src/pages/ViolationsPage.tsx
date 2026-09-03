import { useCallback, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { useViolations } from "../api/useViolations";
import { isHTTPError } from "../features/violations/util/violations";
import ViolationList from "../features/violations/ViolationList";
import LoadMoreSentinel from "../features/violations/violationDetails/LoadMoreSentinel";
import LoadMoreFooter from "../features/violations/violationDetails/LoadMoreFooter";
import ViolationsDescription from "../features/violations/ViolationsDescription";
import InlineError from "../shared/components/InlineError";
import ViolationsListSkeleton from "../features/violations/ViolationsListSkeleton";
import { useEffectUntilTrueOnce } from "../hooks/useEffectUntilTrueOnce";
import { useBackNavigation } from "../hooks/useBackNavigation";
import { sendViolationListPageLoadEvent, sendApiErrorEvent } from "../telemetry/appealsEvents";
import PageHeader from "../shared/components/PageHeader";
import { VIOLATIONS_QUERY_KEY } from "../api/queryKeys";

/**
 * The full list of the user's violations and appeals. Renders every violation as
 * a row (navigating to the detail page, which returns here via history when the
 * back button is used) and appends the next page via infinite scroll, fetching
 * more as a sentinel near the bottom scrolls into view.
 */
const ViolationsPage = () => {
  const { translate } = useTranslation();
  const onBack = useBackNavigation();
  const {
    violations,
    isLoading,
    isLoadingError,
    isRefetchError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useViolations();
  const [errorDismissed, setErrorDismissed] = useState(false);

  /*
   * `isFetchingNextPage` must stay in the deps. Toggling it gives this callback a
   * new identity, which makes the sentinel re-check visibility and load the next
   * page. Don't make this a stable callback or scrolling stalls after page one.
   * The `!isRefetchError` guard keeps a visible sentinel from retrying the same
   * failure in a loop.
   */
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isRefetchError) {
      fetchNextPage().catch(() => undefined);
    }
  }, [hasNextPage, isFetchingNextPage, isRefetchError, fetchNextPage]);

  const handleRetryLoadMore = useCallback(() => {
    setErrorDismissed(false);
    fetchNextPage().catch(() => undefined);
  }, [fetchNextPage]);

  const handleCloseLoadMoreError = useCallback(() => {
    setErrorDismissed(true);
  }, []);

  /*
   * Fire the API-error event once when the initial list load fails. We check
   * isLoadingError (no data yet) so a later next-page failure, which is shown in
   * the load-more footer, isn't mistaken for a list-load failure.
   */
  useEffectUntilTrueOnce(() => {
    if (!isLoadingError) {
      return false;
    }
    sendApiErrorEvent({
      urlOrKey: VIOLATIONS_QUERY_KEY,
      statusCode: isHTTPError(error) ? error.status : 0,
      message: error instanceof Error ? error.message : String(error),
    });
    return true;
  });

  /*
   * Fire the page-load event once on the first successful load.
   */
  useEffectUntilTrueOnce(() => {
    if (isLoading || isLoadingError) {
      return false;
    }
    sendViolationListPageLoadEvent({
      violationCount: violations.length,
    });
    return true;
  });

  let status: "loading" | "error" | "empty" | "list";
  if (isLoading) {
    status = "loading";
  } else if (isLoadingError) {
    status = "error";
  } else if (violations.length === 0) {
    status = "empty";
  } else {
    status = "list";
  }

  return (
    <div
      data-testid="violations-page"
      className="flex flex-col gap-xxlarge padding-x-large max-width-[850px] width-full margin-x-auto"
    >
      <PageHeader title={translate("Heading.ViolationsAndAppeals")} onBack={onBack} />

      {status === "loading" && <ViolationsListSkeleton />}
      {status === "error" && <InlineError onRefresh={refetch} />}
      {status === "empty" && <ViolationsDescription variant="empty" />}
      {status === "list" && (
        <div className="flex flex-col gap-large">
          <ViolationsDescription variant="default" />
          <div className="flex flex-col margin-x-[-12px]">
            <ViolationList violations={violations} fromList isContained />
            {hasNextPage && <LoadMoreSentinel onVisible={handleLoadMore} />}
            <LoadMoreFooter
              isLoading={isFetchingNextPage}
              isError={isRefetchError && !errorDismissed}
              onRetry={handleRetryLoadMore}
              onClose={handleCloseLoadMoreError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationsPage;
