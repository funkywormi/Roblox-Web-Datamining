/* eslint-disable camelcase */
import * as http from "@rbx/core-scripts/http";
import { Report, ReportsResponse } from "../../../types/api";
import { REPORTS_URL } from "../../../shared/url";

/**
 * Fetches reports from the server.
 */
export const getReports = async ({
  page_token,
  page_size = 100,
}: {
  page_token?: string;
  page_size?: number;
}): Promise<ReportsResponse> => {
  const req = await http.get<ReportsResponse>(
    {
      url: REPORTS_URL,
      withCredentials: true,
    },
    {
      pageSize: page_size,
      pageToken: page_token,
    },
  );
  return req.data;
};

/**
 * Fetches at least X reports from the server, handling pagination.
 * This is based on fetchAtLeastXViolations in violations.ts
 */
export const fetchAtLeastXReports = async ({
  count,
  page_token,
}: {
  count: number;
  page_token?: string;
}) => {
  const extraFactor = 1.2;
  const pageSize = Math.round(count * extraFactor);
  const collectedReports: Report[] = [];
  let currentPageToken: string | undefined = page_token;
  let inboxPageHeader: ReportsResponse["inboxPageHeader"] | undefined;

  while (collectedReports.length < count) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await getReports({
      page_size: pageSize,
      page_token: currentPageToken,
    });
    const { nextPageToken, reports, inboxPageHeader: respInboxPageHeader } = resp;

    inboxPageHeader = respInboxPageHeader;
    collectedReports.push(...reports);
    currentPageToken = nextPageToken;
    if (!currentPageToken) {
      break;
    }
  }

  return {
    inboxPageHeader: inboxPageHeader,
    reports: collectedReports,
    nextPageToken: currentPageToken,
  };
};
