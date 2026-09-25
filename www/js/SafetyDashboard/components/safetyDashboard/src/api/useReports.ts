import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Report } from "../types/api";
import { REPORTS_QUERY_KEY } from "./queryKeys";
import { fetchAtLeastXReports } from "../features/reportInbox/util/reports";

const PAGE_SIZE = 10;

/**
 * Fetches the user's submitted report list.
 */
export const useReports = () => {
  const query = useInfiniteQuery({
    queryKey: [REPORTS_QUERY_KEY],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const resp = await fetchAtLeastXReports({
        count: PAGE_SIZE,
        page_token: pageParam,
      });

      const reports: Report[] = resp.reports;
      return {
        reports,
        nextPageToken: resp.nextPageToken,
        inboxPageHeader: resp.inboxPageHeader,
      };
    },
    getNextPageParam: lastPage => lastPage.nextPageToken,
  });

  const reports: Report[] = useMemo(
    () => query.data?.pages.reduce<Report[]>((acc, page) => [...acc, ...page.reports], []) ?? [],
    [query.data],
  );

  const inboxPageHeader = query.data?.pages[0]?.inboxPageHeader ?? "";

  return { ...query, reports, inboxPageHeader };
};
