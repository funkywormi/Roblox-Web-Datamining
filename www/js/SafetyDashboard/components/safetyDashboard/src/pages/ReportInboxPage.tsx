import { ReactElement, useCallback, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { useReports } from "../api/useReports";
import PageHeader from "../shared/components/PageHeader";
import InlineError from "../shared/components/InlineError";
import ReportList from "../features/reportInbox/ReportList";
import ReportListSkeleton from "../features/reportInbox/ReportListSkeleton";
import LoadMoreSentinel from "../features/violations/violationDetails/LoadMoreSentinel"; // LoadMoreSentinel in violations has no violations-specific features, so we can reuse it
import LoadMoreFooter from "../features/reportInbox/util/LoadMoreFooter";
import { isHTTPError } from "../features/violations/util/violations";
import { useEffectUntilTrueOnce } from "../hooks/useEffectUntilTrueOnce";
import { SafetyDashboardEventType } from "../telemetry/eventTypes";
import { sendSafetyDashboardEvent } from "../telemetry/sendSafetyDashboardEvent";

const ReportInboxPage = (): ReactElement => {
  const { translate } = useTranslation();

  const {
    inboxPageHeader,
    reports,
    isLoading,
    isLoadingError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetchError,
  } = useReports();
  const [errorDismissed, setErrorDismissed] = useState(false);

  useEffectUntilTrueOnce(() => {
    if (isLoading || isLoadingError) {
      return false;
    }

    sendSafetyDashboardEvent(SafetyDashboardEventType.ReportInboxView, {
      reportCount: reports.length,
      hasNextPage,
    });
    return true;
  });

  useEffectUntilTrueOnce(() => {
    if (!isLoadingError) {
      return false;
    }

    sendSafetyDashboardEvent(SafetyDashboardEventType.ReportInboxError, {
      statusCode: isHTTPError(error) ? error.status : 0,
      message: error instanceof Error ? error.message : String(error),
    });
    return true;
  });

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isRefetchError) {
      sendSafetyDashboardEvent(SafetyDashboardEventType.ReportLoadMore, {
        loadedCount: reports.length,
      });
      fetchNextPage().catch(() => undefined);
    }
  }, [hasNextPage, isFetchingNextPage, isRefetchError, fetchNextPage, reports.length]);

  const handleRetryLoadMore = useCallback(() => {
    sendSafetyDashboardEvent(SafetyDashboardEventType.ReportLoadMoreRetry, {
      loadedCount: reports.length,
    });
    setErrorDismissed(false);
    fetchNextPage().catch(() => undefined);
  }, [fetchNextPage, reports.length]);

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
          {reports.length > 0 && !hasNextPage && (
            <span className="text-body-medium">{translate("Description.NoReportsYetIllegal")}</span>
          )}
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
