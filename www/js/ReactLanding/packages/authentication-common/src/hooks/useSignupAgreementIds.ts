import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GLOBAL_REGULATION_TYPE,
  OPTIONAL_PERSONAL_INFORMATION_POLICY,
  PARENTALCONSENT,
  PERSONAL_INFORMATION_POLICY,
  THIRD_PARTY_PERSONAL_INFORMATION_POLICY,
  TRANSFER_PERSONAL_INFORMATION_POLICY,
} from "../constants/signupConstants";
import { getMetadataV2, getUserAgreements } from "../services/signupService";

// The server can send entries that do not match TUserAgreement, so the hook checks each field.
type TUncheckedAgreement = {
  id?: unknown;
  agreementType?: unknown;
  regulationType?: unknown;
} | null;

// The modal has no parental consent step and no KISA consent step. KISA users currently sign up
// on the legacy signup page, which has the KISA consent step for the Korea policies.
const EXCLUDED_AGREEMENT_TYPES = new Set<unknown>([
  PARENTALCONSENT,
  PERSONAL_INFORMATION_POLICY,
  THIRD_PARTY_PERSONAL_INFORMATION_POLICY,
  TRANSFER_PERSONAL_INFORMATION_POLICY,
  OPTIONAL_PERSONAL_INFORMATION_POLICY,
]);

// null means that the signup integration is off.
const getSignupAgreements = async (): Promise<readonly TUncheckedAgreement[] | null> => {
  const metadata = await getMetadataV2();
  if (!metadata.IsUserAgreementsSignupIntegrationEnabled) {
    return null;
  }
  return getUserAgreements();
};

const QUERY_OPTIONS = {
  queryKey: ["account-upgrade-signup-agreements"],
  queryFn: getSignupAgreements,
  retry: false,
  staleTime: Infinity,
};

const SUBMIT_WAIT_MS = 3000;

/**
 * The returned function resolves `[]` when the signup integration is off, and `undefined` when
 * the IDs are missing.
 */
function useSignupAgreementIds(): () => Promise<string[] | undefined> {
  const queryClient = useQueryClient();
  useQuery(QUERY_OPTIONS);

  return useCallback(async () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      // The race does not cancel the fetch, so a later submit can use its result.
      const agreements: readonly TUncheckedAgreement[] | null | undefined = await Promise.race([
        queryClient.fetchQuery(QUERY_OPTIONS),
        new Promise<undefined>(resolve => {
          timer = setTimeout(() => {
            resolve(undefined);
          }, SUBMIT_WAIT_MS);
        }),
      ]);
      if (agreements === undefined) {
        return undefined;
      }
      if (agreements === null) {
        return [];
      }
      // The modal links only the Global Terms and Privacy pages.
      const ids = agreements
        .filter(
          agreement =>
            agreement?.regulationType === GLOBAL_REGULATION_TYPE &&
            !EXCLUDED_AGREEMENT_TYPES.has(agreement.agreementType),
        )
        .map(agreement => agreement?.id)
        .filter((id): id is string => typeof id === "string" && id !== "");
      return ids.length > 0 ? ids : undefined;
    } catch {
      return undefined;
    } finally {
      clearTimeout(timer);
    }
  }, [queryClient]);
}

export default useSignupAgreementIds;
