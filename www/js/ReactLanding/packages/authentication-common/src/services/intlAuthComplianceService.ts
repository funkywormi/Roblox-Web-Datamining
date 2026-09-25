import { callBehaviour } from "@rbx/core-scripts/guac";
import { TIntAuthComplianceResponse } from "../types/intAuthComplianceTypes";

export const getIntAuthCompliancePolicy = async (): Promise<TIntAuthComplianceResponse> => {
  const data = await callBehaviour<TIntAuthComplianceResponse>("intl-auth-compliance");
  return data;
};

export default {
  getIntAuthCompliancePolicy,
};
