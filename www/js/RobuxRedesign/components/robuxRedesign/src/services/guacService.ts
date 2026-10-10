import { callBehaviour } from "@rbx/core-scripts/guac";

export type GetTexasU18VPCOptimizationFlowPolicyResponse = {
  texasU18VPCOptimizationEnabled?: boolean;
  texasU18VPCOptimizationEnabledForEveryone?: boolean;
};

export const getTexasU18VPCOptimizationFlowPolicy =
  async (): Promise<GetTexasU18VPCOptimizationFlowPolicyResponse> =>
    await callBehaviour<GetTexasU18VPCOptimizationFlowPolicyResponse>("texas-u18-vpc-optimization");

export type AppPolicyResponse = {
  ShouldDeeplinkToReferral?: boolean;
};

export const getAppPolicy = async (): Promise<AppPolicyResponse> => {
  try {
    return await callBehaviour<AppPolicyResponse>("app-policy");
  } catch {
    return {};
  }
};
