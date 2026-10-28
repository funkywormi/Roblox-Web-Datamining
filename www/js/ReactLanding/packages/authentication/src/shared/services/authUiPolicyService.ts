import { callBehaviour } from "@rbx/core-scripts/guac";

export const appPolicyBundle = "app-policy";

export type TAppPolicyResponse = {
  ExcludeExternalIdentityLogin?: boolean;
  ExcludeExternalIdentityOtherSignInOptions?: boolean;
};

export const getAppPolicy = (): Promise<TAppPolicyResponse> =>
  callBehaviour<TAppPolicyResponse>(appPolicyBundle);
