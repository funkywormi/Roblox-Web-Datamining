import { ReactElement, useCallback, useState } from "react";
import { useReports } from "../api/useReports";
import PageHeader from "../shared/components/PageHeader";
import InlineError from "../shared/components/InlineError";
import ReportList from "../features/reportInbox/ReportList";
import ReportListSkeleton from "../features/reportInbox/ReportListSkeleton";
import LoadMoreSentinel from "../features/violations/violationDetails/LoadMoreSentinel"; // LoadMoreSentinel in violations has no violations-specific features, so we can reuse it
import LoadMoreFooter from "../features/reportInbox/util/LoadMoreFooter";

const ReportInboxPage = (): ReactElement => {
  const {
    inboxPageHeader,
    reports,
    isLoading,
    isLoadingError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetchError,
  } = useReports();
  const [errorDismissed, setErrorDismissed] = useState(false);

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

  let status: "loading" | "error" | "list";
  if (isLoading) {
    status = "loading";
  } else if (isLoadingError) {
    status = "error";
  } else {
    status = "list";
  }

  return (
    <div className="flex flex-col gap-xxlarge padding-x-large max-width-[850px] width-full margin-x-auto">
      <PageHeader title={inboxPageHeader} />

      {status === "loading" && <ReportListSkeleton />}
      {status === "error" && <InlineError onRefresh={refetch} />}
      {status === "list" && (
        <div className="flex flex-col gap-large">
          <ReportList reports={reports} />
          {hasNextPage && <LoadMoreSentinel onVisible={handleLoadMore} />}
          <LoadMoreFooter
            isLoading={isFetchingNextPage}
            isError={isRefetchError && !errorDismissed}
            onRetry={handleRetryLoadMore}
            onClose={handleCloseLoadMoreError}
          />
        </div>
      )}
    </div>
  );
};

export default ReportInboxPage;
