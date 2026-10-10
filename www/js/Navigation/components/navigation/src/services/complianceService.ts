import { callBehaviour } from "@rbx/core-scripts/guac";
import { withApiMetrics } from "../topNav/observability";

export type TIntAuthComplianceResponse = {
  isVNGComplianceEnabled?: boolean;
};

export const getIntAuthCompliancePolicy = async (): Promise<TIntAuthComplianceResponse> => {
  const data = await withApiMetrics("SignupCompliance", () =>
    callBehaviour<TIntAuthComplianceResponse>("intl-auth-compliance"),
  );
  return data;
};
