import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { GET_VIOLATION_QUERY_KEY, VIOLATIONS_QUERY_KEY } from "./queryKeys";
import { useViolations } from "./useViolations";
import { sendUnknownViolationEvent } from "../telemetry/appealsEvents";
import {
  EnrichedViolation,
  InvalidViolationError,
  enrichViolation,
  filterOutInvalidEvidence,
  getViolation,
  isSupportedViolation,
} from "../features/violations/util/violations";

type UseViolationDataType = ReturnType<typeof useViolations>["data"];

/**
 * Get the info for a specific violation by it's ID. The hook is also responsible
 * for filtering out invalid evidence and enriching the violation with additional data.
 */
export const useViolation = (violationId: string) => {
  const translationResource = useTranslation();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [GET_VIOLATION_QUERY_KEY, violationId],
    queryFn: async () => {
      const violation = await getViolation(violationId);

      if (isSupportedViolation(violation)) {
        const violationCopy = filterOutInvalidEvidence(violation);
        return enrichViolation(violationCopy, translationResource);
      }

      console.warn(`Unsupported violation:`, violation);
      sendUnknownViolationEvent({ violation });
      throw new InvalidViolationError();
    },
    /**
     * Try to get all violations data if already cached.
     * These two options together ensure that we're not making unnecessary
     * API calls to GetViolation when the user starts on the list page and
     * thus has fresh data.
     */
    initialData: () => {
      let violation: EnrichedViolation | undefined;
      // not sure why this triggers
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (queryClient.getQueryData([VIOLATIONS_QUERY_KEY]) as UseViolationDataType)?.pages.some(
        page => {
          return page.violations.some(someViolation => {
            if (someViolation.uid === violationId) {
              violation = someViolation;
              return true;
            }
            return false;
          });
        },
      );

      return violation;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState([VIOLATIONS_QUERY_KEY])?.dataUpdatedAt,
  });

  return query;
};
