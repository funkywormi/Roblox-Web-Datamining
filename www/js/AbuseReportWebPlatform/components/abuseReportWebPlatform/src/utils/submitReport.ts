import environmentUrls from "@rbx/environment-urls";
import { post } from "@rbx/core-scripts/http";
import { AbuseReportLegacyPayloadModel } from "./types";
import { REPORT_ENDPOINT, REPORT_VECTOR_METADATA } from "./constants";

const { apiGatewayUrl } = environmentUrls;
const V1_URL_CONFIG = {
  url: `${apiGatewayUrl}/abuse-reporting/v1/abuse-report`,
  withCredentials: true,
};
const V2_URL_CONFIG = {
  url: `${apiGatewayUrl}/abuse-reporting/v2/abuse-report`,
  withCredentials: true,
};

/**
 * Submits multiple abuse reports concurrently.
 *
 * @param tags - An object containing tags to be submitted.
 * @returns A promise that resolves when all submissions are complete, or rejects if any submission fails.
 */
const submitReport = async ({
  abuseVector,
  payload,
  reportBody,
}: {
  abuseVector: string;
  payload: AbuseReportLegacyPayloadModel;
  reportBody: Record<string, unknown>;
}): Promise<unknown> => {
  /**
   * If we couldn't generate tags, meaning Constants.REPORT_VECTOR_METADATA does not contain the abuse vector
   * fall back to the old web-plat submission
   */
  if (Object.keys(reportBody).length < 1) {
    const urlConfig = {
      url: `/abusereport/api/${abuseVector.toLowerCase()}`,
    };
    const response = await post(urlConfig, payload);
    return response;
  }

  // Determine which endpoint to use based on the abuse vector metadata
  if (REPORT_VECTOR_METADATA[abuseVector.toLowerCase()]?.endpoint === REPORT_ENDPOINT.V1) {
    const response = await post(V1_URL_CONFIG, reportBody);
    return response;
  }

  // Default to V2 endpoint
  const response = await post(V2_URL_CONFIG, { tags: reportBody });
  return response;
};

export default submitReport;
