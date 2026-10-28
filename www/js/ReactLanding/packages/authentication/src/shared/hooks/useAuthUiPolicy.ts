import { useEffect, useState } from "react";
import { getAppPolicy } from "../services/authUiPolicyService";

export type AuthUiPolicy = {
  isLoading: boolean;
  isExternalIdentityLoginExcluded: boolean;
  isExternalIdentityOtherSignInOptionsExcluded: boolean;
};

const failClosedPolicy: Omit<AuthUiPolicy, "isLoading"> = {
  isExternalIdentityLoginExcluded: true,
  isExternalIdentityOtherSignInOptionsExcluded: true,
};

function useAuthUiPolicy(): AuthUiPolicy {
  const [policy, setPolicy] = useState<AuthUiPolicy>({ isLoading: true, ...failClosedPolicy });

  useEffect(() => {
    getAppPolicy().then(
      response => {
        setPolicy({
          isLoading: false,
          isExternalIdentityLoginExcluded: response?.ExcludeExternalIdentityLogin !== false,
          isExternalIdentityOtherSignInOptionsExcluded:
            response?.ExcludeExternalIdentityOtherSignInOptions !== false,
        });
      },
      () => {
        setPolicy({ isLoading: false, ...failClosedPolicy });
      },
    );
  }, []);

  return policy;
}

export default useAuthUiPolicy;
