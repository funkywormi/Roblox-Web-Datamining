import { callBehaviour } from "@rbx/core-scripts/guac";

export type TIntAuthComplianceResponse = {
  isVNGComplianceEnabled?: boolean;
};

export const getIntAuthCompliancePolicy = async (): Promise<TIntAuthComplianceResponse> => {
  const data = await callBehaviour<TIntAuthComplianceResponse>("intl-auth-compliance");
  return data;
};
