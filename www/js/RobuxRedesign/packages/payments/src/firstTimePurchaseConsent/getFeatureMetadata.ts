import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";
import type { WithApiMetricsFn } from "../withApiMetrics/withApiMetrics";

export type GetFeatureMetadataResponse = {
  shouldShowFirstTimePurchaseConsent: boolean;
};

export async function getFeatureMetadata(
  userId: string,
  withApiMetrics: WithApiMetricsFn<"GetFeatureMetadata">,
): Promise<GetFeatureMetadataResponse | undefined> {
  return withApiMetrics<GetFeatureMetadataResponse>({
    method: "GET",
    url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/feature/metadata`,
    config: { withCredentials: true, params: { userId } },
    eventCounterProps: { call: "GetFeatureMetadata" },
  });
}
