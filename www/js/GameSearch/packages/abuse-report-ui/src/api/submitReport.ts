import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";

const URL_CONFIG = {
  url: `${EnvironmentUrls.apiGatewayUrl}/abuse-reporting/v1/abuse-report`,
  withCredentials: true,
};

type AbuseReportBody = {
  abuseVector: string;
  category?: string;
  comment?: string;
  targetIdStr: string;
  targetType?: string;
  custom?: Record<string, unknown>;
};

type AbuseReportResponse = {
  reportId: string;
};

/**
 * Submits an abuse report to the /v1/abuse-report endpoint.
 * Matches the behavior of the Lua sendReport function.
 *
 * @param reportBody - The abuse report body to submit
 * @returns A promise that resolves when the submission is complete, or rejects if submission fails
 */
const submitReport = async (reportBody: AbuseReportBody): Promise<AbuseReportResponse> => {
  const response = await httpService.post<AbuseReportResponse>(URL_CONFIG, reportBody);
  return response.data;
};

export default submitReport;
