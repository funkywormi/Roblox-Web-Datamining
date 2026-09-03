import { useQueryClient, UseMutationResult, useMutation } from "@tanstack/react-query";
import { userId } from "@rbx/core-scripts/meta/user";
import * as http from "@rbx/core-scripts/http";
import { Appeal as AppealV2 } from "@rbx/moderation-portal-v2";

import { GET_VIOLATION_QUERY_KEY, VIOLATIONS_QUERY_KEY } from "./queryKeys";
import { getCreateAppealUrl } from "../shared/url";
import { isHTTPError } from "../features/violations/util/violations";

/**
 * The appeal-creation endpoint returns 403 (`InEligible`) when the server-side
 * eligibility check rejects the appeal — e.g. the client UX got out of sync and
 * the user still needs to complete IDV. Callers should re-query eligibility to
 * re-sync the appeal entry point when this happens.
 */
export const isAppealIneligibleError = (error: unknown): boolean =>
  isHTTPError(error) && error.status === 403;

// TODO: [future] Seems like there is no Appeal Request TYPE that is correct, so
// manual workaround for now (abech)
export type AppealRequestBody = Pick<AppealV2, "message" | "violation" | "communication_opt_out">;

/**
 * Create an Appeal for a violation.
 */
export const useCreateAppeal = (
  violationId: string,
): UseMutationResult<unknown, unknown, AppealRequestBody> => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: AppealRequestBody) => {
      const result = await http.post(
        {
          url: getCreateAppealUrl(userId()),
          withCredentials: true,
        },
        {
          appeal: data,
        },
      );

      return result.data;
    },

    /**
     * Remove stale violations data and force refetch otherwise we will show
     * obviously wrong data for a bit. We have also seen issues where we get an
     * error back, but the appeal is still created, so using onSettled instead
     * of onSuccess.
     */
    onSettled: () => {
      /**
       * At any point, at most one of get/list query is active, so this
       * shouldn't result in a double refetch.
       */
      queryClient.removeQueries({ queryKey: [VIOLATIONS_QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [GET_VIOLATION_QUERY_KEY, violationId] });
    },
  });

  return mutation;
};
